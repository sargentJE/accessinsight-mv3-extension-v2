#!/usr/bin/env node

/**
 * Mock Data Generator for Integration Testing
 * Generates realistic scan results for testing the analysis pipeline
 * without requiring actual browser automation
 */

const fs = require('fs').promises;
const path = require('path');
const testSites = require('./test-sites.json');

// Rule definitions with realistic characteristics
const RULES = [
  { id: 'img-alt', confidence: 0.9, avgFindings: 3, variance: 2 },
  { id: 'button-name', confidence: 0.9, avgFindings: 2, variance: 1 },
  { id: 'label-control', confidence: 0.9, avgFindings: 4, variance: 2 },
  { id: 'text-contrast', confidence: 0.8, avgFindings: 8, variance: 4 },
  { id: 'link-name', confidence: 0.9, avgFindings: 3, variance: 2 },
  { id: 'document-title', confidence: 0.9, avgFindings: 0.5, variance: 0.5 },
  { id: 'html-has-lang', confidence: 0.9, avgFindings: 0.5, variance: 0.5 },
  { id: 'heading-order', confidence: 0.8, avgFindings: 2, variance: 1 },
  { id: 'skip-link', confidence: 0.8, avgFindings: 0.8, variance: 0.5 },
  { id: 'aria-hidden-focus', confidence: 0.8, avgFindings: 1, variance: 1 },
  { id: 'target-size', confidence: 0.7, avgFindings: 6, variance: 3 },
  { id: 'link-in-text-block', confidence: 0.7, avgFindings: 4, variance: 2 },
  { id: 'focus-appearance', confidence: 0.6, avgFindings: 5, variance: 3 },
  { id: 'redundant-entry', confidence: 0.7, avgFindings: 2, variance: 1 },
  { id: 'accessible-authentication-minimum', confidence: 0.7, avgFindings: 1, variance: 1 }
];

// Quality multipliers by category
const QUALITY_MULTIPLIERS = {
  'excellent': 0.3,  // Accessibility-focused sites
  'good': 0.6,       // Government, education
  'medium': 1.0,     // E-commerce, news, SaaS
  'poor-medium': 1.4 // CMS, small business
};

/**
 * Generate random findings for a rule
 */
function generateRuleFindings(rule, siteQuality, elementCount) {
  const qualityMultiplier = QUALITY_MULTIPLIERS[siteQuality] || 1.0;
  const siteMultiplier = Math.sqrt(elementCount / 1000); // More elements = more potential issues

  const expectedCount = rule.avgFindings * qualityMultiplier * siteMultiplier;
  const actualCount = Math.max(0, Math.round(
    expectedCount + (Math.random() - 0.5) * rule.variance * 2
  ));

  const findings = [];

  for (let i = 0; i < actualCount; i++) {
    findings.push({
      rule: rule.id,
      message: `${rule.id} violation detected`,
      selector: `#element-${Math.floor(Math.random() * elementCount)}`,
      wcag: getWCAGCriteria(rule.id),
      confidence: rule.confidence,
      severity: getSeverity(rule.id),
      impact: getImpact(rule.id)
    });
  }

  return findings;
}

/**
 * Get WCAG criteria for a rule
 */
function getWCAGCriteria(ruleId) {
  const wcagMap = {
    'img-alt': ['1.1.1'],
    'button-name': ['4.1.2'],
    'label-control': ['1.3.1', '3.3.2'],
    'text-contrast': ['1.4.3', '1.4.6'],
    'link-name': ['4.1.2', '2.4.4'],
    'document-title': ['2.4.2'],
    'html-has-lang': ['3.1.1'],
    'heading-order': ['1.3.1', '2.4.6'],
    'skip-link': ['2.4.1'],
    'aria-hidden-focus': ['4.1.2', '1.3.1'],
    'target-size': ['2.5.5', '2.5.8'],
    'link-in-text-block': ['1.4.1'],
    'focus-appearance': ['2.4.11', '2.4.7'],
    'redundant-entry': ['3.3.7'],
    'accessible-authentication-minimum': ['3.3.8']
  };

  return wcagMap[ruleId] || ['1.1.1'];
}

