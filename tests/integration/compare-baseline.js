#!/usr/bin/env node

/**
 * Baseline Comparison Analyzer
 * Compares AccessInsight findings with axe-core to identify coverage gaps and overlaps
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * Analyze tool overlap and unique findings
 */
function analyzeToolOverlap(comparisons) {
  let totalAxeIssues = 0;
  let totalAccessInsightFindings = 0;
  let sitesCompared = comparisons.length;

  const ruleFrequency = {
    axe: {},
    accessInsight: {},
    both: {}
  };

  comparisons.forEach(comp => {
    totalAxeIssues += comp.axe?.totalIssues || 0;
    totalAccessInsightFindings += comp.accessInsight?.totalFindings || 0;

    // Count axe rules
    if (comp.axe?.violations) {
      comp.axe.violations.forEach(violation => {
        ruleFrequency.axe[violation.id] = (ruleFrequency.axe[violation.id] || 0) + 1;
      });
    }

    // Count AccessInsight rules
    if (comp.accessInsight?.byRule) {
      Object.keys(comp.accessInsight.byRule).forEach(rule => {
        ruleFrequency.accessInsight[rule] = (ruleFrequency.accessInsight[rule] || 0) + 1;
      });
    }
  });

  return {
    sitesCompared,
    totalAxeIssues,
    totalAccessInsightFindings,
    avgAxePerSite: Math.round(totalAxeIssues / sitesCompared),
    avgAccessInsightPerSite: Math.round(totalAccessInsightFindings / sitesCompared),
    ratio: (totalAccessInsightFindings / totalAxeIssues).toFixed(2),
    ruleFrequency
  };
}

/**
 * Identify coverage gaps
 */
function identifyCoverageGaps(comparisons) {
  const gaps = {
    accessInsightMisses: [],  // What axe finds but we don't
    accessInsightUnique: [],   // What we find but axe doesn't
    commonRules: []            // What both find
  };

  // Common accessibility issues both tools should find
  const commonIssueMap = {
    'img-alt': ['image-alt', 'image-redundant-alt'],
    'button-name': ['button-name'],
    'label-control': ['label', 'label-title-only'],
    'text-contrast': ['color-contrast'],
    'html-has-lang': ['html-has-lang', 'html-lang-valid'],
    'link-name': ['link-name']
  };

  // Analyze each comparison
  comparisons.forEach(comp => {
    const axeRules = new Set(
      (comp.axe?.violations || []).map(v => v.id)
    );

    const aiRules = new Set(
      Object.keys(comp.accessInsight?.byRule || {})
    );

    // Check for gaps
    axeRules.forEach(axeRule => {
      const mapped = Object.entries(commonIssueMap).find(([aiRule, axeMappings]) =>
        axeMappings.includes(axeRule)
      );

      if (mapped && !aiRules.has(mapped[0])) {
        gaps.accessInsightMisses.push({
          site: comp.siteName,
          axeRule: axeRule,
          mappedToAIRule: mapped[0],
          axeCount: comp.axe.violations.find(v => v.id === axeRule)?.nodes || 0
        });
      }
    });

    // Find unique AccessInsight findings
    aiRules.forEach(aiRule => {
      const hasMappedAxeRule = commonIssueMap[aiRule]?.some(axeRule =>
        axeRules.has(axeRule)
      );

      if (!hasMappedAxeRule) {
        gaps.accessInsightUnique.push({
          site: comp.siteName,
          rule: aiRule,
          count: comp.accessInsight.byRule[aiRule]
        });
      }
    });
  });

  // Summarize gaps
  const missedRuleCounts = {};
  gaps.accessInsightMisses.forEach(miss => {
    missedRuleCounts[miss.mappedToAIRule] = (missedRuleCounts[miss.mappedToAIRule] || 0) + 1;
  });

  const uniqueRuleCounts = {};
  gaps.accessInsightUnique.forEach(unique => {
    uniqueRuleCounts[unique.rule] = (uniqueRuleCounts[unique.rule] || 0) + 1;
  });

  return {
    missedRules: Object.entries(missedRuleCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([rule, count]) => ({ rule, sitesAffected: count })),

    uniqueRules: Object.entries(uniqueRuleCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([rule, count]) => ({ rule, sitesAffected: count })),

    totalMisses: gaps.accessInsightMisses.length,
    totalUnique: gaps.accessInsightUnique.length
  };
}

/**
 * Compare performance metrics
 */
