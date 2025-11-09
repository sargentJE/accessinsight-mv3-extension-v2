# AccessInsight Integration Testing Report

**Generated**: 2025-11-06T10:27:26.297Z
**Analysis Date**: 2025-11-06T10:26:54.763Z

---

## Executive Summary

**Overall Accuracy**:
- Precision: **86.1%**
- Recall: **100.0%**
- F1 Score: **92.5%**
- False Positive Rate: **13.9%**

**Testing Coverage**:
- Sites Tested: **15**
- Total Findings: **438**
- Avg Findings/Site: **29.2**
- Avg Scan Time: **209ms**

**Comparison with axe-core**:
- AccessInsight: **278** findings
- axe-core: **153** issues
- Ratio: **1.82x**

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
| ecommerce | 6 | 30.3 | 255ms |
| government | 8 | 28.8 | 179ms |
| news | 1 | 26 | 174ms |

### By Confidence Level

| Confidence | Findings | Rules | Sites |
|------------|----------|-------|-------|
| 0.9 | 128 | 6 | 15 |
| 0.8 | 138 | 4 | 15 |
| 0.7 | 128 | 4 | 14 |
| 0.6 | 44 | 1 | 10 |

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
| 🟠 link-in-text-block | FAIR | 67% | 31% | 13 |
| 🟡 heading-order | GOOD | 75% | 24% | 17 |
| 🟡 link-name | GOOD | 83% | 16% | 31 |
| 🟡 button-name | GOOD | 83% | 17% | 18 |
| 🟡 label-control | GOOD | 85% | 15% | 33 |
| 🟡 text-contrast | GOOD | 90% | 9% | 96 |
| 🟢 target-size | EXCELLENT | 92% | 8% | 26 |
| 🟢 img-alt | EXCELLENT | 94% | 6% | 33 |

---

## False Positive Patterns

**Total Patterns Identified**: 5
**Critical Patterns**: 2

### Top Patterns

#### 1. text-contrast [P1]

- **Frequency**: 9 occurrences
- **Sites Affected**: 6
- **Avg Confidence**: 0.8
- **Impact Score**: 46

**Recommendation**: Rule "text-contrast" has 9 false positives across 6 sites. Patterns are diverse. Review rule logic for over-flagging. Consider lowering confidence from 0.8 or adding exceptions.

#### 2. label-control [P1]

- **Frequency**: 5 occurrences
- **Sites Affected**: 5
- **Avg Confidence**: 0.9
- **Impact Score**: 35

**Recommendation**: Rule "label-control" has 5 false positives across 5 sites. Patterns are diverse. Review rule logic for over-flagging. Consider lowering confidence from 0.9 or adding exceptions.

#### 3. link-name [P2]

- **Frequency**: 5 occurrences
- **Sites Affected**: 4
- **Avg Confidence**: 0.9
- **Impact Score**: 22

**Recommendation**: Rule "link-name" has 5 false positives across 4 sites. Patterns are diverse. Review rule logic for over-flagging. Consider lowering confidence from 0.9 or adding exceptions.

#### 4. heading-order [P2]

- **Frequency**: 4 occurrences
- **Sites Affected**: 3
- **Avg Confidence**: 0.8
- **Impact Score**: 17

**Recommendation**: Rule "heading-order" has 4 false positives across 3 sites. Patterns are diverse. Review rule logic for over-flagging. Consider lowering confidence from 0.8 or adding exceptions.

#### 5. button-name [P2]

- **Frequency**: 3 occurrences
- **Sites Affected**: 3
- **Avg Confidence**: 0.9
- **Impact Score**: 15

**Recommendation**: Rule "button-name" has 3 false positives across 3 sites. Patterns are diverse. Review rule logic for over-flagging. Consider lowering confidence from 0.9 or adding exceptions.

---

## Confidence Accuracy

| Confidence | Expected | Actual | Assessment | Sample Size |
|------------|----------|--------|------------|-------------|
| 0.9 | 90% | 85% | ⚠️ MINOR_ADJUSTMENT | 125 |
| 0.8 | 80% | 83% | ✅ ACCURATE | 127 |
| 0.7 | 70% | 79% | ⚠️ MINOR_ADJUSTMENT | 42 |

### Adjustment Recommendations

- **0.9**: Confidence 0.9 is close but could be adjusted to 0.85 for better accuracy
- **0.7**: Confidence 0.7 is close but could be adjusted to 0.79 for better accuracy

---

## Tool Comparison

### AccessInsight vs axe-core

| Metric | AccessInsight | axe-core |
|--------|---------------|----------|
| Total Findings | 278 | 153 |
| Avg per Site | 28 | 15 |
| Avg Scan Time | 193ms | N/A |

### Key Insights

✅ **AccessInsight finds more issues**: AccessInsight finds 1.82x more issues than axe-core on average. This suggests broader rule coverage or more sensitive detection.

✅ **Fast scanning**: Average scan time of 193ms is excellent. Well within target of <500ms per page.

