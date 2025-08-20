# A11y Inspector Overlay (Pro Demo) — v0.2.0

Implements **Phase 1** (core WCAG rules, improved accname, contrast, target size, headings/landmarks/ARIA validity) and **Phase 2** (DevTools panel with rule toggles, reveal in Elements, export JSON/SARIF).

## Install (Unpacked)
1. Open **chrome://extensions**, enable **Developer mode**.
2. **Load unpacked** → select this folder.
3. Open Chrome DevTools → **A11y DevTools** tab appears.

## Use
- Toolbar icon or **Alt+Shift+A** toggles the overlay.
- DevTools panel: Rescan, filter by rule, reveal in Elements, copy selector, toggle rules, export JSON/SARIF.

## Rules
- `img-alt`, `control-name`, `label-control`, `headings-order`, `landmarks`, `aria-role-valid`, `target-size`, `contrast-text`.