/**
 * Get severity for a rule
 */
function getSeverity(ruleId) {
  const critical = ['img-alt', 'button-name', 'label-control', 'document-title', 'html-has-lang'];
  const serious = ['text-contrast', 'link-name', 'heading-order', 'aria-hidden-focus'];

  if (critical.includes(ruleId)) return 'critical';
  if (serious.includes(ruleId)) return 'serious';
  return 'moderate';
}

/**
 * Get impact for a rule
 */
function getImpact(ruleId) {
  const critical = ['img-alt', 'button-name', 'label-control'];
  const serious = ['text-contrast', 'link-name'];

  if (critical.includes(ruleId)) return 'critical';
  if (serious.includes(ruleId)) return 'serious';
  return 'moderate';
}

/**
 * Generate mock scan for a single site
 */
function generateSiteScan(site, category) {
  // Element count varies by site type
  const baseElements = {
    'government': 800,
    'ecommerce': 1500,
    'news': 1200,
    'education': 900,
    'saas': 1800,
    'accessibility': 600,
    'cms': 1000
  };

  const elementCount = Math.round(
    (baseElements[category] || 1000) * (0.8 + Math.random() * 0.4)
  );

  // Generate findings for each rule
  const findings = [];
  for (const rule of RULES) {
    // Not all rules fire on all sites
    if (Math.random() < 0.7) { // 70% chance rule applies
      const ruleFindings = generateRuleFindings(rule, site.expectedQuality, elementCount);
      findings.push(...ruleFindings);
    }
  }

  // Scan time roughly proportional to element count
  const scanTime = Math.round(50 + (elementCount / 10) + Math.random() * 100);

  return {
    success: true,
    siteId: site.id,
    siteName: site.name,
    url: site.url,
    category: category,
    expectedQuality: site.expectedQuality,
    findings: findings,
    scanTime: scanTime,
    elementCount: elementCount,
    title: `${site.name} - Home Page`,
    timestamp: new Date().toISOString(),
    stats: {
      total: findings.length,
      byRule: findings.reduce((acc, f) => {
        acc[f.rule] = (acc[f.rule] || 0) + 1;
        return acc;
      }, {}),
      byConfidence: findings.reduce((acc, f) => {
        const conf = String(f.confidence);
        acc[conf] = (acc[conf] || 0) + 1;
        return acc;
      }, {}),
      byCriteria: {}
    }
  };
}

/**
 * Generate complete batch scan results
 */
function generateBatchScanResults(options = {}) {
  const {
    subset = null,
    category = null
  } = options;

  // Filter sites
  let sitesToScan = [];

  if (category) {
    const cat = testSites.categories.find(c => c.name === category);
    if (cat) {
      sitesToScan = cat.sites.map(site => ({ ...site, category: cat.name }));
    }
  } else {
    sitesToScan = testSites.categories.flatMap(cat =>
      cat.sites.map(site => ({ ...site, category: cat.name }))
    );
  }

  if (subset && subset > 0) {
    sitesToScan = sitesToScan.slice(0, subset);
  }

  const results = sitesToScan.map(site => generateSiteScan(site, site.category));

  return {
    metadata: {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      totalSites: sitesToScan.length,
      successfulScans: results.length,
      failedScans: 0,
      totalTime: Math.round(results.reduce((sum, r) => sum + r.scanTime, 0) / 1000)
    },
    results: results,
    errors: []
  };
}

/**
 * Generate mock axe-core results for baseline comparison
 */
