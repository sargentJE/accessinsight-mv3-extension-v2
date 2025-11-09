#!/usr/bin/env node
/**
 * Test Suite for Form & Interaction Rules (Phase 7 - Wave 3)
 *
 * Tests 2 form and interaction rules:
 * - redundant-entry: Information should not require redundant entry
 * - dragging-movements: Drag functionality must have alternatives
 *
 * Run: node tests/unit/rules/form-interaction.test.js
 */

const { fullSetup, resetDOM } = require('../../helpers/jsdom-setup');
const { createTestElement } = require('../../helpers/dom-fixtures');
const { assertHasViolation, assertNoFindings, assertWCAGCriteria } = require('../../helpers/assertions');

// Setup environment once
fullSetup();

console.log('🎯 Testing Form & Interaction Rules (Phase 7 - Wave 3)\n');
console.log('='.repeat(70));

const tests = [];
let passed = 0;
let failed = 0;

function test(name, fn) {
  tests.push({ name, fn });
}

// =============================================================================
// RULE: redundant-entry (MEDIUM)
// WCAG 3.3.7 - Redundant Entry
// =============================================================================
// Implementation: Detects duplicate field patterns based on type, name, id
// Patterns: email-field, phone-field, address-field, name-field, generic
// Flags all fields with duplicate patterns (duplicateCount > 1)
// Special handling for password confirmation fields
// Limitations:
// - Single-page analysis only (cannot detect cross-page redundancy)
// - Cannot detect if information was entered in previous session
// - Cannot verify if autocomplete actually helps
// - Pattern matching may group unrelated fields
// - Confidence 0.6 due to limitations

test('redundant-entry: passes single email field', () => {
  resetDOM();
  const form = createTestElement({ tag: 'form' });
  const email = createTestElement({
    tag: 'input',
    attrs: { type: 'email', name: 'email', id: 'user-email' }
  });
  form.appendChild(email);
  document.body.appendChild(form);

  const findings = window.__a11yEngine.run(['redundant-entry']);

  assertNoFindings(findings, 'Single email field should not be flagged');
});

test('redundant-entry: detects two email fields in same form', () => {
  resetDOM();
  const form = createTestElement({ tag: 'form' });
  const email1 = createTestElement({
    tag: 'input',
    attrs: { type: 'email', name: 'email1', id: 'email-1' }
  });
  const email2 = createTestElement({
    tag: 'input',
    attrs: { type: 'email', name: 'email2', id: 'email-2' }
  });
  form.appendChild(email1);
  form.appendChild(email2);
  document.body.appendChild(form);

  const findings = window.__a11yEngine.run(['redundant-entry']);

  const finding = assertHasViolation(findings, 'redundant-entry', 'Two email fields should be flagged');
  assertWCAGCriteria(finding, ['3.3.7'], 'Should reference WCAG 3.3.7');
  if (findings.length !== 2) {
    throw new Error(`Expected 2 violations (one for each duplicate), got ${findings.length}`);
  }
});

test('redundant-entry: detects email fields in two different forms', () => {
  resetDOM();
  const form1 = createTestElement({ tag: 'form' });
  const email1 = createTestElement({
    tag: 'input',
    attrs: { type: 'email', name: 'contact_email' }
  });
  form1.appendChild(email1);

  const form2 = createTestElement({ tag: 'form' });
  const email2 = createTestElement({
    tag: 'input',
    attrs: { type: 'email', name: 'billing_email' }
  });
  form2.appendChild(email2);

  document.body.appendChild(form1);
  document.body.appendChild(form2);

  const findings = window.__a11yEngine.run(['redundant-entry']);

  // Both email fields should be flagged
  assertHasViolation(findings, 'redundant-entry', 'Email fields in different forms should be flagged');
  if (findings.length !== 2) {
    throw new Error(`Expected 2 violations (cross-form duplicates), got ${findings.length}`);
  }
});

test('redundant-entry: detects password confirmation field', () => {
  resetDOM();
  const form = createTestElement({ tag: 'form' });
  const password = createTestElement({
    tag: 'input',
    attrs: { type: 'password', name: 'password' }
  });
  const confirm = createTestElement({
    tag: 'input',
    attrs: { type: 'password', name: 'confirm_password' }
  });
  form.appendChild(password);
  form.appendChild(confirm);
  document.body.appendChild(form);

  const findings = window.__a11yEngine.run(['redundant-entry']);

  // Should flag confirm_password (contains 'confirm' pattern)
  assertHasViolation(findings, 'redundant-entry', 'Password confirmation field should be flagged');
});