function comparePerformance(comparisons) {
  const scanTimes = [];
  const ratios = [];

  comparisons.forEach(comp => {
    if (comp.accessInsight?.scanTime) {
      scanTimes.push(comp.accessInsight.scanTime);
    }

    if (comp.analysis?.axeToAccessInsightRatio) {
      ratios.push(comp.analysis.axeToAccessInsightRatio);
    }
  });

  const avgScanTime = scanTimes.length > 0
    ? Math.round(scanTimes.reduce((a, b) => a + b, 0) / scanTimes.length)
    : 0;

  const avgRatio = ratios.length > 0
    ? (ratios.reduce((a, b) => a + b, 0) / ratios.length).toFixed(2)
    : 0;

  return {
    avgScanTime,
    scanTimeRange: scanTimes.length > 0 ? {
      min: Math.min(...scanTimes),
      max: Math.max(...scanTimes)
    } : null,
    avgFindingRatio: parseFloat(avgRatio),
    interpretation: avgRatio > 1
      ? 'AccessInsight finds more issues than axe on average'
      : 'axe finds more issues than AccessInsight on average'
  };
}

/**
 * Generate comparison insights
 */
function generateInsights(overlap, gaps, performance) {
  const insights = [];

  // Insight 1: Overall coverage
  const coverageRatio = overlap.ratio;
  if (coverageRatio > 1.2) {
    insights.push({
      type: 'coverage',
      level: 'positive',
      title: 'AccessInsight finds more issues',
      description: `AccessInsight finds ${coverageRatio}x more issues than axe-core on average. This suggests broader rule coverage or more sensitive detection.`
    });
  } else if (coverageRatio < 0.8) {
    insights.push({
      type: 'coverage',
      level: 'attention',
      title: 'axe finds more issues',
      description: `axe-core finds more issues (ratio: ${coverageRatio}). Review coverage gaps and consider implementing additional rules.`
    });
  } else {
    insights.push({
      type: 'coverage',
      level: 'neutral',
      title: 'Similar coverage',
      description: `AccessInsight and axe-core find similar numbers of issues (ratio: ${coverageRatio}). Both tools complement each other.`
    });
  }

  // Insight 2: Performance
  if (performance.avgScanTime < 500) {
    insights.push({
      type: 'performance',
      level: 'positive',
      title: 'Fast scanning',
      description: `Average scan time of ${performance.avgScanTime}ms is excellent. Well within target of <500ms per page.`
    });
  } else if (performance.avgScanTime < 1000) {
    insights.push({
      type: 'performance',
      level: 'neutral',
      title: 'Acceptable performance',
      description: `Average scan time of ${performance.avgScanTime}ms is acceptable but could be optimized.`
    });
  } else {
    insights.push({
      type: 'performance',
      level: 'attention',
      title: 'Slow scanning',
      description: `Average scan time of ${performance.avgScanTime}ms exceeds target. Performance optimization needed.`
    });
  }

  // Insight 3: Coverage gaps
  if (gaps.missedRules.length > 0) {
    const topMissed = gaps.missedRules.slice(0, 3).map(r => r.rule).join(', ');
    insights.push({
      type: 'gaps',
      level: 'attention',
      title: 'Coverage gaps identified',
      description: `AccessInsight misses some issues that axe-core finds. Top gaps: ${topMissed}. Consider enhancing these rules.`
    });
  }

  // Insight 4: Unique value
  if (gaps.uniqueRules.length > 0) {
    const topUnique = gaps.uniqueRules.slice(0, 3).map(r => r.rule).join(', ');
    insights.push({
      type: 'value',
      level: 'positive',
      title: 'Unique coverage',
      description: `AccessInsight detects issues axe-core doesn't. Unique rules: ${topUnique}. Provides complementary value.`
    });
  }

  return insights;
}

/**
 * Main function
 */
