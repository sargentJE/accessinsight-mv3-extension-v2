# Manual Validation Guide

## Overview

Manual validation is the process of reviewing AccessInsight findings to determine if they are correct (true positives) or incorrect (false positives). This human review is critical for:

1. **Measuring Accuracy**: Calculate precision, recall, and F1 scores
2. **Identifying Patterns**: Find systematic false positive patterns
3. **Tuning Confidence**: Adjust confidence levels based on actual precision
4. **Improving Rules**: Guide rule logic improvements

**Time Investment**: ~30-60 seconds per finding
**Recommended Batch Size**: 50-100 findings per session
**Minimum Sample**: 50 validated findings for statistical significance

---

## Classification Types

### True Positive (TP)

**Definition**: The finding correctly identifies an actual accessibility issue.

**When to use**:
- The accessibility issue genuinely exists
- The element truly violates WCAG criteria
- A user with a disability would encounter problems
- The issue should be fixed by the website developer

**Examples**:

1. **Image without alt text**:
   ```html
   <img src="logo.png">
   ```
   - **Classification**: `true_positive`
   - **Reason**: Image missing required alt attribute (WCAG 1.1.1)

2. **Low contrast text**:
   ```html
   <div style="color: #777; background: #999;">Text</div>
   ```
   - **Classification**: `true_positive`
   - **Reason**: Contrast ratio 2.3:1 fails WCAG AA 4.5:1 requirement

3. **Button without accessible name**:
   ```html
   <button><span class="icon-save"></span></button>
   ```
   - **Classification**: `true_positive`
   - **Reason**: Button has no text or aria-label (WCAG 4.1.2)

4. **Skip link missing**:
   ```html
   <header><nav>...</nav></header> <!-- No skip link -->
   ```
   - **Classification**: `true_positive`
   - **Reason**: Page has navigation but no skip link (WCAG 2.4.1)

---

### False Positive (FP)

**Definition**: The finding is incorrect - there is no actual accessibility issue.

**When to use**:
- The element is actually accessible
- The issue doesn't exist
- The rule misunderstood the element's purpose
- Users would NOT encounter problems

**Examples**:

1. **Decorative image with empty alt**:
   ```html
   <img src="decorative-line.png" alt="">
   ```
   - **Finding**: "Image missing alt text"
   - **Classification**: `false_positive`
   - **Reason**: Empty alt is correct for decorative images (WCAG 1.1.1)

2. **SVG icon with proper label**:
   ```html
   <button aria-label="Save">
     <svg>...</svg>
   </button>
   ```
   - **Finding**: "Button has no text"
   - **Classification**: `false_positive`
   - **Reason**: aria-label provides accessible name

3. **Intentional text color for branding**:
   ```html
   <div style="color: #000; background: #fff;">Text</div>
   ```
   - **Finding**: "Text contrast may be insufficient"
   - **Classification**: `false_positive`
   - **Reason**: Black on white has 21:1 ratio, exceeds all requirements

4. **Navigation links in header**:
   ```html
   <header><a href="/">Home</a></header>
   ```
   - **Finding**: "Link in text block without sufficient contrast"
   - **Classification**: `false_positive`
   - **Reason**: Navigation links don't need surrounding text contrast

5. **Hidden element correctly implemented**:
   ```html
   <div aria-hidden="true"><button></button></div>
   ```
   - **Finding**: "Button inside aria-hidden"
   - **Classification**: `false_positive`
   - **Reason**: Button is decorative, correctly hidden from assistive tech

---

### Needs Review (NR)

**Definition**: Uncertain classification requiring expert judgment or additional context.

**When to use**:
- You're unsure if it's a real issue
- Requires domain expertise (e.g., color contrast perception)
- Needs additional context not visible in the finding
- Edge case or ambiguous WCAG interpretation
- Need to actually test with assistive technology

**Examples**:

1. **Complex ARIA pattern**:
   ```html
   <div role="combobox" aria-owns="list" aria-expanded="true">
     <input aria-controls="list" aria-activedescendant="opt1">
   </div>
   ```
   - **Finding**: "ARIA combobox pattern incomplete"
   - **Classification**: `needs_review`
   - **Reason**: Complex pattern, need to verify with screen reader

