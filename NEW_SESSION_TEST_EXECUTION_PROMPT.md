# Automated Test Execution Prompt for New Session

Copy and paste this prompt into a new Claude session to execute Phase 8 Real-World Validation tests.

---

## 🎯 Mission

Execute the **Phase 8 Real-World Validation** automated test suite for the AccessInsight MV3 browser extension and generate a comprehensive validation report with accuracy metrics (precision, recall, F1 score).

---

## 📍 Project Context

**Repository**: `accessinsight-mv3-extension-v2`

**Current Branch**: `claude/phase-8-next-steps-planning-011CUq3zzD76mLZzj6aKHVc1-011CUtZST2ziHTM6CkoTJ1MU`

**Test Infrastructure Branch**: `claude/test-aria-rules-phase-4-011CUq3zzD76mLZzj6aKHVc1`

**Project State**:
- ✅ 46 accessibility rules implemented (WCAG 2.0, 2.1, 2.2 coverage)
- ✅ 315 unit tests complete (100% pass rate)
- ✅ Analysis pipeline built and remediated (A- quality, 95/100)
- ✅ 40 test websites curated across 7 categories
- ❌ **Real-world validation not yet performed** ← THIS IS YOUR TASK

---

## 📂 Where Everything Is Located

### Test Infrastructure
All test files are on branch: `claude/test-aria-rules-phase-4-011CUq3zzD76mLZzj6aKHVc1`

**Key Files**:
- `/run-tests.sh` - Master test orchestrator (main executable)
- `/run-analysis-pipeline.sh` - Analysis pipeline runner
- `/test-config.json` - Configuration (modes, success criteria, thresholds)
- `/tests/integration/batch-scan.js` - Browser-based scanning script
- `/tests/integration/test-sites.json` - 40 curated test websites
- `/tests/integration/calculate-metrics.js` - Metrics calculator
- `/tests/integration/analyze-patterns.js` - Pattern analyzer
- `/tests/integration/compare-baseline.js` - Baseline comparator
- `/tests/integration/generate-report.js` - Report generator
- `/tests/run-all-tests.sh` - Unit test runner (315 tests)

### Documentation
- `/TEST_EXECUTOR_GUIDE.md` - Complete usage guide (670 lines)
- `/AUTOMATED_TESTING_SETUP.md` - Environment setup instructions
- `/MANUAL_TESTING_GUIDE.md` - Manual testing procedures
- `/NEXT_SESSION_PLAN.md` - Phase 8 completion plan
- `/TESTING_README.md` - Quick reference

### Output Location
- `/results/` - All test results go here
- `/results/reports/` - Generated validation reports
- `/results/baseline/` - axe-core baseline comparisons (optional)

---

## 🎯 Your Objectives

### Primary Goal
Execute the automated test suite and generate a validation report that answers:
1. **How accurate is AccessInsight on real websites?** (Precision ≥ 75%?)
2. **What is the false positive rate?** (< 25%?)
3. **What is the recall/coverage?** (≥ 60%?)
4. **How does it compare to axe-core?** (Baseline comparison)
5. **What are common false positive patterns?**
6. **Should we proceed to Phase 9 or tune the engine?**

### Expected Deliverables
1. **Batch scan results** - Raw scan data from 10-40 websites
2. **Metrics report** - Precision, recall, F1 score calculations
3. **Pattern analysis** - False positive/negative patterns
4. **Validation report** - Comprehensive markdown report with recommendations
5. **Decision recommendation** - Proceed to Phase 9, tune engine, or rework

---

## 🚀 Step-by-Step Execution Instructions

### Step 1: Environment Check (2 minutes)
```bash
cd /home/user/accessinsight-mv3-extension-v2
./run-tests.sh check
```

**Expected Output**:
- ✅ Node.js 18+ installed
- ✅ npm installed
- ✅ git installed
- ✅ Inside git repository
- ⚠️ Dependencies may need installation
- ⚠️ Playwright browsers may need installation

