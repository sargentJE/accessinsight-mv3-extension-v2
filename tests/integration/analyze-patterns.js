#!/usr/bin/env node

/**
 * Pattern Analyzer for Integration Testing
 * Identifies false positive/negative patterns and generates tuning recommendations
 *
 * Design: See PATTERN_ANALYZER_DESIGN.md for detailed algorithms and approach
 */

const fs = require('fs').promises;
const path = require('path');
const {
  normalizeBatchResults,
  parseManualValidationCSV,
  mergeValidationData,
  calculateValidationStats
} = require('./helpers/data-validator');
const { safeDivide, safeAverage, roundTo, safePrecision } = require('./helpers/safe-math');

// Statistical thresholds
const MIN_SAMPLE_SIZE_OVERALL = 50;
const MIN_SAMPLE_SIZE_PER_RULE = 10;
const MIN_SAMPLE_SIZE_CONFIDENCE = 20;
const PATTERN_SIGNIFICANT_FREQUENCY = 5;
const PATTERN_SIGNIFICANT_SITES = 3;
const PATTERN_CRITICAL_FREQUENCY = 10;
const PATTERN_CRITICAL_SITES = 5;

/**
 * Analyze false positive patterns
 */
function analyzeFalsePositivePatterns(mergedData) {
  const patterns = {};
  const falsePositives = [];

  // Extract all false positives
  mergedData.results.forEach(result => {
    result.findings.forEach((finding, index) => {
      if (finding.validation &&
          finding.validation.classification &&
          finding.validation.classification.toLowerCase() === 'false_positive') {

        falsePositives.push({
          ...finding,
          siteName: result.siteName,
          siteCategory: result.category,
          siteQuality: result.expectedQuality,
          findingIndex: index
        });
      }
    });
  });

  if (falsePositives.length === 0) {
    return {
      patterns: [],
      totalFalsePositives: 0,
      warning: 'No false positives found in validation data'
    };
  }

  // Group by rule
  const byRule = {};
  falsePositives.forEach(fp => {
    const rule = fp.rule || 'unknown';

    if (!byRule[rule]) {
      byRule[rule] = {
        count: 0,
        sites: new Set(),
        confidences: [],
        selectors: [],
        categories: {}
      };
    }

    byRule[rule].count++;
    byRule[rule].sites.add(fp.siteName);
    byRule[rule].confidences.push(fp.confidence || 0);
    byRule[rule].selectors.push(fp.selector || '');

    const category = fp.siteCategory || 'unknown';
    byRule[rule].categories[category] = (byRule[rule].categories[category] || 0) + 1;
  });

  // Create pattern objects
  const patternList = [];

  for (const rule in byRule) {
    const data = byRule[rule];

    const avgConfidence = safeAverage(data.confidences);

    // Find common selector patterns
    const selectorPatterns = findCommonSelectorPatterns(data.selectors);

    // Determine if pattern is significant
    const isSignificant = data.count >= PATTERN_SIGNIFICANT_FREQUENCY ||
                          data.sites.size >= PATTERN_SIGNIFICANT_SITES;

    const isCritical = data.count >= PATTERN_CRITICAL_FREQUENCY ||
                       data.sites.size >= PATTERN_CRITICAL_SITES;

    if (isSignificant) {
      // Calculate impact score
      const impactScore = (data.count * 2) + (data.sites.size * 3) +
                         (isCritical ? 10 : 0);

      // Determine most common category
      const categoryEntries = Object.entries(data.categories);
      const mostCommonCategory = categoryEntries.length > 0
        ? categoryEntries.sort((a, b) => b[1] - a[1])[0][0]
        : 'unknown';

      patternList.push({
        type: 'false_positive',
        rule: rule,
        frequency: data.count,
        sitesAffected: data.sites.size,
        avgConfidence: Math.round(avgConfidence * 100) / 100,
        commonSelectors: selectorPatterns.slice(0, 3),
        mostCommonCategory: mostCommonCategory,
        categoryDistribution: data.categories,
        impactScore: impactScore,
        priority: getPriority(impactScore, data.sites.size, mergedData.results.length),
        isCritical: isCritical,
        recommendation: generateFPRecommendation(rule, data, selectorPatterns)
      });
    }
  }

  // Sort by impact score
  patternList.sort((a, b) => b.impactScore - a.impactScore);

  return {
    patterns: patternList,
    totalFalsePositives: falsePositives.length,
    patternsIdentified: patternList.length,
    criticalPatterns: patternList.filter(p => p.isCritical).length
  };
}

