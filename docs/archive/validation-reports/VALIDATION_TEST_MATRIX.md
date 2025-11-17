# Validation Test Matrix - Known Accessibility Issues

**Purpose**: Compare AccessInsight detection against documented issues on intentionally inaccessible demo sites.

**Date**: 2025-11-07

---

## Test Site 1: Accessible University (Inaccessible Version) ⭐

**URL**: `https://www.washington.edu/accesscomputing/AU/before.html`
**Alternative URL**: `https://openassessittoolkit.github.io/accessible_u/before_u.html`

### Documented Issues: 22 Total

#### Structure & Semantics (WCAG 1.3.1, 2.4.1, 2.4.6)
| # | Issue | WCAG | AccessInsight Rule |
|---|-------|------|-------------------|
| 1 | Missing landmark regions (header, main, footer) | 1.3.1 | `landmarks` |
| 2 | No headings / Improper heading markup | 2.4.6 | `headings-order`, `document-title` |
| 3 | Language not specified (`lang` attribute) | 3.1.1 | `html-lang` |
| 10 | No "skip to main content" link | 2.4.1 | `bypass-blocks`, `skip-link` |

#### Images (WCAG 1.1.1)
| # | Issue | WCAG | AccessInsight Rule |
|---|-------|------|-------------------|
| 4 | No alternate text on informative images | 1.1.1 | `img-alt` |
| 5 | Missing/excessive alt text on decorative images | 1.1.1 | `img-alt` |
| 6 | Images containing text (text in images) | 1.1.1 | `img-alt` (evidence may note) |

#### Color & Contrast (WCAG 1.4.1, 1.4.3)
| # | Issue | WCAG | AccessInsight Rule |
|---|-------|------|-------------------|
| 7 | Insufficient color contrast (navigation menu) | 1.4.3 | `contrast-text` |
| 8 | Color used to communicate information (alone) | 1.4.1 | ⚠️ Not directly tested |
| 11 | Color-only information (links, required fields) | 1.4.1 | ⚠️ Not directly tested |

#### Keyboard & Focus (WCAG 2.1.1, 2.4.7)
| # | Issue | WCAG | AccessInsight Rule |
|---|-------|------|-------------------|
| 9 | Inaccessible keyboard interface | 2.1.1 | `keyboard-focus` |
| 10 | No visible indication of focus | 2.4.7 | `focus-visible`, `focus-appearance` |

#### Links & Navigation (WCAG 2.4.4, 4.1.2)
| # | Issue | WCAG | AccessInsight Rule |
|---|-------|------|-------------------|
| 12 | Redundant, uninformative link text ("click here") | 2.4.4 | `link-purpose`, `link-name` |
| 13 | Links vs buttons (semantic misuse) | 4.1.2 | `button-name`, `link-name` |
| 14 | Inaccessible navigation menu | 4.1.2 | `aria-role-valid`, `name-role-value` |
| 15 | Inaccessible dropdown menus (mouse-only) | 2.1.1 | `keyboard-focus` |

#### Interactive Widgets (WCAG 2.1.1, 4.1.2)
| # | Issue | WCAG | AccessInsight Rule |
|---|-------|------|-------------------|
| 16 | Inaccessible carousel (keyboard, screen reader) | 2.1.1, 4.1.2 | `keyboard-focus`, `button-name` |
| 17 | Inaccessible modal dialog (focus trap) | 2.1.1, 4.1.2 | `keyboard-focus`, `aria-role-valid` |

#### Forms (WCAG 1.3.1, 3.3.1, 3.3.2)
| # | Issue | WCAG | AccessInsight Rule |
|---|-------|------|-------------------|
| 18 | Form not properly labeled | 1.3.1 | `label-control` |
| 19 | Inaccessible CAPTCHA | 1.1.1 | `img-alt` |
| 20 | Inaccessible input validation | 3.3.1 | ⚠️ Not directly tested |

#### Tables & Structure (WCAG 1.3.1)
| # | Issue | WCAG | AccessInsight Rule |
|---|-------|------|-------------------|
| 21 | Missing accessible table markup | 1.3.1 | `table-headers` (if implemented) |
| 22 | Missing abbreviation tags (`<abbr>`) | 3.1.4 | ⚠️ Not directly tested |

#### Multimedia (WCAG 1.2.1, 1.2.2)
| # | Issue | WCAG | AccessInsight Rule |
|---|-------|------|-------------------|
| 23 | Inaccessible audio content (no captions) | 1.2.2 | `audio-video-alternatives` |
| 24 | Inaccessible visual content (no descriptions) | 1.2.3 | `audio-video-alternatives` |

