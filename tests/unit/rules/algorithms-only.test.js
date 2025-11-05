#!/usr/bin/env node
/**
 * Algorithm-Only Tests - Tests that don't require canvas
 *
 * These tests validate the core algorithms without canvas dependency:
 * - Luminance calculations
 * - Contrast ratio calculations
 * - Alpha compositing
 * - Utility functions
 *
 * Run: node tests/unit/rules/algorithms-only.test.js
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

// Setup JSDOM
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.getComputedStyle = dom.window.getComputedStyle;
global.Node = dom.window.Node;
global.Element = dom.window.Element;
global.CSS = dom.window.CSS || {
  escape: (str) => String(str).replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, '\\$&')
};

// Load engine
const engineCode = fs.readFileSync(path.join(__dirname, '../../../engine.js'), 'utf8');
eval(engineCode);

console.log('🧮 Testing Core Algorithms (Canvas-Independent)\n');
console.log('='.repeat(70));

const tests = [];
let passed = 0;
let failed = 0;

function test(name, fn) {
  tests.push({ name, fn });
}

function assertClose(actual, expected, tolerance, message) {
  if (Math.abs(actual - expected) > tolerance) {
    throw new Error(`${message}: expected ${expected} ±${tolerance}, got ${actual}`);
  }
}

function runTests() {
  for (const { name, fn } of tests) {
    try {
      fn();
      console.log(`✅ ${name}`);
      passed++;
    } catch (e) {
      console.error(`❌ ${name}`);
      console.error(`   ${e.message}`);
      failed++;
    }
  }
}

// ============================================================================
// CORE ALGORITHM TESTS (No Canvas Required)
// ============================================================================

test('relLuminance: black = 0', () => {
  const testAPI = window.__a11yEngine._test;
  const luminance = testAPI.relLuminance([0, 0, 0]);
  assert.strictEqual(luminance, 0);
});

test('relLuminance: white ≈ 1.0', () => {
  const testAPI = window.__a11yEngine._test;
  const luminance = testAPI.relLuminance([255, 255, 255]);
  assertClose(luminance, 1.0, 0.01, 'White luminance');
});

test('relLuminance: gray(128) ≈ 0.216', () => {
  const testAPI = window.__a11yEngine._test;
  const luminance = testAPI.relLuminance([128, 128, 128]);
  assertClose(luminance, 0.2159, 0.01, 'Gray luminance');
});

test('relLuminance: red(255,0,0) ≈ 0.2126', () => {
  const testAPI = window.__a11yEngine._test;
  const luminance = testAPI.relLuminance([255, 0, 0]);
  assertClose(luminance, 0.2126, 0.01, 'Red luminance');
});

test('relLuminance: green(0,255,0) ≈ 0.7152', () => {
  const testAPI = window.__a11yEngine._test;
  const luminance = testAPI.relLuminance([0, 255, 0]);
  assertClose(luminance, 0.7152, 0.01, 'Green luminance');
});

test('relLuminance: blue(0,0,255) ≈ 0.0722', () => {
  const testAPI = window.__a11yEngine._test;
  const luminance = testAPI.relLuminance([0, 0, 255]);
  assertClose(luminance, 0.0722, 0.01, 'Blue luminance');
});

test('contrastRatio: black/white = 21:1', () => {
  const testAPI = window.__a11yEngine._test;
  const ratio = testAPI.contrastRatio([0, 0, 0], [255, 255, 255]);
  assertClose(ratio, 21, 0.1, 'Black on white');
});

test('contrastRatio: white/black = 21:1 (commutative)', () => {
  const testAPI = window.__a11yEngine._test;
  const ratio = testAPI.contrastRatio([255, 255, 255], [0, 0, 0]);
  assertClose(ratio, 21, 0.1, 'White on black');
});

test('contrastRatio: same color = 1:1', () => {
  const testAPI = window.__a11yEngine._test;
  const ratio = testAPI.contrastRatio([128, 128, 128], [128, 128, 128]);
  assertClose(ratio, 1, 0.01, 'Same color');
});

test('contrastRatio: WCAG AA (4.5:1) threshold', () => {
  const testAPI = window.__a11yEngine._test;
  // #767676 on white is 4.54:1
  const ratio = testAPI.contrastRatio([118, 118, 118], [255, 255, 255]);
  assert(ratio >= 4.5, `Should pass AA (4.5:1), got ${ratio.toFixed(2)}:1`);
});

test('contrastRatio: WCAG AAA (7:1) threshold', () => {
  const testAPI = window.__a11yEngine._test;
  // #595959 on white is ~7:1
  const ratio = testAPI.contrastRatio([89, 89, 89], [255, 255, 255]);
  assert(ratio >= 7, `Should pass AAA (7:1), got ${ratio.toFixed(2)}:1`);
});

test('contrastRatio: fails WCAG AA', () => {
  const testAPI = window.__a11yEngine._test;
  // #aaa on white is 2.32:1 (fails)
  const ratio = testAPI.contrastRatio([170, 170, 170], [255, 255, 255]);
  assert(ratio < 4.5, `Should fail AA, got ${ratio.toFixed(2)}:1`);
});

test('compositeOver: opaque foreground', () => {
  const testAPI = window.__a11yEngine._test;
  const result = testAPI.compositeOver([255, 0, 0, 1.0], [0, 255, 0]);
  assert.deepStrictEqual(result, [255, 0, 0]);
});

test('compositeOver: transparent foreground', () => {
  const testAPI = window.__a11yEngine._test;
  const result = testAPI.compositeOver([255, 0, 0, 0.0], [0, 255, 0]);
  assert.deepStrictEqual(result, [0, 255, 0]);
});

test('compositeOver: 50% alpha', () => {
  const testAPI = window.__a11yEngine._test;
  const result = testAPI.compositeOver([200, 0, 0, 0.5], [0, 100, 0]);
  assertClose(result[0], 100, 5, 'Red channel');
  assertClose(result[1], 50, 5, 'Green channel');
  assert.strictEqual(result[2], 0);
});

test('compositeOver: 80% white over black', () => {
  const testAPI = window.__a11yEngine._test;
  const result = testAPI.compositeOver([255, 255, 255, 0.8], [0, 0, 0]);
  assertClose(result[0], 204, 5, 'Red');
  assertClose(result[1], 204, 5, 'Green');
  assertClose(result[2], 204, 5, 'Blue');
});

test('cssPath: uses ID when available', () => {
  const testAPI = window.__a11yEngine._test;
  const div = document.createElement('div');
  div.id = 'test-id';
  document.body.appendChild(div);

  const path = testAPI.cssPath(div);
  assert.strictEqual(path, '#test-id');

  document.body.innerHTML = '';
});

test('cssPath: generates nth-child selector', () => {
  const testAPI = window.__a11yEngine._test;
  const parent = document.createElement('div');
  const child1 = document.createElement('span');
  const child2 = document.createElement('span');

  parent.appendChild(child1);
  parent.appendChild(child2);
  document.body.appendChild(parent);

  const path = testAPI.cssPath(child2);
  assert(path.includes('nth-child(2)'), `Should contain nth-child(2), got: ${path}`);

  document.body.innerHTML = '';
});

test('isElementVisible: visible element', () => {
  const testAPI = window.__a11yEngine._test;
  const div = document.createElement('div');
  div.style.display = 'block';
  div.style.visibility = 'visible';
  div.style.opacity = '1';
  div.style.width = '100px';
  div.style.height = '100px';
  document.body.appendChild(div);

  // Mock getBoundingClientRect
  div.getBoundingClientRect = () => ({ width: 100, height: 100 });

  const visible = testAPI.isElementVisible(div);
  assert.strictEqual(visible, true);

  document.body.innerHTML = '';
});

test('isElementVisible: display none', () => {
  const testAPI = window.__a11yEngine._test;
  const div = document.createElement('div');
  div.style.display = 'none';
  document.body.appendChild(div);

  const visible = testAPI.isElementVisible(div);
  assert.strictEqual(visible, false);

  document.body.innerHTML = '';
});

test('isElementVisible: visibility hidden', () => {
  const testAPI = window.__a11yEngine._test;
  const div = document.createElement('div');
  div.style.visibility = 'hidden';
  document.body.appendChild(div);

  const visible = testAPI.isElementVisible(div);
  assert.strictEqual(visible, false);

  document.body.innerHTML = '';
});

test('isElementVisible: opacity 0', () => {
  const testAPI = window.__a11yEngine._test;
  const div = document.createElement('div');
  div.style.opacity = '0';
  document.body.appendChild(div);

  const visible = testAPI.isElementVisible(div);
  assert.strictEqual(visible, false);

  document.body.innerHTML = '';
});

test('getAccName: button with text content', () => {
  const testAPI = window.__a11yEngine._test;
  const button = document.createElement('button');
  button.textContent = 'Click Me';
  document.body.appendChild(button);

  const result = testAPI.getAccName(button);
  assert.strictEqual(result.name, 'Click Me');

  document.body.innerHTML = '';
});

test('getAccName: element with aria-label', () => {
  const testAPI = window.__a11yEngine._test;
  const div = document.createElement('div');
  div.setAttribute('aria-label', 'Custom Label');
  document.body.appendChild(div);

  const result = testAPI.getAccName(div);
  assert.strictEqual(result.name, 'Custom Label');

  document.body.innerHTML = '';
});

test('getAccName: img with alt', () => {
  const testAPI = window.__a11yEngine._test;
  const img = document.createElement('img');
  img.setAttribute('alt', 'Image description');
  document.body.appendChild(img);

  const result = testAPI.getAccName(img);
  assert.strictEqual(result.name, 'Image description');

  document.body.innerHTML = '';
});

test('getAccName: element with aria-labelledby', () => {
  const testAPI = window.__a11yEngine._test;
  const label = document.createElement('div');
  label.id = 'label-id';
  label.textContent = 'Label Text';

  const input = document.createElement('input');
  input.setAttribute('aria-labelledby', 'label-id');

  document.body.appendChild(label);
  document.body.appendChild(input);

  const result = testAPI.getAccName(input);
  assert.strictEqual(result.name, 'Label Text');

  document.body.innerHTML = '';
});

test('isPresentational: role=presentation', () => {
  const testAPI = window.__a11yEngine._test;
  const div = document.createElement('div');
  div.setAttribute('role', 'presentation');
  document.body.appendChild(div);

  const result = testAPI.isPresentational(div);
  assert.strictEqual(result, true);

  document.body.innerHTML = '';
});

test('isPresentational: role=none', () => {
  const testAPI = window.__a11yEngine._test;
  const div = document.createElement('div');
  div.setAttribute('role', 'none');
  document.body.appendChild(div);

  const result = testAPI.isPresentational(div);
  assert.strictEqual(result, true);

  document.body.innerHTML = '';
});

test('isPresentational: normal element', () => {
  const testAPI = window.__a11yEngine._test;
  const div = document.createElement('div');
  document.body.appendChild(div);

  const result = testAPI.isPresentational(div);
  assert.strictEqual(result, false);

  document.body.innerHTML = '';
});

// ============================================================================
// RUN ALL TESTS
// ============================================================================

console.log('\n📋 Running algorithm tests...\n');
runTests();

console.log('\n' + '='.repeat(70));
console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);

if (failed > 0) {
  console.log('\n❌ Some tests failed!\n');
  process.exit(1);
} else {
  console.log('\n✨ All algorithm tests passing!\n');
  process.exit(0);
}