/**
 * Find common patterns in CSS selectors
 */
function findCommonSelectorPatterns(selectors) {
  const patterns = {};

  selectors.forEach(selector => {
    // Extract element types
    const elementMatch = selector.match(/^([a-z]+)/i);
    if (elementMatch) {
      const element = elementMatch[1];
      patterns[element] = (patterns[element] || 0) + 1;
    }

    // Extract parent contexts (nav, header, etc.)
    const contexts = ['nav', 'header', 'footer', 'aside', 'main'];
    contexts.forEach(ctx => {
      if (selector.toLowerCase().includes(ctx)) {
        patterns[`in-${ctx}`] = (patterns[`in-${ctx}`] || 0) + 1;
      }
    });

    // Extract role attributes
    if (selector.includes('[role=')) {
      const roleMatch = selector.match(/\[role="?([^"\]]+)"?\]/);
      if (roleMatch) {
        patterns[`role-${roleMatch[1]}`] = (patterns[`role-${roleMatch[1]}`] || 0) + 1;
      }
    }
  });

  // Sort by frequency
  return Object.entries(patterns)
    .sort((a, b) => b[1] - a[1])
    .map(([pattern, count]) => ({ pattern, count }));
}

/**
 * Generate false positive recommendation
 */
function generateFPRecommendation(rule, data, selectorPatterns) {
  const topPattern = selectorPatterns[0];

  let recommendation = `Rule "${rule}" has ${data.count} false positives across ${data.sites.size} sites. `;

  if (topPattern && topPattern.count >= data.count * 0.5) {
    recommendation += `Most common in: ${topPattern.pattern} (${topPattern.count} occurrences). `;
    recommendation += `Consider excluding ${topPattern.pattern} elements or adjusting detection logic.`;
  } else {
    recommendation += `Patterns are diverse. Review rule logic for over-flagging. `;
    recommendation += `Consider lowering confidence from ${data.confidences[0]?.toFixed(1) || 'N/A'} or adding exceptions.`;
  }

  return recommendation;
}

/**
 * Assess confidence accuracy
 */
