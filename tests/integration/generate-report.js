#!/usr/bin/env node

/**
 * Report Generator for Integration Testing
 * Generates comprehensive reports from analysis results in multiple formats
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * Generate Markdown report
 */
async function generateMarkdownReport(metrics, patterns, comparison) {
  const lines = [];

  // Header
  lines.push('# AccessInsight Integration Testing Report');
  lines.push('');
  lines.push(`**Generated**: ${new Date().toISOString()}`);
  lines.push(`**Analysis Date**: ${metrics?.metadata?.timestamp || 'N/A'}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // Executive Summary
  lines.push('## Executive Summary');
  lines.push('');

  if (patterns?.validationStats) {
    const stats = patterns.validationStats;
    lines.push(`**Overall Accuracy**:`);
    lines.push(`- Precision: **${(stats.precision * 100).toFixed(1)}%**`);
    lines.push(`- Recall: **${(stats.recall * 100).toFixed(1)}%**`);
    lines.push(`- F1 Score: **${(stats.f1Score * 100).toFixed(1)}%**`);
    lines.push(`- False Positive Rate: **${(stats.falsePositiveRate * 100).toFixed(1)}%**`);
    lines.push('');
  }

  if (metrics?.overall) {
    lines.push(`**Testing Coverage**:`);
    lines.push(`- Sites Tested: **${metrics.overall.totalSites}**`);
    lines.push(`- Total Findings: **${metrics.overall.totalFindings}**`);
    lines.push(`- Avg Findings/Site: **${metrics.overall.avgFindings}**`);
    lines.push(`- Avg Scan Time: **${metrics.overall.avgScanTime}ms**`);
    lines.push('');
  }

  if (comparison?.summary) {
    lines.push(`**Comparison with axe-core**:`);
    lines.push(`- AccessInsight: **${comparison.summary.accessInsight.totalFindings}** findings`);
    lines.push(`- axe-core: **${comparison.summary.axeCore.totalIssues}** issues`);
    lines.push(`- Ratio: **${comparison.summary.ratio}x**`);
    lines.push('');
  }

  lines.push('---');
  lines.push('');

  // Table of Contents
  lines.push('## Table of Contents');
  lines.push('');
  lines.push('1. [Overall Metrics](#overall-metrics)');
  lines.push('2. [Rule Performance](#rule-performance)');
  lines.push('3. [False Positive Patterns](#false-positive-patterns)');
  lines.push('4. [Confidence Accuracy](#confidence-accuracy)');
  lines.push('5. [Tool Comparison](#tool-comparison)');
  lines.push('6. [Recommendations](#recommendations)');
  lines.push('7. [Detailed Findings](#detailed-findings)');
  lines.push('');
  lines.push('---');
  lines.push('');

  // Overall Metrics
  lines.push('## Overall Metrics');
  lines.push('');

  if (metrics?.byCategory) {
    lines.push('### By Category');
    lines.push('');
    lines.push('| Category | Sites | Avg Findings | Avg Scan Time |');
    lines.push('|----------|-------|--------------|---------------|');

    Object.entries(metrics.byCategory)
      .sort((a, b) => b[1].avgFindings - a[1].avgFindings)
      .forEach(([category, data]) => {
        lines.push(`| ${category} | ${data.sites} | ${data.avgFindings} | ${data.avgScanTime}ms |`);
      });

    lines.push('');
  }

  if (metrics?.byConfidence) {
    lines.push('### By Confidence Level');
    lines.push('');
    lines.push('| Confidence | Findings | Rules | Sites |');
    lines.push('|------------|----------|-------|-------|');

    Object.entries(metrics.byConfidence)
      .sort((a, b) => parseFloat(b[0]) - parseFloat(a[0]))
      .forEach(([conf, data]) => {
        lines.push(`| ${conf} | ${data.totalFindings} | ${data.uniqueRules} | ${data.sitesAffected} |`);
      });

    lines.push('');
  }

  lines.push('---');
  lines.push('');

  // Rule Performance
  lines.push('## Rule Performance');
  lines.push('');

  if (patterns?.rulePerformance?.performances) {
    const perfs = patterns.rulePerformance.performances;

    lines.push('### Performance Summary');
    lines.push('');
    lines.push(`- **Excellent Rules**: ${patterns.rulePerformance.excellentRules}`);
    lines.push(`- **Good Rules**: ${patterns.rulePerformance.goodRules}`);
    lines.push(`- **Fair Rules**: ${patterns.rulePerformance.fairRules}`);
    lines.push(`- **Poor Rules**: ${patterns.rulePerformance.poorRules}`);
    lines.push('');

    lines.push('### Detailed Performance');
    lines.push('');
    lines.push('| Rule | Performance | Precision | FP Rate | Validated |');
    lines.push('|------|-------------|-----------|---------|-----------|');

    perfs.forEach(perf => {
      const badge = perf.performance === 'EXCELLENT' ? '🟢' :
                    perf.performance === 'GOOD' ? '🟡' :
                    perf.performance === 'FAIR' ? '🟠' : '🔴';

      lines.push(`| ${badge} ${perf.rule} | ${perf.performance} | ${(perf.precision * 100).toFixed(0)}% | ${(perf.falsePositiveRate * 100).toFixed(0)}% | ${perf.validated} |`);
    });

    lines.push('');
  }

  lines.push('---');
  lines.push('');

  // False Positive Patterns
  lines.push('## False Positive Patterns');
  lines.push('');

  if (patterns?.falsePositivePatterns?.patterns?.length > 0) {
    const fps = patterns.falsePositivePatterns.patterns;

    lines.push(`**Total Patterns Identified**: ${fps.length}`);
    lines.push(`**Critical Patterns**: ${patterns.falsePositivePatterns.criticalPatterns}`);
    lines.push('');

    lines.push('### Top Patterns');
    lines.push('');

    fps.slice(0, 10).forEach((pattern, i) => {
      lines.push(`#### ${i + 1}. ${pattern.rule} [${pattern.priority}]`);
      lines.push('');
      lines.push(`- **Frequency**: ${pattern.frequency} occurrences`);
      lines.push(`- **Sites Affected**: ${pattern.sitesAffected}`);
      lines.push(`- **Avg Confidence**: ${pattern.avgConfidence}`);
      lines.push(`- **Impact Score**: ${pattern.impactScore}`);
      lines.push('');
      lines.push(`**Recommendation**: ${pattern.recommendation}`);
      lines.push('');

      if (pattern.commonSelectors?.length > 0) {
        lines.push(`**Common Patterns**:`);
        pattern.commonSelectors.forEach(selector => {
          lines.push(`- ${selector.pattern} (${selector.count} times)`);
        });
        lines.push('');
      }
    });
  } else {
    lines.push('*No significant false positive patterns identified.*');
    lines.push('');
  }

  lines.push('---');
  lines.push('');

  // Confidence Accuracy
  lines.push('## Confidence Accuracy');
  lines.push('');

  if (patterns?.confidenceAccuracy?.assessments?.length > 0) {
    lines.push('| Confidence | Expected | Actual | Assessment | Sample Size |');
    lines.push('|------------|----------|--------|------------|-------------|');

    patterns.confidenceAccuracy.assessments.forEach(assessment => {
      const icon = assessment.assessment === 'ACCURATE' ? '✅' :
                   assessment.assessment === 'TOO_CONSERVATIVE' ? '🟢' :
                   assessment.assessment === 'TOO_OPTIMISTIC' ? '🔴' : '⚠️';

      lines.push(`| ${assessment.confidence} | ${(assessment.expectedPrecision * 100).toFixed(0)}% | ${(assessment.actualPrecision * 100).toFixed(0)}% | ${icon} ${assessment.assessment} | ${assessment.sampleSize} |`);
    });

    lines.push('');

    const adjustments = patterns.confidenceAccuracy.assessments
      .filter(a => a.assessment !== 'ACCURATE');

    if (adjustments.length > 0) {
      lines.push('### Adjustment Recommendations');
      lines.push('');

      adjustments.forEach(assessment => {
        lines.push(`- **${assessment.confidence}**: ${assessment.recommendation}`);
      });

      lines.push('');
    } else {
      lines.push('*All confidence levels are well-calibrated.*');
      lines.push('');
    }
  }

  lines.push('---');
  lines.push('');

  // Tool Comparison
  lines.push('## Tool Comparison');
  lines.push('');

  if (comparison) {
    lines.push('### AccessInsight vs axe-core');
    lines.push('');

    lines.push('| Metric | AccessInsight | axe-core |');
    lines.push('|--------|---------------|----------|');
    lines.push(`| Total Findings | ${comparison.summary.accessInsight.totalFindings} | ${comparison.summary.axeCore.totalIssues} |`);
    lines.push(`| Avg per Site | ${comparison.summary.accessInsight.avgPerSite} | ${comparison.summary.axeCore.avgPerSite} |`);
    lines.push(`| Avg Scan Time | ${comparison.summary.avgScanTime}ms | N/A |`);
    lines.push('');

    if (comparison.insights?.length > 0) {
      lines.push('### Key Insights');
      lines.push('');

      comparison.insights.forEach(insight => {
        const icon = insight.level === 'positive' ? '✅' :
                     insight.level === 'attention' ? '⚠️' : 'ℹ️';

        lines.push(`${icon} **${insight.title}**: ${insight.description}`);
        lines.push('');
      });
    }

    if (comparison.coverageGaps) {
      lines.push('### Coverage Gaps');
      lines.push('');

      if (comparison.coverageGaps.missedRules?.length > 0) {
        lines.push('**What axe finds but AccessInsight misses**:');
        lines.push('');

        const missedRules = comparison.coverageGaps.missedRules;
        missedRules.slice(0, 5).forEach(gap => {
          lines.push(`- ${gap.rule} (${gap.sitesAffected} sites)`);
        });
        if (missedRules.length > 5) {
          lines.push(`- *...and ${missedRules.length - 5} more*`);
        }
        lines.push('');
      }

      if (comparison.coverageGaps.uniqueRules?.length > 0) {
        lines.push('**Unique to AccessInsight**:');
        lines.push('');

        const uniqueRules = comparison.coverageGaps.uniqueRules;
        uniqueRules.slice(0, 5).forEach(unique => {
          lines.push(`- ${unique.rule} (${unique.sitesAffected} sites)`);
        });
        if (uniqueRules.length > 5) {
          lines.push(`- *...and ${uniqueRules.length - 5} more*`);
        }
        lines.push('');
      }
    }
  }

  lines.push('---');
  lines.push('');

  // Recommendations
  lines.push('## Recommendations');
  lines.push('');

  if (patterns?.recommendations?.length > 0) {
    lines.push('### Prioritized Action Items');
    lines.push('');

    const byPriority = {
      'P0': patterns.recommendations.filter(r => r.priority === 'P0'),
      'P1': patterns.recommendations.filter(r => r.priority === 'P1'),
      'P2': patterns.recommendations.filter(r => r.priority === 'P2'),
      'P3': patterns.recommendations.filter(r => r.priority === 'P3')
    };

    for (const [priority, recs] of Object.entries(byPriority)) {
      if (recs.length > 0) {
        lines.push(`#### ${priority} Priority (${recs.length} items)`);
        lines.push('');

        recs.forEach((rec, i) => {
          lines.push(`**${i + 1}. ${rec.type}${rec.rule ? `: ${rec.rule}` : ''}**`);
          lines.push('');
          lines.push(`- **Issue**: ${rec.issue}`);
          lines.push(`- **Recommendation**: ${rec.recommendation}`);
          lines.push(`- **Expected Impact**: ${rec.expectedImpact}`);

          if (rec.implementation) {
            lines.push(`- **Implementation**: ${rec.implementation.difficulty}, ~${rec.implementation.estimatedTime}`);
          }

          lines.push('');
        });
      }
    }
  }

  lines.push('---');
  lines.push('');

  // Detailed Findings
  lines.push('## Detailed Findings');
  lines.push('');

  if (metrics?.byRule) {
    lines.push('### Top 20 Rules by Frequency');
    lines.push('');
    lines.push('| Rank | Rule | Findings | Sites | Avg Confidence | WCAG |');
    lines.push('|------|------|----------|-------|----------------|------|');

    Object.entries(metrics.byRule)
      .slice(0, 20)
      .forEach(([rule, data], i) => {
        const wcag = data.wcagCriteria?.slice(0, 3).join(', ') || 'N/A';
        lines.push(`| ${i + 1} | ${rule} | ${data.totalFindings} | ${data.sitesAffected} | ${data.avgConfidence} | ${wcag} |`);
      });

    lines.push('');
  }

  lines.push('---');
  lines.push('');

  // Footer
  lines.push('## Analysis Metadata');
  lines.push('');

  if (patterns?.metadata) {
    lines.push(`- **Validated Findings**: ${patterns.metadata.validatedFindings} / ${patterns.metadata.totalFindings} (${(patterns.metadata.validationCoverage * 100).toFixed(1)}%)`);
    lines.push(`- **Batch File**: ${patterns.metadata.batchFile}`);
    lines.push(`- **Validation File**: ${patterns.metadata.validationFile}`);
  }

  if (comparison?.metadata) {
    lines.push(`- **Comparison File**: ${comparison.metadata.comparisonFile}`);
    lines.push(`- **Sites Compared**: ${comparison.metadata.sitesCompared}`);
  }

  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('*Report generated by AccessInsight Analysis Pipeline*');

  return lines.join('\n');
}

