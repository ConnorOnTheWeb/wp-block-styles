/**
 * Table layout checks for wp-block-table.
 *
 * Renders tests/tables.html in Chromium, WebKit and Firefox at phone, tablet
 * and desktop widths, measures every table and fails on:
 *   - words split mid-way (outside links; breaks at "-" and "/" are fine)
 *   - the page itself scrolling sideways
 *   - a table scrolling at or above its data-fit-from viewport width
 *   - a body cell wrapping past its data-max-lines
 *   - table text below 13px
 *   - the sticky first column or the caption moving when a narrow table scrolls
 *
 * Usage:
 *   npm run test:tables
 *   BROWSERS=webkit WIDTHS=390 npm run test:tables
 *
 * Screenshots land in tests/screenshots/ (gitignored) for a visual pass.
 */
import { chromium, webkit, firefox } from 'playwright'
import { mkdirSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const fixture = pathToFileURL(join(here, 'tables.html')).href
const shots = join(here, 'screenshots')
mkdirSync(shots, { recursive: true })

const engines = { chromium, webkit, firefox }
const browsers = (process.env.BROWSERS || 'chromium,webkit,firefox').split(',')
const widths = (process.env.WIDTHS || '320,390,768,1024,1440').split(',').map(Number)
const MIN_FONT_PX = 13

const failures = []
const skipped = []

for (const name of browsers) {
  let browser
  try {
    browser = await engines[name].launch()
  } catch (err) {
    skipped.push(`${name}: ${err.message.split('\n')[0]}`)
    continue
  }

  for (const width of widths) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 2 })
    await page.goto(fixture)

    const result = await page.evaluate(MIN_FONT_PX => {
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

      const tables = [...document.querySelectorAll('figure.wp-block-table')].map(fig => {
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
          height: Math.round(table.offsetHeight),
          maxLines,
          fontPx: +fontPx.toFixed(1),
          problems,
        }
      })

      const pageScrolls = document.documentElement.scrollWidth > window.innerWidth
      return { tables, pageScrolls }
    }, MIN_FONT_PX)

    console.log(`\n${name} @ ${width}px`)
    console.table(result.tables.map(({ problems, ...row }) => ({ ...row, ok: problems.length ? '✗' : '✓' })))

    if (result.pageScrolls) failures.push(`${name} @ ${width}px: page scrolls horizontally`)
    for (const t of result.tables) for (const p of t.problems) failures.push(`${name} @ ${width}px #${t.table}: ${p}`)

    await page.screenshot({ path: join(shots, `${name}-${width}.png`), fullPage: true })
    await page.close()
  }

  await browser.close()
}

if (skipped.length) console.warn(`\nSKIPPED (browser would not launch):\n  ${skipped.join('\n  ')}`)

if (failures.length) {
  console.error(`\n${failures.length} failure(s):\n  ${failures.join('\n  ')}`)
  process.exit(1)
}
console.log(`\nAll table checks passed. Screenshots: tests/screenshots/`)
