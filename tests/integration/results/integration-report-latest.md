# AccessInsight Integration Testing Report

**Generated**: 2025-11-07T15:19:51.398Z
**Analysis Date**: 2025-11-07T15:19:51.162Z

---

## Executive Summary

**Overall Accuracy**:
- Precision: **81.4%**
- Recall: **100.0%**
- F1 Score: **89.8%**
- False Positive Rate: **18.6%**

**Testing Coverage**:
- Sites Tested: **15**
- Total Findings: **434**
- Avg Findings/Site: **28.9**
- Avg Scan Time: **214ms**

**Comparison with axe-core**:
- AccessInsight: **258** findings
- axe-core: **152** issues
- Ratio: **1.7x**

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
| ecommerce | 6 | 36.5 | 254ms |
| news | 1 | 29 | 258ms |
| government | 8 | 23.3 | 178ms |

### By Confidence Level

| Confidence | Findings | Rules | Sites |
|------------|----------|-------|-------|
| 0.9 | 122 | 6 | 15 |
| 0.8 | 99 | 4 | 15 |
| 0.7 | 160 | 4 | 14 |
| 0.6 | 53 | 1 | 9 |

---

## Rule Performance

### Performance Summary

- **Excellent Rules**: 2
- **Good Rules**: 4
- **Fair Rules**: 2
- **Poor Rules**: 0

### Detailed Performance

| Rule | Performance | Precision | FP Rate | Validated |
|------|-------------|-----------|---------|-----------|
| 🟠 focus-appearance | FAIR | 60% | 29% | 14 |
| 🟠 button-name | FAIR | 64% | 31% | 16 |
| 🟡 target-size | GOOD | 77% | 22% | 50 |
| 🟡 label-control | GOOD | 80% | 19% | 37 |
| 🟡 img-alt | GOOD | 85% | 14% | 28 |
| 🟡 text-contrast | GOOD | 88% | 11% | 55 |
| 🟢 link-name | EXCELLENT | 94% | 6% | 31 |
| 🟢 heading-order | EXCELLENT | 95% | 5% | 20 |

---

## False Positive Patterns

**Total Patterns Identified**: 7
**Critical Patterns**: 3

### Top Patterns

#### 1. target-size [P1]

- **Frequency**: 11 occurrences
- **Sites Affected**: 5
- **Avg Confidence**: 0.7
- **Impact Score**: 47

**Recommendation**: Rule "target-size" has 11 false positives across 5 sites. Patterns are diverse. Review rule logic for over-flagging. Consider lowering confidence from 0.7 or adding exceptions.

#### 2. text-contrast [P1]

- **Frequency**: 6 occurrences
- **Sites Affected**: 5
- **Avg Confidence**: 0.8
- **Impact Score**: 37

**Recommendation**: Rule "text-contrast" has 6 false positives across 5 sites. Patterns are diverse. Review rule logic for over-flagging. Consider lowering confidence from 0.8 or adding exceptions.

#### 3. button-name [P1]

- **Frequency**: 5 occurrences
- **Sites Affected**: 5
- **Avg Confidence**: 0.9
- **Impact Score**: 35

**Recommendation**: Rule "button-name" has 5 false positives across 5 sites. Patterns are diverse. Review rule logic for over-flagging. Consider lowering confidence from 0.9 or adding exceptions.

#### 4. label-control [P2]

- **Frequency**: 7 occurrences
- **Sites Affected**: 4
- **Avg Confidence**: 0.9
- **Impact Score**: 26

**Recommendation**: Rule "label-control" has 7 false positives across 4 sites. Patterns are diverse. Review rule logic for over-flagging. Consider lowering confidence from 0.9 or adding exceptions.

#### 5. img-alt [P2]

- **Frequency**: 4 occurrences
- **Sites Affected**: 4
- **Avg Confidence**: 0.9
- **Impact Score**: 20

**Recommendation**: Rule "img-alt" has 4 false positives across 4 sites. Patterns are diverse. Review rule logic for over-flagging. Consider lowering confidence from 0.9 or adding exceptions.

#### 6. focus-appearance [P2]

- **Frequency**: 4 occurrences
- **Sites Affected**: 3
- **Avg Confidence**: 0.6
- **Impact Score**: 17

