# Phase 6: Comprehensive Execution Plan

**Date:** 2025-11-05
**Status:** Planning Complete, Ready to Execute
**Target:** Test 6-7 interactive/usability rules
**Expected Duration:** 60-75 minutes

---

## Phase 5 Gap Analysis Results

### ✅ Gap Fixed
- Added 2 tests for SELECT and TEXTAREA in aria-hidden-focus
- Total tests: 193 (was 191)
- Phase 5 Quality: **9.5/10** (Excellent)

### Remaining Untested Rules: 18/46

**Interactive/Usability (7 rules):**
1. skip-link - Skip navigation links
2. link-button-misuse - Semantic element misuse
3. tabindex-positive - Positive tabindex values
4. fieldset-legend - Form group labeling
5. autocomplete - Input autocomplete attributes
6. meta-viewport - Viewport configuration
7. target-size - Touch target dimensions

**WCAG 2.2 Rules (8 rules):**
8. focus-appearance - Focus indicator visibility
9. dragging-movements - Drag alternatives
10. consistent-help - Help location consistency
11. focus-not-obscured-minimum - Focus visibility (minimum)
12. focus-not-obscured-enhanced - Focus visibility (enhanced)
13. redundant-entry - Redundant information entry
14. accessible-authentication-minimum - Authentication barriers
15. accessible-authentication-enhanced - Enhanced authentication

**Media (2 rules):**
16. media-captions - Video captions
17. audio-transcript - Audio descriptions

**Other (1 rule):**
18. link-in-text-block - Link distinguishability

---

## Phase 6 Rule Selection

### Selected Rules (6 rules, ~30-35 tests)

#### 1. **skip-link** (MODERATE) - 5 tests
**Engine Location:** Line 993
**Description:** Provide skip link to main content
**WCAG:** Best practice, 2.4.1
**Tests:**
- Detects missing skip link
- Detects skip link with broken target
- Detects skip link not first focusable element
- Passes valid skip link to #main
- Passes page with multiple skip links

**Complexity:** Medium (needs to check href target exists)

---

#### 2. **link-button-misuse** (MODERATE) - 5 tests
**Engine Location:** Line 1018
**Description:** Links should not act like buttons (onclick without href)
**WCAG:** Best practice
**Tests:**
- Detects link with onclick but no href
- Detects link with href="#" and onclick
- Detects link with href="javascript:"
- Passes link with valid href
- Passes button with onclick

**Complexity:** Low (straightforward pattern matching)

---

#### 3. **tabindex-positive** (MODERATE) - 5 tests
**Engine Location:** Line 1034
**Description:** Avoid positive tabindex values
**WCAG:** Best practice, 2.4.3
**Tests:**
- Detects tabindex="1"
- Detects tabindex="10"
- Detects tabindex="999"
- Passes tabindex="0"
- Passes tabindex="-1"
- Passes elements without tabindex

**Complexity:** Very low (simple attribute check)

---

#### 4. **fieldset-legend** (MODERATE) - 5 tests
**Engine Location:** Line 1051
**Description:** Related form controls should be grouped with fieldset/legend
**WCAG:** 1.3.1, 3.3.2
**Tests:**
- Detects radio group without fieldset
- Detects checkbox group without fieldset
- Detects fieldset without legend
- Passes radio group with fieldset and legend
- Passes single checkbox (no group)

**Complexity:** Medium (needs to detect grouping patterns)

---

#### 5. **autocomplete** (MODERATE) - 5 tests
**Engine Location:** Line 1083
**Description:** Input fields should have appropriate autocomplete attributes
**WCAG:** 1.3.5 (WCAG 2.1)
**Tests:**
- Detects email input without autocomplete="email"
- Detects name input without autocomplete="name"
- Detects tel input without autocomplete="tel"
- Passes input with appropriate autocomplete
- Passes non-personal-info inputs

**Complexity:** Low (attribute checking with mapping)

---

#### 6. **meta-viewport** (MODERATE/CRITICAL) - 5 tests
**Engine Location:** Line 1179
**Description:** Viewport meta tag configuration
**WCAG:** 1.4.4, 1.4.10
**Tests:**
- Detects missing viewport meta
- Detects user-scalable=no (CRITICAL)
- Detects maximum-scale=1 (CRITICAL)
- Passes appropriate viewport meta
- Passes viewport with proper scaling

**Complexity:** Low (meta tag checking)

---

## Not Selected for Phase 6 (Will be Phase 7+)

**Deferred to Phase 7:**
- target-size (complex - size calculation, touch targets)
- link-in-text-block (complex - contrast calculations)
- media-captions (requires media element testing)
- audio-transcript (requires media element testing)

