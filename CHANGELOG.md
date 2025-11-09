# Changelog

All notable changes to AccessInsight will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-11-07

### Added
- **Loading state UI**: Visual feedback during page scanning
- **Empty state UI**: Friendly message when no accessibility issues are found
- **Error state UI**: Clear error messages with retry functionality when scanning fails
- **Retry button**: Allow users to retry failed scans
- **Memory leak prevention**: Max limits on concurrent devtools connections (50) and frame aggregators (100)
- **Comprehensive error handling**: Try-catch blocks with user-facing error messages throughout
- **XSS protection**: HTML escaping for all user-controlled data in DevTools panel

### Changed
- **Extension name**: Updated from "A11y Inspector Overlay (Pro Demo)" to "AccessInsight - WCAG Accessibility Checker"
- **Version**: Bumped from 0.2.0 to 1.0.0 for production release
- **Description**: Enhanced to highlight comprehensive WCAG 2.1/2.2 support and export capabilities
- **Error handling**: Improved with specific error messages instead of silent failures
- **Panel cleanup**: Now properly clears highlights and observers on close to prevent memory leaks

### Fixed
- **Memory leaks**: Fixed event listener cleanup on panel toggle (scroll/resize listeners)
- **Memory leaks**: Fixed ResizeObserver cleanup by calling clearHighlights() on panel close
- **Memory leaks**: Added cleanup of frame aggregators on devtools disconnect
- **XSS vulnerabilities**: Fixed unescaped user data in innerHTML assignments (selector, message, evidence fields)
- **UI state management**: Empty state now properly displays when 0 findings

### Security
- Added HTML escaping function to prevent XSS attacks
- Secured all innerHTML assignments involving user-controlled data
- Added max connection limits to prevent resource exhaustion
- Enhanced error handling to prevent information leakage

## [0.2.0] - 2025-11-07 (Phase 8)

### Added
- **Quick Tune calibration**: Adjusted confidence levels for text-contrast, label-control, and img-alt rules
- **Comprehensive validation**: Tested on 30 diverse websites with 997 findings
- **Test infrastructure**: Full integration test suite with mock data generation
- **Validation pipeline**: Automated metrics calculation, pattern analysis, and reporting
- **Baseline comparison**: Comparison with axe-core showing 2.25x more findings

### Changed
- **text-contrast confidence**: Reduced from 0.9 → 0.8 (solid), 0.85 → 0.75 (semi-transparent)
- **label-control confidence**: Reduced from 0.9 → 0.8, with placeholder detection (0.7)
- **img-alt confidence**: Reduced from 0.95 → 0.85

### Performance
- **Precision**: 82.7% (exceeds 75% target by +7.7%)
- **Recall**: 100.0% (exceeds 60% target by +40%)
- **F1 Score**: 90.5%
- **False Positive Rate**: 17.3% (under 25% limit by -7.7%)
- **Average scan time**: 223ms (55% under 500ms target)

## [0.1.0] - 2025-11-06 (Phase 1-7)

### Added
- Initial release with 46 accessibility rules
- WCAG 2.1 Level A and AA support
- WCAG 2.2 Level A and AA support (6 new rules)
- Visual overlay with element highlighting
- DevTools panel integration
- Keyboard shortcuts (Alt+Shift+A, Alt+Shift+N, Alt+Shift+P)
- Rule filtering and search
- Export formats: JSON, SARIF, HTML, CSV
- Rule presets: Default, Axe Core, Lighthouse, IBM Accessibility
- Live scanning with MutationObserver
- Shadow DOM scanning
- Iframe scanning support
- Viewport-only scanning mode
- Rule toggles (enable/disable individual rules)
- Ignore functionality (selectors and rules)
- Confidence filtering
- Impact/priority sorting
- Baseline comparison with axe-core
- Multi-frame aggregation
- Finding deduplication
- Per-site configuration persistence
- Global UI state persistence

### Rules Implemented
**WCAG 2.1 Rules** (40 rules):
- Perceivable: img-alt, audio-video-alternatives, aria-hidden-focus, contrast-text, link-in-text-block, text-spacing, reflow
- Operable: keyboard-focus, focus-visible, focus-order, link-purpose, document-title, headings-order, bypass-blocks, multiple-nav, skip-link, link-name, button-name
- Understandable: html-has-lang, html-lang-valid, label-control, page-title
- Robust: aria-role-valid, aria-required-attr, name-role-value, parsing

**WCAG 2.2 Rules** (6 new rules):
- focus-appearance (2.4.11, 2.4.7)
- focus-not-obscured-minimum (2.4.12)
- focus-not-obscured-enhanced (2.4.13)
- dragging-movements (2.5.7)
- target-size (2.5.5, 2.5.8)
- consistent-help (3.2.6)
- redundant-entry (3.3.7)
- accessible-authentication-minimum (3.3.8)
- accessible-authentication-enhanced (3.3.9)

---

## Links
- [Phase 8 Comprehensive Validation Report](PHASE_8_COMPREHENSIVE_VALIDATION_REPORT.md)
- [Phase 9 Baseline Audit](PHASE_9_BASELINE_AUDIT.md)
- [Phase 9 Action Plan](PHASE_9_ACTION_PLAN.md)
