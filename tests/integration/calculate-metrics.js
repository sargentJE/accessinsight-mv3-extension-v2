#!/usr/bin/env node

/**
 * Metrics Calculator for Integration Testing
 * Calculates accuracy metrics from scan results and manual validation
 */

const fs = require('fs').promises;
const path = require('path');
const {
  validateBatchResults,
  validateManualValidation,
  normalizeBatchResults,
  parseManualValidationCSV,
  mergeValidationData,
  calculateValidationStats
} = require('./helpers/data-validator');

/**
 * Calculate overall metrics from batch scan results
 */
function calculateOverallMetrics(batchResults) {
  const results = batchResults.results || [];

  const totalSites = results.length;
  const totalFindings = results.reduce((sum, r) => sum + (r.findings?.length || 0), 0);
  const avgFindings = totalSites > 0 ? totalFindings / totalSites : 0;

  const totalScanTime = results.reduce((sum, r) => sum + (r.scanTime || 0), 0);
  const avgScanTime = totalSites > 0 ? totalScanTime / totalSites : 0;

  const totalElements = results.reduce((sum, r) => sum + (r.elementCount || 0), 0);
  const avgElements = totalSites > 0 ? totalElements / totalSites : 0;

  return {
    totalSites,
    totalFindings,
    avgFindings: Math.round(avgFindings * 10) / 10,
    totalScanTime: Math.round(totalScanTime),
    avgScanTime: Math.round(avgScanTime),
    totalElements,
    avgElements: Math.round(avgElements)
  };
}

/**
 * Calculate metrics by category
 */
function calculateCategoryMetrics(batchResults) {
  const results = batchResults.results || [];

  const byCategory = {};

  results.forEach(result => {
    const category = result.category || 'unknown';

    if (!byCategory[category]) {
      byCategory[category] = {
        sites: 0,
        findings: 0,
        scanTime: 0,
        elements: 0
      };
    }

    byCategory[category].sites++;
    byCategory[category].findings += result.findings?.length || 0;
    byCategory[category].scanTime += result.scanTime || 0;
    byCategory[category].elements += result.elementCount || 0;
  });

  // Calculate averages
  for (const category in byCategory) {
    const data = byCategory[category];
    data.avgFindings = Math.round((data.findings / data.sites) * 10) / 10;
    data.avgScanTime = Math.round(data.scanTime / data.sites);
    data.avgElements = Math.round(data.elements / data.sites);
  }

  return byCategory;
}

/**
 * Calculate metrics by rule
 */
function calculateRuleMetrics(batchResults) {
  const results = batchResults.results || [];

  const byRule = {};

  results.forEach(result => {
    const findings = result.findings || [];

    findings.forEach(finding => {
      const rule = finding.rule || 'unknown';

      if (!byRule[rule]) {
        byRule[rule] = {
          count: 0,
          sites: new Set(),
          confidences: [],
          severities: {},
          wcagCriteria: new Set()
        };
      }

      byRule[rule].count++;
      byRule[rule].sites.add(result.siteName);
      byRule[rule].confidences.push(finding.confidence || 0);

      if (finding.severity) {
        byRule[rule].severities[finding.severity] = (byRule[rule].severities[finding.severity] || 0) + 1;
      }

      if (finding.wcag && Array.isArray(finding.wcag)) {
        finding.wcag.forEach(criterion => byRule[rule].wcagCriteria.add(criterion));
      }
    });
  });

  // Calculate aggregates
  const ruleMetrics = {};

  for (const rule in byRule) {
    const data = byRule[rule];

    const avgConfidence = data.confidences.length > 0
      ? data.confidences.reduce((a, b) => a + b, 0) / data.confidences.length
      : 0;

    const mostCommonSeverity = Object.entries(data.severities)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'unknown';

    ruleMetrics[rule] = {
      totalFindings: data.count,
      sitesAffected: data.sites.size,
      avgConfidence: Math.round(avgConfidence * 100) / 100,
      mostCommonSeverity,
      wcagCriteria: Array.from(data.wcagCriteria).sort()
    };
  }

  // Sort by frequency
  const sorted = Object.entries(ruleMetrics)
    .sort((a, b) => b[1].totalFindings - a[1].totalFindings);

  return Object.fromEntries(sorted);
}

/**
 * Calculate metrics by confidence level
 */
