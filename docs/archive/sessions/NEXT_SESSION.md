# 🚀 Next Session: Start Here

**Last Updated:** 2025-11-05
**Current Branch:** `claude/code-review-analysis-011CUogMaEVAdYeEVQKJYBfN`
**Last Commit:** `37a5d68` - feat: Add test infrastructure and regression tests

---

## ✅ Current Status

### **Test Suite:**
```
✅ Quick Test:           15/15  passing
✅ Test API:             10/10  passing
✅ Algorithms Only:      29/29  passing
✅ Contrast Text:        32/32  passing
✅ High Impact Suite:    31/31  passing
✅ Regression Tests:      6/6   passing
✅ Helper Tests:          7/7   passing
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ TOTAL:               130/130 passing (100%)
```

### **Rule Coverage:**
- **Tested:** 13/46 rules (28%)
- **Untested:** 33/46 rules (72%)

### **Infrastructure:**
- ✅ Test helpers complete (fixtures, assertions, setup)
- ✅ Regression tests for 2 critical bugs
- ✅ Enhanced color mock (22 colors, percentage RGB, hex alpha)
- ✅ All changes committed and pushed

---

## 🎯 Next Task: Phase 4 - Test ARIA Rules

**Goal:** Test 7 critical ARIA rules using new helpers
**Estimated Time:** 2-3 hours
**Expected Output:** 21-28 new tests, 43% rule coverage

### **ARIA Rules to Test (Priority Order):**

1. ✅ **aria-role-valid** - Invalid ARIA roles (HIGHEST PRIORITY)
2. ✅ **aria-required-props** - Missing required ARIA properties
3. ✅ **aria-attr-valid** - Invalid ARIA attributes
4. ✅ **aria-allowed-attr** - Disallowed ARIA attributes
5. ✅ **aria-required-children** - Missing required child roles
6. ✅ **aria-required-parent** - Missing required parent roles
7. ✅ **aria-presentation-misuse** - Incorrect presentation role usage

---

## 🏁 Quick Start Commands

### **1. Verify Current State** (30 seconds)
```bash
# Check you're on the right branch
git status

# Should show:
# On branch claude/code-review-analysis-011CUogMaEVAdYeEVQKJYBfN
# Your branch is up to date with 'origin/claude/code-review-analysis-011CUogMaEVAdYeEVQKJYBfN'
# nothing to commit, working tree clean

# Run all tests to confirm 100% passing
echo "=== Quick Test ===" && node tests/quick-test.js 2>&1 | tail -3
echo "=== Regression ===" && node tests/regression/bug-fixes.test.js 2>&1 | tail -3
echo "=== Helpers ===" && node tests/helpers/helpers.test.js 2>&1 | tail -3
```

### **2. Remind Yourself of Helpers** (2 minutes)
```bash
# See what fixtures are available
cat tests/helpers/dom-fixtures.js | grep "^  [a-z].*:" | head -20

# See what assertions are available
cat tests/helpers/assertions.js | grep "^function assert"

# Review helper test to see usage examples
cat tests/helpers/helpers.test.js
```

### **3. Start First Test** (Jump to section below)

---

## 📝 Template: First ARIA Rule Test

### **Create:** `tests/unit/rules/aria-rules.test.js`

