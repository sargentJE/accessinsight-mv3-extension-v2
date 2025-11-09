#!/usr/bin/env node
/**
 * Quick validation test - runs without npm dependencies
 * Tests core functionality to ensure engine works correctly
 *
 * Run: node tests/quick-test.js
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

// Setup minimal DOM environment using JSDOM if available
let window, document;
try {
  const { JSDOM } = require('jsdom');
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    url: 'https://example.com',
    pretendToBeVisual: true
  });
  window = dom.window;
  document = dom.window.document;
  global.window = window;
  global.document = document;
  global.getComputedStyle = dom.window.getComputedStyle;
  global.Node = dom.window.Node;
  global.Element = dom.window.Element;
  global.HTMLElement = dom.window.HTMLElement;
  global.CSS = dom.window.CSS || {
    escape: (str) => String(str).replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, '\\$&')
  };
  // Also ensure CSS is available in window context
  if (!window.CSS) {
    window.CSS = global.CSS;
  }
  console.log('✓ JSDOM environment initialized\n');

  // Mock getBoundingClientRect for visible elements
  // JSDOM doesn't calculate layout, so we need to mock dimensions
  const originalGetBoundingClientRect = window.Element.prototype.getBoundingClientRect;
  window.Element.prototype.getBoundingClientRect = function() {
    const rect = originalGetBoundingClientRect.call(this);
    // If element has explicit style dimensions, use those
    if (this.style.width && this.style.height) {
      const width = parseFloat(this.style.width) || 100;
      const height = parseFloat(this.style.height) || 100;
      return {
        width,
        height,
        top: 0,
        left: 0,
        right: width,
        bottom: height,
        x: 0,
        y: 0
      };
    }
    // Default to visible dimensions for visible elements
    if (this.style.display !== 'none' && this.tagName) {
      return {
        width: 100,
        height: 30,
        top: 0,
        left: 0,
        right: 100,
        bottom: 30,
        x: 0,
        y: 0
      };
    }
    return rect;
  };

} catch (e) {
  console.error('❌ JSDOM not available. Install with: npm install jsdom');
  console.error('   Error:', e.message);
  process.exit(1);
}

// Load engine code
const enginePath = path.join(__dirname, '..', 'engine.js');
if (!fs.existsSync(enginePath)) {
  console.error('❌ engine.js not found at:', enginePath);
  process.exit(1);
}

const engineCode = fs.readFileSync(enginePath, 'utf8');
try {
  // Execute engine code in our test environment
  eval(engineCode);
  console.log('✓ Engine loaded successfully\n');
} catch (e) {
  console.error('❌ Failed to load engine:', e.message);
  process.exit(1);
}

// Test suite
const tests = [];
let passed = 0;
let failed = 0;

function test(name, fn) {
  tests.push({ name, fn });
}

function runTests() {
  console.log('🧪 Running Quick Tests\n');
  console.log('='.repeat(60));

  for (const { name, fn } of tests) {
    try {
      fn();
      console.log(`✅ PASS: ${name}`);
      passed++;
    } catch (e) {
      console.error(`❌ FAIL: ${name}`);
      console.error(`   ${e.message}`);
      if (e.stack) {
        console.error(`   ${e.stack.split('\n')[1]?.trim()}`);
      }
      failed++;
    }
    // Clean up DOM after each test
    document.body.innerHTML = '';
  }

  console.log('='.repeat(60));
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

// =============================================================================
// TEST SUITE
// =============================================================================

test('Engine is properly exported', () => {
  assert(typeof window.__a11yEngine === 'object', 'Engine should be defined');
  assert(typeof window.__a11yEngine.run === 'function', 'Engine should have run method');
  assert(Array.isArray(window.__a11yEngine.allRuleIds), 'Rule IDs should be array');
  assert(window.__a11yEngine.allRuleIds.length >= 40, 'Should have at least 40 rules');
  console.log(`   Found ${window.__a11yEngine.allRuleIds.length} rules`);
});

test('All rules have valid metadata', () => {
  const allRules = window.__a11yEngine.allRuleIds;
  const meta = window.__a11yEngine.ruleMeta;

  for (const ruleId of allRules) {
    assert(meta[ruleId], `Rule ${ruleId} should have metadata`);
    assert(meta[ruleId].helpUrl, `Rule ${ruleId} should have helpUrl`);
    assert(meta[ruleId].defaultImpact, `Rule ${ruleId} should have defaultImpact`);
    assert(typeof meta[ruleId].userImpact === 'number', `Rule ${ruleId} should have numeric userImpact`);
    assert(typeof meta[ruleId].populationAffected === 'number', `Rule ${ruleId} should have numeric populationAffected`);
  }
  console.log(`   Validated ${allRules.length} rule metadata entries`);
});

test('img-alt: Detects image without alt attribute', () => {
  const img = document.createElement('img');
  img.src = 'test.jpg';
  img.style.display = 'block';
  img.style.width = '100px';
  img.style.height = '100px';
  document.body.appendChild(img);

  const findings = window.__a11yEngine.run(['img-alt']);

  assert(findings.length === 1, `Expected 1 finding, got ${findings.length}`);
  assert(findings[0].ruleId === 'img-alt', 'Should be img-alt rule');
  assert(findings[0].message.toLowerCase().includes('alt'), 'Message should mention alt');
  assert(Array.isArray(findings[0].wcag), 'Should have WCAG criteria');
  assert(findings[0].wcag.includes('1.1.1'), 'Should reference WCAG 1.1.1');
  console.log(`   Message: "${findings[0].message}"`);
});

test('img-alt: Passes for image with alt text', () => {
  const img = document.createElement('img');
  img.src = 'test.jpg';
  img.alt = 'Test image description';
  img.style.display = 'block';
  img.style.width = '100px';
  img.style.height = '100px';
  document.body.appendChild(img);

  const findings = window.__a11yEngine.run(['img-alt']);

  assert(findings.length === 0, `Expected 0 findings, got ${findings.length}`);
  console.log('   Image with alt text correctly passes');
});

test('img-alt: Passes for decorative image (empty alt)', () => {
  const img = document.createElement('img');
  img.src = 'decoration.png';
  img.alt = '';
  img.style.display = 'block';
  img.style.width = '50px';
  img.style.height = '50px';
  document.body.appendChild(img);

  const findings = window.__a11yEngine.run(['img-alt']);

  assert(findings.length === 0, 'Decorative image should pass');
  console.log('   Decorative image (empty alt) correctly passes');
});

test('button-name: Detects button without accessible name', () => {
  const button = document.createElement('button');
  button.type = 'button';
  button.style.display = 'block';
  document.body.appendChild(button);

  const findings = window.__a11yEngine.run(['button-name']);

  assert(findings.length === 1, `Expected 1 finding, got ${findings.length}`);
  assert(findings[0].ruleId === 'button-name', 'Should be button-name rule');
  console.log(`   Message: "${findings[0].message}"`);
});

test('button-name: Passes for button with text content', () => {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = 'Click me';
  button.style.display = 'block';
  document.body.appendChild(button);

  const findings = window.__a11yEngine.run(['button-name']);

  assert(findings.length === 0, 'Button with text should pass');
  console.log('   Button with text content correctly passes');
});

test('label-control: Detects unlabeled input', () => {
  const input = document.createElement('input');
  input.type = 'text';
  input.style.display = 'block';
  document.body.appendChild(input);

  const findings = window.__a11yEngine.run(['label-control']);

  assert(findings.length === 1, `Expected 1 finding, got ${findings.length}`);
  assert(findings[0].ruleId === 'label-control', 'Should be label-control rule');
  console.log(`   Message: "${findings[0].message}"`);
});

test('label-control: Passes for properly labeled input', () => {
  const label = document.createElement('label');
  label.setAttribute('for', 'test-input');
  label.textContent = 'Name';

  const input = document.createElement('input');
  input.type = 'text';
  input.id = 'test-input';
  input.style.display = 'block';

  document.body.appendChild(label);
  document.body.appendChild(input);

  const findings = window.__a11yEngine.run(['label-control']);

  assert(findings.length === 0, 'Labeled input should pass');
  console.log('   Properly labeled input correctly passes');
});

test('document-title: Detects missing title', () => {
  const findings = window.__a11yEngine.run(['document-title']);

  assert(findings.length === 1, `Expected 1 finding, got ${findings.length}`);
  assert(findings[0].ruleId === 'document-title', 'Should be document-title rule');
  console.log(`   Message: "${findings[0].message}"`);
});

test('document-title: Passes when title exists', () => {
  const title = document.createElement('title');
  title.textContent = 'Test Page';
  const head = document.head || document.createElement('head');
  head.appendChild(title);
  if (!document.head) {
    document.documentElement.insertBefore(head, document.body);
  }

  const findings = window.__a11yEngine.run(['document-title']);

  assert(findings.length === 0, 'Page with title should pass');
  console.log('   Page with title correctly passes');
});

test('Engine handles multiple rules simultaneously', () => {
  // Create page with multiple issues
  const img = document.createElement('img');
  img.src = 'no-alt.jpg';
  img.style.display = 'block';
  img.style.width = '100px';
  img.style.height = '100px';

  const button = document.createElement('button');
  button.style.display = 'block';

  const input = document.createElement('input');
  input.type = 'text';
  input.style.display = 'block';

  document.body.appendChild(img);
  document.body.appendChild(button);
  document.body.appendChild(input);

  const findings = window.__a11yEngine.run(['img-alt', 'button-name', 'label-control']);

  assert(findings.length === 3, `Expected 3 findings, got ${findings.length}`);

  const ruleIds = findings.map(f => f.ruleId).sort();
  assert.deepStrictEqual(ruleIds, ['button-name', 'img-alt', 'label-control'], 'Should find all three issues');

  console.log(`   Found ${findings.length} issues across multiple rules`);
});

test('Findings include required fields', () => {
  const img = document.createElement('img');
  img.src = 'test.jpg';
  img.style.display = 'block';
  img.style.width = '100px';
  img.style.height = '100px';
  document.body.appendChild(img);

  const findings = window.__a11yEngine.run(['img-alt']);
  const finding = findings[0];

  assert(typeof finding.ruleId === 'string', 'Should have ruleId');
  assert(typeof finding.message === 'string', 'Should have message');
  assert(typeof finding.selector === 'string', 'Should have selector');
  assert(typeof finding.impact === 'string', 'Should have impact');
  assert(Array.isArray(finding.wcag), 'Should have wcag array');
  assert(typeof finding.confidence === 'number', 'Should have confidence score');
  assert(finding.confidence >= 0 && finding.confidence <= 1, 'Confidence should be 0-1');

  console.log(`   Finding structure validated: ${Object.keys(finding).length} fields`);
});

test('Selector generation works correctly', () => {
  const div = document.createElement('div');
  div.id = 'test-element';
  const img = document.createElement('img');
  img.src = 'test.jpg';
  img.style.display = 'block';
  img.style.width = '100px';
  img.style.height = '100px';

  div.appendChild(img);
  document.body.appendChild(div);

  const findings = window.__a11yEngine.run(['img-alt']);

  assert(findings.length === 1, 'Should find the image');
  assert(findings[0].selector.includes('test-element'), 'Selector should reference parent ID');

  console.log(`   Generated selector: ${findings[0].selector}`);
});

test('Priority scoring is available', () => {
  assert(typeof window.__a11yEngine.calculatePriorityScore === 'function',
    'Should have priority scoring function');

  const score = window.__a11yEngine.calculatePriorityScore('img-alt');

  assert(typeof score === 'number', 'Should return numeric score');
  assert(score >= 0, 'Score should be non-negative');

  console.log(`   img-alt priority score: ${score}`);
});

// =============================================================================
// RUN ALL TESTS
// =============================================================================

runTests();
