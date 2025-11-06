/**
 * Data Validator for Integration Testing
 * Validates and normalizes input data for analysis pipeline
 */

/**
 * Validate batch scan results
 */
function validateBatchResults(data) {
  const errors = [];
  const warnings = [];

  // Check top-level structure
  if (!data || typeof data !== 'object') {
    errors.push('Data must be an object');
    return { valid: false, errors, warnings };
  }

  // Check metadata
  if (!data.metadata) {
    warnings.push('Missing metadata');
  } else {
    if (typeof data.metadata.totalSites !== 'number') {
      warnings.push('metadata.totalSites should be a number');
    }
    if (!data.metadata.timestamp) {
      warnings.push('Missing metadata.timestamp');
    }
  }

  // Check results array
  if (!Array.isArray(data.results)) {
    errors.push('results must be an array');
    return { valid: false, errors, warnings };
  }

  if (data.results.length === 0) {
    warnings.push('No results found');
  }

  // Validate each result
  data.results.forEach((result, index) => {
    const prefix = `results[${index}]`;

    if (!result.siteName) {
      errors.push(`${prefix}: Missing siteName`);
    }

    if (!result.url) {
      errors.push(`${prefix}: Missing url`);
    }

    if (!Array.isArray(result.findings)) {
      errors.push(`${prefix}: findings must be an array`);
    } else {
      // Validate findings
      result.findings.forEach((finding, fIndex) => {
        const fPrefix = `${prefix}.findings[${fIndex}]`;

        if (!finding.rule) {
          errors.push(`${fPrefix}: Missing rule`);
        }

        if (finding.confidence !== undefined &&
            (finding.confidence < 0 || finding.confidence > 1)) {
          errors.push(`${fPrefix}: confidence must be between 0 and 1`);
        }

        if (!finding.selector) {
          warnings.push(`${fPrefix}: Missing selector`);
        }
      });
    }

    if (typeof result.scanTime !== 'number') {
      warnings.push(`${prefix}: scanTime should be a number`);
    }

    if (typeof result.elementCount !== 'number') {
      warnings.push(`${prefix}: elementCount should be a number`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    stats: {
      totalSites: data.results.length,
      totalFindings: data.results.reduce((sum, r) =>
        sum + (r.findings ? r.findings.length : 0), 0
      )
    }
  };
}

/**
 * Validate baseline comparison data
 */
function validateBaselineComparison(data) {
  const errors = [];
  const warnings = [];

  if (!data || typeof data !== 'object') {
    errors.push('Data must be an object');
    return { valid: false, errors, warnings };
  }

  if (!Array.isArray(data.comparisons)) {
    errors.push('comparisons must be an array');
    return { valid: false, errors, warnings };
  }

  data.comparisons.forEach((comp, index) => {
    const prefix = `comparisons[${index}]`;

    if (!comp.siteName) {
      errors.push(`${prefix}: Missing siteName`);
    }

    if (!comp.axe) {
      errors.push(`${prefix}: Missing axe results`);
    } else {
      if (typeof comp.axe.totalIssues !== 'number') {
        warnings.push(`${prefix}.axe: totalIssues should be a number`);
      }
    }

    if (!comp.accessInsight) {
      errors.push(`${prefix}: Missing accessInsight results`);
    } else {
      if (typeof comp.accessInsight.totalFindings !== 'number') {
        warnings.push(`${prefix}.accessInsight: totalFindings should be a number`);
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    stats: {
      totalComparisons: data.comparisons.length
    }
  };
}

/**
 * Validate manual validation data (CSV format)
 */
function validateManualValidation(csvString) {
  const errors = [];
  const warnings = [];

  if (!csvString || typeof csvString !== 'string') {
    errors.push('CSV data must be a string');
    return { valid: false, errors, warnings };
  }

  const lines = csvString.trim().split('\n');

  if (lines.length < 2) {
    errors.push('CSV must have at least a header row and one data row');
    return { valid: false, errors, warnings };
  }

  // Check header
  const header = lines[0].toLowerCase();
  const requiredFields = ['site_name', 'rule', 'classification'];

  for (const field of requiredFields) {
    if (!header.includes(field)) {
      errors.push(`Missing required field in header: ${field}`);
    }
  }

  // Parse and validate data rows
  const validClassifications = ['true_positive', 'false_positive', 'false_negative', 'uncertain', ''];
  let validatedCount = 0;
  let unvalidatedCount = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];

    if (!line.trim()) continue;

    // Simple CSV parsing (handles quotes)
    const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];

    if (values.length < 3) {
      warnings.push(`Line ${i + 1}: Insufficient columns`);
      continue;
    }

    // Check classification (usually 5th column)
    const classification = values[4] ? values[4].replace(/"/g, '').toLowerCase() : '';

    if (classification && !validClassifications.includes(classification)) {
      warnings.push(`Line ${i + 1}: Invalid classification "${classification}"`);
    }

    if (classification && classification !== '') {
      validatedCount++;
    } else {
      unvalidatedCount++;
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    stats: {
      totalRows: lines.length - 1,
      validatedFindings: validatedCount,
      unvalidatedFindings: unvalidatedCount,
      validationProgress: validatedCount / (validatedCount + unvalidatedCount) || 0
    }
  };
}

/**
 * Normalize batch scan results (ensure consistent format)
 */
function normalizeBatchResults(data) {
  const normalized = JSON.parse(JSON.stringify(data)); // Deep clone

  // Ensure metadata exists
  if (!normalized.metadata) {
    normalized.metadata = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      totalSites: normalized.results?.length || 0
    };
  }

  // Normalize each result
  if (Array.isArray(normalized.results)) {
    normalized.results = normalized.results.map(result => ({
      ...result,
      findings: result.findings || [],
      scanTime: result.scanTime || 0,
      elementCount: result.elementCount || 0,
      category: result.category || 'unknown',
      expectedQuality: result.expectedQuality || 'medium',
      stats: result.stats || {
        total: (result.findings || []).length,
        byRule: {},
        byConfidence: {}
      }
    }));
  }

  return normalized;
}

/**
 * Parse manual validation CSV
 */
function parseManualValidationCSV(csvString) {
  const lines = csvString.trim().split('\n');

  if (lines.length < 2) {
    return [];
  }

  const header = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/"/g, ''));

  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];

    if (!line.trim()) continue;

    const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
    const cleanValues = values.map(v => v.replace(/^"|"$/g, ''));

    const row = {};
    header.forEach((key, index) => {
      row[key] = cleanValues[index] || '';
    });

    data.push(row);
  }

  return data;
}

/**
 * Merge validation data with scan results
 */
function mergeValidationData(batchResults, validationData) {
  const merged = JSON.parse(JSON.stringify(batchResults)); // Deep clone

  // Create validation lookup
  const validationMap = {};

  validationData.forEach(row => {
    const key = `${row.site_name}:${row.finding_index || row.rule}`;
    validationMap[key] = {
      classification: row.classification || '',
      notes: row.notes || '',
      reviewer: row.reviewer || '',
      date: row.date || ''
    };
  });

  // Merge validation into results
  merged.results = merged.results.map(result => {
    const findings = result.findings.map((finding, index) => {
      const key1 = `${result.siteName}:${index}`;
      const key2 = `${result.siteName}:${finding.rule}`;

      const validation = validationMap[key1] || validationMap[key2];

      if (validation) {
        return {
          ...finding,
          validation: validation
        };
      }

      return finding;
    });

    return {
      ...result,
      findings: findings
    };
  });

  return merged;
}

/**
 * Calculate validation statistics
 */
function calculateValidationStats(mergedData) {
  let totalFindings = 0;
  let validatedFindings = 0;
  let truePositives = 0;
  let falsePositives = 0;
  let falseNegatives = 0;
  let uncertain = 0;

  mergedData.results.forEach(result => {
    result.findings.forEach(finding => {
      totalFindings++;

      if (finding.validation && finding.validation.classification) {
        validatedFindings++;

        const classification = finding.validation.classification.toLowerCase();

        if (classification === 'true_positive') truePositives++;
        else if (classification === 'false_positive') falsePositives++;
        else if (classification === 'false_negative') falseNegatives++;
        else if (classification === 'uncertain') uncertain++;
      }
    });
  });

  const precision = truePositives / (truePositives + falsePositives) || 0;
  const recall = truePositives / (truePositives + falseNegatives) || 0;
  const f1Score = (2 * precision * recall) / (precision + recall) || 0;

  return {
    totalFindings,
    validatedFindings,
    unvalidatedFindings: totalFindings - validatedFindings,
    validationProgress: validatedFindings / totalFindings || 0,
    truePositives,
    falsePositives,
    falseNegatives,
    uncertain,
    precision: precision,
    recall: recall,
    f1Score: f1Score,
    falsePositiveRate: falsePositives / (falsePositives + truePositives) || 0
  };
}

module.exports = {
  validateBatchResults,
  validateBaselineComparison,
  validateManualValidation,
  normalizeBatchResults,
  parseManualValidationCSV,
  mergeValidationData,
  calculateValidationStats
};
