# Manual Real-World Testing Guide

## Purpose
This guide provides step-by-step instructions for manually testing the AccessInsight extension on real websites and processing the results through the analysis pipeline.

## Prerequisites
- Chrome browser (version 120+)
- AccessInsight extension loaded unpacked
- axe DevTools extension installed (for baseline comparison)
- 2-3 hours of dedicated testing time

---

## Part 1: Extension Setup (10 minutes)

### Step 1: Load Extension in Chrome
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select this project directory: `/home/user/accessinsight-mv3-extension-v2`
5. Verify extension appears in extensions list
6. Note the extension ID for later

### Step 2: Install axe DevTools
1. Visit: https://chrome.google.com/webstore/detail/axe-devtools/lhdoppojpmngadmnindnejefpokejbdd
2. Click "Add to Chrome"
3. Verify installation by opening DevTools (F12) and checking for "axe DevTools" tab

---

## Part 2: Website Selection (Choose 10-15 sites)

### Recommended Test Sites

**High Priority (Test These First)**:
1. https://www.usa.gov (Government - expected good quality)
2. https://www.amazon.com (E-commerce - complex)
3. https://www.bbc.com (News - content-heavy)
4. https://www.wikipedia.org (Educational - generally accessible)
5. https://github.com (SaaS - application pattern)

**Medium Priority**:
6. https://www.target.com (E-commerce)
7. https://www.cnn.com (News)
8. https://www.gov.uk (Government)
9. https://www.webmd.com (Content/health)
10. https://www.etsy.com (E-commerce)

**Optional (if time permits)**:
11. https://www.w3.org (Accessibility-focused - positive control)
12. https://www.craigslist.org (Simple HTML - varying quality)
13. https://www.wordpress.org (CMS)
14. https://www.reddit.com (Social - dynamic)
15. https://www.linkedin.com (Social - auth required)

---

## Part 3: Scan Each Website (15-20 min per site)

### For Each Website:

#### Step 1: AccessInsight Scan
1. Navigate to website URL
2. Open Chrome DevTools (F12)
3. Click "A11y DevTools" tab (AccessInsight panel)
4. Click "Rescan" button
5. Wait for scan to complete (note scan time)
6. **Export findings**:
   - Click "Export" → "JSON"
   - Save as: `results/[site-name]-accessinsight.json`
   - Example: `results/usa-gov-accessinsight.json`

#### Step 2: axe DevTools Baseline Scan
1. In same DevTools window, click "axe DevTools" tab
2. Click "Scan ALL of my page" button
3. Wait for scan to complete (note scan time)
4. **Export results**:
   - Click "Export" → "CSV" (or JSON if available)
   - Save as: `results/[site-name]-axe.json`
   - Example: `results/usa-gov-axe.json`

#### Step 3: Document Observations
Create a file: `results/[site-name]-notes.txt`

Record:
```
Site: [URL]
Date: [YYYY-MM-DD]
Page Load Time: [seconds]
AccessInsight Scan Time: [ms]
axe Scan Time: [ms]

Findings Count:
- AccessInsight: [number]
- axe: [number]

Immediate Observations:
- Any obvious false positives?
- Any obviously missed issues?
- Performance issues?
- UI/UX issues with extension?

Manual Spot Check (pick 3-5 findings):
1. [Rule ID]: [True positive / False positive / Uncertain]
2. [Rule ID]: [True positive / False positive / Uncertain]
3. [Rule ID]: [True positive / False positive / Uncertain]
```

---

## Part 4: Organize Results (10 minutes)

### Create Results Directory Structure
```
results/
├── batch-scans/
│   ├── usa-gov-accessinsight.json
│   ├── amazon-accessinsight.json
│   └── ...
├── baseline/
│   ├── usa-gov-axe.json
│   ├── amazon-axe.json
│   └── ...
└── notes/
    ├── usa-gov-notes.txt
    ├── amazon-notes.txt
    └── ...
```

### Convert to Pipeline Format

Create `results/batch-results.json`:
```json
{
  "scans": [
    {
      "siteId": "gov-001",
      "url": "https://www.usa.gov",
      "name": "USA.gov",
      "category": "government",
      "expectedQuality": "good",
      "timestamp": "2025-11-07T14:00:00Z",
      "scanTimeMs": 450,
      "findings": [
        // Copy from usa-gov-accessinsight.json
      ]
    }
    // ... more sites
  ]
}
```

---

## Part 5: Run Analysis Pipeline (30 minutes)

### Step 1: Calculate Metrics
```bash
cd /home/user/accessinsight-mv3-extension-v2

# Calculate comprehensive metrics
node tests/integration/calculate-metrics.js \
  results/batch-results.json \
  > results/metrics-report.json
```

### Step 2: Analyze Patterns
```bash
# Identify false positive/negative patterns
node tests/integration/analyze-patterns.js \
  results/batch-results.json \
  > results/patterns-report.json
```

### Step 3: Baseline Comparison
```bash
# Compare with axe-core results
node tests/integration/compare-baseline.js \
  results/batch-results.json \
  results/baseline/ \
  > results/baseline-comparison.json
```

### Step 4: Generate Report
```bash
# Create comprehensive markdown report
node tests/integration/generate-report.js \
  results/metrics-report.json \
  results/patterns-report.json \
  results/baseline-comparison.json \
  > results/REAL_WORLD_VALIDATION_REPORT.md
```

---

## Part 6: Optional Manual Validation (60-90 minutes)