### Expected Detection Rate
**Total Issues**: 22-24
**Covered by AccessInsight Rules**: ~15-18 (68-75%)
**Uncovered** (manual testing required):
- Color-only information
- CAPTCHA alternatives
- Form validation messaging
- Abbreviation markup
- Specific multimedia transcripts

---

## Test Site 2: GOV.UK Accessibility Tool Audit

**URL**: `https://alphagov.github.io/accessibility-tool-audit/test-cases.html`

### Documented Issues: 19+ Categories

#### Content & Structure
| Issue | WCAG | AccessInsight Rule |
|-------|------|-------------------|
| Content identified by location only | 1.3.1 | ⚠️ Manual verification |
| Incorrect source code reading order | 1.3.2 | ⚠️ Not directly tested |
| Missing heading hierarchies | 2.4.6 | `headings-order` |
| Missing lang attributes | 3.1.1 | `html-lang`, `html-lang-valid` |

#### Visual Design
| Issue | WCAG | AccessInsight Rule |
|-------|------|-------------------|
| Color contrast failures (AA/AAA) | 1.4.3 | `contrast-text` |
| Colour alone conveys content | 1.4.1 | ⚠️ Not directly tested |
| Missing focus indicators | 2.4.7 | `focus-visible`, `focus-appearance` |
| Inadequate line spacing (<1.5) | 1.4.12 | `text-spacing` |

#### Typography
| Issue | WCAG | AccessInsight Rule |
|-------|------|-------------------|
| All-caps text (screen reader issues) | ⚠️ Best practice | ⚠️ Not tested |
| Justified text (spacing issues) | 1.4.8 | ⚠️ Not tested |
| Lines exceeding 80 characters | 1.4.8 | `reflow` |
| Italicized long passages | ⚠️ Best practice | ⚠️ Not tested |

#### Images & Media
| Issue | WCAG | AccessInsight Rule |
|-------|------|-------------------|
| Missing or empty alt attributes | 1.1.1 | `img-alt` |
| Mismatched alt/title attributes | 1.1.1 | `img-alt` |
| Background images with no alternatives | 1.1.1 | ⚠️ Limited detection |
| Animated GIFs without transcripts | 1.2.1 | `audio-video-alternatives` |

#### Forms & Interaction
| Issue | WCAG | AccessInsight Rule |
|-------|------|-------------------|
| Errors identified by colour only | 3.3.1 | ⚠️ Not directly tested |
| Missing form labels | 1.3.1 | `label-control` |
| Missing fieldset legends | 1.3.1 | ⚠️ Not directly tested |
| Inadequate clickable target sizes | 2.5.5 | `target-size` |
| Context changes on input | 3.2.2 | ⚠️ Not directly tested |

#### Keyboard Access
| Issue | WCAG | AccessInsight Rule |
|-------|------|-------------------|
| Keyboard trap scenarios | 2.1.2 | `keyboard-focus` |
| Missing focus in modals | 2.4.3 | `focus-order` |
| Tabindex > 0 | 2.4.3 | `focus-order` |
| Inaccessible dropdown navigation | 2.1.1 | `keyboard-focus` |

#### Code Quality
| Issue | WCAG | AccessInsight Rule |
|-------|------|-------------------|
| Duplicate IDs | 4.1.1 | `parsing` |
| Deprecated elements (`<center>`, `<font>`) | 4.1.1 | `parsing` |
| Invalid ARIA role names | 4.1.2 | `aria-role-valid` |
| Unmatched HTML tags | 4.1.1 | `parsing` |

### Expected Detection Rate
**Total Categories**: 19+
**Covered by AccessInsight**: ~12-14 (63-74%)
**Uncovered**:
- Typography issues (all-caps, justification)
- Color-only communication
- Form error presentation
- Context changes

---

## Test Site 3: Deque Mars Commuter Demo

**URL**: `https://dequeuniversity.com/demo/mars/`

### Documented Issues: 15+ Categories