**If environment check fails**: Follow the error messages to install missing prerequisites.

---

### Step 2: Merge Test Infrastructure (5 minutes)
The test infrastructure exists on a separate branch. You need to merge it into the current branch.

```bash
# Fetch the test branch if needed
git fetch origin claude/test-aria-rules-phase-4-011CUq3zzD76mLZzj6aKHVc1

# Merge test infrastructure into current branch
git merge claude/test-aria-rules-phase-4-011CUq3zzD76mLZzj6aKHVc1 --no-edit
```

**Expected Result**:
- `tests/` directory now exists
- `run-tests.sh` is executable
- Test infrastructure is available

**Alternative**: The test executor will prompt you to merge/switch branches automatically if you skip this step.

---

### Step 3: Run Quick Validation (~15 minutes)

Start with **quick mode** to validate the setup and get initial results:

```bash
./run-tests.sh quick
```

**What This Does**:
1. Checks environment (Node.js, npm, git, Playwright)
2. Installs dependencies if needed (`npm install`)
3. Installs Playwright browsers if needed (Chromium)
4. Runs unit tests (315 tests, ~5 min) - validates rule implementation
5. Runs integration tests (10 websites, ~10 min) - browser scanning
6. Executes analysis pipeline (~2 min):
   - Calculates precision, recall, F1 score
   - Analyzes false positive/negative patterns
   - Compares against baseline (if available)
   - Generates comprehensive validation report
7. Evaluates results against Phase 8 success criteria
8. Provides decision recommendation

**Expected Duration**: ~15 minutes total

**Expected Output Files**:
- `results/batch-results-TIMESTAMP.json` - Raw scan data
- `results/reports/metrics-TIMESTAMP.json` - Calculated metrics
- `results/reports/patterns-TIMESTAMP.json` - Pattern analysis
- `results/reports/VALIDATION-REPORT-TIMESTAMP.md` - **FINAL REPORT** ⭐

---

### Step 4: Review Results (5 minutes)

```bash
# View the validation report
cat results/reports/VALIDATION-REPORT-*.md
```

**What to Look For**:
1. **Executive Summary** - Pass/fail determination
2. **Overall Metrics**:
   - Precision (target ≥ 75%)
   - Recall (target ≥ 60%)
   - F1 Score (target ≥ 65%)
   - False Positive Rate (target < 25%)
3. **Per-Rule Analysis** - Which rules perform well/poorly
4. **Pattern Analysis** - Common false positive patterns
5. **Baseline Comparison** - vs axe-core (if available)
6. **Recommendation** - Next steps

---

### Step 5: Decision Path

Based on the validation report results:

#### ✅ If Precision ≥ 75% AND Recall ≥ 60%
**Decision**: PROCEED TO PHASE 9 (Performance Optimization)
**Action**: Report success and recommend next phase
**Message**: "Phase 8 validation PASSED! AccessInsight meets production accuracy criteria. Ready for Phase 9 (Performance Optimization)."

#### ⚠️ If Precision 60-75% OR Recall 45-60%
**Decision**: ENGINE TUNING NEEDED
**Action**: Identify problematic rules and patterns
**Estimated Effort**: 4-8 hours
**Message**: "Phase 8 validation shows room for improvement. Recommend engine tuning for [specific rules]. Estimated effort: 4-8 hours."

#### ❌ If Precision < 60% OR Recall < 45%
**Decision**: SIGNIFICANT REWORK NEEDED
**Action**: Deep investigation required
**Estimated Effort**: 1-2 weeks
**Message**: "Phase 8 validation revealed accuracy issues. Recommend returning to unit testing and rule development. Review patterns for [specific issues]."

---

### Step 6 (Optional): Run Full Validation (~45 minutes)

If quick validation looks promising, run the comprehensive test:

```bash
./run-tests.sh full
```

