// background.js (MV3 service worker) — routes between DevTools and content scripts
const DEBUG = false;
const devtoolsPorts = new Map(); // tabId -> Port
// Aggregate frame findings per tab over a short window to avoid flicker
const frameAggregators = new Map(); // tabId -> { timer, findings, allRuleIds:Set, enabledRules:Set, maxScanMs }

function ensureInjected(tabId, done) {
  if (DEBUG) try { console.debug('[A11y][BG] ensureInjected → tab', tabId); } catch {}
  chrome.scripting.executeScript(
    { target: { tabId, allFrames: false }, func: () => !!window.__a11yEngine, world: 'ISOLATED' },
    (results) => {
      const present = Array.isArray(results) && results[0] && results[0].result === true;
      if (present) { if (done) done(true); return; }
      // If the page is restricted, results may be undefined/null. Signal restricted state via message.
      if (!Array.isArray(results)) {
        const port = devtoolsPorts.get(tabId);
        if (port) port.postMessage({ _from: 'content', type: 'restricted', tabId });
        if (done) done(false);
        return;
      }
      chrome.scripting.executeScript(
        { target: { tabId, allFrames: false }, files: ['engine.js', 'content.js'], world: 'ISOLATED' },
        () => { if (done) done(!chrome.runtime.lastError); }
      );
    }
  );
}

function injectAllFrames(tabId, done) {
  // Attempt to inject into all frames; ignore restricted frames
  chrome.scripting.executeScript(
    { target: { tabId, allFrames: true }, files: ['engine.js', 'content.js'], world: 'ISOLATED' },
    () => { if (done) done(!chrome.runtime.lastError); }
  );
}

chrome.runtime.onConnect.addListener((port) => {
  if (!port.name.startsWith('devtools-')) return;
  const tabId = parseInt(port.name.split('-')[1], 10);
  devtoolsPorts.set(tabId, port);
  if (DEBUG) try { console.debug('[A11y][BG] DevTools connected for tab', tabId); } catch {}

  port.onDisconnect.addListener(() => { devtoolsPorts.delete(tabId); if (DEBUG) try { console.debug('[A11y][BG] DevTools disconnected for tab', tabId); } catch {} });

  port.onMessage.addListener((msg) => {
    if (DEBUG) try { console.debug('[A11y][BG] Port→Content', tabId, msg && msg.type); } catch {}
    if (!isNaN(tabId)) {
      const go = () => chrome.tabs.sendMessage(tabId, msg, () => void chrome.runtime.lastError);
      if (msg && msg.type === 'set-scan-options' && msg.iframes) {
        // Ensure all frames are injected before proceeding
        injectAllFrames(tabId, go);
      } else {
        ensureInjected(tabId, go);
      }
    }
  });
});

chrome.runtime.onMessage.addListener((msg, sender) => {
  const tabId = sender?.tab?.id;
  if (!tabId) return;
  const port = devtoolsPorts.get(tabId);
  if (!port) return;
  if (DEBUG) try { console.debug('[A11y][BG] Content→Port', tabId, msg && msg.type); } catch {}
  // Aggregate 'findings' from multiple frames into a single message
  if (msg && msg.type === 'findings') {
    let agg = frameAggregators.get(tabId);
    if (!agg) { agg = { timer: 0, findings: [], allRuleIds: new Set(), enabledRules: new Set(), maxScanMs: 0 }; frameAggregators.set(tabId, agg); }
    try {
      if (Array.isArray(msg.findings)) agg.findings.push(...msg.findings);
      if (Array.isArray(msg.allRuleIds)) msg.allRuleIds.forEach((id) => agg.allRuleIds.add(id));
      if (Array.isArray(msg.enabledRules)) msg.enabledRules.forEach((id) => agg.enabledRules.add(id));
      if (typeof msg.scanMs === 'number') agg.maxScanMs = Math.max(agg.maxScanMs, msg.scanMs);
    } catch {}
    if (agg.timer) clearTimeout(agg.timer);
    agg.timer = setTimeout(() => {
      const payload = {
        _from: 'content',
        type: 'findings',
        tabId,
        findings: agg.findings,
        allRuleIds: Array.from(agg.allRuleIds),
        enabledRules: Array.from(agg.enabledRules),
        scanMs: agg.maxScanMs
      };
      frameAggregators.delete(tabId);
      port.postMessage(payload);
    }, 200);
    return;
  }
  // Pass-through for other messages
  port.postMessage({ ...msg, _from: 'content', tabId });
});

chrome.action.onClicked.addListener(async (tab) => {
  if (DEBUG) try { console.debug('[A11y][BG] Action clicked on tab', tab && tab.id); } catch {}
  if (tab?.id) {
    ensureInjected(tab.id, () => {
      chrome.tabs.sendMessage(tab.id, { type: 'toggle-panel' }, () => void chrome.runtime.lastError);
    });
  }
});

chrome.commands.onCommand.addListener((command) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = Array.isArray(tabs) ? tabs[0] : null;
    if (!tab?.id) return;
    const type = ({'toggle-panel':'toggle-panel','next-finding':'next-finding','previous-finding':'previous-finding'})[command];
    if (DEBUG) try { console.debug('[A11y][BG] Command', command, '→', type, 'tab', tab.id); } catch {}
    if (type) {
      ensureInjected(tab.id, () => {
        chrome.tabs.sendMessage(tab.id, { type }, () => void chrome.runtime.lastError);
      });
    }
  });
});