async function compareBaseline(options = {}) {
  const {
    comparisonFile = 'mock-baseline-comparison.json',
    outputDir = path.join(__dirname, 'results')
  } = options;

  console.log('\n' + '='.repeat(70));
  console.log('🔬 Baseline Comparison Analyzer');
  console.log('='.repeat(70));

  // Load comparison data
  console.log('\n📥 Loading baseline comparison...');
  const comparisonPath = path.join(outputDir, comparisonFile);
  const data = JSON.parse(await fs.readFile(comparisonPath, 'utf8'));

  const comparisons = data.comparisons || [];
  console.log(`   ✅ Loaded ${comparisons.length} site comparisons`);

  if (comparisons.length === 0) {
    console.log('\n⚠️  No comparison data found');
    process.exit(0);
  }

  // Run analyses
  console.log('\n🔬 Analyzing comparisons...');

  console.log('   1. Tool overlap analysis...');
  const overlap = analyzeToolOverlap(comparisons);
  console.log(`      ✅ AccessInsight: ${overlap.totalAccessInsightFindings} findings, axe: ${overlap.totalAxeIssues} issues`);

  console.log('   2. Coverage gap analysis...');
  const gaps = identifyCoverageGaps(comparisons);
  console.log(`      ✅ Missed rules: ${gaps.missedRules.length}, Unique rules: ${gaps.uniqueRules.length}`);

  console.log('   3. Performance comparison...');
  const performance = comparePerformance(comparisons);
  console.log(`      ✅ Avg scan time: ${performance.avgScanTime}ms`);

  console.log('   4. Generating insights...');
  const insights = generateInsights(overlap, gaps, performance);
  console.log(`      ✅ Generated ${insights.length} insights`);

  // Compile report
  const comparisonReport = {
    metadata: {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      comparisonFile,
      sitesCompared: comparisons.length
    },

    summary: {
      accessInsight: {
        totalFindings: overlap.totalAccessInsightFindings,
        avgPerSite: overlap.avgAccessInsightPerSite
      },
      axeCore: {
        totalIssues: overlap.totalAxeIssues,
        avgPerSite: overlap.avgAxePerSite
      },
      ratio: parseFloat(overlap.ratio),
      avgScanTime: performance.avgScanTime
    },

    toolOverlap: overlap,
    coverageGaps: gaps,
    performance: performance,
    insights: insights,

    recommendations: [
      ...gaps.missedRules.map(gap => ({
        type: 'coverage_gap',
        priority: gap.sitesAffected >= 3 ? 'P1' : 'P2',
        rule: gap.rule,
        issue: `axe-core detects this issue on ${gap.sitesAffected} sites, but AccessInsight doesn't`,
        recommendation: `Review and enhance ${gap.rule} detection to match or exceed axe-core coverage`
      })),
      ...(performance.avgScanTime > 500 ? [{
        type: 'performance',
        priority: 'P1',
        issue: `Average scan time (${performance.avgScanTime}ms) exceeds target of 500ms`,
        recommendation: 'Optimize DOM traversal and rule execution for faster scanning'
      }] : [])
    ]
  };

  // Save report
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const reportPath = path.join(outputDir, `comparison-analysis-${timestamp}.json`);
  const latestPath = path.join(outputDir, 'comparison-analysis-latest.json');

  await fs.writeFile(reportPath, JSON.stringify(comparisonReport, null, 2));
  await fs.writeFile(latestPath, JSON.stringify(comparisonReport, null, 2));

  // Print summary
  console.log('\n' + '='.repeat(70));
  console.log('✨ Baseline Comparison Complete!');
  console.log('='.repeat(70));

  console.log('\n📊 Summary:');
  console.log(`   AccessInsight: ${overlap.totalAccessInsightFindings} findings (${overlap.avgAccessInsightPerSite} avg/site)`);
  console.log(`   axe-core: ${overlap.totalAxeIssues} issues (${overlap.avgAxePerSite} avg/site)`);
  console.log(`   Ratio: ${overlap.ratio}x`);

  console.log('\n⚡ Performance:');
  console.log(`   Avg scan time: ${performance.avgScanTime}ms`);
  console.log(`   ${performance.interpretation}`);

  console.log('\n🔍 Coverage Gaps:');
  if (gaps.missedRules.length > 0) {
    gaps.missedRules.slice(0, 5).forEach((gap, i) => {
      console.log(`   ${i + 1}. ${gap.rule}: missed on ${gap.sitesAffected} sites`);
    });
  } else {
    console.log('   No significant gaps identified');
  }

  console.log('\n💡 Insights:');
  insights.forEach((insight, i) => {
    const icon = insight.level === 'positive' ? '✅' : insight.level === 'attention' ? '⚠️' : 'ℹ️';
    console.log(`   ${icon} ${insight.title}`);
    console.log(`      ${insight.description.slice(0, 80)}...`);
  });

  console.log('\n💾 Report saved to:');
  console.log(`   ${reportPath}`);
  console.log(`   ${latestPath}\n`);

  return comparisonReport;
}

// CLI
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--comparison' && args[i + 1]) {
      options.comparisonFile = args[i + 1];
      i++;
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
Usage: node compare-baseline.js [options]

Options:
  --comparison FILE    Baseline comparison file (default: mock-baseline-comparison.json)
  --help, -h           Show this help message

Examples:
  node compare-baseline.js
  node compare-baseline.js --comparison baseline-comparison-latest.json
      `);
      process.exit(0);
    }
  }

  return options;
}

if (require.main === module) {
  const options = parseArgs();

  compareBaseline(options)
    .then(() => {
      console.log('✅ Baseline comparison completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Baseline comparison failed:', error);
      console.error(error.stack);
      process.exit(1);
    });
}

module.exports = { compareBaseline };