function generateAxeResults(site, accessInsightFindings) {
  // axe typically finds different issues (different rules)
  // Overlap is about 40-60%
  const axeViolations = [];

  // Common issues both tools find
  const commonRules = ['img-alt', 'button-name', 'label-control', 'text-contrast', 'html-has-lang'];

  for (const rule of commonRules) {
    if (Math.random() < 0.7) { // 70% chance axe finds it too
      axeViolations.push({
        id: `axe-${rule}`,
        impact: getImpact(rule),
        tags: ['wcag2a', 'wcag2aa'],
        description: `${rule} violations found`,
        nodes: Math.floor(Math.random() * 5) + 1
      });
    }
  }

  // Issues only axe finds (different rules or approaches)
  const axeOnlyRules = ['color-contrast', 'link-name', 'duplicate-id', 'aria-valid-attr'];

  for (const rule of axeOnlyRules) {
    if (Math.random() < 0.5) {
      axeViolations.push({
        id: rule,
        impact: Math.random() < 0.5 ? 'serious' : 'moderate',
        tags: ['wcag2a', 'wcag2aa'],
        description: `${rule} violations found`,
        nodes: Math.floor(Math.random() * 4) + 1
      });
    }
  }

  const totalIssues = axeViolations.reduce((sum, v) => sum + v.nodes, 0);

  return {
    violationTypes: axeViolations.length,
    totalIssues: totalIssues,
    passes: 25 + Math.floor(Math.random() * 10),
    incomplete: Math.floor(Math.random() * 3),
    inapplicable: 15 + Math.floor(Math.random() * 10),
    violations: axeViolations
  };
}

/**
 * Generate baseline comparison data
 */
function generateBaselineComparison(batchResults, count = 10) {
  const sitesToCompare = batchResults.results.slice(0, count);

  const comparisons = sitesToCompare.map(result => {
    const axeResults = generateAxeResults(result.siteName, result.findings);

    return {
      siteName: result.siteName,
      siteId: result.siteId,
      url: result.url,
      category: result.category,
      expectedQuality: result.expectedQuality,
      timestamp: result.timestamp,

      axe: axeResults,

      accessInsight: {
        totalFindings: result.findings.length,
        scanTime: result.scanTime,
        byRule: result.stats.byRule,
        byConfidence: result.stats.byConfidence,
        findings: result.findings.map(f => ({
          rule: f.rule,
          confidence: f.confidence,
          wcag: f.wcag,
          selector: f.selector
        }))
      },

      analysis: {
        axeToAccessInsightRatio: result.findings.length / (axeResults.totalIssues || 1),
        axeRules: axeResults.violationTypes,
        accessInsightRules: Object.keys(result.stats.byRule).length
      }
    };
  });

  return {
    metadata: {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      totalSites: sitesToCompare.length,
      successfulComparisons: comparisons.length,
      failedComparisons: 0
    },
    comparisons: comparisons,
    summary: {
      axe: {
        totalIssues: comparisons.reduce((sum, c) => sum + c.axe.totalIssues, 0),
        avgPerSite: Math.round(
          comparisons.reduce((sum, c) => sum + c.axe.totalIssues, 0) / comparisons.length
        )
      },
      accessInsight: {
        totalFindings: comparisons.reduce((sum, c) => sum + c.accessInsight.totalFindings, 0),
        avgPerSite: Math.round(
          comparisons.reduce((sum, c) => sum + c.accessInsight.totalFindings, 0) / comparisons.length
        ),
        avgScanTime: Math.round(
          comparisons.reduce((sum, c) => sum + c.accessInsight.scanTime, 0) / comparisons.length
        )
      },
      avgRatio: (comparisons.reduce((sum, c) => sum + c.analysis.axeToAccessInsightRatio, 0) / comparisons.length).toFixed(2)
    }
  };
}

/**
 * Generate manual validation template
 */
function generateManualValidationTemplate(batchResults, count = 5) {
  const sitesToValidate = batchResults.results.slice(0, count);

  const csv = ['site_name,site_id,finding_index,rule,confidence,classification,notes,reviewer,date'];

  for (const result of sitesToValidate) {
    for (let i = 0; i < Math.min(result.findings.length, 20); i++) {
      const finding = result.findings[i];
      csv.push(`"${result.siteName}","${result.siteId}",${i},"${finding.rule}",${finding.confidence},"","","",""`);
    }
  }

  return csv.join('\n');
}

/**
 * Main function
 */
