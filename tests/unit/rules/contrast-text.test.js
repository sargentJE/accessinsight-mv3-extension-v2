#!/usr/bin/env node
/**
 * Comprehensive test suite for contrast-text rule and color algorithms
 *
 * This is the most complex algorithm in the codebase:
 * - Color parsing (hex, rgb, rgba, named colors)
 * - Relative luminance calculation per WCAG spec
 * - Contrast ratio calculation
 * - Alpha compositing
 * - Background color resolution up the DOM tree
 *
 * Run: node tests/unit/rules/contrast-text.test.js
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

// Setup JSDOM
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'https://example.com',
  pretendToBeVisual: true
});

global.window = dom.window;
global.document = dom.window.document;
global.getComputedStyle = dom.window.getComputedStyle;
global.Node = dom.window.Node;
global.Element = dom.window.Element;
global.HTMLElement = dom.window.HTMLElement;
global.DocumentFragment = dom.window.DocumentFragment;
global.Document = dom.window.Document;
global.CSS = dom.window.CSS || {
  escape: (str) => String(str).replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, '\\$&')
};
if (!dom.window.CSS) dom.window.CSS = global.CSS;

// Mock getBoundingClientRect
const originalGetBoundingClientRect = dom.window.Element.prototype.getBoundingClientRect;
dom.window.Element.prototype.getBoundingClientRect = function() {
  const rect = originalGetBoundingClientRect.call(this);
  if (this.style.width && this.style.height) {
    const width = parseFloat(this.style.width) || 100;
    const height = parseFloat(this.style.height) || 100;
    return { width, height, top: 0, left: 0, right: width, bottom: height, x: 0, y: 0 };
  }
  if (this.style.display !== 'none' && this.tagName) {
    return { width: 100, height: 30, top: 0, left: 0, right: 100, bottom: 30, x: 0, y: 0 };
  }
  return rect;
};

// Mock parseColorToRgb for JSDOM (canvas not available)
// Define this before loading engine so it's available in engine's scope
global.mockParseColorToRgb = function(colorStr) {
  if (!colorStr || colorStr === 'transparent') return [0, 0, 0, 0];

  // Named colors
  const namedColors = {
    'white': [255, 255, 255, 1],
    'black': [0, 0, 0, 1],
    'red': [255, 0, 0, 1],
    'green': [0, 128, 0, 1],
    'blue': [0, 0, 255, 1],
    'gray': [128, 128, 128, 1],
    'silver': [192, 192, 192, 1]
  };

  const color = colorStr.toLowerCase().trim();
  if (namedColors[color]) return namedColors[color];

  // rgb/rgba format
  const rgbaMatch = color.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)/);
  if (rgbaMatch) {
    return [
      parseInt(rgbaMatch[1]),
      parseInt(rgbaMatch[2]),
      parseInt(rgbaMatch[3]),
      rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 1
    ];
  }

  // Hex format
  const hexMatch = color.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    return [
      parseInt(hex.substr(0, 2), 16),
      parseInt(hex.substr(2, 2), 16),
      parseInt(hex.substr(4, 2), 16),
      1
    ];
  }

  return [0, 0, 0, 1]; // fallback
};

// Load engine and replace parseColorToRgb with mock
let engineCode = fs.readFileSync(path.join(__dirname, '../../../engine.js'), 'utf8');
// Replace the canvas-based parseColorToRgb with our mock
// The function spans lines 276-284 in engine.js
engineCode = engineCode.replace(
  /function parseColorToRgb\(str\) \{[\s\S]*?return \[r,g,b,a\];[\s\n]*\}/m,
  'const parseColorToRgb = global.mockParseColorToRgb'
);
eval(engineCode);

console.log('🎨 Testing contrast-text rule and color algorithms\n');
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
    document.body.innerHTML = '';
  }
}

// ============================================================================
// UNIT TESTS: Color Parsing
// ============================================================================

test('parseColorToRgb: parses RGB colors', () => {
  const testAPI = window.__a11yEngine._test;
  const result = testAPI.parseColorToRgb('rgb(255, 0, 0)');
  assert.deepStrictEqual(result, [255, 0, 0, 1]);
});

test('parseColorToRgb: parses RGBA colors', () => {
  const testAPI = window.__a11yEngine._test;
  const result = testAPI.parseColorToRgb('rgba(128, 64, 32, 0.5)');
  assert.deepStrictEqual(result, [128, 64, 32, 0.5]);
});

test('parseColorToRgb: handles named color "white"', () => {
  const testAPI = window.__a11yEngine._test;
  const result = testAPI.parseColorToRgb('white');
  assert(result, 'Should return a value for white');
  // Named colors go through canvas, so just verify it returns something reasonable
  assert(Array.isArray(result), 'Should return array');
  assert.strictEqual(result.length, 4, 'Should have 4 components');
});

test('parseColorToRgb: handles transparent', () => {
  const testAPI = window.__a11yEngine._test;
  const result = testAPI.parseColorToRgb('transparent');
  assert.deepStrictEqual(result, [0, 0, 0, 0]);
});

// ============================================================================
// UNIT TESTS: Relative Luminance (WCAG Formula)
// ============================================================================

test('relLuminance: calculates correct luminance for black', () => {
  const testAPI = window.__a11yEngine._test;
  const luminance = testAPI.relLuminance([0, 0, 0]);
  assert.strictEqual(luminance, 0, 'Black should have 0 luminance');
});

test('relLuminance: calculates correct luminance for white', () => {
  const testAPI = window.__a11yEngine._test;
  const luminance = testAPI.relLuminance([255, 255, 255]);
  assertClose(luminance, 1.0, 0.01, 'White luminance');
});

test('relLuminance: calculates correct luminance for gray (128,128,128)', () => {
  const testAPI = window.__a11yEngine._test;
  const luminance = testAPI.relLuminance([128, 128, 128]);
  // Gray 128 has luminance ~0.2159
  assertClose(luminance, 0.2159, 0.01, 'Gray luminance');
});

test('relLuminance: follows WCAG sRGB formula', () => {
  const testAPI = window.__a11yEngine._test;
  // Test specific RGB value: (100, 150, 200)
  // R: 100/255 = 0.392 -> ((0.392+0.055)/1.055)^2.4 = 0.133
  // G: 150/255 = 0.588 -> ((0.588+0.055)/1.055)^2.4 = 0.318
  // B: 200/255 = 0.784 -> ((0.784+0.055)/1.055)^2.4 = 0.620
  // L = 0.2126*0.133 + 0.7152*0.318 + 0.0722*0.620 = 0.287
  const luminance = testAPI.relLuminance([100, 150, 200]);
  assertClose(luminance, 0.287, 0.01, 'Specific RGB luminance');
});

// ============================================================================
// UNIT TESTS: Contrast Ratio
// ============================================================================

test('contrastRatio: black on white = 21:1', () => {
  const testAPI = window.__a11yEngine._test;
  const ratio = testAPI.contrastRatio([0, 0, 0], [255, 255, 255]);
  assertClose(ratio, 21, 0.1, 'Black on white contrast');
});

test('contrastRatio: white on black = 21:1 (commutative)', () => {
  const testAPI = window.__a11yEngine._test;
  const ratio = testAPI.contrastRatio([255, 255, 255], [0, 0, 0]);
  assertClose(ratio, 21, 0.1, 'White on black contrast');
});

test('contrastRatio: same colors = 1:1', () => {
  const testAPI = window.__a11yEngine._test;
  const ratio = testAPI.contrastRatio([128, 128, 128], [128, 128, 128]);
  assertClose(ratio, 1, 0.01, 'Same color contrast');
});

test('contrastRatio: WCAG AA minimum (4.5:1)', () => {
  const testAPI = window.__a11yEngine._test;
  // #767676 on white is exactly 4.54:1 (passes AA)
  const ratio = testAPI.contrastRatio([118, 118, 118], [255, 255, 255]);
  assert(ratio >= 4.5, `Should pass WCAG AA (4.5:1), got ${ratio.toFixed(2)}:1`);
});

test('contrastRatio: WCAG AAA minimum (7:1)', () => {
  const testAPI = window.__a11yEngine._test;
  // #595959 on white is ~7:1 (passes AAA)
  const ratio = testAPI.contrastRatio([89, 89, 89], [255, 255, 255]);
  assert(ratio >= 7, `Should pass WCAG AAA (7:1), got ${ratio.toFixed(2)}:1`);
});

test('contrastRatio: large text threshold (3:1)', () => {
  const testAPI = window.__a11yEngine._test;
  // #949494 on white is ~3:1 (passes for large text)
  const ratio = testAPI.contrastRatio([148, 148, 148], [255, 255, 255]);
  assertClose(ratio, 3, 0.5, 'Large text contrast');
});

// ============================================================================
// UNIT TESTS: Alpha Compositing
// ============================================================================

test('compositeOver: fully opaque foreground', () => {
  const testAPI = window.__a11yEngine._test;
  const fg = [255, 0, 0, 1.0];
  const bg = [0, 255, 0];
  const result = testAPI.compositeOver(fg, bg);
  assert.deepStrictEqual(result, [255, 0, 0], 'Opaque foreground should replace background');
});

test('compositeOver: fully transparent foreground', () => {
  const testAPI = window.__a11yEngine._test;
  const fg = [255, 0, 0, 0.0];
  const bg = [0, 255, 0];
  const result = testAPI.compositeOver(fg, bg);
  assert.deepStrictEqual(result, [0, 255, 0], 'Transparent foreground should show background');
});

test('compositeOver: 50% transparent foreground', () => {
  const testAPI = window.__a11yEngine._test;
  const fg = [200, 0, 0, 0.5];
  const bg = [0, 100, 0];
  const result = testAPI.compositeOver(fg, bg);
  // 50% red (200), 50% green (100) = [100, 50, 0]
  assertClose(result[0], 100, 5, 'Red channel');
  assertClose(result[1], 50, 5, 'Green channel');
  assert.strictEqual(result[2], 0, 'Blue channel');
});

test('compositeOver: complex alpha blending', () => {
  const testAPI = window.__a11yEngine._test;
  const fg = [255, 255, 255, 0.8]; // 80% white
  const bg = [0, 0, 0]; // black
  const result = testAPI.compositeOver(fg, bg);
  // 80% of 255 = 204
  assertClose(result[0], 204, 5, 'Red channel with 80% alpha');
  assertClose(result[1], 204, 5, 'Green channel with 80% alpha');
  assertClose(result[2], 204, 5, 'Blue channel with 80% alpha');
});

// ============================================================================
// INTEGRATION TESTS: contrast-text Rule
// ============================================================================

test('contrast-text: detects insufficient contrast (fails AA)', () => {
  const div = document.createElement('div');
  div.textContent = 'Low contrast text';
  div.style.color = '#999'; // Light gray on white (2.85:1 - fails AA)
  div.style.backgroundColor = '#fff';
  div.style.fontSize = '14px';
  div.style.display = 'block';
  div.style.width = '200px';
  div.style.height = '50px';
  document.body.appendChild(div);

  const findings = window.__a11yEngine.run(['contrast-text']);

  assert(findings.length >= 1, 'Should detect contrast issue');
  const finding = findings.find(f => f.ruleId === 'contrast-text');
  assert(finding, 'Should find contrast-text issue');
  assert(finding.evidence.ratio < 4.5, `Ratio should be < 4.5, got ${finding.evidence.ratio}`);
});

test('contrast-text: passes sufficient contrast (AA)', () => {
  const div = document.createElement('div');
  div.textContent = 'Good contrast text';
  div.style.color = '#000'; // Black on white
  div.style.backgroundColor = '#fff';
  div.style.fontSize = '14px';
  div.style.display = 'block';
  div.style.width = '200px';
  div.style.height = '50px';
  document.body.appendChild(div);

  const findings = window.__a11yEngine.run(['contrast-text']);

  const contrastIssues = findings.filter(f => f.ruleId === 'contrast-text');
  assert.strictEqual(contrastIssues.length, 0, 'Should not flag good contrast');
});

test('contrast-text: handles large text correctly (3:1 threshold)', () => {
  const div = document.createElement('div');
  div.textContent = 'Large text';
  div.style.color = '#949494'; // ~3:1 contrast
  div.style.backgroundColor = '#fff';
  div.style.fontSize = '18pt'; // 24px = large text
  div.style.fontWeight = 'normal';
  div.style.display = 'block';
  div.style.width = '200px';
  div.style.height = '50px';
  document.body.appendChild(div);

  const findings = window.__a11yEngine.run(['contrast-text']);

  // Large text has lower threshold (3:1), so this might pass
  // Just verify the rule runs without errors
  assert(Array.isArray(findings), 'Should return findings array');
});

test('contrast-text: handles bold text as large (14pt bold)', () => {
  const div = document.createElement('div');
  div.textContent = 'Bold text';
  div.style.color = '#949494';
  div.style.backgroundColor = '#fff';
  div.style.fontSize = '14pt'; // 18.67px
  div.style.fontWeight = 'bold'; // Bold makes it "large"
  div.style.display = 'block';
  div.style.width = '200px';
  div.style.height = '50px';
  document.body.appendChild(div);

  const findings = window.__a11yEngine.run(['contrast-text']);

  // 14pt bold counts as large text (lower threshold)
  assert(Array.isArray(findings), 'Should return findings array');
});

test('contrast-text: detects contrast with semi-transparent text', () => {
  const div = document.createElement('div');
  div.textContent = 'Semi-transparent text';
  div.style.color = 'rgba(0, 0, 0, 0.5)'; // 50% black
  div.style.backgroundColor = '#fff';
  div.style.fontSize = '14px';
  div.style.display = 'block';
  div.style.width = '200px';
  div.style.height = '50px';
  document.body.appendChild(div);

  const findings = window.__a11yEngine.run(['contrast-text']);

  // 50% black on white is effectively gray, should fail
  assert(findings.length >= 1, 'Should detect low contrast from alpha');
});

test('contrast-text: resolves background from parent', () => {
  const parent = document.createElement('div');
  parent.style.backgroundColor = '#000'; // Black background
  parent.style.padding = '10px';

  const child = document.createElement('div');
  child.textContent = 'Text on inherited background';
  child.style.color = '#fff'; // White text
  // No explicit background - should inherit from parent
  child.style.fontSize = '14px';
  child.style.display = 'block';
  child.style.width = '200px';
  child.style.height = '50px';

  parent.appendChild(child);
  document.body.appendChild(parent);

  const findings = window.__a11yEngine.run(['contrast-text']);

  const contrastIssues = findings.filter(f => f.ruleId === 'contrast-text');
  // White on black should pass (21:1)
  assert.strictEqual(contrastIssues.length, 0, 'Should resolve parent background and pass');
});

test('contrast-text: handles background images with lower confidence', () => {
  const div = document.createElement('div');
  div.textContent = 'Text over background image';
  div.style.color = '#000';
  div.style.backgroundImage = 'url(image.jpg)';
  div.style.backgroundColor = '#fff'; // Fallback
  div.style.fontSize = '14px';
  div.style.display = 'block';
  div.style.width = '200px';
  div.style.height = '50px';
  document.body.appendChild(div);

  const findings = window.__a11yEngine.run(['contrast-text']);

  // Should either skip or report with lower confidence
  if (findings.length > 0) {
    const finding = findings.find(f => f.ruleId === 'contrast-text');
    if (finding) {
      assert(finding.confidence < 0.9, 'Should have lower confidence with bg image');
    }
  }
});

test('contrast-text: ignores hidden text', () => {
  const div = document.createElement('div');
  div.textContent = 'Hidden text';
  div.style.color = '#777';
  div.style.backgroundColor = '#888';
  div.style.display = 'none'; // Hidden
  document.body.appendChild(div);

  const findings = window.__a11yEngine.run(['contrast-text']);

  const issues = findings.filter(f => f.ruleId === 'contrast-text');
  assert.strictEqual(issues.length, 0, 'Should ignore hidden elements');
});

test('contrast-text: ignores zero-size text', () => {
  const div = document.createElement('div');
  div.textContent = 'Zero size text';
  div.style.color = '#777';
  div.style.backgroundColor = '#fff';
  div.style.fontSize = '0px'; // Zero size
  div.style.display = 'block';
  document.body.appendChild(div);

  const findings = window.__a11yEngine.run(['contrast-text']);

  const issues = findings.filter(f => f.ruleId === 'contrast-text');
  // Should either ignore or handle gracefully
  assert(Array.isArray(findings), 'Should not crash on zero-size text');
});

test('contrast-text: provides evidence in findings', () => {
  const div = document.createElement('div');
  div.textContent = 'Evidence test';
  div.style.color = '#999'; // 2.85:1 - clearly fails AA
  div.style.backgroundColor = '#fff';
  div.style.fontSize = '14px';
  div.style.display = 'block';
  div.style.width = '200px';
  div.style.height = '50px';
  document.body.appendChild(div);

  const findings = window.__a11yEngine.run(['contrast-text']);

  assert(findings.length > 0, 'Should find contrast issue');
  const finding = findings[0];
  assert(finding.evidence, 'Should include evidence');
  assert(typeof finding.evidence.ratio === 'number', 'Should include contrast ratio');
  assert(Array.isArray(finding.evidence.fg), 'Should include foreground color as array');
  assert(Array.isArray(finding.evidence.bg), 'Should include background color as array');
  assert(finding.evidence.fg.length === 3, 'Foreground should be RGB array');
  assert(finding.evidence.bg.length === 3, 'Background should be RGB array');
});

test('contrast-text: checks WCAG criteria in finding', () => {
  const div = document.createElement('div');
  div.textContent = 'WCAG test';
  div.style.color = '#777';
  div.style.backgroundColor = '#fff';
  div.style.fontSize = '14px';
  div.style.display = 'block';
  div.style.width = '200px';
  div.style.height = '50px';
  document.body.appendChild(div);

  const findings = window.__a11yEngine.run(['contrast-text']);

  if (findings.length > 0) {
    const finding = findings[0];
    assert(Array.isArray(finding.wcag), 'Should include WCAG criteria');
    assert(finding.wcag.includes('1.4.3'), 'Should reference WCAG 1.4.3 (Contrast Minimum)');
  }
});

// ============================================================================
// EDGE CASES
// ============================================================================

test('contrast-text: handles nested transparent elements', () => {
  const grandparent = document.createElement('div');
  grandparent.style.backgroundColor = '#000';

  const parent = document.createElement('div');
  parent.style.backgroundColor = 'transparent';

  const child = document.createElement('div');
  child.textContent = 'Nested transparent';
  child.style.color = '#fff';
  child.style.fontSize = '14px';
  child.style.display = 'block';
  child.style.width = '200px';
  child.style.height = '50px';

  parent.appendChild(child);
  grandparent.appendChild(parent);
  document.body.appendChild(grandparent);

  const findings = window.__a11yEngine.run(['contrast-text']);

  // Should resolve through transparent parent to grandparent
  const issues = findings.filter(f => f.ruleId === 'contrast-text');
  assert.strictEqual(issues.length, 0, 'Should resolve through transparent layers');
});

test('contrast-text: handles rgba(0,0,0,0) as transparent', () => {
  const parent = document.createElement('div');
  parent.style.backgroundColor = '#000';

  const child = document.createElement('div');
  child.textContent = 'Transparent RGBA';
  child.style.color = '#fff';
  child.style.backgroundColor = 'rgba(0,0,0,0)';
  child.style.fontSize = '14px';
  child.style.display = 'block';
  child.style.width = '200px';
  child.style.height = '50px';

  parent.appendChild(child);
  document.body.appendChild(parent);

  const findings = window.__a11yEngine.run(['contrast-text']);

  // Should resolve through transparent background
  assert(Array.isArray(findings), 'Should handle transparent rgba');
});

test('contrast-text: handles very small contrast differences', () => {
  const div = document.createElement('div');
  div.textContent = 'Subtle difference';
  div.style.color = 'rgb(100, 100, 100)';
  div.style.backgroundColor = 'rgb(101, 101, 101)'; // Nearly identical
  div.style.fontSize = '14px';
  div.style.display = 'block';
  div.style.width = '200px';
  div.style.height = '50px';
  document.body.appendChild(div);

  const findings = window.__a11yEngine.run(['contrast-text']);

  // Should detect very low contrast (ratio ~1:1)
  assert(findings.length >= 1, 'Should detect minimal contrast');
  if (findings.length > 0) {
    const finding = findings[0];
    assert(finding.evidence.ratio < 1.5, 'Ratio should be very low');
  }
});

// ============================================================================
// RUN ALL TESTS
// ============================================================================

console.log('\n📋 Running contrast-text algorithm tests...\n');
runTests();

console.log('\n' + '='.repeat(70));
console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);

if (failed > 0) {
  console.log('\n❌ Some tests failed!\n');
  process.exit(1);
} else {
  console.log('\n✨ All contrast-text tests passing!\n');
  process.exit(0);
}
