// devtools.js — Phase 2 DevTools panel
const DEBUG = false;
const tabId = chrome.devtools.inspectedWindow.tabId;
let port;
function connectPort() {
  try {
    port = chrome.runtime.connect({ name: `devtools-${tabId}` });
    if (DEBUG) try { console.debug('[A11y][DT] Connected to background for tab', tabId); } catch {}
    port.onDisconnect.addListener(() => { try { isConnected = false; } catch {} ; try { setStatus(); } catch {} });
    if (typeof handlePortMessage === 'function') {
      try { port.onMessage.addListener(handlePortMessage); } catch {}
    }
  } catch {}
}
function send(msg) {
  try { port && port.postMessage(msg); }
  catch (e) { try { connectPort(); port && port.postMessage(msg); } catch {} }
}
connectPort();

const $ = (sel) => document.querySelector(sel);
const listEl = $('#list');
const sumEl = $('#summary');
const filterRule = $('#filter-rule');
const rulesWrap = $('#rules');
const statusEl = $('#status');
const filterImpact = document.querySelector('#filter-impact');
const searchBox = document.querySelector('#search');
const sortSel = document.querySelector('#sort');
const groupSel = document.querySelector('#group');
const minConf = document.querySelector('#min-conf');
const confVal = document.querySelector('#conf-val');
const detailsEl = document.querySelector('#details');
const optLive = document.querySelector('#opt-live');
const optViewport = document.querySelector('#opt-viewport');
const optShadow = document.querySelector('#opt-shadow');
const optIframes = document.querySelector('#opt-iframes');
const optHideNR = document.querySelector('#opt-hide-nr');
const optIntelligentPriority = document.querySelector('#opt-intelligent-priority');
const presetSel = document.querySelector('#preset');
let presets = null;

let findings = [];
let allRuleIds = [];
let enabledRules = [];
let ruleMeta = null;
let isConnected = false;
let isRestricted = false;
let lastScanAt = null;
let ignores = { selectors: new Set(), rules: new Set() };
let inspectedHost = '';
let scanOptions = { live: false, viewportOnly: true, shadow: false, iframes: false, hideNeedsReview: false, intelligentPriority: false };
let preset = 'default';
let rescanTimer = 0;
let presetsLoaded = false;
let autoAppliedPresetOnce = false;
let inspectedUrl = '';

function requestFindings() { send({ type: 'request-findings' }); }
function toggleOverlay() { send({ type: 'toggle-panel' }); }
function rescan() {
  const btn = $('#btn-rescan');
  if (btn) { btn.disabled = true; btn.textContent = 'Rescanning…'; }
  send({ type: 'rescan-now' });
  // Safety: re-enable button if no response within 8s
  try { if (rescanTimer) { clearTimeout(rescanTimer); rescanTimer = 0; } } catch {}
  rescanTimer = setTimeout(() => {
    const b = $('#btn-rescan');
    if (b) { b.disabled = false; b.textContent = 'Rescan'; }
    rescanTimer = 0;
  }, 8000);
}

function setStatus() {
  if (!statusEl) return;
  if (isRestricted) {
    statusEl.textContent = 'Restricted page';
    statusEl.title = 'Content scripts are not allowed on this page. Try a standard http/https page.';
    return;
  }
  if (!isConnected) {
    statusEl.textContent = 'Connecting…';
    statusEl.title = '';
    return;
  }
  const time = lastScanAt ? new Date(lastScanAt).toLocaleTimeString() : '—';
  const ms = (typeof setStatus._lastMs === 'number') ? ` • ${Math.round(setStatus._lastMs)} ms` : '';
  const livePausedTxt = setStatus._livePaused ? ' • Live paused' : '';
  statusEl.textContent = `Connected • Last scan ${time}${ms}${livePausedTxt}`;
  statusEl.title = '';
}

function renderRuleToggles() {
  rulesWrap.innerHTML = '';
  const enabledSet = new Set(enabledRules);
  const defaultAll = enabledRules.length === 0;
  allRuleIds.forEach(id => {
    const label = document.createElement('label');
    Object.assign(label.style, { display:'inline-flex', alignItems:'center', gap:'6px', marginRight:'8px' });
    const cb = document.createElement('input');
    cb.type = 'checkbox'; cb.checked = defaultAll || enabledSet.has(id); cb.dataset.id = id; cb.addEventListener('change', persistRuleConfig);
    label.appendChild(cb); label.appendChild(document.createTextNode(id));
    rulesWrap.appendChild(label);
  });
  const prev = filterRule.value;
  filterRule.innerHTML = '<option value="">All rules</option>' + allRuleIds.map(id => `<option value="${id}">${id}</option>`).join('');
  // Restore previous selection if still present
  try { if (prev) filterRule.value = prev; } catch {}
}

function persistRuleConfig() {
  const enabled = Array.from(rulesWrap.querySelectorAll('input[type="checkbox"]')).filter(cb => cb.checked).map(cb => cb.dataset.id);
  enabledRules = enabled;
  send({ type: 'set-enabled-rules', enabledRules: enabled });
  // If current selection deviates from active preset, mark as custom
  try {
    const active = getActivePresetConfig();
    if (!active || !arraysEqualUnordered(enabledRules, active.enabledRuleIds || [])) {
      ensureCustomPresetOption();
      presetSel.value = 'custom';
      persistSelectedPreset('custom');
      const btnReset = document.querySelector('#btn-reset-preset');
      if (btnReset) btnReset.style.display = '';
      // Persist custom enabled rules per host
      persistEnabledRulesPerHost();
    }
  } catch {}
}

function arraysEqualUnordered(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  const sa = new Set(a), sb = new Set(b);
  if (sa.size !== sb.size) return false;
  for (const x of sa) if (!sb.has(x)) return false;
  return true;
}