function assessConfidenceAccuracy(mergedData) {
  const confidenceLevels = {};

  mergedData.results.forEach(result => {
    result.findings.forEach(finding => {
      if (finding.validation && finding.validation.classification) {
        const conf = String(finding.confidence || 'unknown');
        const classification = finding.validation.classification.toLowerCase();

        if (!confidenceLevels[conf]) {
          confidenceLevels[conf] = {
            truePositives: 0,
            falsePositives: 0,
            total: 0
          };
        }

        confidenceLevels[conf].total++;

        if (classification === 'true_positive') {
          confidenceLevels[conf].truePositives++;
        } else if (classification === 'false_positive') {
          confidenceLevels[conf].falsePositives++;
        }
      }
    });
  });

  const assessments = [];

  for (const conf in confidenceLevels) {
    const data = confidenceLevels[conf];

    if (data.total < MIN_SAMPLE_SIZE_CONFIDENCE && conf !== 'unknown') {
      continue; // Skip if sample size too small
    }

    const actualPrecision = data.total > 0
      ? data.truePositives / data.total
      : 0;

    const expectedConfidence = parseFloat(conf);

    if (isNaN(expectedConfidence)) {
      continue;
    }

    const difference = actualPrecision - expectedConfidence;
    let assessment, recommendation;

    if (Math.abs(difference) < 0.05) {
      assessment = 'ACCURATE';
      recommendation = `Confidence level ${conf} is accurate (actual precision: ${(actualPrecision * 100).toFixed(1)}%)`;
    } else if (difference > 0.1) {
      assessment = 'TOO_CONSERVATIVE';
      recommendation = `Confidence ${conf} is too conservative. Actual precision is ${(actualPrecision * 100).toFixed(1)}%, consider increasing to ${(actualPrecision).toFixed(2)}`;
    } else if (difference < -0.1) {
      assessment = 'TOO_OPTIMISTIC';
      recommendation = `Confidence ${conf} is too optimistic. Actual precision is ${(actualPrecision * 100).toFixed(1)}%, should decrease to ${(actualPrecision).toFixed(2)}`;
    } else {
      assessment = 'MINOR_ADJUSTMENT';
      recommendation = `Confidence ${conf} is close but could be adjusted to ${(actualPrecision).toFixed(2)} for better accuracy`;
    }

    assessments.push({
      confidence: parseFloat(conf),
      expectedPrecision: expectedConfidence,
      actualPrecision: Math.round(actualPrecision * 100) / 100,
      difference: Math.round(difference * 100) / 100,
      sampleSize: data.total,
      truePositives: data.truePositives,
      falsePositives: data.falsePositives,
      assessment,
      recommendation,
      sufficientSampleSize: data.total >= MIN_SAMPLE_SIZE_CONFIDENCE
    });
  }

  // Sort by confidence level
  assessments.sort((a, b) => b.confidence - a.confidence);

  return {
    assessments,
    totalAssessed: assessments.length,
    needsAdjustment: assessments.filter(a =>
      a.assessment === 'TOO_OPTIMISTIC' || a.assessment === 'TOO_CONSERVATIVE'
    ).length
  };
}

/**
 * Analyze rule performance
 */
function analyzeRulePerformance(mergedData) {
  const ruleStats = {};

  mergedData.results.forEach(result => {
    result.findings.forEach(finding => {
      const rule = finding.rule || 'unknown';

      if (!ruleStats[rule]) {
        ruleStats[rule] = {
          total: 0,
          validated: 0,
          truePositives: 0,
          falsePositives: 0,
          uncertain: 0
        };
      }

      ruleStats[rule].total++;

      if (finding.validation && finding.validation.classification) {
        ruleStats[rule].validated++;

        const classification = finding.validation.classification.toLowerCase();

        if (classification === 'true_positive') {
          ruleStats[rule].truePositives++;
        } else if (classification === 'false_positive') {
          ruleStats[rule].falsePositives++;
        } else if (classification === 'uncertain') {
          ruleStats[rule].uncertain++;
        }
      }
    });
  });

  const performances = [];

  for (const rule in ruleStats) {
    const stats = ruleStats[rule];

    if (stats.validated < MIN_SAMPLE_SIZE_PER_RULE) {
      continue; // Skip rules with insufficient validation
    }

    const precision = safePrecision(stats.truePositives, stats.falsePositives);

    const fpRate = safeDivide(stats.falsePositives, stats.validated);

    // Classify performance
    let performance, assessment;

    if (precision >= 0.90) {
      performance = 'EXCELLENT';
      assessment = 'Performing excellently with high precision';
    } else if (precision >= 0.75) {
      performance = 'GOOD';
      assessment = 'Performing well with acceptable precision';
    } else if (precision >= 0.60) {
      performance = 'FAIR';
      assessment = 'Performing adequately but needs improvement';
    } else {
      performance = 'POOR';
      assessment = 'Performing poorly, significant false positives';
    }

    performances.push({
      rule,
      performance,
      precision: Math.round(precision * 100) / 100,
      falsePositiveRate: Math.round(fpRate * 100) / 100,
      totalFindings: stats.total,
      validated: stats.validated,
      truePositives: stats.truePositives,
      falsePositives: stats.falsePositives,
      uncertain: stats.uncertain,
      validationCoverage: Math.round((stats.validated / stats.total) * 100) / 100,
      assessment,
      recommendation: generatePerformanceRecommendation(rule, precision, fpRate, stats)
    });
  }

  // Sort by precision (worst first for attention)
  performances.sort((a, b) => a.precision - b.precision);

  return {
    performances,
    totalRulesAnalyzed: performances.length,
    excellentRules: performances.filter(p => p.performance === 'EXCELLENT').length,
    goodRules: performances.filter(p => p.performance === 'GOOD').length,
    fairRules: performances.filter(p => p.performance === 'FAIR').length,
    poorRules: performances.filter(p => p.performance === 'POOR').length
  };
}

