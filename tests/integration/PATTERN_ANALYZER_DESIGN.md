# Pattern Analyzer - Detailed Design

## Purpose

The Pattern Analyzer identifies systematic patterns in false positives, false negatives, and rule performance to provide actionable recommendations for engine tuning.

## Core Objectives

1. **Identify False Positive Patterns**: Find common characteristics of incorrectly flagged issues
2. **Identify False Negative Patterns**: Find what the engine misses (by comparing with axe-core)
3. **Assess Confidence Accuracy**: Determine if confidence levels match actual precision
4. **Generate Tuning Recommendations**: Provide specific, actionable improvements

## Input Requirements

### Required Inputs
1. **Batch scan results** with findings
2. **Manual validation data** with classifications (true_positive, false_positive, etc.)
3. **Baseline comparison** (optional, for false negative detection)

### Data Dependencies
- Validated and normalized scan results
- Manual validation must have classifications
- At least 50-100 validated findings for statistical significance

## Analysis Algorithms

### 1. False Positive Pattern Detection

**Algorithm**:
```
For each finding classified as false_positive:
  1. Extract characteristics:
     - Rule ID
     - Confidence level
     - Site category
     - Element selector pattern
     - WCAG criteria

  2. Group by characteristics:
     - Count occurrences
     - Calculate frequency
     - Identify clusters

  3. Rank patterns by impact:
     - Pattern frequency
     - Sites affected
     - Rule affected
     - Confidence level mismatch
```

**Statistical Thresholds**:
- Pattern is "significant" if: frequency ≥ 5 OR affects ≥ 3 sites
- Pattern is "critical" if: frequency ≥ 10 OR affects ≥ 5 sites

**Output**:
```javascript
{
  rule: "link-in-text-block",
  pattern: "Navigation links flagged incorrectly",
  frequency: 15,
  sitesAffected: 7,
  characteristics: {
    commonSelectors: ["nav a", "header a"],
    avgConfidence: 0.7,
    category: "navigation"
  },
  recommendation: "Exclude links in navigation landmarks (nav, header[role=banner])"
}
```

### 2. False Negative Pattern Detection

**Algorithm**:
```
Compare AccessInsight findings with axe-core violations:
  1. Map rules between tools (where possible)
  2. Identify issues axe finds but AccessInsight misses
  3. Classify by rule and reason:
     - Rule not implemented
     - Detection approach different
     - Edge case not handled

  4. Prioritize by:
     - Frequency
     - Severity (critical > serious > moderate)
     - WCAG level (A > AA > AAA)
```

**Output**:
```javascript
{
  missingRule: "color-contrast",
  axeFindings: 25,
  accessInsightFindings: 18,
  gap: 7,
  reason: "Misses contrast issues on gradient backgrounds",
  severity: "serious",
  recommendation: "Implement gradient background contrast checking"
}
```

### 3. Confidence Accuracy Assessment

**Algorithm**:
```
For each confidence level (0.6, 0.7, 0.8, 0.9):
  1. Get all findings at that level
  2. Calculate actual precision from validation:
     precision = true_positives / (true_positives + false_positives)

  3. Compare with confidence level:
     - If precision ≈ confidence: ACCURATE
     - If precision > confidence + 0.1: TOO CONSERVATIVE (can increase)
     - If precision < confidence - 0.1: TOO OPTIMISTIC (should decrease)

  4. Generate recommendation
```

**Output**:
```javascript
{
  confidence: 0.7,
  expectedPrecision: 0.70,
  actualPrecision: 0.55,
  difference: -0.15,
  assessment: "TOO_OPTIMISTIC",
  recommendation: "Decrease confidence to 0.6 (15% overestimated)",
  affectedRules: ["focus-appearance", "link-in-text-block"]
}
```

### 4. Rule Performance Analysis

**Algorithm**:
```
For each rule:
  1. Calculate metrics from validation:
     - Precision (TP / (TP + FP))
     - Recall (TP / (TP + FN)) [if comparison data available]
     - False positive rate
     - False negative rate

  2. Classify performance:
     - EXCELLENT: precision ≥ 0.90, recall ≥ 0.80
     - GOOD: precision ≥ 0.75, recall ≥ 0.60
     - FAIR: precision ≥ 0.60, recall ≥ 0.40
     - POOR: below fair thresholds

  3. Identify issues:
     - High FP rate: rule too aggressive
     - High FN rate: rule too conservative/missing cases
     - Low precision + high recall: over-flagging
     - High precision + low recall: too strict
```

**Output**:
```javascript
{
  rule: "text-contrast",
  performance: "GOOD",
  metrics: {
    precision: 0.85,
    recall: 0.75,
    f1Score: 0.80,
    falsePositiveRate: 0.15
  },
  findings: 41,
  validated: 32,
  truePositives: 28,
  falsePositives: 4,
  assessment: "Performing well, minor false positives on gradient backgrounds",
  recommendation: "Document gradient limitation, consider edge case handling"
}
```

### 5. Site Category Correlation

**Algorithm**:
```
For each site category (government, ecommerce, etc.):
  1. Calculate false positive rate
  2. Calculate findings per site
  3. Compare with expected quality

  4. Identify anomalies:
     - High FP rate on "excellent" quality sites
     - Low findings on "poor" quality sites

  5. Identify patterns:
     - Specific rules fail on specific categories
     - Technology-specific issues
```

