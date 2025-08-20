<div align="center">

# A11y Inspector Overlay (Pro Demo)

Manifest V3 Chrome extension for fast, actionable accessibility inspection.

[![Manifest V3](https://img.shields.io/badge/Chrome-Manifest%20V3-4285F4?logo=google-chrome&logoColor=white)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![Version](https://img.shields.io/badge/version-0.2.0-informational.svg)](#changelog)
[![Status](https://img.shields.io/badge/status-active-success.svg)](#roadmap)

</div>

Powerful overlay + DevTools panel with presets (axe, Lighthouse, IBM), scan options (live, viewport‑only, shadow DOM, iframes), ignores, filters, and export to JSON/SARIF/HTML.

---

## Table of Contents
- [Features](#features)
- [Install (Unpacked)](#install-unpacked)
- [Usage](#usage)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Presets & Profiles](#presets--profiles)
- [Scan Options](#scan-options)
- [Ignores & Persistence](#ignores--persistence)
- [Rule Coverage (Selected)](#rule-coverage-selected)
- [Permissions & Restricted Pages](#permissions--restricted-pages)
- [Architecture](#architecture)
- [Troubleshooting](#troubleshooting)
- [Development](#development)
- [Privacy](#privacy)
- [Changelog](#changelog)
- [Roadmap](#roadmap)

## Features
- Overlay highlights with keyboardable panel; safe focus handling; reveal in Elements.
- DevTools panel: presets, rule toggles, filters (rule, severity, confidence), ignores, JSON/SARIF/HTML export.
- Engine: improved Accessible Name, color contrast (alpha compositing), extensive rules, confidence + needsReview, tool‑profile parity.
- Performance: programmatic injection, viewport‑only scanning, debounced live rescans with backoff, optional shadow DOM traversal.

## Install (Unpacked)
1. Open `chrome://extensions` and enable Developer mode.
2. Click “Load unpacked” and select this folder.
3. Open DevTools on any page; the “A11y DevTools” tab should appear.

## Usage
- Toolbar: click the extension icon or press Alt+Shift+A to toggle the overlay in the current tab.
- In DevTools → A11y DevTools:
  - Rescan manually or enable Live.
  - Choose a preset (Default, Axe Core, Lighthouse, IBM) or toggle rules.
  - Filter by rule, impact, and minimum confidence.
  - Configure: Viewport‑only, Scan shadow DOM, Scan iframes, Live.
  - Select a finding to view guidance and actions (Reveal in Elements).
  - Export findings as JSON/SARIF/HTML.
  - Ignore a rule or selector; Clear Ignores resets per‑host ignores.

## Keyboard Shortcuts
| Action | Shortcut |
|---|---|
| Toggle overlay | Alt+Shift+A |
| Focus next finding | Alt+Shift+N |
| Focus previous finding | Alt+Shift+P |

## Presets & Profiles
- `presets.json` defines enabled rules, min confidence, engine profile (impact/needsReview conventions), and scan options.
- Applying a preset sends a single atomic configuration to content; UI updates accordingly.
- Manual changes mark the selection as “Custom”; click “Reset to Preset” to restore the preset.

## Scan Options
- **Viewport only**: limit expensive checks to on‑screen elements.
- **Live**: debounced `MutationObserver` rescans with automatic backoff on very dynamic pages (status pill shows “Live paused”).
- **Shadow DOM**: traverse open shadow roots for naming/contrast when enabled.
- **Iframes**: injects into all frames (where allowed) and aggregates results.

## Ignores & Persistence
- Ignores: by rule ID or CSS selector; persisted per host in `localStorage`. “Clear Ignores” removes them.
- Enabled rules: persisted in `chrome.storage.local`.
- Scan options and selected preset: persisted per host in `localStorage`.

## Rule Coverage (Selected)
- Names/Labels: `img-alt`, `button-name`, `link-name`, `control-name`, `label-control`, `region-name`, `iframe-title`.
- Semantics/ARIA: `aria-role-valid`, `aria-required-props`, `aria-attr-valid`, `aria-presentation-misuse`, `interactive-role-focusable`, `aria-allowed-attr`, `aria-allowed-role`, `aria-required-children`, `aria-required-parent`.
- Structure/Content: `headings-order`, `heading-h1`, `landmarks`, `list`, `dl-structure`, `duplicate-ids`, `table-headers-association`.
- Interaction/Usability: `target-size`, `link-in-text-block`, `link-button-misuse`, `tabindex-positive`, `skip-link`.
- Document/Meta: `html-lang`, `document-title`, `meta-viewport`.
- Perception: `contrast-text` (alpha compositing; background‑image heuristic may set needsReview in some profiles).

## Permissions & Restricted Pages
- Permissions: `activeTab`, `tabs`, `storage`, `scripting`; `host_permissions: <all_urls>` for programmatic injection.
- Restricted pages (e.g., `chrome://`, Chrome Web Store) block injection. DevTools will show a Restricted status; overlay cannot be toggled there.

## Architecture
- `manifest.json`: MV3; permissions and `devtools_page`. Programmatic injection only (no `content_scripts` block).
- `background.js` (service worker): routes between DevTools and content; ensures injection (`engine.js`, `content.js`); aggregates iframe results; handles action/commands.
- `content.js`: top‑frame overlay UI, highlights, keyboard navigation, live rescans, viewport filtering, ignores, messaging to DevTools.
- `engine.js`: rule engine with improved naming/contrast, many rules, confidence + needsReview, and profiles for tool parity.
- `devtools.html` + `devtools_bootstrap.js`: MV3‑safe bootstrap that creates the panel.
- `devtools_panel.html` + `devtools.js`: panel UI, presets/filters/exports/ignores, status, scan controls.

## Troubleshooting
- DevTools tab missing: close and reopen DevTools; ensure the extension is loaded. Confirm `devtools_bootstrap.js` calls `chrome.devtools.panels.create`.
- Overlay not appearing: some pages are restricted; try a regular site. Click the toolbar icon or use Alt+Shift+A. Inspect the service worker in `chrome://extensions` for logs.
- Rescan button stuck on “Rescanning…”: the panel auto‑enables the button after a safety timeout; clearing results also re‑enables it.
- No findings: check filters (rule/impact/confidence) and Enabled rules. Set confidence ≤ 0.95. Uncheck “Hide needsReview”. Disable “Viewport only” if testing off‑screen content.
- Live paused: indicates dynamic‑page backoff; it resumes automatically, or disable Live.
- Shadow DOM/iframes: enable their options. Only open shadow roots are traversed; cross‑origin iframes may be inaccessible.

## Development
- Messaging: DevTools connects to background via a named port; background ensures injection then forwards to content. Content returns `findings` (plus `allRuleIds`, scan ms) and `live-status`.
- Profiles: normalize impact/needsReview per preset (axe, Lighthouse, IBM) for comparable output.
- Confidence: each finding includes a `confidence` score; the DevTools slider filters by minimum confidence.
- Debugging: set `DEBUG = true` in `background.js`, `content.js`, or `devtools.js` for verbose logs.

## Privacy
All analysis runs locally in the inspected page. The extension does not transmit page data. Per‑host preferences (ignores, scan options, preset) are stored locally.

## Changelog
- 0.2.0 — MV3 programmatic injection; robust DevTools panel; presets; scan options (live/viewport/shadow/iframes); improved ANDC; contrast/background compositing; ignores; exports (JSON/SARIF/HTML); performance and stability fixes.

## Roadmap
- More spec‑aligned Name & Description Computation (ANDC) edge cases and ARIA mappings.
- Additional rules for forms/tables/media and keyboard traps.
- Visual density/UX polish and theming.
- Optional auto‑fix suggestions where safe.
