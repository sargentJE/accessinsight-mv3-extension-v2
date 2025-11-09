# Overlay UX Improvements Testing Guide

## Quick Start

This guide will help you manually test the v1.1.0 overlay UX improvements on real websites.

## Load the Extension

1. Open Chrome/Edge browser
2. Navigate to `chrome://extensions`
3. Enable "Developer mode" (top right)
4. Click "Load unpacked"
5. Select the `/home/user/accessinsight-mv3-extension-v2` directory
6. Extension should load with v1.1.0 changes

## Test Sites

### 1. Accessible University (77 findings)
**URL**: `https://washington.edu/accesscomputing/AU/before.html`

### 2. GOV.UK Test Cases (500+ findings - stress test)
**URL**: `https://alphagov.github.io/accessibility-tool-audit/test-cases.html`

### 3. MARS Demo (82 findings)
**URL**: `https://ncdae.org/resources/demos/mars/`

## Test Scenario 1: Clean Default State

**Goal**: Verify no highlights appear by default

### Steps
1. Open any test site
2. Press `Alt+Shift+A` to open AccessInsight panel
3. Wait for scan to complete

### Expected Behavior ✅
- Panel opens on right side of screen
- Findings list shows all issues (e.g., "77 issues")
- **CRITICAL**: Page has ZERO colored boxes/highlights
- Page is clean and unobstructed
- You can read the website normally

### What to Look For
- ❌ **FAIL**: If you see any colored boxes on the page
- ✅ **PASS**: Clean page, findings only in panel

## Test Scenario 2: Click-to-Highlight

**Goal**: Verify clicking a finding highlights ONLY that finding

### Steps
1. Panel should be open with findings visible
2. Note the first finding in the list (e.g., "#1 Image lacks alt text")
3. Click on that finding

### Expected Behavior ✅
- **ONLY ONE** colored box appears around the element
- Box color matches the rule (e.g., red for img-alt)
- Label shows "#1" in top-left of box
- Element scrolls into view smoothly
- Brief yellow flash animation plays

### What to Look For
- ❌ **FAIL**: Multiple boxes appear
- ❌ **FAIL**: All findings highlight
- ✅ **PASS**: Exactly ONE box, matching clicked finding

## Test Scenario 3: Single Highlight Switching

**Goal**: Verify clicking another finding clears previous highlight

### Steps
1. Click finding #1 (should highlight)
2. Verify only #1 is highlighted
3. Click finding #5 (different finding)

### Expected Behavior ✅
- Finding #1 highlight **disappears instantly**
- Finding #5 highlight **appears instantly**
- Only ONE box visible at any time
- No lag or delay
- Element #5 scrolls into view
- Yellow flash animation plays on #5

### What to Look For
- ❌ **FAIL**: Both #1 and #5 highlighted
- ❌ **FAIL**: Multiple boxes visible
- ✅ **PASS**: Only #5 visible, #1 cleared

## Test Scenario 4: Scroll Tracking

**Goal**: Verify highlight stays aligned when scrolling

### Steps
1. Click a finding that's near the top of the page
2. Note the highlight position relative to the element
3. Scroll down 500px
4. Scroll back up to the highlighted element

### Expected Behavior ✅
- Highlight box **moves with the page scroll**
- Box stays **perfectly aligned** with the element
- No offset or misalignment
- Label position updates correctly
- Smooth repositioning (no jank)

### What to Look For
- ❌ **FAIL**: Box stays in fixed position while page scrolls
- ❌ **FAIL**: Box is offset from element
- ✅ **PASS**: Box tracks perfectly with element position

## Test Scenario 5: Keyboard Navigation

**Goal**: Verify Alt+Shift+N/P highlights selected finding

### Steps
1. Open panel (`Alt+Shift+A`)
2. Press `Alt+Shift+N` (next finding)
3. Observe page and panel
4. Press `Alt+Shift+N` again
5. Press `Alt+Shift+P` (previous finding)

### Expected Behavior ✅
- First `Alt+Shift+N`: Finding #1 highlights
- Second `Alt+Shift+N`: Finding #1 clears, Finding #2 highlights
- `Alt+Shift+P`: Finding #2 clears, Finding #1 highlights
- Only ONE highlight visible at a time
- Screen reader announces "Focused finding X of Y"

### What to Look For
- ❌ **FAIL**: Multiple highlights visible
- ❌ **FAIL**: Highlights don't switch
- ✅ **PASS**: Single highlight switches with keyboard nav

## Test Scenario 6: Rule Filter

**Goal**: Verify filter change clears highlights

### Steps
1. Click finding #5 (should highlight)
2. Verify #5 is highlighted
3. Change rule filter dropdown to "img-alt"
4. Observe page

### Expected Behavior ✅
- Finding #5 highlight **clears immediately**
- Findings list updates to show only img-alt issues
- Page returns to clean state (no highlights)
- Selection state resets (no finding selected in panel)

### What to Look For
- ❌ **FAIL**: Old highlight remains visible
- ❌ **FAIL**: All filtered findings highlight
- ✅ **PASS**: Clean page, zero highlights

## Test Scenario 7: GOV.UK Stress Test (500+ findings)

**Goal**: Verify performance with 500+ findings

