# AccessInsight Analysis Pipeline - Usage Guide

## Overview

The AccessInsight Analysis Pipeline is a comprehensive system for analyzing accessibility scan results, comparing with baseline tools, and generating actionable recommendations for engine tuning.

**Pipeline Components**:
1. **Mock Data Generator** - Generate realistic test data
2. **Metrics Calculator** - Calculate comprehensive metrics
3. **Pattern Analyzer** - Identify systematic patterns and issues
4. **Baseline Comparator** - Compare with axe-core
5. **Report Generator** - Generate comprehensive reports

## Prerequisites

### Required
- Node.js 16+
- Playwright (for real website scanning)

### Optional
- CSV editor (for manual validation)
- Markdown viewer (for reports)

## Quick Start

### End-to-End Pipeline (Mock Data)

Run the complete pipeline with mock data in 60 seconds:

```bash
# 1. Generate mock data
node tests/integration/generate-mock-data.js --subset 15 --baseline --validation 100

# 2. Populate validation data (simulate manual validation)
node tests/integration/populate-validation.js

# 3. Calculate metrics
node tests/integration/calculate-metrics.js --validation manual-validation-completed.csv

# 4. Analyze patterns
node tests/integration/analyze-patterns.js --validation manual-validation-completed.csv

# 5. Compare with baseline
node tests/integration/compare-baseline.js

# 6. Generate final report
node tests/integration/generate-report.js --format all
```

**Output**: `tests/integration/results/integration-report-latest.md`

---

## Component Details

### 1. Mock Data Generator

**Purpose**: Generate realistic scan results for testing the analysis pipeline.

**Usage**:
```bash
# Generate data for 10 sites
node tests/integration/generate-mock-data.js --subset 10

# Generate with baseline comparison
node tests/integration/generate-mock-data.js --subset 15 --baseline

# Generate with validation template
node tests/integration/generate-mock-data.js --subset 10 --baseline --validation 100
```

**Options**:
- `--subset N` - Number of sites to generate (default: 10)
- `--baseline` - Generate axe-core comparison data
- `--validation N` - Generate validation template with N findings

**Output Files**:
- `results/mock-batch-scan.json` - Batch scan results
- `results/mock-baseline-comparison.json` - Comparison data (if --baseline)
- `results/manual-validation-template.csv` - Validation template (if --validation)

**Example Output**:
```json
{
  "metadata": {
    "version": "1.0.0",
    "timestamp": "2025-11-06T10:00:00.000Z",
    "totalSites": 10,
    "totalFindings": 290
  },
  "results": [
    {
      "siteName": "example.gov",
      "url": "https://example.gov",
      "findings": [...]
    }
  ]
}
```

---

### 2. Metrics Calculator

**Purpose**: Calculate comprehensive metrics from scan results and validation data.

**Usage**:
```bash
# Calculate metrics without validation
node tests/integration/calculate-metrics.js

# Calculate with validation data for accuracy metrics
node tests/integration/calculate-metrics.js --validation manual-validation-completed.csv

# Specify custom batch file
node tests/integration/calculate-metrics.js --batch my-scan-results.json --validation my-validation.csv
```

**Options**:
- `--batch FILE` - Batch scan results file (default: mock-batch-scan.json)
- `--validation FILE` - Manual validation CSV file (optional)

**Output Files**:
- `results/metrics-latest.json` - Comprehensive metrics
- `results/metrics-TIMESTAMP.json` - Timestamped version

**Metrics Calculated**:
- Overall: sites, findings, scan times
- By category: e-commerce, government, news, etc.
- By rule: frequency, confidence, WCAG criteria
- By confidence: 0.6, 0.7, 0.8, 0.9
- Accuracy: precision, recall, F1 score, FP rate (if validation provided)

**Example Output**:
```
📊 Summary:
   Total Sites: 15
   Total Findings: 438
   Avg Findings/Site: 29.2
   Avg Scan Time: 209ms

🎯 Accuracy Metrics:
   Precision: 86.1%
   Recall: 100.0%
   F1 Score: 92.5%
   False Positive Rate: 13.9%
```

---

### 3. Pattern Analyzer

**Purpose**: Identify systematic patterns in false positives, false negatives, and rule performance.

