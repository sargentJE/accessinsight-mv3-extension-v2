#!/usr/bin/env node
/**
 * Test Suite for Core Interactive Rules (Phase 7 - Wave 2)
 *
 * Tests 2 core interactive/usability rules:
 * - target-size: Interactive controls should be ≥24×24 CSS pixels
 * - link-in-text-block: Links in text must be visually distinguished
 *
 * Run: node tests/unit/rules/interactive-core.test.js
 */

const { fullSetup, resetDOM } = require('../../helpers/jsdom-setup');
const { fixtures, createTestElement } = require('../../helpers/dom-fixtures');
const { assertHasViolation, assertNoFindings, assertWCAGCriteria } = require('../../helpers/assertions');

// Setup environment once
fullSetup();

console.log('🎯 Testing Core Interactive Rules (Phase 7 - Wave 2)\n');
console.log('='.repeat(70));

const tests = [];
let passed = 0;
let failed = 0;

function test(name, fn) {
  tests.push({ name, fn });
}

// =============================================================================
// RULE: target-size (MEDIUM)
// WCAG 2.5.8 - Target Size (Minimum)
// =============================================================================
// Implementation: Checks interactive elements are ≥24×24px using getBoundingClientRect()
// Flags if width OR height < 24px
// Interactive elements: button, select, textarea, a[href], input, interactive roles, tabindex≥0
// Limitations:
// - Uses bounding rectangle, not actual hit target area
// - Doesn't account for CSS transforms affecting clickable area
// - Doesn't check spacing between targets
// - May report false positives for visual size ≠ bounding box

test('target-size: passes button exactly 24×24px', () => {
  resetDOM();
  const button = fixtures.smallButton(24, 24);
  document.body.appendChild(button);

  const findings = window.__a11yEngine.run(['target-size']);

  assertNoFindings(findings, 'Button exactly 24×24px should pass');
});

test('target-size: detects button with one dimension too small (23×30px)', () => {
  resetDOM();
  const button = fixtures.smallButton(23, 30);
  document.body.appendChild(button);

  const findings = window.__a11yEngine.run(['target-size']);

  const finding = assertHasViolation(findings, 'target-size', 'Button 23×30px should be flagged (width < 24)');
  assertWCAGCriteria(finding, ['2.5.8'], 'Should reference WCAG 2.5.8');
});

test('target-size: detects link with href that is too small (20×20px)', () => {
  resetDOM();
  const link = fixtures.tinyLink();
  document.body.appendChild(link);

  const findings = window.__a11yEngine.run(['target-size']);

  assertHasViolation(findings, 'target-size', 'Link 20×20px should be flagged');
});

test('target-size: skips link without href (not interactive)', () => {
  resetDOM();
  const link = fixtures.linkWithoutHref();
  document.body.appendChild(link);

  const findings = window.__a11yEngine.run(['target-size']);

  assertNoFindings(findings, 'Link without href is not interactive, should be skipped');
});

test('target-size: passes input field 30×25px', () => {
  resetDOM();
  const input = fixtures.smallInput();
  document.body.appendChild(input);

  const findings = window.__a11yEngine.run(['target-size']);

  assertNoFindings(findings, 'Input 30×25px (both dimensions ≥24) should pass');
});

test('target-size: detects element with role="button" and tabindex that is too small', () => {
  resetDOM();
  const element = fixtures.interactiveRole('button', 22, 22);
  document.body.appendChild(element);

  const findings = window.__a11yEngine.run(['target-size']);

  assertHasViolation(findings, 'target-size', 'Element with role="button" and 22×22px should be flagged');
});

test('target-size: detects disabled button that is too small (still evaluated)', () => {
  resetDOM();
  const button = fixtures.disabledSmallButton();
  document.body.appendChild(button);

  const findings = window.__a11yEngine.run(['target-size']);

  assertHasViolation(findings, 'target-size', 'Disabled button 20×20px should still be flagged (disabled elements are evaluated)');
});

test('target-size: passes large button 50×50px', () => {
  resetDOM();
  const button = fixtures.largeButton();
  document.body.appendChild(button);

  const findings = window.__a11yEngine.run(['target-size']);

  assertNoFindings(findings, 'Large button 50×50px should pass');
});

test('target-size: passes SVG with interactive role at 24×24px', () => {
  resetDOM();
  const svg = fixtures.svgInteractiveElement();
  document.body.appendChild(svg);

  const findings = window.__a11yEngine.run(['target-size']);

  assertNoFindings(findings, 'SVG with role="button" at 24×24px should pass');
});