**What This Does**:
- Tests all 40 curated websites (vs 10 in quick mode)
- Covers all 7 categories (government, ecommerce, news, education, SaaS, accessibility, CMS)
- Provides more statistically significant results
- Takes ~40-45 minutes total

**When to Use**:
- Quick validation results are promising (precision ≥ 70%)
- Need high confidence for production release decision
- Have time for comprehensive testing

---

### Step 7 (Optional): Baseline Comparison

To compare against axe-core (industry standard):

```bash
./run-tests.sh standard --with-baseline
```

**What This Does**:
- Runs standard validation (20 sites)
- Includes axe-core baseline comparison
- Shows unique findings, overlap, and coverage differences
- Answers: "What does AccessInsight catch that axe-core misses?"

**Note**: Requires axe-core baseline data (may need manual collection)

---

## 📊 Understanding Test Modes

| Mode | Sites | Duration | Categories | Use Case |
|------|-------|----------|------------|----------|
| **quick** | 10 | ~15 min | Government, E-commerce | Initial validation, rapid feedback |
| **standard** | 20 | ~25 min | Gov, Ecom, News, Education | Pre-release testing, balanced coverage |
| **full** | 40 | ~45 min | All 7 categories | Final validation, release candidate |
| **unit** | N/A | ~5 min | N/A | Unit tests only (315 tests) |
| **integration** | Custom | Variable | Custom | Integration tests only |
| **pipeline** | N/A | ~2 min | N/A | Analyze existing results |

---

## 🎯 Success Criteria (Phase 8)

The test executor automatically evaluates against these thresholds:

### Passing Criteria ✅
- **Precision ≥ 75%** (true positives / all reported issues)
- **Recall ≥ 60%** (true positives / all actual violations)
- **False Positive Rate < 25%**
- **F1 Score ≥ 65%**
- **Minimum 10 sites tested**

**Outcome**: Proceed to Phase 9 (Performance Optimization)

### Tuning Required ⚠️
- **Precision 60-75%** OR **Recall 45-60%**

**Outcome**: Tune problematic rules (estimated 4-8 hours)

### Significant Rework Needed ❌
- **Precision < 60%** OR **Recall < 45%**

**Outcome**: Return to unit testing and rule development (1-2 weeks)

---

## 🗂️ Test Website Categories

The test suite includes 40 curated websites:

| Category | Count | Priority | Complexity | WCAG Target |
|----------|-------|----------|------------|-------------|
| **Government** | 8 | High | Medium | AA |
| **E-commerce** | 6 | High | High | AA |
| **News** | 6 | Medium | High | AA |
| **Education** | 5 | High | Medium | AA |
| **SaaS** | 6 | Medium | High | AA |
| **Accessibility** | 4 | High | Low | AAA |
| **CMS/Small Biz** | 5 | Low | Medium | A |

**Location**: `tests/integration/test-sites.json`

---

## 🛠️ Troubleshooting

### Issue: Dependencies Not Installed
**Error**: `Dependencies not installed (node_modules missing)`

**Solution**:
```bash
npm install
npx playwright install chromium
```

---

### Issue: Test Branch Not Found
**Error**: `Test branch not found`

**Solution**:
```bash
git fetch origin claude/test-aria-rules-phase-4-011CUq3zzD76mLZzj6aKHVc1
git merge claude/test-aria-rules-phase-4-011CUq3zzD76mLZzj6aKHVc1 --no-edit
```

---

### Issue: Browser Launch Fails
**Error**: Playwright browser fails to launch

**Solution**:
```bash
# Reinstall browsers with system dependencies
npx playwright install chromium --with-deps

# Or install system dependencies (Linux)
sudo npx playwright install-deps chromium
```

---

### Issue: Permission Denied
**Error**: `Permission denied: ./run-tests.sh`

**Solution**:
```bash
chmod +x ./run-tests.sh
chmod +x ./run-analysis-pipeline.sh
```

