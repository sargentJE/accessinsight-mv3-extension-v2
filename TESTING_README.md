# Testing Infrastructure - Quick Reference

**Automated Test Executor for AccessInsight Phase 8 Real-World Validation**

---

## 🚀 Quick Start (3 Steps)

```bash
# 1. Check your environment
./run-tests.sh check

# 2. Run quick validation (~10 minutes)
./run-tests.sh quick

# 3. View results
cat results/reports/VALIDATION-REPORT-*.md
```

---

## 📋 Available Commands

| Command | Duration | Description |
|---------|----------|-------------|
| `./run-tests.sh check` | 10 sec | Verify environment setup |
| `./run-tests.sh quick` | ~10 min | Quick validation (10 sites) |
| `./run-tests.sh standard` | ~20 min | Standard validation (20 sites) |
| `./run-tests.sh full` | ~40 min | Full validation (40 sites) |
| `./run-tests.sh unit` | ~5 min | Unit tests only (315 tests) |
| `./run-tests.sh integration` | Variable | Integration tests only |
| `./run-tests.sh pipeline <file>` | ~5 min | Analyze existing results |
| `./run-tests.sh --help` | Instant | Show full help |

---

## 🎯 Phase 8 Success Criteria

The test executor automatically evaluates results:

- ✅ **Precision ≥ 75%** → Proceed to Phase 9
- ⚠️ **Precision 60-75%** → Tune engine (4-8 hrs)
- ❌ **Precision < 60%** → Return to unit testing

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `run-tests.sh` | Main test executor (comprehensive orchestrator) |
| `run-analysis-pipeline.sh` | Pipeline runner (metrics, patterns, reports) |
| `test-config.json` | Configuration (modes, criteria, thresholds) |
| `TEST_EXECUTOR_GUIDE.md` | Complete documentation ⭐ |
| `MANUAL_TESTING_GUIDE.md` | Manual testing procedures |
| `AUTOMATED_TESTING_SETUP.md` | Environment setup guide |

---

## 🔍 Common Use Cases

### Development Workflow
```bash
# Quick validation during development
./run-tests.sh quick --skip-unit
```

### Pre-Release Testing
```bash
# Standard validation with baseline
./run-tests.sh standard --with-baseline
```

### Final Release Validation
```bash
# Comprehensive full validation
./run-tests.sh full
```

### Analyze Previous Scan
```bash
# Process existing results
./run-tests.sh pipeline results/batch-results-20250107.json
```

---

## 🏗️ Architecture

```
run-tests.sh (Master Orchestrator)
    │
    ├─> Environment Check (Node.js, npm, git, Playwright)
    ├─> Branch Setup (merge or switch to test infrastructure)
    ├─> Dependency Installation (npm install, playwright install)
    │
    ├─> Unit Tests (tests/run-all-tests.sh)
    │   └─> 315 tests across 46 accessibility rules
    │
    ├─> Integration Tests (tests/integration/batch-scan.js)
    │   └─> Playwright + Chromium → Scan N websites → JSON
    │
    └─> Analysis Pipeline (run-analysis-pipeline.sh)
        ├─> Calculate Metrics (precision, recall, F1)
        ├─> Analyze Patterns (false positives/negatives)
        ├─> Compare Baseline (vs axe-core) [optional]
        └─> Generate Report (comprehensive markdown)
```

---

## 📊 Output Structure

```
results/
├── batch-results-TIMESTAMP.json           # Raw scan data
├── reports/
│   ├── metrics-TIMESTAMP.json             # Calculated metrics
│   ├── patterns-TIMESTAMP.json            # Pattern analysis
│   ├── baseline-comparison-TIMESTAMP.json # vs axe-core
│   └── VALIDATION-REPORT-TIMESTAMP.md     # Final report ⭐
└── baseline/
    └── *.json                              # axe-core baselines
```

---

## ⚡ Advanced Options

```bash
# Custom site count
./run-tests.sh quick --sites 5

# Specific categories
./run-tests.sh integration --categories "government,news"

# Skip steps
./run-tests.sh standard --skip-unit --skip-pipeline

# Dry run (preview only)
./run-tests.sh full --dry-run

# Custom output path
./run-tests.sh quick --output results/my-scan.json
```

---

## 🛠️ Prerequisites