⚠️ **Coverage gaps identified**: AccessInsight misses some issues that axe-core finds. Top gaps: link-name, text-contrast. Consider enhancing these rules.

✅ **Unique coverage**: AccessInsight detects issues axe-core doesn't. Unique rules: img-alt, heading-order, link-in-text-block. Provides complementary value.

### Coverage Gaps

**What axe finds but AccessInsight misses**:

- link-name (2 sites)
- text-contrast (1 sites)

**Unique to AccessInsight**:

- img-alt (8 sites)
- heading-order (7 sites)
- link-in-text-block (7 sites)
- accessible-authentication-minimum (7 sites)
- target-size (7 sites)

---

## Recommendations

### Prioritized Action Items

#### P1 Priority (3 items)

**1. rule_logic_fix: text-contrast**

- **Issue**: 9 false positives across 6 sites
- **Recommendation**: Rule "text-contrast" has 9 false positives across 6 sites. Patterns are diverse. Review rule logic for over-flagging. Consider lowering confidence from 0.8 or adding exceptions.
- **Expected Impact**: Reduce false positives by ~9 findings
- **Implementation**: easy, ~30-60 minutes

**2. rule_logic_fix: label-control**

- **Issue**: 5 false positives across 5 sites
- **Recommendation**: Rule "label-control" has 5 false positives across 5 sites. Patterns are diverse. Review rule logic for over-flagging. Consider lowering confidence from 0.9 or adding exceptions.
- **Expected Impact**: Reduce false positives by ~5 findings
- **Implementation**: easy, ~30-60 minutes

**3. rule_improvement: link-in-text-block**

- **Issue**: Low precision: 67% (4 FP out of 13 validated)
- **Recommendation**: Rule needs improvement. 4 false positives out of 13 validated findings (31% FP rate). Review detection logic.
- **Expected Impact**: Improve precision from 67% to 75%+
- **Implementation**: medium, ~1-2 hours

#### P2 Priority (3 items)

**1. rule_logic_fix: link-name**

- **Issue**: 5 false positives across 4 sites
- **Recommendation**: Rule "link-name" has 5 false positives across 4 sites. Patterns are diverse. Review rule logic for over-flagging. Consider lowering confidence from 0.9 or adding exceptions.
- **Expected Impact**: Reduce false positives by ~5 findings
- **Implementation**: easy, ~30-60 minutes

**2. rule_logic_fix: heading-order**

- **Issue**: 4 false positives across 3 sites
- **Recommendation**: Rule "heading-order" has 4 false positives across 3 sites. Patterns are diverse. Review rule logic for over-flagging. Consider lowering confidence from 0.8 or adding exceptions.
- **Expected Impact**: Reduce false positives by ~4 findings
- **Implementation**: easy, ~30-60 minutes

**3. rule_logic_fix: button-name**

- **Issue**: 3 false positives across 3 sites
- **Recommendation**: Rule "button-name" has 3 false positives across 3 sites. Patterns are diverse. Review rule logic for over-flagging. Consider lowering confidence from 0.9 or adding exceptions.
- **Expected Impact**: Reduce false positives by ~3 findings
- **Implementation**: easy, ~30-60 minutes

---

## Detailed Findings

### Top 20 Rules by Frequency

| Rank | Rule | Findings | Sites | Avg Confidence | WCAG |
|------|------|----------|-------|----------------|------|
| 1 | text-contrast | 96 | 12 | 0.8 | 1.4.3, 1.4.6 |
| 2 | target-size | 53 | 9 | 0.7 | 2.5.5, 2.5.8 |
| 3 | focus-appearance | 44 | 10 | 0.6 | 2.4.11, 2.4.7 |
| 4 | link-in-text-block | 38 | 9 | 0.7 | 1.4.1 |
| 5 | label-control | 33 | 7 | 0.9 | 1.3.1, 3.3.2 |
| 6 | img-alt | 33 | 10 | 0.9 | 1.1.1 |
| 7 | link-name | 32 | 9 | 0.9 | 2.4.4, 4.1.2 |
| 8 | heading-order | 24 | 12 | 0.8 | 1.3.1, 2.4.6 |
| 9 | redundant-entry | 23 | 9 | 0.7 | 3.3.7 |
| 10 | button-name | 18 | 10 | 0.9 | 4.1.2 |
| 11 | accessible-authentication-minimum | 14 | 11 | 0.7 | 3.3.8 |
| 12 | aria-hidden-focus | 10 | 8 | 0.8 | 1.3.1, 4.1.2 |
| 13 | skip-link | 8 | 8 | 0.8 | 2.4.1 |
| 14 | html-has-lang | 7 | 7 | 0.9 | 3.1.1 |
| 15 | document-title | 5 | 5 | 0.9 | 2.4.2 |

---

## Analysis Metadata

- **Validated Findings**: 300 / 438 (68.5%)
- **Batch File**: mock-batch-scan.json
- **Validation File**: manual-validation-completed.csv
- **Comparison File**: mock-baseline-comparison.json
- **Sites Compared**: 10

---

*Report generated by AccessInsight Analysis Pipeline*