**Usage**:
```bash
# Analyze patterns with validation data
node tests/integration/analyze-patterns.js --validation manual-validation-completed.csv

# Specify custom files
node tests/integration/analyze-patterns.js \
  --batch my-scan.json \
  --validation my-validation.csv
```

**Options**:
- `--batch FILE` - Batch scan results (default: mock-batch-scan.json)
- `--validation FILE` - Manual validation CSV (required)

**Output Files**:
- `results/pattern-analysis-latest.json` - Pattern analysis
- `results/pattern-analysis-TIMESTAMP.json` - Timestamped version

**Analyses Performed**:
1. **False Positive Patterns**: Common characteristics of incorrect flags
2. **Confidence Accuracy**: Expected vs actual precision per confidence level
3. **Rule Performance**: EXCELLENT/GOOD/FAIR/POOR classification
4. **Category Correlation**: Performance by site type
5. **Recommendations**: Prioritized tuning actions (P0/P1/P2/P3)

**Statistical Thresholds**:
- Minimum sample size: 50 overall, 10 per rule, 20 per confidence level
- Pattern significance: ≥5 occurrences OR ≥3 sites affected
- Pattern critical: ≥10 occurrences OR ≥5 sites affected

**Performance Classification**:
- **EXCELLENT**: Precision ≥90%, Recall ≥80%
- **GOOD**: Precision ≥75%, Recall ≥60%
- **FAIR**: Precision ≥60%, Recall ≥40%
- **POOR**: Below fair thresholds

**Example Output**:
```
🔍 False Positive Patterns:
   1. [P1] text-contrast: 9 occurrences, 6 sites
   2. [P1] label-control: 5 occurrences, 5 sites

📈 Rule Performance:
   1. img-alt: EXCELLENT (precision: 94%, FP rate: 6%)
   2. text-contrast: GOOD (precision: 90%, FP rate: 9%)
   3. link-in-text-block: FAIR (precision: 67%, FP rate: 31%)
```

---

### 4. Baseline Comparator

**Purpose**: Compare AccessInsight findings with axe-core to identify coverage gaps and overlaps.

**Usage**:
```bash
# Compare with default comparison file
node tests/integration/compare-baseline.js

# Specify custom comparison file
node tests/integration/compare-baseline.js --comparison my-baseline-comparison.json
```

**Options**:
- `--comparison FILE` - Baseline comparison file (default: mock-baseline-comparison.json)

**Output Files**:
- `results/comparison-analysis-latest.json` - Comparison analysis
- `results/comparison-analysis-TIMESTAMP.json` - Timestamped version

**Analyses Performed**:
1. **Tool Overlap**: Total findings comparison and ratios
2. **Coverage Gaps**: What each tool misses
3. **Unique Rules**: What AccessInsight finds that axe-core doesn't
4. **Performance**: Scan times and efficiency
5. **Insights**: Automated interpretation of results

**Example Output**:
```
📊 Summary:
   AccessInsight: 278 findings (28 avg/site)
   axe-core: 153 issues (15 avg/site)
   Ratio: 1.82x

🔍 Coverage Gaps:
   What axe finds but we don't:
   - link-name (2 sites)
   - text-contrast (1 site)

   Unique to AccessInsight:
   - img-alt (8 sites)
   - target-size (7 sites)
```

---

### 5. Report Generator

**Purpose**: Generate comprehensive reports in multiple formats.

**Usage**:
```bash
# Generate markdown report
node tests/integration/generate-report.js --format markdown

# Generate JSON report
node tests/integration/generate-report.js --format json

# Generate both formats
node tests/integration/generate-report.js --format all

# Specify custom input files
node tests/integration/generate-report.js \
  --format all \
  --metrics my-metrics.json \
  --patterns my-patterns.json \
  --comparison my-comparison.json
```

**Options**:
- `--format FORMAT` - Output format: markdown, json, or all (default: markdown)
- `--metrics FILE` - Metrics file (default: metrics-latest.json)
- `--patterns FILE` - Pattern analysis file (default: pattern-analysis-latest.json)
- `--comparison FILE` - Comparison analysis file (default: comparison-analysis-latest.json)

