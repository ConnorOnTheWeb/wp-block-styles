/**
 * Automated checks for the test pages.
 *
 * Every page (index.html, tables.html), in Chromium, WebKit and Firefox:
 *   - overflow   the page itself must never scroll sideways (all widths)
 *   - contrast   text inside .wp-content must meet WCAG AA against what is
 *                actually behind it (4.5:1, or 3:1 for large text), in four
 *                color-scheme setups:
 *                  light         OS light, page on "System"
 *                  dark          OS dark, page on "System"
 *                  toggle-light  OS dark, page toggled to Light
 *                  toggle-dark   OS light, page toggled to Dark
 *   - hidden     content WordPress marks [hidden] (closed accordion panels,
 *                inactive tabs) must still be readable, since the script that
 *                reveals it doesn't run in headless
 *   - sr-text    .screen-reader-text must not render visibly
 *
 * Content whose colors are the author's choice, not the stylesheet's, is
 * marked data-test-allow="contrast" in the fixture and skipped.
 *
 * tables.html also gets table layout checks, driven by attributes on each
 * table (see the comment at the top of that file):
 *   - no words split mid-way (outside links; breaks at "-" and "/" are fine)
 *   - no scrolling at or above data-fit-from, no cell past data-max-lines
 *   - table text at least 13px
 *   - sticky first column and caption stay put while a narrow table scrolls
 *
 * Usage:
 *   npm test
 *   BROWSERS=webkit PAGES=index MODES=dark npm test
 *
 * Screenshots land in tests/screenshots/ (gitignored) for a visual pass.
 */