**Deferred to Phase 8:**
- All WCAG 2.2 rules (8 rules - more complex, newer standards)

---

## Implementation Plan

### Step 1: Engine Analysis (10 min)
- Read all 6 rule implementations
- Document expected behaviors
- Identify edge cases
- Note WCAG references

### Step 2: Create Fixtures (10 min)
Add to `dom-fixtures.js`:
- `skipLinkMissing()` - Page without skip link
- `skipLinkValid()` - Valid skip link to #main
- `skipLinkBrokenTarget()` - Skip link to non-existent target
- `linkWithOnclickNoHref()` - Link button misuse
- `linkWithJavascript()` - javascript: href
- `elementWithPositiveTabindex()` - tabindex="5"
- `radioGroupWithoutFieldset()` - Ungrouped radios
- `radioGroupWithFieldset()` - Proper fieldset/legend
- `fieldsetWithoutLegend()` - Fieldset missing legend
- `emailInputWithoutAutocomplete()` - Missing autocomplete
- `emailInputWithAutocomplete()` - Proper autocomplete
- `viewportMetaMissing()` - No viewport meta
- `viewportDisablesZoom()` - user-scalable=no

### Step 3: Create Test File (30 min)
- Create `tests/unit/rules/interactive-rules.test.js`
- 30 tests total (5 per rule)
- Follow Phase 4 & 5 patterns
- Test both violations and passing cases
- Validate WCAG criteria

### Step 4: Execute & Debug (10 min)
- Run new test file
- Debug any failures
- Verify all existing tests pass

### Step 5: Quality Assurance (5 min)
- Check test coverage
- Verify WCAG references
- Ensure edge cases covered

### Step 6: Documentation (5 min)
- Update NEXT_SESSION.md
- Create Phase 6 completion report

### Step 7: Commit & Push (5 min)
- Git commit with descriptive message
- Push to remote

---

## Expected Outcomes

**Tests:**
- Previous: 193 tests
- Adding: ~30 tests
- New total: ~223 tests

**Rule Coverage:**
- Previous: 28/46 (61%)
- Adding: 6 rules
- New total: 34/46 (74%)

**Quality Targets:**
- 100% pass rate
- All existing tests still passing
- Comprehensive edge case coverage
- Clear, maintainable code

---

## Detailed Rule Analysis

### 1. skip-link (Line 993-1016)

```javascript
const ruleSkipLink = {
  id: 'skip-link',
  description: 'Provide a skip link to main content',
  evaluate() {
    const out = [];
    const links = Array.from(document.querySelectorAll('a[href^="#"]'));
    if (!links.length) {
      out.push(makeFinding({
        ruleId: 'skip-link',
        impact: 'moderate',
        message: 'Consider adding a skip link...',
        el: document.body,
        wcag: ['2.4.1'],
        confidence: 0.7
      }));
      return out;
    }

    // Check if first focusable link targets main content
    const firstFocusable = links[0];
    const target = firstFocusable.getAttribute('href');
    const skipKeywords = ['main','content','skip'];
    const text = (firstFocusable.textContent || '').toLowerCase();
    const hasSkipPattern = skipKeywords.some(k =>
      text.includes(k) || target.includes(k)
    );

    if (!hasSkipPattern) {
      out.push(makeFinding({
        ruleId: 'skip-link',
        impact: 'moderate',
        message: 'No apparent skip link found...',
        el: firstFocusable,
        wcag: ['2.4.1'],
        confidence: 0.6
      }));
    }
    return out;
  }
};
```

**Key Behaviors:**
- Checks for `a[href^="#"]` links
- First focusable link should have "skip", "main", or "content" in text/href
- Advisory (confidence 0.6-0.7)

**Test Strategy:**
- Missing any # links
- Has # links but none are skip links
- Skip link exists but not first
- Valid skip link
- Multiple skip links (should pass)

---

### 2. link-button-misuse (Line 1018-1033)

```javascript
const ruleLinkButtonMisuse = {
  id: 'link-button-misuse',
  description: 'Links should navigate; use <button> for actions',
  evaluate() {
    const out = [];
    const links = Array.from(document.querySelectorAll('a'));
    for (const link of links) {
      if (!link.hasAttribute('onclick')) continue;
      const href = (link.getAttribute('href') || '').trim();
      if (!href || href === '#' || href.startsWith('javascript:')) {
        out.push(makeFinding({
          ruleId: 'link-button-misuse',
          impact: 'moderate',
          message: 'Link with onclick handler should use <button>...',
          el: link,
          wcag: ['best-practice'],
          confidence: 0.8
        }));
      }
    }
    return out;
  }
};
```

