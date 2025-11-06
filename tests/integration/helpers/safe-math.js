/**
 * Safe Math Utility
 * Provides division operations with zero-checks to prevent NaN errors
 *
 * This utility was created to fix 7 division-by-zero bugs found across
 * the analysis pipeline during systematic code review.
 */

/**
 * Safely divide two numbers with default fallback
 * @param {number} numerator - The number to divide
 * @param {number} denominator - The number to divide by
 * @param {number} defaultValue - Value to return if division is unsafe (default: 0)
 * @returns {number} Result of division or default value
 */
function safeDivide(numerator, denominator, defaultValue = 0) {
  // Check for zero denominator
  if (denominator === 0 || !isFinite(denominator)) {
    return defaultValue;
  }

  // Perform division
  const result = numerator / denominator;

  // Check if result is valid
  return isFinite(result) ? result : defaultValue;
}

/**
 * Calculate average of array values safely
 * @param {number[]} values - Array of numbers
 * @param {number} defaultValue - Value to return if array is empty (default: 0)
 * @returns {number} Average or default value
 */
function safeAverage(values, defaultValue = 0) {
  if (!Array.isArray(values) || values.length === 0) {
    return defaultValue;
  }

  const sum = values.reduce((acc, val) => acc + val, 0);
  return safeDivide(sum, values.length, defaultValue);
}

/**
 * Calculate percentage safely
 * @param {number} part - The part value
 * @param {number} total - The total value
 * @param {number} defaultValue - Value to return if total is zero (default: 0)
 * @returns {number} Percentage (0-100)
 */
function safePercentage(part, total, defaultValue = 0) {
  return safeDivide(part, total, defaultValue) * 100;
}

/**
 * Round number to specified decimal places
 * @param {number} value - Number to round
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {number} Rounded number
 */
function roundTo(value, decimals = 2) {
  if (!isFinite(value)) {
    return 0;
  }

  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}

/**
 * Safely calculate precision (TP / (TP + FP))
 * @param {number} truePositives - True positive count
 * @param {number} falsePositives - False positive count
 * @param {number} defaultValue - Default if denominator is zero
 * @returns {number} Precision value (0-1)
 */
function safePrecision(truePositives, falsePositives, defaultValue = 0) {
  return safeDivide(truePositives, truePositives + falsePositives, defaultValue);
}

/**
 * Safely calculate recall (TP / (TP + FN))
 * @param {number} truePositives - True positive count
 * @param {number} falseNegatives - False negative count
 * @param {number} defaultValue - Default if denominator is zero
 * @returns {number} Recall value (0-1)
 */
function safeRecall(truePositives, falseNegatives, defaultValue = 0) {
  return safeDivide(truePositives, truePositives + falseNegatives, defaultValue);
}

/**
 * Safely calculate F1 score
 * @param {number} precision - Precision value (0-1)
 * @param {number} recall - Recall value (0-1)
 * @param {number} defaultValue - Default if both are zero
 * @returns {number} F1 score (0-1)
 */
function safeF1Score(precision, recall, defaultValue = 0) {
  if (precision === 0 && recall === 0) {
    return defaultValue;
  }

  return safeDivide(2 * precision * recall, precision + recall, defaultValue);
}

module.exports = {
  safeDivide,
  safeAverage,
  safePercentage,
  roundTo,
  safePrecision,
  safeRecall,
  safeF1Score
};