function ensureCustomPresetOption() {
  if (!presetSel) return;
  if (!Array.from(presetSel.options).some(o => o.value === 'custom')) {
    const opt = document.createElement('option');
    opt.value = 'custom'; opt.textContent = 'Preset: Custom';
    presetSel.appendChild(opt);
  }
}

function getActivePresetConfig() {
  const name = presetSel?.value || preset;
  if (!presets || !name || !presets[name]) return null;
  return presets[name];
}

function persistSelectedPreset(name) {
  try {
    const key = `a11y_preset::${inspectedHost||''}`;
    localStorage.setItem(key, String(name||''));
  } catch {}
}

function loadSelectedPreset() {
  try {
    const key = `a11y_preset::${inspectedHost||''}`;
    const val = localStorage.getItem(key);
    return val || null;
  } catch { return null; }
}

// Global UI state (site-agnostic): sort, group, advanced open
function persistGlobalUiState() {
  try {
    const payload = {
      sort: sortSel?.value || 'impact',
      group: groupSel?.value || 'none',
      advancedOpen: document.body.classList.contains('show-advanced')
    };
    localStorage.setItem('a11y_ui_global', JSON.stringify(payload));
  } catch {}
}
function loadGlobalUiState() {
  try {
    const advBtn = document.querySelector('#btn-advanced');
    const raw = localStorage.getItem('a11y_ui_global');
    if (!raw) {
      // Default: Advanced open on first run when no saved state exists
      document.body.classList.add('show-advanced');
      if (advBtn) advBtn.textContent = 'Advanced ▴';
      return;
    }
    const obj = JSON.parse(raw);
    if (sortSel && obj.sort) sortSel.value = obj.sort;
    if (groupSel && obj.group) groupSel.value = obj.group;
    const want = (typeof obj.advancedOpen === 'boolean') ? obj.advancedOpen : true;
    document.body.classList.toggle('show-advanced', want);
    if (advBtn) advBtn.textContent = want ? 'Advanced ▴' : 'Advanced ▾';
  } catch {}
}

// Per-site UI state: rule filter, impact filter, min-conf, search, enabled rules (custom)
function persistPerSiteUiState() {
  try {
    const key = `a11y_ui::${inspectedHost||''}`;
    const payload = {
      rule: filterRule?.value || '',
      impact: filterImpact?.value || '',
      minConf: typeof minConf?.value === 'string' ? minConf.value : '0',
      search: searchBox?.value || ''
    };
    localStorage.setItem(key, JSON.stringify(payload));
  } catch {}
}
function loadPerSiteUiState() {
  try {
    const key = `a11y_ui::${inspectedHost||''}`;
    const raw = localStorage.getItem(key);
    if (!raw) return;
    const obj = JSON.parse(raw);
    if (filterRule && typeof obj.rule === 'string') filterRule.value = obj.rule;
    if (filterImpact && typeof obj.impact === 'string') filterImpact.value = obj.impact;
    if (minConf && typeof obj.minConf === 'string') { minConf.value = obj.minConf; if (confVal) confVal.textContent = (parseFloat(obj.minConf)||0).toFixed(2); }
    if (searchBox && typeof obj.search === 'string') searchBox.value = obj.search;
  } catch {}
}

function persistEnabledRulesPerHost() {
  try {
    const key = `a11y_enabled::${inspectedHost||''}`;
    localStorage.setItem(key, JSON.stringify({ enabledRules }));
  } catch {}
}
function loadEnabledRulesPerHost() {
  try {
    if ((presetSel?.value || preset) !== 'custom') return;
    const key = `a11y_enabled::${inspectedHost||''}`;
    const raw = localStorage.getItem(key);
    if (!raw) return;
    const obj = JSON.parse(raw);
    if (!obj || !Array.isArray(obj.enabledRules)) return;
    // Only apply if different
    if (!arraysEqualUnordered(enabledRules, obj.enabledRules)) {
      enabledRules = Array.from(obj.enabledRules);
      const setEnabled = new Set(enabledRules);
      Array.from(rulesWrap.querySelectorAll('input[type="checkbox"]')).forEach(cb => { cb.checked = setEnabled.has(cb.dataset.id); });
      send({ type: 'set-enabled-rules', enabledRules });
    }
  } catch {}
}

