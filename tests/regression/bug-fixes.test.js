#!/usr/bin/env node
/**
 * Regression Tests for Critical Bugs Found During Development
 *
 * This file contains tests that would have caught bugs before they reached production.
 * Each test documents the bug, when it was found, and how to prevent reintroduction.
 *
 * Run: node tests/regression/bug-fixes.test.js
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

// Mock getBoundingClientRect
dom.window.Element.prototype.getBoundingClientRect = function() {
  if (this.style.display === 'none') {
    return { width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0, x: 0, y: 0 };
  }
  const width = parseFloat(this.style.width) || 100;
  const height = parseFloat(this.style.height) || 30;
  return { width, height, top: 0, left: 0, right: width, bottom: height, x: 0, y: 0 };
};

// Mock parseColorToRgb for JSDOM (canvas not available)
global.mockParseColorToRgb = function(colorStr) {
  if (!colorStr || colorStr === 'transparent') return [0, 0, 0, 0];

  const namedColors = {
    'white': [255, 255, 255, 1],
    'black': [0, 0, 0, 1],
    'red': [255, 0, 0, 1],
    'gray': [128, 128, 128, 1]
  };

  const color = colorStr.toLowerCase().trim();
  if (namedColors[color]) return namedColors[color];

  const rgbaMatch = color.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)/);
  if (rgbaMatch) {
    return [
      parseInt(rgbaMatch[1]),
      parseInt(rgbaMatch[2]),
      parseInt(rgbaMatch[3]),
      rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 1
    ];
  }

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

  return [255, 255, 255, 1];
};

// Load engine and replace parseColorToRgb with mock
let engineCode = fs.readFileSync(path.join(__dirname, '../../engine.js'), 'utf8');
engineCode = engineCode.replace(
  /function parseColorToRgb\(str\) \{[\s\S]*?return \[r,g,b,a\];[\s\n]*\}/m,
  'const parseColorToRgb = global.mockParseColorToRgb'
);
eval(engineCode);

console.log('🔄 Testing Regression: Critical Bug Fixes\n');
console.log('='.repeat(70));

const tests = [];
let passed = 0;
let failed = 0;

function test(name, fn) {
  tests.push({ name, fn });
}

// =============================================================================
// BUG #1: walkTreeWithShadow used children instead of childNodes
// =============================================================================

test('REGRESSION BUG #1: walkTreeWithShadow must traverse text nodes', () => {
  /**
   * BUG DISCOVERED: 2025-11-05
   * SEVERITY: CRITICAL
   *
   * ROOT CAUSE:
   *   walkTreeWithShadow used node.children (only Element nodes)
   *   instead of node.childNodes (includes Text nodes)
   *
   * IMPACT:
   *   contrast-text rule was completely non-functional because it iterates
   *   over text nodes to check color contrast. With this bug, it found zero
   *   text nodes and therefore detected zero contrast issues.
   *
   * FIX:
   *   Changed line 109-112 in engine.js:
   *   - for (let i = node.children.length - 1; i >= 0; i--)
   *   + for (let i = node.childNodes.length - 1; i >= 0; i--)
   *
   * TEST STRATEGY:
   *   Create a DOM tree with text nodes and verify walkTreeWithShadow
   *   yields them during traversal.
   */

  // Clear and create test DOM
  document.body.innerHTML = '';
  const div = document.createElement('div');
  div.textContent = 'This is a text node';
  document.body.appendChild(div);

  // Get the internal walkTreeWithShadow function
  // It's not exported, so we need to test via a rule that uses it
  // The contrast-text rule iterates over text nodes using walkTreeWithShadow

  // Set up a low contrast scenario
  div.style.color = '#999'; // Light gray
  div.style.backgroundColor = '#fff'; // White
  div.style.fontSize = '14px';
  div.style.display = 'block';

  // Run contrast-text rule
  const findings = window.__a11yEngine.run(['contrast-text']);

  // If walkTreeWithShadow is broken (using .children), findings.length will be 0
  // If walkTreeWithShadow is fixed (using .childNodes), findings.length will be > 0
  assert(findings.length > 0,
    'REGRESSION: walkTreeWithShadow must find text nodes. ' +
    'If this fails, check if engine.js line 109-112 uses node.children instead of node.childNodes'
  );

  assert(findings[0].ruleId === 'contrast-text',
    'Should detect contrast-text violation'
  );

  console.log('  ✓ walkTreeWithShadow correctly traverses text nodes');
  console.log(`    Found ${findings.length} contrast issue(s) as expected`);
});

test('REGRESSION BUG #1: walkTreeWithShadow must handle nested text nodes', () => {
  /**
   * Extended test: Verify text nodes at multiple nesting levels
   */
  document.body.innerHTML = '';

  const container = document.createElement('div');
  container.style.backgroundColor = '#fff';

  const child1 = document.createElement('p');
  child1.textContent = 'First paragraph';
  child1.style.color = '#999';
  child1.style.fontSize = '14px';

  const child2 = document.createElement('span');
  child2.textContent = 'Nested span';
  child2.style.color = '#aaa';
  child2.style.fontSize = '14px';

  const child3 = document.createElement('div');
  const grandchild = document.createElement('strong');
  grandchild.textContent = 'Deeply nested text';
  grandchild.style.color = '#bbb';
  grandchild.style.fontSize = '14px';
  child3.appendChild(grandchild);

  container.appendChild(child1);
  container.appendChild(child2);
  container.appendChild(child3);
  document.body.appendChild(container);

  const findings = window.__a11yEngine.run(['contrast-text']);

  // Should find contrast issues at all nesting levels
  assert(findings.length >= 3,
    `Should find text nodes at all depths. Found ${findings.length}, expected >= 3`
  );

  console.log(`  ✓ Found ${findings.length} text nodes at multiple nesting levels`);
});

