# AccessInsight Integration Testing Report

**Generated**: 2025-11-07T15:05:10.858Z
**Analysis Date**: 2025-11-07T15:05:10.647Z

---

## Executive Summary

**Overall Accuracy**:
- Precision: **83.2%**
- Recall: **100.0%**
- F1 Score: **90.8%**
- False Positive Rate: **16.8%**

**Testing Coverage**:
- Sites Tested: **15**
- Total Findings: **465**
- Avg Findings/Site: **31**
- Avg Scan Time: **211ms**

**Comparison with axe-core**:
- AccessInsight: **295** findings
- axe-core: **159** issues
- Ratio: **1.86x**

---

## Table of Contents

1. [Overall Metrics](#overall-metrics)
2. [Rule Performance](#rule-performance)
3. [False Positive Patterns](#false-positive-patterns)
4. [Confidence Accuracy](#confidence-accuracy)
5. [Tool Comparison](#tool-comparison)
6. [Recommendations](#recommendations)
7. [Detailed Findings](#detailed-findings)

---

## Overall Metrics

### By Category

| Category | Sites | Avg Findings | Avg Scan Time |
|----------|-------|--------------|---------------|
| ecommerce | 6 | 38.2 | 272ms |
| government | 8 | 26.4 | 162ms |
| news | 1 | 25 | 228ms |

### By Confidence Level

| Confidence | Findings | Rules | Sites |
|------------|----------|-------|-------|
| 0.9 | 130 | 6 | 15 |
| 0.8 | 152 | 4 | 15 |
| 0.7 | 131 | 4 | 15 |
| 0.6 | 52 | 1 | 11 |

---

## Rule Performance

### Performance Summary

- **Excellent Rules**: 2
- **Good Rules**: 5
- **Fair Rules**: 1
- **Poor Rules**: 0

### Detailed Performance

| Rule | Performance | Precision | FP Rate | Validated |
|------|-------------|-----------|---------|-----------|
| 🟠 label-control | FAIR | 74% | 25% | 44 |
| 🟡 aria-hidden-focus | GOOD | 80% | 18% | 11 |
| 🟡 img-alt | GOOD | 81% | 18% | 38 |
| 🟡 heading-order | GOOD | 83% | 14% | 21 |
| 🟡 text-contrast | GOOD | 84% | 15% | 98 |
| 🟡 target-size | GOOD | 88% | 11% | 18 |
| 🟢 link-name | EXCELLENT | 94% | 5% | 20 |
| 🟢 button-name | EXCELLENT | 100% | 0% | 17 |

---

## False Positive Patterns

**Total Patterns Identified**: 5
**Critical Patterns**: 3

### Top Patterns

#### 1. text-contrast [P0]

- **Frequency**: 15 occurrences
- **Sites Affected**: 9
- **Avg Confidence**: 0.8
- **Impact Score**: 67

**Recommendation**: Rule "text-contrast" has 15 false positives across 9 sites. Patterns are diverse. Review rule logic for over-flagging. Consider lowering confidence from 0.8 or adding exceptions.

#### 2. label-control [P0]

- **Frequency**: 11 occurrences
- **Sites Affected**: 8
- **Avg Confidence**: 0.9
- **Impact Score**: 56

**Recommendation**: Rule "label-control" has 11 false positives across 8 sites. Patterns are diverse. Review rule logic for over-flagging. Consider lowering confidence from 0.9 or adding exceptions.

#### 3. img-alt [P1]

- **Frequency**: 7 occurrences
- **Sites Affected**: 6
- **Avg Confidence**: 0.9
- **Impact Score**: 42

**Recommendation**: Rule "img-alt" has 7 false positives across 6 sites. Patterns are diverse. Review rule logic for over-flagging. Consider lowering confidence from 0.9 or adding exceptions.

#### 4. heading-order [P2]

- **Frequency**: 3 occurrences
- **Sites Affected**: 3
- **Avg Confidence**: 0.8
- **Impact Score**: 15

**Recommendation**: Rule "heading-order" has 3 false positives across 3 sites. Patterns are diverse. Review rule logic for over-flagging. Consider lowering confidence from 0.8 or adding exceptions.

#### 5. skip-link [P2]

- **Frequency**: 3 occurrences
- **Sites Affected**: 3
- **Avg Confidence**: 0.8
- **Impact Score**: 15

**Recommendation**: Rule "skip-link" has 3 false positives across 3 sites. Patterns are diverse. Review rule logic for over-flagging. Consider lowering confidence from 0.8 or adding exceptions.

---

## Confidence Accuracy

| Confidence | Expected | Actual | Assessment | Sample Size |
|------------|----------|--------|------------|-------------|
| 0.9 | 90% | 80% | 🔴 TOO_OPTIMISTIC | 127 |
| 0.8 | 80% | 79% | ✅ ACCURATE | 138 |
| 0.7 | 70% | 78% | ⚠️ MINOR_ADJUSTMENT | 27 |

### Adjustment Recommendations

- **0.9**: Confidence 0.9 is too optimistic. Actual precision is 79.5%, should decrease to 0.80
- **0.7**: Confidence 0.7 is close but could be adjusted to 0.78 for better accuracy

---

## Tool Comparison

### AccessInsight vs axe-core

| Metric | AccessInsight | axe-core |
|--------|---------------|----------|
| Total Findings | 295 | 159 |
| Avg per Site | 30 | 16 |
| Avg Scan Time | 184ms | N/A |

### Key Insights

✅ **AccessInsight finds more issues**: AccessInsight finds 1.86x more issues than axe-core on average. This suggests broader rule coverage or more sensitive detection.

✅ **Fast scanning**: Average scan time of 184ms is excellent. Well within target of <500ms per page.

⚠️ **Coverage gaps identified**: AccessInsight misses some issues that axe-core finds. Top gaps: link-name, text-contrast. Consider enhancing these rules.

✅ **Unique coverage**: AccessInsight detects issues axe-core doesn't. Unique rules: heading-order, img-alt, target-size. Provides complementary value.

### Coverage Gaps

**What axe finds but AccessInsight misses**:

- link-name (3 sites)
- text-contrast (1 sites)

**Unique to AccessInsight**:

- heading-order (9 sites)
- img-alt (8 sites)
- target-size (8 sites)
- label-control (8 sites)
- skip-link (8 sites)
- *...and 10 more*

---

## Recommendations

### Prioritized Action Items

#### P0 Priority (2 items)

**1. rule_logic_fix: text-contrast**

- **Issue**: 15 false positives across 9 sites
- **Recommendation**: Rule "text-contrast" has 15 false positives across 9 sites. Patterns are diverse. Review rule logic for over-flagging. Consider lowering confidence from 0.8 or adding exceptions.
- **Expected Impact**: Reduce false positives by ~15 findings
- **Implementation**: easy, ~30-60 minutes

**2. rule_logic_fix: label-control**

- **Issue**: 11 false positives across 8 sites
- **Recommendation**: Rule "label-control" has 11 false positives across 8 sites. Patterns are diverse. Review rule logic for over-flagging. Consider lowering confidence from 0.9 or adding exceptions.
- **Expected Impact**: Reduce false positives by ~11 findings
- **Implementation**: easy, ~30-60 minutes

#### P1 Priority (2 items)

**1. rule_logic_fix: img-alt**

- **Issue**: 7 false positives across 6 sites
- **Recommendation**: Rule "img-alt" has 7 false positives across 6 sites. Patterns are diverse. Review rule logic for over-flagging. Consider lowering confidence from 0.9 or adding exceptions.
- **Expected Impact**: Reduce false positives by ~7 findings
- **Implementation**: easy, ~30-60 minutes

**2. rule_improvement: label-control**

- **Issue**: Low precision: 74% (11 FP out of 44 validated)
- **Recommendation**: Rule needs improvement. 11 false positives out of 44 validated findings (25% FP rate). Review detection logic.
- **Expected Impact**: Improve precision from 74% to 75%+
- **Implementation**: medium, ~1-2 hours

#### P2 Priority (3 items)

**1. rule_logic_fix: heading-order**

- **Issue**: 3 false positives across 3 sites
- **Recommendation**: Rule "heading-order" has 3 false positives across 3 sites. Patterns are diverse. Review rule logic for over-flagging. Consider lowering confidence from 0.8 or adding exceptions.
- **Expected Impact**: Reduce false positives by ~3 findings
- **Implementation**: easy, ~30-60 minutes

**2. rule_logic_fix: skip-link**

- **Issue**: 3 false positives across 3 sites
- **Recommendation**: Rule "skip-link" has 3 false positives across 3 sites. Patterns are diverse. Review rule logic for over-flagging. Consider lowering confidence from 0.8 or adding exceptions.
- **Expected Impact**: Reduce false positives by ~3 findings
- **Implementation**: easy, ~30-60 minutes

**3. confidence_adjustment**

- **Issue**: Confidence level 0.9 too_optimistic
- **Recommendation**: Confidence 0.9 is too optimistic. Actual precision is 79.5%, should decrease to 0.80
- **Expected Impact**: Improve confidence accuracy by 10%
- **Implementation**: easy, ~15 minutes

---

## Detailed Findings

### Top 20 Rules by Frequency

| Rank | Rule | Findings | Sites | Avg Confidence | WCAG |
|------|------|----------|-------|----------------|------|
| 1 | text-contrast | 98 | 13 | 0.8 | 1.4.3, 1.4.6 |
| 2 | target-size | 55 | 11 | 0.7 | 2.5.5, 2.5.8 |
| 3 | focus-appearance | 52 | 11 | 0.6 | 2.4.11, 2.4.7 |
| 4 | label-control | 44 | 11 | 0.9 | 1.3.1, 3.3.2 |
| 5 | link-in-text-block | 42 | 11 | 0.7 | 1.4.1 |
| 6 | img-alt | 38 | 13 | 0.9 | 1.1.1 |
| 7 | heading-order | 29 | 14 | 0.8 | 1.3.1, 2.4.6 |
| 8 | redundant-entry | 26 | 11 | 0.7 | 3.3.7 |
| 9 | link-name | 22 | 8 | 0.9 | 2.4.4, 4.1.2 |
| 10 | button-name | 17 | 10 | 0.9 | 4.1.2 |
| 11 | aria-hidden-focus | 14 | 10 | 0.8 | 1.3.1, 4.1.2 |
| 12 | skip-link | 11 | 11 | 0.8 | 2.4.1 |
| 13 | accessible-authentication-minimum | 8 | 6 | 0.7 | 3.3.8 |
| 14 | document-title | 5 | 5 | 0.9 | 2.4.2 |
| 15 | html-has-lang | 4 | 4 | 0.9 | 3.1.1 |

---

## Analysis Metadata

- **Validated Findings**: 300 / 465 (64.5%)
- **Batch File**: mock-batch-scan.json
- **Validation File**: manual-validation-completed.csv
- **Comparison File**: mock-baseline-comparison.json
- **Sites Compared**: 10

---

*Report generated by AccessInsight Analysis Pipeline*