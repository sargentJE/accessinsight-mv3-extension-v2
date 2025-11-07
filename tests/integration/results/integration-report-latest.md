# AccessInsight Integration Testing Report

**Generated**: 2025-11-07T15:33:55.376Z
**Analysis Date**: 2025-11-07T15:33:16.079Z

---

## Executive Summary

**Overall Accuracy**:
- Precision: **82.7%**
- Recall: **100.0%**
- F1 Score: **90.5%**
- False Positive Rate: **17.3%**

**Testing Coverage**:
- Sites Tested: **30**
- Total Findings: **997**
- Avg Findings/Site: **33.2**
- Avg Scan Time: **223ms**

**Comparison with axe-core**:
- AccessInsight: **345** findings
- axe-core: **153** issues
- Ratio: **2.25x**

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
| saas | 5 | 38.6 | 287ms |
| ecommerce | 6 | 37 | 247ms |
| news | 6 | 33 | 222ms |
| government | 8 | 32.8 | 184ms |
| education | 5 | 24.4 | 195ms |

### By Confidence Level

| Confidence | Findings | Rules | Sites |
|------------|----------|-------|-------|
| 0.9 | 282 | 6 | 29 |
| 0.8 | 280 | 4 | 30 |
| 0.7 | 304 | 4 | 28 |
| 0.6 | 131 | 1 | 25 |

---

## Rule Performance

### Performance Summary

- **Excellent Rules**: 1
- **Good Rules**: 8
- **Fair Rules**: 2
- **Poor Rules**: 0

### Detailed Performance

| Rule | Performance | Precision | FP Rate | Validated |
|------|-------------|-----------|---------|-----------|
| 🟠 link-in-text-block | FAIR | 71% | 28% | 18 |
| 🟠 skip-link | FAIR | 73% | 25% | 12 |
| 🟡 focus-appearance | GOOD | 78% | 18% | 22 |
| 🟡 img-alt | GOOD | 79% | 21% | 53 |
| 🟡 target-size | GOOD | 82% | 17% | 52 |
| 🟡 link-name | GOOD | 83% | 15% | 52 |
| 🟡 label-control | GOOD | 84% | 16% | 87 |
| 🟡 heading-order | GOOD | 84% | 15% | 26 |
| 🟡 button-name | GOOD | 86% | 13% | 46 |
| 🟡 text-contrast | GOOD | 86% | 14% | 192 |
| 🟢 document-title | EXCELLENT | 90% | 9% | 11 |

---

## False Positive Patterns

**Total Patterns Identified**: 11
**Critical Patterns**: 6

### Top Patterns

#### 1. text-contrast [P0]

- **Frequency**: 26 occurrences
- **Sites Affected**: 16
- **Avg Confidence**: 0.8
- **Impact Score**: 110

**Recommendation**: Rule "text-contrast" has 26 false positives across 16 sites. Patterns are diverse. Review rule logic for over-flagging. Consider lowering confidence from 0.8 or adding exceptions.

#### 2. label-control [P0]

- **Frequency**: 14 occurrences
- **Sites Affected**: 10
- **Avg Confidence**: 0.9
- **Impact Score**: 68

**Recommendation**: Rule "label-control" has 14 false positives across 10 sites. Patterns are diverse. Review rule logic for over-flagging. Consider lowering confidence from 0.9 or adding exceptions.

#### 3. img-alt [P0]

- **Frequency**: 11 occurrences
- **Sites Affected**: 8
- **Avg Confidence**: 0.9
- **Impact Score**: 56

**Recommendation**: Rule "img-alt" has 11 false positives across 8 sites. Patterns are diverse. Review rule logic for over-flagging. Consider lowering confidence from 0.9 or adding exceptions.

#### 4. target-size [P1]

- **Frequency**: 9 occurrences
- **Sites Affected**: 7
- **Avg Confidence**: 0.7
- **Impact Score**: 49

**Recommendation**: Rule "target-size" has 9 false positives across 7 sites. Patterns are diverse. Review rule logic for over-flagging. Consider lowering confidence from 0.7 or adding exceptions.

#### 5. link-name [P1]

- **Frequency**: 8 occurrences
- **Sites Affected**: 6
- **Avg Confidence**: 0.9
- **Impact Score**: 44

**Recommendation**: Rule "link-name" has 8 false positives across 6 sites. Patterns are diverse. Review rule logic for over-flagging. Consider lowering confidence from 0.9 or adding exceptions.

#### 6. button-name [P1]

- **Frequency**: 6 occurrences
- **Sites Affected**: 6
- **Avg Confidence**: 0.9
- **Impact Score**: 40

**Recommendation**: Rule "button-name" has 6 false positives across 6 sites. Patterns are diverse. Review rule logic for over-flagging. Consider lowering confidence from 0.9 or adding exceptions.

#### 7. heading-order [P2]

- **Frequency**: 4 occurrences
- **Sites Affected**: 4
- **Avg Confidence**: 0.8
- **Impact Score**: 20