```javascript
#!/usr/bin/env node
/**
 * Test Suite for ARIA Rules
 *
 * Tests 7 critical ARIA rules:
 * - aria-role-valid: Invalid ARIA roles
 * - aria-required-props: Missing required properties
 * - aria-attr-valid: Invalid ARIA attributes
 * - aria-allowed-attr: Disallowed ARIA attributes
 * - aria-required-children: Missing required child roles
 * - aria-required-parent: Missing required parent roles
 * - aria-presentation-misuse: Incorrect presentation role
 *
 * Run: node tests/unit/rules/aria-rules.test.js
 */

const { fullSetup, resetDOM } = require('../../helpers/jsdom-setup');
const { fixtures, createTestElement } = require('../../helpers/dom-fixtures');
const { assertHasViolation, assertNoFindings, assertWCAGCriteria } = require('../../helpers/assertions');

// Setup environment once
fullSetup();

console.log('🎭 Testing ARIA Rules\n');
console.log('='.repeat(70));

const tests = [];
let passed = 0;
let failed = 0;

function test(name, fn) {
  tests.push({ name, fn });
}

// =============================================================================
// RULE: aria-role-valid
// =============================================================================

test('aria-role-valid: detects invalid role', () => {
  resetDOM();
  const el = fixtures.invalidAriaRole();
  document.body.appendChild(el);

  const findings = window.__a11yEngine.run(['aria-role-valid']);

  assertHasViolation(findings, 'aria-role-valid', 'Should detect invalid role');
});

test('aria-role-valid: passes valid role', () => {
  resetDOM();
  const el = fixtures.ariaElement('button', { 'aria-pressed': 'false' });
  document.body.appendChild(el);

  const findings = window.__a11yEngine.run(['aria-role-valid']);

  assertNoFindings(findings, 'Valid role should not have violations');
});

test('aria-role-valid: passes element without role', () => {
  resetDOM();
  const el = createTestElement({ tag: 'div', text: 'No role' });
  document.body.appendChild(el);

  const findings = window.__a11yEngine.run(['aria-role-valid']);

  assertNoFindings(findings, 'Element without role should pass');
});

// =============================================================================
// RULE: aria-required-props
// =============================================================================

test('aria-required-props: detects missing required properties', () => {
  resetDOM();
  const el = fixtures.ariaMissingRequiredProps();
  document.body.appendChild(el);

  const findings = window.__a11yEngine.run(['aria-required-props']);

  assertHasViolation(findings, 'aria-required-props', 'Should detect missing aria-checked');
});

test('aria-required-props: passes with required properties', () => {
  resetDOM();
  const el = fixtures.ariaWithRequiredProps();
  document.body.appendChild(el);

  const findings = window.__a11yEngine.run(['aria-required-props']);

  assertNoFindings(findings, 'Element with required props should pass');
});

// TODO: Add remaining 5 ARIA rules following the same pattern

// =============================================================================
// RUN ALL TESTS
// =============================================================================

function runTests() {
  for (const { name, fn } of tests) {
    try {
      fn();
      passed++;
      console.log(`✅ ${name}`);
    } catch (error) {
      failed++;
      console.log(`❌ ${name}`);
      console.log(`   ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);

  if (failed === 0) {
    console.log('\n✨ All ARIA rule tests passing!');
  } else {
    console.log('\n❌ Some tests failed!');
    process.exit(1);
  }
}

runTests();
```

### **Run It:**
```bash
node tests/unit/rules/aria-rules.test.js

# Should see:
# ✅ aria-role-valid: detects invalid role
# ✅ aria-role-valid: passes valid role
# ✅ aria-role-valid: passes element without role
# ✅ aria-required-props: detects missing required properties
# ✅ aria-required-props: passes with required properties
# 📊 Results: 5 passed, 0 failed
```

---

## 📚 Helper Quick Reference

### **Available Fixtures:**

```javascript
// Text & Contrast
fixtures.lowContrastText()
fixtures.highContrastText()
fixtures.largeText()
fixtures.semiTransparentText()

// Interactive Elements
fixtures.accessibleButton()
fixtures.buttonWithoutName()
fixtures.buttonWithAriaLabel()
fixtures.nonFocusableButton()
fixtures.focusableButton()

// ARIA Elements (USE THESE FOR ARIA TESTS!)
fixtures.ariaElement(role, extraAttrs)         // Generic ARIA element
fixtures.invalidAriaRole()                      // Invalid role
fixtures.ariaMissingRequiredProps()             // Missing aria-checked
fixtures.ariaWithRequiredProps()                // Valid checkbox with aria-checked

// Images
fixtures.imageWithoutAlt()
fixtures.imageWithAlt()
fixtures.decorativeImage()

