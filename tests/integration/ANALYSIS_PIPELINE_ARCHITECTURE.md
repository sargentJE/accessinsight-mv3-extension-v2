# Phase 8 Analysis Pipeline - Architecture & Design

## Overview

This analysis pipeline processes integration test results to calculate accuracy metrics, identify patterns, and generate actionable insights for engine tuning.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ANALYSIS PIPELINE                         │
└─────────────────────────────────────────────────────────────┘

Input Layer:
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  Batch Scan      │  │  Baseline        │  │  Manual          │
│  Results         │  │  Comparison      │  │  Validation      │
│  (JSON)          │  │  (JSON)          │  │  (CSV/Excel)     │
└──────────────────┘  └──────────────────┘  └──────────────────┘
         │                     │                      │
         └─────────────────────┴──────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │  Data Validator   │
                    │  & Normalizer     │
                    └─────────┬─────────┘
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
    ┌────▼────┐        ┌─────▼─────┐      ┌──────▼──────┐
    │ Metrics │        │  Pattern  │      │ Comparison  │
    │ Calculator│       │  Analyzer │      │  Analyzer   │
    └────┬────┘        └─────┬─────┘      └──────┬──────┘
         │                   │                    │
         └────────────────────┴────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │  Report Generator │
                    └─────────┬─────────┘
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
    ┌────▼────┐        ┌─────▼─────┐      ┌──────▼──────┐
    │  HTML   │        │ Markdown  │      │    JSON     │
    │ Report  │        │  Report   │      │   Export    │
    └─────────┘        └───────────┘      └─────────────┘
```

## Components

### 1. Mock Data Generator
**Purpose**: Generate realistic scan results for testing analysis pipeline
**Input**: Configuration (number of sites, findings distribution)
**Output**: Synthetic batch-scan-results.json and baseline-comparison.json

### 2. Data Validator & Normalizer
**Purpose**: Validate input data and normalize formats
**Functions**:
- Validate JSON schema
- Handle missing fields
- Normalize timestamps
- Merge multiple data sources

### 3. Metrics Calculator
**Purpose**: Calculate accuracy metrics
**Metrics**:
- Precision (TP / (TP + FP))
- Recall (TP / (TP + FN))
- False Positive Rate (FP / (FP + TN))
- F1 Score (harmonic mean of precision/recall)
- Confidence level distribution
- Finding frequency by rule

### 4. Pattern Analyzer
**Purpose**: Identify common patterns in findings
**Analysis**:
- False positive patterns (by rule, by site type)
- False negative patterns (missed issues)
- Rule performance correlation
- Site category correlation
- Confidence level accuracy

### 5. Comparison Analyzer
**Purpose**: Compare AccessInsight with axe-core
**Analysis**:
- Finding overlap
- Unique to each tool
- Coverage comparison
- Performance comparison
- Rule mapping

### 6. Report Generator
**Purpose**: Create human-readable reports
**Formats**:
- HTML (interactive, charts)
- Markdown (GitHub-friendly)
- JSON (machine-readable)

### 7. Manual Validation Toolkit
**Purpose**: Support human validation process
**Components**:
- Validation guide
- Classification templates
- Spreadsheet generators
- Review checklists

## Data Formats

### Batch Scan Results Format
```json
{
  "metadata": {
    "timestamp": "ISO-8601",
    "totalSites": 40,
    "successfulScans": 38
  },
  "results": [
    {
      "siteName": "USA.gov",
      "url": "https://www.usa.gov",
      "category": "government",
      "findings": [...],
      "scanTime": 450,
      "elementCount": 1234
    }
  ]
}
```

### Manual Validation Format
```csv
site_name,finding_id,rule,classification,notes
"USA.gov","001","img-alt","true_positive","Missing alt on logo"
"USA.gov","002","link-name","false_positive","Link has aria-label"
```

### Metrics Output Format
```json
{
  "overall": {
    "precision": 0.78,
    "recall": 0.65,
    "f1Score": 0.71,
    "falsePositiveRate": 0.22
  },
  "byRule": {
    "img-alt": {
      "precision": 0.95,
      "recall": 0.88,
      "truePositives": 42,
      "falsePositives": 3
    }
  }
}
```

## Usage Flow

### Phase 8 Week 2 (Data Collection)
```bash
# Generate mock data for testing
node tests/integration/generate-mock-data.js

# Or use real data (when available)
node tests/integration/batch-scan.js

# Validate collected data
node tests/integration/validate-data.js
```

### Phase 8 Week 3 (Analysis)
```bash
# Calculate metrics
node tests/integration/calculate-metrics.js

# Analyze patterns
node tests/integration/analyze-patterns.js

# Compare with baseline
node tests/integration/compare-baseline.js

# Generate reports
node tests/integration/generate-report.js --format html
node tests/integration/generate-report.js --format markdown
```

## Quality Standards

### Code Quality
- ✅ Full error handling
- ✅ Input validation
- ✅ Clear variable names
- ✅ Comprehensive comments
- ✅ Modular design
- ✅ Testable functions

### Data Quality
- ✅ Schema validation
- ✅ Type checking
- ✅ Range validation
- ✅ Missing data handling
- ✅ Duplicate detection

### Output Quality
- ✅ Clear visualizations
- ✅ Actionable insights
- ✅ Statistical significance
- ✅ Confidence intervals
- ✅ Interpretation guidance

## Success Criteria

### Functional Requirements
- [x] Generates realistic mock data
- [ ] Validates all input formats
- [ ] Calculates all key metrics correctly
- [ ] Identifies patterns accurately
- [ ] Produces readable reports
- [ ] Handles edge cases gracefully

### Non-Functional Requirements
- [ ] Processes 40 sites in < 10 seconds
- [ ] Clear error messages
- [ ] Comprehensive logging
- [ ] Machine-readable outputs
- [ ] Human-readable reports

## Files to Create

1. `tests/integration/generate-mock-data.js` - Mock data generator
2. `tests/integration/helpers/data-validator.js` - Input validation
3. `tests/integration/calculate-metrics.js` - Metrics calculation
4. `tests/integration/analyze-patterns.js` - Pattern analysis
5. `tests/integration/compare-baseline.js` - Baseline comparison
6. `tests/integration/generate-report.js` - Report generation
7. `tests/integration/helpers/report-templates.js` - HTML/MD templates
8. `docs/MANUAL_VALIDATION_GUIDE.md` - Human validation guide
9. `tests/integration/templates/` - Validation templates directory

## Timeline

- **Task 1**: Mock Data Generator (1 hour)
- **Task 2**: Data Validator (1 hour)
- **Task 3**: Metrics Calculator (1.5 hours)
- **Task 4**: Pattern Analyzer (1.5 hours)
- **Task 5**: Comparison Analyzer (1 hour)
- **Task 6**: Report Generator (2 hours)
- **Task 7**: Manual Validation Toolkit (1 hour)
- **Task 8**: Testing & Documentation (1 hour)

**Total Estimated Time**: 10 hours

## Next Steps

Build components in order:
1. Mock Data Generator (foundation)
2. Data Validator (ensure data quality)
3. Metrics Calculator (core analysis)
4. Pattern Analyzer (insights)
5. Comparison Analyzer (benchmarking)
6. Report Generator (outputs)
7. Manual Validation Toolkit (human support)
8. Integration Testing (validate pipeline)
