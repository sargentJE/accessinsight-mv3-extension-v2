/**
 * Error Handler Utility
 * Standardizes error reporting across all CLI tools
 *
 * Fixes inconsistent error handling found in 4 files during code review
 */

/**
 * Create standardized error handler for a script
 * @param {string} scriptName - Name of the script (e.g., "Pattern analysis")
 * @returns {Function} Error handler function
 */
function createErrorHandler(scriptName) {
  return function handleError(error) {
    console.error(`❌ ${scriptName} failed:`, error.message);

    // Always include stack trace for debugging
    if (error.stack) {
      console.error(error.stack);
    }

    process.exit(1);
  };
}

/**
 * Create standardized success handler for a script
 * @param {string} scriptName - Name of the script (e.g., "Pattern analysis")
 * @param {string} action - Action completed (default: "completed")
 * @returns {Function} Success handler function
 */
function createSuccessHandler(scriptName, action = 'completed') {
  return function handleSuccess() {
    console.log(`✅ ${scriptName} ${action} successfully`);
    process.exit(0);
  };
}

module.exports = {
  createErrorHandler,
  createSuccessHandler
};