/**
 * Main function
 */
async function generateReport(options = {}) {
  const {
    format = 'markdown',
    outputDir = path.join(__dirname, 'results'),
    metricsFile = 'metrics-latest.json',
    patternsFile = 'pattern-analysis-latest.json',
    comparisonFile = 'comparison-analysis-latest.json'
  } = options;

  console.log('\n' + '='.repeat(70));
  console.log('📄 Report Generator');
  console.log('='.repeat(70));

  // Load analysis results
  console.log('\n📥 Loading analysis results...');

  let metrics = null;
  let patterns = null;
  let comparison = null;

  try {
    const metricsPath = path.join(outputDir, metricsFile);
    metrics = JSON.parse(await fs.readFile(metricsPath, 'utf8'));
    console.log(`   ✅ Loaded metrics`);
  } catch (error) {
    console.log(`   ⚠️  Could not load metrics: ${error.message}`);
  }

  try {
    const patternsPath = path.join(outputDir, patternsFile);
    patterns = JSON.parse(await fs.readFile(patternsPath, 'utf8'));
    console.log(`   ✅ Loaded pattern analysis`);
  } catch (error) {
    console.log(`   ⚠️  Could not load patterns: ${error.message}`);
  }

  try {
    const comparisonPath = path.join(outputDir, comparisonFile);
    comparison = JSON.parse(await fs.readFile(comparisonPath, 'utf8'));
    console.log(`   ✅ Loaded comparison analysis`);
  } catch (error) {
    console.log(`   ⚠️  Could not load comparison: ${error.message}`);
  }

  if (!metrics && !patterns && !comparison) {
    console.log('\n❌ No analysis results found. Run analysis scripts first.');
    process.exit(1);
  }

  // Generate reports
  console.log(`\n📝 Generating ${format} report...`);

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);

  if (format === 'markdown' || format === 'all') {
    const markdown = await generateMarkdownReport(metrics, patterns, comparison);
    const mdPath = path.join(outputDir, `integration-report-${timestamp}.md`);
    const mdLatest = path.join(outputDir, 'integration-report-latest.md');

    await fs.writeFile(mdPath, markdown);
    await fs.writeFile(mdLatest, markdown);

    console.log(`   ✅ Markdown report generated`);
    console.log(`      ${mdPath}`);
    console.log(`      ${mdLatest}`);
  }

  if (format === 'json' || format === 'all') {
    const combined = { metrics, patterns, comparison };
    const jsonPath = path.join(outputDir, `integration-report-${timestamp}.json`);
    const jsonLatest = path.join(outputDir, 'integration-report-latest.json');

    await fs.writeFile(jsonPath, JSON.stringify(combined, null, 2));
    await fs.writeFile(jsonLatest, JSON.stringify(combined, null, 2));

    console.log(`   ✅ JSON report generated`);
    console.log(`      ${jsonPath}`);
    console.log(`      ${jsonLatest}`);
  }

  console.log('\n' + '='.repeat(70));
  console.log('✨ Report Generation Complete!');
  console.log('='.repeat(70) + '\n');
}

// CLI
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--format' && args[i + 1]) {
      options.format = args[i + 1];
      i++;
    } else if (arg === '--metrics' && args[i + 1]) {
      options.metricsFile = args[i + 1];
      i++;
    } else if (arg === '--patterns' && args[i + 1]) {
      options.patternsFile = args[i + 1];
      i++;
    } else if (arg === '--comparison' && args[i + 1]) {
      options.comparisonFile = args[i + 1];
      i++;
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
Usage: node generate-report.js [options]

Options:
  --format FORMAT      Report format: markdown, json, all (default: markdown)
  --metrics FILE       Metrics file (default: metrics-latest.json)
  --patterns FILE      Pattern analysis file (default: pattern-analysis-latest.json)
  --comparison FILE    Comparison file (default: comparison-analysis-latest.json)
  --help, -h           Show this help message

Examples:
  node generate-report.js
  node generate-report.js --format markdown
  node generate-report.js --format all
      `);
      process.exit(0);
    }
  }

  return options;
}

if (require.main === module) {
  const options = parseArgs();

  generateReport(options)
    .then(() => {
      console.log('✅ Report generation completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Report generation failed:', error);
      console.error(error.stack);
      process.exit(1);
    });
}

module.exports = { generateReport };