// =============================================================================
// BUG #2: isFocusableByHeuristic incorrectly treated interactive roles as focusable
// =============================================================================

test('REGRESSION BUG #2: isFocusableByHeuristic must not treat roles as focusable', () => {
  /**
   * BUG DISCOVERED: 2025-11-05
   * SEVERITY: HIGH
   *
   * ROOT CAUSE:
   *   isFocusableByHeuristic returned true for any element with an interactive
   *   role (button, link, etc.), even without tabindex or native focusability.
   *
   * IMPACT:
   *   The interactive-role-focusable rule couldn't detect violations because
   *   isFocusableByHeuristic incorrectly reported role="button" as focusable.
   *   This broke WCAG 2.1.1 (Keyboard) compliance checking.
   *
   * FIX:
   *   Removed lines 170-172 in engine.js that checked for interactive roles:
   *   - const role = el.getAttribute('role');
   *   - const interactiveRoles = new Set([...]);
   *   - if (role && interactiveRoles.has(role)) return true;
   *
   * TEST STRATEGY:
   *   Create elements with interactive roles but no tabindex, verify they're
   *   correctly identified as non-focusable by the rule.
   */

  document.body.innerHTML = '';

  // Create div with role="button" but no tabindex (NOT focusable)
  const fakeButton = document.createElement('div');
  fakeButton.setAttribute('role', 'button');
  fakeButton.textContent = 'Fake button';
  fakeButton.style.display = 'block';
  document.body.appendChild(fakeButton);

  // Run interactive-role-focusable rule
  const findings = window.__a11yEngine.run(['interactive-role-focusable']);

  // If isFocusableByHeuristic is broken (checks roles), findings.length will be 0
  // If isFocusableByHeuristic is fixed (doesn't check roles), findings.length will be > 0
  assert(findings.length > 0,
    'REGRESSION: role="button" without tabindex should be detected as violation. ' +
    'If this fails, check if engine.js isFocusableByHeuristic incorrectly returns true for interactive roles'
  );

  assert(findings[0].ruleId === 'interactive-role-focusable',
    'Should detect interactive-role-focusable violation'
  );

  console.log('  ✓ Correctly detects non-focusable interactive role');
  console.log(`    Detected: ${findings[0].message}`);
});

test('REGRESSION BUG #2: isFocusableByHeuristic must respect tabindex', () => {
  /**
   * Extended test: Verify tabindex makes interactive role focusable
   */
  document.body.innerHTML = '';

  // Create div with role="button" AND tabindex="0" (IS focusable)
  const properButton = document.createElement('div');
  properButton.setAttribute('role', 'button');
  properButton.setAttribute('tabindex', '0');
  properButton.textContent = 'Proper button';
  properButton.style.display = 'block';
  document.body.appendChild(properButton);

  const findings = window.__a11yEngine.run(['interactive-role-focusable']);

  // Should NOT detect violation (element is properly focusable)
  assert(findings.length === 0,
    'role="button" WITH tabindex="0" should NOT be a violation'
  );

  console.log('  ✓ Correctly allows focusable interactive role with tabindex');
});

test('REGRESSION BUG #2: Native focusable elements pass without tabindex', () => {
  /**
   * Extended test: Verify native elements don't need tabindex
   */
  document.body.innerHTML = '';

  // Create native button (inherently focusable)
  const nativeButton = document.createElement('button');
  nativeButton.textContent = 'Native button';
  nativeButton.style.display = 'block';
  document.body.appendChild(nativeButton);

  const findings = window.__a11yEngine.run(['interactive-role-focusable']);

  // Should NOT detect violation (native button is focusable)
  assert(findings.length === 0,
    'Native <button> should NOT be a violation (inherently focusable)'
  );

  console.log('  ✓ Correctly handles native focusable elements');
});

test('REGRESSION BUG #2: Multiple interactive roles detected correctly', () => {
  /**
   * Extended test: Multiple violations in same document
   */
  document.body.innerHTML = '';

  // Create multiple non-focusable interactive roles
  const roles = ['button', 'link', 'checkbox', 'menuitem'];
  roles.forEach(role => {
    const el = document.createElement('div');
    el.setAttribute('role', role);
    el.textContent = `Fake ${role}`;
    el.style.display = 'block';
    document.body.appendChild(el);
  });

  const findings = window.__a11yEngine.run(['interactive-role-focusable']);

  assert(findings.length === roles.length,
    `Should detect all ${roles.length} non-focusable interactive roles. Found ${findings.length}`
  );

  console.log(`  ✓ Detected all ${findings.length} non-focusable interactive roles`);
});

// =============================================================================
// RUN ALL TESTS
// =============================================================================

function runTests() {
  for (const { name, fn } of tests) {
    // Clear DOM between tests
    document.body.innerHTML = '';

    try {
      fn();
      passed++;
      console.log(`✅ ${name}`);
    } catch (error) {
      failed++;
      console.log(`❌ ${name}`);
      console.log(`   ${error.message}`);
      if (error.stack) {
        console.log(`   ${error.stack.split('\n').slice(1, 3).join('\n')}`);
      }
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);

  if (failed === 0) {
    console.log('\n✨ All regression tests passing!');
    console.log('\n💡 These tests prevent reintroduction of critical bugs:');
    console.log('   • BUG #1: Text node traversal (contrast-text was broken)');
    console.log('   • BUG #2: Focusability detection (WCAG 2.1.1 was broken)');
  } else {
    console.log('\n❌ Some regression tests failed!');
    console.log('\n⚠️  CRITICAL: If these tests fail, production bugs may resurface!');
    process.exit(1);
  }
}

runTests();
