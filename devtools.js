// devtools.js — Phase 2 DevTools panel
const DEBUG = false;
const tabId = chrome.devtools.inspectedWindow.tabId;

// Toast Manager - Phase 2
const ToastManager = {
  container: null,

  init() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      this.container.setAttribute('aria-live', 'polite');
      this.container.setAttribute('aria-atomic', 'true');
      document.body.appendChild(this.container);
    }
  },

  show(message, type = 'info', duration = 3000) {
    this.init();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'status');

    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };

    toast.innerHTML = `
      <span class="toast-icon" aria-hidden="true">${icons[type] || icons.info}</span>
      <span class="toast-message">${escapeHtml(message)}</span>
      <button class="toast-dismiss" aria-label="Dismiss">&times;</button>
    `;

    const dismiss = () => {
      toast.classList.add('toast-exit');
      setTimeout(() => toast.remove(), 200);
    };

    toast.querySelector('.toast-dismiss').addEventListener('click', dismiss);
    this.container.appendChild(toast);

    if (duration > 0) {
      setTimeout(dismiss, duration);
    }

    return toast;
  }
};

// Collapsible Section Manager - Phase 3
const CollapsibleManager = {
  STORAGE_KEYS: {
    SUMMARY: 'a11y.ui.summary.collapsed',
    RULES: 'a11y.ui.rules.collapsed',
  },

  DEFAULTS: {
    SUMMARY: false,    // Summary expanded by default
    RULES: true,       // Rules collapsed by default
  },

  init() {
    // Initialize all collapsible sections
    document.querySelectorAll('.section-collapsible').forEach(section => {
      const button = section.querySelector('.section-header');
      if (!button) return;

      // Get storage key from section ID
      let storageKey = null;
      if (section.id === 'summary-section') storageKey = this.STORAGE_KEYS.SUMMARY;
      if (section.id === 'rules-section') storageKey = this.STORAGE_KEYS.RULES;

      // Restore collapsed state from localStorage
      if (storageKey) {
        const collapsed = this.getCollapsedState(storageKey);
        section.setAttribute('aria-expanded', String(!collapsed));
      }

      // Add click handler
      button.addEventListener('click', () => {
        const isExpanded = section.getAttribute('aria-expanded') === 'true';
        const newExpanded = !isExpanded;
        section.setAttribute('aria-expanded', String(newExpanded));

        // Save state to localStorage
        if (storageKey) {
          this.setCollapsedState(storageKey, !newExpanded);
        }
      });

      // Keyboard support (Enter and Space)
      button.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          button.click();
        }
      });
    });
  },

  getCollapsedState(key) {
    try {
      const value = localStorage.getItem(key);
      if (value !== null) {
        return JSON.parse(value);
      }
      // Return default based on key
      if (key === this.STORAGE_KEYS.SUMMARY) return this.DEFAULTS.SUMMARY;
      if (key === this.STORAGE_KEYS.RULES) return this.DEFAULTS.RULES;
      return false;
    } catch (e) {
      console.warn('localStorage read failed:', e);
      return false;
    }
  },

  setCollapsedState(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('localStorage write failed:', e);
    }
  }
};

// Truncation Manager - Phase 3
const TruncationManager = {
  SELECTOR_MAX_LENGTH: 60,
  MESSAGE_MAX_LENGTH: 100,

  init() {
    // Delegated event listener for truncated selectors and messages
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('selector-truncate')) {
        e.stopPropagation(); // Prevent item selection
        this.toggleExpand(e.target);
      }
      if (e.target.classList.contains('message-truncate')) {
        e.stopPropagation(); // Prevent item selection
        this.toggleExpand(e.target);
      }
    });
  },

  toggleExpand(element) {
    element.classList.toggle('expanded');
  },

  truncateSelector(selector) {
    if (!selector || selector.length <= this.SELECTOR_MAX_LENGTH) {
      return escapeHtml(selector);
    }

    // Return HTML with truncation class and full text in title attribute
    const truncated = selector.slice(0, this.SELECTOR_MAX_LENGTH) + '...';
    return `<span class="selector-truncate"
                  title="${escapeAttr(selector)}"
                  tabindex="0"
                  role="button"
                  aria-label="Click to expand full selector">${escapeHtml(truncated)}</span>`;
  },

  truncateMessage(message) {
    if (!message || message.length <= this.MESSAGE_MAX_LENGTH) {
      return escapeHtml(message);
    }

    // Use CSS line-clamp for multi-line truncation
    return `<span class="message-truncate truncate-lines truncate-lines-2"
                  title="${escapeAttr(message)}"
                  tabindex="0"
                  role="button"
                  aria-label="Click to expand full message">${escapeHtml(message)}</span>`;
  }
};

// Security: HTML escape function to prevent XSS
function escapeHtml(unsafe) {
  if (unsafe == null) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
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
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner spinner-sm spinner-inline spinner-light"></span>Rescanning…';
  }
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
  ToastManager.show(`Switched to ${name.charAt(0).toUpperCase() + name.slice(1)} preset`, 'info', 2000);
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
  const div = document.createElement('div');

  // Phase 3: Add priority-based visual hierarchy class
  let priorityClass = '';
  if (scanOptions.intelligentPriority && f.priorityScore !== undefined) {
    const level = getPriorityLevel(f.priorityScore);
    priorityClass = ` finding-${level}`;
  }
  div.className = `item${priorityClass}`;

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
      <div><strong>${escapeHtml(f.ruleId)}</strong> ${impactHtml} ${priorityHtml} ${typeof f.confidence==='number'?`<span class="pill" title="confidence">${(f.confidence||0).toFixed(2)}</span>`:''}</div>
      <div class="meta">${escapeHtml((f.wcag||[]).join(', '))} • ${TruncationManager.truncateSelector(f.selector)}</div>
      <div class="kvs">${TruncationManager.truncateMessage(f.message)}
