# GOV.UK Accessibility Tool Audit - Testing Guide

**Test URL**: https://alphagov.github.io/accessibility-tool-audit/test-cases.html
**Extension Version**: v1.0.0
**Purpose**: Validate detection against 19+ documented accessibility issue categories

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
   https://alphagov.github.io/accessibility-tool-audit/test-cases.html
   ```

3. **Open DevTools Panel**
   ```
   F12 → A11y DevTools tab
   ```

4. **Verify Settings** (see checklist above)

5. **Run Scan**
   - Click "Rescan" button
   - Wait for scan to complete
   - Note: May take 10-30 seconds for comprehensive scan

6. **Review Results**
   - Note total findings count
   - Review by category/rule
   - Check for false positives

7. **Export Results**
   ```
   Advanced → Download CSV
   ```

---

## Expected Issues (19+ Categories)

### Content & Structure (4 categories)

| Issue | WCAG | Expected Detection |
|-------|------|-------------------|
| Content identified by location only | 1.3.1 | ⚠️ Manual verification |
| Incorrect source code reading order | 1.3.2 | ⚠️ Not directly tested |
| Missing heading hierarchies | 2.4.6 | ✅ `headings-order` |
| Missing lang attributes | 3.1.1 | ✅ `html-lang`, `html-lang-valid` |

**Expected Detection**: 2 of 4

### Visual Design (4 categories)

| Issue | WCAG | Expected Detection |
|-------|------|-------------------|
| Color contrast failures (AA/AAA) | 1.4.3 | ✅ `contrast-text` |
| Colour alone conveys content | 1.4.1 | ⚠️ Not directly tested |
| Missing focus indicators | 2.4.7 | ✅ `focus-visible`, `focus-appearance` |
| Inadequate line spacing (<1.5) | 1.4.12 | ✅ `text-spacing` |

**Expected Detection**: 3 of 4

### Typography (4 categories)

| Issue | WCAG | Expected Detection |
|-------|------|-------------------|
| All-caps text | Best practice | ⚠️ Not tested |
| Justified text | 1.4.8 | ⚠️ Not tested |
| Lines exceeding 80 characters | 1.4.8 | ✅ `reflow` (possibly) |
| Italicized long passages | Best practice | ⚠️ Not tested |

**Expected Detection**: 0-1 of 4

### Images & Media (4 categories)

| Issue | WCAG | Expected Detection |
|-------|------|-------------------|
| Missing or empty alt attributes | 1.1.1 | ✅ `img-alt` |
| Mismatched alt/title attributes | 1.1.1 | ✅ `img-alt` |
| Background images with no alternatives | 1.1.1 | ⚠️ Limited detection |
| Animated GIFs without transcripts | 1.2.1 | ✅ `audio-video-alternatives` |

**Expected Detection**: 2-3 of 4

### Forms & Interaction (5 categories)

| Issue | WCAG | Expected Detection |
|-------|------|-------------------|
| Errors identified by colour only | 3.3.1 | ⚠️ Not directly tested |
| Missing form labels | 1.3.1 | ✅ `label-control` |
| Missing fieldset legends | 1.3.1 | ⚠️ Not directly tested |
| Inadequate clickable target sizes | 2.5.5 | ✅ `target-size` |
| Context changes on input | 3.2.2 | ⚠️ Not directly tested |

**Expected Detection**: 2 of 5

### Keyboard Access (4 categories)

| Issue | WCAG | Expected Detection |
|-------|------|-------------------|
| Keyboard trap scenarios | 2.1.2 | ✅ `keyboard-focus` (possibly) |
| Missing focus in modals | 2.4.3 | ✅ `focus-order` |
| Tabindex > 0 | 2.4.3 | ✅ `focus-order` |
| Inaccessible dropdown navigation | 2.1.1 | ✅ `keyboard-focus` (possibly) |

**Expected Detection**: 2-4 of 4

### Code Quality (4 categories)

| Issue | WCAG | Expected Detection |
|-------|------|-------------------|
| Duplicate IDs | 4.1.1 | ✅ `parsing` |
| Deprecated elements (`<center>`, `<font>`) | 4.1.1 | ✅ `parsing` |
| Invalid ARIA role names | 4.1.2 | ✅ `aria-role-valid` |
| Unmatched HTML tags | 4.1.1 | ✅ `parsing` |

**Expected Detection**: 4 of 4

---

## Overall Expected Detection

**Total Categories**: 19+
**Expected Detection**: 12-14 categories (63-74%)
**High Confidence**: Code quality (4/4), Images (2-3/4), Visual design (3/4)
**Limited Coverage**: Typography (0-1/4), Color communication (0/1)

---

## Success Criteria

### ✅ PASS if:
- Detection rate ≥ 60% (12+ of 19 categories)
- All code quality issues detected (duplicate IDs, ARIA, parsing)
- High-impact issues detected (contrast, img-alt, labels)
- No crashes or errors

### ❌ FAIL if:
- Detection rate < 50% (less than 10 categories)
- Code quality issues missed
- Critical issues missed (img-alt, contrast)
- Extension crashes

---

## Post-Test Analysis

After exporting CSV, analyze:

1. **Detection by Category**
   - Count how many of the 19 categories were detected
   - Note which high-priority categories were found

2. **Rule Performance**
   - Which rules triggered most often?
   - Any unexpected rules triggering?

3. **False Positives**
   - Are all findings valid?
   - Estimate FP rate

4. **Bonus Findings**
   - Any WCAG 2.2 issues found? (target-size, auth, focus-not-obscured)
   - AAA-level findings?

---

## Known Site Characteristics

**GOV.UK Test Cases** is intentionally designed to test accessibility tools:

- Contains examples of each issue type
- May have multiple instances per category
- Includes both obvious and subtle violations
- Tests edge cases and corner scenarios
- May include inaccessible iframes

**Expected Total Findings**: 40-80+ (similar to Accessible University)

This is normal - the site contains:
- Documented test cases (19 categories)
- Multiple instances per category
- WCAG 2.2 issues (bonus detections)
- AAA-level issues (bonus detections)

---

## Troubleshooting

### If findings count is very low (< 10):
1. Check "Viewport only" is UNCHECKED
2. Verify all 46 rules enabled (Advanced → Enabled rules)
3. Check Console for errors
4. Try "Rescan" button
5. Reload page and extension

### If scan takes very long (> 60 seconds):
- This is normal for complex pages
- GOV.UK test cases may have many elements
- Wait for completion
- Check Console for progress

### If extension doesn't load:
1. Verify correct branch: `git branch` should show `claude/phase-8-real-world-validation-011CUtjBDVesJ55BdhXGShpG`
2. Check manifest version: `cat manifest.json | grep version` should show `"version": "1.0.0"`
3. Reload extension: chrome://extensions/ → Reload
4. Hard refresh page: Ctrl+Shift+R

---

## Next Steps After Testing

1. Save CSV export as `govuk-test-results.csv`
2. Note total findings count
3. Proceed to third validation site (Deque Mars Demo)
4. Compare results across all three sites
5. Create final validation summary

---

**Created**: 2025-11-08
**Purpose**: Validation testing guide for GOV.UK Test Cases
**Status**: Ready for testing