test('redundant-entry: detects multiple address fields (shipping/billing)', () => {
  resetDOM();
  const form = createTestElement({ tag: 'form' });
  const shipping = createTestElement({
    tag: 'input',
    attrs: { type: 'text', name: 'shipping_address', id: 'ship-addr' }
  });
  const billing = createTestElement({
    tag: 'input',
    attrs: { type: 'text', name: 'billing_address', id: 'bill-addr' }
  });
  form.appendChild(shipping);
  form.appendChild(billing);
  document.body.appendChild(form);

  const findings = window.__a11yEngine.run(['redundant-entry']);

  // Both address fields should be flagged
  assertHasViolation(findings, 'redundant-entry', 'Duplicate address fields should be flagged');
  if (findings.length !== 2) {
    throw new Error(`Expected 2 violations for address fields, got ${findings.length}`);
  }
});

test('redundant-entry: detects multiple phone fields', () => {
  resetDOM();
  const form = createTestElement({ tag: 'form' });
  const phone1 = createTestElement({
    tag: 'input',
    attrs: { type: 'tel', name: 'home_phone' }
  });
  const phone2 = createTestElement({
    tag: 'input',
    attrs: { type: 'tel', name: 'work_phone' }
  });
  form.appendChild(phone1);
  form.appendChild(phone2);
  document.body.appendChild(form);

  const findings = window.__a11yEngine.run(['redundant-entry']);

  assertHasViolation(findings, 'redundant-entry', 'Multiple phone fields should be flagged');
  if (findings.length !== 2) {
    throw new Error(`Expected 2 violations for phone fields, got ${findings.length}`);
  }
});

test('redundant-entry: passes two text fields with different names', () => {
  resetDOM();
  const form = createTestElement({ tag: 'form' });
  // Use field names that don't match special patterns (email, phone, address, name)
  const field1 = createTestElement({
    tag: 'input',
    attrs: { type: 'text', name: 'title', id: 'title' }
  });
  const field2 = createTestElement({
    tag: 'input',
    attrs: { type: 'text', name: 'description', id: 'desc' }
  });
  form.appendChild(field1);
  form.appendChild(field2);
  document.body.appendChild(form);

  const findings = window.__a11yEngine.run(['redundant-entry']);

  // Different generic patterns: text-title vs text-descript (substring 0-10)
  assertNoFindings(findings, 'Text fields with different names (title/description) should not be flagged');
});

test('redundant-entry: detects name fields appearing twice', () => {
  resetDOM();
  const form = createTestElement({ tag: 'form' });
  const name1 = createTestElement({
    tag: 'input',
    attrs: { type: 'text', name: 'full_name', id: 'name-1' }
  });
  const name2 = createTestElement({
    tag: 'input',
    attrs: { type: 'text', name: 'recipient_name', id: 'name-2' }
  });
  form.appendChild(name1);
  form.appendChild(name2);
  document.body.appendChild(form);

  const findings = window.__a11yEngine.run(['redundant-entry']);

  // Both contain 'name' → pattern 'name-field'
  assertHasViolation(findings, 'redundant-entry', 'Multiple name fields should be flagged');
  if (findings.length !== 2) {
    throw new Error(`Expected 2 violations for name fields, got ${findings.length}`);
  }
});

// =============================================================================
// RULE: dragging-movements (COMPLEX)
// WCAG 2.5.7 - Dragging Movements
// =============================================================================
// Implementation: Detects draggable="true" or drag event handler attributes
// Checks for alternatives: click handlers, keyboard handlers, ARIA roles, form controls
// Essential drag exceptions: input[type="file"], canvas, class patterns
// Limitations:
// - CRITICAL: Cannot detect addEventListener-based event handlers
// - Only detects inline event handler attributes (ondragstart, etc.)
// - Cannot verify if alternatives provide same functionality
// - Confidence 0.8 due to detection limitations

test('dragging-movements: passes element with draggable and onclick', () => {
  resetDOM();
  const element = createTestElement({
    tag: 'div',
    attrs: { draggable: 'true', onclick: 'handleClick()' },
    text: 'Draggable with click'
  });
  document.body.appendChild(element);

  const findings = window.__a11yEngine.run(['dragging-movements']);

  assertNoFindings(findings, 'Element with draggable and onclick should pass (has alternative)');
});

test('dragging-movements: detects element with draggable but no alternatives', () => {
  resetDOM();
  const element = createTestElement({
    tag: 'div',
    attrs: { draggable: 'true' },
    text: 'Drag-only element'
  });
  document.body.appendChild(element);

  const findings = window.__a11yEngine.run(['dragging-movements']);

  const finding = assertHasViolation(findings, 'dragging-movements', 'Draggable element without alternatives should be flagged');
  assertWCAGCriteria(finding, ['2.5.7'], 'Should reference WCAG 2.5.7');
});

