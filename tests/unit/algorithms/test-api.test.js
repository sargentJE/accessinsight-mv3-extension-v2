#!/usr/bin/env node
/**
 * Test that internal functions are properly exported for testing
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
global.CSS = dom.window.CSS || { escape: (str) => String(str).replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, '\\$&') };

// Load engine
const engineCode = fs.readFileSync(path.join(__dirname, '../../..', 'engine.js'), 'utf8');
eval(engineCode);

console.log('Testing internal function exports...\n');

// Test 1: _test API exists
assert(window.__a11yEngine._test, 'Test API should be exported');
console.log('✓ _test API exists');

// Test 2: Color functions
assert(typeof window.__a11yEngine._test.parseColorToRgb === 'function', 'parseColorToRgb should be exported');
assert(typeof window.__a11yEngine._test.relLuminance === 'function', 'relLuminance should be exported');
assert(typeof window.__a11yEngine._test.contrastRatio === 'function', 'contrastRatio should be exported');
assert(typeof window.__a11yEngine._test.compositeOver === 'function', 'compositeOver should be exported');
console.log('✓ Color/contrast functions exported');

// Test 3: ANDC functions
assert(typeof window.__a11yEngine._test.getAccName === 'function', 'getAccName should be exported');
assert(typeof window.__a11yEngine._test.getAccDescription === 'function', 'getAccDescription should be exported');
console.log('✓ Accessible name functions exported');

// Test 4: Utility functions
assert(typeof window.__a11yEngine._test.isElementVisible === 'function', 'isElementVisible should be exported');
assert(typeof window.__a11yEngine._test.cssPath === 'function', 'cssPath should be exported');
console.log('✓ Utility functions exported');

// Test 5: Context analysis
assert(typeof window.__a11yEngine._test.analyzeElementContext === 'function', 'analyzeElementContext should be exported');
console.log('✓ Context analysis exported');

// Test 6: Test actual functionality - luminance
const whiteLuminance = window.__a11yEngine._test.relLuminance([255, 255, 255]);
assert(Math.abs(whiteLuminance - 1.0) < 0.01, 'White should have luminance ~1.0');
console.log(`✓ relLuminance works: white = ${whiteLuminance.toFixed(3)}`);

// Test 7: Test contrast ratio
const blackOnWhite = window.__a11yEngine._test.contrastRatio([0, 0, 0], [255, 255, 255]);
assert(Math.abs(blackOnWhite - 21) < 0.1, 'Black on white should be ~21:1');
console.log(`✓ contrastRatio works: black/white = ${blackOnWhite.toFixed(2)}:1`);

// Test 8: Test cssPath
const div = document.createElement('div');
div.id = 'test-element';
document.body.appendChild(div);
const selector = window.__a11yEngine._test.cssPath(div);
assert(selector === '#test-element', 'cssPath should use ID');
console.log(`✓ cssPath works: "${selector}"`);

// Test 9: Test getAccName
const button = document.createElement('button');
button.textContent = 'Click me';
document.body.appendChild(button);
const result = window.__a11yEngine._test.getAccName(button);
assert(result.name === 'Click me', 'getAccName should extract button text');
console.log(`✓ getAccName works: "${result.name}"`);

// Test 10: Test compositeOver
const semiRed = [255, 0, 0, 0.5];
const white = [255, 255, 255];
const composite = window.__a11yEngine._test.compositeOver(semiRed, white);
assert(composite[0] === 255, 'Red channel should be 255');
assert(composite[1] === 128, 'Green channel should be ~128');
assert(composite[2] === 128, 'Blue channel should be ~128');
console.log(`✓ compositeOver works: [${composite.join(', ')}]`);

console.log('\n✨ All test API functions verified!\n');