/**
 * Generate performance recommendation
 */
function generatePerformanceRecommendation(rule, precision, fpRate, stats) {
  if (precision >= 0.90) {
    return `Rule is performing excellently. Maintain current implementation.`;
  } else if (precision >= 0.75) {
    return `Rule is performing well. Minor tuning could improve to ${stats.falsePositives} fewer false positives.`;
  } else if (precision >= 0.60) {
    return `Rule needs improvement. ${stats.falsePositives} false positives out of ${stats.validated} validated findings (${(fpRate * 100).toFixed(0)}% FP rate). Review detection logic.`;
  } else {
    return `Rule has significant issues. ${stats.falsePositives} false positives (${(fpRate * 100).toFixed(0)}% FP rate). Consider lowering confidence or adding exception handling.`;
  }
}

/**
 * Analyze category correlation
 */
function analyzeCategoryCorrelation(mergedData) {
  const categoryStats = {};

  mergedData.results.forEach(result => {
    const category = result.category || 'unknown';

    if (!categoryStats[category]) {
      categoryStats[category] = {
        sites: 0,
        totalFindings: 0,
        validated: 0,
        truePositives: 0,
        falsePositives: 0,
        expectedQuality: result.expectedQuality
      };
    }

    categoryStats[category].sites++;
    categoryStats[category].totalFindings += result.findings.length;

    result.findings.forEach(finding => {
      if (finding.validation && finding.validation.classification) {
        categoryStats[category].validated++;

        const classification = finding.validation.classification.toLowerCase();

        if (classification === 'true_positive') {
          categoryStats[category].truePositives++;
        } else if (classification === 'false_positive') {
          categoryStats[category].falsePositives++;
        }
      }
    });
  });

  const correlations = [];

  for (const category in categoryStats) {
    const stats = categoryStats[category];

    const avgFindings = stats.sites > 0
      ? stats.totalFindings / stats.sites
      : 0;

    const fpRate = safeDivide(stats.falsePositives, stats.validated);

    const precision = safePrecision(stats.truePositives, stats.falsePositives);

    correlations.push({
      category,
      sites: stats.sites,
      avgFindingsPerSite: Math.round(avgFindings * 10) / 10,
      expectedQuality: stats.expectedQuality,
      validated: stats.validated,
      precision: Math.round(precision * 100) / 100,
      falsePositiveRate: Math.round(fpRate * 100) / 100,
      assessment: generateCategoryAssessment(category, stats.expectedQuality, fpRate, avgFindings)
    });
  }

  // Sort by FP rate (worst first)
  correlations.sort((a, b) => b.falsePositiveRate - a.falsePositiveRate);

  return {
    correlations,
    totalCategories: correlations.length
  };
}

/**
 * Generate category assessment
 */
function generateCategoryAssessment(category, expectedQuality, fpRate, avgFindings) {
  let assessment = `${category} sites: `;

  if (fpRate > 0.30) {
    assessment += `High false positive rate (${(fpRate * 100).toFixed(0)}%). `;
    assessment += `Engine may not be tuned for ${category} patterns. Consider category-specific adjustments.`;
  } else if (fpRate > 0.20) {
    assessment += `Moderate false positive rate (${(fpRate * 100).toFixed(0)}%). `;
    assessment += `Some rules may need ${category}-specific exception handling.`;
  } else {
    assessment += `Acceptable false positive rate (${(fpRate * 100).toFixed(0)}%). `;
    assessment += `Performing well on ${category} sites.`;
  }

  return assessment;
}

