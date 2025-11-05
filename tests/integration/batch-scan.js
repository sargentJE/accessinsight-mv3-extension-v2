#!/usr/bin/env node

/**
 * Batch Scan Script for AccessInsight Integration Testing
 * Scans all test websites and collects results for analysis
 */

const PlaywrightHelper = require('./helpers/playwright-helper');
const testSites = require('./test-sites.json');
const fs = require('fs').promises;
const path = require('path');

async function batchScan(options = {}) {
  const {
    subset = null,  // null = all sites, number = scan first N sites
    category = null, // null = all categories, string = specific category
    verbose = true
  } = options;

  const helper = new PlaywrightHelper({ verbose });
  const results = [];
  const errors = [];

  try {
    await helper.init();

    // Filter sites based on options
    let sitesToScan = [];

    if (category) {
      const cat = testSites.categories.find(c => c.name === category);
      if (cat) {
        sitesToScan = cat.sites.map(site => ({ ...site, category: cat.name, expectedQuality: cat.expectedQuality }));
      } else {
        console.error(`❌ Category "${category}" not found`);
        return;
      }
    } else {
      // Flatten all categories
      sitesToScan = testSites.categories.flatMap(cat =>
        cat.sites.map(site => ({ ...site, category: cat.name, expectedQuality: cat.expectedQuality }))
      );
    }

    if (subset && subset > 0) {
      sitesToScan = sitesToScan.slice(0, subset);
    }

    console.log(`\n${'='.repeat(70)}`);
    console.log(`🔍 AccessInsight Batch Scan`);
    console.log(`${'='.repeat(70)}`);
    console.log(`\nTotal sites to scan: ${sitesToScan.length}`);
    console.log(`Timestamp: ${new Date().toISOString()}\n`);

    let scannedCount = 0;
    let successCount = 0;
    let errorCount = 0;

    const startTime = Date.now();

    // Scan each site
    for (const site of sitesToScan) {
      scannedCount++;

      console.log(`\n${'-'.repeat(70)}`);
      console.log(`[${scannedCount}/${sitesToScan.length}] ${site.name}`);
      console.log(`Category: ${site.category} | Expected: ${site.expectedQuality}`);
      console.log(`URL: ${site.url}`);
      console.log(`${'-'.repeat(70)}`);

      const result = await helper.scanWebsite(site.url);

      if (result.success) {
        successCount++;

        // Add site metadata
        result.siteId = site.id;
        result.siteName = site.name;
        result.category = site.category;
        result.expectedQuality = site.expectedQuality;
        result.expectedIssues = site.expectedIssues;
        result.technology = site.technology;

        // Calculate statistics
        result.stats = calculateStats(result.findings);

        console.log(`\n✅ Scan Complete`);
        console.log(`   Findings: ${result.findings.length}`);
        console.log(`   Elements: ${result.elementCount}`);
        console.log(`   Scan Time: ${Math.round(result.scanTime)}ms`);
        console.log(`   By Confidence: 0.9=${result.stats.byConfidence['0.9'] || 0}, 0.8=${result.stats.byConfidence['0.8'] || 0}, 0.7=${result.stats.byConfidence['0.7'] || 0}`);

        results.push(result);
      } else {
        errorCount++;

        errors.push({
          siteId: site.id,
          siteName: site.name,
          url: site.url,
          error: result.error,
          timestamp: result.timestamp
        });

        console.log(`\n❌ Scan Failed: ${result.error}`);
      }

      // Brief pause between scans to be respectful
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const endTime = Date.now();
    const totalTime = Math.round((endTime - startTime) / 1000);

    // Save results
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const resultsDir = path.join(__dirname, 'results');
    await fs.mkdir(resultsDir, { recursive: true });

    const resultsPath = path.join(resultsDir, `batch-scan-${timestamp}.json`);
    const latestPath = path.join(resultsDir, 'batch-scan-latest.json');

    const output = {
      metadata: {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        totalSites: sitesToScan.length,
        successfulScans: successCount,
        failedScans: errorCount,
        totalTime: totalTime
      },
      results: results,
      errors: errors
    };

    await fs.writeFile(resultsPath, JSON.stringify(output, null, 2));
    await fs.writeFile(latestPath, JSON.stringify(output, null, 2));

    // Print summary
    console.log(`\n${'='.repeat(70)}`);
    console.log(`✨ Batch Scan Complete!`);
    console.log(`${'='.repeat(70)}`);
    console.log(`\n📊 Summary:`);
    console.log(`   Total Sites: ${sitesToScan.length}`);
    console.log(`   Successful: ${successCount} (${Math.round(successCount / sitesToScan.length * 100)}%)`);
    console.log(`   Failed: ${errorCount}`);
    console.log(`   Total Time: ${totalTime}s`);
    console.log(`   Avg Time/Site: ${Math.round(totalTime / sitesToScan.length)}s`);

    if (successCount > 0) {
      const totalFindings = results.reduce((sum, r) => sum + r.findings.length, 0);
      const avgFindings = Math.round(totalFindings / successCount);
      const avgScanTime = Math.round(results.reduce((sum, r) => sum + r.scanTime, 0) / successCount);

      console.log(`\n📈 Findings:`);
      console.log(`   Total: ${totalFindings}`);
      console.log(`   Average per Site: ${avgFindings}`);
      console.log(`   Avg Scan Time: ${avgScanTime}ms`);
    }

    console.log(`\n💾 Results saved to:`);
    console.log(`   ${resultsPath}`);
    console.log(`   ${latestPath}\n`);

    if (errors.length > 0) {
      console.log(`\n⚠️  Errors occurred on ${errors.length} sites:`);
      errors.forEach(e => {
        console.log(`   - ${e.siteName}: ${e.error}`);
      });
      console.log('');
    }

  } catch (error) {
    console.error('\n❌ Fatal error during batch scan:', error);
    throw error;
  } finally {
    await helper.close();
  }

  return {
    success: true,
    scannedCount: results.length,
    errorCount: errors.length,
    results: results
  };
}

/**
 * Calculate statistics for findings
 */
function calculateStats(findings) {
  const stats = {
    total: findings.length,
    byRule: {},
    byConfidence: {},
    byCriteria: {}
  };

  for (const finding of findings) {
    // By rule
    const rule = finding.rule || 'unknown';
    stats.byRule[rule] = (stats.byRule[rule] || 0) + 1;

    // By confidence
    const conf = String(finding.confidence || 'unknown');
    stats.byConfidence[conf] = (stats.byConfidence[conf] || 0) + 1;

    // By WCAG criteria
    if (finding.wcag && Array.isArray(finding.wcag)) {
      for (const criterion of finding.wcag) {
        stats.byCriteria[criterion] = (stats.byCriteria[criterion] || 0) + 1;
      }
    }
  }

  return stats;
}

// CLI argument parsing
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--subset' && args[i + 1]) {
      options.subset = parseInt(args[i + 1], 10);
      i++;
    } else if (arg === '--category' && args[i + 1]) {
      options.category = args[i + 1];
      i++;
    } else if (arg === '--quiet') {
      options.verbose = false;
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
Usage: node batch-scan.js [options]

Options:
  --subset N         Scan only first N sites
  --category NAME    Scan only sites in category (government, ecommerce, news, etc.)
  --quiet            Reduce output verbosity
  --help, -h         Show this help message

Examples:
  node batch-scan.js                    # Scan all 40 sites
  node batch-scan.js --subset 10        # Scan first 10 sites
  node batch-scan.js --category news    # Scan only news sites
  node batch-scan.js --subset 5 --quiet # Scan 5 sites quietly
      `);
      process.exit(0);
    }
  }

  return options;
}

// Run if called directly
if (require.main === module) {
  const options = parseArgs();

  batchScan(options)
    .then(() => {
      console.log('✅ Batch scan completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Batch scan failed:', error);
      process.exit(1);
    });
}

module.exports = batchScan;