**Key Behaviors:**
- Flags links with onclick AND (no href OR href="#" OR href="javascript:")
- Doesn't flag links with valid href + onclick

**Test Strategy:**
- onclick + no href
- onclick + href="#"
- onclick + href="javascript:void(0)"
- onclick + valid href (passes)
- button with onclick (passes)

---

### 3. tabindex-positive (Line 1034-1050)

```javascript
const ruleTabindexPositive = {
  id: 'tabindex-positive',
  description: 'Avoid positive tabindex values',
  evaluate() {
    const out = [];
    const pool = Array.from(document.querySelectorAll('[tabindex]'));
    for (const el of pool) {
      const val = el.getAttribute('tabindex');
      const num = parseInt(val);
      if (!isNaN(num) && num > 0) {
        out.push(makeFinding({
          ruleId: 'tabindex-positive',
          impact: 'moderate',
          message: `Positive tabindex (${num}) disrupts natural tab order...`,
          el,
          wcag: ['2.4.3'],
          confidence: 0.95
        }));
      }
    }
    return out;
  }
};
```

**Key Behaviors:**
- Checks all [tabindex] elements
- Flags if parseInt(tabindex) > 0
- tabindex="0" and tabindex="-1" pass

**Test Strategy:**
- tabindex="1"
- tabindex="5"
- tabindex="100"
- tabindex="0" (passes)
- tabindex="-1" (passes)
- no tabindex (passes)

---

### 4. fieldset-legend (Line 1051-1082)

```javascript
const ruleFieldsetLegend = {
  id: 'fieldset-legend',
  description: 'Related form controls should be grouped',
  evaluate() {
    const out = [];

    // Check fieldsets have legend
    const fieldsets = Array.from(document.querySelectorAll('fieldset'));
    for (const fs of fieldsets) {
      if (!fs.querySelector(':scope > legend')) {
        out.push(makeFinding({
          ruleId: 'fieldset-legend',
          impact: 'moderate',
          message: 'Fieldset is missing a legend...',
          el: fs,
          wcag: ['1.3.1','3.3.2'],
          confidence: 0.95
        }));
      }
    }

    // Check radio/checkbox groups
    const radios = Array.from(document.querySelectorAll('input[type="radio"]'));
    const groups = {};
    for (const r of radios) {
      const name = r.getAttribute('name');
      if (name) {
        if (!groups[name]) groups[name] = [];
        groups[name].push(r);
      }
    }

    for (const [name, elements] of Object.entries(groups)) {
      if (elements.length < 2) continue;
      const hasFieldset = elements.some(el => el.closest('fieldset'));
      if (!hasFieldset) {
        out.push(makeFinding({
          ruleId: 'fieldset-legend',
          impact: 'moderate',
          message: `Radio group "${name}" should be in a fieldset...`,
          el: elements[0],
          wcag: ['1.3.1','3.3.2'],
          confidence: 0.85
        }));
      }
    }

    return out;
  }
};
```

**Key Behaviors:**
- Checks fieldsets for <legend> child
- Groups radios by name attribute
- Flags groups of 2+ radios without fieldset
- Similar logic for checkboxes (not shown)

**Test Strategy:**
- Fieldset without legend
- Radio group (2+) without fieldset
- Checkbox group without fieldset
- Proper fieldset with legend (passes)
- Single radio (passes - not a group)

---

### 5. autocomplete (Line 1083-1139)

```javascript
const ruleAutocomplete = {
  id: 'autocomplete',
  description: 'Input fields collecting personal info should have autocomplete',
  evaluate() {
    const out = [];
    const personalInfoInputs = {
      email: ['email'],
      name: ['name','fname','lname','first','last'],
      tel: ['phone','mobile','tel'],
      // etc.
    };

    const inputs = Array.from(document.querySelectorAll('input'));
    for (const input of inputs) {
      const type = (input.getAttribute('type') || 'text').toLowerCase();
      const name = (input.getAttribute('name') || '').toLowerCase();
      const id = (input.getAttribute('id') || '').toLowerCase();
      const autocomplete = input.getAttribute('autocomplete');

      // Check if this looks like personal info
      let expectedAutocomplete = null;
      for (const [autoValue, keywords] of Object.entries(personalInfoInputs)) {
        if (keywords.some(k => name.includes(k) || id.includes(k))) {
          expectedAutocomplete = autoValue;
          break;
        }
      }

      if (expectedAutocomplete && !autocomplete) {
        out.push(makeFinding({
          ruleId: 'autocomplete',
          impact: 'moderate',
          message: `Input appears to collect ${expectedAutocomplete}...`,
          el: input,
          wcag: ['1.3.5'],
          confidence: 0.7
        }));
      }
    }
    return out;
  }
};
```