import { chromium, webkit, firefox } from 'playwright'
import { mkdirSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const shots = join(here, 'screenshots')
mkdirSync(shots, { recursive: true })

const list = (name, fallback) => (process.env[name] || fallback).split(',')
const engines = { chromium, webkit, firefox }
const browsers = list('BROWSERS', 'chromium,webkit,firefox')
const pages = list('PAGES', 'index,tables')
const layoutWidths = list('WIDTHS', '320,390,768,1024,1440').map(Number)
const contrastWidths = [390, 1280]
const modes = {
  'light':        { colorScheme: 'light', theme: 'system' },
  'dark':         { colorScheme: 'dark',  theme: 'system' },
  'toggle-light': { colorScheme: 'dark',  theme: 'light' },
  'toggle-dark':  { colorScheme: 'light', theme: 'dark' },
}
const modeNames = list('MODES', Object.keys(modes).join(','))
const MIN_TABLE_FONT_PX = 13

const failures = []
const skipped = []
const fail = (where, message) => failures.push(`${where}: ${message}`)

// ─── In-page checks (run inside the browser) ───────────────────────────────

function pageOverflow() {
  return document.documentElement.scrollWidth > window.innerWidth
}

function contentChecks() {
  const canvas = document.createElement('canvas').getContext('2d', { willReadFrequently: true })
  const rgba = css => {
    canvas.clearRect(0, 0, 1, 1)
    canvas.fillStyle = '#0000'
    canvas.fillStyle = css
    canvas.fillRect(0, 0, 1, 1)
    const [r, g, b, a] = canvas.getImageData(0, 0, 1, 1).data
    return [r, g, b, a / 255]
  }
  const over = (top, bottom) => {
    const a = top[3] + bottom[3] * (1 - top[3])
    if (!a) return [0, 0, 0, 0]
    return [0, 1, 2].map(i => (top[i] * top[3] + bottom[i] * bottom[3] * (1 - top[3])) / a).concat(a)
  }
  const luminance = ([r, g, b]) => {
    const ch = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }
    return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b)
  }
  const hex = c => '#' + c.slice(0, 3).map(v => Math.round(v).toString(16).padStart(2, '0')).join('')
  const describe = el => {
    const block = el.closest('[class*="wp-block-"], .wp-caption, .wp-content > *')
    const name = block ? ([...block.classList].find(c => c.startsWith('wp-block-')) || block.tagName.toLowerCase()) : el.tagName.toLowerCase()
    const section = el.closest('section[id]')?.id
    return `${section ? '#' + section + ' ' : ''}${name} <${el.tagName.toLowerCase()}> "${el.textContent.trim().replace(/\s+/g, ' ').slice(0, 40)}"`
  }

  // Composite every background from the element up to the page; null when an
  // image or overlay sits behind the text and the color can't be known.
  const backgroundOf = el => {
    const layers = []
    for (let n = el; n; n = n.parentElement) {
      const s = getComputedStyle(n)
      if (s.backgroundImage !== 'none' || n.matches('.wp-block-cover')) return null
      const c = rgba(s.backgroundColor)
      if (c[3] > 0) layers.push(c)
      if (c[3] >= 1) break
    }
    return layers.reverse().reduce((acc, c) => over(c, acc), [255, 255, 255, 1])
  }

  const contrast = []
  const seen = new Set()
  for (const root of document.querySelectorAll('.wp-content')) {
    for (const el of root.querySelectorAll('*')) {
      const hasText = [...el.childNodes].some(n => n.nodeType === 3 && n.data.trim())
      if (!hasText || el.closest('svg, math, script, style, [data-test-allow~="contrast"]')) continue
      const rect = el.getBoundingClientRect()
      const s = getComputedStyle(el)
      if (rect.width <= 1 || rect.height <= 1 || s.visibility !== 'visible' || +s.opacity === 0) continue
      const bg = backgroundOf(el)
      if (!bg) continue
      const fg = over(rgba(s.color), bg)
      const [l1, l2] = [luminance(fg), luminance(bg)].sort((a, b) => b - a)
      const ratio = (l1 + 0.05) / (l2 + 0.05)
      const px = parseFloat(s.fontSize)
      const large = px >= 24 || (px >= 18.66 && +s.fontWeight >= 700)
      const min = large ? 3 : 4.5
      if (ratio < min) {
        const key = describe(el) + hex(fg) + hex(bg)
        if (seen.has(key)) continue
        seen.add(key)
        contrast.push(`${describe(el)}: ${ratio.toFixed(2)}:1 (${hex(fg)} on ${hex(bg)}, needs ${min}:1)`)
      }
    }
  }

  const hidden = [...document.querySelectorAll('.wp-content [hidden]')]
    .filter(el => el.textContent.trim() && el.getClientRects().length === 0)
    .map(el => `${describe(el)} is hidden and unreachable without JavaScript`)

  const srText = [...document.querySelectorAll('.wp-content .screen-reader-text')]
    .filter(el => { const r = el.getBoundingClientRect(); return r.width > 1 && r.height > 1 })
    .map(el => `${describe(el)} is visible`)

  return { contrast, hidden, srText }
}

