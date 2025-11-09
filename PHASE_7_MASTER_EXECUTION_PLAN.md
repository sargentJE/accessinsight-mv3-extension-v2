# Phase 7 Master Execution Plan: 100% Test Coverage

**Date:** 2025-11-05
**Branch:** `claude/test-aria-rules-phase-4-011CUq3zzD76mLZzj6aKHVc1`
**Status:** 📋 PLANNING COMPLETE - READY TO EXECUTE
**Goal:** Achieve 100% test coverage (46/46 rules)
**Current Coverage:** 34/46 rules (74%)
**Target:** +12 rules, +110-130 tests, 273-283 total tests

---

## 🎯 Executive Summary

This plan details the optimal approach to achieve 100% test coverage by systematically testing the 12 remaining accessibility rules. Through deep analysis of engine implementations, we've identified:

- **2 Simple rules** (quick wins)
- **4 Medium rules** (standard complexity)
- **6 Complex rules** (require careful handling)

The execution is organized into **5 logical waves** prioritized by dependencies, complexity, and risk factors, with built-in quality gates at each stage.

**Estimated Duration:** 180-240 minutes (3-4 hours)
**Expected Tests:** 110-130 new tests
**Success Criteria:** 100% pass rate, zero breaking changes

---

## 📊 Rules Analysis Summary

### Complexity Distribution

| Complexity | Rules | Est. Tests | Est. Time |
|------------|-------|------------|-----------|
| **Simple** | 2 | 10-13 | 30-40 min |
| **Medium** | 4 | 32-40 | 75-90 min |
| **Complex** | 6 | 68-82 | 120-150 min |
| **TOTAL** | **12** | **110-135** | **225-280 min** |

### Rules by Priority

**Wave 1: Quick Wins (2 rules, 10-13 tests, 30-40 min)**
- ✅ `media-captions` (Simple) - 5-6 tests
- ✅ `audio-transcript` (Simple) - 5-7 tests

**Wave 2: Core Interactive (2 rules, 16-20 tests, 45-60 min)**
- ✅ `target-size` (Medium) - 8-10 tests
- ✅ `link-in-text-block` (Medium) - 8-10 tests

**Wave 3: Form & Interaction (2 rules, 18-22 tests, 60-75 min)**
- ✅ `redundant-entry` (Medium) - 8-10 tests
- ✅ `dragging-movements` (Complex) - 10-12 tests

**Wave 4: Authentication (2 rules, 24-30 tests, 60-75 min)**
- ✅ `accessible-authentication-minimum` (Complex, AA) - 12-15 tests
- ✅ `accessible-authentication-enhanced` (Complex, AAA) - 12-15 tests

**Wave 5: Focus Management (4 rules, 42-50 tests, 90-120 min)**
- ✅ `focus-not-obscured-minimum` (Complex, AA) - 10-12 tests
- ✅ `focus-not-obscured-enhanced` (Complex, AAA) - 10-12 tests
- ✅ `focus-appearance` (Complex) - 12-15 tests **⚠️ HIGH LIMITATION**
- ✅ `consistent-help` (Medium) - 6-8 tests **⚠️ HIGH LIMITATION**

---

## 🧩 Strategic Sequencing Rationale

### Why This Order?

**1. Wave 1: Quick Wins First**
- Build momentum with simple rules
- Establish patterns for media testing
- Quick validation of infrastructure
- Confidence boost before tackling complexity

**2. Wave 2: Core Interactive Second**
- Foundational usability rules (target-size is critical)
- Medium complexity provides steady progression
- High-impact AA requirements
- Clear pass/fail criteria (less ambiguity)

**3. Wave 3: Form & Interaction Third**
- Form-related rules logically grouped
- Drag-and-drop testing adds variety
- Medium-to-complex transition point
- Establishes patterns for dynamic interactions

**4. Wave 4: Authentication Fourth**
- Test minimum (AA) before enhanced (AAA)
- Similar implementation patterns (leverage learning)
- Complex but well-defined requirements
- Critical security/accessibility balance

**5. Wave 5: Focus Management Last**
- Most complex rules saved for end
- Two paired rules (minimum + enhanced)
- Leverages all previous learnings
- Contains highest-risk rules (implementation limitations)
- `focus-appearance` and `consistent-help` have known severe limitations

---

## 📝 Detailed Wave Execution Plans

---

### **WAVE 1: Quick Wins (30-40 minutes)**

#### Goal
Establish momentum with simple, straightforward rules. Validate test infrastructure for media elements.

#### Rules to Test

##### 1.1 `media-captions` (5-6 tests, 15-20 min)

**Implementation Summary:**
- Checks `<video>` elements for `<track kind="captions">` or `<track kind="subtitles">`
- Simple DOM query, boolean check
- Cannot verify track file validity or content

**Tests to Create:**
1. Video without any track (violation)
2. Video with track kind="captions" (pass)
3. Video with track kind="subtitles" (pass)
4. Video with track kind="descriptions" only (violation)
5. Video with multiple tracks including captions (pass)
6. Hidden video element (skipped - should pass)

**Fixtures Needed:**
- `videoWithoutCaptions()`
- `videoWithCaptions()`
- `videoWithSubtitles()`
- `videoWithDescriptionsOnly()`
- `videoWithMultipleTracks()`

**Known Limitations to Document:**
- Cannot verify track file exists or loads
- Cannot verify track has actual content
- Cannot detect external player captions (YouTube, Vimeo)
- Cannot distinguish video-only content (which may not need captions)

**WCAG Criteria:** 1.2.2 (Captions - Prerecorded)