**Key Behaviors:**
- Looks for keywords in name/id attributes
- Maps to expected autocomplete values
- Only flags if no autocomplete attribute present

**Test Strategy:**
- input name="email" without autocomplete
- input id="user_name" without autocomplete
- input id="phone" without autocomplete
- input with autocomplete="email" (passes)
- input name="search" (passes - not personal info)

---

### 6. meta-viewport (Line 1179-1196)

**Already analyzed in Phase 5, located at line 1179**

```javascript
const ruleMetaViewport = {
  id: 'meta-viewport',
  description: 'Responsive pages should include viewport meta',
  evaluate() {
    const out = [];
    const meta = document.querySelector('meta[name="viewport"]');
    if (!meta) {
      out.push(makeFinding({
        ruleId: 'meta-viewport',
        impact: 'moderate',
        message: 'Missing <meta name="viewport">...',
        el: document.head || document.documentElement,
        wcag: ['1.4.4','1.4.10']
      }));
    } else {
      const content = (meta.getAttribute('content')||'').toLowerCase();
      const disablesZoom = content.includes('user-scalable=no') ||
                          /maximum-scale\s*=\s*1(\.0)?/.test(content);
      if (disablesZoom) {
        out.push(makeFinding({
          ruleId: 'meta-viewport',
          impact: 'critical',
          message: 'Zooming disabled via viewport settings...',
          el: meta,
          wcag: ['1.4.4'],
          confidence: 0.95
        }));
      }
    }
    return out;
  }
};
```

**Key Behaviors:**
- Checks for missing meta[name="viewport"]
- Checks for user-scalable=no (CRITICAL)
- Checks for maximum-scale=1 or maximum-scale=1.0 (CRITICAL)

**Test Strategy:**
- Missing viewport meta
- viewport with user-scalable=no
- viewport with maximum-scale=1
- viewport with maximum-scale=1.0
- proper viewport (passes)

---

## Quality Gates

**Gate 1 (After Fixtures):**
- [ ] All fixtures compile
- [ ] Fixtures follow patterns
- [ ] No breaking changes

**Gate 2 (After Tests):**
- [ ] All 30 tests execute
- [ ] Test descriptions clear
- [ ] Follows Phase 4/5 patterns

**Gate 3 (After Execution):**
- [ ] All 223 tests passing
- [ ] No existing tests broken
- [ ] WCAG references correct

**Gate 4 (Before Commit):**
- [ ] Documentation complete
- [ ] Code reviewed
- [ ] Production ready

---

## Risk Assessment

**Low Risks:**
- Straightforward rules (tabindex, link-button-misuse)
- Clear pass/fail criteria
- Simple attribute checking

**Medium Risks:**
- skip-link (heuristic-based, lower confidence)
- fieldset-legend (grouping detection logic)
- autocomplete (keyword matching)

**Mitigation:**
- Test engine behavior carefully
- Document heuristics in comments
- Test edge cases thoroughly

---

## Success Criteria

**Minimum:**
- [ ] 5 rules tested with 25+ tests
- [ ] All tests passing
- [ ] Coverage reaches 33/46 (72%)

**Target:**
- [ ] 6 rules tested with 30 tests
- [ ] All tests passing
- [ ] Coverage reaches 34/46 (74%)

**Stretch:**
- [ ] 6 rules with 35+ tests
- [ ] Additional edge cases
- [ ] Coverage reaches 34/46 with bonus tests

---

## Timeline

| Step | Task | Estimated |
|------|------|-----------|
| 1 | Engine analysis | 10 min |
| 2 | Create fixtures | 10 min |
| 3 | Create test file | 30 min |
| 4 | Execute & debug | 10 min |
| 5 | Quality assurance | 5 min |
| 6 | Documentation | 5 min |
| 7 | Commit & push | 5 min |
| **Total** | **All steps** | **75 min** |

**Buffer:** 15 minutes for unexpected issues

---

## Plan Verification Checklist

- [x] Rules selected are appropriate difficulty
- [x] All rules have clear implementations
- [x] Test strategy defined for each rule
- [x] Fixtures identified and specified
- [x] Quality gates established
- [x] Success criteria defined
- [x] Timeline reasonable
- [x] Risk mitigation planned

**Plan Status:** ✅ VERIFIED - Ready to Execute

---

**Prepared By:** Claude
**Date:** 2025-11-05
**Next Action:** Execute Step 1 - Engine Analysis