---

### Issue: Out of Memory
**Error**: Process crashes during scan

**Solution**: Reduce site count or use quick mode
```bash
./run-tests.sh quick --sites 5
```

---

## 📋 Pre-Execution Checklist

Before running tests, verify:

- [ ] Node.js 18+ installed (`node -v`)
- [ ] npm installed (`npm -v`)
- [ ] Git repository accessible
- [ ] Adequate disk space (~500MB for browsers)
- [ ] Adequate memory (~2GB available)
- [ ] Network connectivity (for scanning websites)
- [ ] Current branch is correct
- [ ] No uncommitted critical changes

---

## 🎓 Advanced Options

### Custom Site Count
```bash
./run-tests.sh quick --sites 5
```

### Specific Categories Only
```bash
./run-tests.sh integration --categories "government,news"
```

### Skip Unit Tests (if already verified)
```bash
./run-tests.sh quick --skip-unit
```

### Skip Installation (if already done)
```bash
./run-tests.sh quick --skip-install
```

### Dry Run (preview without execution)
```bash
./run-tests.sh full --dry-run
```

### Custom Output Path
```bash
./run-tests.sh quick --output results/my-custom-scan.json
```

### Analyze Existing Results
```bash
./run-tests.sh pipeline results/batch-results-20250107.json
```

---

## 📈 What Gets Measured

The validation report includes:

1. **Overall Metrics**
   - Precision (accuracy of reported issues)
   - Recall (coverage of actual issues)
   - F1 Score (harmonic mean)
   - False Positive Rate
   - False Negative Rate

2. **Per-Rule Analysis**
   - Metrics for each of 46 accessibility rules
   - True positives, false positives, false negatives
   - Confidence level distribution

3. **Pattern Analysis**
   - Common false positive patterns
   - Common false negative patterns
   - Edge cases and failure modes

4. **Baseline Comparison** (if available)
   - Unique to AccessInsight
   - Unique to axe-core
   - Overlap between tools
   - Coverage differences

5. **Recommendations**
   - Next phase decision
   - Problematic rules to investigate
   - Suggested tuning actions
   - Estimated effort

---

## 🎯 Final Deliverables

After execution, you should have:

1. ✅ **Validation Report** (`results/reports/VALIDATION-REPORT-*.md`)
   - Comprehensive metrics and analysis
   - Clear pass/fail determination
   - Actionable recommendations

2. ✅ **Raw Scan Data** (`results/batch-results-*.json`)
   - Complete scan results from all websites
   - Can be re-analyzed with different parameters

3. ✅ **Decision Summary**
   - Clear recommendation: Proceed / Tune / Rework
   - Justification based on metrics
   - Next steps outlined

4. ✅ **Executive Summary** (create this)
   - High-level overview for stakeholders
   - Key metrics
   - Decision and rationale

---

## 💬 Communication Template

After completing tests, provide a summary using this template:

```
# Phase 8 Real-World Validation - Execution Complete

## Test Configuration
- Mode: [quick/standard/full]
- Sites Tested: [N]
- Categories: [list]
- Duration: [X] minutes

## Results Summary
- ✅/⚠️/❌ Precision: [X]% (target ≥75%)
- ✅/⚠️/❌ Recall: [X]% (target ≥60%)
- ✅/⚠️/❌ F1 Score: [X]% (target ≥65%)
- ✅/⚠️/❌ False Positive Rate: [X]% (target <25%)

## Decision
[PROCEED TO PHASE 9 / TUNE ENGINE / REWORK NEEDED]

**Justification**: [Brief explanation based on metrics]

## Top Performing Rules
1. [Rule name] - Precision [X]%, Recall [Y]%
2. [Rule name] - Precision [X]%, Recall [Y]%
3. [Rule name] - Precision [X]%, Recall [Y]%

## Problematic Areas (if any)
1. [Rule name] - Issue: [description]
2. [Rule name] - Issue: [description]

## Next Steps
[Specific recommendations]

## Detailed Report
Location: `results/reports/VALIDATION-REPORT-[TIMESTAMP].md`
```