---

##### 1.2 `audio-transcript` (5-7 tests, 15-20 min)

**Implementation Summary:**
- Checks `<audio>` elements for `aria-describedby` OR page text matching `/transcript/i`
- Very loose heuristic (any "transcript" text on page counts)
- Simple pattern matching

**Tests to Create:**
1. Audio without aria-describedby or transcript text (violation)
2. Audio with aria-describedby (pass)
3. Audio with nearby "Transcript" link (pass)
4. Audio with "Transcription" text anywhere on page (pass)
5. Multiple audio elements with one transcript section (all pass)
6. Audio with "script" text only (violation - doesn't match pattern)
7. Hidden audio element (skipped - should pass)

**Fixtures Needed:**
- `audioWithoutTranscript()`
- `audioWithAriaDescribedby()`
- `audioWithTranscriptLink()`
- `audioWithTranscriptText()`
- `multipleAudioWithTranscript()`

**Known Limitations to Document:**
- Very loose heuristic - any "transcript" text anywhere counts
- Cannot verify transcript matches audio content
- Cannot validate aria-describedby points to valid element
- May miss transcripts labeled differently

**WCAG Criteria:** 1.2.1 (Audio-only - Prerecorded)

---

#### Wave 1 Quality Gate

**Before proceeding to Wave 2, verify:**
- ✅ 10-13 tests written and passing
- ✅ All fixtures in dom-fixtures.js
- ✅ Limitations documented in test comments
- ✅ WCAG criteria assertions included
- ✅ Both violation and passing cases tested
- ✅ Run: `node tests/unit/rules/media-rules.test.js`
- ✅ No regressions in existing tests: `npm test`

**Expected State After Wave 1:**
- Tests: 223 → 233-236
- Rules: 34 → 36
- Coverage: 74% → 78%
- Time elapsed: 30-40 min

---

### **WAVE 2: Core Interactive (45-60 minutes)**

#### Goal
Test foundational interaction and usability rules with medium complexity. Establish patterns for geometric calculations and color contrast.

#### Rules to Test

##### 2.1 `target-size` (8-10 tests, 25-30 min)

**Implementation Summary:**
- Checks interactive elements are ≥24×24 CSS pixels
- Uses `getBoundingClientRect()` for measurement
- Determines interactive via tag, role, tabindex, href
- Evaluates visible elements only

**Tests to Create:**
1. Button 24×24px exactly (pass)
2. Button 23×30px (violation - one dimension too small)
3. Link with href 20×20px (violation)
4. Link without href (skipped - not interactive)
5. Input field 30×25px (pass)
6. Element with role="button" and tabindex="0", 22×22px (violation)
7. Disabled button 20×20px (still evaluated - violation)
8. Large button 50×50px (pass)
9. Inline element with role="button" 23×24px (violation)
10. SVG with interactive role 24×24px (pass)

**Fixtures Needed:**
- `smallButton(width, height)` - parameterized for various sizes
- `tinyLink()` - 20×20px link
- `linkWithoutHref()` - non-interactive link
- `largeButton()` - 50×50px
- `interactiveRole(role, width, height)` - custom element
- `disabledSmallButton()` - disabled but still too small

**Known Limitations to Document:**
- Uses bounding rectangle, not actual hit target area
- Doesn't account for CSS transforms affecting clickable area
- Doesn't check spacing between targets
- May report false positives for visual size ≠ bounding box

**WCAG Criteria:** 2.5.8 (Target Size - Minimum)

**Special Considerations:**
- Need to apply CSS styles for exact dimensions
- Test both width AND height checks (flags if EITHER < 24px)
- Verify disabled elements are still evaluated

---

##### 2.2 `link-in-text-block` (8-10 tests, 25-30 min)

**Implementation Summary:**
- Checks links in text blocks have visual distinction beyond color
- Considers distinguished if: underline OR border-bottom OR 3:1 color contrast
- Only checks links inside `p, li, dd, dt, span, div`
- Uses color contrast calculation

**Tests to Create:**
1. Link with text-decoration: underline (pass)
2. Link with border-bottom (pass)
3. Link with 3:1 contrast, no underline (pass)
4. Link with 2.9:1 contrast, no underline (violation)
5. Link with text-decoration: none and insufficient contrast (violation)
6. Link outside text block in nav (skipped - not in text block)
7. Link in span inside paragraph (evaluated - should pass if distinguished)
8. Link with only font-weight difference (violation if contrast < 3:1)
9. Link with outline instead of underline (violation unless contrast ≥3:1)
10. Link with sufficient contrast via background color (pass if ≥3:1)

**Fixtures Needed:**
- `textBlockWithUnderlinedLink()` - standard underlined link
- `textBlockWithBorderedLink()` - border-bottom styling
- `textBlockWithContrastLink(ratio)` - parameterized contrast
- `textBlockWithPlainLink()` - no underline, same color as text
- `linkInNavigation()` - outside text block
- `nestedTextLink()` - link in span in paragraph

**Known Limitations to Document:**
- Only checks immediate parent block's text color
- Doesn't account for actual adjacent sibling text colors
- Doesn't consider hover/focus states
- May miss links in block types not in selector list
- Doesn't check for other distinctions (bold, size, icons)

**WCAG Criteria:** 1.4.1 (Use of Color)

**Special Considerations:**
- Need accurate color contrast calculation
- Test multiple parent block types (p, li, etc.)
- Verify exact 3:1 threshold (2.9 fails, 3.0 passes)
- May need contrast calculation helper

---

#### Wave 2 Quality Gate

**Before proceeding to Wave 3, verify:**
- ✅ 16-20 new tests written and passing (cumulative: 26-33)
- ✅ Geometric and color fixtures working correctly
- ✅ CSS styles properly applied for target sizing
- ✅ Color contrast calculations accurate
- ✅ Limitations documented
- ✅ Run: `node tests/unit/rules/interactive-core.test.js`
- ✅ No regressions: `npm test`

**Expected State After Wave 2:**
- Tests: 236 → 249-256
- Rules: 36 → 38
- Coverage: 78% → 83%
- Time elapsed: 75-100 min

---

### **WAVE 3: Form & Interaction (60-75 minutes)**

#### Goal
Test form-related patterns and drag-and-drop functionality. Establish patterns for form field analysis and event handler detection.

#### Rules to Test

##### 3.1 `redundant-entry` (8-10 tests, 30-35 min)

**Implementation Summary:**
- Detects duplicate form fields that might require re-entering information
- Creates patterns from type, name, id, placeholder, label
- Flags fields with duplicate patterns
- Special handling for password confirmation fields

**Tests to Create:**
1. Single email field (no issue)
2. Two email fields in same form (both flagged)
3. Email field in two different forms (both flagged)
4. Password + confirm password (confirm flagged)
5. Shipping and billing address fields (both flagged)
6. Multiple phone number fields with different names (flagged)
7. Two input type="text" with completely different names (no issue)
8. Name field appearing twice (both flagged)
9. Fields with autocomplete attributes (still flagged - autocomplete not checked)
10. Select elements with duplicate patterns (flagged)

**Fixtures Needed:**
- `singleEmailField()` - single field in form
- `duplicateEmailFields()` - two email inputs
- `emailFieldsInTwoForms()` - email in multiple forms
- `passwordWithConfirmation()` - password + confirm
- `duplicateAddressFields()` - shipping + billing
- `duplicatePhoneFields()` - multiple phone inputs
- `differentTextFields()` - unrelated text inputs

**Known Limitations to Document:**
- Single-page analysis only (cannot detect cross-page redundancy)
- Cannot detect if information was entered in previous session
- Cannot verify if autocomplete actually helps
- Pattern matching may group unrelated fields
- May not detect redundancy if naming differs significantly
- Password confirmation flagged even though necessary for security

**WCAG Criteria:** 3.3.7 (Redundant Entry)

**Special Considerations:**
- Test both same-form and cross-form duplicates
- Verify password confirmation special case
- Test various input types (email, tel, text)
- Check pattern generation logic

---

##### 3.2 `dragging-movements` (10-12 tests, 30-40 min)

**Implementation Summary:**
- Finds draggable elements via `[draggable="true"]` or drag event attributes
- Checks for alternatives: click handlers, keyboard handlers, ARIA roles, form controls
- Special exceptions for essential drag (file input, canvas)
- **MAJOR LIMITATION:** Only detects inline event handlers, not `addEventListener`

**Tests to Create:**
1. Element with draggable="true" and onclick (pass)
2. Element with draggable="true" but no alternatives (violation)
3. Element with ondragstart and onkeydown (pass)
4. File input with drag-drop (pass - essential exception)
5. Canvas element with drag (pass - essential exception)
6. Sortable list item with drag-only functionality (violation)
7. Drag handle with role="button" (pass)
8. Element with draggable="true" and interactive ARIA role (pass)
9. Element with ondrop but also onclick (pass)
10. Element with class="file-drop" (pass - essential heuristic)
11. Draggable element that's also a form button (pass)
12. Hidden draggable element (skipped)

**Fixtures Needed:**
- `draggableWithClick()` - draggable + onclick
- `draggableWithoutAlternatives()` - drag-only
- `draggableWithKeyboard()` - drag + keyboard handler
- `fileInputWithDragDrop()` - input type="file"
- `canvasWithDrag()` - canvas element
- `sortableListItem()` - drag without alternative
- `dragHandleWithRole()` - role="button"
- `draggableButton()` - button with draggable="true"

**Known Limitations to Document:**
- **CRITICAL:** Cannot detect `addEventListener` event handlers
- Only detects inline attributes (ondragstart, ondrop, etc.)
- Cannot verify alternatives actually provide same functionality
- Essential drag detection is heuristic (class names)
- May miss custom drag implementations
- Confidence 0.8 due to detection limitations

**WCAG Criteria:** 2.5.7 (Dragging Movements)

**Special Considerations:**
- Test multiple alternative types (click, keyboard, role, form control)
- Test essential drag exceptions
- Document addEventListener limitation prominently
- Test both draggable attribute and event attributes

---

#### Wave 3 Quality Gate

**Before proceeding to Wave 4, verify:**
- ✅ 18-22 new tests written and passing (cumulative: 44-55)
- ✅ Form field pattern detection working
- ✅ Drag-and-drop alternatives properly tested
- ✅ Event handler detection limitations documented
- ✅ Run: `node tests/unit/rules/form-interaction.test.js`
- ✅ No regressions: `npm test`

**Expected State After Wave 3:**
- Tests: 256 → 267-278
- Rules: 38 → 40
- Coverage: 83% → 87%
- Time elapsed: 135-175 min

---

### **WAVE 4: Authentication (60-75 minutes)**

#### Goal
Test authentication cognitive requirements for both AA and AAA levels. Establish patterns for CAPTCHA, password complexity, and 2FA detection.

#### Rules to Test

##### 4.1 `accessible-authentication-minimum` (12-15 tests, 30-40 min)

**Implementation Summary:**
- AA level: Cognitive function tests must have alternatives
- Detects: CAPTCHA, password complexity requirements, 2FA codes
- Checks for alternatives: audio CAPTCHA, password manager, multiple 2FA methods
- Flags if cognitive test exists without alternatives

**Tests to Create:**
1. CAPTCHA without audio alternative (violation)
2. CAPTCHA with audio button (pass)
3. Password field without complexity requirements (pass)
4. Password field with complexity + autocomplete (pass)
5. Password field with complex requirements, no autocomplete (violation)
6. Simple password field with autocomplete="off" but no complexity (pass)
7. Password with one complexity requirement + autocomplete (pass)
8. 2FA code input without alternatives mentioned (violation)
9. 2FA with "email or SMS" text nearby (pass)
10. 2FA with "backup codes" mentioned (pass)
11. reCAPTCHA implementation (check for audio)
12. Password with uppercase+lowercase+number requirements (violation if no autocomplete)
13. Biometric authentication with password fallback (pass)
14. Security questions without alternatives (violation)
15. Magic link authentication (pass - no cognitive test)

**Fixtures Needed:**
- `captchaWithoutAudio()` - CAPTCHA div without audio button
- `captchaWithAudio()` - CAPTCHA with audio alternative
- `simplePasswordField()` - basic password input
- `complexPasswordWithAutocomplete()` - requirements + autocomplete
- `complexPasswordWithoutAutocomplete()` - requirements, no autocomplete
- `twoFactorCodeInput()` - 2FA input alone
- `twoFactorWithAlternatives()` - 2FA + "email or SMS" text
- `reCaptchaWidget()` - reCAPTCHA implementation
- `biometricWithFallback()` - fingerprint + password option
- `securityQuestionsForm()` - security questions

**Known Limitations to Document:**
- Pattern matching may miss non-standard authentication
- Cannot verify if alternatives actually work
- Cannot test actual cognitive burden
- Nearby text search is limited
- Cannot detect JavaScript-based CAPTCHA implementations
- Cannot verify password managers if autocomplete missing
- Cannot verify audio CAPTCHA functionality
- Confidence 0.7 due to heuristic nature

**WCAG Criteria:** 3.3.8 (Accessible Authentication - Minimum)

**Special Considerations:**
- Test all three cognitive test types (CAPTCHA, password, 2FA)
- Verify alternative detection for each type
- Test autocomplete attribute presence/absence
- Check nearby text for alternative mentions
- Test reCAPTCHA specifically (common implementation)

---

##### 4.2 `accessible-authentication-enhanced` (12-15 tests, 30-40 min)

**Implementation Summary:**
- AAA level: NO cognitive function tests allowed (no exceptions)
- Broader detection: CAPTCHA, puzzle, math, memorize, password complexity (>2 requirements)
- Enhanced password analysis: counts complexity requirements (flags if >2)
- Biometric acceptable if password fallback exists

**Tests to Create:**
1. Any CAPTCHA present (violation - no exceptions for AAA)
2. Password with 3+ complexity requirements (violation)
3. Password with 2 requirements (pass)
4. Password with 1 requirement (pass)
5. Simple username/password (pass)
6. Password with uppercase+lowercase requirements only (pass - 2 requirements)
7. Password with uppercase+lowercase+number (violation - 3 requirements)
8. Password with "must contain special character" (check count)
9. Security questions (violation)
10. Math challenge (violation)
11. Biometric with password fallback (pass)
12. Biometric only, no fallback (violation)
13. Social login buttons only (pass - no cognitive test)
14. Magic link authentication (pass)
15. Page with "remember me" checkbox (may trigger "remember" pattern - test)

**Fixtures Needed:**
- `anyCaptchaPresent()` - any CAPTCHA implementation
- `passwordWithThreeRequirements()` - uppercase+lowercase+number
- `passwordWithTwoRequirements()` - uppercase+lowercase
- `passwordWithOneRequirement()` - just "minimum 8 characters"
- `simpleLoginForm()` - basic username/password
- `securityQuestions()` - security question inputs
- `mathChallenge()` - "What is 5+3?" challenge
- `biometricWithFallback()` - fingerprint + password
- `biometricOnly()` - fingerprint without fallback
- `socialLoginButtons()` - OAuth buttons
- `magicLinkAuth()` - email-based magic link
- `rememberMeCheckbox()` - checkbox with "remember" text

**Known Limitations to Document:**
- Very strict - may flag legitimate security requirements
- Cannot determine if cognitive requirements essential for security
- Word "remember" may cause false positives
- Cannot verify password manager actually works
- Biometric fallback detection is heuristic
- May flag minimal password requirements
- Confidence 0.7, AAA means many edge cases
- Cannot distinguish registration vs. login flows

**WCAG Criteria:** 3.3.9 (Accessible Authentication - Enhanced)

**Special Considerations:**
- Test minimum (AA) vs. enhanced (AAA) differences
- Verify complexity requirement counting (threshold at >2)
- Test biometric fallback detection
- Test for false positives on "remember me" text
- Leverage learnings from minimum version
- Test AAA strictness (no exceptions)

---

#### Wave 4 Quality Gate

**Before proceeding to Wave 5, verify:**
- ✅ 24-30 new tests written and passing (cumulative: 68-85)
- ✅ Authentication pattern detection working
- ✅ CAPTCHA alternatives properly tested
- ✅ Password complexity counting accurate
- ✅ 2FA alternative detection working
- ✅ Differences between AA and AAA clear
- ✅ Run: `node tests/unit/rules/authentication.test.js`
- ✅ No regressions: `npm test`

**Expected State After Wave 4:**
- Tests: 278 → 291-308
- Rules: 40 → 42
- Coverage: 87% → 91%
- Time elapsed: 195-250 min

---

### **WAVE 5: Focus Management (90-120 minutes)**

#### Goal
Complete the most complex rules involving focus state management and positioning calculations. Handle rules with severe implementation limitations carefully.

#### Rules to Test

##### 5.1 `focus-not-obscured-minimum` (10-12 tests, 25-35 min)

**Implementation Summary:**
- AA level: Focus indicators must not be fully obscured
- Checks for overlapping elements with position: absolute/fixed and z-index > 0
- Also flags position: sticky with top !== auto
- Cannot simulate actual focus state (limitation)

**Tests to Create:**
1. Focusable element with no overlapping elements (pass)
2. Focusable element under fixed header with z-index: 100 (violation)
3. Focusable element with absolute tooltip over it (violation)
4. Focusable element with position: sticky (violation)
5. Overlapping element with z-index: 0 (may pass - check z-index threshold)
6. Button under modal dialog backdrop (violation)
7. Input field at viewport edge (check edge detection)
8. Focusable element with higher z-index than overlay (check stacking)
9. Sticky navigation partially covering input (violation)
10. Focusable element with no position: static (no overlay) (pass)
11. Focusable element with transform positioning (test detection)
12. Multiple overlapping elements (violation)

**Fixtures Needed:**
- `focusableWithoutOverlap()` - clean button/input
- `focusableUnderFixedHeader()` - fixed header over element
- `focusableWithTooltip()` - absolute positioned tooltip
- `focusableWithStickyPosition()` - position: sticky element
- `buttonUnderModal()` - modal with backdrop
- `inputAtViewportEdge()` - element near edge
- `elementWithHighZIndex()` - z-index higher than overlay
- `stickyNavWithContent()` - sticky nav + content below

**Known Limitations to Document:**
- **MAJOR:** Cannot simulate actual :focus state
- Checks unfocused state only
- Cannot verify if focus indicator extends beyond bounds
- Performance intensive (checks all elements)
- Rectangle overlap doesn't account for opacity
- Z-index calculation simplified (doesn't handle stacking contexts)
- Confidence 0.7 due to static analysis

**WCAG Criteria:** 2.4.12 (Focus Not Obscured - Minimum)

**Special Considerations:**
- Test various positioning types (absolute, fixed, sticky)
- Test z-index threshold detection
- Test multiple overlapping scenarios
- Document inability to test actual focus state
- May need to mock getBoundingClientRect for overlaps

---

##### 5.2 `focus-not-obscured-enhanced` (10-12 tests, 25-35 min)

**Implementation Summary:**
- AAA level: Focus indicators must not have ANY obscuration (stricter)
- Same detection as minimum but flags ANY overlap (not just full obscuration)
- Also checks if near viewport edge (<20px from edge)
- Calculates overlap percentage

**Tests to Create:**
1. Element with no overlapping content (pass)
2. Element with 1% overlap (violation - AAA is strict)
3. Element with 50% overlap (violation)
4. Element with position: sticky (violation)
5. Element with position: fixed (violation)
6. Element with position: absolute and z-index (violation)
7. Element near top viewport edge (violation - <20px)
8. Element near bottom viewport edge (violation)
9. Element with complete obscuration (violation)
10. Element with transparent overlay (check if detected as overlap)
11. Element in scrollable container (test detection)
12. Multiple risk factors (sticky + near edge) (violation)

**Fixtures Needed:**
- `elementWithNoOverlap()` - clean element
- `elementWithPartialOverlap(percentage)` - parameterized overlap
- `elementWithStickyPosition()` - sticky element
- `elementWithFixedPosition()` - fixed element
- `elementNearTopEdge()` - <20px from top
- `elementNearBottomEdge()` - <20px from bottom
- `elementWithTransparentOverlay()` - opacity overlay
- `elementWithMultipleRisks()` - sticky + near edge

**Known Limitations to Document:**
- Same limitations as minimum version plus:
- More conservative (more false positives)
- AAA means anything risky is flagged
- 20px viewport edge threshold is arbitrary
- Cannot determine if partial obscuration is acceptable
- Lower confidence (0.6) due to enhanced sensitivity
- May flag many elements near sticky headers/footers

**WCAG Criteria:** 2.4.13 (Focus Not Obscured - Enhanced)

**Special Considerations:**
- Test minimum vs. enhanced differences (ANY overlap vs. full)
- Verify overlap percentage calculation
- Test viewport edge detection (20px threshold)
- Test multiple risk factor combinations
- Leverage patterns from minimum version
- Expect more violations than minimum (stricter)

---

##### 5.3 `focus-appearance` (12-15 tests, 30-40 min)

**Implementation Summary:**
- Checks for visible focus indicators
- Looks for: outline, box-shadow, class names containing "focus", explicit outline width
- **MAJOR LIMITATION:** Cannot simulate :focus state, relies on heuristics and static analysis

**Tests to Create:**
1. Element with default browser outline (pass)
2. Element with outline: none and no alternative (violation)
3. Element with box-shadow (pass)
4. Element with class="focus-ring" (pass - heuristic match)
5. Element with class="btn-focus" (pass - heuristic match)
6. Element with background-color change only via :focus (violation - not detected)
7. Element with border-color change only (violation - not detected)
8. Disabled element (skipped)
9. Element with :focus-visible implementation (violation - cannot detect pseudo-class)
10. Element with JavaScript-driven focus indicator (violation - not detected)
11. Element with outline: 2px solid blue (pass - explicit width)
12. Element with outline: 0px (violation)
13. Custom focus indicator via :focus-within (violation - not detected)
14. Element with focus-visible polyfill class (may pass if class matches)
15. Element with outline-offset styling (check detection)

**Fixtures Needed:**
- `elementWithDefaultOutline()` - browser default
- `elementWithOutlineNone()` - outline: none
- `elementWithBoxShadow()` - box-shadow indicator
- `elementWithFocusClass()` - class="focus-ring"
- `elementWithBackgroundFocus()` - background change only
- `disabledElement()` - disabled control
- `elementWithExplicitOutline()` - outline: 2px solid
- `elementWithZeroOutline()` - outline: 0px
- `elementWithJSFocus()` - JS-driven indicator
- `elementWithFocusVisible()` - :focus-visible styles

**Known Limitations to Document:**
- **CRITICAL:** Cannot simulate actual :focus state
- Cannot detect CSS :focus or :focus-visible pseudo-classes
- Cannot measure contrast ratio of focus indicator
- Cannot measure size/thickness of indicator
- Class name heuristic is unreliable
- Cannot detect JavaScript-added indicators
- Low confidence (0.7) due to these limitations
- Does NOT verify WCAG 2.4.11 specific requirements (2px, 3:1 contrast)

**WCAG Criteria:** 2.4.11 (Focus Appearance), 2.4.7 (Focus Visible)

**Special Considerations:**
- **HIGH RISK:** Severe implementation limitations
- Tests validate engine behavior, not WCAG compliance
- Heavily document limitations in test comments
- Test heuristics (class names, static properties)
- Cannot verify actual focus appearance
- Consider test as "engine capability check" not accessibility check
- May have many false negatives/positives

---

##### 5.4 `consistent-help` (6-8 tests, 20-30 min)

**Implementation Summary:**
- Checks if help mechanisms appear in consistent order across pages
- Searches for: contact, email, phone, chat, FAQ, form
- **MAJOR LIMITATION:** Single-page analysis cannot validate cross-page consistency

**Tests to Create:**
1. Page with one help mechanism (no issues flagged - single item can't be inconsistent)
2. Page with multiple help mechanisms (all flagged for manual review)
3. Page with contact link in header and footer (both flagged for review)
4. Page with email link (mailto:) (detected and may be flagged)
5. Page with phone link (tel:) (detected and may be flagged)
6. Page with FAQ section (detected and may be flagged)
7. Page with contact form (detected and may be flagged)
8. Page with no help mechanisms (no issues - nothing to check)

**Fixtures Needed:**
- `pageWithSingleHelpLink()` - one contact link
- `pageWithMultipleHelp()` - contact + email + phone
- `pageWithHelpHeaderFooter()` - help in header and footer
- `pageWithEmailLink()` - mailto: link
- `pageWithPhoneLink()` - tel: link
- `pageWithFAQSection()` - FAQ heading/section
- `pageWithContactForm()` - form with "contact" text
- `pageWithNoHelp()` - no help mechanisms

**Known Limitations to Document:**
- **CRITICAL:** Single-page analysis cannot validate cross-page consistency
- Can only flag that multiple help mechanisms exist
- Cannot verify actual order consistency across site
- Low confidence (0.6) due to single-page limitation
- Pattern matching may miss unconventional help text
- Cannot verify help mechanism functionality
- False positives if decorative text matches patterns
- Evidence states "cross-page validation requires manual review"

**WCAG Criteria:** 3.2.6 (Consistent Help)

**Special Considerations:**
- **HIGH RISK:** Severely limited by single-page analysis
- Tests validate engine behavior (detection), not actual consistency
- All multi-mechanism pages will flag for manual review
- Document that rule is informational/detection only
- Cannot truly test WCAG requirement (needs multi-page)
- Consider test as "help mechanism detection check"
- Set expectations: tests verify detection logic, not consistency

---

#### Wave 5 Quality Gate

**Before declaring completion, verify:**
- ✅ 42-50 new tests written and passing (cumulative: 110-135)
- ✅ Focus management patterns implemented
- ✅ Obscuration detection working (min and enhanced)
- ✅ High-limitation rules thoroughly documented
- ✅ Run: `node tests/unit/rules/focus-management.test.js`
- ✅ No regressions: `npm test`
- ✅ **FINAL CHECK:** All 12 rules tested

**Expected State After Wave 5:**
- Tests: 308 → 333-358 (target: 273-283 actual, check analysis)
- Rules: 42 → 46 (100% coverage!)
- Coverage: 91% → **100%** ✅
- Time elapsed: 285-370 min (4.75-6 hours, adjust for efficiency)

---

## 🏗️ Test File Organization

### New Test Files to Create

1. **`tests/unit/rules/media-rules.test.js`** (Wave 1)
   - media-captions
   - audio-transcript
   - ~10-13 tests

2. **`tests/unit/rules/interactive-core.test.js`** (Wave 2)
   - target-size
   - link-in-text-block
   - ~16-20 tests

3. **`tests/unit/rules/form-interaction.test.js`** (Wave 3)
   - redundant-entry
   - dragging-movements
   - ~18-22 tests

4. **`tests/unit/rules/authentication.test.js`** (Wave 4)
   - accessible-authentication-minimum
   - accessible-authentication-enhanced
   - ~24-30 tests

5. **`tests/unit/rules/focus-management.test.js`** (Wave 5)
   - focus-not-obscured-minimum
   - focus-not-obscured-enhanced
   - focus-appearance
   - consistent-help
   - ~42-50 tests

### Fixture Organization in `dom-fixtures.js`

Group fixtures by wave/category:
```javascript
// ===== Media Fixtures (Wave 1) =====
videoWithoutCaptions: () => { ... },
videoWithCaptions: () => { ... },
audioWithoutTranscript: () => { ... },
// ... etc

// ===== Interactive Fixtures (Wave 2) =====
smallButton: (width, height) => { ... },
textBlockWithUnderlinedLink: () => { ... },
// ... etc

// ===== Form/Interaction Fixtures (Wave 3) =====
duplicateEmailFields: () => { ... },
draggableWithClick: () => { ... },
// ... etc

// ===== Authentication Fixtures (Wave 4) =====
captchaWithoutAudio: () => { ... },
complexPasswordWithAutocomplete: () => { ... },
// ... etc

// ===== Focus Fixtures (Wave 5) =====
focusableUnderFixedHeader: () => { ... },
elementWithOutlineNone: () => { ... },
// ... etc
```

---

## ⚠️ Risk Mitigation Strategies

### High-Risk Areas

#### 1. Focus State Limitations (focus-appearance)
**Risk:** Cannot test :focus pseudo-class, high false positive/negative rate
**Mitigation:**
- Test engine's heuristics, not actual focus appearance
- Heavily document limitations in every test
- Use comments like "Note: Engine cannot detect :focus styles"
- Set expectations that tests verify static analysis capability
- Consider adding confidence ratings in test names

#### 2. Single-Page Analysis (consistent-help, redundant-entry)
**Risk:** Cannot validate cross-page consistency or cross-session redundancy
**Mitigation:**
- Document that rules are informational/detection only
- Test detection logic, not actual consistency
- Use comments like "Single-page limitation: cannot verify cross-page consistency"
- Tests verify engine finds help mechanisms, not their consistency

#### 3. Event Listener Detection (dragging-movements)
**Risk:** Cannot detect `addEventListener` handlers, only inline attributes
**Mitigation:**
- Document limitation prominently in every drag test
- Focus tests on inline handler detection (ondragstart, etc.)
- Note in comments: "Limitation: addEventListener not detected"
- Test essential drag exceptions thoroughly

#### 4. Color Contrast Calculations (link-in-text-block)
**Risk:** Complex color parsing and contrast ratio calculations
**Mitigation:**
- Test exact 3:1 threshold carefully (2.9 fails, 3.0 passes)
- Use known RGB values with pre-calculated contrast ratios
- Verify edge cases (exactly 3:1, very close ratios)
- May need to review engine's contrast calculation logic first

#### 5. Geometric Calculations (target-size, focus-not-obscured)
**Risk:** getBoundingClientRect may behave differently in JSDOM
**Mitigation:**
- Apply explicit CSS width/height in fixtures
- Test edge cases (exactly 24px, 23px, 25px)
- Verify JSDOM supports getBoundingClientRect
- May need to mock or use createTestElement with styles

#### 6. Pattern Matching Heuristics (authentication rules)
**Risk:** Text pattern matching may be fragile or inconsistent
**Mitigation:**
- Test explicit patterns from engine implementation
- Verify case-insensitive matching where expected
- Test both presence and absence of patterns
- Test pattern variations (e.g., "transcript" vs "transcription")

---

## ✅ Quality Gates & Success Criteria

### Pre-Execution Checklist
- [ ] All fixture specifications reviewed
- [ ] Engine implementations analyzed for all 12 rules
- [ ] Test file structure planned
- [ ] Known limitations documented
- [ ] Helper functions available (color contrast, if needed)

### Per-Wave Quality Gates

**After Each Wave:**
1. ✅ All wave tests pass
2. ✅ No regressions in existing tests (`npm test`)
3. ✅ Fixtures added to dom-fixtures.js
4. ✅ Limitations documented in test comments
5. ✅ WCAG criteria assertions included
6. ✅ Both violation and passing cases tested
7. ✅ Code follows established patterns
8. ✅ Test names are clear and descriptive

### Final Completion Criteria

**Phase 7 Complete When:**
1. ✅ All 12 rules have test coverage
2. ✅ 110-135 new tests written
3. ✅ 100% pass rate (273-283 total tests)
4. ✅ All 46 rules tested (100% coverage)
5. ✅ Zero breaking changes in existing tests
6. ✅ All known limitations documented
7. ✅ Fixtures organized and reusable
8. ✅ Test files follow established patterns
9. ✅ WCAG criteria validated in all tests
10. ✅ Completion report documentation created
11. ✅ Git commit with clear message
12. ✅ Changes pushed to branch

---

## 📈 Progress Tracking

### Execution Checklist

**Wave 1: Quick Wins** (30-40 min)
- [ ] media-captions (5-6 tests)
- [ ] audio-transcript (5-7 tests)
- [ ] Wave 1 quality gate passed

**Wave 2: Core Interactive** (45-60 min)
- [ ] target-size (8-10 tests)
- [ ] link-in-text-block (8-10 tests)
- [ ] Wave 2 quality gate passed

**Wave 3: Form & Interaction** (60-75 min)
- [ ] redundant-entry (8-10 tests)
- [ ] dragging-movements (10-12 tests)
- [ ] Wave 3 quality gate passed

**Wave 4: Authentication** (60-75 min)
- [ ] accessible-authentication-minimum (12-15 tests)
- [ ] accessible-authentication-enhanced (12-15 tests)
- [ ] Wave 4 quality gate passed

**Wave 5: Focus Management** (90-120 min)
- [ ] focus-not-obscured-minimum (10-12 tests)
- [ ] focus-not-obscured-enhanced (10-12 tests)
- [ ] focus-appearance (12-15 tests)
- [ ] consistent-help (6-8 tests)
- [ ] Wave 5 quality gate passed

**Finalization** (20-30 min)
- [ ] All tests passing
- [ ] No regressions
- [ ] Documentation complete
- [ ] Git commit & push
- [ ] Phase 7 complete! 🎉

---

## 🎯 Expected Outcomes

### Quantitative Results
- **Starting State:** 223 tests, 34/46 rules (74%)
- **Final State:** 333-358 tests, 46/46 rules (100%)
- **Growth:** +110-135 tests, +12 rules
- **Pass Rate:** 100%

### Qualitative Results
- Complete test coverage of all accessibility rules
- Comprehensive documentation of engine limitations
- Robust fixture library for all rule types
- Production-ready test suite
- Clear patterns for future maintenance

### Documentation Deliverables
1. **PHASE_7_COMPLETION_REPORT.md**
   - Detailed execution summary
   - Rule-by-rule breakdown
   - Challenges and solutions
   - Engine limitations found
   - Time tracking

2. **Updated PHASES_4_5_6_COMPLETE.md** → **ALL_PHASES_COMPLETE.md**
   - Comprehensive project summary
   - Complete statistics
   - All 46 rules documented
   - Best practices
   - Maintenance guide

---

## 🚀 Execution Commands

### Per-Wave Test Execution
```bash
# Wave 1
node tests/unit/rules/media-rules.test.js

# Wave 2
node tests/unit/rules/interactive-core.test.js

# Wave 3
node tests/unit/rules/form-interaction.test.js

# Wave 4
node tests/unit/rules/authentication.test.js

# Wave 5
node tests/unit/rules/focus-management.test.js

# Full Suite
npm test
```

### Git Workflow
```bash
# After each wave (or at end)
git add tests/
git commit -m "test: Phase 7 Wave X - [rules tested] test suite"

# Final commit
git add .
git commit -m "test: Phase 7 complete - 100% test coverage (46/46 rules)"
git push -u origin claude/test-aria-rules-phase-4-011CUq3zzD76mLZzj6aKHVc1
```

---

## 💡 Key Success Factors

1. **Follow the Wave Sequence** - Don't skip ahead; each wave builds on previous learnings
2. **Test Engine Behavior** - Test what the engine actually does, not what specs say
3. **Document Limitations Heavily** - Especially for high-risk rules
4. **Quality Gates Are Mandatory** - Don't proceed if a wave has issues
5. **Leverage Established Patterns** - Use existing test structures from Phases 4-6
6. **Both Cases Always** - Test violations AND passing scenarios for every rule
7. **WCAG Assertions** - Include assertWCAGCriteria in all tests
8. **Clear Test Names** - Test names should state exactly what's being tested
9. **Fixture Reusability** - Design fixtures to be parameterized where possible
10. **Continuous Validation** - Run `npm test` after each wave

---

## 📚 Reference Materials

### Engine Implementation
- **File:** `/home/user/accessinsight-mv3-extension-v2/engine.js`
- **Lines:** 792-2479 (12 rules to implement)

### Existing Test Patterns
- **ARIA Tests:** `tests/unit/rules/aria-rules.test.js`
- **Structural Tests:** `tests/unit/rules/structural-rules.test.js`
- **Interactive Tests:** `tests/unit/rules/interactive-rules.test.js`

### Helper Infrastructure
- **Fixtures:** `tests/helpers/dom-fixtures.js`
- **Assertions:** `tests/helpers/assertions.js`
- **Setup:** `tests/helpers/jsdom-setup.js`

### Previous Planning Documents
- `PHASE_4_ANALYSIS_AND_PHASE_5_PLAN.md`
- `PHASE_5_COMPLETION_REPORT.md`
- `PHASE_6_COMPREHENSIVE_PLAN.md`
- `PHASE_6_COMPLETION_REPORT.md`
- `PHASES_4_5_6_COMPLETE.md`

---

## 🎓 Lessons from Previous Phases

1. **Planning Saves Time** - Comprehensive planning (like this) makes execution faster
2. **Document as You Go** - Don't batch documentation at the end
3. **Test Actual Implementation** - Specifications don't always match engine behavior
4. **Quality Over Speed** - Better to go slower and get it right
5. **Proactive Gap Finding** - Look for issues before they become problems
6. **Pattern Consistency** - Following established patterns reduces errors
7. **Clear Commits** - Logical git history helps debugging
8. **Celebrate Milestones** - Each wave completion is an achievement

---

## 🎯 Final Thoughts

This plan represents a systematic, well-reasoned approach to achieving 100% test coverage. The wave structure provides:
- **Clear progression** from simple to complex
- **Built-in checkpoints** to catch issues early
- **Logical grouping** of related rules
- **Risk mitigation** for high-complexity areas
- **Flexibility** to adjust if issues arise

By following this plan carefully and respecting the quality gates, we'll achieve complete test coverage with high confidence in the results.

**Ready to achieve 100% coverage! 🚀**

---

**Document Status:** ✅ COMPLETE - READY FOR EXECUTION
**Last Updated:** 2025-11-05
**Total Planning Time:** 60 minutes
**Prepared By:** Claude (AI Assistant)
**Execution Start:** Awaiting user approval