function tableChecks(MIN_FONT_PX) {
  const lineCount = el => {
    const range = document.createRange()
    range.selectNodeContents(el)
    return Math.round(range.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight))
  }

  const splitWords = cell => {
    const found = []
    const walker = document.createTreeWalker(cell, NodeFilter.SHOW_TEXT)
    for (let node; (node = walker.nextNode());) {
      if (node.parentElement.closest('a')) continue
      for (const m of node.data.matchAll(/[^\s\-\/–]+/g)) {
        const range = document.createRange()
        range.setStart(node, m.index)
        range.setEnd(node, m.index + m[0].length)
        const tops = new Set([...range.getClientRects()].map(r => Math.round(r.top)))
        if (tops.size > 1) found.push(m[0])
      }
    }
    return found
  }

  return [...document.querySelectorAll('figure.wp-block-table[data-max-lines]')].map(fig => {
    const table = fig.querySelector('table')
    const figRect = fig.getBoundingClientRect()
    const cols = [...table.rows[0].cells]
    const bodyCells = [...table.querySelectorAll('tbody td, tbody th, tfoot td')]
    const problems = []

    const scrolls = fig.scrollWidth > fig.clientWidth + 1
    const fitFrom = Number(fig.dataset.fitFrom || Infinity)
    if (scrolls && window.innerWidth >= fitFrom) problems.push(`scrolls at ${window.innerWidth}px (must fit from ${fitFrom}px)`)

    const maxLines = Math.max(...bodyCells.map(lineCount))
    if (maxLines > Number(fig.dataset.maxLines)) problems.push(`a body cell wraps to ${maxLines} lines (max ${fig.dataset.maxLines})`)

    const split = [...table.querySelectorAll('td, th')].flatMap(splitWords)
    if (split.length) problems.push(`words split mid-way: ${split.join(', ')}`)

    const fontPx = parseFloat(getComputedStyle(table).fontSize)
    if (fontPx < MIN_FONT_PX) problems.push(`font-size ${fontPx}px is below ${MIN_FONT_PX}px`)

    // Narrow + scrolling: scroll to the end, the first column and caption must stay put
    const firstCell = table.tBodies[0].rows[0].cells[0]
    if (scrolls && getComputedStyle(firstCell).position === 'sticky') {
      fig.scrollLeft = fig.scrollWidth
      const cellLeft = firstCell.getBoundingClientRect().left
      if (Math.abs(cellLeft - figRect.left) > 1) problems.push(`sticky first column drifted ${Math.round(cellLeft - figRect.left)}px`)
      const caption = fig.querySelector('figcaption')
      if (caption) {
        const capRect = caption.getBoundingClientRect()
        if (capRect.left < figRect.left - 1 || capRect.right > figRect.right + 1) problems.push('caption scrolled out of view')
      }
      fig.scrollLeft = 0
    }

    const visibleCols = cols.filter(c => c.getBoundingClientRect().right <= figRect.right + 1).length
    return {
      table: fig.id,
      cols: `${visibleCols}/${cols.length}`,
      scrolls,
      maxLines,
      fontPx: +fontPx.toFixed(1),
      problems,
    }
  })
}

// ─── Runner ────────────────────────────────────────────────────────────────

for (const engine of browsers) {
  let browser
  try {
    browser = await engines[engine].launch()
  } catch (err) {
    skipped.push(`${engine}: ${err.message.split('\n')[0]}`)
    continue
  }

  for (const name of pages) {
    const url = pathToFileURL(join(here, `${name}.html`)).href

    // Layout: every width, light scheme (layout doesn't depend on color)
    for (const width of layoutWidths) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, colorScheme: 'light' })
      await page.goto(`${url}?theme=system`)
      const where = `${engine} ${name}.html @ ${width}px`
      if (await page.evaluate(pageOverflow)) fail(where, 'page scrolls horizontally')
      const tables = await page.evaluate(tableChecks, MIN_TABLE_FONT_PX)
      if (tables.length) {
        console.log(`\n${where}`)
        console.table(tables.map(({ problems, ...row }) => ({ ...row, ok: problems.length ? '✗' : '✓' })))
        for (const t of tables) for (const p of t.problems) fail(`${where} #${t.table}`, p)
      }
      await page.close()
    }

    // Color: each scheme setup at a phone and a desktop width
    for (const mode of modeNames) {
      const { colorScheme, theme } = modes[mode]
      for (const width of contrastWidths) {
        const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 2, colorScheme })
        await page.goto(`${url}?theme=${theme}`)
        const where = `${engine} ${name}.html ${mode} @ ${width}px`
        const { contrast, hidden, srText } = await page.evaluate(contentChecks)
        for (const c of contrast) fail(where, `contrast: ${c}`)
        for (const h of hidden) fail(where, `hidden: ${h}`)
        for (const t of srText) fail(where, `sr-text: ${t}`)
        console.log(`${where}: ${contrast.length + hidden.length + srText.length ? '✗' : '✓'}`)
        await page.screenshot({ path: join(shots, `${name}-${engine}-${mode}-${width}.png`), fullPage: true })
        await page.close()
      }
    }
  }

  await browser.close()
}

if (skipped.length) console.warn(`\nSKIPPED (browser would not launch):\n  ${skipped.join('\n  ')}`)

if (failures.length) {
  console.error(`\n${failures.length} failure(s):\n  ${failures.join('\n  ')}`)
  process.exit(1)
}
console.log('\nAll checks passed. Screenshots: tests/screenshots/')