---

## 🔍 Quality Checks

Before reporting completion, verify:

- [ ] Test execution completed without errors
- [ ] Validation report generated successfully
- [ ] All expected output files exist
- [ ] Metrics are within reasonable ranges (0-100%)
- [ ] Report includes all required sections
- [ ] Decision recommendation is clear and justified
- [ ] No obvious data quality issues in results

---

## ⚡ Quick Start Command Sequence

For a streamlined execution, run these commands in sequence:

```bash
# 1. Check environment
./run-tests.sh check

# 2. Merge test infrastructure (if needed)
git merge claude/test-aria-rules-phase-4-011CUq3zzD76mLZzj6aKHVc1 --no-edit

# 3. Run quick validation
./run-tests.sh quick

# 4. Review results
cat results/reports/VALIDATION-REPORT-*.md

# 5. (Optional) Run full validation if quick looks good
./run-tests.sh full
```

---

## 🎯 Success Definition

**You have successfully completed this task when**:

1. ✅ Test executor ran without critical errors
2. ✅ Validation report generated with all sections
3. ✅ Metrics calculated (precision, recall, F1, FPR)
4. ✅ Decision made: Proceed/Tune/Rework
5. ✅ Results documented and summarized
6. ✅ Next steps clearly identified

---

## 📚 Additional Resources

If you need more information:

- **Complete Guide**: Read `/TEST_EXECUTOR_GUIDE.md` (670 lines)
- **Setup Help**: Read `/AUTOMATED_TESTING_SETUP.md`
- **Manual Testing**: See `/MANUAL_TESTING_GUIDE.md` (alternative approach)
- **Configuration**: Review `/test-config.json` (modes, thresholds, criteria)
- **Test Sites**: Review `/tests/integration/test-sites.json` (40 websites)

---

## 🚨 Important Notes

1. **Browser-Based Testing**: Tests run in a real Chromium browser via Playwright
2. **Network Required**: Tests scan live websites (requires internet)
3. **Time Commitment**: Quick mode ~15 min, Full mode ~45 min
4. **Resource Usage**: ~500MB disk, ~2GB RAM, 1 CPU core
5. **Interruption**: Can be stopped with Ctrl+C (safe, no data corruption)
6. **Re-running**: Safe to run multiple times, results are timestamped
7. **Branch State**: Tests merge a branch - commit any important work first

---

## 🎓 Context for Claude

**What This Project Does**:
AccessInsight is a browser extension that performs automated accessibility audits on websites, identifying WCAG 2.0/2.1/2.2 compliance issues. It has 46 accessibility rules covering ARIA, form controls, images, landmarks, keyboard navigation, color contrast, etc.

**Development Stage**:
- Phase 4-7 COMPLETE: Rule implementation + unit testing (100% coverage, 315 tests)
- Phase 8 IN PROGRESS: Real-world validation (accuracy on actual websites)
- Phase 9 NEXT: Performance optimization
- Phase 10-12: UI polish, documentation, production release

**Why This Testing Matters**:
Unit tests validate rule logic in isolation (JSDOM mocks), but don't prove accuracy on real websites with complex HTML, CSS, and JavaScript. Phase 8 answers: "Does this actually work on production sites?" by measuring precision (false positive rate) and recall (coverage).

**What Makes This Different**:
Automated testing infrastructure is fully built - you just execute it and analyze results. No need to write tests, just run the orchestrator and interpret the validation report.

---

**Ready to execute? Start here:**

```bash
cd /home/user/accessinsight-mv3-extension-v2
./run-tests.sh check
```

---

*Last Updated: 2025-01-07*
*Phase: Phase 8 - Real-World Validation*
*Project: AccessInsight MV3 Extension*