test('dragging-movements: passes element with ondragstart and onkeydown', () => {
  resetDOM();
  const element = createTestElement({
    tag: 'div',
    attrs: { ondragstart: 'handleDrag()', onkeydown: 'handleKey()' },
    text: 'Drag with keyboard'
  });
  document.body.appendChild(element);

  const findings = window.__a11yEngine.run(['dragging-movements']);

  assertNoFindings(findings, 'Element with drag and keyboard handlers should pass');
});

test('dragging-movements: passes file input (essential drag exception)', () => {
  resetDOM();
  const input = createTestElement({
    tag: 'input',
    attrs: { type: 'file', draggable: 'true' }
  });
  document.body.appendChild(input);

  const findings = window.__a11yEngine.run(['dragging-movements']);

  assertNoFindings(findings, 'File input is essential drag operation, should pass');
});

test('dragging-movements: passes canvas element (essential drag exception)', () => {
  resetDOM();
  const canvas = createTestElement({
    tag: 'canvas',
    attrs: { draggable: 'true', width: '200', height: '200' }
  });
  document.body.appendChild(canvas);

  const findings = window.__a11yEngine.run(['dragging-movements']);

  assertNoFindings(findings, 'Canvas is essential drag operation, should pass');
});

test('dragging-movements: detects sortable list item without alternatives', () => {
  resetDOM();
  const list = createTestElement({ tag: 'ul' });
  const item = createTestElement({
    tag: 'li',
    attrs: { draggable: 'true', class: 'sortable-item' },
    text: 'Drag to reorder'
  });
  list.appendChild(item);
  document.body.appendChild(list);

  const findings = window.__a11yEngine.run(['dragging-movements']);

  assertHasViolation(findings, 'dragging-movements', 'Sortable item without alternatives should be flagged');
});

test('dragging-movements: passes drag handle with role="button"', () => {
  resetDOM();
  const handle = createTestElement({
    tag: 'div',
    attrs: { draggable: 'true', role: 'button', tabindex: '0' },
    text: 'Drag handle'
  });
  document.body.appendChild(handle);

  const findings = window.__a11yEngine.run(['dragging-movements']);

  assertNoFindings(findings, 'Element with draggable and role="button" should pass');
});

test('dragging-movements: passes draggable button element', () => {
  resetDOM();
  const button = createTestElement({
    tag: 'button',
    attrs: { draggable: 'true' },
    text: 'Draggable button'
  });
  document.body.appendChild(button);

  const findings = window.__a11yEngine.run(['dragging-movements']);

  assertNoFindings(findings, 'Button with draggable should pass (button is form control)');
});

test('dragging-movements: passes element with ondrop and onclick', () => {
  resetDOM();
  const dropZone = createTestElement({
    tag: 'div',
    attrs: { ondrop: 'handleDrop()', onclick: 'handleClick()' },
    text: 'Drop zone with click'
  });
  document.body.appendChild(dropZone);

  const findings = window.__a11yEngine.run(['dragging-movements']);

  assertNoFindings(findings, 'Element with drop handler and click should pass');
});

test('dragging-movements: passes element with class="file-drop" (essential heuristic)', () => {
  resetDOM();
  const dropZone = createTestElement({
    tag: 'div',
    attrs: { draggable: 'true', class: 'file-drop-zone' },
    text: 'Drop files here'
  });
  document.body.appendChild(dropZone);

  const findings = window.__a11yEngine.run(['dragging-movements']);

  assertNoFindings(findings, 'Element with file-drop class pattern should pass (essential exception)');
});

test('dragging-movements: limitation - cannot detect addEventListener handlers', () => {
  resetDOM();
  const element = createTestElement({
    tag: 'div',
    attrs: { draggable: 'true', 'data-has-click': 'true' },
    text: 'Has addEventListener click'
  });
  document.body.appendChild(element);

  const findings = window.__a11yEngine.run(['dragging-movements']);

  // Note: Engine cannot detect addEventListener handlers, only inline attributes
  // This will be flagged even though it may have alternatives via addEventListener
  assertHasViolation(findings, 'dragging-movements', 'Engine cannot detect addEventListener (known limitation)');
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
  console.log('✨ All form & interaction rules tests passing!');
  console.log('');
  console.log('🎯 Coverage: 2 form/interaction rules tested with 19 test cases');
  console.log('');
  console.log('📈 Wave 3 complete - Ready for Wave 4');
  process.exit(0);
} else {
  console.log('');
  console.error('💥 Some tests failed. Please review.');
  process.exit(1);
}
