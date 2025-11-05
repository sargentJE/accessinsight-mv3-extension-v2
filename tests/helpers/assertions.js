/**
 * Custom Test Assertions
 *
 * This module provides high-level assertions for accessibility testing.
 * Benefits:
 * - Clarity: Descriptive names like assertHasViolation() vs manual find()
 * - Consistency: All tests use same assertion logic
 * - Better errors: Custom messages with context
 * - Maintainability: Change assertion logic once, updates all tests
 *
 * Usage:
 *   const { assertNoFindings, assertHasViolation } = require('./helpers/assertions');
 *   assertNoFindings(findings, 'Accessible button should not have violations');
 */

const assert = require('assert');

/**
 * Assert that test results contain no findings
 * @param {Array} findings - Engine results
 * @param {string} [message] - Custom error message
 */
function assertNoFindings(findings, message = 'Expected no accessibility violations') {
  if (!Array.isArray(findings)) {
    throw new Error(`assertNoFindings: findings must be an array, got ${typeof findings}`);
  }

  if (findings.length > 0) {
    const violationSummary = findings.map(f =>
      `  • ${f.ruleId}: ${f.message} (${f.impact})`
    ).join('\n');

    throw new Error(
      `${message}\n` +
      `Found ${findings.length} violation(s):\n` +
      violationSummary
    );
  }
}

/**
 * Assert that test results contain a specific violation
 * @param {Array} findings - Engine results
 * @param {string} ruleId - Expected rule ID
 * @param {string} [message] - Custom error message
 * @returns {Object} The found violation (for further assertions)
 */
function assertHasViolation(findings, ruleId, message = `Expected ${ruleId} violation`) {
  if (!Array.isArray(findings)) {
    throw new Error(`assertHasViolation: findings must be an array, got ${typeof findings}`);
  }

  const finding = findings.find(f => f.ruleId === ruleId);

  if (!finding) {
    const actualRules = findings.map(f => f.ruleId).join(', ');
    throw new Error(
      `${message}\n` +
      `Expected rule: ${ruleId}\n` +
      `Actual rules found: ${actualRules || '(none)'}\n` +
      `Total findings: ${findings.length}`
    );
  }

  return finding;
}

/**
 * Assert that finding has specific WCAG criteria
 * @param {Object} finding - Single finding object
 * @param {Array<string>} criteria - Expected WCAG criteria (e.g., ['1.4.3', '1.4.6'])
 * @param {string} [message] - Custom error message
 */
function assertWCAGCriteria(finding, criteria, message) {
  if (!finding || typeof finding !== 'object') {
    throw new Error(`assertWCAGCriteria: finding must be an object, got ${typeof finding}`);
  }

  if (!Array.isArray(finding.wcag)) {
    throw new Error(
      `${message || 'Finding missing WCAG criteria'}\n` +
      `Finding: ${JSON.stringify(finding, null, 2)}`
    );
  }

  const missing = criteria.filter(c => !finding.wcag.includes(c));

  if (missing.length > 0) {
    throw new Error(
      `${message || 'Finding missing expected WCAG criteria'}\n` +
      `Expected: ${criteria.join(', ')}\n` +
      `Actual: ${finding.wcag.join(', ')}\n` +
      `Missing: ${missing.join(', ')}`
    );
  }
}

/**
 * Assert that finding has specific impact level
 * @param {Object} finding - Single finding object
 * @param {string} expectedImpact - Expected impact ('critical', 'serious', 'moderate', 'minor')
 * @param {string} [message] - Custom error message
 */
function assertImpact(finding, expectedImpact, message) {
  if (!finding || typeof finding !== 'object') {
    throw new Error(`assertImpact: finding must be an object, got ${typeof finding}`);
  }

  if (finding.impact !== expectedImpact) {
    throw new Error(
      `${message || 'Finding has unexpected impact level'}\n` +
      `Expected: ${expectedImpact}\n` +
      `Actual: ${finding.impact}\n` +
      `Rule: ${finding.ruleId}\n` +
      `Message: ${finding.message}`
    );
  }
}

/**
 * Assert that finding contains expected evidence fields
 * @param {Object} finding - Single finding object
 * @param {Array<string>} fields - Expected evidence fields
 * @param {string} [message] - Custom error message
 */
