# Prompt for Next Session - Copy This

Use this prompt at the start of your next session:

---

I'm continuing work on the AccessInsight MV3 browser extension. In the previous session, we:

1. ✅ Fixed 2 critical bugs (text node traversal, focusability detection)
2. ✅ Created comprehensive test infrastructure (40+ fixtures, 10 assertions, centralized setup)
3. ✅ Added 6 regression tests documenting the bugs
4. ✅ Created 7 helper verification tests
5. ✅ Enhanced color mock (22 colors, percentage RGB, hex alpha)
6. ✅ Achieved 130/130 tests passing (100%)

**Current State:**
- Branch: `claude/code-review-analysis-011CUogMaEVAdYeEVQKJYBfN`
- Tests: 130/130 passing
- Rule Coverage: 13/46 rules (28%)
- All changes committed and pushed

**Next Task: Test 7 ARIA Rules (Phase 4)**

Please read these files in this order:
1. `QUICK_START.md` - Quick reference (read this first)
2. `NEXT_SESSION.md` - Detailed guide with test template

Then help me:
1. Verify current state (run `node tests/helpers/helpers.test.js`)
2. Create `tests/unit/rules/aria-rules.test.js`
3. Use the template from NEXT_SESSION.md to test these 7 rules:
   - aria-role-valid
   - aria-required-props
   - aria-attr-valid
   - aria-allowed-attr
   - aria-required-children
   - aria-required-parent
   - aria-presentation-misuse

**Expected Output:**
- 21-28 new tests
- 151-158 total tests passing
- 20/46 rules tested (43% coverage)
- 2-3 hours of work

**Quality Standards:**
- Use helpers from tests/helpers/ (fixtures, assertions, setup)
- Follow pattern from existing tests
- Each rule needs violation test + passing test
- Keep tests DRY using helpers

Please start by reading QUICK_START.md and confirming you understand the task.

---

END OF PROMPT - Copy everything above this line