function calculateConfidenceMetrics(batchResults) {
  const results = batchResults.results || [];

  const byConfidence = {};

  results.forEach(result => {
    const findings = result.findings || [];

    findings.forEach(finding => {
      const conf = String(finding.confidence || 'unknown');

      if (!byConfidence[conf]) {
        byConfidence[conf] = {
          count: 0,
          rules: new Set(),
          sites: new Set()
        };
      }

      byConfidence[conf].count++;
      byConfidence[conf].rules.add(finding.rule);
      byConfidence[conf].sites.add(result.siteName);
    });
  });

  // Convert to simple format
  const confidenceMetrics = {};

  for (const conf in byConfidence) {
    const data = byConfidence[conf];

    confidenceMetrics[conf] = {
      totalFindings: data.count,
      uniqueRules: data.rules.size,
      sitesAffected: data.sites.size
    };
  }

  return confidenceMetrics;
}

/**
 * Calculate quality correlation metrics
 */
function calculateQualityCorrelation(batchResults) {
  const results = batchResults.results || [];

  const byQuality = {};

  results.forEach(result => {
    const quality = result.expectedQuality || 'unknown';

    if (!byQuality[quality]) {
      byQuality[quality] = {
        sites: 0,
        findings: 0
      };
    }

    byQuality[quality].sites++;
    byQuality[quality].findings += result.findings?.length || 0;
  });

  // Calculate averages
  for (const quality in byQuality) {
    const data = byQuality[quality];
    data.avgFindings = Math.round((data.findings / data.sites) * 10) / 10;
  }

  return byQuality;
}

/**
 * Main function
 */