function assertEvidence(finding, fields, message) {
  if (!finding || typeof finding !== 'object') {
    throw new Error(`assertEvidence: finding must be an object, got ${typeof finding}`);
  }

  if (!finding.evidence || typeof finding.evidence !== 'object') {
    throw new Error(
      `${message || 'Finding missing evidence object'}\n` +
      `Finding: ${JSON.stringify(finding, null, 2)}`
    );
  }

  const missing = fields.filter(field => !(field in finding.evidence));

  if (missing.length > 0) {
    throw new Error(
      `${message || 'Finding evidence missing expected fields'}\n` +
      `Expected fields: ${fields.join(', ')}\n` +
      `Actual fields: ${Object.keys(finding.evidence).join(', ')}\n` +
      `Missing: ${missing.join(', ')}`
    );
  }
}

/**
 * Assert that engine ran without errors
 * @param {Array} findings - Engine results
 * @param {string} [message] - Custom error message
 */
function assertNoErrors(findings, message = 'Engine should not have errors') {
  if (!Array.isArray(findings)) {
    throw new Error(`assertNoErrors: findings must be an array, got ${typeof findings}`);
  }

  // Check for error findings (if engine reports errors as findings)
  const errors = findings.filter(f => f.ruleId === 'engine-error' || f.impact === 'error');

  if (errors.length > 0) {
    throw new Error(
      `${message}\n` +
      `Found ${errors.length} error(s):\n` +
      errors.map(e => `  • ${e.message}`).join('\n')
    );
  }
}

/**
 * Assert that findings count matches expected range
 * @param {Array} findings - Engine results
 * @param {number} min - Minimum expected count (inclusive)
 * @param {number} [max] - Maximum expected count (inclusive), defaults to min
 * @param {string} [message] - Custom error message
 */
function assertFindingsCount(findings, min, max = min, message) {
  if (!Array.isArray(findings)) {
    throw new Error(`assertFindingsCount: findings must be an array, got ${typeof findings}`);
  }

  const count = findings.length;

  if (count < min || count > max) {
    const rangeStr = min === max ? `exactly ${min}` : `${min}-${max}`;
    throw new Error(
      `${message || `Expected ${rangeStr} findings`}\n` +
      `Expected: ${rangeStr}\n` +
      `Actual: ${count}\n` +
      `Rules found: ${findings.map(f => f.ruleId).join(', ') || '(none)'}`
    );
  }
}

/**
 * Assert that finding targets the correct element
 * @param {Object} finding - Single finding object
 * @param {HTMLElement} element - Expected element
 * @param {string} [message] - Custom error message
 */
function assertTargetsElement(finding, element, message) {
  if (!finding || typeof finding !== 'object') {
    throw new Error(`assertTargetsElement: finding must be an object, got ${typeof finding}`);
  }

  if (!element || !(element instanceof Element)) {
    throw new Error(`assertTargetsElement: element must be an Element, got ${typeof element}`);
  }

  if (finding.el !== element) {
    throw new Error(
      `${message || 'Finding targets wrong element'}\n` +
      `Expected element: ${element.tagName}#${element.id || '(no id)'}\n` +
      `Actual element: ${finding.el ? finding.el.tagName : '(none)'}`
    );
  }
}

/**
 * Assert that value is close to expected (for floating point comparisons)
 * @param {number} actual - Actual value
 * @param {number} expected - Expected value
 * @param {number} tolerance - Acceptable difference
 * @param {string} [message] - Custom error message
 */
function assertClose(actual, expected, tolerance, message) {
  if (typeof actual !== 'number' || typeof expected !== 'number') {
    throw new Error(`assertClose: values must be numbers, got ${typeof actual} and ${typeof expected}`);
  }

  const diff = Math.abs(actual - expected);

  if (diff > tolerance) {
    throw new Error(
      `${message || 'Value not within tolerance'}\n` +
      `Expected: ${expected} ±${tolerance}\n` +
      `Actual: ${actual}\n` +
      `Difference: ${diff}`
    );
  }
}

/**
 * Assert that array contains specific item
 * @param {Array} array - Array to search
 * @param {*} item - Item to find
 * @param {string} [message] - Custom error message
 */
function assertContains(array, item, message) {
  if (!Array.isArray(array)) {
    throw new Error(`assertContains: first argument must be an array, got ${typeof array}`);
  }

  if (!array.includes(item)) {
    throw new Error(
      `${message || 'Array does not contain expected item'}\n` +
      `Expected item: ${item}\n` +
      `Array contents: [${array.join(', ')}]`
    );
  }
}

module.exports = {
  assertNoFindings,
  assertHasViolation,
  assertWCAGCriteria,
  assertImpact,
  assertEvidence,
  assertNoErrors,
  assertFindingsCount,
  assertTargetsElement,
  assertClose,
  assertContains
};