// Forms
fixtures.inputWithoutLabel()
fixtures.inputWithLabel()  // Returns { input, label }
fixtures.inputWithAriaLabel()

// Links
fixtures.linkWithoutName()
fixtures.linkWithText()
fixtures.linkInText(underlined)

// Headings & Structure
fixtures.heading(level, text)
fixtures.headingSequence()
fixtures.skippedHeading()
fixtures.mainLandmark()
fixtures.navLandmark()
fixtures.roleLandmark(role)

// Hidden Elements
fixtures.hiddenElement('display')    // display:none
fixtures.hiddenElement('visibility')  // visibility:hidden
fixtures.hiddenElement('aria')        // aria-hidden="true"
fixtures.zeroSizeElement()

// Touch Targets
fixtures.smallTouchTarget()
fixtures.adequateTouchTarget()

// Lists & Tables
fixtures.properList()
fixtures.improperList()
fixtures.tableWithHeaders()
fixtures.tableWithoutHeaders()
```

### **Available Assertions:**

```javascript
// Basic
assertNoFindings(findings, message)
assertHasViolation(findings, ruleId, message)  // Returns finding object
assertFindingsCount(findings, min, max, message)

// Metadata
assertWCAGCriteria(finding, ['1.4.3', '1.4.6'], message)
assertImpact(finding, 'serious', message)
assertEvidence(finding, ['ratio', 'fg', 'bg'], message)
assertTargetsElement(finding, element, message)

// Utilities
assertClose(actual, expected, tolerance, message)  // For float comparisons
assertContains(array, item, message)
assertNoErrors(findings, message)
```

### **Setup Functions:**

```javascript
const { fullSetup, resetDOM } = require('../../helpers/jsdom-setup');

fullSetup();  // Call once at top of test file
resetDOM();   // Call before each test (or in test() wrapper)
```

---

## 🎯 Success Criteria for Next Session

### **Minimum (30 minutes):**
- ✅ Create first ARIA rule test
- ✅ Verify helpers work end-to-end
- ✅ At least 5 tests passing

### **Target (2-3 hours):**
- ✅ All 7 ARIA rules tested
- ✅ 21-28 new tests passing
- ✅ Total: 151-158 tests passing
- ✅ Rule coverage: 20/46 (43%)
- ✅ Committed and pushed

### **Stretch (if you have extra time):**
- ✅ Start next batch (name computation rules)
- ✅ Test: link-name, control-name, region-name, iframe-title
- ✅ Rule coverage: 24/46 (52%)

---

## 🐛 Troubleshooting

### **If tests fail:**
```bash
# 1. Verify helpers work
node tests/helpers/helpers.test.js

# 2. Verify existing tests still pass
node tests/quick-test.js
node tests/regression/bug-fixes.test.js

# 3. Check engine.js hasn't been modified
git diff engine.js

# 4. Verify you're using helpers correctly
cat tests/helpers/helpers.test.js  # See examples
```

### **If you get "module not found":**
```bash
# Verify you're in project root
pwd
# Should show: /home/user/accessinsight-mv3-extension-v2