#### Visual & Contrast
| Issue | WCAG | AccessInsight Rule |
|-------|------|-------------------|
| Low contrast text (#acbad0 on dark) | 1.4.3 | `contrast-text` |
| Insufficient contrast in navigation | 1.4.3 | `contrast-text` |

#### Images
| Issue | WCAG | AccessInsight Rule |
|-------|------|-------------------|
| Images lack alt text (logo, decorative) | 1.1.1 | `img-alt` |
| Chart/graphic images without alternatives | 1.1.1 | `img-alt` |
| Text in images without descriptions | 1.1.1 | `img-alt` |

#### Forms
| Issue | WCAG | AccessInsight Rule |
|-------|------|-------------------|
| Form fields lack associated labels | 1.3.1 | `label-control` |
| Placeholder text instead of labels | 1.3.1 | `label-control` |
| Missing fieldset/legend | 1.3.1 | ⚠️ Not directly tested |
| Dropdown menus without labels | 4.1.2 | `control-name` |

#### Navigation & Structure
| Issue | WCAG | AccessInsight Rule |
|-------|------|-------------------|
| Missing landmark regions | 1.3.1 | `landmarks` |
| Unclear link purposes | 2.4.4 | `link-purpose` |
| Redundant navigation without skip links | 2.4.1 | `bypass-blocks` |
| Improper heading hierarchy | 2.4.6 | `headings-order` |

#### Semantic HTML
| Issue | WCAG | AccessInsight Rule |
|-------|------|-------------------|
| Divs/spans instead of semantic elements | 1.3.1 | ⚠️ Not directly tested |
| Missing ARIA labels | 4.1.2 | `aria-required-attr`, `name-role-value` |

#### Interactive Elements
| Issue | WCAG | AccessInsight Rule |
|-------|------|-------------------|
| Calendar icon buttons lack names | 4.1.2 | `button-name` |
| No keyboard navigation indicators | 2.4.7 | `focus-visible` |
| Missing focus management | 2.4.3 | `focus-order` |

#### Content
| Issue | WCAG | AccessInsight Rule |
|-------|------|-------------------|
| Flashing elements without pause | 2.2.2 | ⚠️ Not directly tested |
| YouTube videos without titles | 4.1.2 | ⚠️ Not directly tested |

### Expected Detection Rate
**Total Issues**: 15+
**Covered by AccessInsight**: ~10-12 (67-80%)
**Uncovered**:
- Fieldset/legend issues
- Semantic HTML choices
- Animation controls
- Video metadata

---

## Validation Testing Checklist

### For Each Test Site:

```
Site: _______________

1. Load in Chrome with AccessInsight
2. Run scan (automatic or click icon)
3. Record findings count: _____
4. Export findings to JSON
5. Compare against known issues above

Detection Analysis:
✓ True Positives Detected: ____ / ____
✓ False Negatives (Missed): ____ / ____
⚠️ False Positives (Incorrect): ____
📝 Notes on detection quality:
___________________________________
```

### Coverage Calculation:

```
Coverage % = (Issues Detected) / (Total Known Issues) × 100

Target: ≥ 70% coverage on each site
Expected: 65-80% based on rule set
```

---

## AccessInsight Rule Coverage Summary

### High Coverage Categories:
- ✅ Images (img-alt)
- ✅ Color contrast (contrast-text)
- ✅ Form labels (label-control)
- ✅ Headings (headings-order)
- ✅ ARIA (aria-role-valid, aria-required-attr)
- ✅ Focus (focus-visible, focus-appearance)
- ✅ Landmarks (landmarks)
- ✅ Buttons (button-name)
- ✅ Links (link-name, link-purpose)

### Limited/No Coverage:
- ⚠️ Color-only communication (1.4.1)
- ⚠️ Form validation messaging (3.3.1)
- ⚠️ Fieldset/legend (1.3.1)
- ⚠️ Typography (text justification, all-caps)
- ⚠️ Animation controls (2.2.2)
- ⚠️ Context changes (3.2.2)
- ⚠️ Specific semantic HTML choices

### Rules Requiring Manual Review:
- needsReview flag indicates automated detection limitations
- Manual validation needed for:
  - Meaningful alt text quality
  - Link purpose clarity
  - ARIA label appropriateness
  - Focus order logic

---

## Expected Overall Results

### Accessible University:
- **Known Issues**: 22-24
- **Expected Detection**: 15-18 (68-75%)
- **Key Detections**: img-alt, contrast-text, label-control, headings-order, landmarks

### GOV.UK Test Cases:
- **Known Categories**: 19+
- **Expected Detection**: 12-14 (63-74%)
- **Key Detections**: contrast-text, img-alt, label-control, aria-role-valid, target-size

### Deque Mars Demo:
- **Known Issues**: 15+
- **Expected Detection**: 10-12 (67-80%)
- **Key Detections**: contrast-text, img-alt, label-control, button-name, landmarks

---

## Success Criteria

**Pass Validation If**:
- ✅ Detection rate ≥ 65% on all three sites
- ✅ All high-impact rules detect correctly (img-alt, contrast, labels)
- ✅ False positive rate ≤ 20% (consistent with Phase 8: 17.3%)
- ✅ No crashes or errors during scanning
- ✅ Findings are accurate and actionable

**Fail Validation If**:
- ❌ Detection rate < 50% on any site
- ❌ Critical rules missing obvious issues (img-alt, contrast)
- ❌ False positive rate > 30%
- ❌ Extension crashes or fails to scan
- ❌ Findings are nonsensical or incorrect

---

**Created**: 2025-11-07
**Purpose**: Pre-merge validation testing guide
**Status**: Ready for testing