function applyPreset(name) {
  if (name === 'custom') { persistSelectedPreset('custom'); return; }
  preset = name;
  // Use presets.json if loaded; otherwise fall back to built-in sets
  if (!presets) {
    const sets = {
      default: null,
      axe: new Set(['img-alt','button-name','link-name','aria-hidden-focus','meta-viewport','list']),
      lighthouse: new Set(['img-alt','control-name','label-control','contrast-text','html-lang','document-title','meta-viewport','target-size']),
      ibm: new Set(['aria-role-valid','aria-required-props','aria-attr-valid','aria-presentation-misuse','headings-order','landmarks','region-name','iframe-title','html-lang','document-title','contrast-text','label-control','control-name'])
    };
    if (!sets[name]) return;
    const wanted = sets[name];
    enabledRules = Array.from(wanted);
    Array.from(rulesWrap.querySelectorAll('input[type="checkbox"]')).forEach(cb => { cb.checked = wanted.has(cb.dataset.id); });
    send({ type: 'set-enabled-rules', enabledRules });
    try {
      if (filterRule) filterRule.value = '';
      if (filterImpact) filterImpact.value = '';
      if (minConf) { const v = String(sets[name].minConfidence ?? 0); minConf.value = v; if (confVal) confVal.textContent = (parseFloat(v)||0).toFixed(2); }
      if (optLive) { optLive.checked = false; }
      if (optViewport) { optViewport.checked = false; }
      scanOptions.live = false; scanOptions.viewportOnly = false; persistScanOptions();
      send({ type: 'set-engine-profile', profile: name === 'axe' ? 'axe' : 'default', hideNeedsReview: name === 'axe' });
    } catch {}
    send({ type: 'rescan-now' });
    persistSelectedPreset(name);
    const btnReset = document.querySelector('#btn-reset-preset');
    if (btnReset) btnReset.style.display = 'none';
    return;
  }
  if (!presets[name]) return;
  const cfg = presets[name];
  enabledRules = Array.from(cfg.enabledRuleIds || []);
  const enabledSet = new Set(enabledRules);
  Array.from(rulesWrap.querySelectorAll('input[type="checkbox"]')).forEach(cb => { cb.checked = enabledSet.has(cb.dataset.id); });
  // Send one atomic config to content to avoid timing issues between multiple messages
  send({ type: 'apply-config', enabledRules, profile: (cfg.engineProfile||'default'), hideNeedsReview: !!cfg.hideNeedsReview, live: !!cfg.live, viewportOnly: !!cfg.viewportOnly, shadow: !!cfg.shadow, iframes: !!cfg.iframes });
  try {
    if (filterRule) filterRule.value = '';
    if (filterImpact) filterImpact.value = '';
    if (minConf) { const v = String(cfg.minConfidence ?? 0); minConf.value = v; if (confVal) confVal.textContent = (parseFloat(v)||0).toFixed(2); }
    if (optLive) { optLive.checked = !!cfg.live; }
    if (optViewport) { optViewport.checked = !!cfg.viewportOnly; }
    if (optShadow) { optShadow.checked = !!cfg.shadow; }
    if (optIframes) { optIframes.checked = !!cfg.iframes; }
    if (optHideNR) { optHideNR.checked = !!cfg.hideNeedsReview; }
    scanOptions.live = !!cfg.live; scanOptions.viewportOnly = !!cfg.viewportOnly; scanOptions.shadow = !!cfg.shadow; scanOptions.iframes = !!cfg.iframes; scanOptions.hideNeedsReview = !!cfg.hideNeedsReview; persistScanOptions();
    try { window.__a11yProfile = (cfg.engineProfile||'default'); } catch {}
  } catch {}
  send({ type: 'rescan-now' });
  persistSelectedPreset(name);
  const btnReset = document.querySelector('#btn-reset-preset');
  if (btnReset) btnReset.style.display = 'none';
}

function revealInElements(selector) {
  const code = `(() => { const el = document.querySelector(${JSON.stringify(selector)}); if (el) inspect(el); return !!el; })();`;
  chrome.devtools.inspectedWindow.eval(code, (result, exc) => { if (exc) console.warn('inspect() error', exc); });
}

function getFilteredFindings() {
  const filter = filterRule.value;
  const byImpact = filterImpact ? filterImpact.value : '';
  const confThresh = minConf ? (parseFloat(minConf.value||'0') || 0) : 0;
  const q = (searchBox?.value||'').trim().toLowerCase();
  let items = findings
    .filter(f => !filter || f.ruleId === filter)
    .filter(f => !byImpact || String(f.impact||'').toLowerCase() === byImpact)
    .filter(f => (typeof f.confidence !== 'number') ? (confThresh === 0) : f.confidence >= confThresh)
    .filter(f => !ignores.rules.has(f.ruleId) && !ignores.selectors.has(f.selector));
  if (q) {
    items = items.filter(f => {
      const hay = `${f.ruleId}\n${f.selector}\n${f.message}`.toLowerCase();
      return hay.includes(q);
    });
  }
  return items;
}

function render() {
  let items = getFilteredFindings();
  const impactRank = { critical: 3, serious: 2, moderate: 1, minor: 0 };
  const sortMode = (sortSel?.value||'impact');
  items.sort((a, b) => {
    if (sortMode === 'priority') return (b.priorityScore||0) - (a.priorityScore||0);
    if (sortMode === 'impact') return (impactRank[String(b.impact)||'']||-1) - (impactRank[String(a.impact)||'']||-1);
    if (sortMode === 'confidence') return (b.confidence||0) - (a.confidence||0);
    if (sortMode === 'rule') return String(a.ruleId).localeCompare(String(b.ruleId));
    if (sortMode === 'selector') return String(a.selector).localeCompare(String(b.selector));
    return 0;
  });
  // Build priority or traditional impact summary
  let summaryHtml = '';
  let counts = {};
  
  if (scanOptions.intelligentPriority && items.some(f => f.priorityScore !== undefined)) {
    // Priority-based summary
    counts = items.reduce((m,f) => { 
      const level = getPriorityLevel(f.priorityScore || 0); 
      m[level] = (m[level] || 0) + 1; 
      return m; 
    }, {});
    
    const priorityParts = ['critical','high','medium','low','minimal']
      .filter(k => counts[k])
      .map(k => `<span class="priority-${k}" style="padding: 2px 6px; border-radius: 4px; font-size: 11px;">${getPriorityIcon(k === 'critical' ? 25 : k === 'high' ? 18 : k === 'medium' ? 12 : k === 'low' ? 8 : 4)} ${k}: ${counts[k]}</span>`);
    
    // Calculate priority metrics
    const totalScore = items.reduce((sum, f) => sum + (f.priorityScore || 0), 0);
    const avgScore = items.length ? (totalScore / items.length).toFixed(1) : 0;
    const criticalCount = counts.critical || 0;
    
    summaryHtml = priorityParts.length ? ` • ${priorityParts.join(' ')} • Avg: ${avgScore}` : '';
    
    if (criticalCount > 0) {
      summaryHtml += ` <span class="priority-status priority-critical">⚠️ ${criticalCount} Critical Issues</span>`;
    }
  } else {
    // Traditional impact summary
    counts = items.reduce((m,f) => { 
      const k = String(f.impact || '').toLowerCase(); 
      m[k] = (m[k] || 0) + 1; 
      return m; 
    }, {});
    const parts = ['critical','serious','moderate','minor'].filter(k => counts[k]).map(k => `${k}:${counts[k]}`);
    summaryHtml = parts.length ? ` • ${parts.join(' · ')}` : '';
  }
  
  listEl.innerHTML = '';
  const activePresetName = presetSel?.value || preset;
  const presetLabel = activePresetName ? ` • Preset: ${activePresetName}` : '';
  const filter = filterRule.value;
  sumEl.innerHTML = `<strong>${items.length}</strong> issues${presetLabel} ${filter?`for <span class="pill">${filter}</span>`:''}${summaryHtml}`;
  const groupMode = (groupSel?.value||'none');
  if (groupMode !== 'none') {
    const groups = new Map();
    for (const f of items) {
      const key = groupMode === 'rule' ? f.ruleId : (String(f.impact||'').toLowerCase()||'');
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(f);
    }
    // Stable group ordering by size desc, then key asc for predictability
    const ordered = Array.from(groups.entries()).sort((a,b)=> b[1].length - a[1].length || String(a[0]).localeCompare(String(b[0])));
    for (const [key, arr] of ordered) {
      const header = document.createElement('div'); header.className = 'item';
      header.innerHTML = `<div><strong>${key||'(none)'}</strong> <span class="pill">${arr.length} item(s)</span></div>`;
      listEl.appendChild(header);
      arr.forEach(f => appendFindingItem(f));
    }
  } else {
    items.forEach(f => appendFindingItem(f));
  }
}

