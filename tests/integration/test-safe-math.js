#!/usr/bin/env node

/**
 * Test suite for safe-math utility
 * Validates all edge cases before using in production code
 */

const {
  safeDivide,
  safeAverage,
  safePercentage,
  roundTo,
  safePrecision,
  safeRecall,
  safeF1Score
} = require('./helpers/safe-math');

console.log('Testing safe-math utility...\n');

let passed = 0;
let failed = 0;

function test(name, condition) {
  if (condition) {
    console.log(`✓ ${name}`);
    passed++;
  } else {
    console.log(`✗ ${name}`);
    failed++;
  }
}

// Test safeDivide
test('safeDivide: 10 / 2 = 5', safeDivide(10, 2) === 5);
test('safeDivide: 10 / 0 = 0 (default)', safeDivide(10, 0) === 0);
test('safeDivide: 10 / 0 = -1 (custom default)', safeDivide(10, 0, -1) === -1);
test('safeDivide: NaN numerator returns default', safeDivide(NaN, 5) === 0);
test('safeDivide: Infinity denominator returns default', safeDivide(10, Infinity) === 0);

// Test safeAverage
test('safeAverage: [1,2,3] = 2', safeAverage([1, 2, 3]) === 2);
test('safeAverage: [] = 0 (default)', safeAverage([]) === 0);
test('safeAverage: [] = -1 (custom default)', safeAverage([], -1) === -1);
test('safeAverage: null = 0', safeAverage(null) === 0);

// Test safePercentage
test('safePercentage: 1/4 = 25%', safePercentage(1, 4) === 25);
test('safePercentage: 10/0 = 0% (default)', safePercentage(10, 0) === 0);
test('safePercentage: 3/10 = 30%', safePercentage(3, 10) === 30);

// Test roundTo
test('roundTo: 3.14159 to 2 decimals = 3.14', roundTo(3.14159, 2) === 3.14);
test('roundTo: 3.14159 to 0 decimals = 3', roundTo(3.14159, 0) === 3);
test('roundTo: NaN returns 0', roundTo(NaN) === 0);
test('roundTo: Infinity returns 0', roundTo(Infinity) === 0);

// Test safePrecision
test('safePrecision: 80 TP, 20 FP = 0.8', safePrecision(80, 20) === 0.8);
test('safePrecision: 0 TP, 0 FP = 0 (default)', safePrecision(0, 0) === 0);
test('safePrecision: 10 TP, 0 FP = 1.0', safePrecision(10, 0) === 1.0);

// Test safeRecall
test('safeRecall: 80 TP, 20 FN = 0.8', safeRecall(80, 20) === 0.8);
test('safeRecall: 0 TP, 0 FN = 0 (default)', safeRecall(0, 0) === 0);
test('safeRecall: 10 TP, 0 FN = 1.0', safeRecall(10, 0) === 1.0);

// Test safeF1Score
test('safeF1Score: P=0.8, R=0.8 ≈ 0.8', Math.abs(safeF1Score(0.8, 0.8) - 0.8) < 0.0001);
test('safeF1Score: P=0, R=0 = 0 (default)', safeF1Score(0, 0) === 0);

// Edge case: F1 with different P and R
const f1 = safeF1Score(0.9, 0.8);
test('safeF1Score: P=0.9, R=0.8 ≈ 0.847', Math.abs(f1 - 0.847) < 0.01);

console.log(`\n${passed} passed, ${failed} failed`);

if (failed === 0) {
  console.log('\n✅ All safe-math tests passed!\n');
  process.exit(0);
} else {
  console.log(`\n❌ ${failed} tests failed!\n`);
  process.exit(1);
}
