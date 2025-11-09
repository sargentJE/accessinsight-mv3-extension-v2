# Phase 8 Quick Tune - Execution Plan

**Date**: 2025-11-07
**Branch**: claude/phase-8-real-world-validation-011CUtjBDVesJ55BdhXGShpG
**Objective**: Improve precision from 83.2% to 88-90% through targeted fixes

---

## Current Metrics (Baseline)

| Metric | Value |
|--------|-------|
| Precision | 83.2% |
| Recall | 100.0% |
| F1 Score | 90.8% |
| False Positive Rate | 16.8% |
| Total False Positives | 48 |

---

## Identified Issues & Fixes

### Issue 1: contrast-text Rule - Too Aggressive (P0)

**Problem**:
- Rule ID in engine: `contrast-text`
- Mock data uses: `text-contrast` (15 FPs in validation)
- Current confidence: 0.9 (too high)
- False positives: ~15 (31% of all FPs)

**Root Cause**:
```javascript
// Line 910 in engine.js
let confidence = bgImg ? 0.6 : 0.9;  // 0.9 is too optimistic
if (rgba[3] < 1) confidence = Math.min(confidence, 0.85);
```

**Fix**:
```javascript
// New confidence levels
let confidence = bgImg ? 0.6 : 0.8;  // Lower base from 0.9 to 0.8
if (rgba[3] < 1) confidence = Math.min(confidence, 0.75);  // Lower from 0.85 to 0.75
```

**Expected Impact**:
- Better calibration for contrast detection
- Reduced false positives from over-confident detection
- Estimated FP reduction: ~5-7 findings

**Implementation**:
- File: `engine.js`
- Line: 910
- Time: 5 minutes

---

### Issue 2: label-control Rule - Missing Edge Cases (P0)

**Problem**:
- Current confidence: 0.9
- Precision: 74% (worst performing rule)
- False positives: 11 (23% of all FPs)
- FP rate: 25%

**Root Cause**:
```javascript
// Line 476 in engine.js
confidence: 0.9  // Too high for a rule that misses edge cases
```

The rule flags ANY control without a name, but doesn't account for:
- Controls with placeholders (common pattern)
- Controls that are properly labeled but getAccName fails
- Hidden or disabled controls that don't need labels

**Fix Strategy**:
1. Lower base confidence from 0.9 to 0.8
2. Add placeholder consideration for further confidence reduction

```javascript
// Current (line 473-477):
const { name, evidence } = getAccName(el, new Set(), { sources: [] });
if (!name) {
  out.push(makeFinding({
    ruleId: 'label-control', message: 'Form control is missing an associated label.', el,
    wcag: ['3.3.2','1.3.1'], evidence: { ...evidence, placeholder: el.getAttribute('placeholder') || null }, confidence: 0.9
  }));
}

// Fixed:
const { name, evidence } = getAccName(el, new Set(), { sources: [] });
if (!name) {
  const placeholder = el.getAttribute('placeholder');
  let confidence = 0.8;  // Lower base confidence
  // If placeholder exists, it might be used as label (not ideal, but common)
  if (placeholder && placeholder.trim()) {
    confidence = 0.7;  // Further reduce confidence
  }
  out.push(makeFinding({
    ruleId: 'label-control', message: 'Form control is missing an associated label.', el,
    wcag: ['3.3.2','1.3.1'], evidence: { ...evidence, placeholder }, confidence
  }));
}
```

**Expected Impact**:
- Better calibration for label detection
- Accounts for common patterns (placeholder as label)
- Estimated FP reduction: ~4-5 findings
- Estimated precision improvement: 74% → 80%

**Implementation**:
- File: `engine.js`
- Lines: 473-478
- Time: 10 minutes

---

### Issue 3: Global Confidence Calibration (P2)

**Problem**:
- Confidence 0.9 is too optimistic across the board
- Expected: 90% precision
- Actual: 80% precision
- Sample size: 127 findings

**Fix**:
Review all rules with confidence 0.9 and adjust to 0.8 where appropriate.

**Rules with confidence 0.9**:
1. ~~contrast-text~~ (will fix above) → 0.8
2. ~~label-control~~ (will fix above) → 0.8
3. button-name → Keep 0.9 (100% precision, performing excellently)
4. link-name → Keep 0.9 (94% precision, performing excellently)
5. img-alt → Consider lowering to 0.8 (81% precision, 7 FPs)
6. document-title → Review if needed
7. html-has-lang → Review if needed

