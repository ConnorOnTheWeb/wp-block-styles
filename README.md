# wp-block-styles

Comprehensive CSS for WordPress Gutenberg block classes rendered via the headless **WP REST API** in Next.js, React, Nuxt, Vue, SvelteKit, Svelte, Astro, TanStack or any other front-end framework.

Unlike `@wordpress/base-styles` — which pulls in the full WP editor design system — this package is a **lean, renderer-focused stylesheet** with zero dependencies and no JavaScript.

## Why this package?

When you render WordPress content via the REST API, none of the block styles come with it — just raw HTML with Gutenberg's `wp-block-*` class names and no stylesheet to make sense of them. WordPress's own `@wordpress/base-styles` package exists but pulls in the entire editor design system, which is built for the admin UI, not for rendering on an arbitrary front-end.

This package is the missing piece: a standalone, zero-dependency CSS file that targets exactly the classes Gutenberg emits in rendered post content. It handles layout-breaking edge cases like full-bleed images, responsive embed ratios, and float-aligned figures — the things that quietly break in production and are tedious to track down one by one.

## Installation

```bash
npm install wp-block-styles
# or
yarn add wp-block-styles
# or
pnpm add wp-block-styles
```

## Learn More

This package emerged from years of solving the same styling gaps when pulling WordPress content via REST API.

