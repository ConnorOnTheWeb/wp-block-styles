# Changelog

All notable changes to this project will be documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.19] — 2026-05-30

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