**Recommendation**: Rule "focus-appearance" has 4 false positives across 3 sites. Patterns are diverse. Review rule logic for over-flagging. Consider lowering confidence from 0.6 or adding exceptions.

#### 7. aria-hidden-focus [P2]

- **Frequency**: 3 occurrences
- **Sites Affected**: 3
- **Avg Confidence**: 0.8
- **Impact Score**: 15

**Recommendation**: Rule "aria-hidden-focus" has 3 false positives across 3 sites. Patterns are diverse. Review rule logic for over-flagging. Consider lowering confidence from 0.8 or adding exceptions.

---

## Confidence Accuracy

| Confidence | Expected | Actual | Assessment | Sample Size |
|------------|----------|--------|------------|-------------|
| 0.9 | 90% | 80% | 🔴 TOO_OPTIMISTIC | 119 |
| 0.8 | 80% | 86% | ⚠️ MINOR_ADJUSTMENT | 90 |
| 0.7 | 70% | 67% | ✅ ACCURATE | 61 |

### Adjustment Recommendations

- **0.9**: Confidence 0.9 is too optimistic. Actual precision is 79.8%, should decrease to 0.80
- **0.8**: Confidence 0.8 is close but could be adjusted to 0.86 for better accuracy

---

## Tool Comparison

### AccessInsight vs axe-core

| Metric | AccessInsight | axe-core |
|--------|---------------|----------|
| Total Findings | 258 | 152 |
| Avg per Site | 26 | 15 |
| Avg Scan Time | 187ms | N/A |

### Key Insights

✅ **AccessInsight finds more issues**: AccessInsight finds 1.70x more issues than axe-core on average. This suggests broader rule coverage or more sensitive detection.

✅ **Fast scanning**: Average scan time of 187ms is excellent. Well within target of <500ms per page.

⚠️ **Coverage gaps identified**: AccessInsight misses some issues that axe-core finds. Top gaps: link-name, text-contrast. Consider enhancing these rules.

✅ **Unique coverage**: AccessInsight detects issues axe-core doesn't. Unique rules: target-size, link-in-text-block, accessible-authentication-minimum. Provides complementary value.

### Coverage Gaps

**What axe finds but AccessInsight misses**:

- link-name (2 sites)
- text-contrast (1 sites)

**Unique to AccessInsight**:

- target-size (7 sites)
- link-in-text-block (7 sites)
- accessible-authentication-minimum (7 sites)
- label-control (6 sites)
- heading-order (6 sites)
- *...and 10 more*

---

## Recommendations

### Prioritized Action Items

#### P1 Priority (5 items)

**1. rule_logic_fix: target-size**

- **Issue**: 11 false positives across 5 sites
- **Recommendation**: Rule "target-size" has 11 false positives across 5 sites. Patterns are diverse. Review rule logic for over-flagging. Consider lowering confidence from 0.7 or adding exceptions.
- **Expected Impact**: Reduce false positives by ~11 findings
- **Implementation**: easy, ~30-60 minutes

**2. rule_logic_fix: text-contrast**

- **Issue**: 6 false positives across 5 sites
- **Recommendation**: Rule "text-contrast" has 6 false positives across 5 sites. Patterns are diverse. Review rule logic for over-flagging. Consider lowering confidence from 0.8 or adding exceptions.
- **Expected Impact**: Reduce false positives by ~6 findings
- **Implementation**: easy, ~30-60 minutes

**3. rule_logic_fix: button-name**

- **Issue**: 5 false positives across 5 sites
- **Recommendation**: Rule "button-name" has 5 false positives across 5 sites. Patterns are diverse. Review rule logic for over-flagging. Consider lowering confidence from 0.9 or adding exceptions.
- **Expected Impact**: Reduce false positives by ~5 findings
- **Implementation**: easy, ~30-60 minutes

**4. rule_improvement: focus-appearance**

- **Issue**: Low precision: 60% (4 FP out of 14 validated)
- **Recommendation**: Rule needs improvement. 4 false positives out of 14 validated findings (29% FP rate). Review detection logic.
- **Expected Impact**: Improve precision from 60% to 75%+
- **Implementation**: medium, ~1-2 hours

**5. rule_improvement: button-name**