**Recommendation**: Rule "heading-order" has 4 false positives across 4 sites. Patterns are diverse. Review rule logic for over-flagging. Consider lowering confidence from 0.8 or adding exceptions.

#### 8. link-in-text-block [P2]

- **Frequency**: 5 occurrences
- **Sites Affected**: 3
- **Avg Confidence**: 0.7
- **Impact Score**: 19

**Recommendation**: Rule "link-in-text-block" has 5 false positives across 3 sites. Patterns are diverse. Review rule logic for over-flagging. Consider lowering confidence from 0.7 or adding exceptions.

#### 9. redundant-entry [P2]

- **Frequency**: 4 occurrences
- **Sites Affected**: 3
- **Avg Confidence**: 0.7
- **Impact Score**: 17

**Recommendation**: Rule "redundant-entry" has 4 false positives across 3 sites. Patterns are diverse. Review rule logic for over-flagging. Consider lowering confidence from 0.7 or adding exceptions.

#### 10. skip-link [P2]

- **Frequency**: 3 occurrences
- **Sites Affected**: 3
- **Avg Confidence**: 0.8
- **Impact Score**: 15

**Recommendation**: Rule "skip-link" has 3 false positives across 3 sites. Patterns are diverse. Review rule logic for over-flagging. Consider lowering confidence from 0.8 or adding exceptions.

---

## Confidence Accuracy

| Confidence | Expected | Actual | Assessment | Sample Size |
|------------|----------|--------|------------|-------------|
| 0.9 | 90% | 81% | ⚠️ MINOR_ADJUSTMENT | 257 |
| 0.8 | 80% | 79% | ✅ ACCURATE | 239 |
| 0.7 | 70% | 74% | ✅ ACCURATE | 78 |
| 0.6 | 60% | 64% | ✅ ACCURATE | 22 |

### Adjustment Recommendations

- **0.9**: Confidence 0.9 is close but could be adjusted to 0.81 for better accuracy

---

## Tool Comparison

### AccessInsight vs axe-core

| Metric | AccessInsight | axe-core |
|--------|---------------|----------|
| Total Findings | 345 | 153 |
| Avg per Site | 35 | 15 |
| Avg Scan Time | 199ms | N/A |

### Key Insights

✅ **AccessInsight finds more issues**: AccessInsight finds 2.25x more issues than axe-core on average. This suggests broader rule coverage or more sensitive detection.

✅ **Fast scanning**: Average scan time of 199ms is excellent. Well within target of <500ms per page.

✅ **Unique coverage**: AccessInsight detects issues axe-core doesn't. Unique rules: label-control, heading-order, button-name. Provides complementary value.

### Coverage Gaps

**Unique to AccessInsight**:

- label-control (10 sites)
- heading-order (9 sites)
- button-name (8 sites)
- link-in-text-block (8 sites)
- focus-appearance (8 sites)
- *...and 10 more*

---

## Recommendations

### Prioritized Action Items

#### P0 Priority (3 items)

**1. rule_logic_fix: text-contrast**

- **Issue**: 26 false positives across 16 sites
- **Recommendation**: Rule "text-contrast" has 26 false positives across 16 sites. Patterns are diverse. Review rule logic for over-flagging. Consider lowering confidence from 0.8 or adding exceptions.
- **Expected Impact**: Reduce false positives by ~26 findings
- **Implementation**: medium, ~1-2 hours

**2. rule_logic_fix: label-control**

- **Issue**: 14 false positives across 10 sites
- **Recommendation**: Rule "label-control" has 14 false positives across 10 sites. Patterns are diverse. Review rule logic for over-flagging. Consider lowering confidence from 0.9 or adding exceptions.
- **Expected Impact**: Reduce false positives by ~14 findings
- **Implementation**: easy, ~30-60 minutes

**3. rule_logic_fix: img-alt**

- **Issue**: 11 false positives across 8 sites
- **Recommendation**: Rule "img-alt" has 11 false positives across 8 sites. Patterns are diverse. Review rule logic for over-flagging. Consider lowering confidence from 0.9 or adding exceptions.
- **Expected Impact**: Reduce false positives by ~11 findings
- **Implementation**: easy, ~30-60 minutes

#### P1 Priority (5 items)

**1. rule_logic_fix: target-size**

- **Issue**: 9 false positives across 7 sites
- **Recommendation**: Rule "target-size" has 9 false positives across 7 sites. Patterns are diverse. Review rule logic for over-flagging. Consider lowering confidence from 0.7 or adding exceptions.
- **Expected Impact**: Reduce false positives by ~9 findings
- **Implementation**: easy, ~30-60 minutes

**2. rule_logic_fix: link-name**

- **Issue**: 8 false positives across 6 sites
- **Recommendation**: Rule "link-name" has 8 false positives across 6 sites. Patterns are diverse. Review rule logic for over-flagging. Consider lowering confidence from 0.9 or adding exceptions.
- **Expected Impact**: Reduce false positives by ~8 findings
- **Implementation**: easy, ~30-60 minutes

**3. rule_logic_fix: button-name**