function getPriorityColor(score) {
  if (score >= 20) return '#dc2626'; // Critical - Red
  if (score >= 16) return '#ea580c'; // High - Orange  
  if (score >= 12) return '#ca8a04'; // Medium - Yellow
  if (score >= 8) return '#16a34a';  // Low - Green
  return '#6b7280'; // Minimal - Gray
}

function getPriorityIcon(score) {
  if (score >= 20) return '🚨'; // Critical - Alarm
  if (score >= 16) return '⚡'; // High - Lightning  
  if (score >= 12) return '⚠️'; // Medium - Warning
  if (score >= 8) return '📝';  // Low - Note
  return '💡'; // Minimal - Idea
}

function getPriorityLevel(score) {
  if (score >= 20) return 'critical';
  if (score >= 16) return 'high';  
  if (score >= 12) return 'medium';
  if (score >= 8) return 'low';
  return 'minimal';
}

// Safely escape strings for HTML attribute contexts (e.g., title="…")
function escapeAttr(value) {
  try {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  } catch {
    return '';
  }
}

function appendFindingItem(f) {
    const div = document.createElement('div'); div.className = 'item';
  const helpUrl = (ruleMeta && ruleMeta[f.ruleId] && ruleMeta[f.ruleId].helpUrl) ? ruleMeta[f.ruleId].helpUrl : '';
  const helpHtml = helpUrl ? `<a href="#" data-act=\"help\" class=\"pill\">Help</a>` : '';
    // Build enhanced priority display with accessibility
    let priorityHtml = '';
    // Default severity pill (hidden in intelligent mode to avoid duplication)
    let impactHtml = f.impact ? `<span class="pill" title="severity">${f.impact}</span>` : '';
    
    if (scanOptions.intelligentPriority && f.priorityScore !== undefined) {
      const level = getPriorityLevel(f.priorityScore);
      const icon = getPriorityIcon(f.priorityScore);
      const color = getPriorityColor(f.priorityScore);
      
      // Enhanced tooltip with multiple explanations (with fallback)
      const tooltipParts = [
        f.priorityExplanation || '',
        f.contextExplanation ? `Context: ${f.contextExplanation}` : ''
      ].filter(Boolean);
      const tooltip = tooltipParts.length ? tooltipParts.join('\n\n') : `Priority ${f.priorityScore} (${level}).`;
      const titleAttr = escapeAttr(tooltip);
      
      priorityHtml = `<span class="pill priority-${level}" 
                            style="background: ${color}; color: white; border-left: 4px solid ${color};" 
                            title="${titleAttr}"
                            aria-label="Priority score ${f.priorityScore} out of 30, ${level} priority level"
                            role="img">
                        ${icon} ${f.priorityScore}
                      </span>`;
      
      // Hide traditional impact pill to prevent duplicate 'critical' labels next to priority pill
      impactHtml = '';
    }
    
    // Row-level tooltip for quick context
    div.title = f.priorityExplanation || f.message || '';
    
    div.innerHTML = `
      <div><strong>${f.ruleId}</strong> ${impactHtml} ${priorityHtml} ${typeof f.confidence==='number'?`<span class="pill" title="confidence">${(f.confidence||0).toFixed(2)}</span>`:''}</div>
      <div class="meta">${(f.wcag||[]).join(', ')} • ${f.selector}</div>
      <div class="kvs">${f.message}
${f.evidence ? JSON.stringify(f.evidence, null, 2) : ''}</div>
      <div class="row">
        <button data-act="reveal">Reveal in Elements</button>
        <a href="#" data-act="wcag" class="pill">Open WCAG</a>
        ${helpHtml}
        <button data-act="copy-sel">Copy selector</button>
        <button data-act="ignore-this">Ignore this</button>
        <button data-act="ignore-rule">Ignore rule</button>
      </div>`;
    div.querySelector('[data-act="reveal"]').addEventListener('click', () => revealInElements(f.selector));
    div.querySelector('[data-act="copy-sel"]').addEventListener('click', async () => { try { await navigator.clipboard.writeText(f.selector); } catch {} });
    div.querySelector('[data-act="wcag"]').addEventListener('click', (e) => {
      e.preventDefault();
      const first = (f.wcag||[])[0]; if (!first) return;
      const url = `https://www.w3.org/WAI/WCAG21/Understanding/${first.replace(/\./g,'-')}`;
      window.open(url, '_blank', 'noopener');
    });
  if (helpUrl) {
    const a = div.querySelector('[data-act="help"]');
    if (a) a.addEventListener('click', (e) => { e.preventDefault(); window.open(helpUrl, '_blank', 'noopener'); });
  }
  div.querySelector('[data-act="ignore-this"]').addEventListener('click', () => { ignores.selectors.add(f.selector); persistIgnores(); render(); });
  div.querySelector('[data-act="ignore-rule"]').addEventListener('click', () => { ignores.rules.add(f.ruleId); persistIgnores(); render(); });
  div.addEventListener('click', () => renderDetails(f));
    listEl.appendChild(div);
}