- **[Styling the WordPress REST API in Next.js, React, and Beyond](https://connorontheweb.com/styling-wordpress-rest-api-headless-wp-block-styles)** — Launch post explaining the problem and why wp-block-styles exists (March 2026)
- **[Building a head for the WordPress REST API with Nuxt JS](https://connorontheweb.com/building-a-head-for-the-wordpress-rest-api-with-nuxt-js)** — Original approach to the styling problem (November 2021)
- **[Interactive demo with live examples](https://connorontheweb.com/packages/wp-block-styles)** — See every block type rendered with wp-block-styles

## Usage

### Global (recommended for most projects)

Import once in your app's root layout and all WP content is styled everywhere:

```js
// Next.js: app/layout.tsx or pages/_app.js
import 'wp-block-styles'
```

### Scoped to a single page

If WP content only lives on a few routes:

```js
// pages/[slug].tsx or app/posts/[slug]/page.tsx
import 'wp-block-styles'
```

Next.js deduplicates CSS imports — even if multiple pages import this file, it only ships once in the bundle.

### The `.wp-content` wrapper

Block styles target the classes WordPress puts in its markup (`wp-block-*`, plus the layout, alignment and palette classes), so they work wherever you render block HTML. Element-level styles (paragraphs, headings, lists, links, inline code) only apply inside a `.wp-content` wrapper, so they never touch the rest of your layout. Wrap your rendered post HTML in it:

```jsx
import 'wp-block-styles'

export default function Post({ content }) {
  return (
    <article
      className="wp-content"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}
```

## Light and dark

The stylesheet follows your site's color scheme. It's light unless your page says it supports dark, so a light-only site never gets dark tables or boxes just because a visitor's OS is in dark mode. To opt in:

```css
/* Follow the visitor's OS setting */
:root { color-scheme: light dark; }

/* Or always dark */
:root { color-scheme: dark; }
```

For a theme toggle, set `data-theme="dark"` or `data-theme="light"` on `<html>` (or any element, to theme just that section). The stylesheet maps it to `color-scheme`, which also switches the browser's own form controls and scrollbars to match:

```js
document.documentElement.dataset.theme = 'dark'
```

Colors use CSS [`light-dark()`](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark) (Chrome/Edge 123+, Safari 17.5+, Firefox 120+). Older browsers get the light colors.

## Customization via CSS Custom Properties

Override any of the built-in variables in your global CSS to theme the stylesheet without forking it. A plain value applies in both light and dark; use `light-dark()` to set each:

```css
:root {
  --wp-button-bg: #0f766e;                        /* same in light and dark */
  --wp-link-color: light-dark(#0f766e, #5eead4);  /* light, dark */
}
```

All variables, with their light defaults:

```css
:root {
  /* Layout */
  --wp-content-max-width: 860px;       /* content column width */
  --wp-wide-max-width: 1200px;         /* alignwide breakout width */
  --wp-gap: 1.5rem;                    /* gap in columns, rows, grids and galleries */
  --wp-radius: 6px;                    /* buttons, inputs, code, details, file block */

  /* Type */
  --wp-font-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;

  /* Links and focus */
  --wp-link-color: #2563eb;
  --wp-link-visited-color: #7c3aed;
  --wp-focus-color: #2563eb;           /* keyboard focus ring */

  /* Borders */
  --wp-border-color: #e2e2e2;          /* tables, separators, file block, etc. */

  /* Code blocks */
  --wp-code-bg: #1e1e1e;               /* code and preformatted blocks */
  --wp-code-color: #f8f8f2;
  --wp-scrollbar-color: #555;          /* code block scrollbar thumb */

  /* Inline code */
  --wp-inline-code-bg: #f0f0f0;
  --wp-inline-code-color: inherit;

  /* Quotes */
  --wp-blockquote-border: #888;        /* quote and verse left border */
  --wp-pullquote-border: currentColor; /* pullquote top/bottom border */

  /* Captions & meta text */
  --wp-caption-color: #646464;         /* figcaptions, cite, post dates */

  /* Buttons */
  --wp-button-bg: #1f2328;             /* buttons, file download, search button */
  --wp-button-color: #fff;

  /* Form inputs */
  --wp-input-bg: #fff;                 /* search input */
  --wp-input-color: inherit;

  /* Surfaces */
  --wp-surface-bg: #f7f7f7;            /* details summary, accordion headings, stripes */
  --wp-surface-alt-bg: #f2f2f2;        /* table header, current playlist track */

  /* Tables */
  --wp-table-col-min: 5em;             /* narrowest a column gets before the table scrolls */
  --wp-table-col-min-narrow: 8em;      /* same, for 4+ column tables in phone-width containers */
  --wp-table-stripe-bg: var(--wp-surface-bg);   /* is-style-stripes odd rows */
  --wp-table-sticky-bg: #f2f2f2;       /* sticky first column on phones (must be opaque) */
}
```

WordPress palette and font-size classes (`has-vivid-red-color`, `has-large-font-size`, …) read WordPress's own `--wp--preset--*` variables when your page defines them, for example from a theme.json export, and fall back to WordPress's defaults otherwise.

## What's covered

Core blocks as of WordPress 7.0 "Armstrong", checked against the markup WordPress emits:

| Category | Blocks |
|---|---|
| Text | Paragraph, Heading, List, Quote (default, large), Pullquote, Code, Preformatted, Verse, Footnotes, Math |
| Media | Image, Gallery, Video, Audio, Cover, Media & Text, File, Playlist |
| Embeds | Video and audio embeds with every aspect ratio WordPress uses; rich embeds (X/Twitter, Bluesky, …) before their scripts load; Instagram and TikTok |
| Design | Columns, Group (stack, row, grid), Buttons, Table, Separator, Spacer, Details, Accordion, Tabs |
| Widgets | Latest Posts, Latest Comments, RSS, Search, Social Icons, Breadcrumbs, Icon |
| Layout | WordPress's layout classes (`is-layout-flex`, `is-layout-grid`, `is-layout-constrained`, justification, vertical alignment), which headless content gets without the CSS WordPress normally generates for them |
| Utilities | Alignment (`alignwide`, `alignfull`, `alignleft`, `alignright`, `aligncenter`), text alignment, default palette colors, gradients and font sizes, `.screen-reader-text` |
| Classic | Legacy `[caption]` shortcode output |

Not styled: site-building blocks that don't appear in post content (navigation menus, query loops, post templates, site title/logo), and widget blocks such as Archives, Categories, Tag Cloud and Calendar.

## Tables

Tables are tuned to show as much as possible without becoming unreadable:

- **Fill the column, wrap at words.** Tables use the full content width and wrap only between words, never mid-word (long URLs inside links are the one exception).
- **Scroll instead of squeeze.** Each column has a minimum width (`--wp-table-col-min`). When a table can't fit without squeezing columns below it, the table scrolls sideways rather than stacking words in skinny columns. Tables with three or fewer columns always fit on a phone; wider ones get a roomier floor there (`--wp-table-col-min-narrow`).
- **Type scales with the space.** Table text steps down smoothly from `0.95em` in a full desktop column to about `0.75em` (never below 13px) in a phone-width column. This is based on the table's container, not the viewport, so it works in sidebars and columns too.
- **On phones, labels stay put.** In narrow containers the first column sticks while the rest scrolls, and the trailing edge fades while there's more to see (Chrome, Edge and Safari 26+; other browsers simply scroll).
- **Equal-width columns are ignored.** WordPress's "Fixed width table cells" option (`has-fixed-layout`) is on by default and forces every column to the same width, so auto layout is used regardless.
- **Editor settings carry through.** Column alignment, border color and the table's own text and background colors all apply. In a colored table, the header, stripes and rules are tinted from its text color, so they read on any background.
- **Numbers line up.** Digits are equal width (`tabular-nums`), and the footer section is set apart from the body with a heavier rule.
- **The corner cell sits top-left.** The first header cell labels the row-label column, so it aligns to the top while the other headers sit on their shared bottom line.

Print output shows the full table with no scroll container.

**Keyboard scrolling in Safari:** Chrome and Firefox let keyboard users focus a wide table and scroll it with the arrow keys. Safari only does that for focusable elements. If you render content yourself, adding `tabindex="0"` to each `figure.wp-block-table` makes wide tables scrollable by keyboard everywhere.

## Caching

This file is static and side-effect free. If you self-host it, use aggressive caching:

```
Cache-Control: public, max-age=31536000, immutable
```

If imported via npm, your bundler (webpack, Turbopack, Vite) handles content-hash cache busting automatically on version updates.

## Contributing

Issues and PRs welcome at [github.com/connorontheweb/wp-block-styles](https://github.com/connorontheweb/wp-block-styles).

When WordPress adds new core blocks, open an issue or submit a PR adding the relevant `.wp-block-*` selectors.

## License

MIT

## Minified build

A pre-minified version is included in the package:

```js
import 'wp-block-styles/index.min.css'
```

To regenerate the minified file after edits:

```bash
npm run build
```

## Print

Print styles are included via `@media print`. Embeds are replaced with a `[Embedded media — view online]` placeholder, buttons and social icons are hidden, float alignments are cleared so nothing overflows the page, and links display their full URL after the anchor text.

## Testing

The test pages in `tests/` open directly in a browser, with no build step or server, and work offline:

- **`tests/index.html`**: every block the package covers, in the markup WordPress actually emits (block save output, including the layout and palette classes WordPress adds).
- **`tests/tables.html`**: table layout edge cases.

Each page acts as its own host site. It follows your OS color scheme by default, and a System / Light / Dark toggle in the top bar pins either one, so you can check both themes.

`npm test` renders the pages in Chromium, WebKit and Firefox and fails on any of these:

- **Overflow:** the page scrolling sideways, checked at 320 to 1440px.
- **Contrast:** text inside `.wp-content` below WCAG AA against what is actually behind it. This runs with the OS in light and in dark mode, and with the toggle forcing each theme against the opposite OS setting.
- **Hidden content:** text WordPress marks `hidden` (closed accordion panels, inactive tabs) that headless readers can't reach.
- **Screen-reader text:** `.screen-reader-text` showing up visibly.
- **Tables:** on `tables.html`, words split mid-way, tables that scroll when they should fit, cells wrapping past their limit, text under 13px, and a sticky column or caption that drifts while scrolling. Each table declares its own limits.

```bash
npx playwright install chromium webkit firefox   # once
npm test
BROWSERS=webkit PAGES=index MODES=dark npm test  # narrow the run
```

Screenshots for a visual pass are written to `tests/screenshots/`.

## Headless quirks & known issues

### Cover block child element duplication

In some WordPress configurations, `content.rendered` outputs the cover block's child elements — the background image, overlay span, and inner container — both inside **and** outside the `.wp-block-cover` wrapper. This is a WordPress block renderer bug; `wp-block-styles` cannot fix it with CSS alone.

If you encounter it, sanitize `content.rendered` before passing it to `dangerouslySetInnerHTML`:

```js
import { parse } from 'node-html-parser'

function cleanCoverBlocks(html) {
  const root = parse(html)
  root.querySelectorAll('img.wp-block-cover__image-background').forEach(el => {
    if (!el.closest('.wp-block-cover')) el.remove()
  })
  root.querySelectorAll('.wp-block-cover__background').forEach(el => {
    if (!el.closest('.wp-block-cover')) el.remove()
  })
  root.querySelectorAll('.wp-block-cover__inner-container').forEach(el => {
    if (!el.closest('.wp-block-cover')) el.remove()
  })
  return root.toString()
}

// Usage
const content = cleanCoverBlocks(post.content.rendered)
```

Install `node-html-parser` separately — it is not a dependency of this package.

### Cover block image not visible (object-fit)

WordPress applies `object-fit` to cover block images via a frontend script (`wp-polyfill-object-fit`) that does not run in headless environments. This package applies `object-fit: cover` directly via CSS attribute selectors so the image fills the container without that script:

```css
.wp-block-cover__image-background[data-object-fit="cover"] { object-fit: cover; }
.wp-block-cover__image-background[data-object-fit="contain"] { object-fit: contain; }
```

`object-position` focal points (set via `data-object-position`) cannot be polyfilled with CSS alone since `attr()` is not yet supported for non-`content` properties in current browsers. The inline `style` attribute WordPress emits (`style="object-position: 52% 64%"`) handles this automatically — no workaround needed.

### Accordion and Tabs content (wp-block-accordion, wp-block-tabs)

WordPress marks closed accordion panels and inactive tab panels with `hidden`, and opens them with the Interactivity API (`@wordpress/interactivity`), which doesn't run in headless. Left alone, that content would be unreachable.

`wp-block-styles` shows those panels, so accordions render fully expanded and tabs render as stacked sections under their tab list:

```css
.wp-block-accordion-panel[hidden],
.wp-block-tab-panel[hidden] {
  display: block;
}
```

If your front end toggles them itself, restore the hiding in your own CSS:

```css
.wp-block-accordion-panel[hidden],
.wp-block-tab-panel[hidden] {
  display: none;
}
```

For collapsible content that works without JavaScript, use the **Details block** (`core/details`), which renders native `<details>`/`<summary>`.

### Conflict with Tailwind Typography (`prose`)

Do not apply Tailwind's `prose` class to the same element as `wp-content`. The `@tailwindcss/typography` plugin processes and re-renders HTML content in a way that duplicates block elements and conflicts with `wp-block-styles` selectors on nearly every element. Use one or the other — `wp-block-styles` is the correct choice for rendering WordPress `content.rendered` output.

### Social icons brand colors

WordPress injects per-service colors from its own frontend stylesheet, which doesn't load in headless. `wp-block-styles` includes WordPress's colors for every service it ships (`wp-social-link-github`, `wp-social-link-youtube`, …). In the "Logos only" style, near-black brands (GitHub, X, Threads, TikTok, …) use the text color instead, so they stay visible on dark pages.

### Checkmark list class name (`is-style-checkmark-list`)

The Gutenberg editor emits `is-style-checkmark-list` for the checkmark list style. Earlier versions of this package targeted `is-style-checked-list` instead. Both are now supported for backwards compatibility.

### Full-width blocks and scrollbars

`alignfull` blocks span `100vw`. On systems with always-visible scrollbars (Windows by default), `100vw` includes the scrollbar, so the page can scroll a few pixels sideways. If you use full-width blocks, clip horizontal overflow on your page:

```css
body { overflow-x: clip; }
```

## Upgrading to 2.0

- **Dark mode now follows your site, not the visitor's OS.** If you relied on automatic dark mode, add `:root { color-scheme: light dark; }`. `data-theme="dark"` and `data-theme="light"` work as before.
- **Dark-mode overrides:** the stylesheet no longer has `@media (prefers-color-scheme: dark)` blocks to override. Set dark values with `light-dark()` in your variables (see Customization).
- **Content link styles no longer apply to buttons**, and block lists (social icons, latest posts, RSS, …) no longer get bullets or indentation. If you had CSS working around either, you can remove it.
- **Removed** styles for the Form block, which isn't a core block, and for class names WordPress doesn't emit (`.wp-block-tab`, `.wp-block-file__textlink`, `.wp-block-breadcrumbs__separator`, `.wp-block-paragraph`).
