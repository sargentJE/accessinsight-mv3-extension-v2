# AccessInsight Integration Testing Report

**Generated**: 2025-11-17T10:48:40.680Z
**Analysis Date**: 2025-11-17T10:48:40.453Z

---

## Executive Summary

**Overall Accuracy**:
- Precision: **84.0%**
- Recall: **100.0%**
- F1 Score: **91.3%**
- False Positive Rate: **16.0%**

**Testing Coverage**:
- Sites Tested: **15**
- Total Findings: **464**
- Avg Findings/Site: **30.9**
- Avg Scan Time: **200ms**

**Comparison with axe-core**:
- AccessInsight: **287** findings
- axe-core: **140** issues
- Ratio: **2.05x**

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
| ecommerce | 6 | 36.7 | 246ms |
| news | 1 | 33 | 236ms |
| government | 8 | 26.4 | 162ms |

### By Confidence Level

| Confidence | Findings | Rules | Sites |
|------------|----------|-------|-------|
| 0.9 | 133 | 6 | 15 |
| 0.8 | 130 | 4 | 14 |
| 0.7 | 142 | 4 | 15 |
| 0.6 | 59 | 1 | 11 |

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
| 🟠 button-name | FAIR | 71% | 27% | 22 |
| 🟡 target-size | GOOD | 76% | 23% | 31 |
| 🟡 focus-appearance | GOOD | 77% | 21% | 14 |
| 🟡 img-alt | GOOD | 82% | 16% | 31 |
| 🟡 label-control | GOOD | 85% | 15% | 39 |
| 🟡 text-contrast | GOOD | 87% | 12% | 91 |
| 🟢 heading-order | EXCELLENT | 91% | 8% | 12 |
| 🟢 link-name | EXCELLENT | 96% | 4% | 26 |

---

## False Positive Patterns

**Total Patterns Identified**: 5
**Critical Patterns**: 2

### Top Patterns

#### 1. text-contrast [P0]

- **Frequency**: 11 occurrences
- **Sites Affected**: 7
- **Avg Confidence**: 0.8
- **Impact Score**: 53

**Recommendation**: Rule "text-contrast" has 11 false positives across 7 sites. Patterns are diverse. Review rule logic for over-flagging. Consider lowering confidence from 0.8 or adding exceptions.

#### 2. label-control [P1]

- **Frequency**: 6 occurrences
- **Sites Affected**: 6
- **Avg Confidence**: 0.9
- **Impact Score**: 40

**Recommendation**: Rule "label-control" has 6 false positives across 6 sites. Patterns are diverse. Review rule logic for over-flagging. Consider lowering confidence from 0.9 or adding exceptions.

#### 3. target-size [P2]

- **Frequency**: 7 occurrences
- **Sites Affected**: 4
- **Avg Confidence**: 0.7
- **Impact Score**: 26

**Recommendation**: Rule "target-size" has 7 false positives across 4 sites. Patterns are diverse. Review rule logic for over-flagging. Consider lowering confidence from 0.7 or adding exceptions.

#### 4. button-name [P2]

- **Frequency**: 6 occurrences
- **Sites Affected**: 4
- **Avg Confidence**: 0.9
- **Impact Score**: 24

**Recommendation**: Rule "button-name" has 6 false positives across 4 sites. Patterns are diverse. Review rule logic for over-flagging. Consider lowering confidence from 0.9 or adding exceptions.

#### 5. img-alt [P2]

- **Frequency**: 5 occurrences
- **Sites Affected**: 3
- **Avg Confidence**: 0.9
- **Impact Score**: 19

**Recommendation**: Rule "img-alt" has 5 false positives across 3 sites. Patterns are diverse. Review rule logic for over-flagging. Consider lowering confidence from 0.9 or adding exceptions.

---

## Confidence Accuracy

| Confidence | Expected | Actual | Assessment | Sample Size |
|------------|----------|--------|------------|-------------|
| 0.9 | 90% | 78% | 🔴 TOO_OPTIMISTIC | 129 |
| 0.8 | 80% | 85% | ✅ ACCURATE | 117 |
| 0.7 | 70% | 74% | ✅ ACCURATE | 38 |

### Adjustment Recommendations

- **0.9**: Confidence 0.9 is too optimistic. Actual precision is 77.5%, should decrease to 0.78

---

## Tool Comparison

### AccessInsight vs axe-core

| Metric | AccessInsight | axe-core |
|--------|---------------|----------|
| Total Findings | 287 | 140 |
| Avg per Site | 29 | 14 |
| Avg Scan Time | 179ms | N/A |

### Key Insights

✅ **AccessInsight finds more issues**: AccessInsight finds 2.05x more issues than axe-core on average. This suggests broader rule coverage or more sensitive detection.

✅ **Fast scanning**: Average scan time of 179ms is excellent. Well within target of <500ms per page.

✅ **Unique coverage**: AccessInsight detects issues axe-core doesn't. Unique rules: heading-order, target-size, redundant-entry. Provides complementary value.

### Coverage Gaps