function renderDetails(f) {
  if (!detailsEl || !f) return;
  const wcag = (f.wcag||[]).join(', ');
  const evidence = f.evidence ? `<pre>${JSON.stringify(f.evidence, null, 2)}</pre>` : '';
  const severity = f.impact || '';
  const how = guidanceForRule(f.ruleId, f);
  const helpUrl = (ruleMeta && ruleMeta[f.ruleId] && ruleMeta[f.ruleId].helpUrl) ? ruleMeta[f.ruleId].helpUrl : '';
  detailsEl.innerHTML = `
    <div><strong>${f.ruleId}</strong> <span class="pill">${severity}</span></div>
    <div style="margin:6px 0">${f.message}</div>
    <div class="meta">WCAG: ${wcag}</div>
    ${helpUrl?`<div style="margin:6px 0"><a href="#" id="d-help" class="pill">Help</a></div>`:''}
    <div style="margin-top:8px">${how}</div>
    <div style="margin-top:8px">${evidence}</div>
    <div class="row" style="margin-top:8px">
      <button id="d-reveal">Reveal</button>
      <button id="d-ignore-this">Ignore this</button>
      <button id="d-ignore-rule">Ignore rule</button>
    </div>`;
  detailsEl.querySelector('#d-reveal').addEventListener('click', () => revealInElements(f.selector));
  detailsEl.querySelector('#d-ignore-this').addEventListener('click', () => { ignores.selectors.add(f.selector); persistIgnores(); render(); renderDetails(f); });
  detailsEl.querySelector('#d-ignore-rule').addEventListener('click', () => { ignores.rules.add(f.ruleId); persistIgnores(); render(); renderDetails(f); });
  if (helpUrl) detailsEl.querySelector('#d-help')?.addEventListener('click', (e) => { e.preventDefault(); window.open(helpUrl, '_blank', 'noopener'); });
}

function guidanceForRule(ruleId, f) {
  const map = {
    'img-alt': 'Add meaningful alt text, or alt="" if decorative. Prefer labeling graphics via aria-labelledby for complex images.',
    'control-name': 'Ensure controls have an accessible name via visible text, aria-label, or aria-labelledby.',
    'label-control': 'Associate inputs with <label for> or wrap them with <label>.',
    'headings-order': 'Adjust headings to avoid level jumps. Use h2 under h1, etc.',
    'landmarks': 'Add a single main landmark. Prefer semantic <main>.',
    'aria-role-valid': 'Use a valid ARIA role token and ensure it matches the element semantics.',
    'aria-required-props': 'Provide required ARIA attributes for this role (e.g., aria-level for role=heading).',
    'aria-attr-valid': 'Remove invalid aria-* attributes or correct typos.',
    'aria-presentation-misuse': 'Avoid role=presentation/none on interactive elements.',
    'target-size': 'Increase control size to at least 24×24px (or provide sufficient spacing).',
    'contrast-text': 'Increase color contrast or font size/weight to meet thresholds.',
    'button-name': 'Provide discernible text via visible label, aria-label, or aria-labelledby.',
    'link-name': 'Provide discernible text via link text, aria-label, or aria-labelledby.',
    'aria-hidden-focus': 'Remove focusable elements from aria-hidden containers or remove aria-hidden.',
    'list': 'Ensure <ul>/<ol> have only <li>, <script>, or <template> as direct children.',
    'html-lang': 'Set <html lang="…"> appropriately.',
    'document-title': 'Provide a concise, descriptive <title>.',
    'skip-link': 'Include a skip link to the main content.',
    'link-button-misuse': 'Use <button> for actions; use <a href> for navigation.',
    'tabindex-positive': 'Avoid tabindex>0; rely on DOM order and tabindex="0" for widgets.',
    'fieldset-legend': 'Group related radio controls within <fieldset> with a <legend>.',
    'autocomplete': 'Add proper autocomplete tokens (e.g., email, tel, name, current-password).',
    'media-captions': 'Provide captions/subtitles via <track> for videos.',
    'audio-transcript': 'Provide a transcript or text alternative for audio.',
    'heading-h1': 'Include a top-level <h1> for document structure.',
    'region-name': 'Provide an accessible name for region landmarks via aria-label/labelledby.',
    'iframe-title': 'Add a descriptive title to iframes.',
    'meta-viewport': 'Add <meta name="viewport"> for responsive/zoom behavior.'
  };
  const text = map[ruleId] || '';
  return text;
}

function persistIgnores() {
  try {
    const payload = {
      selectors: Array.from(ignores.selectors),
      rules: Array.from(ignores.rules)
    };
    const key = `a11y_ignores::${inspectedHost||''}`;
    localStorage.setItem(key, JSON.stringify(payload));
    send({ type: 'set-ignores', selectors: payload.selectors, rules: payload.rules });
  } catch {}
}

function loadIgnores() {
  try {
    const key = `a11y_ignores::${inspectedHost||''}`;
    const raw = localStorage.getItem(key);
    if (!raw) return;
    const obj = JSON.parse(raw);
    ignores.selectors = new Set(Array.isArray(obj.selectors) ? obj.selectors : []);
    ignores.rules = new Set(Array.isArray(obj.rules) ? obj.rules : []);
  } catch {}
}

