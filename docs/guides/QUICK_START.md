# ⚡ QUICK START - Next Session

**Read this first, then see [NEXT_SESSION.md](./NEXT_SESSION.md) for details**

---

## ✅ 30-Second Status Check

```bash
# Verify clean state
git status

# Run all tests
node tests/helpers/helpers.test.js

# Should see: "✨ All helper tests passing!"
```

---

## 🎯 Your Mission

**Test 7 ARIA rules in 2-3 hours**

1. Create: `tests/unit/rules/aria-rules.test.js`
2. Copy template from `NEXT_SESSION.md` (search for "Template: First ARIA Rule Test")
3. Run: `node tests/unit/rules/aria-rules.test.js`
4. Add remaining tests following the pattern
5. Commit when done

---

## 📝 The Pattern (Copy This)

```javascript
test('RULE-NAME: detects violation', () => {
  resetDOM();
  const el = fixtures.someFixture();
  document.body.appendChild(el);

  const findings = window.__a11yEngine.run(['RULE-NAME']);

  assertHasViolation(findings, 'RULE-NAME');
});

test('RULE-NAME: passes valid case', () => {
  resetDOM();
  const el = fixtures.validFixture();
  document.body.appendChild(el);

  const findings = window.__a11yEngine.run(['RULE-NAME']);

  assertNoFindings(findings);
});
```

---

## 🎭 ARIA Rules to Test

1. ✅ aria-role-valid
2. ✅ aria-required-props
3. ✅ aria-attr-valid
4. ✅ aria-allowed-attr
5. ✅ aria-required-children
6. ✅ aria-required-parent
7. ✅ aria-presentation-misuse

---

## 🔧 Most Useful Fixtures

```javascript
fixtures.invalidAriaRole()
fixtures.ariaMissingRequiredProps()
fixtures.ariaWithRequiredProps()
fixtures.ariaElement(role, attrs)
```

---

## ✨ Most Useful Assertions

```javascript
assertHasViolation(findings, 'rule-id')
assertNoFindings(findings)
assertWCAGCriteria(finding, ['4.1.2'])
```

---

## 🚨 If Something Breaks

1. Run: `node tests/helpers/helpers.test.js` (should pass)
2. Run: `node tests/regression/bug-fixes.test.js` (should pass)
3. Check: `git diff engine.js` (should be empty)
4. Read: [NEXT_SESSION.md](./NEXT_SESSION.md) → Troubleshooting section

---

## 🎉 When You're Done

```bash
# Run your new tests
node tests/unit/rules/aria-rules.test.js

# Should see: "✨ All ARIA rule tests passing!"

# Commit
git add tests/unit/rules/aria-rules.test.js
git commit -m "test: Add ARIA rule tests (7 rules, 21-28 tests)"
git push origin claude/code-review-analysis-011CUogMaEVAdYeEVQKJYBfN
```

---

**Need more details?** → [NEXT_SESSION.md](./NEXT_SESSION.md)

**Ready to start?** → `touch tests/unit/rules/aria-rules.test.js`

**Let's go!** 🚀
