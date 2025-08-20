try {
  chrome.devtools.panels.create('A11y DevTools', '', 'devtools_panel.html', function(panel) {});
} catch (e) {
  console.warn('DevTools panel creation error', e);
  try { document.body && (document.body.textContent = 'Failed to create DevTools panel.'); } catch {}
}

