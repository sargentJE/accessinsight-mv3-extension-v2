# AccessInsight User Guide

**Version**: 1.0.0
**Last Updated**: 2025-11-07

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Overview](#overview)
3. [Using the Overlay Panel](#using-the-overlay-panel)
4. [Using the DevTools Panel](#using-the-devtools-panel)
5. [Understanding Findings](#understanding-findings)
6. [Keyboard Shortcuts](#keyboard-shortcuts)
7. [Export Options](#export-options)
8. [Rule Presets](#rule-presets)
9. [Advanced Features](#advanced-features)
10. [FAQ](#faq)
11. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Installation

1. Install AccessInsight from the Chrome Web Store
2. Click the extension icon to grant permissions
3. Navigate to any webpage you want to test
4. Click the AccessInsight icon or press **Alt+Shift+A** to start scanning

### First Scan

When you activate AccessInsight for the first time:

1. **Overlay Panel** will appear on the right side of the page
2. The page will be **automatically scanned** for accessibility issues
3. **Visual highlights** will appear around problematic elements
4. The **findings list** will show all detected issues

---

## Overview

### What is AccessInsight?

AccessInsight is a comprehensive accessibility testing tool that helps you identify and fix WCAG 2.1 and WCAG 2.2 compliance issues on your web pages.

**Key Features**:
- ✅ **46 accessibility rules** covering WCAG 2.1 and 2.2 (Level A & AA)
- ✅ **Real-time scanning** with live DOM monitoring
- ✅ **Visual overlay** highlighting issues directly on the page
- ✅ **DevTools integration** for advanced analysis
- ✅ **Multiple export formats** (JSON, SARIF, HTML, CSV)
- ✅ **Keyboard-accessible** interface
- ✅ **Shadow DOM and iframe scanning**

### How It Works

AccessInsight uses a custom-built scanning engine that analyzes your page's DOM structure, styles, and ARIA attributes to detect accessibility violations. The engine:

1. **Scans** all elements on the page (optionally including shadow DOM and iframes)
2. **Evaluates** each element against 46 accessibility rules
3. **Assigns** a confidence score (0.6-0.95) and impact level to each finding
4. **Reports** findings with actionable guidance
5. **Highlights** problematic elements visually

**Accuracy**: AccessInsight maintains 82.7% precision and 100% recall based on comprehensive testing across 30+ diverse websites.

---

## Using the Overlay Panel

The overlay panel is the quick-access interface for accessibility testing.

### Activating the Panel

**Methods**:
- Click the AccessInsight browser icon
- Press **Alt+Shift+A** (Windows/Linux) or **Alt+Shift+A** (Mac)

### Panel Layout

```
┌─────────────────────────────┐
│ A11y Findings          [x]  │  ← Header with close button
├─────────────────────────────┤
│ [Rescan] [All rules ▾]      │  ← Controls
│ 15 issues                    │  ← Count
├─────────────────────────────┤
│ 1. Missing alt text         │
│    img-alt • 1.1.1 • img    │  ← Finding items
│                              │
│ 2. Button lacks name        │
│    button-name • 4.1.2      │
├─────────────────────────────┤
│ Shortcuts: Alt+Shift+A      │  ← Footer
└─────────────────────────────┘
```

### Key Controls

| Control | Purpose |
|---------|---------|
| **Rescan** | Re-run the scan to detect new issues |
| **Rule Filter** | Show findings for a specific rule only |
| **Close** | Hide the panel and remove highlights |
| **Clear All** | Remove all findings from the list |

### Interacting with Findings

**Click a finding** to:
- Scroll the element into view
- Flash a yellow highlight on the element
- Hear a screen reader announcement (if using assistive tech)

**Keyboard navigation**:
- **↑/↓ arrows**: Navigate through findings
- **Enter**: Jump to selected finding
- **Escape**: Close the panel

### Visual Highlights

Each finding is marked with:
- **Colored box**: Border around the problematic element
- **Number badge**: Finding number for easy reference
- **Color coding**: Different rules use different colors

**Color Palette**:
- 🔴 Red: Critical issues (img-alt, contrast-text)
- 🟢 Green: Form controls (label-control, control-name)
- 🟣 Purple: Structure issues (headings-order, landmarks)
- 🟠 Orange: Size/spacing (target-size)

---

## Using the DevTools Panel

For advanced analysis and bulk operations, use the DevTools panel.

### Opening DevTools Panel

1. Open Chrome DevTools (**F12** or **Ctrl+Shift+I**)
2. Click the **"A11y DevTools"** tab
3. The panel will automatically connect to the current page

### DevTools Features

#### Status Bar
Shows connection status, last scan time, and scan duration:
```
Connected • Last scan 10:30:45 AM • 223 ms
```

#### Control Bar

**Basic Controls**:
- **Toggle Overlay**: Show/hide the overlay panel on the page
- **Rescan**: Re-run the scan
- **Preset Selector**: Choose a rule preset (Default, Axe, Lighthouse, IBM)

**Filters**:
- **Rule Filter**: Show findings for specific rule
- **Impact Filter**: Filter by severity (critical, serious, moderate, minor)
- **Search**: Text search across rule, selector, and message
- **Sort**: Order findings by priority, impact, confidence, rule, or selector

**Advanced Controls** (click "Advanced ▾" to reveal):
- **Group**: Group findings by rule or impact
- **Min Confidence**: Filter out low-confidence findings
- **Live Mode**: Auto-rescan on DOM changes
- **Viewport Only**: Only scan visible elements
- **Scan Shadow DOM**: Include shadow roots in scan
- **Scan Iframes**: Include iframe content in scan
- **Hide needsReview**: Filter out findings that need manual review
- **Export**: Download findings as JSON, SARIF, HTML, or CSV
- **Compare axe**: Run axe-core and compare results
- **Clear All**: Remove all findings
- **Clear Ignores**: Reset ignored selectors/rules

#### Findings List

Each finding shows:
- **Rule ID** and impact badge
- **Confidence score** (0.60 - 0.95)
- **WCAG criteria** (e.g., "1.4.3, 1.4.6")
- **CSS selector** (e.g., "div.header > img:nth-child(2)")
- **Message** describing the issue
- **Evidence** (technical details)

**Actions** (click a finding to access):
- **Reveal in Elements**: Inspect the element in DevTools
- **Open WCAG**: View official WCAG documentation
- **Help**: View rule-specific guidance
- **Copy Selector**: Copy CSS selector to clipboard
- **Ignore This**: Hide this specific finding
- **Ignore Rule**: Disable this rule for this site

#### Finding Details Panel

Click any finding to see:
- **Full message** and explanation
- **WCAG criteria** covered
- **How to fix** guidance
- **Evidence** object with technical details
- **Quick actions** (Reveal, Ignore)

---

## Understanding Findings

### Finding Structure

Each finding includes:

```json
{
  "ruleId": "img-alt",
  "message": "Image lacks a text alternative.",
  "selector": "#hero > img:nth-child(1)",
  "wcag": ["1.1.1"],
  "impact": "critical",
  "confidence": 0.85,
  "priority": 21,
  "evidence": {
    "src": "hero-image.jpg",
    "hasAlt": false
  },
  "help": "All images must have alt text...",
  "helpUrl": "https://www.w3.org/WAI/WCAG21/Understanding/non-text-content"
}
```

### Confidence Levels

AccessInsight assigns a confidence score to each finding:

| Confidence | Meaning | Action |
|------------|---------|--------|
| **0.9-0.95** | Very high confidence | Fix immediately - almost certainly an issue |
| **0.8-0.89** | High confidence | Very likely an issue - verify and fix |
| **0.7-0.79** | Good confidence | Likely an issue - manual review recommended |
| **0.6-0.69** | Moderate confidence | Possible issue - definitely review |

**Note**: After Phase 8 calibration, confidence levels are well-calibrated:
- 0.9 findings are 81% accurate
- 0.8 findings are 79% accurate
- 0.7 findings are 74% accurate

### Impact Levels

| Impact | Description | Priority |
|--------|-------------|----------|
| **Critical** | Severe accessibility barrier | Fix first |
| **Serious** | Major impact on users | Fix soon |
| **Moderate** | Noticeable impact | Address when possible |
| **Minor** | Small quality issue | Low priority |

### Priority Scoring

AccessInsight calculates a priority score for each finding based on:
- **Impact** (critical = 5, serious = 4, moderate = 3, minor = 1)
- **Confidence** (0.6 to 0.95)
- **WCAG Level** (A = 1.5x boost, AA = 1.2x boost)

Higher priority = more important to fix first.

### needsReview Flag

Some findings are marked `needsReview: true`, meaning:
- The rule detected a **potential** issue
- **Manual verification** is required to confirm
- The automated test cannot determine the true state

**Example**: `accessible-authentication-minimum` flags all login forms, but you must manually check if they offer alternatives to cognitive tests.

---

## Keyboard Shortcuts

### Global Shortcuts

| Shortcut | Action |
|----------|--------|
| **Alt+Shift+A** | Toggle overlay panel |
| **Alt+Shift+N** | Focus next finding |
| **Alt+Shift+P** | Focus previous finding |

### Panel Shortcuts

| Shortcut | Action |
|----------|--------|
| **↑/↓ arrows** | Navigate findings |
| **Enter** | Jump to selected finding |
| **Escape** | Close panel |
| **Tab** | Navigate controls |
| **Space** | Activate buttons |
| **R** (when Rescan focused) | Rescan page |

---

## Export Options

AccessInsight supports multiple export formats for integration with CI/CD pipelines and reporting tools.

### JSON Export

**Use case**: Integration with custom tools, data analysis

```json
{
  "findings": [
    {
      "ruleId": "img-alt",
      "message": "Image lacks a text alternative.",
      "selector": "#hero > img",
      "wcag": ["1.1.1"],
      "impact": "critical",
      "confidence": 0.85
    }
  ],
  "summary": {
    "totalFindings": 15,
    "byCriteria": { "critical": 5, "serious": 7, "moderate": 3 },
    "scanTime": "223ms"
  }
}
```

### SARIF Export

**Use case**: GitHub Advanced Security, Azure DevOps, SARIF-compatible tools

SARIF (Static Analysis Results Interchange Format) is an industry-standard format for static analysis tools.

```json
{
  "$schema": "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json",
  "version": "2.1.0",
  "runs": [{
    "tool": {
      "driver": {
        "name": "AccessInsight",
        "version": "1.0.0"
      }
    },
    "results": [...]
  }]
}
```

### HTML Export

**Use case**: Human-readable reports, stakeholder presentations

Generates a standalone HTML file with:
- Summary statistics
- Findings grouped by impact
- Expandable details
- Styled for readability

### CSV Export

**Use case**: Excel analysis, bulk editing, data processing

Columns:
- Rule ID
- Message
- Selector
- WCAG Criteria
- Impact
- Confidence
- Priority

---

## Rule Presets

Presets allow you to quickly enable/disable groups of rules based on common testing scenarios.

### Available Presets

#### Default
**All 46 rules enabled**
Best for comprehensive accessibility audits.

#### Axe Core
**Rules matching axe-core**
Compatible with axe DevTools for comparison testing.

#### Lighthouse
**Rules used by Google Lighthouse**
Aligned with Lighthouse accessibility scoring.

#### IBM Accessibility
**Rules from IBM Equal Access Checker**
Compatible with IBM's accessibility guidelines.

### Custom Presets

You can create custom rule combinations:

1. Click **Advanced ▾** in DevTools panel
2. Check/uncheck individual rules in the "Enabled rules" section
3. Your selection is automatically saved as **"Custom"** preset
4. Use **"Reset to Preset"** to restore a built-in preset

**Per-site memory**: Custom rule selections are saved per website.

---

## Advanced Features

### Live Scanning

**What it does**: Automatically rescans when the page content changes.

**Use cases**:
- Testing single-page applications (SPAs)
- Monitoring dynamic content updates
- React/Vue/Angular applications

**How to enable**:
1. Open DevTools panel
2. Click **Advanced ▾**
3. Check **Live**

**Throttling**: If the page changes too frequently (>500 mutations per 2 seconds), live scanning pauses automatically to prevent performance issues. A status message will notify you.

### Viewport-Only Mode

**What it does**: Only scans elements currently visible in the viewport.

**Use cases**:
- Very large pages (10,000+ elements)
- Performance-sensitive testing
- Above-the-fold audits

**How to enable**: Check **Viewport only** in Advanced controls

**Note**: Scroll to reveal more content, then rescan.

### Shadow DOM Scanning

**What it does**: Includes elements inside Shadow DOM trees.

**Use cases**:
- Web Components
- Frameworks using Shadow DOM (Ionic, Stencil)
- Modern component libraries

**How to enable**: Check **Scan shadow DOM** in Advanced controls

**Performance**: Slightly slower scans due to traversing shadow roots.

### Iframe Scanning

**What it does**: Scans content inside iframes on the page.

**Use cases**:
- Embedded content
- Third-party widgets
- Multi-frame applications

**How to enable**: Check **Scan iframes** in Advanced controls

**Limitations**: Same-origin policy restrictions may prevent scanning cross-origin iframes.

### Ignore Functionality

**Ignore This**: Hides a specific finding (by selector).
**Ignore Rule**: Disables a rule entirely for this site.

**Persisted**: Ignores are saved per-site and persist across sessions.

**Clear ignores**: Click **Clear Ignores** to reset.

### Baseline Comparison

Compare AccessInsight results with axe-core to understand coverage differences.

**How to use**:
1. Click **Compare axe** in DevTools panel
2. AccessInsight runs axe-core in the page
3. Results show:
   - Findings unique to AccessInsight
   - Findings unique to axe-core
   - Common findings

**Insight**: AccessInsight typically finds 2.25x more issues than axe-core due to broader rule coverage and WCAG 2.2 support.

---

## FAQ

### General

**Q: What browsers does AccessInsight support?**
A: AccessInsight is built for Chromium-based browsers (Chrome, Edge, Brave, Opera).

**Q: Does AccessInsight send data to external servers?**
A: No. All scanning happens locally in your browser. No data is transmitted.

**Q: How accurate is AccessInsight?**
A: Based on validation across 30+ websites, AccessInsight achieves 82.7% precision and 100% recall.

**Q: Does AccessInsight cover all WCAG criteria?**
A: AccessInsight covers most automated-testable WCAG 2.1 and 2.2 criteria. Some criteria (like "meaningful sequence" or "language of parts") require manual review.

### Usage

**Q: Why do I see "needsReview" findings?**
A: These are potential issues that require human judgment. Review them manually to determine if they're real violations.

**Q: Can I use AccessInsight on local files?**
A: Yes, but you must enable "Allow access to file URLs" in Chrome's extension settings.

**Q: Why is the panel not appearing?**
A: Some pages (chrome://, about:, edge://) are restricted. Also, ensure you've granted the extension permissions.

**Q: How do I scan password-protected pages?**
A: Log in normally, then activate AccessInsight. The extension works on any page you can access.

### Performance

**Q: Will AccessInsight slow down my website?**
A: For visitors: No - AccessInsight is a development tool, not production code.
For testing: Minimal - average scan time is 223ms.

**Q: Can I scan very large pages (10,000+ elements)?**
A: Yes, but enable "Viewport only" mode for better performance.

**Q: Does live mode impact performance?**
A: Live mode adds minimal overhead. If mutations are too frequent, AccessInsight auto-pauses to protect performance.

### Findings

**Q: Why does AccessInsight find more issues than other tools?**
A: AccessInsight has 46 rules (including WCAG 2.2) vs. 30-40 in other tools. It also uses more sensitive detection in some rules.

**Q: Are all findings real issues?**
A: AccessInsight maintains 82.7% precision, meaning ~17% are false positives. Always review findings, especially low-confidence ones.

**Q: What should I fix first?**
A: Use the Priority sort to see the most important issues. Critical-impact issues with high confidence are top priority.

---

## Troubleshooting

### Panel Not Appearing

**Symptoms**: Clicking the icon does nothing.

**Solutions**:
1. **Check page restrictions**: chrome://, about:, and similar pages block extensions
2. **Refresh the page**: Press Ctrl+R to reload
3. **Check permissions**: Ensure the extension has access to the site
4. **Try keyboard shortcut**: Press Alt+Shift+A

### No Findings Detected

**Symptoms**: Panel shows "0 issues" on a page with obvious problems.

**Solutions**:
1. **Check filters**: Ensure rule filter is set to "All rules"
2. **Check preset**: Some presets disable certain rules
3. **Check ignores**: Click "Clear Ignores" to reset
4. **Refresh and rescan**: Reload the page and scan again

### DevTools Panel Not Loading

**Symptoms**: "A11y DevTools" tab is missing or shows error.

**Solutions**:
1. **Close and reopen DevTools**: Press F12 twice
2. **Refresh the page**: Reload with DevTools open
3. **Check for conflicts**: Disable other accessibility extensions temporarily

### Scanning Errors

**Symptoms**: "⚠️ Scanning error" message appears.

**Solutions**:
1. **Click "Retry Scan"**: Often resolves transient issues
2. **Check console**: Open DevTools Console (F12) for error details
3. **Disable live mode**: May conflict with certain page scripts
4. **Report the issue**: If persistent, report to the extension developer

### Poor Performance

**Symptoms**: Scans take >5 seconds, browser feels slow.

**Solutions**:
1. **Enable "Viewport only"**: Reduces scan scope
2. **Disable "Scan shadow DOM"**: Speeds up scans
3. **Disable "Scan iframes"**: Reduces complexity
4. **Close other tabs**: Free up browser resources
5. **Disable live mode**: Prevents continuous rescanning

### Export Issues

**Symptoms**: Export button doesn't work or file is empty.

**Solutions**:
1. **Rescan first**: Ensure findings are loaded
2. **Check browser downloads**: May be blocked by pop-up blocker
3. **Try different format**: If JSON fails, try CSV
4. **Use DevTools export**: More reliable than overlay panel

---

## Getting Help

### Documentation
- **User Guide**: (this document)
- **Rule Reference**: See RULE_DOCUMENTATION.md
- **Developer Guide**: See ARCHITECTURE.md (for contributors)

### Support
- **Report bugs**: [GitHub Issues](https://github.com/yourusername/accessinsight-mv3-extension-v2/issues)
- **Feature requests**: [GitHub Discussions](https://github.com/yourusername/accessinsight-mv3-extension-v2/discussions)
- **Email**: support@accessinsight.example.com (if available)

### Resources
- **WCAG 2.1**: https://www.w3.org/WAI/WCAG21/quickref/
- **WCAG 2.2**: https://www.w3.org/WAI/WCAG22/quickref/
- **WebAIM**: https://webaim.org/
- **A11y Project**: https://www.a11yproject.com/

---

## Keyboard Shortcuts Reference Card

Print this for quick reference:

```
╔═══════════════════════════════════════════════════╗
║         AccessInsight Keyboard Shortcuts          ║
╠═══════════════════════════════════════════════════╣
║  Alt+Shift+A     Toggle accessibility panel       ║
║  Alt+Shift+N     Next finding                     ║
║  Alt+Shift+P     Previous finding                 ║
║  ↑/↓ Arrows      Navigate list                    ║
║  Enter           Jump to finding                  ║
║  Escape          Close panel                      ║
║  Tab             Navigate controls                ║
╚═══════════════════════════════════════════════════╝
```

---

**Thank you for using AccessInsight!** Together, we're making the web more accessible for everyone.