**Output Files**:
- `results/integration-report-latest.md` - Markdown report
- `results/integration-report-latest.json` - JSON report
- `results/integration-report-TIMESTAMP.md` - Timestamped versions
- `results/integration-report-TIMESTAMP.json`

**Report Sections**:
1. Executive Summary - Key metrics at a glance
2. Overall Metrics - By category, confidence, quality
3. Rule Performance - Detailed analysis with badges
4. False Positive Patterns - Systematic issues
5. Confidence Accuracy - Calibration assessment
6. Tool Comparison - vs axe-core
7. Recommendations - Prioritized action items (P0/P1/P2/P3)
8. Detailed Findings - Top rules by frequency

**Example Output**:
```markdown
# AccessInsight Integration Testing Report

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
```

---

## Real Website Testing

For testing with real websites (requires browser automation environment):

### Setup

```bash
# Install Playwright
npm install playwright

# Or use system Playwright
sudo apt-get install playwright
```

### Batch Scanning

Create a site list file `sites.json`:

```json
[
  {
    "siteName": "example.gov",
    "url": "https://www.example.gov",
    "category": "government",
    "expectedQuality": "good"
  },
  {
    "siteName": "shop.example",
    "url": "https://shop.example.com",
    "category": "ecommerce",
    "expectedQuality": "medium"
  }
]
```

Run batch scan:

```bash
node tests/integration/batch-scan.js --sites sites.json --output real-scan-results.json
```

### Baseline Comparison

Run comparison with axe-core:

```bash
node tests/integration/run-baseline-comparison.js \
  --sites sites.json \
  --output real-baseline-comparison.json
```

### Manual Validation

1. **Generate validation template**:
   ```bash
   node tests/integration/calculate-metrics.js --batch real-scan-results.json
   # Creates manual-validation-template.csv
   ```

2. **Manual validation process**:
   - Open `manual-validation-template.csv` in spreadsheet editor
   - For each finding, set classification:
     - `true_positive` - Correctly identified issue
     - `false_positive` - Incorrectly flagged
     - `needs_review` - Uncertain, needs expert review
   - Add notes in notes column
   - Save as `manual-validation-completed.csv`

3. **Run analysis with validation**:
   ```bash
   node tests/integration/calculate-metrics.js \
     --batch real-scan-results.json \
     --validation manual-validation-completed.csv
   ```

---

## Manual Validation CSV Format

**Required columns**:
- `finding_id` - Unique identifier (auto-generated)
- `site_name` - Site name
- `rule` - Rule ID
- `selector` - CSS selector
- `message` - Finding message
- `confidence` - Confidence level (0.6-0.9)
- `classification` - Your classification (true_positive, false_positive, needs_review)
- `notes` - Optional notes

**Example**:
```csv
finding_id,site_name,rule,selector,message,confidence,classification,notes
finding-1,example.gov,img-alt,img.logo,Image missing alt text,0.9,true_positive,Clear violation
finding-2,example.gov,focus-appearance,a.nav-link,Focus indicator may not be visible,0.6,false_positive,Has visible outline
```

---

## Workflow Examples

### Scenario 1: Testing Mock Data (Development)

**Goal**: Validate the analysis pipeline works correctly.

```bash
# Generate mock data
node tests/integration/generate-mock-data.js --subset 15 --baseline --validation 100

# Simulate manual validation
node tests/integration/populate-validation.js

# Run full pipeline
node tests/integration/calculate-metrics.js --validation manual-validation-completed.csv
node tests/integration/analyze-patterns.js --validation manual-validation-completed.csv
node tests/integration/compare-baseline.js
node tests/integration/generate-report.js --format all

# View report
cat tests/integration/results/integration-report-latest.md
```

**Time**: ~60 seconds
**Output**: Comprehensive report with mock data

---

### Scenario 2: Initial Real-World Assessment (Manual)

**Goal**: Get first real-world accuracy baseline.