2. **Contrast with background image**:
   ```html
   <div style="background-image: url(pattern.png); color: #333;">
     Text
   </div>
   ```
   - **Finding**: "Text contrast may be insufficient"
   - **Classification**: `needs_review`
   - **Reason**: Can't calculate contrast with background images accurately

3. **Focus indicator on custom element**:
   ```html
   <div role="button" tabindex="0" style="outline: 1px solid blue;">
   ```
   - **Finding**: "Focus indicator may not be visible"
   - **Classification**: `needs_review`
   - **Reason**: Need to visually test focus state in browser

4. **Form with complex label relationship**:
   ```html
   <label id="label1">Name:</label>
   <input aria-labelledby="label1 error1">
   <span id="error1">Required</span>
   ```
   - **Finding**: "Input label relationship unclear"
   - **Classification**: `needs_review`
   - **Reason**: Complex labelledby chain, need to verify computation

---

## Validation Process

### Step 1: Understand the Finding

**Read the finding details**:
- Rule ID (e.g., `img-alt`, `text-contrast`)
- Message (e.g., "Image missing alt text")
- CSS Selector (e.g., `img.logo`)
- Confidence level (0.6 = 60%, 0.7 = 70%, etc.)
- WCAG criteria (e.g., 1.1.1, 1.4.3)

**Example Finding**:
```
Rule: img-alt
Message: Image missing alt text
Selector: div.hero > img
Confidence: 0.9
WCAG: 1.1.1
```

### Step 2: Consider Context

**Ask yourself**:
1. **What is the element's purpose?**
   - Informative image → needs descriptive alt
   - Decorative image → should have empty alt
   - Functional image (button/link) → needs alt describing action

2. **Is this a common pattern?**
   - Logo images → often need alt
   - Icon buttons → might have aria-label instead
   - Background decorations → should be CSS, not <img>

3. **What would a screen reader announce?**
   - Try to mentally trace through assistive tech
   - Would a blind user understand the content/function?

### Step 3: Look for False Positive Indicators

**Common FP patterns**:

1. **Decorative images with empty alt**:
   - `<img src="line.png" alt="">` → FP if flagged as "missing alt"
   - Empty alt is CORRECT for decorative images

2. **ARIA providing alternative text**:
   - `<button aria-label="Save">` → FP if flagged as "no text"
   - aria-label provides the accessible name

3. **Hidden elements**:
   - `<div style="display:none">` → FP if content issues flagged
   - Hidden elements don't need accessibility fixes

4. **Navigation/UI patterns**:
   - Navigation links → Don't need surrounding text contrast
   - Breadcrumbs → May have different rules than body text
   - Icon grids → May be intentionally dense (target-size)

5. **Brand colors**:
   - Logo colors → May be exempt from contrast requirements
   - Essential graphics → Different contrast rules apply

### Step 4: Look for True Positive Indicators

**Common TP patterns**:

1. **Missing text alternatives**:
   - `<img src="chart.png">` → TP, needs descriptive alt
   - `<button><i class="icon"></i></button>` → TP, needs accessible name

2. **Actual contrast issues**:
   - Light gray text on white → TP if fails 4.5:1
   - White text on light blue → TP if fails contrast

3. **Form issues**:
   - `<input>` without `<label>` or aria-label → TP
   - Submit buttons without value/text → TP

4. **Heading structure**:
   - H1 → H3 (skipping H2) → TP
   - Multiple H1s on page → TP (usually)

5. **Focus indicators**:
   - `outline: none` without alternative → TP
   - No visible focus state → TP

### Step 5: Make Classification

**Decision tree**:
```
Is there an actual accessibility issue?
├─ YES → Is it a real problem users would face?
│  ├─ YES → true_positive
│  └─ NO → false_positive (over-flagging)
├─ NO → false_positive
└─ UNSURE → needs_review
```

**Confidence levels to consider**:
- **0.9 (90%)**: High confidence finding
  - Should be obviously TP or obviously FP
  - If uncertain at 0.9, likely FP (rule over-confident)