// =============================================================================
// RULE: link-in-text-block (MEDIUM)
// WCAG 1.4.1 - Use of Color
// =============================================================================
// Implementation: Checks links in text blocks (p, li, dd, dt, span, div)
// Passes if: underline OR border-bottom OR color contrast ≥3:1 with surrounding text
// Limitations:
// - Only checks immediate parent block's text color
// - Doesn't account for actual adjacent sibling text colors
// - Doesn't consider hover/focus states
// - May miss links in block types not in selector list
// - Doesn't check for other distinctions (bold, size, icons)

test('link-in-text-block: passes link with text-decoration underline', () => {
  resetDOM();
  const textBlock = fixtures.textBlockWithUnderlinedLink();
  document.body.appendChild(textBlock);

  const findings = window.__a11yEngine.run(['link-in-text-block']);

  assertNoFindings(findings, 'Link with underline should pass');
});

test('link-in-text-block: passes link with border-bottom', () => {
  resetDOM();
  const textBlock = fixtures.textBlockWithBorderedLink();
  document.body.appendChild(textBlock);

  const findings = window.__a11yEngine.run(['link-in-text-block']);

  assertNoFindings(findings, 'Link with border-bottom should pass');
});

test('link-in-text-block: passes link with sufficient color contrast (≥3:1)', () => {
  resetDOM();
  // Red link (rgb(255,0,0)) vs black text (rgb(0,0,0)) has sufficient contrast (≥3:1)
  // Note: Pure blue (0,0,255) only has 2.44:1 contrast with black
  const textBlock = fixtures.textBlockWithContrastLink('rgb(255, 0, 0)');
  document.body.appendChild(textBlock);

  const findings = window.__a11yEngine.run(['link-in-text-block']);

  assertNoFindings(findings, 'Link with sufficient color contrast (≥3:1) should pass even without underline');
});

test('link-in-text-block: detects link with insufficient contrast and no underline', () => {
  resetDOM();
  // Same color as text: rgb(0,0,0) vs rgb(0,0,0) = 1:1 contrast
  const textBlock = fixtures.textBlockWithPlainLink();
  document.body.appendChild(textBlock);

  const findings = window.__a11yEngine.run(['link-in-text-block']);

  const finding = assertHasViolation(findings, 'link-in-text-block', 'Link with same color as text and no underline should be flagged');
  assertWCAGCriteria(finding, ['1.4.1'], 'Should reference WCAG 1.4.1');
});

test('link-in-text-block: skips link outside text block (in nav)', () => {
  resetDOM();
  const nav = fixtures.linkInNavigation();
  document.body.appendChild(nav);

  const findings = window.__a11yEngine.run(['link-in-text-block']);

  // Link in <nav> is not inside p, li, dd, dt, span, or div
  assertNoFindings(findings, 'Link in <nav> (not a text block) should be skipped');
});

test('link-in-text-block: passes link nested in span inside paragraph', () => {
  resetDOM();
  const textBlock = fixtures.nestedTextLink();
  document.body.appendChild(textBlock);

  const findings = window.__a11yEngine.run(['link-in-text-block']);

  // Link has underline, should pass
  assertNoFindings(findings, 'Link in span inside paragraph with underline should pass');
});

test('link-in-text-block: detects link with only font-weight difference', () => {
  resetDOM();
  const textBlock = fixtures.textBlockWithBoldLink();
  document.body.appendChild(textBlock);

  const findings = window.__a11yEngine.run(['link-in-text-block']);

  // Bold doesn't count as visual distinction; same color (black) = 1:1 contrast
  assertHasViolation(findings, 'link-in-text-block', 'Link with only font-weight difference (no color contrast) should be flagged');
});

test('link-in-text-block: detects link with outline instead of underline', () => {
  resetDOM();
  const textBlock = fixtures.textBlockWithOutlineLink();
  document.body.appendChild(textBlock);

  const findings = window.__a11yEngine.run(['link-in-text-block']);

  // Outline doesn't count (only checks underline/border-bottom); same color = violation
  // Note: Engine only checks text-decoration-line and border-bottom-style
  assertHasViolation(findings, 'link-in-text-block', 'Link with outline (not underline/border-bottom) and same color should be flagged');
});

// =============================================================================
// Run All Tests
// =============================================================================

console.log('');
tests.forEach(({ name, fn }) => {
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (err) {
    console.error(`❌ FAIL: ${name}`);
    console.error(`   ${err.message}`);
    failed++;
  }
});

console.log('');
console.log('='.repeat(70));
console.log('');
console.log(`📊 Results: ${passed} passed, ${failed} failed`);
console.log(`   Total tests: ${tests.length}`);

if (failed === 0) {
  console.log('');
  console.log('✨ All core interactive rules tests passing!');
  console.log('');
  console.log('🎯 Coverage: 2 core interactive rules tested with 17 test cases');
  console.log('');
  console.log('📈 Wave 2 complete - Ready for Wave 3');
  process.exit(0);
} else {
  console.log('');
  console.error('💥 Some tests failed. Please review.');
  process.exit(1);
}
