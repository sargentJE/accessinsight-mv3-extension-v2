#!/usr/bin/env node

/**
 * Baseline Comparison Script
 * Compares AccessInsight results with axe-core to establish accuracy baseline
 */

const PlaywrightHelper = require('./helpers/playwright-helper');
const testSites = require('./test-sites.json');
const fs = require('fs').promises;
const path = require('path');
const { safeAverage } = require('./helpers/safe-math');

async function baselineComparison(options = {}) {
  const {
    count = 10,  // Number of sites to compare
    category = null,  // Specific category or null for mixed
    verbose = true
  } = options;

  const helper = new PlaywrightHelper({ verbose });
  const comparisons = [];

  try {
    await helper.init();

    // Select sites for comparison
    let sitesToCompare = [];

    if (category) {
      const cat = testSites.categories.find(c => c.name === category);
      if (cat) {
        sitesToCompare = cat.sites.slice(0, count).map(site => ({
          ...site,
          category: cat.name,
          expectedQuality: cat.expectedQuality
        }));
      }
    } else {
      // Mix of sites from different categories
      sitesToCompare = testSites.categories
        .flatMap(cat => cat.sites.map(site => ({
          ...site,
          category: cat.name,
          expectedQuality: cat.expectedQuality
        })))
        .slice(0, count);
    }

    console.log(`\n${'='.repeat(70)}`);
    console.log(`🔬 Baseline Comparison: AccessInsight vs axe-core`);
    console.log(`${'='.repeat(70)}`);
    console.log(`\nSites to compare: ${sitesToCompare.length}`);
    console.log(`Timestamp: ${new Date().toISOString()}\n`);

    let completedCount = 0;

    for (const site of sitesToCompare) {
      completedCount++;

      console.log(`\n${'-'.repeat(70)}`);
      console.log(`[${completedCount}/${sitesToCompare.length}] ${site.name}`);
      console.log(`Category: ${site.category} | URL: ${site.url}`);
      console.log(`${'-'.repeat(70)}`);

      try {
        // Create a single page for both tools
        const page = await helper.context.newPage();

        await page.goto(site.url, {
          waitUntil: 'networkidle',
          timeout: 30000
        });

        await page.waitForTimeout(2000);

        // Run axe-core first
        console.log('\n  📊 Running axe-core...');
        await page.addScriptTag({
          url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.8.2/axe.min.js'
        });

        const axeResults = await page.evaluate(() => {
          return axe.run();
        });

        const axeTotalIssues = axeResults.violations.reduce((sum, v) => sum + v.nodes.length, 0);
        console.log(`  ✅ axe-core: ${axeResults.violations.length} violation types, ${axeTotalIssues} total issues`);

        // Run AccessInsight
        console.log('\n  🔍 Running AccessInsight...');
        const enginePath = path.join(__dirname, '../../engine.js');
        const engineCode = await fs.readFile(enginePath, 'utf8');
        await page.addScriptTag({ content: engineCode });

        const accessInsightResults = await page.evaluate(() => {
          const startTime = performance.now();
          const findings = window.__a11yEngine.run();
          const endTime = performance.now();

          return {
            findings: findings,
            scanTime: endTime - startTime
          };
        });

        console.log(`  ✅ AccessInsight: ${accessInsightResults.findings.length} findings in ${Math.round(accessInsightResults.scanTime)}ms`);

        await page.close();

        // Analyze results
        const comparison = {
          siteName: site.name,
          siteId: site.id,
          url: site.url,
          category: site.category,
          expectedQuality: site.expectedQuality,
          timestamp: new Date().toISOString(),

          axe: {
            violationTypes: axeResults.violations.length,
            totalIssues: axeTotalIssues,
            passes: axeResults.passes.length,
            incomplete: axeResults.incomplete.length,
            inapplicable: axeResults.inapplicable.length,
            violations: axeResults.violations.map(v => ({
              id: v.id,
              impact: v.impact,
              tags: v.tags,
              nodes: v.nodes.length,
              description: v.description
            }))
          },

          accessInsight: {
            totalFindings: accessInsightResults.findings.length,
            scanTime: accessInsightResults.scanTime,
            byRule: groupByRule(accessInsightResults.findings),
            byConfidence: groupByConfidence(accessInsightResults.findings),
            byCriteria: groupByCriteria(accessInsightResults.findings),
            findings: accessInsightResults.findings.map(f => ({
              rule: f.rule,
              confidence: f.confidence,
              wcag: f.wcag,
              selector: f.selector
            }))
          },

          analysis: {
            axeToAccessInsightRatio: accessInsightResults.findings.length / (axeTotalIssues || 1),
            bothFound: 0, // Will be calculated if we match up specific issues
            onlyAxe: 0,
            onlyAccessInsight: 0
          }
        };

        // Simple rule overlap analysis
        const axeRuleIds = axeResults.violations.map(v => v.id);
        const accessInsightRules = Object.keys(comparison.accessInsight.byRule);

        comparison.analysis.axeRules = axeRuleIds.length;
        comparison.analysis.accessInsightRules = accessInsightRules.length;

        console.log(`\n  📈 Comparison:`);
        console.log(`     axe-core: ${comparison.axe.totalIssues} issues across ${comparison.axe.violationTypes} rule types`);
        console.log(`     AccessInsight: ${comparison.accessInsight.totalFindings} findings across ${accessInsightRules.length} rules`);
        console.log(`     Ratio: ${comparison.analysis.axeToAccessInsightRatio.toFixed(2)}x`);

        comparisons.push(comparison);

        // Pause between sites
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.error(`  ❌ Error comparing ${site.name}:`, error.message);

        comparisons.push({
          siteName: site.name,
          siteId: site.id,
          url: site.url,
          category: site.category,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Save results
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const resultsDir = path.join(__dirname, 'results');
    await fs.mkdir(resultsDir, { recursive: true });

    const resultsPath = path.join(resultsDir, `baseline-comparison-${timestamp}.json`);
    const latestPath = path.join(resultsDir, 'baseline-comparison-latest.json');

    const output = {
      metadata: {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        totalSites: sitesToCompare.length,
        successfulComparisons: comparisons.filter(c => !c.error).length,
        failedComparisons: comparisons.filter(c => c.error).length
      },
      comparisons: comparisons,
      summary: calculateSummary(comparisons)
    };

    await fs.writeFile(resultsPath, JSON.stringify(output, null, 2));
    await fs.writeFile(latestPath, JSON.stringify(output, null, 2));

    // Print summary
    console.log(`\n${'='.repeat(70)}`);
    console.log(`✨ Baseline Comparison Complete!`);
    console.log(`${'='.repeat(70)}`);

    const summary = output.summary;
    console.log(`\n📊 Overall Summary:`);
    console.log(`   Sites Compared: ${output.metadata.totalSites}`);
    console.log(`   Successful: ${output.metadata.successfulComparisons}`);

    if (summary) {
      console.log(`\n   axe-core:`);
      console.log(`     Total Issues: ${summary.axe.totalIssues}`);
      console.log(`     Avg per Site: ${summary.axe.avgPerSite}`);

      console.log(`\n   AccessInsight:`);
      console.log(`     Total Findings: ${summary.accessInsight.totalFindings}`);
      console.log(`     Avg per Site: ${summary.accessInsight.avgPerSite}`);
      console.log(`     Avg Scan Time: ${summary.accessInsight.avgScanTime}ms`);

      console.log(`\n   Comparison:`);
      console.log(`     Avg Ratio (AI/axe): ${summary.avgRatio.toFixed(2)}x`);
      console.log(`     ${summary.avgRatio > 1 ? 'AccessInsight finds more' : 'axe-core finds more'}`);
    }

    console.log(`\n💾 Results saved to:`);
    console.log(`   ${resultsPath}`);
    console.log(`   ${latestPath}\n`);

  } finally {
    await helper.close();
  }

  return {
    success: true,
    comparisons: comparisons
  };
}

function groupByRule(findings) {
  return findings.reduce((acc, f) => {
    const rule = f.rule || 'unknown';
    acc[rule] = (acc[rule] || 0) + 1;
    return acc;
  }, {});
}

function groupByConfidence(findings) {
  return findings.reduce((acc, f) => {
    const conf = String(f.confidence || 'unknown');
    acc[conf] = (acc[conf] || 0) + 1;
    return acc;
  }, {});
}

function groupByCriteria(findings) {
  const criteria = {};
  for (const f of findings) {
    if (f.wcag && Array.isArray(f.wcag)) {
      for (const c of f.wcag) {
        criteria[c] = (criteria[c] || 0) + 1;
      }
    }
  }
  return criteria;
}

function calculateSummary(comparisons) {
  const successful = comparisons.filter(c => !c.error);

  if (successful.length === 0) {
    return null;
  }

  const axeTotalIssues = successful.reduce((sum, c) => sum + (c.axe?.totalIssues || 0), 0);
  const aiTotalFindings = successful.reduce((sum, c) => sum + (c.accessInsight?.totalFindings || 0), 0);
  const totalScanTime = successful.reduce((sum, c) => sum + (c.accessInsight?.scanTime || 0), 0);

  const avgRatio = safeAverage(successful.map(c => c.analysis?.axeToAccessInsightRatio || 0));

  return {
    axe: {
      totalIssues: axeTotalIssues,
      avgPerSite: Math.round(axeTotalIssues / successful.length)
    },
    accessInsight: {
      totalFindings: aiTotalFindings,
      avgPerSite: Math.round(aiTotalFindings / successful.length),
      avgScanTime: Math.round(totalScanTime / successful.length)
    },
    avgRatio: avgRatio
  };
}

// CLI
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--count' && args[i + 1]) {
      options.count = parseInt(args[i + 1], 10);
      i++;
    } else if (arg === '--category' && args[i + 1]) {
      options.category = args[i + 1];
      i++;
    } else if (arg === '--quiet') {
      options.verbose = false;
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
Usage: node baseline-comparison.js [options]

Options:
  --count N          Number of sites to compare (default: 10)
  --category NAME    Compare only sites in category
  --quiet            Reduce output verbosity
  --help, -h         Show this help message

Examples:
  node baseline-comparison.js                     # Compare first 10 sites
  node baseline-comparison.js --count 5           # Compare 5 sites
  node baseline-comparison.js --category news     # Compare news sites only
      `);
      process.exit(0);
    }
  }

  return options;
}

if (require.main === module) {
  const options = parseArgs();

  baselineComparison(options)
    .then(() => {
      console.log('✅ Baseline comparison completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Baseline comparison failed:', error);
      process.exit(1);
    });
}

module.exports = baselineComparison;
