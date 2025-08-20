// devtools.js — Phase 2 DevTools panel
const DEBUG = false;
const tabId = chrome.devtools.inspectedWindow.tabId;
const port = chrome.runtime.connect({ name: `devtools-${tabId}` });
if (DEBUG) try { console.debug('[A11y][DT] Connected to background for tab', tabId); } catch {}

const $ = (sel) => document.querySelector(sel);
const listEl = $('#list');
const sumEl = $('#summary');
const filterRule = $('#filter-rule');
const rulesWrap = $('#rules');
const statusEl = $('#status');
const filterImpact = document.querySelector('#filter-impact');
const minConf = document.querySelector('#min-conf');
const confVal = document.querySelector('#conf-val');
const detailsEl = document.querySelector('#details');
const optLive = document.querySelector('#opt-live');
const optViewport = document.querySelector('#opt-viewport');
const optShadow = document.querySelector('#opt-shadow');
const optIframes = document.querySelector('#opt-iframes');
const optHideNR = document.querySelector('#opt-hide-nr');
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
let scanOptions = { live: false, viewportOnly: true, shadow: false, iframes: false, hideNeedsReview: false };
let preset = 'default';
let rescanTimer = 0;
let presetsLoaded = false;
let autoAppliedPresetOnce = false;

function requestFindings() { port.postMessage({ type: 'request-findings' }); }
function toggleOverlay() { port.postMessage({ type: 'toggle-panel' }); }
function rescan() {
  const btn = $('#btn-rescan');
  if (btn) { btn.disabled = true; btn.textContent = 'Rescanning…'; }
  port.postMessage({ type: 'rescan-now' });
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
  filterRule.innerHTML = '<option value="">All rules</option>' + allRuleIds.map(id => `<option value="${id}">${id}</option>`).join('');
}