/**
 * Generate prioritized recommendations
 */
function generateRecommendations(fpPatterns, confidenceAssessments, rulePerformances) {
  const recommendations = [];

  // From false positive patterns
  fpPatterns.patterns.forEach(pattern => {
    recommendations.push({
      type: 'rule_logic_fix',
      priority: pattern.priority,
      rule: pattern.rule,
      issue: `${pattern.frequency} false positives across ${pattern.sitesAffected} sites`,
      evidence: {
        frequency: pattern.frequency,
        sitesAffected: pattern.sitesAffected,
        impactScore: pattern.impactScore
      },
      recommendation: pattern.recommendation,
      expectedImpact: `Reduce false positives by ~${Math.min(pattern.frequency, 100)} findings`,
      implementation: {
        difficulty: pattern.frequency > 20 ? 'medium' : 'easy',
        estimatedTime: pattern.frequency > 20 ? '1-2 hours' : '30-60 minutes'
      }
    });
  });

  // From confidence assessments
  confidenceAssessments.assessments.forEach(assessment => {
    if (assessment.assessment === 'TOO_OPTIMISTIC' || assessment.assessment === 'TOO_CONSERVATIVE') {
      recommendations.push({
        type: 'confidence_adjustment',
        priority: Math.abs(assessment.difference) > 0.15 ? 'P1' : 'P2',
        issue: `Confidence level ${assessment.confidence} ${assessment.assessment.toLowerCase()}`,
        evidence: {
          expectedPrecision: assessment.expectedPrecision,
          actualPrecision: assessment.actualPrecision,
          difference: assessment.difference,
          sampleSize: assessment.sampleSize
        },
        recommendation: assessment.recommendation,
        expectedImpact: `Improve confidence accuracy by ${Math.abs(assessment.difference * 100).toFixed(0)}%`,
        implementation: {
          difficulty: 'easy',
          estimatedTime: '15 minutes',
          codeLocation: 'engine.js (rule confidence property)'
        }
      });
    }
  });

  // From rule performance
  rulePerformances.performances.forEach(perf => {
    if (perf.performance === 'POOR' || perf.performance === 'FAIR') {
      const priority = perf.performance === 'POOR' ? 'P0' : 'P1';

      recommendations.push({
        type: 'rule_improvement',
        priority,
        rule: perf.rule,
        issue: `Low precision: ${(perf.precision * 100).toFixed(0)}% (${perf.falsePositives} FP out of ${perf.validated} validated)`,
        evidence: {
          precision: perf.precision,
          falsePositiveRate: perf.falsePositiveRate,
          validated: perf.validated
        },
        recommendation: perf.recommendation,
        expectedImpact: `Improve precision from ${(perf.precision * 100).toFixed(0)}% to 75%+`,
        implementation: {
          difficulty: perf.performance === 'POOR' ? 'hard' : 'medium',
          estimatedTime: perf.performance === 'POOR' ? '2-4 hours' : '1-2 hours'
        }
      });
    }
  });

  // Sort by priority
  const priorityOrder = { 'P0': 0, 'P1': 1, 'P2': 2, 'P3': 3 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return recommendations;
}

/**
 * Get priority level
 */
function getPriority(impactScore, sitesAffected, totalSites) {
  const sitePercentage = safeDivide(sitesAffected, totalSites);

  if (impactScore >= 50 || sitePercentage >= 0.5) return 'P0';
  if (impactScore >= 30 || sitePercentage >= 0.3) return 'P1';
  if (impactScore >= 15 || sitePercentage >= 0.2) return 'P2';
  return 'P3';
}

/**
 * Main function
 */
async function analyzePatterns(options = {}) {
  const {
    batchFile = 'mock-batch-scan.json',
    validationFile = null,
    comparisonFile = null,
    outputDir = path.join(__dirname, 'results')
  } = options;

  console.log('\n' + '='.repeat(70));
  console.log('🔍 Pattern Analyzer');
  console.log('='.repeat(70));

  // Load batch scan results
  console.log('\n📥 Loading data...');
  const batchPath = path.join(outputDir, batchFile);
  const batchData = JSON.parse(await fs.readFile(batchPath, 'utf8'));

  const normalized = normalizeBatchResults(batchData);
  console.log(`   ✅ Loaded ${normalized.results.length} sites`);

  // Load and merge validation data
  if (!validationFile) {
    console.log('\n⚠️  No validation file provided. Analysis will be limited.');
    console.log('   Provide --validation FILE for full pattern analysis.');
    process.exit(0);
  }

  console.log('\n📝 Loading manual validation...');
  const validationPath = path.join(outputDir, validationFile);
  const validationCSV = await fs.readFile(validationPath, 'utf8');
  const validationData = parseManualValidationCSV(validationCSV);

  const merged = mergeValidationData(normalized, validationData);
  const validationStats = calculateValidationStats(merged);

  console.log(`   ✅ Loaded ${validationData.length} validation entries`);
  console.log(`   Validated: ${validationStats.validatedFindings} / ${validationStats.totalFindings} findings`);
  console.log(`   Progress: ${(validationStats.validationProgress * 100).toFixed(1)}%`);

  if (validationStats.validatedFindings < MIN_SAMPLE_SIZE_OVERALL) {
    console.log(`\n⚠️  Warning: Only ${validationStats.validatedFindings} findings validated`);
    console.log(`   Minimum recommended: ${MIN_SAMPLE_SIZE_OVERALL} for statistical significance`);
    console.log(`   Proceeding with analysis, but results may not be statistically significant.`);
  }

  // Run analyses
  console.log('\n🔬 Analyzing patterns...');

  console.log('   1. False positive patterns...');
  const fpPatterns = analyzeFalsePositivePatterns(merged);
  console.log(`      ✅ Found ${fpPatterns.patternsIdentified} significant patterns (${fpPatterns.criticalPatterns} critical)`);

  console.log('   2. Confidence accuracy...');
  const confidenceAnalysis = assessConfidenceAccuracy(merged);
  console.log(`      ✅ Assessed ${confidenceAnalysis.totalAssessed} confidence levels (${confidenceAnalysis.needsAdjustment} need adjustment)`);

  console.log('   3. Rule performance...');
  const rulePerformance = analyzeRulePerformance(merged);
  console.log(`      ✅ Analyzed ${rulePerformance.totalRulesAnalyzed} rules`);
  console.log(`         Excellent: ${rulePerformance.excellentRules}, Good: ${rulePerformance.goodRules}, Fair: ${rulePerformance.fairRules}, Poor: ${rulePerformance.poorRules}`);

  console.log('   4. Category correlation...');
  const categoryCorrelation = analyzeCategoryCorrelation(merged);
  console.log(`      ✅ Analyzed ${categoryCorrelation.totalCategories} categories`);

  console.log('   5. Generating recommendations...');
  const recommendations = generateRecommendations(fpPatterns, confidenceAnalysis, rulePerformance);
  console.log(`      ✅ Generated ${recommendations.length} recommendations`);

  // Compile report
  const analysisReport = {
    metadata: {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      batchFile,
      validationFile,
      validatedFindings: validationStats.validatedFindings,
      totalFindings: validationStats.totalFindings,
      validationCoverage: validationStats.validationProgress
    },

    summary: {
      totalPatterns: fpPatterns.patternsIdentified,
      criticalPatterns: fpPatterns.criticalPatterns,
      confidenceIssues: confidenceAnalysis.needsAdjustment,
      poorPerformingRules: rulePerformance.poorRules,
      totalRecommendations: recommendations.length,
      p0Recommendations: recommendations.filter(r => r.priority === 'P0').length,
      p1Recommendations: recommendations.filter(r => r.priority === 'P1').length
    },

    validationStats: {
      totalFindings: validationStats.totalFindings,
      validatedFindings: validationStats.validatedFindings,
      validationProgress: validationStats.validationProgress,
      truePositives: validationStats.truePositives,
      falsePositives: validationStats.falsePositives,
      precision: validationStats.precision,
      recall: validationStats.recall,
      f1Score: validationStats.f1Score,
      falsePositiveRate: validationStats.falsePositiveRate
    },

    falsePositivePatterns: fpPatterns,
    confidenceAccuracy: confidenceAnalysis,
    rulePerformance: rulePerformance,
    categoryCorrelation: categoryCorrelation,
    recommendations: recommendations
  };

  // Save report
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const reportPath = path.join(outputDir, `pattern-analysis-${timestamp}.json`);
  const latestPath = path.join(outputDir, 'pattern-analysis-latest.json');

  await fs.writeFile(reportPath, JSON.stringify(analysisReport, null, 2));
  await fs.writeFile(latestPath, JSON.stringify(analysisReport, null, 2));

  // Print summary
  console.log('\n' + '='.repeat(70));
  console.log('✨ Pattern Analysis Complete!');
  console.log('='.repeat(70));

  console.log('\n📊 Overall Accuracy:');
  console.log(`   Precision: ${(validationStats.precision * 100).toFixed(1)}%`);
  console.log(`   Recall: ${(validationStats.recall * 100).toFixed(1)}%`);
  console.log(`   F1 Score: ${(validationStats.f1Score * 100).toFixed(1)}%`);
  console.log(`   False Positive Rate: ${(validationStats.falsePositiveRate * 100).toFixed(1)}%`);

  console.log('\n🔍 False Positive Patterns:');
  if (fpPatterns.patterns.length > 0) {
    fpPatterns.patterns.slice(0, 5).forEach((pattern, index) => {
      console.log(`   ${index + 1}. [${pattern.priority}] ${pattern.rule}: ${pattern.frequency} occurrences, ${pattern.sitesAffected} sites`);
      console.log(`      ${pattern.recommendation.slice(0, 80)}...`);
    });
  } else {
    console.log('   No significant patterns found');
  }

  console.log('\n🎯 Confidence Accuracy:');
  confidenceAnalysis.assessments.slice(0, 5).forEach(assessment => {
    console.log(`   ${assessment.confidence}: ${assessment.assessment} (actual: ${(assessment.actualPrecision * 100).toFixed(1)}%)`);
  });

  console.log('\n📈 Rule Performance:');
  rulePerformance.performances.slice(0, 5).forEach((perf, index) => {
    console.log(`   ${index + 1}. ${perf.rule}: ${perf.performance} (precision: ${(perf.precision * 100).toFixed(0)}%, FP rate: ${(perf.falsePositiveRate * 100).toFixed(0)}%)`);
  });

  console.log('\n🎯 Top Recommendations:');
  recommendations.slice(0, 5).forEach((rec, index) => {
    console.log(`   ${index + 1}. [${rec.priority}] ${rec.type}: ${rec.issue}`);
    console.log(`      ${rec.recommendation.slice(0, 80)}...`);
  });

  console.log('\n💾 Report saved to:');
  console.log(`   ${reportPath}`);
  console.log(`   ${latestPath}\n`);

  return analysisReport;
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
    } else if (arg === '--comparison' && args[i + 1]) {
      options.comparisonFile = args[i + 1];
      i++;
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
Usage: node analyze-patterns.js [options]

Options:
  --batch FILE         Batch scan results file (default: mock-batch-scan.json)
  --validation FILE    Manual validation CSV file (REQUIRED)
  --comparison FILE    Baseline comparison file (optional, for FN analysis)
  --help, -h           Show this help message

Examples:
  node analyze-patterns.js --validation manual-validation-template.csv
  node analyze-patterns.js --batch batch-scan-latest.json --validation manual-validation-completed.csv
      `);
      process.exit(0);
    }
  }

  return options;
}

if (require.main === module) {
  const options = parseArgs();

  analyzePatterns(options)
    .then(() => {
      console.log('✅ Pattern analysis completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Pattern analysis failed:', error);
      console.error(error.stack);
      process.exit(1);
    });
}

module.exports = { analyzePatterns };
