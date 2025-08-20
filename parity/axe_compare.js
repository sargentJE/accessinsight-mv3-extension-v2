// Paste this in the page Console to run axe and print a comparison summary.
(async () => {
  const loadAxe = () => new Promise((resolve, reject) => {
    if (window.axe) return resolve();
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.8.3/axe.min.js';
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Failed to load axe-core'));
    document.documentElement.appendChild(s);
  });
  try {
    await loadAxe();
    const axeRes = await window.axe.run(document, { resultTypes: ['violations'] });
    const axeCounts = axeRes.violations.reduce((m, v) => { m[v.id] = (m[v.id]||0) + v.nodes.length; return m; }, {});
    console.log('[axe] Violations by rule id:', axeCounts);
    // If our extension injected a global with last findings, print them too (optional manual wiring)
    const ours = window.__A11Y_LAST_RESULTS__ || [];
    const ourCounts = ours.reduce((m, f) => { m[f.ruleId] = (m[f.ruleId]||0) + 1; return m; }, {});
    console.log('[a11y-overlay] Findings by rule id:', ourCounts);
    console.log('[hint] Use the DevTools panel → Copy JSON to export our findings to compare in a diff tool.');
  } catch (e) {
    console.warn('axe compare failed', e);
  }
})();

