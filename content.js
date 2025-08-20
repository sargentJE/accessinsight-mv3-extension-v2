// content.js — overlay + keyboardable panel, with rule filter and DevTools messaging
(function() {
  const DEBUG = false;
  if (window.top !== window) return;
  const STATE_KEY = '__a11yOverlayState';
  const getState = () => (window[STATE_KEY] ||= { enabled: false, findings: [], index: -1 });
  const setState = (patch) => Object.assign(getState(), patch);

  window.__a11yConfig = { enabledRules: [] };
  try {
    chrome.storage && chrome.storage.local && chrome.storage.local.get(['enabledRules'], ({ enabledRules }) => {
      if (Array.isArray(enabledRules) && enabledRules.length) window.__a11yConfig.enabledRules = enabledRules;
    });
  } catch {}
  // Engine behavior/profile + needsReview visibility
  let engineProfile = 'default';
  let hideNeedsReview = false;

  let host = document.getElementById('a11y-overlay-root-host');
  if (!host) {
    host = document.createElement('div');
    host.id = 'a11y-overlay-root-host';
    host.style.all = 'initial';
    host.style.position = 'fixed';
    host.style.zIndex = '2147483647';
    host.style.top = '0'; host.style.left = '0'; host.style.width = '0'; host.style.height = '0';
    document.documentElement.appendChild(host);
  }
  // Ensure a safe focusable fallback target exists when closing the panel
  if (!host.hasAttribute('tabindex')) host.setAttribute('tabindex', '-1');
  const shadow = host.shadowRoot || host.attachShadow({ mode: 'open' });
  const container = document.createElement('div');
  container.id = 'a11y-overlay-root';
  shadow.appendChild(container);

  container.innerHTML = `
    <style>
      :host, #a11y-overlay-root { all: initial; font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
      .layer { position: fixed; inset: 0; pointer-events: none; }
      .box { position: fixed; border: 2px solid #ff3b30; border-radius: 3px; box-shadow: 0 0 0 2px rgba(0,0,0,.2); background: rgba(255,59,48,0.08); pointer-events: none; }
      .label { position: fixed; transform: translateY(-100%); background: #ff3b30; color: white; padding: 2px 6px; border-radius: 3px; font-size: 12px; line-height: 1.4; pointer-events: none; }
      .panel { position: fixed; top: 0; right: 0; width: 380px; max-width: 92vw; height: 100vh; background: #111; color: #fff; border-left: 2px solid #ff3b30; box-shadow: -6px 0 16px rgba(0,0,0,.4); display: none; flex-direction: column; gap: 0; pointer-events: auto; z-index: 2147483647; }
      .panel[aria-hidden="false"] { display: flex; }
      .panel header { padding: 12px 14px; border-bottom: 1px solid #333; background: #1a1a1a; display: flex; align-items: center; justify-content: space-between; gap: 8px; }
      .panel h1 { font-size: 16px; margin: 0; }
      .counts { font-size: 12px; color: #bdbdbd; padding: 0 14px 6px; }
      .panel .controls { display: flex; gap: 8px; align-items: center; }
      .panel button, .panel select { background: #2a2a2a; color: #fff; border: 1px solid #444; border-radius: 8px; padding: 6px 10px; cursor: pointer; }
      .panel button:focus, .panel select:focus { outline: 2px solid #ff3b30; outline-offset: 2px; }
      .list { overflow: auto; padding: 8px 0; height: calc(100vh - 54px - 66px); }
      .item { display: grid; grid-template-columns: auto 1fr; gap: 6px 10px; padding: 10px 14px; border-bottom: 1px solid #2a2a2a; }
      .item[aria-selected="true"] { background: #1f1f1f; }
      .item .idx { font-weight: 700; color: #ffb4ae; }
      .item .msg { font-size: 13px; }
      .item .meta { font-size: 12px; color: #bdbdbd; }
      .footer { padding: 8px 14px; border-top: 1px solid #333; font-size: 12px; color: #bdbdbd; }
      .sr-only { position: absolute; width: 1px; height: 1px; margin: -1px; clip: rect(0,0,0,0); overflow: hidden; }
    </style>
    <div id="highlight-layer" class="layer" aria-hidden="true"></div>
    <aside class="panel" role="region" aria-label="Accessibility findings panel" aria-hidden="true">
      <header>
        <h1>A11y Findings</h1>
        <div class="controls">
          <button id="btn-rescan" type="button" aria-keyshortcuts="R">Rescan</button>
          <select id="rule-filter" aria-label="Filter by rule"><option value="">All rules</option></select>
          <button id="btn-close" type="button" aria-keyshortcuts="Esc">Close</button>
          <button id="btn-clear-results" type="button">Clear All</button>
        </div>
      </header>
      <div id="counts" class="counts" aria-live="polite"></div>
      <div id="list" class="list" role="listbox" tabindex="0" aria-label="Findings list"></div>
      <div class="footer">Shortcuts: Alt+Shift+A (toggle), Alt+Shift+N / P (next/prev)</div>
      <div id="live" class="sr-only" aria-live="polite"></div>
    </aside>
  `;

  const layer = container.querySelector('#highlight-layer');
  const panel = container.querySelector('.panel');
  const listEl = container.querySelector('#list');
  const countsEl = container.querySelector('#counts');
  const live = container.querySelector('#live');
  const btnClose = container.querySelector('#btn-close');
  const btnRescan = container.querySelector('#btn-rescan');
  const btnClear = container.querySelector('#btn-clear-results');
  const ruleFilter = container.querySelector('#rule-filter');
  let previouslyFocused = null;
  let ignores = { selectors: new Set(), rules: new Set() };
  let scanOptions = { live: false, viewportOnly: false, shadow: false, iframes: false, hideNeedsReview: false };
  let mo; let liveTimer = 0; let livePending = false;
  let liveWindowStart = 0; let liveWindowCount = 0; const LIVE_WINDOW_MS = 2000; const LIVE_THRESHOLD = 500; let livePausedUntil = 0; let livePaused = false;

  const boxes = new Map();
  const roMap = new Map();

  function clearHighlights() {
    for (const {box, label} of boxes.values()) { box.remove(); label.remove(); }
    boxes.clear();
    for (const ro of roMap.values()) ro.disconnect();
    roMap.clear();
  }

  function colorForRule(ruleId) {
    const palette = { 'img-alt':'#ff3b30','control-name':'#0aa84f','label-control':'#34c759','headings-order':'#5e5ce6','landmarks':'#ffd60a','aria-role-valid':'#64d2ff','target-size':'#ff9f0a','contrast-text':'#ff375f' };
    return palette[ruleId] || '#5e5ce6';
  }

  function positionBox(el, box, lab) {
    const rect = el.getBoundingClientRect();
    box.style.left = rect.left + 'px'; box.style.top = rect.top + 'px';
    box.style.width = rect.width + 'px'; box.style.height = rect.height + 'px';
    lab.style.left = rect.left + 'px'; lab.style.top = rect.top + 'px';
  }

  function makeBoxFor(el, idx, color) {
    const rect = el.getBoundingClientRect();
    const box = document.createElement('div');
    box.className = 'box';
    Object.assign(box.style, { left: rect.left+'px', top: rect.top+'px', width: rect.width+'px', height: rect.height+'px', borderColor: color });
    layer.appendChild(box);

    const lab = document.createElement('div');
    lab.className = 'label'; lab.textContent = `#${idx+1}`;
    Object.assign(lab.style, { left: rect.left+'px', top: rect.top+'px', background: color });
    layer.appendChild(lab);

    const ro = new ResizeObserver(() => positionBox(el, box, lab));
    ro.observe(el); roMap.set(el, ro);
    return { box, lab };
  }

  function buildHighlights(findings) {
    clearHighlights();
    const filter = ruleFilter.value;
    const filtered = findings
      .filter(f => !filter || f.ruleId === filter)
      .filter(f => !ignores.rules.has(f.ruleId) && !ignores.selectors.has(f.selector));
    filtered.forEach((f, i) => {
      const el = document.querySelector(f.selector);
      if (!el) return;
      const color = colorForRule(f.ruleId);
      const made = makeBoxFor(el, i, color);
      boxes.set(el, { box: made.box, label: made.lab });
    });
    requestAnimationFrame(() => { for (const [el, pair] of boxes.entries()) positionBox(el, pair.box, pair.label); });
  }

  function buildListItem(item, idx) {
    const div = document.createElement('div'); div.className = 'item'; div.setAttribute('role','option'); div.setAttribute('data-idx', String(idx)); div.tabIndex = -1;
    const idxEl = document.createElement('div'); idxEl.className = 'idx'; idxEl.textContent = String(idx + 1);
    const body = document.createElement('div');
    const msg = document.createElement('div'); msg.className = 'msg'; msg.textContent = `${item.message}`;
    const meta = document.createElement('div'); meta.className = 'meta'; meta.textContent = `${item.ruleId.toUpperCase()} • ${item.wcag.join(', ')} • ${item.selector}`;
    body.appendChild(msg); body.appendChild(meta); div.appendChild(idxEl); div.appendChild(body);
    div.addEventListener('click', () => {
      setState({ index: idx }); renderList();
      const el = document.querySelector(item.selector);
      if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); flash(el); }
    });
    return div;
  }

  function renderList() {
    const s = getState();
    const filter = ruleFilter.value;
    const items = s.findings
      .filter(f => !filter || f.ruleId === filter)
      .filter(f => !ignores.rules.has(f.ruleId) && !ignores.selectors.has(f.selector));
    countsEl.textContent = `${items.length} issue${items.length===1?'':'s'}${filter?` • ${filter}`:''}`;
    listEl.innerHTML = ''; items.forEach((it, i) => {
      const row = buildListItem(it, i); row.setAttribute('aria-selected', String(i === s.index)); listEl.appendChild(row);
    });
  }

  function selectIndex(newIndex) {
    const s = getState();
    const filter = ruleFilter.value;
    const items = s.findings.filter(f => !filter || f.ruleId === filter);
    if (!items.length) return;
    const i = Math.max(0, Math.min(newIndex, items.length - 1));
    setState({ index: i }); renderList();
    const item = items[i]; const el = document.querySelector(item.selector);
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); flash(el); announce(`Focused finding ${i+1} of ${items.length}`); }
  }

  function flash(el) {
    const r = el.getBoundingClientRect();
    const pulse = document.createElement('div');
    pulse.className = 'box';
    Object.assign(pulse.style, { left:r.left+'px', top:r.top+'px', width:r.width+'px', height:r.height+'px', borderColor:'#ffd60a', boxShadow:'0 0 0 4px rgba(255,214,10,.35)', transition:'opacity .8s ease' });
    layer.appendChild(pulse); requestAnimationFrame(() => pulse.style.opacity = '0'); setTimeout(() => pulse.remove(), 900);
  }

  function announce(msg) { live.textContent = ''; setTimeout(() => (live.textContent = msg), 10); }

  function populateRuleFilter() {
    const ids = (window.__a11yEngine && window.__a11yEngine.allRuleIds) ? window.__a11yEngine.allRuleIds : [];
    ruleFilter.innerHTML = '<option value=\"\">All rules</option>' + ids.map(id => `<option value=\"${id}\">${id}</option>`).join('');
  }

  function isInViewport(selector) {
    try {
      const el = document.querySelector(selector);
      if (!el) return false;
      const r = el.getBoundingClientRect();
      return r.bottom > 0 && r.right > 0 && r.top < (window.innerHeight||0) && r.left < (window.innerWidth||0);
    } catch { return false; }
  }

  function scanNow() {
    if (!window.__a11yEngine) { console.warn('A11y engine missing'); return; }
    const t0 = performance.now();
    try {
      if (!window.__a11yConfig) window.__a11yConfig = {};
      window.__a11yConfig.viewportOnly = !!scanOptions.viewportOnly;
      window.__a11yConfig.shadow = !!scanOptions.shadow;
      window.__a11yConfig.iframes = !!scanOptions.iframes;
    } catch {}
    let results = window.__a11yEngine.run(window.__a11yConfig?.enabledRules);
    if (scanOptions.viewportOnly) {
      results = results.filter(f => isInViewport(f.selector));
    }
    if (hideNeedsReview || scanOptions.hideNeedsReview) {
      results = results.filter(f => !f.needsReview);
    }
    const filtered = results.filter(f => !ignores.rules.has(f.ruleId) && !ignores.selectors.has(f.selector));
    setState({ findings: filtered, index: filtered.length ? 0 : -1 });
    renderList(); buildHighlights(results); announce(`${filtered.length} issues found`);
    try {
      const scanMs = Math.max(0, Math.round(performance.now() - t0));
      chrome.runtime.sendMessage(
        { type: 'findings', findings: filtered, allRuleIds: (window.__a11yEngine?.allRuleIds || []), enabledRules: (window.__a11yConfig?.enabledRules || []), ruleMeta: (window.__a11yEngine?.ruleMeta || null), scanMs },
        () => void chrome.runtime.lastError
      );
    } catch {}
  }

  function openPanel() {
    previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    panel.removeAttribute('inert');
    panel.setAttribute('aria-hidden', 'false');
    listEl.focus();
  }
  function closePanel() {
    const isInside = panel.contains(document.activeElement);
    const fallback = host; // reliable, focusable fallback
    const target = (previouslyFocused && document.contains(previouslyFocused) && !panel.contains(previouslyFocused)) ? previouslyFocused : fallback;
    try {
      if (isInside && document.activeElement && typeof document.activeElement.blur === 'function') {
        document.activeElement.blur();
      }
      if (target && typeof target.focus === 'function') {
        target.focus({ preventScroll: true });
      }
    } catch {}
    // Defer hiding to ensure focus has moved out of the panel before aria-hidden is applied
    setTimeout(() => {
      panel.setAttribute('aria-hidden', 'true');
      panel.setAttribute('inert', '');
    }, 0);
  }

  function togglePanel() {
    const s = getState(); const enabled = !s.enabled; setState({ enabled });
    if (enabled) {
      populateRuleFilter(); scanNow(); openPanel(); layer.setAttribute('aria-hidden','false');
      const reposition = () => requestAnimationFrame(() => { for (const [el, pair] of boxes.entries()) positionBox(el, pair.box, pair.label); });
      window.addEventListener('scroll', reposition, { passive: true }); window.addEventListener('resize', reposition);
    } else { closePanel(); clearHighlights(); layer.setAttribute('aria-hidden','true'); }
  }

  btnClose.addEventListener('click', () => togglePanel());
  btnRescan.addEventListener('click', () => scanNow());
  btnClear.addEventListener('click', () => {
    setState({ findings: [], index: -1 });
    renderList();
    clearHighlights();
    try { chrome.runtime.sendMessage({ type: 'findings', findings: [], allRuleIds: (window.__a11yEngine?.allRuleIds || []), enabledRules: (window.__a11yConfig?.enabledRules || []), scanMs: 0 }, () => void chrome.runtime.lastError); } catch {}
    announce('Results cleared');
  });
  ruleFilter.addEventListener('change', () => { renderList(); buildHighlights(getState().findings); });

  listEl.addEventListener('keydown', (e) => {
    const s = getState(); if (!s.enabled) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); selectIndex((s.index < 0 ? 0 : s.index) + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); selectIndex((s.index < 0 ? 0 : s.index) - 1); }
    else if (e.key === 'Enter') { e.preventDefault(); const filter = ruleFilter.value; const items = s.findings.filter(f => !filter || f.ruleId === filter); const it = items[s.index]; if (it) { const el = document.querySelector(it.selector); if (el) { el.scrollIntoView({ behavior:'smooth', block:'center' }); flash(el); } } }
    else if (e.key === 'Escape') { e.preventDefault(); togglePanel(); }
  });

  chrome.runtime.onMessage.addListener((msg) => {
    if (!msg || !msg.type) return;
    if (DEBUG) try { console.debug('[A11y][CS] Received', msg.type); } catch {}
    if (msg.type === 'toggle-panel') togglePanel();
    if (msg.type === 'next-finding') { const s = getState(); selectIndex((s.index < 0 ? 0 : s.index) + 1); }
    if (msg.type === 'previous-finding') { const s = getState(); selectIndex((s.index < 0 ? 0 : s.index) - 1); }
    if (msg.type === 'request-findings') {
      try {
        chrome.runtime.sendMessage(
          { type: 'findings', findings: getState().findings, allRuleIds: (window.__a11yEngine?.allRuleIds || []), enabledRules: (window.__a11yConfig?.enabledRules || []) },
          () => void chrome.runtime.lastError
        );
      } catch {}
    }
    if (msg.type === 'set-enabled-rules') {
      window.__a11yConfig.enabledRules = Array.isArray(msg.enabledRules) ? msg.enabledRules : [];
      chrome.storage?.local?.set({ enabledRules: window.__a11yConfig.enabledRules });
      if (getState().enabled) scanNow();
    }
    if (msg.type === 'apply-config') {
      try {
        // Enabled rules
        window.__a11yConfig.enabledRules = Array.isArray(msg.enabledRules) ? msg.enabledRules : [];
        chrome.storage?.local?.set({ enabledRules: window.__a11yConfig.enabledRules });
        // Engine profile and needsReview filter
        engineProfile = (msg.profile || 'default');
        hideNeedsReview = !!msg.hideNeedsReview;
        if (typeof window.__a11yEngine?.setProfile === 'function') {
          window.__a11yEngine.setProfile(engineProfile);
        }
        // Scan options
        if (typeof msg.live === 'boolean') scanOptions.live = msg.live;
        if (typeof msg.viewportOnly === 'boolean') scanOptions.viewportOnly = msg.viewportOnly;
        if (typeof msg.shadow === 'boolean') scanOptions.shadow = msg.shadow;
        if (typeof msg.iframes === 'boolean') scanOptions.iframes = msg.iframes;
        if (typeof msg.hideNeedsReview === 'boolean') scanOptions.hideNeedsReview = msg.hideNeedsReview;
        setupLiveObserver();
      } catch {}
      if (getState().enabled) scanNow();
    }
    if (msg.type === 'set-ignores') {
      try {
        ignores.selectors = new Set(Array.isArray(msg.selectors) ? msg.selectors : []);
        ignores.rules = new Set(Array.isArray(msg.rules) ? msg.rules : []);
        if (getState().enabled) scanNow();
      } catch {}
    }
    if (msg.type === 'set-engine-profile') {
      try {
        engineProfile = (msg.profile || 'default');
        hideNeedsReview = !!msg.hideNeedsReview;
        if (typeof window.__a11yEngine?.setProfile === 'function') {
          window.__a11yEngine.setProfile(engineProfile);
        }
        if (getState().enabled) scanNow();
      } catch {}
    }
    if (msg.type === 'clear-results') {
      setState({ findings: [], index: -1 });
      renderList();
      clearHighlights();
      announce('Results cleared');
    }
    if (msg.type === 'set-scan-options') {
      scanOptions.live = !!msg.live;
      scanOptions.viewportOnly = !!msg.viewportOnly;
      if (typeof msg.shadow === 'boolean') scanOptions.shadow = !!msg.shadow;
      if (typeof msg.iframes === 'boolean') scanOptions.iframes = !!msg.iframes;
      if (typeof msg.hideNeedsReview === 'boolean') scanOptions.hideNeedsReview = !!msg.hideNeedsReview;
      setupLiveObserver();
      // Clear paused state if live was disabled
      if (!scanOptions.live && livePaused) {
        livePaused = false; livePausedUntil = 0; liveWindowCount = 0; liveWindowStart = 0;
        try { chrome.runtime.sendMessage({ type: 'live-status', paused: false }, () => void chrome.runtime.lastError); } catch {}
      }
      if (getState().enabled) scanNow();
    }
    if (msg.type === 'rescan-now') scanNow();
  });

  function setupLiveObserver() {
    try { if (mo) { mo.disconnect(); mo = null; } } catch {}
    if (!scanOptions.live) return;
    mo = new MutationObserver((mutations) => {
      // Ignore noise: only react if any relevant attribute or childList changed
      if (Array.isArray(mutations)) {
        const relevant = mutations.some(m => {
          if (m.type === 'childList') return true;
          if (m.type === 'attributes') {
            const n = (m.attributeName||'').toLowerCase();
            return n.startsWith('aria-') || n === 'role' || n === 'alt' || n === 'title' || n === 'for' || n === 'tabindex' || n === 'class' || n === 'style';
          }
          return false;
        });
        if (!relevant) return;
      }
      const now = Date.now();
      if (!liveWindowStart || now - liveWindowStart > LIVE_WINDOW_MS) { liveWindowStart = now; liveWindowCount = 0; }
      liveWindowCount++;
      if (liveWindowCount > LIVE_THRESHOLD) { livePausedUntil = now + 5000; }
      if (livePausedUntil > now) {
        if (!livePaused) {
          livePaused = true;
          try { chrome.runtime.sendMessage({ type: 'live-status', paused: true }, () => void chrome.runtime.lastError); } catch {}
        }
        return;
      } else if (livePaused) {
        livePaused = false;
        try { chrome.runtime.sendMessage({ type: 'live-status', paused: false }, () => void chrome.runtime.lastError); } catch {}
      }
      if (liveTimer) { livePending = true; return; }
      liveTimer = window.setTimeout(() => {
        liveTimer = 0;
        const shouldRun = livePending || true; // coalesced
        livePending = false;
        if (shouldRun) scanNow();
      }, 500);
    });
    mo.observe(document.documentElement || document.body, { subtree: true, childList: true, attributes: true, characterData: false });
  }

  window.__a11yToggle = togglePanel;
})();