- **0.7-0.8**: Medium confidence
  - Some uncertainty expected
  - needs_review acceptable here
- **0.6 (60%)**: Low confidence
  - Rule itself is uncertain
  - needs_review common here

### Step 6: Add Notes

**Good notes examples**:
- TP: "Clear violation, image conveys information without alt"
- TP: "Contrast ratio 3.2:1, fails WCAG AA requirement"
- FP: "Empty alt is correct, image is purely decorative"
- FP: "Has aria-label='Save', rule missed it"
- NR: "Need to test with screen reader to confirm ARIA pattern"
- NR: "Background image makes contrast calculation uncertain"

**Bad notes examples**:
- "yes" (not informative)
- "idk" (use needs_review if unsure)
- "" (empty - add context!)

---

## Rule-Specific Guidance

### img-alt (Image Alternative Text)

**True Positives**:
- Informative images without alt
- Images with alt="" that convey information
- Images with generic alt like "image" or filename

**False Positives**:
- Decorative images with alt="" (correct!)
- Images with aria-hidden="true" (correctly hidden)
- SVG with title/desc elements (alternative provided)

**Validation tip**: Ask "Would a blind user miss information without this?"

---

### text-contrast (Text Color Contrast)

**True Positives**:
- Body text < 4.5:1 contrast ratio
- Large text < 3:1 contrast ratio
- Text on images with insufficient contrast