function copyJson() {
  const items = getFilteredFindings();
  
  // Enhanced export with metadata and priority information
  const exportData = {
    exportMetadata: {
      timestamp: new Date().toISOString(),
      url: chrome.devtools.inspectedWindow.location.href || 'unknown',
      preset: presetSel?.value || 'default',
      intelligentPriority: scanOptions.intelligentPriority,
      scanOptions: {
        live: scanOptions.live,
        viewportOnly: scanOptions.viewportOnly,
        shadow: scanOptions.shadow,
        iframes: scanOptions.iframes,
        hideNeedsReview: scanOptions.hideNeedsReview
      },
      filters: {
        rule: filterRule?.value || '',
        impact: filterImpact?.value || '',
        minConfidence: parseFloat(minConf?.value || '0'),
        search: searchBox?.value || ''
      },
      totalIssues: findings.length,
      filteredIssues: items.length
    },
    findings: items,
    ...(scanOptions.intelligentPriority && {
      priorityAnalytics: {
        averageScore: items.length ? (items.reduce((sum, f) => sum + (f.priorityScore || 0), 0) / items.length).toFixed(2) : 0,
        distribution: ['critical', 'high', 'medium', 'low', 'minimal'].reduce((dist, level) => {
          dist[level] = items.filter(f => getPriorityLevel(f.priorityScore || 0) === level).length;
          return dist;
        }, {}),
        contextBreakdown: items.reduce((breakdown, f) => {
          const region = f.context?.pageRegion || 'unknown';
          breakdown[region] = (breakdown[region] || 0) + 1;
          return breakdown;
        }, {})
      }
    })
  };
  
  const text = JSON.stringify(exportData, null, 2);
  navigator.clipboard.writeText(text).catch(()=>{});
}

function toSarif(findings) {
  return {
    "$schema": "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json",
    "version": "2.1.0",
    "runs": [{
      "tool": { "driver": { "name": "A11y Inspector Overlay (Pro Demo)",
        "informationUri": "https://example.invalid/a11y-overlay",
        "rules": Array.from(new Set(findings.map(f => f.ruleId))).map(id => ({
          "id": id,
          "name": id,
          "shortDescription": { "text": id },
          ...(ruleMeta && ruleMeta[id] ? { "helpUri": ruleMeta[id].helpUrl, "properties": { "tags": ruleMeta[id].tags||[] } } : {})
        }))
      }},
      "properties": { "profile": (typeof window !== 'undefined' && window.__a11yProfile) || 'default' },
      "results": findings.map(f => ({
        "ruleId": f.ruleId,
        "level": (f.impact === 'critical' || f.impact === 'serious') ? "error" : "warning",
        "message": { "text": f.message },
        "locations": [{ "physicalLocation": { "artifactLocation": { "uri": inspectedUrl || location.href }, "region": { "snippet": { "text": f.selector } } } }],
        ...(typeof f.needsReview === 'boolean' ? { "properties": { "needsReview": f.needsReview } } : {})
      }))
    }]
  };
}

