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

test('aria-role-valid: passes valid role button', () => {
  resetDOM();
  const el = fixtures.ariaElement('button', { 'aria-pressed': 'false' });
  document.body.appendChild(el);

  const findings = window.__a11yEngine.run(['aria-role-valid']);

  assertNoFindings(findings, 'Valid role button should not have violations');
});

test('aria-role-valid: passes valid role navigation', () => {
  resetDOM();
  const el = fixtures.ariaElement('navigation');
  document.body.appendChild(el);

  const findings = window.__a11yEngine.run(['aria-role-valid']);

  assertNoFindings(findings, 'Valid role navigation should not have violations');
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

test('aria-required-props: detects missing required properties for checkbox', () => {
  resetDOM();
  const el = fixtures.ariaMissingRequiredProps();
  document.body.appendChild(el);

  const findings = window.__a11yEngine.run(['aria-required-props']);

  const finding = assertHasViolation(findings, 'aria-required-props', 'Should detect missing aria-checked');
  assertWCAGCriteria(finding, ['4.1.2'], 'Should reference WCAG 4.1.2');
});

test('aria-required-props: passes checkbox with required properties', () => {
  resetDOM();
  const el = fixtures.ariaWithRequiredProps();
  document.body.appendChild(el);

  const findings = window.__a11yEngine.run(['aria-required-props']);

  assertNoFindings(findings, 'Checkbox with aria-checked should pass');
});

test('aria-required-props: detects missing aria-valuenow for slider', () => {
  resetDOM();
  const el = createTestElement({
    tag: 'div',
    attrs: {
      role: 'slider',
      'aria-valuemin': '0',
      'aria-valuemax': '100'
      // Missing aria-valuenow
    },
    text: 'Volume'
  });
  document.body.appendChild(el);

  const findings = window.__a11yEngine.run(['aria-required-props']);

  assertHasViolation(findings, 'aria-required-props', 'Should detect missing aria-valuenow');
});

test('aria-required-props: passes slider with all required properties', () => {
  resetDOM();
  const el = createTestElement({
    tag: 'div',
    attrs: {
      role: 'slider',
      'aria-valuemin': '0',
      'aria-valuemax': '100',
      'aria-valuenow': '50'
    },
    text: 'Volume'
  });
  document.body.appendChild(el);

  const findings = window.__a11yEngine.run(['aria-required-props']);

  assertNoFindings(findings, 'Slider with all required properties should pass');
});

// =============================================================================
// RULE: aria-attr-valid
// =============================================================================

test('aria-attr-valid: detects invalid ARIA attribute', () => {
  resetDOM();
  const el = createTestElement({
    tag: 'div',
    attrs: { 'aria-invalid-attribute': 'value' },
    text: 'Element with invalid attribute'
  });
  document.body.appendChild(el);

  const findings = window.__a11yEngine.run(['aria-attr-valid']);

  const finding = assertHasViolation(findings, 'aria-attr-valid', 'Should detect invalid ARIA attribute');
  assertWCAGCriteria(finding, ['4.1.2'], 'Should reference WCAG 4.1.2');
});

test('aria-attr-valid: detects typo in ARIA attribute', () => {
  resetDOM();
  const el = createTestElement({
    tag: 'div',
    attrs: { 'aria-labelled-by': 'heading' }, // Typo: should be aria-labelledby
    text: 'Element with typo'
  });
  document.body.appendChild(el);

  const findings = window.__a11yEngine.run(['aria-attr-valid']);

  assertHasViolation(findings, 'aria-attr-valid', 'Should detect misspelled ARIA attribute');
});

test('aria-attr-valid: passes valid ARIA attributes', () => {
  resetDOM();
  const el = createTestElement({
    tag: 'div',
    attrs: {
      'aria-label': 'Valid label',
      'aria-hidden': 'false',
      'aria-live': 'polite'
    },
    text: 'Element with valid attributes'
  });
  document.body.appendChild(el);

  const findings = window.__a11yEngine.run(['aria-attr-valid']);

  assertNoFindings(findings, 'Valid ARIA attributes should pass');
});

// =============================================================================
// RULE: aria-allowed-attr
// =============================================================================

test('aria-allowed-attr: detects aria-label on presentation role', () => {
  resetDOM();
  const el = createTestElement({
    tag: 'div',
    attrs: {
      role: 'presentation',
      'aria-label': 'Should not have label'
    },
    text: 'Presentational element'
  });
  document.body.appendChild(el);

  const findings = window.__a11yEngine.run(['aria-allowed-attr']);

  const finding = assertHasViolation(findings, 'aria-allowed-attr', 'Presentation role should not have aria-label');
  assertWCAGCriteria(finding, ['4.1.2'], 'Should reference WCAG 4.1.2');
});

test('aria-allowed-attr: detects aria-labelledby on none role', () => {
  resetDOM();
  const el = createTestElement({
    tag: 'div',
    attrs: {
      role: 'none',
      'aria-labelledby': 'header'
    },
    text: 'None role element'
  });
  document.body.appendChild(el);

  const findings = window.__a11yEngine.run(['aria-allowed-attr']);

  assertHasViolation(findings, 'aria-allowed-attr', 'None role should not have aria-labelledby');
});

test('aria-allowed-attr: passes button with aria-pressed', () => {
  resetDOM();
  const el = createTestElement({
    tag: 'button',
    attrs: { 'aria-pressed': 'false' },
    text: 'Toggle button'
  });
  document.body.appendChild(el);

  const findings = window.__a11yEngine.run(['aria-allowed-attr']);

  assertNoFindings(findings, 'Button with aria-pressed should pass');
});

test('aria-allowed-attr: passes element with appropriate ARIA attributes', () => {
  resetDOM();
  const el = createTestElement({
    tag: 'div',
    attrs: {
      role: 'button',
      'aria-label': 'Close',
      'aria-pressed': 'false'
    },
    text: 'X'
  });
  document.body.appendChild(el);

  const findings = window.__a11yEngine.run(['aria-allowed-attr']);

  assertNoFindings(findings, 'Button role with appropriate attributes should pass');
});

// =============================================================================
// RULE: aria-required-children
// =============================================================================

test('aria-required-children: detects tablist without tab', () => {
  resetDOM();
  const tablist = createTestElement({
    tag: 'div',
    attrs: { role: 'tablist' },
    text: 'Empty tablist'
  });
  document.body.appendChild(tablist);

  const findings = window.__a11yEngine.run(['aria-required-children']);

  const finding = assertHasViolation(findings, 'aria-required-children', 'Tablist must contain tab elements');
  assertWCAGCriteria(finding, ['4.1.2'], 'Should reference WCAG 4.1.2');
});

test('aria-required-children: passes tablist with tab children', () => {
  resetDOM();
  const tablist = createTestElement({
    tag: 'div',
    attrs: { role: 'tablist' }
  });

  const tab1 = createTestElement({
    tag: 'div',
    attrs: { role: 'tab' },
    text: 'Tab 1'
  });

  const tab2 = createTestElement({
    tag: 'div',
    attrs: { role: 'tab' },
    text: 'Tab 2'
  });

  tablist.appendChild(tab1);
  tablist.appendChild(tab2);
  document.body.appendChild(tablist);

  const findings = window.__a11yEngine.run(['aria-required-children']);

  assertNoFindings(findings, 'Tablist with tab children should pass');
});

test('aria-required-children: passes tablist with nested tab', () => {
  resetDOM();
  const tablist = createTestElement({
    tag: 'div',
    attrs: { role: 'tablist' }
  });

  const wrapper = createTestElement({ tag: 'div' });
  const tab = createTestElement({
    tag: 'button',
    attrs: { role: 'tab' },
    text: 'Settings'
  });

  wrapper.appendChild(tab);
  tablist.appendChild(wrapper);
  document.body.appendChild(tablist);

  const findings = window.__a11yEngine.run(['aria-required-children']);

  assertNoFindings(findings, 'Tablist with nested tab should pass');
});

// =============================================================================
// RULE: aria-required-parent
// =============================================================================

test('aria-required-parent: detects tab without tablist parent', () => {
  resetDOM();
  const tab = createTestElement({
    tag: 'div',
    attrs: { role: 'tab' },
    text: 'Orphaned tab'
  });
  document.body.appendChild(tab);

  const findings = window.__a11yEngine.run(['aria-required-parent']);

  const finding = assertHasViolation(findings, 'aria-required-parent', 'Tab must be within tablist');
  assertWCAGCriteria(finding, ['4.1.2'], 'Should reference WCAG 4.1.2');
});

test('aria-required-parent: passes tab with tablist parent', () => {
  resetDOM();
  const tablist = createTestElement({
    tag: 'div',
    attrs: { role: 'tablist' }
  });

  const tab = createTestElement({
    tag: 'button',
    attrs: { role: 'tab' },
    text: 'Home'
  });

  tablist.appendChild(tab);
  document.body.appendChild(tablist);

  const findings = window.__a11yEngine.run(['aria-required-parent']);

  assertNoFindings(findings, 'Tab within tablist should pass');
});

test('aria-required-parent: passes tab with nested tablist ancestor', () => {
  resetDOM();
  const tablist = createTestElement({
    tag: 'div',
    attrs: { role: 'tablist' }
  });

  const wrapper = createTestElement({ tag: 'div', attrs: { class: 'tab-wrapper' } });
  const tab = createTestElement({
    tag: 'button',
    attrs: { role: 'tab' },
    text: 'Profile'
  });

  wrapper.appendChild(tab);
  tablist.appendChild(wrapper);
  document.body.appendChild(tablist);

  const findings = window.__a11yEngine.run(['aria-required-parent']);

  assertNoFindings(findings, 'Tab with tablist ancestor should pass');
});

// =============================================================================
// RULE: aria-presentation-misuse
// =============================================================================

test('aria-presentation-misuse: detects presentation role on button', () => {
  resetDOM();
  const button = createTestElement({
    tag: 'button',
    attrs: { role: 'presentation' },
    text: 'Click me'
  });
  document.body.appendChild(button);

  const findings = window.__a11yEngine.run(['aria-presentation-misuse']);

  const finding = assertHasViolation(findings, 'aria-presentation-misuse', 'Button should not have presentation role');
  assertWCAGCriteria(finding, ['1.3.1', '4.1.2'], 'Should reference WCAG 1.3.1 and 4.1.2');
});

test('aria-presentation-misuse: detects none role on link', () => {
  resetDOM();
  const link = createTestElement({
    tag: 'a',
    attrs: { href: '#', role: 'none' },
    text: 'Link text'
  });
  document.body.appendChild(link);

  const findings = window.__a11yEngine.run(['aria-presentation-misuse']);

  assertHasViolation(findings, 'aria-presentation-misuse', 'Link should not have none role');
});

test('aria-presentation-misuse: detects presentation role on input', () => {
  resetDOM();
  const input = createTestElement({
    tag: 'input',
    attrs: { type: 'text', role: 'presentation' }
  });
  document.body.appendChild(input);

  const findings = window.__a11yEngine.run(['aria-presentation-misuse']);

  assertHasViolation(findings, 'aria-presentation-misuse', 'Input should not have presentation role');
});

test('aria-presentation-misuse: passes presentation role on decorative div', () => {
  resetDOM();
  const div = createTestElement({
    tag: 'div',
    attrs: { role: 'presentation' },
    text: 'Decorative content'
  });
  document.body.appendChild(div);

  const findings = window.__a11yEngine.run(['aria-presentation-misuse']);

  assertNoFindings(findings, 'Decorative div with presentation role should pass');
});

test('aria-presentation-misuse: passes none role on decorative span', () => {
  resetDOM();
  const span = createTestElement({
    tag: 'span',
    attrs: { role: 'none' }
  });
  document.body.appendChild(span);

  const findings = window.__a11yEngine.run(['aria-presentation-misuse']);

  assertNoFindings(findings, 'Decorative span with none role should pass');
});

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
  console.log(`   Total tests: ${tests.length}`);

  if (failed === 0) {
    console.log('\n✨ All ARIA rule tests passing!');
    console.log(`\n🎯 Coverage: 7 ARIA rules tested with ${tests.length} test cases`);
  } else {
    console.log('\n❌ Some tests failed!');
    process.exit(1);
  }
}

runTests();
