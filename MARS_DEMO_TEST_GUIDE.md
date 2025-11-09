# Deque Mars Commuter Demo - Testing Guide

**Test URL**: https://dequeuniversity.com/demo/mars/
**Extension Version**: v1.0.0
**Purpose**: Validate detection against 15+ documented accessibility issues

---

## Pre-Test Checklist

Before loading the site, verify your DevTools panel settings:

### Required Settings
- ✅ **Preset**: Default (all 46 rules enabled)
- ✅ **Viewport only**: UNCHECKED (scan full page)
- ✅ **Scan shadow DOM**: CHECKED (if available)
- ✅ **Scan iframes**: CHECKED (if available)
- ✅ **Hide needsReview**: UNCHECKED (show all findings)

### Console Check
1. Open Chrome DevTools → Console tab
2. Look for any error messages
3. Should see: "A11y engine loaded" or similar

---

## Testing Steps

1. **Load Extension**
   ```
   chrome://extensions/ → Load unpacked → Select repo directory
   ```

2. **Navigate to Test Site**
   ```
   https://dequeuniversity.com/demo/mars/
   ```

3. **Open DevTools Panel**
   ```
   F12 → A11y DevTools tab
   ```

4. **Verify Settings** (see checklist above)

5. **Run Scan**
   - Click "Rescan" button
   - Wait for scan to complete
   - Note: Demo site is interactive, may take 15-40 seconds

6. **Review Results**
   - Note total findings count
   - Review by category/rule
   - Check for false positives

7. **Export Results**
   ```
   Advanced → Download CSV
   ```

---

## Expected Issues (15+ Categories)

### Visual & Contrast (2 issues)