**Unique to AccessInsight**:

- heading-order (8 sites)
- target-size (8 sites)
- redundant-entry (8 sites)
- img-alt (7 sites)
- label-control (6 sites)
- *...and 10 more*

---

## Recommendations

### Prioritized Action Items

#### P0 Priority (1 items)

**1. rule_logic_fix: text-contrast**

- **Issue**: 11 false positives across 7 sites
- **Recommendation**: Rule "text-contrast" has 11 false positives across 7 sites. Patterns are diverse. Review rule logic for over-flagging. Consider lowering confidence from 0.8 or adding exceptions.
- **Expected Impact**: Reduce false positives by ~11 findings
- **Implementation**: easy, ~30-60 minutes

#### P1 Priority (2 items)

**1. rule_logic_fix: label-control**

- **Issue**: 6 false positives across 6 sites
- **Recommendation**: Rule "label-control" has 6 false positives across 6 sites. Patterns are diverse. Review rule logic for over-flagging. Consider lowering confidence from 0.9 or adding exceptions.
- **Expected Impact**: Reduce false positives by ~6 findings
- **Implementation**: easy, ~30-60 minutes

**2. rule_improvement: button-name**

- **Issue**: Low precision: 71% (6 FP out of 22 validated)
- **Recommendation**: Rule needs improvement. 6 false positives out of 22 validated findings (27% FP rate). Review detection logic.
- **Expected Impact**: Improve precision from 71% to 75%+
- **Implementation**: medium, ~1-2 hours

#### P2 Priority (4 items)

**1. rule_logic_fix: target-size**

- **Issue**: 7 false positives across 4 sites
- **Recommendation**: Rule "target-size" has 7 false positives across 4 sites. Patterns are diverse. Review rule logic for over-flagging. Consider lowering confidence from 0.7 or adding exceptions.
- **Expected Impact**: Reduce false positives by ~7 findings
- **Implementation**: easy, ~30-60 minutes

**2. rule_logic_fix: button-name**

- **Issue**: 6 false positives across 4 sites
- **Recommendation**: Rule "button-name" has 6 false positives across 4 sites. Patterns are diverse. Review rule logic for over-flagging. Consider lowering confidence from 0.9 or adding exceptions.
- **Expected Impact**: Reduce false positives by ~6 findings
- **Implementation**: easy, ~30-60 minutes

**3. rule_logic_fix: img-alt**

- **Issue**: 5 false positives across 3 sites
- **Recommendation**: Rule "img-alt" has 5 false positives across 3 sites. Patterns are diverse. Review rule logic for over-flagging. Consider lowering confidence from 0.9 or adding exceptions.
- **Expected Impact**: Reduce false positives by ~5 findings
- **Implementation**: easy, ~30-60 minutes

**4. confidence_adjustment**

- **Issue**: Confidence level 0.9 too_optimistic
- **Recommendation**: Confidence 0.9 is too optimistic. Actual precision is 77.5%, should decrease to 0.78
- **Expected Impact**: Improve confidence accuracy by 12%
- **Implementation**: easy, ~15 minutes

---

## Detailed Findings

### Top 20 Rules by Frequency

| Rank | Rule | Findings | Sites | Avg Confidence | WCAG |
|------|------|----------|-------|----------------|------|
| 1 | text-contrast | 95 | 11 | 0.8 | 1.4.3, 1.4.6 |
| 2 | target-size | 73 | 12 | 0.7 | 2.5.5, 2.5.8 |
| 3 | focus-appearance | 59 | 11 | 0.6 | 2.4.11, 2.4.7 |
| 4 | label-control | 39 | 10 | 0.9 | 1.3.1, 3.3.2 |
| 5 | link-in-text-block | 35 | 9 | 0.7 | 1.4.1 |
| 6 | img-alt | 31 | 11 | 0.9 | 1.1.1 |
| 7 | link-name | 27 | 9 | 0.9 | 2.4.4, 4.1.2 |
| 8 | redundant-entry | 23 | 12 | 0.7 | 3.3.7 |
| 9 | button-name | 22 | 10 | 0.9 | 4.1.2 |
| 10 | heading-order | 20 | 10 | 0.8 | 1.3.1, 2.4.6 |
| 11 | accessible-authentication-minimum | 11 | 7 | 0.7 | 3.3.8 |
| 12 | document-title | 8 | 8 | 0.9 | 2.4.2 |
| 13 | aria-hidden-focus | 8 | 7 | 0.8 | 1.3.1, 4.1.2 |
| 14 | skip-link | 7 | 7 | 0.8 | 2.4.1 |
| 15 | html-has-lang | 6 | 6 | 0.9 | 3.1.1 |

---

## Analysis Metadata

- **Validated Findings**: 298 / 464 (64.2%)
- **Batch File**: mock-batch-scan.json
- **Validation File**: manual-validation-completed.csv
- **Comparison File**: mock-baseline-comparison.json
- **Sites Compared**: 10

---

*Report generated by AccessInsight Analysis Pipeline*