async function calculateMetrics(options = {}) {
  const {
    batchFile = 'mock-batch-scan.json',
    validationFile = null,
    outputDir = path.join(__dirname, 'results')
  } = options;

  console.log('\n' + '='.repeat(70));
  console.log('📊 Metrics Calculator');
  console.log('='.repeat(70));

  // Load batch scan results
  console.log(`\n📥 Loading batch scan results...`);
  const batchPath = path.join(outputDir, batchFile);
  const batchData = JSON.parse(await fs.readFile(batchPath, 'utf8'));

  // Validate
  console.log('   Validating data...');
  const validation = validateBatchResults(batchData);

  if (!validation.valid) {
    console.error('   ❌ Validation failed:');
    validation.errors.forEach(err => console.error(`      - ${err}`));
    process.exit(1);
  }

  if (validation.warnings.length > 0) {
    console.log('   ⚠️  Warnings:');
    validation.warnings.forEach(warn => console.log(`      - ${warn}`));
  }

  console.log(`   ✅ Loaded ${validation.stats.totalSites} sites, ${validation.stats.totalFindings} findings`);

  // Normalize data
  const normalized = normalizeBatchResults(batchData);

  // Calculate metrics
  console.log('\n📈 Calculating metrics...');

  const overall = calculateOverallMetrics(normalized);
  console.log('   ✅ Overall metrics calculated');

  const byCategory = calculateCategoryMetrics(normalized);
  console.log('   ✅ Category metrics calculated');

  const byRule = calculateRuleMetrics(normalized);
  console.log(`   ✅ Rule metrics calculated (${Object.keys(byRule).length} rules)`);

  const byConfidence = calculateConfidenceMetrics(normalized);
  console.log(`   ✅ Confidence metrics calculated (${Object.keys(byConfidence).length} levels)`);

  const byQuality = calculateQualityCorrelation(normalized);
  console.log('   ✅ Quality correlation calculated');

  // If manual validation provided, calculate accuracy metrics
  let accuracyMetrics = null;

  if (validationFile) {
    console.log('\n📝 Processing manual validation...');
    const validationPath = path.join(outputDir, validationFile);

    try {
      const validationCSV = await fs.readFile(validationPath, 'utf8');
      const validationData = parseManualValidationCSV(validationCSV);

      console.log(`   ✅ Loaded ${validationData.length} validation entries`);

      const merged = mergeValidationData(normalized, validationData);
      accuracyMetrics = calculateValidationStats(merged);

      console.log(`   ✅ Accuracy metrics calculated`);
      console.log(`      Precision: ${(accuracyMetrics.precision * 100).toFixed(1)}%`);
      console.log(`      Recall: ${(accuracyMetrics.recall * 100).toFixed(1)}%`);
      console.log(`      F1 Score: ${(accuracyMetrics.f1Score * 100).toFixed(1)}%`);
      console.log(`      False Positive Rate: ${(accuracyMetrics.falsePositiveRate * 100).toFixed(1)}%`);
    } catch (error) {
      console.log(`   ⚠️  Could not load validation file: ${error.message}`);
    }
  }

  // Compile results
  const metricsReport = {
    metadata: {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      batchFile: batchFile,
      validationFile: validationFile
    },
    overall,
    byCategory,
    byRule,
    byConfidence,
    byQuality,
    accuracy: accuracyMetrics
  };

  // Save results
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const metricsPath = path.join(outputDir, `metrics-${timestamp}.json`);
  const latestPath = path.join(outputDir, 'metrics-latest.json');

  await fs.writeFile(metricsPath, JSON.stringify(metricsReport, null, 2));
  await fs.writeFile(latestPath, JSON.stringify(metricsReport, null, 2));

  // Print summary
  console.log('\n' + '='.repeat(70));
  console.log('✨ Metrics Calculation Complete!');
  console.log('='.repeat(70));

  console.log('\n📊 Overall Statistics:');
  console.log(`   Total Sites: ${overall.totalSites}`);
  console.log(`   Total Findings: ${overall.totalFindings}`);
  console.log(`   Avg Findings/Site: ${overall.avgFindings}`);
  console.log(`   Avg Scan Time: ${overall.avgScanTime}ms`);

  console.log('\n📁 By Category:');
  Object.entries(byCategory)
    .sort((a, b) => b[1].avgFindings - a[1].avgFindings)
    .slice(0, 5)
    .forEach(([category, data]) => {
      console.log(`   ${category}: ${data.avgFindings} avg findings (${data.sites} sites)`);
    });

  console.log('\n🔝 Top 10 Rules:');
  Object.entries(byRule)
    .slice(0, 10)
    .forEach(([rule, data], index) => {
      console.log(`   ${index + 1}. ${rule}: ${data.totalFindings} findings (${data.sitesAffected} sites, conf ${data.avgConfidence})`);
    });

  console.log('\n📈 By Confidence:');
  Object.entries(byConfidence)
    .sort((a, b) => parseFloat(b[0]) - parseFloat(a[0]))
    .forEach(([conf, data]) => {
      console.log(`   ${conf}: ${data.totalFindings} findings (${data.uniqueRules} rules)`);
    });

  if (accuracyMetrics) {
    console.log('\n🎯 Accuracy Metrics:');
    console.log(`   Precision: ${(accuracyMetrics.precision * 100).toFixed(1)}%`);
    console.log(`   Recall: ${(accuracyMetrics.recall * 100).toFixed(1)}%`);
    console.log(`   F1 Score: ${(accuracyMetrics.f1Score * 100).toFixed(1)}%`);
    console.log(`   False Positive Rate: ${(accuracyMetrics.falsePositiveRate * 100).toFixed(1)}%`);
    console.log(`   Validation Progress: ${(accuracyMetrics.validationProgress * 100).toFixed(1)}%`);
  }

  console.log('\n💾 Results saved to:');
  console.log(`   ${metricsPath}`);
  console.log(`   ${latestPath}\n`);

  return metricsReport;
}

// CLI
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--batch' && args[i + 1]) {
      options.batchFile = args[i + 1];
      i++;
    } else if (arg === '--validation' && args[i + 1]) {
      options.validationFile = args[i + 1];
      i++;
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
Usage: node calculate-metrics.js [options]

Options:
  --batch FILE         Batch scan results file (default: mock-batch-scan.json)
  --validation FILE    Manual validation CSV file (optional)
  --help, -h           Show this help message

Examples:
  node calculate-metrics.js
  node calculate-metrics.js --batch batch-scan-latest.json
  node calculate-metrics.js --batch mock-batch-scan.json --validation manual-validation-template.csv
      `);
      process.exit(0);
    }
  }

  return options;
}

if (require.main === module) {
  const options = parseArgs();

  calculateMetrics(options)
    .then(() => {
      console.log('✅ Metrics calculation completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Metrics calculation failed:', error);
      process.exit(1);
    });
}

module.exports = { calculateMetrics };