${f.evidence ? escapeHtml(JSON.stringify(f.evidence, null, 2)) : ''}</div>
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

  // Phase 3: Collapsible evidence display
  const evidenceHtml = f.evidence ? `
    <div class="evidence-collapsible" aria-expanded="false" style="margin-top:8px">
      <button class="evidence-header" aria-controls="evidence-content" type="button">
        <span class="evidence-toggle-icon">▶</span>
        <span>Show Evidence</span>
      </button>
      <div id="evidence-content" class="evidence-content hidden">
        <pre>${escapeHtml(JSON.stringify(f.evidence, null, 2))}</pre>
      </div>
    </div>
  ` : '';

  const severity = f.impact || '';
  const how = guidanceForRule(f.ruleId, f); // Returns safe HTML from trusted source
  const helpUrl = (ruleMeta && ruleMeta[f.ruleId] && ruleMeta[f.ruleId].helpUrl) ? ruleMeta[f.ruleId].helpUrl : '';
  detailsEl.innerHTML = `
    <div><strong>${escapeHtml(f.ruleId)}</strong> <span class="pill">${escapeHtml(severity)}</span></div>
    <div style="margin:6px 0">${escapeHtml(f.message)}</div>
    <div class="meta">WCAG: ${escapeHtml(wcag)}</div>
    ${helpUrl?`<div style="margin:6px 0"><a href="#" id="d-help" class="pill">Help</a></div>`:''}
    <div style="margin-top:8px">${how}</div>
    ${evidenceHtml}
    <div class="row" style="margin-top:8px">
      <button id="d-reveal">Reveal</button>
      <button id="d-ignore-this">Ignore this</button>
      <button id="d-ignore-rule">Ignore rule</button>
    </div>`;
  detailsEl.querySelector('#d-reveal').addEventListener('click', () => revealInElements(f.selector));
  detailsEl.querySelector('#d-ignore-this').addEventListener('click', () => { ignores.selectors.add(f.selector); persistIgnores(); render(); renderDetails(f); });
  detailsEl.querySelector('#d-ignore-rule').addEventListener('click', () => { ignores.rules.add(f.ruleId); persistIgnores(); render(); renderDetails(f); });
  if (helpUrl) detailsEl.querySelector('#d-help')?.addEventListener('click', (e) => { e.preventDefault(); window.open(helpUrl, '_blank', 'noopener'); });

  // Phase 3: Add evidence toggle handler
  const evidenceToggle = detailsEl.querySelector('.evidence-header');
  if (evidenceToggle) {
    evidenceToggle.addEventListener('click', () => {
      const section = evidenceToggle.closest('.evidence-collapsible');
      const content = detailsEl.querySelector('#evidence-content');
      const icon = evidenceToggle.querySelector('.evidence-toggle-icon');
      const text = evidenceToggle.querySelector('span:last-child');
      const isExpanded = section.getAttribute('aria-expanded') === 'true';

      section.setAttribute('aria-expanded', String(!isExpanded));
      content.classList.toggle('hidden');
      icon.textContent = isExpanded ? '▶' : '▼';
      text.textContent = isExpanded ? 'Show Evidence' : 'Hide Evidence';
    });
  }
}

/**
 * Enhanced Guidance Database
 * Provides structured fix guidance with before/after examples and WCAG references.
 * Used by DevTools panel and export functions.
 */