- **Issue**: Low precision: 64% (5 FP out of 16 validated)
- **Recommendation**: Rule needs improvement. 5 false positives out of 16 validated findings (31% FP rate). Review detection logic.
- **Expected Impact**: Improve precision from 64% to 75%+
- **Implementation**: medium, ~1-2 hours

#### P2 Priority (5 items)

**1. rule_logic_fix: label-control**

- **Issue**: 7 false positives across 4 sites
- **Recommendation**: Rule "label-control" has 7 false positives across 4 sites. Patterns are diverse. Review rule logic for over-flagging. Consider lowering confidence from 0.9 or adding exceptions.
- **Expected Impact**: Reduce false positives by ~7 findings
- **Implementation**: easy, ~30-60 minutes

**2. rule_logic_fix: img-alt**

- **Issue**: 4 false positives across 4 sites
- **Recommendation**: Rule "img-alt" has 4 false positives across 4 sites. Patterns are diverse. Review rule logic for over-flagging. Consider lowering confidence from 0.9 or adding exceptions.
- **Expected Impact**: Reduce false positives by ~4 findings
- **Implementation**: easy, ~30-60 minutes

**3. rule_logic_fix: focus-appearance**

- **Issue**: 4 false positives across 3 sites
- **Recommendation**: Rule "focus-appearance" has 4 false positives across 3 sites. Patterns are diverse. Review rule logic for over-flagging. Consider lowering confidence from 0.6 or adding exceptions.
- **Expected Impact**: Reduce false positives by ~4 findings
- **Implementation**: easy, ~30-60 minutes

**4. rule_logic_fix: aria-hidden-focus**

- **Issue**: 3 false positives across 3 sites
- **Recommendation**: Rule "aria-hidden-focus" has 3 false positives across 3 sites. Patterns are diverse. Review rule logic for over-flagging. Consider lowering confidence from 0.8 or adding exceptions.
- **Expected Impact**: Reduce false positives by ~3 findings
- **Implementation**: easy, ~30-60 minutes

**5. confidence_adjustment**

- **Issue**: Confidence level 0.9 too_optimistic
- **Recommendation**: Confidence 0.9 is too optimistic. Actual precision is 79.8%, should decrease to 0.80
- **Expected Impact**: Improve confidence accuracy by 10%
- **Implementation**: easy, ~15 minutes

---

## Detailed Findings

### Top 20 Rules by Frequency

| Rank | Rule | Findings | Sites | Avg Confidence | WCAG |
|------|------|----------|-------|----------------|------|
| 1 | target-size | 79 | 11 | 0.7 | 2.5.5, 2.5.8 |
| 2 | text-contrast | 56 | 7 | 0.8 | 1.4.3, 1.4.6 |
| 3 | link-in-text-block | 54 | 11 | 0.7 | 1.4.1 |
| 4 | focus-appearance | 53 | 9 | 0.6 | 2.4.11, 2.4.7 |
| 5 | label-control | 37 | 9 | 0.9 | 1.3.1, 3.3.2 |
| 6 | link-name | 33 | 10 | 0.9 | 2.4.4, 4.1.2 |
| 7 | img-alt | 28 | 10 | 0.9 | 1.1.1 |
| 8 | heading-order | 24 | 10 | 0.8 | 1.3.1, 2.4.6 |
| 9 | redundant-entry | 17 | 9 | 0.7 | 3.3.7 |
| 10 | button-name | 16 | 7 | 0.9 | 4.1.2 |
| 11 | skip-link | 10 | 9 | 0.8 | 2.4.1 |
| 12 | accessible-authentication-minimum | 10 | 8 | 0.7 | 3.3.8 |
| 13 | aria-hidden-focus | 9 | 8 | 0.8 | 1.3.1, 4.1.2 |
| 14 | html-has-lang | 5 | 5 | 0.9 | 3.1.1 |
| 15 | document-title | 3 | 3 | 0.9 | 2.4.2 |

---

## Analysis Metadata

- **Validated Findings**: 284 / 434 (65.4%)
- **Batch File**: mock-batch-scan.json
- **Validation File**: manual-validation-completed.csv
- **Comparison File**: mock-baseline-comparison.json
- **Sites Compared**: 10

---

*Report generated by AccessInsight Analysis Pipeline*