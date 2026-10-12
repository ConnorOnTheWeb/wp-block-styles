# Changelog

All notable changes to this project will be documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.1] — 2026-10-11

- Table column alignment set in the editor now applies (`has-text-align-*` on cells was overridden)
- Table border color set in the editor now reaches the cells
- Tables with their own text or background colors: header, stripes and rules tint from the table's text color instead of keeping light grey fills (light text on light grey before)
- Table footer set apart with a heavier rule and semibold text
- Tables use tabular figures so numbers line up
- Striped tables drop their (transparent) side borders, so horizontal rules meet cleanly
- Table corner cell (first header cell) aligns to the top, so it no longer sits low beside wrapped column headers
- Tests: table fixtures for column alignment, colored tables, border color and footers; checks that alignment and border color reach the cells

## [2.0.0] — 2026-10-11

Breaking: dark mode follows the host site instead of the visitor's OS. See "Upgrading to 2.0" in the README.

### Changed
- Colors follow the page's `color-scheme` via `light-dark()`: light by default, dark when the site declares `color-scheme: dark` / `light dark` or sets `data-theme="dark"`. Light-only sites no longer get dark table headers, stripes or summaries for visitors in OS dark mode. The `prefers-color-scheme` overrides are gone
- Content link styles no longer apply to buttons, file download buttons or social icons (buttons rendered with blue, underlined text, turning purple once visited)
- Content list styles (bullets, indent) only apply to List blocks and plain lists, not the lists other blocks use as containers (social icons, latest posts, RSS, footnotes, playlist)
- Links inside blocks with their own text or background color follow that color
- Buttons redesigned: consistent sizing for filled and outline styles, focus ring, no hardcoded hover color
- Palette, gradient and font-size classes read WordPress's `--wp--preset--*` variables when present and use `!important` like WordPress
- Dark-mode link, caption, button and surface colors meet WCAG AA

### Added
- WordPress layout classes: `is-layout-flex` (row/stack, justification, no-wrap), `is-layout-grid`, `is-layout-constrained`
- Buttons: alignment (`is-content-justification-*`) and width (`wp-block-button__width-25/50/75/100`)
- Cover: overlay opacity (`has-background-dim-*`), default black overlay, content position classes
- Columns: vertical alignment classes; no wrapping from 782px, matching WordPress
- Media & Text: WordPress's grid, vertical alignment, crop-to-fill images
- Social icons: WordPress's colors for every service, icon size classes, visible labels, logos-only colors
- Gallery: WordPress's column behavior (2 on phones, chosen count from 600px), working crop
- Search: button-inside variant and keyboard focus ring (previously removed by `outline: none`)
- Latest posts and RSS grid column counts; latest comments avatar layout
- `.screen-reader-text`, previously only hidden inside social icons, so labels and "Read more" context showed on screen
- Default gradient classes, border color classes and `kbd` styling
- New variables: `--wp-radius`, `--wp-font-mono`, `--wp-focus-color`

### Fixed
- Accordion and Tabs: panels WordPress marks `hidden` are shown, since the script that opens them doesn't run in headless (the 1.0.21 fix targeted `inert`, which WordPress doesn't use)
- Tabs styles target the real markup (`.wp-block-tab-list button`); the `.wp-block-tab` class doesn't exist
- Breadcrumbs separators, drawn from WordPress's `--separator` variable
- Embeds: the fixed 16:9 box only applies to embeds WordPress marks with an aspect ratio, so rich embeds are no longer cut off
- Palette-colored blocks no longer lose their padding (a `[class*="-background-color"]` rule reset it)
- Centered and side-aligned images shrink to the image, so centering and captions line up
- Media & Text no longer stacks on mobile when "Stack on mobile" is off
- File block styles target the real markup; Icon block styles target its `<div>`
- Playlist tracks reset the browser's default button styling

### Removed
- Form block styles (not a core block)

### Tests
- Test pages moved to `tests/`: `tests/index.html` replaces `test.html`, uses the markup WordPress actually emits for every block, covers the WordPress 7.0 blocks, and loads local images instead of picsum.photos
- Test pages act as their own host: they follow the OS color scheme, with a System / Light / Dark toggle
- `npm test` (replaces `npm run test:tables`) adds contrast checks in light and dark, page overflow checks, and checks for hidden or visible screen-reader content across all test pages

## [1.0.22] — 2026-10-11

- Tables fill the content column instead of sizing to their content, so tables that previously scrolled on desktop now fit
- Table cells no longer split words mid-way (they inherited `word-break: break-word` from `.wp-content`)
- Per-column minimum width (`--wp-table-col-min`, `--wp-table-col-min-narrow`): tables scroll sideways rather than squeezing columns into tall, narrow stacks
- Table text scales with the table's container width (`0.95em` → ~`0.75em`, 13px minimum)
- Phone-width tables: sticky first column, trailing-edge scroll fade (where `animation-timeline` is supported), caption stays in view while scrolling
- `has-fixed-layout` equal-width columns are overridden in favor of auto layout
- Striped row color moved to `--wp-table-stripe-bg` (dark mode now sets the variable instead of overriding selectors); added `--wp-table-sticky-bg`
- Print: tables render in full without the scroll container, fade or sticky column
- Added `tests/tables.html` fixtures and `npm run test:tables` (Playwright, Chromium/WebKit/Firefox)

## [1.0.21] — 2026-05-30

- WordPress 7.0 "Armstrong" support: added CSS for new stable blocks — Icon (`core/icon`), Breadcrumbs (`core/breadcrumbs`), Navigation Overlay Close (`core/navigation-overlay-close`)
- Added CSS for experimental WP 7.0 blocks — Tabs, Playlist, Form
- Added RSS block styles (previously missing)
- Fixed accordion panel `[inert]` bug — panels were hidden in headless environments (`display: none` → `display: block; pointer-events: auto`)
- Updated table cell `max-width` from `160px` to `320px` for less aggressive column capping
- Updated README "What's covered" table to reference WordPress 7.0 "Armstrong"
- Removed stale "new in WordPress 6.9" annotation from Math section header

## [1.0.18] — 2026-04-29

- Social embed height and details

## [1.0.17] — 2026-03-12

- Table overflow handling

## [1.0.16] — 2026-03-12

- Link styling with variables

## [1.0.15] — 2026-03-12

- Closer targeting of drop cap class

## [1.0.14] — 2026-03-12

- Added context and references

## [1.0.13] — 2026-03-12

- Added context

## [1.0.12] — 2026-03-12

- Fleshing out the best defaults
- Adding caveats to readme.md

## [1.0.11] — 2026-03-12

- Cover block background image support

## [1.0.10] — 2026-03-12

- user-select webkit support

## [1.0.9] — 2026-03-12

- Improved dark mode styles
- Added variables for link color

## [1.0.8] — 2026-03-11

- Improved padding for code blocks

## [1.0.7] — 2026-03-11

- Fixed inline code color in dark mode

## [1.0.6] — 2026-03-11

- Improved padding for paragraphs and other elements

## [1.0.5] — 2026-03-11

- Improved padding for paragraphs and other elements

## [1.0.4] — 2026-03-10

- Fixed inline code color in dark mode

## [1.0.3] — 2026-03-10

- Updated README

## [1.0.2] — 2026-03-10

- Updated README

## [1.0.1] — 2026-03-10

- Updated README

## [1.0.0] — 2026-03-10

Initial release. Styles for all WordPress core blocks as of Gutenberg 21.x / WordPress 6.9, including dark mode, print styles, social embed overrides, nested lists, math block, minified build, and CSS custom properties for theming.