- **Issue**: 6 false positives across 6 sites
- **Recommendation**: Rule "button-name" has 6 false positives across 6 sites. Patterns are diverse. Review rule logic for over-flagging. Consider lowering confidence from 0.9 or adding exceptions.
- **Expected Impact**: Reduce false positives by ~6 findings
- **Implementation**: easy, ~30-60 minutes

**4. rule_improvement: link-in-text-block**

- **Issue**: Low precision: 71% (5 FP out of 18 validated)
- **Recommendation**: Rule needs improvement. 5 false positives out of 18 validated findings (28% FP rate). Review detection logic.
- **Expected Impact**: Improve precision from 71% to 75%+
- **Implementation**: medium, ~1-2 hours

**5. rule_improvement: skip-link**

- **Issue**: Low precision: 73% (3 FP out of 12 validated)
- **Recommendation**: Rule needs improvement. 3 false positives out of 12 validated findings (25% FP rate). Review detection logic.
- **Expected Impact**: Improve precision from 73% to 75%+
- **Implementation**: medium, ~1-2 hours

#### P2 Priority (5 items)

**1. rule_logic_fix: heading-order**

- **Issue**: 4 false positives across 4 sites
- **Recommendation**: Rule "heading-order" has 4 false positives across 4 sites. Patterns are diverse. Review rule logic for over-flagging. Consider lowering confidence from 0.8 or adding exceptions.
- **Expected Impact**: Reduce false positives by ~4 findings
- **Implementation**: easy, ~30-60 minutes

**2. rule_logic_fix: link-in-text-block**

- **Issue**: 5 false positives across 3 sites
- **Recommendation**: Rule "link-in-text-block" has 5 false positives across 3 sites. Patterns are diverse. Review rule logic for over-flagging. Consider lowering confidence from 0.7 or adding exceptions.
- **Expected Impact**: Reduce false positives by ~5 findings
- **Implementation**: easy, ~30-60 minutes

**3. rule_logic_fix: redundant-entry**

- **Issue**: 4 false positives across 3 sites
- **Recommendation**: Rule "redundant-entry" has 4 false positives across 3 sites. Patterns are diverse. Review rule logic for over-flagging. Consider lowering confidence from 0.7 or adding exceptions.
- **Expected Impact**: Reduce false positives by ~4 findings
- **Implementation**: easy, ~30-60 minutes

**4. rule_logic_fix: skip-link**

- **Issue**: 3 false positives across 3 sites
- **Recommendation**: Rule "skip-link" has 3 false positives across 3 sites. Patterns are diverse. Review rule logic for over-flagging. Consider lowering confidence from 0.8 or adding exceptions.
- **Expected Impact**: Reduce false positives by ~3 findings
- **Implementation**: easy, ~30-60 minutes

**5. rule_logic_fix: aria-hidden-focus**

- **Issue**: 3 false positives across 3 sites
- **Recommendation**: Rule "aria-hidden-focus" has 3 false positives across 3 sites. Patterns are diverse. Review rule logic for over-flagging. Consider lowering confidence from 0.8 or adding exceptions.
- **Expected Impact**: Reduce false positives by ~3 findings
- **Implementation**: easy, ~30-60 minutes

---

## Detailed Findings

### Top 20 Rules by Frequency

| Rank | Rule | Findings | Sites | Avg Confidence | WCAG |
|------|------|----------|-------|----------------|------|
| 1 | text-contrast | 195 | 23 | 0.8 | 1.4.3, 1.4.6 |
| 2 | target-size | 140 | 19 | 0.7 | 2.5.5, 2.5.8 |
| 3 | focus-appearance | 131 | 25 | 0.6 | 2.4.11, 2.4.7 |
| 4 | link-in-text-block | 93 | 21 | 0.7 | 1.4.1 |
| 5 | label-control | 87 | 22 | 0.9 | 1.3.1, 3.3.2 |
| 6 | link-name | 69 | 21 | 0.9 | 2.4.4, 4.1.2 |
| 7 | img-alt | 53 | 15 | 0.9 | 1.1.1 |
| 8 | redundant-entry | 48 | 22 | 0.7 | 3.3.7 |
| 9 | button-name | 46 | 19 | 0.9 | 4.1.2 |
| 10 | heading-order | 46 | 22 | 0.8 | 1.3.1, 2.4.6 |
| 11 | accessible-authentication-minimum | 23 | 16 | 0.7 | 3.3.8 |
| 12 | aria-hidden-focus | 21 | 15 | 0.8 | 1.3.1, 4.1.2 |
| 13 | skip-link | 18 | 18 | 0.8 | 2.4.1 |
| 14 | document-title | 16 | 16 | 0.9 | 2.4.2 |
| 15 | html-has-lang | 11 | 11 | 0.9 | 3.1.1 |

---

## Analysis Metadata

- **Validated Findings**: 596 / 997 (59.8%)
- **Batch File**: mock-batch-scan.json
- **Validation File**: manual-validation-completed.csv
- **Comparison File**: mock-baseline-comparison.json
- **Sites Compared**: 10

---

*Report generated by AccessInsight Analysis Pipeline*