async function generateMockData(options = {}) {
  const {
    subset = 40,
    comparisonCount = 10,
    validationCount = 5,
    outputDir = path.join(__dirname, 'results')
  } = options;

  console.log('\n' + '='.repeat(70));
  console.log('🎲 Mock Data Generator');
  console.log('='.repeat(70));
  console.log(`\nGenerating mock integration test data...`);
  console.log(`Sites: ${subset}`);
  console.log(`Comparison sites: ${comparisonCount}`);
  console.log(`Validation sites: ${validationCount}\n`);

  // Ensure output directory exists
  await fs.mkdir(outputDir, { recursive: true });

  // Generate batch scan results
  console.log('📊 Generating batch scan results...');
  const batchResults = generateBatchScanResults({ subset });

  const batchPath = path.join(outputDir, 'mock-batch-scan.json');
  await fs.writeFile(batchPath, JSON.stringify(batchResults, null, 2));
  console.log(`   ✅ Saved: ${batchPath}`);
  console.log(`   Total findings: ${batchResults.results.reduce((sum, r) => sum + r.findings.length, 0)}`);
  console.log(`   Avg per site: ${Math.round(batchResults.results.reduce((sum, r) => sum + r.findings.length, 0) / batchResults.results.length)}`);

  // Generate baseline comparison
  console.log('\n🔬 Generating baseline comparison...');
  const baselineComparison = generateBaselineComparison(batchResults, comparisonCount);

  const baselinePath = path.join(outputDir, 'mock-baseline-comparison.json');
  await fs.writeFile(baselinePath, JSON.stringify(baselineComparison, null, 2));
  console.log(`   ✅ Saved: ${baselinePath}`);
  console.log(`   AccessInsight avg: ${baselineComparison.summary.accessInsight.avgPerSite} findings/site`);
  console.log(`   axe-core avg: ${baselineComparison.summary.axe.avgPerSite} issues/site`);
  console.log(`   Ratio: ${baselineComparison.summary.avgRatio}x`);

  // Generate manual validation template
  console.log('\n📝 Generating manual validation template...');
  const validationCSV = generateManualValidationTemplate(batchResults, validationCount);

  const validationPath = path.join(outputDir, 'manual-validation-template.csv');
  await fs.writeFile(validationPath, validationCSV);
  console.log(`   ✅ Saved: ${validationPath}`);

  const findingsToValidate = batchResults.results
    .slice(0, validationCount)
    .reduce((sum, r) => sum + Math.min(r.findings.length, 20), 0);
  console.log(`   Findings to validate: ${findingsToValidate}`);

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('✨ Mock Data Generation Complete!');
  console.log('='.repeat(70));
  console.log('\n📁 Generated Files:');
  console.log(`   1. ${batchPath}`);
  console.log(`   2. ${baselinePath}`);
  console.log(`   3. ${validationPath}`);
  console.log('\n💡 Next Steps:');
  console.log('   - Use mock data to test analysis scripts');
  console.log('   - Run: node tests/integration/calculate-metrics.js');
  console.log('   - Run: node tests/integration/analyze-patterns.js');
  console.log('   - Run: node tests/integration/generate-report.js\n');

  return {
    batchResults,
    baselineComparison,
    validationCSV
  };
}

// CLI
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--subset' && args[i + 1]) {
      options.subset = parseInt(args[i + 1], 10);
      i++;
    } else if (arg === '--comparison' && args[i + 1]) {
      options.comparisonCount = parseInt(args[i + 1], 10);
      i++;
    } else if (arg === '--validation' && args[i + 1]) {
      options.validationCount = parseInt(args[i + 1], 10);
      i++;
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
Usage: node generate-mock-data.js [options]

Options:
  --subset N         Number of sites to generate (default: 40)
  --comparison N     Number of sites for baseline comparison (default: 10)
  --validation N     Number of sites for manual validation (default: 5)
  --help, -h         Show this help message

Examples:
  node generate-mock-data.js
  node generate-mock-data.js --subset 20 --comparison 5
      `);
      process.exit(0);
    }
  }

  return options;
}

if (require.main === module) {
  const options = parseArgs();

  generateMockData(options)
    .then(() => {
      console.log('✅ Mock data generation completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Mock data generation failed:', error.message);
      if (error.stack) {
        console.error(error.stack);
      }
      process.exit(1);
    });
}

module.exports = { generateMockData, generateBatchScanResults, generateBaselineComparison };
