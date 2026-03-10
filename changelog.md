# Changelog

All notable changes to this project will be documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] — 2025-03-10

### Added
- Initial release
- Styles for all WordPress core blocks as of Gutenberg 21.x / WordPress 6.9
- Dark mode support via `@media (prefers-color-scheme: dark)`
- Print styles via `@media print`
- Minified build (`index.min.css`)
- CSS custom properties for easy theming
- `test.html` visual reference for all block types
- `.wp-content` wrapper class for scoped usage
- Alignment utilities: `alignwide`, `alignfull`, `alignleft`, `alignright`
- Legacy Classic Editor class support (`wp-caption`, `wp-caption-text`)
- Math block (`wp-block-math`) with MathJax/KaTeX polyfill container support — new in WP 6.9
- Social embed overrides for Twitter/X, Instagram, and TikTok (pre-load blockquote state + iframe wrapper fixes)
- Nested list styles: disc → circle → square (unordered), decimal → lower-latin → lower-roman (ordered)
- `a:visited` state on `.wp-content` links

## [1.0.2] — 2025-03-10

### Added
- Updated README.md