- **Node.js 18+** - [Download](https://nodejs.org/)
- **npm** - Comes with Node.js
- **Git** - Version control
- **Chrome/Chromium** - Playwright installs automatically

**Check Setup:**
```bash
./run-tests.sh check
```

---

## 🧪 Test Infrastructure Location

The comprehensive test suite (315 unit tests + integration framework) exists on:

**Branch**: `claude/test-aria-rules-phase-4-011CUq3zzD76mLZzj6aKHVc1`

The test executor will help you:
1. Merge the test branch into your current branch, OR
2. Temporarily switch to the test branch

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Dependencies missing | `npm install && npx playwright install chromium` |
| Test branch not found | `git fetch origin claude/test-aria-rules-phase-4...` |
| Browser won't launch | `npx playwright install chromium --with-deps` |
| Permission denied | `chmod +x ./run-tests.sh` |
| Tests not found | Merge or switch to test branch when prompted |

---

## 📖 Full Documentation

For complete details, examples, and advanced usage:

**👉 See [TEST_EXECUTOR_GUIDE.md](TEST_EXECUTOR_GUIDE.md)**

Other helpful guides:
- [MANUAL_TESTING_GUIDE.md](MANUAL_TESTING_GUIDE.md) - Step-by-step manual testing
- [AUTOMATED_TESTING_SETUP.md](AUTOMATED_TESTING_SETUP.md) - Environment setup
- [NEXT_SESSION_PLAN.md](NEXT_SESSION_PLAN.md) - Phase 8 completion plan

---

## 🎓 Test Categories

| Category | Sites | Priority | Target |
|----------|-------|----------|--------|
| Government | 8 | High | WCAG AA |
| E-commerce | 6 | High | WCAG AA |
| News | 6 | Medium | WCAG AA |
| Education | 5 | High | WCAG AA |
| SaaS | 6 | Medium | WCAG AA |
| Accessibility | 4 | High | WCAG AAA |
| CMS/Small Biz | 5 | Low | WCAG A |

---

## 🚦 Execution Flow

```
START
  ↓
✓ Check environment (Node, npm, git, Playwright)
  ↓
✓ Setup test infrastructure (merge/switch branch)
  ↓
✓ Install dependencies (npm + Playwright browsers)
  ↓
✓ Run unit tests (315 tests, 100% coverage)
  ↓
✓ Run integration tests (browser scanning)
  ↓
✓ Execute analysis pipeline (4 steps)
  ↓
✓ Evaluate results (vs success criteria)
  ↓
DONE - View validation report!
```

---

## 🎯 Success Path

```bash
# 1. Environment check
./run-tests.sh check
# ✅ All checks pass

# 2. Quick validation
./run-tests.sh quick
# ✅ 10 sites scanned

# 3. Review results
cat results/reports/VALIDATION-REPORT-*.md
# ✅ Precision 80%, Recall 65% → SUCCESS!

# 4. Proceed to Phase 9
# → Performance Optimization
```

---

## 🔗 CI/CD Integration

### GitHub Actions
```yaml
- name: Run Accessibility Tests
  run: ./run-tests.sh quick --skip-install
```

### Docker
```dockerfile
FROM mcr.microsoft.com/playwright:latest
COPY . /app
WORKDIR /app
RUN npm install
CMD ["./run-tests.sh", "quick"]
```

---

## 💡 Pro Tips

1. **Start small**: Use `quick` mode first
2. **Check environment**: Always run `./run-tests.sh check` first
3. **Use dry run**: Preview with `--dry-run` before executing
4. **Incremental testing**: Test categories individually before full run
5. **Keep results**: Don't delete results/ - useful for comparison

---

## 📈 What Gets Measured

- **Precision** - Accuracy of reported issues (minimize false positives)
- **Recall** - Coverage of actual issues (minimize false negatives)
- **F1 Score** - Harmonic mean of precision and recall
- **False Positive Rate** - Percentage of incorrect reports
- **Per-Rule Metrics** - Performance breakdown by accessibility rule
- **Pattern Analysis** - Common error patterns
- **Baseline Comparison** - Performance vs axe-core

---

## 🆘 Getting Help

```bash
# Show help
./run-tests.sh --help

# Check environment
./run-tests.sh check

# Preview execution
./run-tests.sh [mode] --dry-run
```

**Documentation**:
- 📘 Full guide: [TEST_EXECUTOR_GUIDE.md](TEST_EXECUTOR_GUIDE.md)
- 📗 Manual testing: [MANUAL_TESTING_GUIDE.md](MANUAL_TESTING_GUIDE.md)
- 📙 Setup guide: [AUTOMATED_TESTING_SETUP.md](AUTOMATED_TESTING_SETUP.md)

---

## ✨ Features

- ✅ Automated end-to-end testing workflow
- ✅ Multiple testing modes (quick/standard/full)
- ✅ Intelligent branch management
- ✅ Dependency auto-installation
- ✅ Comprehensive reporting
- ✅ Success criteria evaluation
- ✅ Dry-run support
- ✅ Flexible configuration
- ✅ CI/CD ready

---

## 📝 Version

**Test Executor v1.0.0** - Phase 8 Real-World Validation
*Created: 2025-01-07*
*Project: AccessInsight MV3 Extension*

---

**Ready to test? Start here:**
```bash
./run-tests.sh quick
```