```bash
# 1. Scan 20 real websites (requires browser environment)
node tests/integration/batch-scan.js --sites sites.json --limit 20

# 2. Run baseline comparison
node tests/integration/run-baseline-comparison.js --sites sites.json --limit 20

# 3. Generate validation template
node tests/integration/calculate-metrics.js --batch batch-scan-results.json

# 4. MANUAL: Validate 100-150 findings in CSV
# (Open manual-validation-template.csv, classify findings, save as completed)

# 5. Run analysis pipeline
node tests/integration/calculate-metrics.js --validation manual-validation-completed.csv
node tests/integration/analyze-patterns.js --validation manual-validation-completed.csv
node tests/integration/compare-baseline.js --comparison baseline-comparison-latest.json
node tests/integration/generate-report.js --format all
```

**Time**: 2-3 hours (including manual validation)
**Output**: Real-world accuracy report with actionable recommendations

---

### Scenario 3: Engine Tuning Iteration

**Goal**: Test improvements after rule modifications.

```bash
# 1. Make engine changes based on recommendations
# (Edit engine.js based on previous report)

# 2. Re-scan same websites
node tests/integration/batch-scan.js --sites sites.json --output tuned-scan-results.json

# 3. Re-validate (can reuse some previous validations)
node tests/integration/calculate-metrics.js \
  --batch tuned-scan-results.json \
  --validation manual-validation-completed.csv

# 4. Run analysis
node tests/integration/analyze-patterns.js --validation manual-validation-completed.csv
node tests/integration/generate-report.js --format all

# 5. Compare before/after
diff results/integration-report-before.md results/integration-report-latest.md
```

**Time**: 1-2 hours
**Output**: Before/after comparison showing improvement

---

## Interpreting Results

### Accuracy Metrics

**Precision** (TP / (TP + FP)):
- **≥90%**: Excellent - Very few false positives
- **75-89%**: Good - Acceptable false positive rate
- **60-74%**: Fair - Notable false positives, tune rules
- **<60%**: Poor - High false positive rate, significant tuning needed

**Recall** (TP / (TP + FN)):
- **≥80%**: Excellent - Catches most issues
- **60-79%**: Good - Catches majority of issues
- **40-59%**: Fair - Misses significant issues
- **<40%**: Poor - Misses too many issues

**F1 Score** (Harmonic mean of precision and recall):
- **≥85%**: Excellent overall performance
- **70-84%**: Good overall performance
- **55-69%**: Fair, needs improvement
- **<55%**: Poor, significant work needed

**False Positive Rate** (FP / (TP + FP)):
- **<10%**: Excellent
- **10-24%**: Good
- **25-39%**: Fair
- **≥40%**: Poor - High user frustration risk

### Rule Performance

**EXCELLENT** (Precision ≥90%):
- Keep as-is
- Document any known limitations
- Use as reference for other rules

**GOOD** (Precision 75-89%):
- Generally solid
- Minor tweaks may improve
- Document edge cases

**FAIR** (Precision 60-74%):
- Needs improvement
- Review false positive patterns
- Consider lowering confidence
- Add exceptions for common FP cases

**POOR** (Precision <60%):
- Requires significant work
- Consider disabling temporarily
- Redesign detection logic
- May need different approach

### Confidence Accuracy

**ACCURATE** (Actual within ±5% of expected):
- Confidence well-calibrated
- No adjustment needed

**MINOR_ADJUSTMENT** (±5-10%):
- Consider small adjustment
- Monitor in next iteration
- Not critical

**TOO_OPTIMISTIC** (Actual >10% lower):
- Lower confidence level
- Users see more FP than expected
- Reduces trust

**TOO_CONSERVATIVE** (Actual >10% higher):
- Increase confidence level
- Rule performs better than indicated
- Can increase user confidence

### Tool Comparison

**Ratio (AccessInsight / axe-core)**:
- **>1.5x**: Finding significantly more - excellent coverage
- **1.0-1.5x**: Finding somewhat more - good
- **0.8-1.0x**: Similar coverage - complementary
- **<0.8x**: Finding less - review coverage gaps

**Coverage Gaps**:
- High priority: Common rules that axe finds but we don't
- Low priority: Edge cases or AAA-level criteria

**Unique Rules**:
- Demonstrates value beyond axe-core
- Highlight in documentation
- Validate accuracy of unique findings

---

## Troubleshooting

### Issue: "No validation data found"

**Cause**: Validation CSV file missing or incorrect format.

**Solution**:
```bash
# Check file exists
ls -la tests/integration/results/manual-validation-completed.csv

# Check format (should have header row + data)
head -5 tests/integration/results/manual-validation-completed.csv
```

