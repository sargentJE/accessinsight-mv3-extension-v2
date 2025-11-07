# AccessInsight Test Executor Guide

Complete guide for using the automated test executor (`run-tests.sh`) for Phase 8 Real-World Validation.

---

## Quick Start

```bash
# 1. Check your environment
./run-tests.sh check

# 2. Run quick validation (recommended for first run)
./run-tests.sh quick

# 3. View results
cat results/reports/VALIDATION-REPORT-*.md
```

---

## Overview

The test executor (`run-tests.sh`) is a comprehensive orchestration tool that automates the entire testing workflow:

- ✅ Environment verification
- ✅ Dependency management
- ✅ Branch and infrastructure setup
- ✅ Unit test execution (315 tests across 46 rules)
- ✅ Integration test execution (browser-based scanning)
- ✅ Analysis pipeline (metrics, patterns, baseline comparison)
- ✅ Result evaluation and reporting

---

## Installation & Setup

### Prerequisites

- **Node.js 18+** ([download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Git**
- **Chrome/Chromium** (Playwright will install if missing)

### Initial Setup

```bash
# 1. Verify environment
./run-tests.sh check

# 2. The script will guide you through:
#    - Installing dependencies
#    - Setting up Playwright browsers
#    - Accessing test infrastructure
```

---

## Usage

### Basic Syntax

```bash
./run-tests.sh [mode] [options]
```

### Available Modes

| Mode | Sites | Duration | Use Case |
|------|-------|----------|----------|
| **quick** | 10 | ~10 min | Development, CI/CD, rapid feedback |
| **standard** | 20 | ~20 min | Pre-release, feature validation |
| **full** | 40 | ~40 min | Final validation, release candidate |
| **unit** | N/A | ~5 min | Unit tests only (315 tests) |
| **integration** | Custom | Variable | Integration tests only |
| **pipeline** | N/A | ~5 min | Analysis pipeline on existing results |

### Common Options

| Option | Description |
|--------|-------------|
| `--with-baseline` | Include axe-core baseline comparison |
| `--sites N` | Override number of sites to test |
| `--categories LIST` | Comma-separated categories (government,news,etc) |
| `--output FILE` | Specify custom output file path |
| `--skip-install` | Skip dependency installation |
| `--skip-unit` | Skip unit tests |
| `--skip-integration` | Skip integration tests |
| `--skip-pipeline` | Skip analysis pipeline |
| `--dry-run` | Show what would be executed (no changes) |
| `--help, -h` | Show help message |

---

## Examples

### Quick Validation

Best for rapid feedback during development:

```bash
# Run quick validation (10 sites, government + ecommerce)
./run-tests.sh quick

# View results
cat results/reports/VALIDATION-REPORT-*.md
```

### Standard Validation

Good balance of coverage and time:

```bash
# Run standard validation (20 sites)
./run-tests.sh standard

# With baseline comparison against axe-core
./run-tests.sh standard --with-baseline
```

### Full Validation

Comprehensive testing for release:

```bash
# Run full validation (all 40 sites)
./run-tests.sh full

# Custom number of sites
./run-tests.sh full --sites 30
```

### Unit Tests Only

Run just the unit test suite:

```bash
# Run 315 unit tests across 46 rules
./run-tests.sh unit
```

### Integration Tests Only

Run browser-based scanning without pipeline:

```bash
# Run integration tests with custom categories
./run-tests.sh integration --categories "government,news,education"

# Custom number of sites
./run-tests.sh integration --sites 15 --output results/custom-scan.json
```

### Pipeline Only

Run analysis pipeline on existing scan results:

```bash
# Process existing batch results
./run-tests.sh pipeline results/batch-results.json

# Or specify a custom results file
./run-tests.sh pipeline results/my-scan-20250107.json
```

### Custom Workflows

Skip specific steps:

```bash
# Run without unit tests
./run-tests.sh quick --skip-unit

# Run without pipeline (just collect data)
./run-tests.sh standard --skip-pipeline

# Skip dependency installation (already installed)
./run-tests.sh quick --skip-install
```

### Dry Run

Preview what would happen without making changes:

```bash
# See execution plan
./run-tests.sh full --dry-run
```

---

## Understanding the Output

### Execution Flow

When you run the test executor, it follows this flow:

```
1. Environment Check
   ├─ Verify Node.js 18+
   ├─ Verify npm
   ├─ Verify git
   ├─ Check dependencies
   └─ Check Playwright browsers

2. Test Infrastructure Setup
   ├─ Check if tests exist in current branch
   ├─ Option A: Merge test branch
   ├─ Option B: Switch to test branch
   └─ Option C: Use existing if available

3. Dependency Installation
   ├─ npm install (if needed)
   └─ Playwright browser installation

4. Unit Tests (if available)
   └─ Run 315 tests across 46 accessibility rules

5. Integration Tests
   ├─ Launch Playwright with Chromium
   ├─ Load extension
   ├─ Scan N websites
   └─ Export results to JSON

6. Analysis Pipeline
   ├─ Step 1: Calculate metrics (precision, recall, F1)
   ├─ Step 2: Analyze patterns (false positives/negatives)
   ├─ Step 3: Baseline comparison (vs axe-core) [optional]
   └─ Step 4: Generate comprehensive report

7. Result Evaluation
   ├─ Compare against Phase 8 success criteria
   └─ Provide recommendations
```

### Output Files

All results are saved to the `results/` directory:

```
results/
├── batch-results-20250107_140630.json     # Raw scan results
├── reports/
│   ├── metrics-20250107_140630.json       # Calculated metrics
│   ├── patterns-20250107_140630.json      # Pattern analysis
│   ├── baseline-comparison-20250107.json  # Baseline comparison
│   └── VALIDATION-REPORT-20250107.md      # Final report ⭐
└── baseline/                               # axe-core results (if available)
    ├── site1-baseline.json
    └── site2-baseline.json
```

### Reading the Report

The validation report (`VALIDATION-REPORT-*.md`) contains:

1. **Executive Summary** - Pass/fail determination
2. **Metrics** - Precision, recall, F1 score, false positive rate
3. **Per-Rule Analysis** - Performance breakdown by rule
4. **Pattern Analysis** - Common false positive/negative patterns
5. **Baseline Comparison** - vs axe-core (if available)
6. **Recommendations** - Next steps based on results

---

## Phase 8 Success Criteria

The test executor evaluates results against these thresholds:

### ✅ Passing Criteria

- **Precision ≥ 75%** (true positives / all reported)
- **Recall ≥ 60%** (true positives / all actual violations)
- **False Positive Rate < 25%**
- **Minimum 10 sites tested**

**Next Step**: Proceed to Phase 9 (Performance Optimization)

### ⚠️ Tuning Required

- **Precision 60-75%** OR **Recall 45-60%**
- **Estimated effort**: 4-8 hours of engine tuning

**Next Step**: Adjust problematic rules and recalibrate

### ❌ Significant Rework Needed

- **Precision < 60%** OR **Recall < 45%**
- **Estimated effort**: 1-2 weeks

**Next Step**: Return to unit testing and rule development

---

## Test Categories

The test executor organizes websites into categories:

| Category | Sites | Priority | Complexity | WCAG Target |
|----------|-------|----------|------------|-------------|
| **Government** | 8 | High | Medium | AA |
| **E-commerce** | 6 | High | High | AA |
| **News** | 6 | Medium | High | AA |
| **Education** | 5 | High | Medium | AA |
| **SaaS** | 6 | Medium | High | AA |
| **Accessibility** | 4 | High | Low | AAA |
| **CMS/Small Biz** | 5 | Low | Medium | A |

### Using Categories

```bash
# Test specific categories
./run-tests.sh integration --categories "government,education"

# Test high-priority categories
./run-tests.sh quick  # Uses government + ecommerce

# Test all categories
./run-tests.sh full  # Uses all categories
```

---

## Branch Management

The test executor handles branch complexity automatically:

### Scenario 1: Tests in Current Branch

```bash
# If tests/ directory exists
./run-tests.sh quick
# ✅ Runs immediately
```

### Scenario 2: Tests on Different Branch

```bash
# If tests not found, you'll be prompted:
Options:
  1) Merge test branch into current branch (recommended)
  2) Switch to test branch temporarily
  3) Cancel and exit

Choose option (1-3):
```

### Scenario 3: Manual Setup

```bash
# Merge test branch manually
git merge claude/test-aria-rules-phase-4-011CUq3zzD76mLZzj6aKHVc1

# Then run tests
./run-tests.sh quick
```

---

## Troubleshooting

### Dependencies Not Installed

**Error**: `Dependencies not installed (node_modules missing)`

**Solution**:
```bash
npm install
npx playwright install chromium
```

### Test Branch Not Found

**Error**: `Test branch not found`

**Solution**:
```bash
git fetch origin claude/test-aria-rules-phase-4-011CUq3zzD76mLZzj6aKHVc1
```

### Integration Tests Fail

**Error**: `Integration test script not found`

**Solution**: You need to merge or switch to the test branch:
```bash
git merge claude/test-aria-rules-phase-4-011CUq3zzD76mLZzj6aKHVc1
```

### Browser Launch Fails

**Error**: Playwright browser fails to launch

**Solution**:
```bash
# Reinstall browsers
npx playwright install chromium --with-deps

# Or install system dependencies (Linux)
sudo npx playwright install-deps chromium
```

### Permission Denied

**Error**: `Permission denied: ./run-tests.sh`

**Solution**:
```bash
chmod +x ./run-tests.sh
```

---

## Configuration

The test executor uses `test-config.json` for configuration:

```json
{
  "modes": {
    "quick": {
      "sites": 10,
      "categories": ["government", "ecommerce"],
      "timeout": 600
    }
  },
  "successCriteria": {
    "phase8": {
      "metrics": {
        "precision": { "minimum": 0.75 },
        "recall": { "minimum": 0.60 }
      }
    }
  }
}
```

You can customize:
- Sites per mode
- Category selections
- Timeouts
- Success criteria thresholds
- Output formats

---

## Advanced Usage

### Parallel Execution

The test executor does NOT support parallel execution of multiple modes, but you can run analysis steps in parallel manually:

```bash
# Terminal 1: Run integration tests
./run-tests.sh integration --output results/scan1.json --skip-pipeline

# Terminal 2: Process previous results
./run-tests.sh pipeline results/old-scan.json
```

### Custom Test Sites

Edit `tests/integration/test-sites.json` to add/remove websites:

```json
{
  "government": [
    {
      "name": "Custom Site",
      "url": "https://example.com",
      "wcagLevel": "AA"
    }
  ]
}
```

### Environment Variables

```bash
# Custom results directory
export RESULTS_DIR="./custom-results"
./run-tests.sh quick

# Custom timestamp format
export TIMESTAMP="custom-$(date +%Y%m%d)"
./run-tests.sh standard
```

---

## Integration with CI/CD

### GitHub Actions

```yaml
name: Accessibility Testing

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Install Playwright
        run: npx playwright install chromium --with-deps

      - name: Run tests
        run: ./run-tests.sh quick --skip-install

      - name: Upload results
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: results/
```

### Docker

```dockerfile
FROM mcr.microsoft.com/playwright:latest

WORKDIR /app
COPY . .

RUN npm install

CMD ["./run-tests.sh", "quick"]
```

---

## Best Practices

### 1. Start Small
```bash
# First run: quick validation
./run-tests.sh quick

# Once confident: standard validation
./run-tests.sh standard

# Final validation: full test suite
./run-tests.sh full
```

### 2. Use Dry Run
```bash
# Preview execution plan
./run-tests.sh full --dry-run
```

### 3. Check Environment First
```bash
# Verify setup before running
./run-tests.sh check
```

### 4. Incremental Testing
```bash
# Test specific categories first
./run-tests.sh integration --categories "government"

# Then expand
./run-tests.sh integration --categories "government,ecommerce"
```

### 5. Keep Results Organized
```bash
# Use descriptive output names
./run-tests.sh integration --output results/pre-release-scan.json
```

---

## Performance Tips

### Faster Execution

```bash
# Skip unit tests if already passing
./run-tests.sh quick --skip-unit

# Skip dependency checks
./run-tests.sh quick --skip-install

# Reduce site count
./run-tests.sh standard --sites 10
```

### Resource Management

```bash
# Chromium uses ~500MB RAM per instance
# Monitor with: htop or Activity Monitor

# For low-memory systems:
./run-tests.sh quick  # Tests 10 sites sequentially
```

---

## FAQ

**Q: How long does a full validation take?**
A: ~40 minutes for 40 sites (1 min per site average)

**Q: Can I run tests on a subset of rules?**
A: Not directly, but you can filter in the pipeline analysis

**Q: What if I don't have the test branch?**
A: Fetch it: `git fetch origin claude/test-aria-rules-phase-4-011CUq3zzD76mLZzj6aKHVc1`

**Q: Can I test my own websites?**
A: Yes! Edit `tests/integration/test-sites.json` to add custom sites

**Q: Do I need to run all tests every time?**
A: No! Use modes based on context:
- Development: `quick`
- Pre-release: `standard`
- Release: `full`

**Q: What happens if tests fail?**
A: The script exits with error code 1 and shows which step failed

**Q: Can I resume a failed run?**
A: Run the specific mode that failed, or use `pipeline` mode to reprocess results

---

## Related Documentation

- **MANUAL_TESTING_GUIDE.md** - Manual testing procedures
- **AUTOMATED_TESTING_SETUP.md** - Environment setup details
- **NEXT_SESSION_PLAN.md** - Phase 8 completion plan
- **test-config.json** - Configuration reference
- **run-analysis-pipeline.sh** - Pipeline script details

---

## Support

For issues or questions:
1. Check troubleshooting section above
2. Verify environment: `./run-tests.sh check`
3. Try dry run: `./run-tests.sh [mode] --dry-run`
4. Review error messages carefully
5. Consult related documentation

---

## Version History

- **v1.0.0** (2025-01-07) - Initial release
  - Comprehensive test orchestration
  - Multi-mode support (quick/standard/full)
  - Automatic branch management
  - Integrated pipeline execution
  - Success criteria evaluation

---

*Last updated: 2025-01-07*
*Phase: Phase 8 - Real-World Validation*
*Project: AccessInsight MV3 Extension*