function downloadSarif() {
  const items = getFilteredFindings();
  const sarif = JSON.stringify(toSarif(items), null, 2);
  const blob = new Blob([sarif], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'a11y-results.sarif.json'; a.click();
  setTimeout(()=>URL.revokeObjectURL(url), 1000);
}

$('#btn-toggle').addEventListener('click', toggleOverlay);
$('#btn-rescan').addEventListener('click', rescan);
$('#btn-copy-json').addEventListener('click', copyJson);
$('#btn-download-sarif').addEventListener('click', downloadSarif);
document.querySelector('#btn-download-html')?.addEventListener('click', downloadHtmlReport);
document.querySelector('#btn-download-csv')?.addEventListener('click', downloadCsv);
document.querySelector('#btn-compare-axe')?.addEventListener('click', async () => {
  const status = document.querySelector('#axe-status');
  const setStatus = (txt, show=true) => { if (!status) return; status.textContent = txt; status.style.display = show ? '' : 'none'; };
  setStatus('Loading axe…');
  const injectCode = `(() => { try { if (window.axe) return { ok:true, already:true }; const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.8.3/axe.min.js'; s.onload = () => {}; s.onerror = () => {}; document.documentElement.appendChild(s); return { ok:true, already:false }; } catch (e) { return { ok:false, error: String(e) }; } })();`;
  chrome.devtools.inspectedWindow.eval(injectCode, (res, exc) => {
    if (exc || !res || !res.ok) { setStatus('Blocked by CSP', true); setTimeout(()=>setStatus('', false), 4000); return; }
    const runCode = `(() => new Promise(async (resolve) => { try { if (!window.axe) { let tries=0; const t=setInterval(()=>{ tries++; if (window.axe || tries>40) { clearInterval(t); if (window.axe) resolve({ok:true}); else resolve({ok:false,error:'axe not available'}); } }, 100); } else { resolve({ok:true}); } } catch(e){ resolve({ok:false,error:String(e)});} ))()`;
    chrome.devtools.inspectedWindow.eval(runCode, (ready) => {
      if (!ready || !ready.ok) { setStatus('Blocked by CSP', true); setTimeout(()=>setStatus('', false), 4000); return; }
      setStatus('Running axe…');
      const exec = `(() => new Promise(async (resolve)=>{ try { const r = await window.axe.run(document, { resultTypes: ['violations'] }); resolve({ ok:true, results:r }); } catch(e){ resolve({ ok:false, error:String(e) }); } }))()`;
      chrome.devtools.inspectedWindow.eval(exec, (out) => {
        if (!out || !out.ok) { setStatus('Axe run failed', true); setTimeout(()=>setStatus('', false), 3000); return; }
        const axeCounts = (out.results?.violations||[]).reduce((m, v) => { m[v.id] = (m[v.id]||0) + v.nodes.length; return m; }, {});
        const ourCounts = findings.reduce((m, f) => { m[f.ruleId] = (m[f.ruleId]||0) + 1; return m; }, {});
        const top = Object.keys(axeCounts).sort((a,b)=>axeCounts[b]-axeCounts[a]).slice(0,10).map(id => `${id}: axe=${axeCounts[id]} ours=${ourCounts[id]||0}`).join(' · ');
        setStatus(top || 'No axe violations');
        setTimeout(()=>setStatus('', false), 7000);
      });
    });
  });
});
document.querySelector('#btn-clear-results-dev')?.addEventListener('click', () => { findings = []; render(); sumEl.innerHTML = '<strong>0</strong> issues'; send({ type: 'clear-results' }); });
document.querySelector('#btn-clear-ignores')?.addEventListener('click', () => { ignores = { selectors: new Set(), rules: new Set() }; persistIgnores(); render(); if (detailsEl) detailsEl.textContent = 'Ignores cleared.'; });
filterRule.addEventListener('change', () => { persistPerSiteUiState(); render(); });
groupSel?.addEventListener('change', () => { persistGlobalUiState(); render(); });
filterImpact?.addEventListener('change', () => { persistPerSiteUiState(); render(); });
minConf?.addEventListener('input', () => { if (confVal) confVal.textContent = (parseFloat(minConf.value||'0')||0).toFixed(2); persistPerSiteUiState(); render(); });
sortSel?.addEventListener('change', () => { persistGlobalUiState(); render(); });
searchBox?.addEventListener('input', () => { persistPerSiteUiState(); render(); });
presetSel?.addEventListener('change', () => { applyPreset(presetSel.value); render(); });

// Simple vs Advanced control toggle
try {
  const advBtn = document.querySelector('#btn-advanced');
  if (advBtn) {
    advBtn.addEventListener('click', () => {
      const root = document.querySelector('body');
      const show = !root.classList.contains('show-advanced');
      root.classList.toggle('show-advanced', show);
      advBtn.textContent = show ? 'Advanced ▴' : 'Advanced ▾';
      persistGlobalUiState();
    });
  }
} catch {}

document.querySelector('#btn-reset-preset')?.addEventListener('click', () => {
  const name = presetSel?.value || 'default';
  if (name) { applyPreset(name); render(); }
});

// The original onMessage listener is removed as per the new_code, as the port is now managed directly.
// The handlePortMessage function is also removed as it's no longer needed.

requestFindings();
setStatus();
loadIgnores();
// Load presets.json dynamically
try {
  fetch(chrome.runtime.getURL('presets.json')).then(r => r.json()).then((json) => {
    presets = json; presetsLoaded = true;
    // Populate preset dropdown from presets.json
    if (presetSel && presets) {
      // Keep default options if present but sync labels
      while (presetSel.firstChild) presetSel.removeChild(presetSel.firstChild);
      const entries = Object.keys(presets);
      for (const name of entries) {
        const opt = document.createElement('option');
        opt.value = name; opt.textContent = `Preset: ${name.charAt(0).toUpperCase()}${name.slice(1)}`;
        if (name === 'axe') opt.textContent = 'Preset: Axe Core';
        if (name === 'lighthouse') opt.textContent = 'Preset: Lighthouse';
        if (name === 'ibm') opt.textContent = 'Preset: IBM Accessibility';
        presetSel.appendChild(opt);
      }
      ensureCustomPresetOption();
    }
    // Auto-apply persisted preset once host known
    maybeAutoApplyPreset();
  }).catch(() => { presets = null; presetsLoaded = true; maybeAutoApplyPreset(); });
} catch {}

try {
  chrome.devtools.inspectedWindow.eval('location.host', (host) => {
    if (typeof host === 'string') {
      inspectedHost = host;
      loadGlobalUiState();
      loadPerSiteUiState();
      loadIgnores();
      loadScanOptions();
      chrome.devtools.inspectedWindow.eval('location.href', (href) => { if (typeof href === 'string') inspectedUrl = href; render(); });
      maybeAutoApplyPreset();
    }
  });
} catch {}

// Performance options persistence (per-host)
function persistScanOptions() {
  try {
    const key = `a11y_scanopts::${inspectedHost||''}`;
    const payload = { 
      live: !!scanOptions.live, 
      viewportOnly: !!scanOptions.viewportOnly, 
      shadow: !!scanOptions.shadow, 
      iframes: !!scanOptions.iframes, 
      hideNeedsReview: !!scanOptions.hideNeedsReview,
      intelligentPriority: !!scanOptions.intelligentPriority
    };
    localStorage.setItem(key, JSON.stringify(payload));
    send({ type: 'set-scan-options', ...payload });
  } catch {}
}

function loadScanOptions() {
  try {
    const key = `a11y_scanopts::${inspectedHost||''}`;
    const raw = localStorage.getItem(key);
    if (!raw) return;
    const obj = JSON.parse(raw);
    scanOptions.live = !!obj.live;
    scanOptions.viewportOnly = !!obj.viewportOnly;
    scanOptions.shadow = !!obj.shadow;
    scanOptions.iframes = !!obj.iframes;
    scanOptions.hideNeedsReview = !!obj.hideNeedsReview;
    scanOptions.intelligentPriority = !!obj.intelligentPriority;
    if (optLive) optLive.checked = scanOptions.live;
    if (optViewport) optViewport.checked = scanOptions.viewportOnly;
    if (optShadow) optShadow.checked = scanOptions.shadow;
    if (optIframes) optIframes.checked = scanOptions.iframes;
    if (optHideNR) optHideNR.checked = scanOptions.hideNeedsReview;
    if (optIntelligentPriority) optIntelligentPriority.checked = scanOptions.intelligentPriority;
  } catch {}
}

optLive?.addEventListener('change', () => { scanOptions.live = !!optLive.checked; persistScanOptions(); });
optViewport?.addEventListener('change', () => { scanOptions.viewportOnly = !!optViewport.checked; persistScanOptions(); });
optShadow?.addEventListener('change', () => { scanOptions.shadow = !!optShadow.checked; persistScanOptions(); });
optIframes?.addEventListener('change', () => { scanOptions.iframes = !!optIframes.checked; persistScanOptions(); });
optHideNR?.addEventListener('change', () => { scanOptions.hideNeedsReview = !!optHideNR.checked; persistScanOptions(); });
optIntelligentPriority?.addEventListener('change', () => { 
  scanOptions.intelligentPriority = !!optIntelligentPriority.checked; 
  persistScanOptions(); 
  
  // Show/hide priority configuration button
  const configBtn = document.querySelector('#btn-priority-config');
  if (configBtn) {
    configBtn.style.display = scanOptions.intelligentPriority ? 'inline-block' : 'none';
  }
  
  // Auto-switch to priority sorting when enabled
  if (scanOptions.intelligentPriority && sortSel) {
    sortSel.value = 'priority';
  } else if (!scanOptions.intelligentPriority && sortSel && sortSel.value === 'priority') {
    sortSel.value = 'impact';
  }
  render(); // Re-render to show/hide priority scores
});

function downloadHtmlReport() {
  const items = getFilteredFindings();
  
  // Enhanced row generation with priority data
  const rows = items.map(f => {
    const priorityInfo = (scanOptions.intelligentPriority && f.priorityScore !== undefined) 
      ? `<td><span class="priority-${getPriorityLevel(f.priorityScore)}">${f.priorityScore} (${f.priorityLabel})</span></td>
         <td title="${f.contextExplanation || ''}">${f.context?.pageRegion || 'N/A'}</td>`
      : '<td colspan="2">Traditional Mode</td>';
    
    return `<tr>
      <td>${f.ruleId}</td>
      <td><span class="${f.impact}">${f.impact||''}</span></td>
      ${priorityInfo}
      <td>${(f.wcag||[]).join(', ')}</td>
      <td><code>${f.selector}</code></td>
      <td>${f.message}</td>
    </tr>`;
  }).join('');
  
  const presetName = presetSel?.value || 'default';
  const meta = `Preset: ${presetName} • Live: ${scanOptions.live} • ViewportOnly: ${scanOptions.viewportOnly} • Shadow: ${scanOptions.shadow} • Iframes: ${scanOptions.iframes} • HideNeedsReview: ${scanOptions.hideNeedsReview} • MinConf: ${(parseFloat(minConf?.value||'0')||0).toFixed(2)} • IntelligentPriority: ${scanOptions.intelligentPriority}`;
  
  const priorityHeaders = scanOptions.intelligentPriority ? '<th>Priority Score</th><th>Context</th>' : '';
  const html = `<!doctype html><meta charset="utf-8"><title>A11y Report</title>
  <style>
    body{font:14px system-ui}
    table{border-collapse:collapse;width:100%}
    td,th{border:1px solid #ccc;padding:6px;text-align:left}
    .priority-critical{background:#dc2626;color:white}
    .priority-high{background:#ea580c;color:white}
    .priority-medium{background:#ca8a04;color:white}
    .priority-low{background:#16a34a;color:white}
    .priority-minimal{background:#6b7280;color:white}
    code{background:#f5f5f5;padding:2px 4px;border-radius:3px}
  </style>
  <h1>A11y Report</h1>
  <div style="margin:16px 0;padding:8px;background:#f9f9f9;border-radius:4px">${meta}</div>
  <table>
    <thead>
      <tr><th>Rule</th><th>Impact</th>${priorityHeaders}<th>WCAG</th><th>Selector</th><th>Message</th></tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'a11y-report.html'; a.click();
  setTimeout(()=>URL.revokeObjectURL(url), 1000);
}

function downloadCsv() {
  const items = getFilteredFindings();
  const headers = ['ruleId','impact','wcag','selector','message','confidence'];
  const esc = (s) => '"' + String(s).replace(/"/g,'""') + '"';
  const rows = [headers.join(',')].concat(items.map(f => [f.ruleId, f.impact||'', (f.wcag||[]).join(' '), f.selector, f.message, (typeof f.confidence==='number'?(f.confidence.toFixed(2)):'')].map(esc).join(',')));
  const csv = rows.join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'a11y-results.csv'; a.click();
  setTimeout(()=>URL.revokeObjectURL(url), 1000);
}

function maybeAutoApplyPreset() {
  // Auto-apply last selected preset if available
  if (!inspectedHost || autoAppliedPresetOnce) return;
  const saved = loadSelectedPreset();
  if (!saved) return;
  if (presetSel) presetSel.value = saved;
  applyPreset(saved);
  autoAppliedPresetOnce = true;
}

function handlePortMessage(msg) {
  if (DEBUG) try { console.debug('[A11y][DT] Message from BG', msg && msg.type); } catch {}
  if (!msg || msg._from !== 'content') return;
  isConnected = true;
  if (msg.type === 'restricted') {
    isRestricted = true;
    try { if (rescanTimer) { clearTimeout(rescanTimer); rescanTimer = 0; } } catch {}
    const btn = $('#btn-rescan'); if (btn) { btn.disabled = false; btn.textContent = 'Rescan'; }
    setStatus();
    return;
  }
  if (msg.type === 'findings') {
    findings = msg.findings || [];
    if (typeof msg.scanMs === 'number') setStatus._lastMs = msg.scanMs;
    if (Array.isArray(msg.allRuleIds) && msg.allRuleIds.length) {
      allRuleIds = msg.allRuleIds;
    }
    if (Array.isArray(msg.enabledRules)) {
      enabledRules = msg.enabledRules;
    }
    if (msg.ruleMeta) ruleMeta = msg.ruleMeta;
    lastScanAt = Date.now();
    try { if (rescanTimer) { clearTimeout(rescanTimer); rescanTimer = 0; } } catch {}
    const btn = $('#btn-rescan'); if (btn) { btn.disabled = false; btn.textContent = 'Rescan'; }
    renderRuleToggles();
    // Apply saved custom enabled rules per host after toggles are populated
    try { loadEnabledRulesPerHost(); } catch {}
    render();
    setStatus();
  }
  if (msg.type === 'live-status') {
    setStatus._livePaused = !!msg.paused;
    setStatus();
  }
}
// bind for current connection
try { port.onMessage.addListener(handlePortMessage); } catch {}