function persistRuleConfig() {
  const enabled = Array.from(rulesWrap.querySelectorAll('input[type="checkbox"]')).filter(cb => cb.checked).map(cb => cb.dataset.id);
  enabledRules = enabled;
  port.postMessage({ type: 'set-enabled-rules', enabledRules: enabled });
  // If current selection deviates from active preset, mark as custom
  try {
    const active = getActivePresetConfig();
    if (!active || !arraysEqualUnordered(enabledRules, active.enabledRuleIds || [])) {
      ensureCustomPresetOption();
      presetSel.value = 'custom';
      persistSelectedPreset('custom');
      const btnReset = document.querySelector('#btn-reset-preset');
      if (btnReset) btnReset.style.display = '';
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
    port.postMessage({ type: 'set-enabled-rules', enabledRules });
    try {
      if (filterRule) filterRule.value = '';
      if (filterImpact) filterImpact.value = '';
      if (minConf) { const v = String(sets[name].minConfidence ?? 0); minConf.value = v; if (confVal) confVal.textContent = (parseFloat(v)||0).toFixed(2); }
      if (optLive) { optLive.checked = false; }
      if (optViewport) { optViewport.checked = false; }
      scanOptions.live = false; scanOptions.viewportOnly = false; persistScanOptions();
      port.postMessage({ type: 'set-engine-profile', profile: name === 'axe' ? 'axe' : 'default', hideNeedsReview: name === 'axe' });
    } catch {}
    port.postMessage({ type: 'rescan-now' });
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
  port.postMessage({ type: 'apply-config', enabledRules, profile: (cfg.engineProfile||'default'), hideNeedsReview: !!cfg.hideNeedsReview, live: !!cfg.live, viewportOnly: !!cfg.viewportOnly });
  try {
    if (filterRule) filterRule.value = '';
    if (filterImpact) filterImpact.value = '';
    if (minConf) { const v = String(cfg.minConfidence ?? 0); minConf.value = v; if (confVal) confVal.textContent = (parseFloat(v)||0).toFixed(2); }
    if (optLive) { optLive.checked = !!cfg.live; }
    if (optViewport) { optViewport.checked = !!cfg.viewportOnly; }
    scanOptions.live = !!cfg.live; scanOptions.viewportOnly = !!cfg.viewportOnly; persistScanOptions();
  } catch {}
  port.postMessage({ type: 'rescan-now' });
  persistSelectedPreset(name);
  const btnReset = document.querySelector('#btn-reset-preset');
  if (btnReset) btnReset.style.display = 'none';
}

function revealInElements(selector) {
  const code = `(() => { const el = document.querySelector(${JSON.stringify(selector)}); if (el) inspect(el); return !!el; })();`;
  chrome.devtools.inspectedWindow.eval(code, (result, exc) => { if (exc) console.warn('inspect() error', exc); });
}

function render() {
  const filter = filterRule.value;
  const byImpact = filterImpact ? filterImpact.value : '';
  const confThresh = minConf ? (parseFloat(minConf.value||'0') || 0) : 0;
  const items = findings
    .filter(f => !filter || f.ruleId === filter)
    .filter(f => !byImpact || String(f.impact||'').toLowerCase() === byImpact)
    .filter(f => (typeof f.confidence !== 'number') ? (confThresh === 0) : f.confidence >= confThresh)
    .filter(f => !ignores.rules.has(f.ruleId) && !ignores.selectors.has(f.selector));
  sumEl.innerHTML = `<strong>${items.length}</strong> issues ${filter?`for <span class="pill">${filter}</span>`:''}`;
  listEl.innerHTML = '';
  // Show active preset in summary
  const activePresetName = presetSel?.value || preset;
  const presetLabel = activePresetName ? ` • Preset: ${activePresetName}` : '';
  sumEl.innerHTML = `<strong>${items.length}</strong> issues${presetLabel} ${filter?`for <span class="pill">${filter}</span>`:''}`;
  items.forEach((f) => {
    const div = document.createElement('div'); div.className = 'item';
    div.innerHTML = `
      <div><strong>${f.ruleId}</strong> <span class="pill">${f.impact||''}</span></div>
      <div class="meta">${(f.wcag||[]).join(', ')} • ${f.selector}</div>
      <div class="kvs">${f.message}
${f.evidence ? JSON.stringify(f.evidence, null, 2) : ''}</div>
      <div class="row">
        <button data-act="reveal">Reveal in Elements</button>
        <a href="#" data-act="wcag" class="pill">Open WCAG</a>
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
    div.querySelector('[data-act="ignore-this"]').addEventListener('click', () => { ignores.selectors.add(f.selector); persistIgnores(); render(); });
    div.querySelector('[data-act="ignore-rule"]').addEventListener('click', () => { ignores.rules.add(f.ruleId); persistIgnores(); render(); });
    div.addEventListener('click', () => renderDetails(f));
    listEl.appendChild(div);
  });
}

function renderDetails(f) {
  if (!detailsEl || !f) return;
  const wcag = (f.wcag||[]).join(', ');
  const evidence = f.evidence ? `<pre>${JSON.stringify(f.evidence, null, 2)}</pre>` : '';
  const severity = f.impact || '';
  const how = guidanceForRule(f.ruleId, f);
  detailsEl.innerHTML = `
    <div><strong>${f.ruleId}</strong> <span class="pill">${severity}</span></div>
    <div style="margin:6px 0">${f.message}</div>
    <div class="meta">WCAG: ${wcag}</div>
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
    port.postMessage({ type: 'set-ignores', selectors: payload.selectors, rules: payload.rules });
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
  const filter = filterRule.value;
  const items = findings.filter(f => !filter || f.ruleId === filter);
  const text = JSON.stringify(items, null, 2);
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
      "results": findings.map(f => ({
        "ruleId": f.ruleId,
        "level": (f.impact === 'critical' || f.impact === 'serious') ? "error" : "warning",
        "message": { "text": f.message },
        "locations": [{ "physicalLocation": { "artifactLocation": { "uri": location.href }, "region": { "snippet": { "text": f.selector } } } }]
      }))
    }]
  };
}

function downloadSarif() {
  const filter = filterRule.value;
  const items = findings.filter(f => !filter || f.ruleId === filter);
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
document.querySelector('#btn-clear-results-dev')?.addEventListener('click', () => { findings = []; render(); sumEl.innerHTML = '<strong>0</strong> issues'; port.postMessage({ type: 'clear-results' }); });
document.querySelector('#btn-clear-ignores')?.addEventListener('click', () => { ignores = { selectors: new Set(), rules: new Set() }; persistIgnores(); render(); if (detailsEl) detailsEl.textContent = 'Ignores cleared.'; });
filterRule.addEventListener('change', render);
filterImpact?.addEventListener('change', render);
minConf?.addEventListener('input', () => { if (confVal) confVal.textContent = (parseFloat(minConf.value||'0')||0).toFixed(2); render(); });
presetSel?.addEventListener('change', () => { applyPreset(presetSel.value); render(); });
document.querySelector('#btn-reset-preset')?.addEventListener('click', () => {
  const name = presetSel?.value || 'default';
  if (name) { applyPreset(name); render(); }
});

port.onMessage.addListener((msg) => {
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
    render();
    setStatus();
  }
  if (msg.type === 'live-status') {
    setStatus._livePaused = !!msg.paused;
    setStatus();
  }
});

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
      loadIgnores();
      render();
      maybeAutoApplyPreset();
    }
  });
} catch {}

