Parity harness (axe / Lighthouse / IBM)

Goal: quickly compare this extension’s findings with industry tools for calibration and tuning.

Prereqs
- Use a regular http/https page (not a restricted chrome:// page).
- Open DevTools → A11y DevTools tab. Enable/disable options as needed (viewport, live, shadow, iframes).

Compare with axe
Option A: Use the built‑in “Compare axe” button in the panel header. It will fetch axe-core from CDN, run in the page, and show a top‑10 summary.

Option B: Run the harness script manually
1) Open DevTools Console on the target page.
2) Paste the contents of parity/axe_compare.js and press Enter.
3) The console will print a summary and detailed JSON for further analysis.

Get our results to compare
- In the A11y DevTools panel, click “Copy JSON” to copy the current findings to clipboard.
- Paste into a scratch file for diffing.

Compare approach
- Start with counts by rule id. Expect naming differences across tools. Use presets (axe, Lighthouse, IBM) to align categories and severities.
- For deeper parity, map rules semantically (e.g., our `button-name` ↔ axe `button-name`).

Lighthouse parity
- Use the Lighthouse panel (or chrome://lighthouse) and run the “Accessibility” category.
- Export the JSON report. Compare issue types with this extension’s JSON.
- Notes: Lighthouse surfaces a subset of checks and focuses on page‑level audits; our output is more granular.

IBM Accessibility Checker parity
- Install IBM’s browser extension and scan the page.
- Export or note the list of issues. Compare by category with this extension’s JSON.
- Notes: IBM categorizes some heuristics as “Needs review”. Use our “Hide needsReview” option for alignment when desired.

Tips for calibration
- Use the “Preset” selector to adopt impact/needsReview conventions similar to axe/Lighthouse/IBM before comparing.
- Enable “Viewport only” if the third‑party tool only considers visible content in the current viewport.
- For dynamic pages, disable Live to take a stable snapshot.

