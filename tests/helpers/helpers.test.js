#!/usr/bin/env node
/**
 * Test Suite for Helper Functions
 *
 * Verifies that our test helpers work correctly
 */

const { fullSetup, resetDOM } = require('./jsdom-setup');
const { fixtures } = require('./dom-fixtures');
const { assertNoFindings, assertHasViolation, assertWCAGCriteria } = require('./assertions');

// Setup environment
fullSetup();

console.log('🧪 Testing Helper Functions\n');
console.log('='.repeat(70));

let passed = 0;
let failed = 0;

function test(name, fn) {
  resetDOM();
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

// Test fixtures
test('fixtures.accessibleButton creates button', () => {
  const button = fixtures.accessibleButton();
  if (button.tagName !== 'BUTTON') throw new Error('Not a button');
  if (button.textContent !== 'Click me') throw new Error('Wrong text');
});

test('fixtures.lowContrastText has correct styles', () => {
  const el = fixtures.lowContrastText();
  // Just verify styles are set (JSDOM normalizes color formats)
  if (!el.style.color) throw new Error('No color set');
  if (!el.style.backgroundColor) throw new Error('No background set');
  if (el.style.fontSize !== '14px') throw new Error('Wrong font size');
  if (el.style.display !== 'block') throw new Error('Wrong display');
});

test('fixtures.nonFocusableButton creates div with role', () => {
  const el = fixtures.nonFocusableButton();
  if (el.tagName !== 'DIV') throw new Error('Not a div');
  if (el.getAttribute('role') !== 'button') throw new Error('Wrong role');
  if (el.hasAttribute('tabindex')) throw new Error('Should not have tabindex');
});

// Test assertions with engine
test('assertNoFindings passes for accessible button', () => {
  const button = fixtures.accessibleButton();
  document.body.appendChild(button);
  const findings = window.__a11yEngine.run(['button-name']);
  assertNoFindings(findings, 'Accessible button should pass');
});

test('assertHasViolation detects button without name', () => {
  const button = fixtures.buttonWithoutName();
  document.body.appendChild(button);
  const findings = window.__a11yEngine.run(['button-name']);
  const finding = assertHasViolation(findings, 'button-name');
  if (!finding) throw new Error('Should return finding object');
});

test('assertWCAGCriteria verifies WCAG references', () => {
  const button = fixtures.buttonWithoutName();
  document.body.appendChild(button);
  const findings = window.__a11yEngine.run(['button-name']);
  const finding = assertHasViolation(findings, 'button-name');
  assertWCAGCriteria(finding, ['4.1.2'], 'Should reference WCAG 4.1.2');
});

test('Helpers can be composed together', () => {
  // Create multiple elements using fixtures
  const button = fixtures.buttonWithoutName();
  const link = fixtures.linkWithoutName();
  const img = fixtures.imageWithoutAlt();

  document.body.appendChild(button);
  document.body.appendChild(link);
  document.body.appendChild(img);

  // Run multiple rules
  const findings = window.__a11yEngine.run(['button-name', 'link-name', 'img-alt']);

  // Should find 3 violations
  if (findings.length !== 3) {
    throw new Error(`Expected 3 findings, got ${findings.length}`);
  }

  // Verify each violation
  assertHasViolation(findings, 'button-name');
  assertHasViolation(findings, 'link-name');
  assertHasViolation(findings, 'img-alt');
});

console.log('\n' + '='.repeat(70));
console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);

if (failed === 0) {
  console.log('\n✨ All helper tests passing!');
  console.log('\n💡 Helpers are ready to use in test files');
} else {
  console.log('\n❌ Some helper tests failed!');
  process.exit(1);
}