// Performance options persistence (per-host)
function persistScanOptions() {
  try {
    const key = `a11y_scanopts::${inspectedHost||''}`;
    const payload = { live: !!scanOptions.live, viewportOnly: !!scanOptions.viewportOnly, shadow: !!scanOptions.shadow, iframes: !!scanOptions.iframes, hideNeedsReview: !!scanOptions.hideNeedsReview };
    localStorage.setItem(key, JSON.stringify(payload));
    port.postMessage({ type: 'set-scan-options', ...payload });
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
    if (optLive) optLive.checked = scanOptions.live;
    if (optViewport) optViewport.checked = scanOptions.viewportOnly;
    if (optShadow) optShadow.checked = scanOptions.shadow;
    if (optIframes) optIframes.checked = scanOptions.iframes;
    if (optHideNR) optHideNR.checked = scanOptions.hideNeedsReview;
  } catch {}
}

optLive?.addEventListener('change', () => { scanOptions.live = !!optLive.checked; persistScanOptions(); });
optViewport?.addEventListener('change', () => { scanOptions.viewportOnly = !!optViewport.checked; persistScanOptions(); });
optShadow?.addEventListener('change', () => { scanOptions.shadow = !!optShadow.checked; persistScanOptions(); });
optIframes?.addEventListener('change', () => { scanOptions.iframes = !!optIframes.checked; persistScanOptions(); });
optHideNR?.addEventListener('change', () => { scanOptions.hideNeedsReview = !!optHideNR.checked; persistScanOptions(); });

function downloadHtmlReport() {
  const filter = filterRule.value;
  const byImpact = filterImpact ? filterImpact.value : '';
  const confThresh = minConf ? (parseFloat(minConf.value||'0') || 0) : 0;
  const items = findings
    .filter(f => !filter || f.ruleId === filter)
    .filter(f => !byImpact || (f.impact||'').toLowerCase() === byImpact)
    .filter(f => (typeof f.confidence !== 'number') || f.confidence >= confThresh)
    .filter(f => !ignores.rules.has(f.ruleId) && !ignores.selectors.has(f.selector));
  const rows = items.map(f => `<tr><td>${f.ruleId}</td><td>${f.impact||''}</td><td>${(f.wcag||[]).join(', ')}</td><td>${f.selector}</td><td>${f.message}</td></tr>`).join('');
  const presetName = presetSel?.value || 'default';
  const meta = `Preset: ${presetName} • Live: ${scanOptions.live} • ViewportOnly: ${scanOptions.viewportOnly} • MinConf: ${(parseFloat(minConf?.value||'0')||0).toFixed(2)}`;
  const html = `<!doctype html><meta charset="utf-8"><title>A11y Report</title><style>body{font:14px system-ui}table{border-collapse:collapse}td,th{border:1px solid #ccc;padding:6px}</style><h1>A11y Report</h1><div>${meta}</div><table><thead><tr><th>Rule</th><th>Impact</th><th>WCAG</th><th>Selector</th><th>Message</th></tr></thead><tbody>${rows}</tbody></table>`;
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'a11y-report.html'; a.click();
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