### Steps
1. Navigate to GOV.UK test cases site
2. Open panel (`Alt+Shift+A`)
3. Wait for scan (may take 5-10 seconds)
4. **Immediately check page for lag/freeze**

### Expected Behavior ✅
- Scan completes showing "500+ issues"
- **Page stays responsive** (no freeze)
- **Zero colored boxes** on page (clean view)
- Panel shows "500+ issues" count
- No memory spike or browser slowdown

### Click Performance Test
5. Click finding #250
6. Click finding #500
7. Rapidly click 10 different findings

### Expected Behavior ✅
- Each click highlights **instantly** (<100ms)
- No lag or delay
- Smooth switching between highlights
- No memory leaks (check Task Manager)
- Browser stays responsive

### What to Look For
- ❌ **FAIL**: Browser freezes on scan
- ❌ **FAIL**: 500+ boxes appear on page
- ❌ **FAIL**: Clicking has noticeable lag
- ✅ **PASS**: Instant response, zero lag, clean page

## Test Scenario 8: Rescan

**Goal**: Verify rescan maintains clean default state

### Steps
1. Panel open with findings visible
2. Click finding #10 (should highlight)
3. Click "Rescan" button in panel
4. Wait for scan to complete

### Expected Behavior ✅
- Scan starts, "Scanning..." message shows
- Old highlight **clears during scan**
- Scan completes with new findings
- **Zero highlights** on page (clean default)
- User must click to see highlights again

### What to Look For
- ❌ **FAIL**: Old highlight persists after rescan
- ❌ **FAIL**: All findings highlight after rescan
- ✅ **PASS**: Clean page after rescan

## Test Scenario 9: Panel Close/Reopen

**Goal**: Verify highlights clear when panel closes

### Steps
1. Click finding #5 (should highlight)
2. Verify #5 is highlighted
3. Press `Alt+Shift+A` or click "Close" to close panel
4. Observe page

### Expected Behavior ✅
- Panel closes smoothly
- Highlight box **disappears immediately**
- Page returns to normal (no overlay)
- Focus returns to page content

### Reopen Test
5. Press `Alt+Shift+A` to reopen panel
6. Observe page

### Expected Behavior ✅
- Previous findings still loaded
- **Zero highlights** on page (clean default)
- User must click to see highlights again

### What to Look For
- ❌ **FAIL**: Highlight persists after close
- ❌ **FAIL**: Highlights reappear on reopen
- ✅ **PASS**: Clean state after close and reopen

## Automated Tests Verification

Before manual testing, ensure automated tests pass:

```bash
cd /home/user/accessinsight-mv3-extension-v2
npm test
```

### Expected Output
```
📊 Results: 15 passed, 0 failed
```

If any tests fail, **do not proceed** with manual testing.

## Performance Checklist

Use Chrome Task Manager (`Shift+Esc`) to monitor:

### Before Opening Panel
- Note baseline memory usage

### After Opening Panel (500+ findings)
- Memory increase should be < 5MB
- No continuous memory growth

### After Clicking 50 Different Findings
- Memory should stabilize (no leaks)
- CPU should return to idle
- No performance warnings in DevTools

## Browser Compatibility

Test on:
- ✅ Chrome (latest)
- ✅ Microsoft Edge (latest)
- ✅ Brave (latest)
- ✅ Any Chromium-based browser

## Bug Report Template

If you find issues, report with:

```markdown
## Bug: [Brief description]

**Test Site**: [URL]
**Test Scenario**: [Scenario number from this guide]
**Browser**: [Chrome 120.0.6099.129]

**Expected**: [What should happen]
**Actual**: [What actually happened]

**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Screenshots**: [Attach if possible]
**Console Errors**: [Check DevTools Console]
```

## Success Criteria Summary

✅ Default overlay state: NO highlights visible (clean view)
✅ Click finding: ONLY that finding highlights (focused attention)
✅ Scroll page: Highlight stays aligned with element (accurate positioning)
✅ Click another: Previous unhighlights, new one highlights (clear interaction)
✅ All existing tests pass: npm test shows 15/15 passing
✅ Performance: No lag with 500+ findings on GOV.UK test site

## Validation Sign-Off

After completing all test scenarios:

- [ ] Test Scenario 1: Clean Default State - PASS/FAIL
- [ ] Test Scenario 2: Click-to-Highlight - PASS/FAIL
- [ ] Test Scenario 3: Single Highlight Switching - PASS/FAIL
- [ ] Test Scenario 4: Scroll Tracking - PASS/FAIL
- [ ] Test Scenario 5: Keyboard Navigation - PASS/FAIL
- [ ] Test Scenario 6: Rule Filter - PASS/FAIL
- [ ] Test Scenario 7: GOV.UK Stress Test - PASS/FAIL
- [ ] Test Scenario 8: Rescan - PASS/FAIL
- [ ] Test Scenario 9: Panel Close/Reopen - PASS/FAIL
- [ ] Automated Tests: 15/15 PASSING

**Overall Result**: PASS / FAIL / NEEDS INVESTIGATION

## Next Steps

If all tests PASS:
- Ready to merge to master
- Update version to v1.1.0 in manifest.json
- Update CHANGELOG.md
- Create release tag

If any tests FAIL:
- Document failures in bug report template
- Create GitHub issue
- Investigate and fix
- Retest