| Issue | WCAG | Expected Detection |
|-------|------|-------------------|
| Low contrast text (#acbad0 on dark) | 1.4.3 | ✅ `contrast-text` |
| Insufficient contrast in navigation | 1.4.3 | ✅ `contrast-text` |

**Expected Detection**: 2 of 2 ✅

### Images (3 issues)

| Issue | WCAG | Expected Detection |
|-------|------|-------------------|
| Images lack alt text (logo, decorative) | 1.1.1 | ✅ `img-alt` |
| Chart/graphic images without alternatives | 1.1.1 | ✅ `img-alt` |
| Text in images without descriptions | 1.1.1 | ⚠️ `img-alt` (may detect missing alt) |

**Expected Detection**: 2-3 of 3

### Forms (4 issues)

| Issue | WCAG | Expected Detection |
|-------|------|-------------------|
| Form fields lack associated labels | 1.3.1 | ✅ `label-control` |
| Placeholder text instead of labels | 1.3.1 | ✅ `label-control` |
| Missing fieldset/legend | 1.3.1 | ⚠️ Not directly tested |
| Dropdown menus without labels | 4.1.2 | ✅ `control-name` |

**Expected Detection**: 3 of 4

### Navigation & Structure (4 issues)

| Issue | WCAG | Expected Detection |
|-------|------|-------------------|
| Missing landmark regions | 1.3.1 | ✅ `landmarks` |
| Unclear link purposes | 2.4.4 | ✅ `link-purpose` |
| Redundant navigation without skip links | 2.4.1 | ✅ `bypass-blocks` |
| Improper heading hierarchy | 2.4.6 | ✅ `headings-order` |

**Expected Detection**: 4 of 4 ✅

### Semantic HTML (2 issues)

| Issue | WCAG | Expected Detection |
|-------|------|-------------------|
| Divs/spans instead of semantic elements | 1.3.1 | ⚠️ Not directly tested |
| Missing ARIA labels | 4.1.2 | ✅ `aria-required-attr`, `name-role-value` |

**Expected Detection**: 1 of 2

### Interactive Elements (3 issues)

| Issue | WCAG | Expected Detection |
|-------|------|-------------------|
| Calendar icon buttons lack names | 4.1.2 | ✅ `button-name` |
| No keyboard navigation indicators | 2.4.7 | ✅ `focus-visible` |
| Missing focus management | 2.4.3 | ✅ `focus-order` |

**Expected Detection**: 3 of 3 ✅

### Content (2 issues)

| Issue | WCAG | Expected Detection |
|-------|------|-------------------|
| Flashing elements without pause | 2.2.2 | ⚠️ Not directly tested |
| YouTube videos without titles | 4.1.2 | ⚠️ Not directly tested |

**Expected Detection**: 0 of 2

---

## Overall Expected Detection

**Total Issues**: 15+
**Expected Detection**: 10-12 (67-80%)

### By Category:
- **High Confidence (100%)**: Navigation (4/4), Interactive (3/3), Contrast (2/2)
- **Good (75%+)**: Forms (3/4), Images (2-3/3)
- **Limited (50%)**: Semantic HTML (1/2)
- **Not Covered**: Content (0/2)

**Strong categories**: Structure, navigation, forms, contrast
**Weak categories**: Multimedia, semantic HTML choices

---

## Success Criteria

### ✅ PASS if:
- Detection rate ≥ 65% (10+ of 15 issues)
- Navigation & structure: 100% detected (landmarks, headings, skip links, link purpose)
- Interactive elements: 100% detected (button names, focus)
- Contrast issues detected
- Form label issues detected

### ❌ FAIL if:
- Detection rate < 60% (less than 9 issues)
- Navigation issues missed
- Form label issues missed
- Contrast issues missed
- Extension crashes

---

## Known Site Characteristics

**Mars Commuter Demo** is Deque University's training example:

- Interactive booking form
- Calendar widget
- Navigation menus
- Media elements (YouTube embeds)
- Charts and graphics
- Real-world complexity

**Expected Total Findings**: 30-60+

This includes:
- Core 15 documented issues
- Multiple instances per issue type
- WCAG 2.2 bonus findings (target-size)
- AAA-level enhancements
- Best practice violations

---

## Post-Test Analysis

After exporting CSV, analyze:

1. **Detection by Category**
   - How many of 15+ issues detected?
   - All navigation/structure issues found?

2. **Form Analysis**
   - Calendar widget: button names detected?
   - Date inputs: labels detected?
   - Dropdown menus: accessible names found?

3. **Rule Performance**
   - Most common findings?
   - Any surprising gaps?

4. **False Positives**
   - Are all findings valid?
   - Estimate FP rate

5. **Bonus Coverage**
   - WCAG 2.2 findings? (target-size, auth)
   - AAA-level thoroughness?

---

## Special Test Cases

### Calendar Widget
The booking calendar is a key test of:
- Button names (`button-name` rule)
- ARIA labels (`aria-required-attr`)
- Keyboard navigation (`keyboard-focus`)
- Focus indicators (`focus-visible`)

**Expected**: Multiple findings for unnamed date buttons

### Navigation Menu
Tests:
- Landmark regions (`landmarks`)
- Skip links (`bypass-blocks`)
- Link purposes (`link-purpose`)

**Expected**: Missing skip link, possibly landmark issues

### Form Fields
The booking form tests:
- Input labels (`label-control`)
- Placeholder misuse
- Required field indicators

**Expected**: Multiple unlabeled inputs

---

## Troubleshooting

### If findings count is very low (< 15):
1. Check "Viewport only" is UNCHECKED
2. Scroll page to trigger lazy-loaded content
3. Verify all 46 rules enabled
4. Check Console for errors
5. Try "Rescan" after page fully loads

### If interactive elements not scanned:
- Calendar may load dynamically
- Wait for full page load (10-15 seconds)
- Look for "Scan complete" status
- Check if iframes are scanned

### If contrast issues not detected:
- Verify `contrast-text` rule is enabled
- Check Advanced → Enabled rules list
- Contrast may vary by viewport size
- Try rescanning

---

## Comparison Across Sites

After testing all three validation sites:

| Site | Known Issues | Expected Detection | Actual | Rate |
|------|--------------|-------------------|--------|------|
| Accessible University | 22 | 15-18 (68-75%) | 77 total | 68-73% ✅ |
| GOV.UK Test Cases | 19 | 12-14 (63-74%) | ___ | ___% |
| Mars Demo | 15+ | 10-12 (67-80%) | ___ | ___% |

**Target**: All three sites ≥ 65% detection rate
**Stretch**: Average detection rate ≥ 70%

---

## Next Steps After Testing

1. Save CSV export as `mars-demo-results.csv`
2. Note total findings count
3. Create final validation summary comparing all three sites
4. Make merge decision based on overall validation performance
5. Proceed to production merge if validation successful

---

**Created**: 2025-11-08
**Purpose**: Validation testing guide for Deque Mars Demo
**Status**: Ready for testing