# Verify helpers exist
ls -la tests/helpers/
# Should show: assertions.js, dom-fixtures.js, jsdom-setup.js, helpers.test.js
```

### **If you see canvas errors:**
The color mock should prevent this, but if it happens:
```javascript
// Make sure you're using fullSetup() at the top of your test file
const { fullSetup } = require('../../helpers/jsdom-setup');
fullSetup();  // This loads engine with color mock
```

---

## 📖 Understanding ARIA Rules (Quick Reference)

### **1. aria-role-valid**
```javascript
// Invalid: <div role="invalid-role-name">
// Valid:   <div role="button" tabindex="0">
// Test:    fixtures.invalidAriaRole()
```

### **2. aria-required-props**
```javascript
// Invalid: <div role="checkbox">               (missing aria-checked)
// Valid:   <div role="checkbox" aria-checked="false">
// Test:    fixtures.ariaMissingRequiredProps()
```

### **3. aria-attr-valid**
```javascript
// Invalid: <div aria-invalid-attr="value">
// Valid:   <div aria-label="Valid attribute">
```

### **4. aria-allowed-attr**
```javascript
// Invalid: <button aria-checked="false">       (buttons can't have aria-checked)
// Valid:   <button aria-pressed="false">       (buttons CAN have aria-pressed)
```

### **5. aria-required-children**
```javascript
// Invalid: <div role="list"></div>             (list needs list items)
// Valid:   <div role="list"><div role="listitem">Item</div></div>
```

### **6. aria-required-parent**
```javascript
// Invalid: <div role="listitem">Item</div>     (listitem needs list parent)
// Valid:   <div role="list"><div role="listitem">Item</div></div>
```

### **7. aria-presentation-misuse**
```javascript
// Invalid: <button role="presentation">Click</button>  (hides interactive element)
// Valid:   <div role="presentation"></div>             (decorative content)
```

---

## 🔍 Finding Rule Implementation

If you need to understand how a rule works:

```bash
# Find the rule in engine.js
grep -n "id: 'aria-role-valid'" engine.js
# Shows line number where rule is defined

# Read the rule implementation
sed -n '2100,2150p' engine.js  # Adjust line numbers from grep output
```

---

## 📦 Files You'll Create Next Session

```
tests/unit/rules/aria-rules.test.js  (300-400 lines, 21-28 tests)
```

That's it! One file for all 7 ARIA rules.

---

## 💡 Pro Tips for Next Session

1. **Start with the template above** - Just copy/paste and modify
2. **Use fixtures heavily** - They're already configured correctly
3. **Test in pairs** - One violation test, one pass test per rule
4. **Run frequently** - `node tests/unit/rules/aria-rules.test.js` after each test
5. **Read existing tests** - Look at `tests/helpers/helpers.test.js` for patterns
6. **Don't overthink** - The helpers make this fast and easy
7. **Commit often** - After each rule or two, commit progress

---

## 🎓 Learning Resources

### **Test Examples:**
- `tests/helpers/helpers.test.js` - Simple usage examples
- `tests/regression/bug-fixes.test.js` - Complex integration tests
- `tests/unit/rules/high-impact-suite.test.js` - Multiple rules in one file

### **Fixture Examples:**
- See `tests/helpers/dom-fixtures.js` - All 40+ fixtures with comments

### **Assertion Examples:**
- See `tests/helpers/assertions.js` - All 10 assertions with error handling

---

## ✅ Final Checklist Before Next Session

- [ ] All changes committed? → `git status` should show "working tree clean"
- [ ] All tests passing? → Run commands in "Quick Start" section
- [ ] Understand helpers? → Read `tests/helpers/helpers.test.js`
- [ ] Have template? → Copy from "Template: First ARIA Rule Test" section above
- [ ] Know what to test? → See "ARIA Rules to Test" section
- [ ] Estimated time? → 2-3 hours for all 7 rules
- [ ] Clear workspace? → Close other tasks, focus on this

---

## 🚀 When You're Ready

```bash
# 1. Verify everything
git status                              # Clean?
node tests/helpers/helpers.test.js      # Helpers work?

# 2. Create test file
touch tests/unit/rules/aria-rules.test.js

# 3. Copy template from above into the file

# 4. Start testing!
node tests/unit/rules/aria-rules.test.js

# 5. You're off to the races! 🏁
```

---

**Questions?** Re-read this file. Everything you need is here.

**Stuck?** Check the "Troubleshooting" section above.

**Feeling good?** Let's go! You've got this. The helpers will make this fast. 🚀

---

**Last commit:** `37a5d68` - feat: Add test infrastructure and regression tests
**Branch:** `claude/code-review-analysis-011CUogMaEVAdYeEVQKJYBfN`
**Date:** 2025-11-05
**Tests:** 130/130 passing
**Next:** Test 7 ARIA rules → 151-158 tests → 43% coverage