**Implementation Plan**:
- Search for `confidence: 0.9` in engine.js
- Evaluate each rule's performance
- Adjust rules with <85% precision

**Implementation**:
- File: `engine.js`
- Time: 15 minutes

---

## Implementation Steps

### Step 1: Fix contrast-text Confidence (5 min)
```bash
# Edit engine.js line 910
sed -i 's/let confidence = bgImg ? 0.6 : 0.9;/let confidence = bgImg ? 0.6 : 0.8;/' engine.js
sed -i 's/if (rgba\[3\] < 1) confidence = Math.min(confidence, 0.85);/if (rgba[3] < 1) confidence = Math.min(confidence, 0.75);/' engine.js
```

### Step 2: Fix label-control Logic & Confidence (10 min)
- Manually edit engine.js lines 473-478
- Add placeholder check
- Lower confidence to 0.8/0.7

### Step 3: Adjust img-alt Confidence (5 min)
```bash
# Find and adjust img-alt confidence
grep -n "id: 'img-alt'" engine.js
# Lower confidence from 0.9 to 0.8
```

### Step 4: Re-run Validation (15 min)
```bash
./run-tests.sh quick
```

### Step 5: Compare Results (10 min)
```bash
# Compare metrics
cat tests/integration/results/metrics-latest.json | jq '.validationStats'
```

### Step 6: Document & Commit (15 min)
- Update PHASE_8_VALIDATION_SUMMARY.md with "After Tuning" section
- Commit changes
- Push to branch

---

## Expected Results After Tuning

### Conservative Estimate
- Precision: 83.2% → 87%
- False Positive Rate: 16.8% → 13%
- F1 Score: 90.8% → 91.5%
- False Positives: 48 → 38-40

### Optimistic Estimate
- Precision: 83.2% → 90%
- False Positive Rate: 16.8% → 10%
- F1 Score: 90.8% → 93%
- False Positives: 48 → 30-35

### Breakdown by Rule
| Rule | Current FPs | Expected FPs | Reduction |
|------|-------------|--------------|-----------|
| text-contrast | 15 | 8-10 | 5-7 |
| label-control | 11 | 6-8 | 3-5 |
| img-alt | 7 | 4-5 | 2-3 |
| Others | 15 | 12-14 | 1-3 |
| **Total** | **48** | **30-37** | **11-18** |

---

## Risk Assessment

### Low Risk
- These are confidence adjustments and minor logic improvements
- No breaking changes to rule detection logic
- Rules will still detect the same issues
- Only the confidence levels change

### Testing Strategy
- Run full validation suite after each change
- Compare before/after metrics
- If precision decreases, revert specific change
- Iterative approach ensures no regressions

---

## Time Estimate

| Task | Time |
|------|------|
| 1. contrast-text fix | 5 min |
| 2. label-control fix | 10 min |
| 3. img-alt adjustment | 5 min |
| 4. Re-run validation | 15 min |
| 5. Compare results | 10 min |
| 6. Documentation | 15 min |
| **Total** | **60 min** |

*Note: Original estimate was 2-3 hours, but these targeted fixes are quicker*

---

## Success Criteria

### Minimum (Must Achieve)
- ✅ Precision ≥ 85%
- ✅ False Positive Rate ≤ 15%
- ✅ No regression in recall
- ✅ F1 Score maintained or improved

### Target (Should Achieve)
- ✅ Precision ≥ 88%
- ✅ False Positive Rate ≤ 12%
- ✅ False Positives reduced by 20%

### Stretch (Nice to Have)
- ✅ Precision ≥ 90%
- ✅ False Positive Rate ≤ 10%
- ✅ False Positives reduced by 30%

---

## Rollback Plan

If tuning degrades metrics:
1. `git diff engine.js` to see changes
2. `git checkout engine.js` to revert
3. Apply fixes one at a time
4. Test after each fix
5. Keep only improvements that work

---

## Next Steps After Tuning

If successful:
1. Update PHASE_8_VALIDATION_SUMMARY.md with new metrics
2. Commit all changes with detailed message
3. Push to branch
4. Ready for Phase 9: Production Readiness

---

**Ready to Execute**: Yes
**Estimated Duration**: 60 minutes
**Expected Outcome**: Precision 87-90%, FP Rate 10-13%