### Interactive Validation Tool
```bash
# Launch interactive validation
node tests/integration/validate-findings.js \
  results/batch-results.json

# Follow prompts to classify findings:
# - t (true positive)
# - f (false positive)
# - n (needs review)
# - h (help)
# - q (quit and save)
```

**Tip**: Focus on high-confidence findings first, then questionable ones.

### Resume Capability
The tool saves progress to `results/manual-validation.csv`. If interrupted, re-run the same command to resume where you left off.

---

## Part 7: Review Results & Make Decisions (30-60 minutes)

### Key Questions to Answer:

1. **Accuracy**:
   - What's the precision? (true positives / all reported)
   - What's the recall compared to axe? (coverage)
   - What's the false positive rate?

2. **Performance**:
   - Are scan times acceptable? (<1000ms target)
   - Any performance issues on complex sites?

3. **Pattern Analysis**:
   - Which rules have high false positive rates?
   - Which rules have high confidence accuracy?
   - What patterns need tuning?

4. **Baseline Comparison**:
   - How does coverage compare to axe-core?
   - Are we finding unique issues axe misses?
   - Are we missing issues axe catches?

5. **Confidence Calibration**:
   - Do confidence scores match actual precision?
   - Should any rules have adjusted confidence?

### Decision Matrix

**If Precision ≥ 75% and Recall ≥ 60%**:
→ ✅ Engine is production-ready for Phase 9 (Performance Optimization)

**If Precision 60-75% or Recall 40-60%**:
→ ⚠️ Engine needs tuning:
- Review high-FP rules and adjust logic
- Consider lowering confidence on problematic rules
- Add "needsReview" flags where appropriate
- Re-test after tuning

**If Precision < 60% or Recall < 40%**:
→ ❌ Engine needs significant work:
- Deep investigation of failure patterns
- Rule logic review and fixes
- Consider rule refactoring
- Extended testing cycle

---

## Part 8: Document Findings & Next Steps

Create `results/MANUAL_TESTING_SUMMARY.md`:

```markdown
# Manual Real-World Testing Summary

## Testing Scope
- Sites Tested: [number]
- Categories: [list]
- Total Findings: [number]
- Testing Date: [date]
- Tester: [name]

## Accuracy Metrics
- Precision: [%] (target: ≥75%)
- Recall: [%] (target: ≥60%)
- F1 Score: [%]
- False Positive Rate: [%] (target: <25%)

## Key Findings
1. [Major finding]
2. [Major finding]
3. [Major finding]

## Rules Needing Attention
- [rule-id]: [issue description]
- [rule-id]: [issue description]

## Recommendations
1. [Action item with priority]
2. [Action item with priority]
3. [Action item with priority]

## Decision
- [ ] ✅ Ready for Phase 9 (Performance)
- [ ] ⚠️ Needs tuning (estimate: X hours)
- [ ] ❌ Needs significant rework (estimate: X days)

## Next Steps
1. [Specific next action]
2. [Specific next action]
3. [Specific next action]
```

---

## Estimated Time Investment

| Activity | Time |
|----------|------|
| Extension setup | 10 min |
| Website selection | 10 min |
| Scanning (10 sites × 15 min) | 2.5 hours |
| Results organization | 10 min |
| Pipeline execution | 30 min |
| Optional manual validation | 60-90 min |
| Analysis & documentation | 30-60 min |
| **Total (without manual validation)** | **4-5 hours** |
| **Total (with manual validation)** | **5.5-7 hours** |

---

## Tips for Efficient Testing

1. **Batch similar sites**: Test all government sites together, then e-commerce, etc.
2. **Use browser profiles**: Create a dedicated Chrome profile for testing to avoid interference
3. **Document as you go**: Don't wait until the end to write notes
4. **Focus on patterns**: Look for systematic false positives, not isolated issues
5. **Prioritize high-impact rules**: If time-limited, focus validation on critical accessibility rules
6. **Take screenshots**: Capture interesting findings for documentation

---

## Common Issues & Solutions

### Issue: Extension not loading
**Solution**: Check manifest.json, ensure all files present, check console for errors

### Issue: Scan takes very long (>3000ms)
**Solution**: Note performance issue, check page DOM size, consider viewport-only scan

### Issue: Export not working
**Solution**: Check DevTools console for errors, try different export format

### Issue: Can't compare with axe
**Solution**: axe may block some sites with CSP, note and skip baseline for that site

### Issue: Too many findings to validate
**Solution**: Use statistical sampling - validate 20-30 findings per rule, extrapolate

---

## Output Files Checklist

Before running analysis pipeline, verify you have:
- [ ] `results/batch-results.json` (consolidated AccessInsight scans)
- [ ] `results/baseline/*.json` (axe-core scans for comparison)
- [ ] `results/notes/*.txt` (manual observations per site)
- [ ] Optional: `results/manual-validation.csv` (classified findings)

Expected output files from pipeline:
- [ ] `results/metrics-report.json`
- [ ] `results/patterns-report.json`
- [ ] `results/baseline-comparison.json`
- [ ] `results/REAL_WORLD_VALIDATION_REPORT.md`
- [ ] `results/MANUAL_TESTING_SUMMARY.md`

---

## Questions or Issues?

If you encounter problems during manual testing, document them in:
`results/TESTING_ISSUES_LOG.md`

Include:
- What you were doing
- What went wrong
- Screenshots if applicable
- Workaround if found