const GUIDANCE_DATABASE = {
  // ============================================
  // IMAGES
  // ============================================
  'img-alt': {
    text: 'Add meaningful alt text describing the image content, or alt="" if purely decorative. For complex images like charts, use aria-labelledby to reference a longer description.',
    exampleBefore: '<img src="hero.jpg">',
    exampleAfter: '<img src="hero.jpg" alt="Students collaborating in modern library">',
    wcag: [{ id: '1.1.1', url: 'https://www.w3.org/WAI/WCAG21/Understanding/non-text-content' }]
  },

  // ============================================
  // FORMS & LABELS
  // ============================================
  'label-control': {
    text: 'Associate inputs with a visible label using <label for="id"> or by wrapping the input inside the <label> element.',
    exampleBefore: 'Name: <input type="text" name="name">',
    exampleAfter: '<label for="name">Name:</label>\n<input type="text" id="name" name="name">',
    wcag: [
      { id: '1.3.1', url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships' },
      { id: '3.3.2', url: 'https://www.w3.org/WAI/WCAG21/Understanding/labels-or-instructions' }
    ]
  },
  'fieldset-legend': {
    text: 'Group related form controls (especially radio buttons and checkboxes) within a <fieldset> and provide a <legend> describing the group.',
    exampleBefore: '<input type="radio" name="size"> Small\n<input type="radio" name="size"> Large',
    exampleAfter: '<fieldset>\n  <legend>Select size</legend>\n  <input type="radio" name="size" id="small">\n  <label for="small">Small</label>\n  <input type="radio" name="size" id="large">\n  <label for="large">Large</label>\n</fieldset>',
    wcag: [{ id: '1.3.1', url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships' }]
  },
  'autocomplete': {
    text: 'Add the appropriate autocomplete attribute to help users complete forms faster and reduce input errors.',
    exampleBefore: '<input type="email" name="email">',
    exampleAfter: '<input type="email" name="email" autocomplete="email">',
    wcag: [{ id: '1.3.5', url: 'https://www.w3.org/WAI/WCAG21/Understanding/identify-input-purpose' }]
  },
  'button-name': {
    text: 'Ensure buttons have discernible text via visible label, aria-label, or aria-labelledby. Icon-only buttons need aria-label.',
    exampleBefore: '<button><svg class="icon-search"></svg></button>',
    exampleAfter: '<button aria-label="Search">\n  <svg class="icon-search" aria-hidden="true"></svg>\n</button>',
    wcag: [{ id: '4.1.2', url: 'https://www.w3.org/WAI/WCAG21/Understanding/name-role-value' }]
  },
  'control-name': {
    text: 'Ensure all interactive controls have an accessible name via visible text, aria-label, or aria-labelledby.',
    exampleBefore: '<div role="button" onclick="submit()"></div>',
    exampleAfter: '<div role="button" onclick="submit()" aria-label="Submit form">Submit</div>',
    wcag: [{ id: '4.1.2', url: 'https://www.w3.org/WAI/WCAG21/Understanding/name-role-value' }]
  },

  // ============================================
  // COLOUR & CONTRAST
  // ============================================
  'contrast-text': {
    text: 'Increase the colour contrast between text and background. Normal text needs 4.5:1 ratio; large text (18pt+ or 14pt bold) needs 3:1.',
    exampleBefore: '<p style="color: #999; background: #fff;">Low contrast text</p>',
    exampleAfter: '<p style="color: #595959; background: #fff;">Sufficient contrast text</p>',
    wcag: [{ id: '1.4.3', url: 'https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum' }]
  },
  'link-in-text-block': {
    text: 'Links within text blocks need a non-colour distinguisher (underline, bold, icon) plus 3:1 contrast against surrounding text.',
    exampleBefore: '<p>Read our <a href="/terms" style="color: #0066cc; text-decoration: none;">terms</a></p>',
    exampleAfter: '<p>Read our <a href="/terms" style="color: #0066cc; text-decoration: underline;">terms</a></p>',
    wcag: [{ id: '1.4.1', url: 'https://www.w3.org/WAI/WCAG21/Understanding/use-of-color' }]
  },

  // ============================================
  // TARGET SIZE
  // ============================================
  'target-size': {
    text: 'Increase the clickable/tappable area to at least 24×24 CSS pixels. Add padding, increase button size, or ensure sufficient spacing between targets.',
    exampleBefore: '<a href="/next" style="padding: 2px;">→</a>',
    exampleAfter: '<a href="/next" style="display: inline-block; min-width: 44px; min-height: 44px; padding: 12px;">→</a>',
    wcag: [{ id: '2.5.8', url: 'https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum' }]
  },
  'dragging-movements': {
    text: 'Provide an alternative to dragging operations. Users must be able to complete the action with a single pointer without dragging.',
    exampleBefore: '<div draggable="true" ondrag="reorder()">Drag to reorder</div>',
    exampleAfter: '<div draggable="true" ondrag="reorder()">Drag to reorder</div>\n<button onclick="moveUp()">Move up</button>\n<button onclick="moveDown()">Move down</button>',
    wcag: [{ id: '2.5.7', url: 'https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements' }]
  },

  // ============================================
  // KEYBOARD & FOCUS
  // ============================================
  'tabindex-positive': {
    text: 'Remove positive tabindex values. Use tabindex="0" to add elements to natural tab order, or tabindex="-1" for programmatic focus only.',
    exampleBefore: '<button tabindex="5">First</button>\n<button tabindex="1">Second</button>',
    exampleAfter: '<button>First</button>\n<button>Second</button>',
    wcag: [{ id: '2.4.3', url: 'https://www.w3.org/WAI/WCAG21/Understanding/focus-order' }]
  },
  'aria-hidden-focus': {
    text: 'Elements with aria-hidden="true" must not contain focusable elements. Either remove aria-hidden or make children non-focusable.',
    exampleBefore: '<div aria-hidden="true">\n  <button>Hidden but focusable</button>\n</div>',
    exampleAfter: '<div aria-hidden="true">\n  <button tabindex="-1">Hidden and not focusable</button>\n</div>',
    wcag: [{ id: '4.1.2', url: 'https://www.w3.org/WAI/WCAG21/Understanding/name-role-value' }]
  },
  'skip-link': {
    text: 'Add a skip link as the first focusable element that jumps to main content. Essential for keyboard users to bypass repetitive navigation.',
    exampleBefore: '<body>\n  <nav><!-- Long navigation --></nav>\n  <main id="main">...</main>\n</body>',
    exampleAfter: '<body>\n  <a href="#main" class="skip-link">Skip to main content</a>\n  <nav><!-- Long navigation --></nav>\n  <main id="main">...</main>\n</body>',
    wcag: [{ id: '2.4.1', url: 'https://www.w3.org/WAI/WCAG21/Understanding/bypass-blocks' }]
  },
  'focus-appearance': {
    text: 'Ensure focus indicators have sufficient size and contrast. Focus outline should be at least 2px thick with 3:1 contrast.',
    exampleBefore: 'button:focus { outline: none; }',
    exampleAfter: 'button:focus {\n  outline: 2px solid #005fcc;\n  outline-offset: 2px;\n}',
    wcag: [{ id: '2.4.7', url: 'https://www.w3.org/WAI/WCAG21/Understanding/focus-visible' }]
  },
  'focus-not-obscured-minimum': {
    text: 'Ensure focused elements are not entirely hidden by sticky headers, footers, or modals. At least part of the focus indicator must be visible.',
    exampleBefore: '.sticky-header { position: fixed; top: 0; z-index: 100; }',
    exampleAfter: '.sticky-header { position: fixed; top: 0; z-index: 100; }\nmain { scroll-padding-top: 80px; }',
    wcag: [{ id: '2.4.11', url: 'https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum' }]
  },
  'focus-not-obscured-enhanced': {
    text: 'Ensure the entire focused element is visible when it receives focus, not obscured by any overlapping content.',
    exampleBefore: '/* No scroll padding, focused elements hidden under sticky header */',
    exampleAfter: 'html { scroll-padding-top: 100px; scroll-padding-bottom: 50px; }',
    wcag: [{ id: '2.4.12', url: 'https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-enhanced' }]
  },
  'interactive-role-focusable': {
    text: 'Elements with interactive ARIA roles must be focusable. Add tabindex="0" if using non-interactive HTML elements.',
    exampleBefore: '<span role="button" onclick="save()">Save</span>',
    exampleAfter: '<span role="button" tabindex="0" onclick="save()" onkeydown="if(event.key===\'Enter\')save()">Save</span>',
    wcag: [{ id: '4.1.2', url: 'https://www.w3.org/WAI/WCAG21/Understanding/name-role-value' }]
  },

  // ============================================
  // HEADINGS & STRUCTURE
  // ============================================
  'headings-order': {
    text: 'Fix heading level jumps. Headings should descend logically: h1 → h2 → h3. Never skip levels.',
    exampleBefore: '<h1>Page Title</h1>\n<h3>Subsection</h3>',
    exampleAfter: '<h1>Page Title</h1>\n<h2>Subsection</h2>',
    wcag: [{ id: '1.3.1', url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships' }]
  },
  'heading-h1': {
    text: 'Include exactly one <h1> element identifying the main content of the page.',
    exampleBefore: '<div class="title">Welcome</div>',
    exampleAfter: '<h1>Welcome</h1>',
    wcag: [{ id: '1.3.1', url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships' }]
  },
  'landmarks': {
    text: 'Add landmark regions, especially <main> for primary content. Use <nav>, <header>, <footer>, <aside> for other regions.',
    exampleBefore: '<div id="content">...</div>',
    exampleAfter: '<main id="content">...</main>',
    wcag: [{ id: '1.3.1', url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships' }]
  },
  'region-name': {
    text: 'Provide accessible names for landmark regions using aria-label or aria-labelledby, especially when multiple landmarks of the same type exist.',
    exampleBefore: '<nav>...</nav>\n<nav>...</nav>',
    exampleAfter: '<nav aria-label="Main navigation">...</nav>\n<nav aria-label="Footer links">...</nav>',
    wcag: [{ id: '1.3.1', url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships' }]
  },
  'list': {
    text: 'Ensure <ul> and <ol> elements only contain <li>, <script>, or <template> as direct children.',
    exampleBefore: '<ul>\n  <div>Not allowed here</div>\n  <li>Item</li>\n</ul>',
    exampleAfter: '<ul>\n  <li>Item</li>\n  <li>Another item</li>\n</ul>',
    wcag: [{ id: '1.3.1', url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships' }]
  },
  'dl-structure': {
    text: 'Ensure <dl> elements only contain <dt>, <dd>, <div>, <script>, or <template> as direct children. Pair each <dt> with at least one <dd>.',
    exampleBefore: '<dl>\n  <span>Term</span>\n</dl>',
    exampleAfter: '<dl>\n  <dt>Term</dt>\n  <dd>Definition</dd>\n</dl>',
    wcag: [{ id: '1.3.1', url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships' }]
  },

  // ============================================
  // LINKS & NAVIGATION
  // ============================================
  'link-name': {
    text: 'Provide descriptive link text that makes sense out of context. Avoid "click here" or "read more". Use aria-label for icon-only links.',
    exampleBefore: '<a href="/report.pdf">Click here</a>',
    exampleAfter: '<a href="/report.pdf">Download annual report (PDF)</a>',
    wcag: [{ id: '2.4.4', url: 'https://www.w3.org/WAI/WCAG21/Understanding/link-purpose-in-context' }]
  },
  'link-button-misuse': {
    text: 'Use <a href> for navigation to other pages. Use <button> for actions that don\'t navigate. Don\'t use <a> without href as a button.',
    exampleBefore: '<a onclick="save()">Save</a>',
    exampleAfter: '<button type="button" onclick="save()">Save</button>',
    wcag: [{ id: '4.1.2', url: 'https://www.w3.org/WAI/WCAG21/Understanding/name-role-value' }]
  },
  'consistent-help': {
    text: 'Help mechanisms (contact info, help pages, chat) must appear in the same relative order across pages.',
    exampleBefore: '<!-- Help link in header on some pages, footer on others -->',
    exampleAfter: '<!-- Help link consistently in header across all pages -->\n<header>\n  <a href="/help">Help</a>\n</header>',
    wcag: [{ id: '3.2.6', url: 'https://www.w3.org/WAI/WCAG22/Understanding/consistent-help' }]
  },

  // ============================================
  // ARIA
  // ============================================
  'aria-role-valid': {
    text: 'Use valid ARIA role values from the WAI-ARIA specification. Check for typos.',
    exampleBefore: '<div role="buton">Click</div>',
    exampleAfter: '<div role="button">Click</div>',
    wcag: [{ id: '4.1.2', url: 'https://www.w3.org/WAI/WCAG21/Understanding/name-role-value' }]
  },
  'aria-required-props': {
    text: 'Add required ARIA attributes for this role. For example: role="slider" requires aria-valuenow, aria-valuemin, aria-valuemax.',
    exampleBefore: '<div role="slider"></div>',
    exampleAfter: '<div role="slider" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100"></div>',
    wcag: [{ id: '4.1.2', url: 'https://www.w3.org/WAI/WCAG21/Understanding/name-role-value' }]
  },
  'aria-attr-valid': {
    text: 'Remove or correct invalid aria-* attributes. Check for typos in attribute names.',
    exampleBefore: '<button aria-lable="Save">💾</button>',
    exampleAfter: '<button aria-label="Save">💾</button>',
    wcag: [{ id: '4.1.2', url: 'https://www.w3.org/WAI/WCAG21/Understanding/name-role-value' }]
  },
  'aria-allowed-attr': {
    text: 'Remove ARIA attributes not permitted on this element or role. Some aria-* attributes are only valid on specific roles.',
    exampleBefore: '<input type="text" aria-pressed="false">',
    exampleAfter: '<input type="text">',
    wcag: [{ id: '4.1.2', url: 'https://www.w3.org/WAI/WCAG21/Understanding/name-role-value' }]
  },
  'aria-allowed-role': {
    text: 'This role is not permitted on this HTML element. Use a different element or remove the role.',
    exampleBefore: '<input type="text" role="button">',
    exampleAfter: '<input type="text">\n<!-- Or use: <button>Click</button> -->',
    wcag: [{ id: '4.1.2', url: 'https://www.w3.org/WAI/WCAG21/Understanding/name-role-value' }]
  },
  'aria-presentation-misuse': {
    text: 'Don\'t use role="presentation" or role="none" on interactive or focusable elements. This removes semantics needed for accessibility.',
    exampleBefore: '<button role="presentation">Save</button>',
    exampleAfter: '<button>Save</button>',
    wcag: [{ id: '4.1.2', url: 'https://www.w3.org/WAI/WCAG21/Understanding/name-role-value' }]
  },
  'aria-required-children': {
    text: 'Add required child elements/roles. For example: role="list" requires children with role="listitem".',
    exampleBefore: '<div role="list">\n  <div>Item</div>\n</div>',
    exampleAfter: '<div role="list">\n  <div role="listitem">Item</div>\n</div>',
    wcag: [{ id: '1.3.1', url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships' }]
  },
  'aria-required-parent': {
    text: 'This element must be contained within a specific parent role. For example: role="listitem" must be inside role="list".',
    exampleBefore: '<div role="listitem">Orphan item</div>',
    exampleAfter: '<div role="list">\n  <div role="listitem">Item in list</div>\n</div>',
    wcag: [{ id: '1.3.1', url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships' }]
  },

  // ============================================
  // TABLES
  // ============================================
  'table-caption': {
    text: 'Add a <caption> element as the first child of the <table> to describe the table\'s purpose.',
    exampleBefore: '<table>\n  <tr><th>Name</th><th>Price</th></tr>\n</table>',
    exampleAfter: '<table>\n  <caption>Product pricing</caption>\n  <tr><th>Name</th><th>Price</th></tr>\n</table>',
    wcag: [{ id: '1.3.1', url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships' }]
  },
  'table-headers-association': {
    text: 'Associate data cells with headers using <th> elements with proper scope, or id/headers attributes for complex tables.',
    exampleBefore: '<table>\n  <tr><td>Name</td><td>Price</td></tr>\n  <tr><td>Widget</td><td>£10</td></tr>\n</table>',
    exampleAfter: '<table>\n  <tr><th scope="col">Name</th><th scope="col">Price</th></tr>\n  <tr><td>Widget</td><td>£10</td></tr>\n</table>',
    wcag: [{ id: '1.3.1', url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships' }]
  },

  // ============================================
  // MEDIA
  // ============================================
  'media-captions': {
    text: 'Provide synchronised captions for video content using <track kind="captions">. Captions should include dialogue and relevant sound effects.',
    exampleBefore: '<video src="presentation.mp4" controls></video>',
    exampleAfter: '<video src="presentation.mp4" controls>\n  <track kind="captions" src="captions.vtt" srclang="en" label="English" default>\n</video>',
    wcag: [{ id: '1.2.2', url: 'https://www.w3.org/WAI/WCAG21/Understanding/captions-prerecorded' }]
  },
  'audio-transcript': {
    text: 'Provide a text transcript for audio-only content, including speaker identification and all spoken content.',
    exampleBefore: '<audio src="podcast.mp3" controls></audio>',
    exampleAfter: '<audio src="podcast.mp3" controls></audio>\n<a href="podcast-transcript.html">Read transcript</a>',
    wcag: [{ id: '1.2.1', url: 'https://www.w3.org/WAI/WCAG21/Understanding/audio-only-and-video-only-prerecorded' }]
  },

  // ============================================
  // DOCUMENT
  // ============================================
  'html-lang': {
    text: 'Set the lang attribute on the <html> element using the correct BCP 47 language tag.',
    exampleBefore: '<html>',
    exampleAfter: '<html lang="en">',
    wcag: [{ id: '3.1.1', url: 'https://www.w3.org/WAI/WCAG21/Understanding/language-of-page' }]
  },
  'document-title': {
    text: 'Provide a unique, descriptive <title> that identifies the page content and site. Format: "Page Name - Site Name".',
    exampleBefore: '<title>Untitled</title>',
    exampleAfter: '<title>Contact Us - Acme Corporation</title>',
    wcag: [{ id: '2.4.2', url: 'https://www.w3.org/WAI/WCAG21/Understanding/page-titled' }]
  },
  'meta-viewport': {
    text: 'Add a viewport meta tag for responsive design and ensure user-scalable is not disabled.',
    exampleBefore: '<!-- No viewport meta tag -->',
    exampleAfter: '<meta name="viewport" content="width=device-width, initial-scale=1">',
    wcag: [
      { id: '1.4.4', url: 'https://www.w3.org/WAI/WCAG21/Understanding/resize-text' },
      { id: '1.4.10', url: 'https://www.w3.org/WAI/WCAG21/Understanding/reflow' }
    ]
  },
  'iframe-title': {
    text: 'Add a descriptive title attribute to all <iframe> elements explaining their content or purpose.',
    exampleBefore: '<iframe src="https://maps.google.com/..."></iframe>',
    exampleAfter: '<iframe src="https://maps.google.com/..." title="Google Maps - Office location"></iframe>',
    wcag: [{ id: '4.1.2', url: 'https://www.w3.org/WAI/WCAG21/Understanding/name-role-value' }]
  },
  'duplicate-ids': {
    text: 'Remove or rename duplicate id attributes. Each id must be unique within the document.',
    exampleBefore: '<div id="header">...</div>\n<div id="header">...</div>',
    exampleAfter: '<div id="main-header">...</div>\n<div id="section-header">...</div>',
    wcag: [{ id: '4.1.1', url: 'https://www.w3.org/WAI/WCAG21/Understanding/parsing' }]
  },

  // ============================================
  // AUTHENTICATION (WCAG 2.2)
  // ============================================
  'accessible-authentication-minimum': {
    text: 'Don\'t require cognitive function tests (puzzles, memory) for authentication. Allow copy-paste for passwords and support password managers.',
    exampleBefore: '<input type="password" oncopy="return false" onpaste="return false">',
    exampleAfter: '<input type="password" autocomplete="current-password">',
    wcag: [{ id: '3.3.8', url: 'https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum' }]
  },
  'accessible-authentication-enhanced': {
    text: 'Authentication must not require any cognitive test. Provide alternatives like email links, OAuth, or biometrics.',
    exampleBefore: '<!-- CAPTCHA with no alternative -->',
    exampleAfter: '<!-- Provide alternatives -->\n<button>Sign in with Google</button>\n<button>Email me a login link</button>',
    wcag: [{ id: '3.3.9', url: 'https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-enhanced' }]
  },
  'redundant-entry': {
    text: 'Don\'t ask users to re-enter information they\'ve already provided in the same session unless essential for security.',
    exampleBefore: '<!-- Shipping form -->\n<input name="address">\n<!-- Billing form asks for same address again -->',
    exampleAfter: '<!-- Shipping form -->\n<input name="shipping-address">\n<!-- Billing form -->\n<label><input type="checkbox" checked> Same as shipping address</label>',
    wcag: [{ id: '3.3.7', url: 'https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry' }]
  }
};

/**
 * Default guidance for unmapped rules
 */
const DEFAULT_GUIDANCE = {
  text: 'Review this element and ensure it meets WCAG requirements.',
  exampleBefore: null,
  exampleAfter: null,
  wcag: []
};

/**
 * Get structured guidance data for a rule.
 * Returns object with text, exampleBefore, exampleAfter, wcag.
 * @param {string} ruleId - The rule identifier
 * @returns {Object} Structured guidance object
 */
function getGuidanceData(ruleId) {
  return GUIDANCE_DATABASE[ruleId] || DEFAULT_GUIDANCE;
}

/**
 * Get guidance text only (for backwards compatibility and DevTools panel).
 * @param {string} ruleId - The rule identifier
 * @param {Object} f - The finding object (unused, kept for compatibility)
 * @returns {string} Guidance text
 */
function guidanceForRule(ruleId, f) {
  const data = getGuidanceData(ruleId);
  return data.text;
}

/**
 * Render guidance as HTML for DevTools panel display.
 * Shows text, and optionally before/after examples.
 * @param {string} ruleId - The rule identifier
 * @param {boolean} showExamples - Whether to include code examples
 * @returns {string} HTML string
 */
function renderGuidanceHtml(ruleId, showExamples = false) {
  const data = getGuidanceData(ruleId);
  let html = `<div class="guidance-text">${escapeHtml(data.text)}</div>`;
  
  if (showExamples && data.exampleBefore && data.exampleAfter) {
    html += `
      <div class="guidance-examples" style="margin-top: 8px; font-size: 12px;">
        <div style="margin-bottom: 4px; color: var(--color-text-secondary, #888);">Example fix:</div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <div style="flex: 1; min-width: 200px;">
            <div style="color: #e57373; font-size: 11px; margin-bottom: 2px;">✗ Before</div>
            <pre style="margin: 0; padding: 6px; background: var(--color-bg-input, #2a2a2a); border-radius: 4px; overflow-x: auto; font-size: 11px; border-left: 3px solid #e57373;">${escapeHtml(data.exampleBefore)}</pre>
          </div>
          <div style="flex: 1; min-width: 200px;">
            <div style="color: #81c784; font-size: 11px; margin-bottom: 2px;">✓ After</div>
            <pre style="margin: 0; padding: 6px; background: var(--color-bg-input, #2a2a2a); border-radius: 4px; overflow-x: auto; font-size: 11px; border-left: 3px solid #81c784;">${escapeHtml(data.exampleAfter)}</pre>
          </div>
        </div>
      </div>`;
  }
  
  if (data.wcag && data.wcag.length > 0) {
    const wcagLinks = data.wcag.map(w => 
      `<a href="${w.url}" target="_blank" rel="noopener" class="pill" style="font-size: 11px;">${w.id}</a>`
    ).join(' ');
    html += `<div class="guidance-wcag" style="margin-top: 6px;">WCAG: ${wcagLinks}</div>`;
  }
  
  return html;
}

// ============================================
// EXPORT UTILITIES
// Shared functions for JSON, HTML, CSV, SARIF exports
// ============================================

/**
 * Rule category mappings for grouping findings
 */
const RULE_CATEGORIES = {
  // Images
  'img-alt': 'Images',
  
  // Forms & Labels
  'label-control': 'Forms',
  'fieldset-legend': 'Forms',
  'autocomplete': 'Forms',
  'button-name': 'Forms',
  'control-name': 'Forms',
  
  // Colour & Contrast
  'contrast-text': 'Contrast',
  'link-in-text-block': 'Contrast',
  
  // Target Size
  'target-size': 'Target Size',
  'dragging-movements': 'Target Size',
  
  // Keyboard & Focus
  'tabindex-positive': 'Keyboard & Focus',
  'aria-hidden-focus': 'Keyboard & Focus',
  'skip-link': 'Keyboard & Focus',
  'focus-appearance': 'Keyboard & Focus',
  'focus-not-obscured-minimum': 'Keyboard & Focus',
  'focus-not-obscured-enhanced': 'Keyboard & Focus',
  'interactive-role-focusable': 'Keyboard & Focus',
  
  // Headings & Structure
  'headings-order': 'Structure',
  'heading-h1': 'Structure',
  'landmarks': 'Structure',
  'region-name': 'Structure',
  'list': 'Structure',
  'dl-structure': 'Structure',
  
  // Links & Navigation
  'link-name': 'Links',
  'link-button-misuse': 'Links',
  'consistent-help': 'Links',
  
  // ARIA
  'aria-role-valid': 'ARIA',
  'aria-required-props': 'ARIA',
  'aria-attr-valid': 'ARIA',
  'aria-allowed-attr': 'ARIA',
  'aria-allowed-role': 'ARIA',
  'aria-presentation-misuse': 'ARIA',
  'aria-required-children': 'ARIA',
  'aria-required-parent': 'ARIA',
  
  // Tables
  'table-caption': 'Tables',
  'table-headers-association': 'Tables',
  
  // Media
  'media-captions': 'Media',
  'audio-transcript': 'Media',
  
  // Document
  'html-lang': 'Document',
  'document-title': 'Document',
  'meta-viewport': 'Document',
  'iframe-title': 'Document',
  'duplicate-ids': 'Document',
  
  // Authentication (WCAG 2.2)
  'accessible-authentication-minimum': 'Authentication',
  'accessible-authentication-enhanced': 'Authentication',
  'redundant-entry': 'Authentication'
};

/**
 * Category display order for consistent presentation
 */
const CATEGORY_ORDER = [
  'Images', 'Forms', 'Contrast', 'Target Size', 'Keyboard & Focus',
  'Structure', 'Links', 'ARIA', 'Tables', 'Media', 'Document', 'Authentication', 'Other'
];

/**
 * Get the category for a rule ID
 * @param {string} ruleId - The rule identifier
 * @returns {string} Category name
 */
function getRuleCategory(ruleId) {
  return RULE_CATEGORIES[ruleId] || 'Other';
}

/**
 * Group findings by category
 * @param {Array} findings - Array of finding objects
 * @returns {Object} Findings grouped by category, in display order
 */
function groupFindingsByCategory(findings) {
  const groups = {};
  
  // Initialize all categories to maintain order
  CATEGORY_ORDER.forEach(cat => { groups[cat] = []; });
  
  // Group findings
  findings.forEach(f => {
    const category = getRuleCategory(f.ruleId);
    if (!groups[category]) groups[category] = [];
    groups[category].push(f);
  });
  
  // Remove empty categories
  Object.keys(groups).forEach(cat => {
    if (groups[cat].length === 0) delete groups[cat];
  });
  
  return groups;
}

/**
 * Truncate code snippet for display
 * @param {string} code - The code to truncate
 * @param {number} maxLength - Maximum length (default 500)
 * @returns {string} Truncated code with ellipsis if needed
 */
function truncateCode(code, maxLength = 500) {
  if (!code || typeof code !== 'string') return '';
  if (code.length <= maxLength) return code;
  return code.substring(0, maxLength) + '…';
}

/**
 * Format WCAG criteria array for display
 * @param {Array} wcag - Array of WCAG criterion IDs
 * @returns {string} Formatted string like "1.1.1, 1.4.3"
 */
function formatWcagCriteria(wcag) {
  if (!wcag || !Array.isArray(wcag)) return '';
  return wcag.join(', ');
}

/**
 * Get priority level from score
 * @param {number} score - Priority score (0-100)
 * @returns {string} Priority level
 */
function getPriorityLevel(score) {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 40) return 'medium';
  if (score >= 20) return 'low';
  return 'minimal';
}

/**
 * Get impact badge colour class
 * @param {string} impact - Impact level
 * @returns {string} CSS class for badge colour
 */
function getImpactColour(impact) {
  const colours = {
    critical: '#dc2626',
    serious: '#ea580c',
    moderate: '#ca8a04',
    minor: '#65a30d'
  };
  return colours[impact] || '#6b7280';
}

/**
 * Generate export metadata
 * @returns {Object} Standard metadata for exports
 */
function getExportMetadata() {
  return {
    exportedAt: new Date().toISOString(),
    url: inspectedUrl || 'unknown',
    tool: 'AccessInsight Chrome Extension',
    version: '1.2.0',
    preset: presetSel?.value || 'default',
    totalFindings: findings.length,
    scanOptions: {
      intelligentPriority: scanOptions.intelligentPriority,
      live: scanOptions.live,
      viewportOnly: scanOptions.viewportOnly,
      shadow: scanOptions.shadow,
      iframes: scanOptions.iframes
    }
  };
}

/**
 * Generate timestamped filename for exports
 * @param {string} baseName - Base filename (e.g., 'a11y-report')
 * @param {string} extension - File extension (e.g., 'html', 'csv')
 * @returns {string} Filename with timestamp
 */
function generateExportFilename(baseName, extension) {
  const date = new Date();
  const timestamp = date.toISOString().slice(0, 10); // YYYY-MM-DD
  const time = date.toTimeString().slice(0, 5).replace(':', ''); // HHMM
  return `${baseName}-${timestamp}-${time}.${extension}`;
}

/**
 * Calculate summary statistics for findings
 * @param {Array} findings - Array of finding objects
 * @returns {Object} Summary statistics
 */
function calculateSummaryStats(findings) {
  const byImpact = { critical: 0, serious: 0, moderate: 0, minor: 0 };
  const byCategory = {};
  const byPriority = { critical: 0, high: 0, medium: 0, low: 0, minimal: 0 };
  
  findings.forEach(f => {
    // By impact
    if (byImpact.hasOwnProperty(f.impact)) {
      byImpact[f.impact]++;
    }
    
    // By category
    const cat = getRuleCategory(f.ruleId);
    byCategory[cat] = (byCategory[cat] || 0) + 1;
    
    // By priority (if intelligent priority enabled)
    if (f.priorityScore !== undefined) {
      const level = getPriorityLevel(f.priorityScore);
      byPriority[level]++;
    }
  });
  
  return {
    total: findings.length,
    byImpact,
    byCategory,
    byPriority,
    topCategories: Object.entries(byCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }))
  };
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
      url: inspectedUrl || 'unknown',
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

  // Use fallback clipboard method that works in DevTools context
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();

  try {
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);

    if (success) {
      // Show toast notification
      ToastManager.show('Copied to clipboard', 'success', 2000);

      // Brief button success state
      const btn = document.querySelector('#btn-copy-json');
      if (btn) {
        btn.classList.add('btn-success');
        setTimeout(() => {
          btn.classList.remove('btn-success');
        }, 1000);
      }
    }
  } catch (err) {
    document.body.removeChild(textarea);
    console.error('Copy failed:', err);
  }
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
  ToastManager.show('SARIF export complete', 'success', 2000);
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

/**
 * Generate professional HTML accessibility report
 * Features: Executive summary, category navigation, card-based issues,
 * code snippets, fix guidance with before/after examples
 */
function downloadHtmlReport() {
  ToastManager.show('Generating HTML report...', 'info', 1000);
  const items = getFilteredFindings();
  const grouped = groupFindingsByCategory(items);
  const pageUrl = inspectedUrl || 'Unknown URL';
  const timestamp = new Date().toLocaleString('en-GB', { 
    dateStyle: 'full', timeStyle: 'short', timeZone: 'Europe/London' 
  });
  
  // Calculate priority breakdown
  // Uses priorityLabel (e.g., "Critical Priority") when available, falls back to impact
  const priorityBreakdown = { critical: 0, high: 0, medium: 0, low: 0 };
  items.forEach(f => {
    const label = (f.priorityLabel || '').toLowerCase();
    const impact = (f.impact || '').toLowerCase();
    
    if (label.includes('critical') || impact === 'critical' || impact === 'serious') {
      priorityBreakdown.critical++;
    } else if (label.includes('high') || impact === 'moderate') {
      priorityBreakdown.high++;
    } else if (label.includes('medium') || impact === 'minor') {
      priorityBreakdown.medium++;
    } else {
      priorityBreakdown.low++;
    }
  });

  // Generate category navigation
  const categoryNav = Object.keys(grouped).map(cat => {
    const count = grouped[cat].length;
    const id = cat.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return `<a href="#cat-${id}" class="nav-pill">${escapeHtml(cat)} <span class="count">${count}</span></a>`;
  }).join('');

  // Generate issue cards grouped by category
  const categoryBlocks = Object.entries(grouped).map(([category, findings]) => {
    const catId = category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const issueCards = findings.map((f, idx) => {
      const guidance = getGuidanceData(f.ruleId);
      const wcagList = (f.wcag || []).join(', ') || 'N/A';
      const impactClass = f.impact || 'medium';
      const codeSnippet = f.evidence?.html ? truncateCode(f.evidence.html, 500) : '';
      
      // Build fix guidance section
      let fixSection = `<div class="fix-text">${escapeHtml(guidance.text)}</div>`;
      if (guidance.exampleBefore && guidance.exampleAfter) {
        fixSection += `
          <div class="code-examples">
            <div class="example bad">
              <div class="example-label">✗ Before</div>
              <pre><code>${escapeHtml(guidance.exampleBefore)}</code></pre>
            </div>
            <div class="example good">
              <div class="example-label">✓ After</div>
              <pre><code>${escapeHtml(guidance.exampleAfter)}</code></pre>
            </div>
          </div>`;
      }
      
      // WCAG links
      const wcagLinks = (guidance.wcag || []).map(w => 
        `<a href="${w.url}" target="_blank" rel="noopener" class="wcag-link">${w.id}</a>`
      ).join(' ');

      return `
        <article class="issue-card impact-${impactClass}">
          <header class="issue-header">
            <div class="issue-title">
              <span class="impact-badge ${impactClass}">${escapeHtml(impactClass)}</span>
              <h3>${escapeHtml(f.ruleId)}</h3>
            </div>
            <div class="wcag-badges">${wcagLinks || `<span class="wcag-ref">${escapeHtml(wcagList)}</span>`}</div>
          </header>
          <p class="issue-message">${escapeHtml(f.message)}</p>
          ${codeSnippet ? `
            <details class="evidence-section">
              <summary>View Element Code</summary>
              <pre class="code-block"><code>${escapeHtml(codeSnippet)}</code></pre>
            </details>` : ''}
          <div class="selector-info">
            <strong>Selector:</strong> <code>${escapeHtml(f.selector)}</code>
          </div>
          <section class="fix-guidance">
            <h4>How to Fix</h4>
            ${fixSection}
          </section>
        </article>`;
    }).join('');

    return `
      <section class="category-section" id="cat-${catId}">
        <h2 class="category-heading">${escapeHtml(category)} <span class="category-count">(${findings.length} issue${findings.length !== 1 ? 's' : ''})</span></h2>
        ${issueCards}
      </section>`;
  }).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Accessibility Report - ${escapeHtml(pageUrl)}</title>
  <style>
    :root {
      --color-critical: #dc2626;
      --color-serious: #dc2626;
      --color-high: #ea580c;
      --color-moderate: #ea580c;
      --color-medium: #ca8a04;
      --color-minor: #ca8a04;
      --color-low: #16a34a;
      --color-bg: #ffffff;
      --color-surface: #f8fafc;
      --color-border: #e2e8f0;
      --color-text: #1e293b;
      --color-text-secondary: #64748b;
    }
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 16px;
      line-height: 1.6;
      color: var(--color-text);
      background: var(--color-bg);
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
    }
    
    /* Header */
    .report-header {
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 2px solid var(--color-border);
    }
    .report-header h1 { font-size: 1.75rem; margin-bottom: 8px; }
    .report-meta { color: var(--color-text-secondary); font-size: 0.875rem; }
    .report-meta a { color: inherit; }
    
    /* Executive Summary */
    .summary-section {
      background: var(--color-surface);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 32px;
    }
    .summary-section h2 { font-size: 1.25rem; margin-bottom: 16px; }
    .summary-stats {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }
    .stat-card {
      flex: 1;
      min-width: 120px;
      background: var(--color-bg);
      border-radius: 8px;
      padding: 16px;
      text-align: center;
      border-left: 4px solid var(--color-border);
    }
    .stat-card.critical { border-left-color: var(--color-critical); }
    .stat-card.high { border-left-color: var(--color-high); }
    .stat-card.medium { border-left-color: var(--color-medium); }
    .stat-card.low { border-left-color: var(--color-low); }
    .stat-number { font-size: 2rem; font-weight: 700; }
    .stat-label { font-size: 0.75rem; text-transform: uppercase; color: var(--color-text-secondary); }
    
    /* Category Navigation */
    .category-nav {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 32px;
      padding: 16px;
      background: var(--color-surface);
      border-radius: 8px;
    }
    .nav-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      background: var(--color-bg);
      border: 1px solid var(--color-border);
      border-radius: 20px;
      text-decoration: none;
      color: var(--color-text);
      font-size: 0.875rem;
      transition: all 0.2s;
    }
    .nav-pill:hover { background: var(--color-text); color: var(--color-bg); }
    .nav-pill .count {
      background: var(--color-border);
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 0.75rem;
    }
    
    /* Category Sections */
    .category-section { margin-bottom: 40px; }
    .category-heading {
      font-size: 1.25rem;
      padding-bottom: 12px;
      margin-bottom: 16px;
      border-bottom: 1px solid var(--color-border);
    }
    .category-count { font-weight: 400; color: var(--color-text-secondary); }
    
    /* Issue Cards */
    .issue-card {
      background: var(--color-bg);
      border: 1px solid var(--color-border);
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 16px;
      border-left: 4px solid var(--color-border);
    }
    .issue-card.impact-critical, .issue-card.impact-serious { border-left-color: var(--color-critical); }
    .issue-card.impact-high, .issue-card.impact-moderate { border-left-color: var(--color-high); }
    .issue-card.impact-medium, .issue-card.impact-minor { border-left-color: var(--color-medium); }
    .issue-card.impact-low { border-left-color: var(--color-low); }
    
    .issue-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 12px;
    }
    .issue-title { display: flex; align-items: center; gap: 10px; }
    .issue-title h3 { font-size: 1rem; font-weight: 600; }
    
    .impact-badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 4px;
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      color: white;
    }
    .impact-badge.critical, .impact-badge.serious { background: var(--color-critical); }
    .impact-badge.high, .impact-badge.moderate { background: var(--color-high); }
    .impact-badge.medium, .impact-badge.minor { background: var(--color-medium); }
    .impact-badge.low { background: var(--color-low); }
    
    .wcag-badges { display: flex; gap: 6px; flex-wrap: wrap; }
    .wcag-link, .wcag-ref {
      font-size: 0.75rem;
      padding: 3px 8px;
      background: #e0e7ff;
      color: #3730a3;
      border-radius: 4px;
      text-decoration: none;
    }
    .wcag-link:hover { background: #c7d2fe; }
    
    .issue-message { margin-bottom: 12px; color: var(--color-text-secondary); }
    
    .selector-info {
      font-size: 0.875rem;
      margin-bottom: 12px;
      padding: 8px 12px;
      background: var(--color-surface);
      border-radius: 4px;
    }
    .selector-info code {
      font-family: 'SF Mono', Consolas, monospace;
      font-size: 0.8rem;
      word-break: break-all;
    }
    
    /* Evidence/Code */
    .evidence-section { margin-bottom: 12px; }
    .evidence-section summary {
      cursor: pointer;
      font-weight: 500;
      font-size: 0.875rem;
      padding: 8px 0;
    }
    .code-block {
      background: #1e293b;
      color: #e2e8f0;
      padding: 12px 16px;
      border-radius: 6px;
      overflow-x: auto;
      font-size: 0.8rem;
      font-family: 'SF Mono', Consolas, monospace;
      margin-top: 8px;
    }
    .code-block code { background: none; padding: 0; }
    
    /* Fix Guidance */
    .fix-guidance {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 6px;
      padding: 16px;
      margin-top: 12px;
    }
    .fix-guidance h4 {
      font-size: 0.875rem;
      color: #166534;
      margin-bottom: 8px;
    }
    .fix-text { margin-bottom: 12px; font-size: 0.9rem; }
    
    .code-examples { display: flex; gap: 12px; flex-wrap: wrap; }
    .example {
      flex: 1;
      min-width: 250px;
      border-radius: 6px;
      overflow: hidden;
    }
    .example-label {
      padding: 6px 12px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .example.bad .example-label { background: #fecaca; color: #991b1b; }
    .example.good .example-label { background: #bbf7d0; color: #166534; }
    .example pre {
      margin: 0;
      padding: 12px;
      background: #1e293b;
      color: #e2e8f0;
      font-size: 0.75rem;
      overflow-x: auto;
    }
    .example pre code { background: none; }
    
    /* Print Styles */
    @media print {
      body { padding: 0; font-size: 11pt; }
      .category-nav { display: none; }
      .issue-card { break-inside: avoid; page-break-inside: avoid; }
      .evidence-section { display: block; }
      .evidence-section[open] summary { display: none; }
      a { color: inherit; text-decoration: none; }
      .wcag-link::after { content: ' (' attr(href) ')'; font-size: 0.6rem; }
    }
  </style>
</head>
<body>
  <header class="report-header">
    <h1>Accessibility Report</h1>
    <p class="report-meta">
      <strong>URL:</strong> <a href="${escapeHtml(pageUrl)}">${escapeHtml(pageUrl)}</a><br>
      <strong>Generated:</strong> ${timestamp}<br>
      <strong>Total Issues:</strong> ${items.length}
    </p>
  </header>

  <section class="summary-section">
    <h2>Executive Summary</h2>
    <div class="summary-stats">
      <div class="stat-card critical">
        <div class="stat-number">${priorityBreakdown.critical}</div>
        <div class="stat-label">Critical</div>
      </div>
      <div class="stat-card high">
        <div class="stat-number">${priorityBreakdown.high}</div>
        <div class="stat-label">High</div>
      </div>
      <div class="stat-card medium">
        <div class="stat-number">${priorityBreakdown.medium}</div>
        <div class="stat-label">Medium</div>
      </div>
      <div class="stat-card low">
        <div class="stat-number">${priorityBreakdown.low}</div>
        <div class="stat-label">Low</div>
      </div>
    </div>
  </section>

  <nav class="category-nav" aria-label="Jump to category">
    ${categoryNav}
  </nav>

  <main>
    ${categoryBlocks}
  </main>

  <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid var(--color-border); color: var(--color-text-secondary); font-size: 0.875rem;">
    <p>Report generated by AccessInsight browser extension.</p>
  </footer>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const filename = generateExportFilename('a11y-report', 'html');
  const a = document.createElement('a'); 
  a.href = url; 
  a.download = filename; 
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  ToastManager.show('HTML report downloaded', 'success', 2000);
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
  ToastManager.show('CSV export complete', 'success', 2000);
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

// Initialize Phase 3 UI enhancements
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    CollapsibleManager.init();
    TruncationManager.init();
  });
} else {
  CollapsibleManager.init();
  TruncationManager.init();
}