**False Positives**:
- Logos (exempt from contrast requirements)
- Disabled elements (exempt)
- Incidental text in images
- Text on complex backgrounds (may be accurate but engine can't verify)

**Validation tip**: Use browser dev tools to check computed contrast ratio

---

### button-name (Button Accessible Name)

**True Positives**:
- `<button></button>` (empty)
- `<button><i class="icon"></i></button>` (icon only, no aria-label)
- `<button><img src="icon.png"></button>` (no alt on image)

**False Positives**:
- Buttons with aria-label
- Buttons with aria-labelledby pointing to visible text
- Buttons with title attribute (weak but present)

**Validation tip**: Check for aria-label, aria-labelledby, or visible text

---

### link-name (Link Accessible Name)

**True Positives**:
- `<a href="/page"></a>` (empty)
- `<a href="/page"><img src="icon.png"></a>` (image without alt)
- Links with text like "click here" or "read more" (poor but debatable)

**False Positives**:
- Links with aria-label
- Links with title attribute
- Icon links with proper alt text on image

**Validation tip**: Links need descriptive text, but bare minimum counts as TP

---

### focus-appearance (Focus Indicator)

**True Positives**:
- Elements with `outline: none` and no alternative
- Focus styles same as non-focus state
- Invisible focus indicators (color too similar)

**False Positives**:
- Custom focus styles (outline removed but background/border added)
- Elements not keyboard-focusable (no need for focus style)
- Focus styles in :focus-visible only (modern approach, may be intentional)

**Validation tip**: This rule has high FP rate, scrutinize carefully

---

### target-size (Touch Target Size)

**True Positives**:
- Buttons/links < 44×44px (for mobile)
- Tiny icons without adequate spacing
- Dense UI with overlapping touch targets

**False Positives**:
- Desktop-only interfaces (target size less critical)
- Inline links in paragraphs (exempt from size requirements)
- Part of a larger touch target (e.g., card with multiple small buttons)

**Validation tip**: Context matters - is this a mobile interface?

---

### label-control (Form Label)

**True Positives**:
- `<input>` without associated `<label>`
- `<input>` without aria-label or aria-labelledby
- Label not properly associated (label without for, input without id)

**False Positives**:
- Inputs with aria-label
- Inputs with placeholder (weak but present)
- Inputs with title attribute (weak but present)
- Hidden inputs (type="hidden")

**Validation tip**: Check for label, aria-label, or aria-labelledby

---

### link-in-text-block (Link Color Contrast)

**True Positives**:
- Links in paragraphs without 3:1 contrast from surrounding text
- Links without underline and insufficient color difference
- Links that are hard to distinguish from normal text

**False Positives**:
- Navigation links (not in text blocks)
- Standalone links (not surrounded by text)
- Links with underlines (don't need color contrast)
- Links in headers/footers (UI elements, not text blocks)

**Validation tip**: This rule has highest FP rate - check if it's truly "in text block"

---

### heading-order (Heading Hierarchy)

**True Positives**:
- H1 → H3 (skipping H2)
- Multiple H1s (often wrong, but can be intentional)
- H4 → H2 (going backward illogically)

**False Positives**:
- Multiple H1s in HTML5 sections (modern pattern, debatable)
- Skips for visual design (bad practice but may be intentional)
- Headings in complementary content (sidebars, ads)

**Validation tip**: Verify the heading structure makes semantic sense

---

### redundant-entry (Redundant Entry Prevention)

**True Positives**:
- Multi-step forms asking for same info twice
- Checkout requiring re-entry of shipping for billing
- Forms not using autocomplete attributes

**False Positives**:
- Confirmation fields (password confirmation is intentional)
- Security questions (repeated entry intentional)
- Different data for different purposes (shipping vs billing may differ)

**Validation tip**: Consider if redundancy is intentional for confirmation

---

## Quality Checks

### Before Submitting Validation

**Check for**:
1. **No empty classifications**: Every row should have TP, FP, or NR
2. **Notes on edge cases**: Add context where classification is unclear
3. **Consistency**: Similar findings should have similar classifications
4. **Coverage**: Validate findings from multiple sites and rules
5. **Bias avoidance**: Don't assume all findings are TP or all are FP

**Statistics to aim for** (realistic expectations):
- 70-90% true positives (rules should be mostly correct)
- 10-25% false positives (some errors expected)
- 5-15% needs review (edge cases exist)

**Red flags**:
- 100% true positives → May be too lenient
- 50%+ false positives → Check if you understand the rule correctly
- 30%+ needs review → May need to spend more time on each finding

---

## Common Pitfalls

### Pitfall 1: Confusing "Not Best Practice" with "Not Accessible"

**Issue**: Flagging as TP because it's not ideal, even though it's accessible.

**Example**:
```html
<button title="Save">💾</button>
```
- **Not best practice**: Should use aria-label or text
- **But accessible**: Screen readers announce "Save"
- **Classification**: `false_positive` (if rule flags it as "no name")

**Guideline**: TP means it fails WCAG, not just best practices.

---

### Pitfall 2: Over-trusting High Confidence

**Issue**: Assuming 0.9 confidence means definitely TP.

**Example**:
```html
<img src="decorative.png" alt="">
```
- **Rule confidence**: 0.9 ("very confident it's missing alt")
- **Reality**: Empty alt is correct for decorative
- **Classification**: `false_positive`

**Guideline**: Confidence is the rule's self-assessment, not truth.

---

### Pitfall 3: Validating Based on Visual Appearance Only

**Issue**: Using only visual inspection without considering assistive tech.

**Example**:
```html
<div onclick="submit()">Submit</div>
```
- **Looks fine visually**: Appears as a button
- **Screen reader**: Just announces "Submit" (no button role, not focusable)
- **Classification**: `true_positive` (needs role="button" and tabindex)

**Guideline**: Consider how screen readers and keyboards interact.

---

### Pitfall 4: Being Too Lenient with "Needs Review"

**Issue**: Using NR for most findings to avoid making decisions.

**Impact**: Reduces data quality, makes patterns hard to identify.

**Guideline**: Use NR for <15% of findings. If unsure, research WCAG criteria.

---

### Pitfall 5: Not Considering Context

**Issue**: Validating findings in isolation without page context.

**Example**:
```html
<a href="#main">Skip to content</a>
```
- **Rule**: "Link text not descriptive"
- **Context**: This is a skip link (correct pattern)
- **Classification**: `false_positive`

**Guideline**: Always consider element's role in the overall page.

---

## Tools and Resources

### Browser Developer Tools

**Chrome/Edge DevTools**:
1. Elements → Accessibility panel
2. Shows computed accessible name, role, properties
3. Contrast ratio checker in color picker

**Firefox DevTools**:
1. Accessibility inspector (separate panel)
2. Shows full accessibility tree
3. Highlights keyboard navigation issues

### Online Tools

**Contrast Checker**:
- https://webaim.org/resources/contrastchecker/
- Verify text contrast ratios
- Check WCAG AA/AAA compliance

**ARIA Validator**:
- https://www.w3.org/WAI/ARIA/apg/
- ARIA Authoring Practices Guide
- Verify ARIA patterns

### Screen Readers (for "Needs Review" cases)

**Free Options**:
- **NVDA** (Windows): https://www.nvaccess.org/
- **VoiceOver** (Mac/iOS): Built-in
- **TalkBack** (Android): Built-in

**When to use**:
- Uncertain about ARIA patterns
- Complex interactive widgets
- Focus management issues
- Unsure what screen reader announces

---

## Validation Workflow Example

### Example Finding

```csv
finding_id,site_name,rule,selector,message,confidence,classification,notes
finding-42,shop.example,img-alt,img.product-thumb,Image missing alt text,0.9,?,?
```

### Step-by-Step Validation

1. **Understand**: Rule says product thumbnail missing alt text
2. **Context**: E-commerce site, product grid
3. **Consider**: Do product thumbnails need alt text?
   - YES: Users need to know what product is shown
4. **Look for FP indicators**:
   - Empty alt? → Would be FP
   - aria-label? → Would be FP
   - Adjacent text? → Would still be TP (img needs alt)
5. **Decision**: Likely TRUE POSITIVE unless alt="" (decorative) or has aria-label
6. **Classify**: Assuming no alt attribute at all → `true_positive`
7. **Add note**: "Product image needs descriptive alt text"

**Result**:
```csv
finding-42,shop.example,img-alt,img.product-thumb,Image missing alt text,0.9,true_positive,Product image needs descriptive alt text for users who can't see it
```

---

## FAQ

### Q: How long should validation take?

**A**: 30-60 seconds per finding on average. Simple cases (obvious TP/FP) take 10-20 seconds. Complex cases may take 2-3 minutes.

### Q: What if I don't know WCAG criteria well?

**A**: Use resources:
- [WCAG Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM WCAG Checklist](https://webaim.org/standards/wcag/checklist)
- Start with rules you understand, get help with uncertain ones

### Q: Can I mark everything as "needs_review"?

**A**: No. Aim for <15% needs_review. Most findings should be clear TP or FP with some research.

### Q: What if the finding is technically correct but minor?

**A**: True positive. The rule's job is to find issues - severity doesn't affect TP/FP classification.

### Q: Should I validate in random order or by rule?

**A**: By rule is more efficient (you learn patterns quickly), but random sampling is better for unbiased statistics. Compromise: Stratified sampling (some from each rule).

### Q: What if I disagree with WCAG?

**A**: Classify based on WCAG compliance, not personal opinion. Add note: "TP per WCAG but questionable in practice."

### Q: How many findings should I validate?

**A**: Minimum 50 for basic statistics, 100-200 for good confidence, 300+ for excellent confidence. Aim for representation across all rules and confidence levels.

---

## Validation Checklist

Before submitting validation data:

- [ ] All findings have classification (TP, FP, or NR)
- [ ] Edge cases have explanatory notes
- [ ] No obvious inconsistencies (similar findings classified differently)
- [ ] Coverage across multiple rules
- [ ] Coverage across multiple sites
- [ ] Coverage across confidence levels
- [ ] NR rate < 15%
- [ ] Uncertain cases researched (not guessed)
- [ ] File saved as `manual-validation-completed.csv`
- [ ] CSV format valid (no missing commas, quotes escaped)

---

## Next Steps

After validation:
1. Save file as `manual-validation-completed.csv`
2. Run: `node tests/integration/calculate-metrics.js --validation manual-validation-completed.csv`
3. Run: `node tests/integration/analyze-patterns.js --validation manual-validation-completed.csv`
4. Review accuracy metrics and patterns in generated report
5. Use recommendations to tune engine rules

---

*Last updated: 2025-11-06*
*Version: 1.0.0*