### Issue: "Sample size too small" warnings

**Cause**: Not enough validated findings for statistical significance.

**Solution**:
- Minimum 50 validated findings overall
- Minimum 10 per rule for rule-level analysis
- Minimum 20 per confidence level for confidence analysis
- Validate more findings or combine with previous validation data

### Issue: "Module not found" errors

**Cause**: Node.js path issues or missing dependencies.

**Solution**:
```bash
# Run from project root
cd /path/to/accessinsight-mv3-extension-v2

# Check Node.js version
node --version  # Should be 16+

# Reinstall dependencies if needed
npm install
```

### Issue: Playwright timeout errors

**Cause**: Website slow to load or network issues.

**Solution**:
```bash
# Increase timeout in playwright-helper.js
# Or use retry logic for flaky sites
node tests/integration/batch-scan.js --sites sites.json --timeout 60000
```

### Issue: Report shows all zeros

**Cause**: Input files empty or incorrect format.

**Solution**:
```bash
# Verify input files have data
jq '.results | length' tests/integration/results/mock-batch-scan.json
jq '.comparisons | length' tests/integration/results/mock-baseline-comparison.json

# Re-generate if needed
node tests/integration/generate-mock-data.js --subset 10 --baseline
```

---

## Performance Targets

Based on Phase 8 requirements:

**Scan Performance**:
- **Excellent**: <500ms per page
- **Good**: 500-1000ms per page
- **Acceptable**: 1000-2000ms per page
- **Poor**: >2000ms per page

**Accuracy Targets**:
- **Precision**: ≥75% (goal: 85%+)
- **Recall**: ≥60% (goal: 75%+)
- **F1 Score**: ≥70% (goal: 80%+)
- **False Positive Rate**: <25% (goal: <15%)

**Validation Coverage**:
- **Minimum**: 50 validated findings
- **Good**: 100-200 validated findings
- **Excellent**: 200+ validated findings across diverse sites

---

## Files Reference

### Input Files

| File | Purpose | Format | Required |
|------|---------|--------|----------|
| `sites.json` | Site list for scanning | JSON | For real scanning |
| `mock-batch-scan.json` | Batch scan results | JSON | Yes |
| `mock-baseline-comparison.json` | Comparison data | JSON | For comparison |
| `manual-validation-completed.csv` | Validation classifications | CSV | For accuracy |

### Output Files

| File | Purpose | Format | Generator |
|------|---------|--------|-----------|
| `metrics-latest.json` | Comprehensive metrics | JSON | calculate-metrics.js |
| `pattern-analysis-latest.json` | Pattern analysis | JSON | analyze-patterns.js |
| `comparison-analysis-latest.json` | Baseline comparison | JSON | compare-baseline.js |
| `integration-report-latest.md` | Final report (Markdown) | Markdown | generate-report.js |
| `integration-report-latest.json` | Final report (JSON) | JSON | generate-report.js |

### Helper Files

| File | Purpose |
|------|---------|
| `helpers/data-validator.js` | Input validation and normalization |
| `helpers/playwright-helper.js` | Browser automation |
| `populate-validation.js` | Generate mock validation data |

---

## Next Steps

After completing the analysis pipeline:

1. **Review Report**: Read `integration-report-latest.md` thoroughly
2. **Prioritize P0/P1 Recommendations**: Focus on high-impact improvements
3. **Tune Engine**: Implement recommended fixes in `engine.js`
4. **Re-test**: Run pipeline again to validate improvements
5. **Iterate**: Continue tuning until targets met

**Target Metrics** (from Phase 8):
- Precision: ≥75% (excellent: ≥85%)
- F1 Score: ≥70% (excellent: ≥80%)
- False Positive Rate: <25% (excellent: <15%)
- Scan Time: <500ms per page

---

## Support

For issues or questions:
- Check troubleshooting section above
- Review `ANALYSIS_PIPELINE_ARCHITECTURE.md` for design details
- Review `PATTERN_ANALYZER_DESIGN.md` for algorithm details
- Check logs in `tests/integration/results/`

---

*Last updated: 2025-11-06*
*Version: 1.0.0*
