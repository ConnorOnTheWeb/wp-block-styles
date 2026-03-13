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

### With a wrapper class (fully scoped, zero bleed)

All selectors are also prefixed with `.wp-content`. Wrap your rendered post HTML in a div with that class to ensure nothing leaks into the rest of your layout:

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

## Customization via CSS Custom Properties

Override any of the built-in variables in your global CSS to theme the stylesheet without forking it:

```css
:root {
  /* Layout */
  --wp-content-max-width: 860px;       /* content column width */
  --wp-wide-max-width: 1200px;         /* alignwide breakout width */
  --wp-gap: 1.5rem;                    /* spacing between block elements */

  /* Borders */
  --wp-border-color: #e2e2e2;          /* tables, separators, file block, etc. */

  /* Code blocks */
  --wp-code-bg: #1e1e1e;               /* fenced code block background */
  --wp-code-color: #f8f8f2;            /* fenced code block text */

  /* Inline code */
  --wp-inline-code-bg: #f4f4f4;        /* inline <code> background */
  --wp-inline-code-color: #1a1a1a;     /* inline <code> text */

  /* Quotes */
  --wp-blockquote-border: #888;        /* blockquote left border */
  --wp-pullquote-border: currentColor; /* pullquote top/bottom border */

  /* Captions & meta text */
  --wp-caption-color: #6b6b6b;         /* figcaptions, cite, post dates */

  /* Buttons & interactive elements */
  --wp-button-bg: #333;                /* button, file download, search button */
  --wp-button-color: #fff;             /* button text */

  /* Form inputs */
  --wp-input-bg: #fff;                 /* search input background */
  --wp-input-color: inherit;           /* search input text */

  /* Surfaces */
  --wp-surface-bg: #f9f9f9;            /* details/accordion header, stripe rows */
  --wp-surface-alt-bg: #f5f5f5;        /* table header background */

  /* Scrollbar */
  --wp-scrollbar-color: #555;          /* code block scrollbar thumb */
}
```

All variables are overridden automatically in dark mode. You can also target dark mode specifically:

```css
[data-theme="dark"] {
  --wp-button-bg: #4a4a4a;
  --wp-inline-code-bg: #2a2a2a;
}
```

## What's covered

All current WordPress core block types as of Gutenberg 21.x / WordPress 6.9:

| Category | Blocks |
|---|---|
| Text | Paragraph, Heading, List, Code, Preformatted, Verse/Poetry, Footnotes |
| Media | Image, Gallery, Video, Audio, Cover, Media & Text, File |
| Embeds | All oEmbed types with aspect ratio variants (16:9, 4:3, 1:1, 9:16, 21:9) |
| Design | Columns, Group, Separator, Spacer, Buttons, Table, Details/Accordion |
| Text | Math (MathML/LaTeX) — new in WP 6.9 |
| Quotes | Blockquote (default + large style), Pullquote (default + solid style) |
| Widgets | Latest Posts, Latest Comments, Search |
| Social Embeds | Twitter/X pre-load blockquote, Instagram, TikTok iframe overrides |
| Misc | Social Icons, Navigation (reset), Classic/Legacy Editor output |
| Utilities | Alignment (alignwide, alignfull, alignleft, alignright), text-align helpers, color & font-size palette classes |

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

## Dark mode

Dark mode is handled automatically via `@media (prefers-color-scheme: dark)`. The stylesheet overrides border colors, code block backgrounds, table headers, and caption colors when the user's OS is in dark mode. Override the CSS custom properties in your own stylesheet to customize the dark theme.

## Print

Print styles are included via `@media print`. Embeds are replaced with a `[Embedded media — view online]` placeholder, buttons and social icons are hidden, float alignments are cleared so nothing overflows the page, and links display their full URL after the anchor text.

## Testing

Open `test.html` directly in a browser to visually verify all block types at once. No build step or server required — it loads `index.css` via a relative path and uses placeholder images from picsum.photos.

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

### Accordion block interactivity (wp-block-accordion)

The Accordion block (`core/accordion`, added in WordPress 6.7) uses the WordPress Interactivity API (`@wordpress/interactivity`) to toggle panels open and closed. This script does not run in headless environments, so all panels render with the `inert` attribute and stay hidden.

`wp-block-styles` overrides `inert` with `display: block` so panel content remains accessible:

```css
.wp-block-accordion-panel[inert] {
  display: block;
  pointer-events: auto;
}
```

This means accordions render as fully expanded static sections rather than interactive collapsed panels. If you need interactive accordions in headless, either:

- Use the **Details block** (`core/details`) instead — it uses native HTML `<details>`/`<summary>` elements with no JavaScript required
- Wire up your own toggle with a small client-side script targeting `.wp-block-accordion-heading__toggle`

### Conflict with Tailwind Typography (`prose`)

Do not apply Tailwind's `prose` class to the same element as `wp-content`. The `@tailwindcss/typography` plugin processes and re-renders HTML content in a way that duplicates block elements and conflicts with `wp-block-styles` selectors on nearly every element. Use one or the other — `wp-block-styles` is the correct choice for rendering WordPress `content.rendered` output.

### Social icons brand colors

WordPress injects per-service background colors via its own frontend stylesheet, which does not load in headless. `wp-block-styles` includes fallback brand colors for all common services (`wp-social-link-github`, `wp-social-link-youtube`, `wp-social-link-twitter`, etc.) so icons render correctly without WordPress's stylesheet.

### Checkmark list class name (`is-style-checkmark-list`)

The Gutenberg editor emits `is-style-checkmark-list` for the checkmark list style. Earlier versions of this package targeted `is-style-checked-list` instead. Both are now supported for backwards compatibility.