**Output**:
```javascript
{
  category: "ecommerce",
  expectedQuality: "medium",
  actualQuality: "poor", // Based on findings
  fpRate: 0.30, // High!
  commonIssues: [
    {
      rule: "target-size",
      reason: "Small product thumbnails flagged incorrectly",
      frequency: 12
    }
  ],
  recommendation: "E-commerce sites have different interaction patterns, adjust target-size for product grids"
}
```

## Ranking and Prioritization

### Impact Scoring
```
impact_score = (frequency * 2) + (sites_affected * 3) + (severity_weight)

where severity_weight:
  - critical: 10
  - serious: 5
  - moderate: 2
```

### Priority Classification
- **P0 (Critical)**: Impact score ≥ 50 OR affects ≥ 50% of sites
- **P1 (High)**: Impact score ≥ 30 OR affects ≥ 30% of sites
- **P2 (Medium)**: Impact score ≥ 15 OR affects ≥ 20% of sites
- **P3 (Low)**: Below P2 thresholds

## Recommendations Format

### Structure
```javascript
{
  type: "confidence_adjustment" | "rule_logic_fix" | "documentation" | "limitation",
  priority: "P0" | "P1" | "P2" | "P3",
  rule: "rule-id",
  issue: "Clear description of problem",
  evidence: {
    frequency: 15,
    sitesAffected: 7,
    fpRate: 0.30
  },
  recommendation: "Specific actionable fix",
  expectedImpact: "Reduce FP by ~50%",
  implementation: {
    difficulty: "easy" | "medium" | "hard",
    estimatedTime: "30 minutes",
    codeLocation: "engine.js:line-number"
  }
}
```

### Recommendation Types

1. **Confidence Adjustment**:
   ```javascript
   {
     type: "confidence_adjustment",
     rule: "focus-appearance",
     currentConfidence: 0.7,
     recommendedConfidence: 0.6,
     reason: "Actual precision 0.55, 15% lower than confidence"
   }
   ```

2. **Rule Logic Fix**:
   ```javascript
   {
     type: "rule_logic_fix",
     rule: "link-in-text-block",
     issue: "Navigation links incorrectly flagged",
     fix: "Skip links inside <nav> or [role=navigation]",
     pseudocode: "if (element.closest('nav, [role=\"navigation\"]')) return null;"
   }
   ```

3. **Documentation**:
   ```javascript
   {
     type: "documentation",
     rule: "text-contrast",
     issue: "Misses gradient backgrounds",
     recommendation: "Document as known limitation in rule description"
   }
   ```

4. **Limitation**:
   ```javascript
   {
     type: "limitation",
     rule: "focus-appearance",
     issue: "Cannot detect :focus pseudo-class styles",
     recommendation: "Lower confidence to 0.6, add warning in UI"
   }
   ```

## Statistical Validity

### Minimum Sample Sizes
- Pattern analysis: ≥ 50 validated findings
- Confidence accuracy: ≥ 20 findings per confidence level
- Rule performance: ≥ 10 validated findings per rule

### Confidence Intervals
Report 95% confidence intervals for key metrics:
```javascript
{
  precision: 0.78,
  confidenceInterval: [0.72, 0.84],
  sampleSize: 45,
  statisticallySignificant: true // if sample size ≥ minimum
}
```

## Output Format

### JSON Structure
```javascript
{
  metadata: {
    timestamp: "ISO-8601",
    validatedFindings: 150,
    totalFindings: 290,
    validationCoverage: 0.52
  },

  summary: {
    totalPatterns: 12,
    criticalIssues: 3,
    highPriorityIssues: 5,
    overallFPRate: 0.22
  },

  falsePositivePatterns: [
    // Ranked by impact
  ],

  falseNegativePatterns: [
    // If comparison data available
  ],

  confidenceAccuracy: {
    // By confidence level
  },

  rulePerformance: {
    // By rule
  },

  categoryCorrelation: {
    // By site category
  },

  recommendations: [
    // Ranked by priority
  ]
}
```

## Quality Checks

### Validation
- [ ] All patterns have statistical significance
- [ ] Recommendations are actionable
- [ ] Impact scores calculated correctly
- [ ] Confidence intervals provided where appropriate
- [ ] Sample sizes checked for validity

### Edge Cases
- Handle missing validation data gracefully
- Handle partial validation (not all findings validated)
- Handle skewed distributions (one category dominates)
- Handle low sample sizes (warn user)

## Success Criteria

### Functional
- [x] Identifies false positive patterns
- [x] Identifies false negative patterns
- [x] Assesses confidence accuracy
- [x] Generates actionable recommendations
- [x] Ranks by priority/impact

### Quality
- [x] Statistical validity checked
- [x] Handles edge cases
- [x] Clear, actionable output
- [x] Comprehensive logging
- [x] Tested with mock data

## Testing Plan

### Test Cases
1. **Happy Path**: Full validation data, clear patterns
2. **Partial Validation**: Only 30% of findings validated
3. **No Clear Patterns**: Random distribution
4. **Skewed Data**: 90% from one category
5. **Low Sample Size**: Only 20 validated findings
6. **No Validation**: Just scan results (should warn and skip accuracy analysis)

### Expected Outputs
- Patterns identified correctly
- Warnings for low sample sizes
- Graceful degradation with missing data
- Recommendations make sense
- Priority ranking logical

## Implementation Notes

### Dependencies
- data-validator.js (for merging validation data)
- calculate-metrics.js (for base metrics)
- Statistical functions for confidence intervals

### Performance
- Should process 40 sites with 300+ findings in < 5 seconds
- Memory efficient (stream large datasets if needed)

### Extensibility
- Easy to add new pattern types
- Easy to add new recommendation types
- Pluggable ranking algorithms
