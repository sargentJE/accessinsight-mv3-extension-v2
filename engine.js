// engine.js — phase 1 rules + evidence + improved accessible name (pragmatic)
(function() {
  // Simple caches to avoid repeated heavy work within a scan
  const computedStyleCache = new WeakMap();
  const accNameCache = new WeakMap();

  // Rule metadata (help URLs, default impacts, tags)
  const RULE_META = {
    'img-alt': { helpUrl: 'https://dequeuniversity.com/rules/axe/4.8/image-alt', defaultImpact: 'serious', tags: ['wcag2a','wcag111'] },
    'control-name': { helpUrl: 'https://dequeuniversity.com/rules/axe/4.8/control-name', defaultImpact: 'serious', tags: ['wcag2a','wcag412'] },
    'button-name': { helpUrl: 'https://dequeuniversity.com/rules/axe/4.8/button-name', defaultImpact: 'serious', tags: ['wcag2a','wcag412'] },
    'link-name': { helpUrl: 'https://dequeuniversity.com/rules/axe/4.8/link-name', defaultImpact: 'serious', tags: ['wcag2a','wcag244','wcag412'] },
    'label-control': { helpUrl: 'https://dequeuniversity.com/rules/axe/4.8/label', defaultImpact: 'serious', tags: ['wcag2a','wcag131','wcag332'] },
    'headings-order': { helpUrl: 'https://www.w3.org/WAI/tutorials/page-structure/headings/', defaultImpact: 'moderate', tags: ['wcag2aa','wcag246','wcag131'] },
    'landmarks': { helpUrl: 'https://www.w3.org/WAI/ARIA/apg/practices/landmark-regions/', defaultImpact: 'moderate', tags: ['best-practice'] },
    'aria-role-valid': { helpUrl: 'https://www.w3.org/WAI/ARIA/apg/practices/roles/', defaultImpact: 'moderate', tags: ['wcag2a','wcag412'] },
    'aria-required-props': { helpUrl: 'https://www.w3.org/TR/wai-aria-1.2/#requiredState', defaultImpact: 'serious', tags: ['wcag2a','wcag412'] },
    'aria-attr-valid': { helpUrl: 'https://www.w3.org/TR/wai-aria-1.2/#states_and_properties', defaultImpact: 'moderate', tags: ['wcag2a','wcag412'] },
    'aria-presentation-misuse': { helpUrl: 'https://dequeuniversity.com/rules/axe/4.8/presentation-role', defaultImpact: 'moderate', tags: ['wcag2a','wcag131','wcag412'] },
    'aria-hidden-focus': { helpUrl: 'https://dequeuniversity.com/rules/axe/4.8/aria-hidden-focus', defaultImpact: 'serious', tags: ['wcag2a','wcag131','wcag412'] },
    'target-size': { helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/target-size.html', defaultImpact: 'moderate', tags: ['wcag22aa','wcag258'] },
    'contrast-text': { helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html', defaultImpact: 'serious', tags: ['wcag2aa','wcag143'] },
    'link-in-text-block': { helpUrl: 'https://dequeuniversity.com/rules/axe/4.8/link-in-text-block', defaultImpact: 'serious', tags: ['wcag2a','wcag141'] },
    'html-lang': { helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/language-of-page.html', defaultImpact: 'moderate', tags: ['wcag2a','wcag311'] },
    'document-title': { helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/page-titled.html', defaultImpact: 'moderate', tags: ['wcag2a','wcag242'] },
    'skip-link': { helpUrl: 'https://webaim.org/techniques/skipnav/', defaultImpact: 'moderate', tags: ['best-practice','wcag241'] },
    'link-button-misuse': { helpUrl: 'https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Roles/button_role', defaultImpact: 'moderate', tags: ['best-practice'] },
    'tabindex-positive': { helpUrl: 'https://web.dev/tabindex/', defaultImpact: 'moderate', tags: ['best-practice'] },
    'fieldset-legend': { helpUrl: 'https://www.w3.org/WAI/tutorials/forms/grouping/', defaultImpact: 'moderate', tags: ['wcag2a','wcag131','wcag332'] },
    'autocomplete': { helpUrl: 'https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#attr-fe-autocomplete', defaultImpact: 'moderate', tags: ['best-practice','wcag135'] },
    'media-captions': { helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/captions-prerecorded.html', defaultImpact: 'serious', tags: ['wcag2a','wcag122'] },
    'audio-transcript': { helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/audio-only-and-video-only-prerecorded.html', defaultImpact: 'moderate', tags: ['wcag2a','wcag121'] },
    'heading-h1': { helpUrl: 'https://dequeuniversity.com/rules/axe/4.8/page-has-heading-one', defaultImpact: 'moderate', tags: ['best-practice'] },
    'region-name': { helpUrl: 'https://www.w3.org/TR/wai-aria-practices-1.2/examples/landmarks/region.html', defaultImpact: 'moderate', tags: ['wcag2a','wcag241'] },
    'iframe-title': { helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/name-role-value.html', defaultImpact: 'serious', tags: ['wcag2a','wcag412'] },
    'meta-viewport': { helpUrl: 'https://dequeuniversity.com/rules/axe/4.8/meta-viewport', defaultImpact: 'moderate', tags: ['wcag2aa','wcag144'] },
    'list': { helpUrl: 'https://dequeuniversity.com/rules/axe/4.8/list', defaultImpact: 'serious', tags: ['wcag2a','wcag131'] },
    'duplicate-ids': { helpUrl: 'https://dequeuniversity.com/rules/axe/4.8/duplicate-id', defaultImpact: 'serious', tags: ['wcag2a','wcag411'] },
    'dl-structure': { helpUrl: 'https://html.spec.whatwg.org/multipage/grouping-content.html#the-dl-element', defaultImpact: 'moderate', tags: ['wcag2a','wcag131'] },
    'interactive-role-focusable': { helpUrl: 'https://dequeuniversity.com/rules/axe/4.8/aria-required-attr', defaultImpact: 'serious', tags: ['wcag2a','wcag211','wcag412'] },
    'aria-allowed-attr': { helpUrl: 'https://www.w3.org/TR/wai-aria-1.2/#states_and_properties', defaultImpact: 'moderate', tags: ['wcag2a','wcag412'] },
    'aria-allowed-role': { helpUrl: 'https://www.w3.org/TR/wai-aria-1.2/#role_definitions', defaultImpact: 'moderate', tags: ['wcag2a','wcag412'] },
    'aria-required-children': { helpUrl: 'https://www.w3.org/TR/wai-aria-1.2/#childrenArePresentational', defaultImpact: 'serious', tags: ['wcag2a','wcag412'] },
    'aria-required-parent': { helpUrl: 'https://www.w3.org/TR/wai-aria-1.2/#ariaRoleAttribute', defaultImpact: 'serious', tags: ['wcag2a','wcag412'] },
    'table-headers-association': { helpUrl: 'https://www.w3.org/WAI/WCAG21/Techniques/html/H43', defaultImpact: 'serious', tags: ['wcag2a','wcag131'] },
    'table-caption': { helpUrl: 'https://www.w3.org/WAI/WCAG21/Techniques/html/H39', defaultImpact: 'moderate', tags: ['wcag2a','wcag131'] }
  };

  const isElementVisible = (el) => {
    if (!el || !(el instanceof Element)) return false;
    const cs = computedStyleCache.get(el) || getComputedStyle(el);
    if (!computedStyleCache.has(el)) computedStyleCache.set(el, cs);
    if (cs.display === 'none' || cs.visibility !== 'visible' || parseFloat(cs.opacity) === 0) return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  };

  const cssPath = (el) => {
    try {
      if (!(el instanceof Element)) return '';
      if (el.id) return `#${CSS.escape(el.id)}`;
      const name = el.tagName.toLowerCase();
      const parent = el.parentElement;
      if (!parent) return name;
      const idx = Array.from(parent.children).indexOf(el) + 1;
      return `${cssPath(parent)} > ${name}:nth-child(${idx})`;
    } catch { return ''; }
  };

  // Shadow DOM traversal (open roots) — opt-in via window.__a11yConfig.shadow
  function* walkTreeWithShadow(root) {
    const stack = [root];
    const includeShadow = !!(window.__a11yConfig && window.__a11yConfig.shadow);
    while (stack.length) {
      const node = stack.pop();
      if (!node) continue;
      yield node;
      if (node instanceof Element) {
        if (includeShadow && node.shadowRoot) {
          stack.push(node.shadowRoot);
        }
        for (let i = node.children.length - 1; i >= 0; i--) stack.push(node.children[i]);
      } else if (node instanceof DocumentFragment || node instanceof Document) {
        for (let i = (node.children?.length||0) - 1; i >= 0; i--) stack.push(node.children[i]);
      }
    }
  }

  const textFromIds = (ids) => {
    if (!ids) return '';
    const tokens = ids.split(/\s+/).filter(Boolean);
    const pieces = [];
    for (const id of tokens) {
      const n = document.getElementById(id);
      if (!n) continue;
      // Respect aria-hidden on referenced nodes
      if (n.closest('[aria-hidden="true"]')) continue;
      pieces.push((n.textContent || ''));
    }
    return pieces.join(' ').replace(/\s+/g, ' ').trim();
  };

  // ANDC helpers: ignore presentational containers and aria-hidden descendants
  function isPresentational(el) {
    if (!(el instanceof Element)) return false;
    const role = (el.getAttribute('role')||'').trim().toLowerCase();
    return role === 'presentation' || role === 'none';
  }

  function collectTextForName(root) {
    // Depth-first collect visible text, respecting aria-hidden and adding IMG @alt where present
    let out = '';
    const stack = [root];
    const seen = new Set();
    while (stack.length) {
      const n = stack.pop();
      if (!n || seen.has(n)) continue; seen.add(n);
      if (n.nodeType === Node.ELEMENT_NODE) {
        const el = n;
        if (el.getAttribute && el.getAttribute('aria-hidden') === 'true') continue;
        if (isPresentational(el)) {
          // still include children (presentation affects semantics, not necessarily visibility)
        }
        if (el.tagName === 'IMG') {
          const alt = (el.getAttribute('alt')||'').trim();
          if (alt) out += ' ' + alt;
        }
        for (let i = el.childNodes.length - 1; i >= 0; i--) stack.push(el.childNodes[i]);
      } else if (n.nodeType === Node.TEXT_NODE) {
        const t = (n.nodeValue || '').trim();
        if (t) out += ' ' + t;
      }
    }
    return out.replace(/\s+/g, ' ').trim();
  }

  const isFocusableByHeuristic = (el) => {
    if (!(el instanceof Element)) return false;
    const name = el.tagName;
    if (['BUTTON','SELECT','TEXTAREA'].includes(name)) return true;
    if (name === 'A' && el.hasAttribute('href')) return true;
    if (name === 'INPUT') return true;
    const role = el.getAttribute('role');
    const interactiveRoles = new Set(['button','link','switch','menuitem','tab','textbox','checkbox','radio','combobox','listbox','option','slider','spinbutton']);
    if (role && interactiveRoles.has(role)) return true;
    const ti = el.getAttribute('tabindex');
    if (ti !== null && !isNaN(parseInt(ti)) && parseInt(ti) >= 0) return true;
    return false;
  };

  function getAccName(el, _visited = new Set(), evidence = { sources: [] }) {
    if (!(el instanceof Element)) return { name: '', evidence };
    const cached = accNameCache.get(el);
    if (cached) return { name: cached, evidence: { sources: [...(evidence.sources||[]), { source: 'cache' }] } };

    // 1) aria-labelledby (strongest)
    if (el.hasAttribute('aria-labelledby')) {
      const txt = textFromIds(el.getAttribute('aria-labelledby'));
      if (txt) { evidence.sources.push({ source: 'aria-labelledby', text: txt }); accNameCache.set(el, txt); return { name: txt, evidence }; }
    }
    // 2) aria-label
    if (el.hasAttribute('aria-label')) {
      const txt = (el.getAttribute('aria-label') || '').trim();
      if (txt) { evidence.sources.push({ source: 'aria-label', text: txt }); accNameCache.set(el, txt); return { name: txt, evidence }; }
    }
    // 3) native: img/area/input[type=image]
    if (el.tagName === 'IMG') {
      const alt = el.getAttribute('alt');
      if (alt !== null) { const out = (alt||'').trim(); evidence.sources.push({ source: 'img@alt', text: alt }); accNameCache.set(el, out); return { name: out, evidence }; }
    }
    if (el.tagName === 'AREA' && el.hasAttribute('alt')) {
      const out = (el.getAttribute('alt')||'').trim(); if (out) { evidence.sources.push({ source: 'area@alt', text: out }); accNameCache.set(el, out); return { name: out, evidence }; }
    }
    if (el.tagName === 'INPUT' && (el.getAttribute('type')||'').toLowerCase() === 'image') {
      const alt = (el.getAttribute('alt')||'').trim(); if (alt) { evidence.sources.push({ source: 'input[type=image]@alt', text: alt }); accNameCache.set(el, alt); return { name: alt, evidence }; }
    }
    if (el.tagName === 'INPUT') {
      const type = (el.getAttribute('type')||'').toLowerCase();
      if (['button','submit','reset'].includes(type)) {
        const val = (el.getAttribute('value')||'').trim();
        if (val) { evidence.sources.push({ source: `input[${type}]@value`, text: val }); accNameCache.set(el, val); return { name: val, evidence }; }
      }
    }
    // 4) label association
    const id = el.getAttribute('id');
    if (id) {
      const lbl = document.querySelector(`label[for="${CSS.escape(id)}"]`);
      if (lbl && lbl.textContent) {
        const txt = lbl.textContent.replace(/\s+/g,' ').trim();
        if (txt) { evidence.sources.push({ source: 'label[for]', text: txt }); accNameCache.set(el, txt); return { name: txt, evidence }; }
      }
    }
    if (el.closest && el.closest('label')) {
      const lbl = el.closest('label');
      const txt = (lbl && lbl.textContent ? lbl.textContent.replace(/\s+/g,' ').trim() : '');
      if (txt) { evidence.sources.push({ source: 'label wrapping', text: txt }); accNameCache.set(el, txt); return { name: txt, evidence }; }
    }
    // 5) Name from content (subset of roles/elements that allow it)
    const nameFromContent = (function() {
      const rolesAllowContent = new Set(['button','link','tab','menuitem','menuitemcheckbox','menuitemradio','option','switch','checkbox']);
      const tag = el.tagName;
      if (tag === 'BUTTON' || tag === 'SUMMARY') return true;
      if (tag === 'A' && el.hasAttribute('href')) return true;
      const role = (el.getAttribute('role')||'').trim();
      if (role && rolesAllowContent.has(role)) return true;
      return false;
    })();
    if (nameFromContent && !isPresentational(el)) {
      if (_visited.has(el)) return { name: '', evidence };
      _visited.add(el);
      const txt = collectTextForName(el);
      if (txt) { evidence.sources.push({ source: 'subtree text', text: txt }); accNameCache.set(el, txt); return { name: txt, evidence }; }
    }
    // 6) Title fallback
    if (el.hasAttribute('title')) {
      const txt = (el.getAttribute('title')||'').trim();
      if (txt) { evidence.sources.push({ source: 'title', text: txt }); accNameCache.set(el, txt); return { name: txt, evidence }; }
    }
    accNameCache.set(el, '');
    return { name: '', evidence };
  }

  // Accessible Description (subset): aria-describedby > aria-description > title
  const accDescCache = new WeakMap();
  function getAccDescription(el) {
    if (!(el instanceof Element)) return { description: '', evidence: { sources: [] } };
    const cached = accDescCache.get(el);
    if (cached) return cached;
    const evidence = { sources: [] };
    if (el.hasAttribute('aria-describedby')) {
      const txt = textFromIds(el.getAttribute('aria-describedby'));
      if (txt) { const out = { description: txt, evidence: { sources: [{ source: 'aria-describedby', text: txt }] } }; accDescCache.set(el, out); return out; }
    }
    if (el.hasAttribute('aria-description')) {
      const txt = (el.getAttribute('aria-description')||'').trim();
      if (txt) { const out = { description: txt, evidence: { sources: [{ source: 'aria-description', text: txt }] } }; accDescCache.set(el, out); return out; }
    }
    if (el.hasAttribute('title')) {
      const txt = (el.getAttribute('title')||'').trim();
      if (txt) { const out = { description: txt, evidence: { sources: [{ source: 'title', text: txt }] } }; accDescCache.set(el, out); return out; }
    }
    const out = { description: '', evidence };
    accDescCache.set(el, out);
    return out;
  }

  function parseColorToRgb(str) {
    const ctx = parseColorToRgb._ctx || (parseColorToRgb._ctx = document.createElement('canvas').getContext('2d'));
    ctx.fillStyle = '#000'; ctx.fillStyle = str;
    const m = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([0-9.]+))?\)$/.exec(ctx.fillStyle);
    if (!m) return null;
    const r = parseInt(m[1], 10), g = parseInt(m[2], 10), b = parseInt(m[3], 10);
    const a = m[4] !== undefined ? parseFloat(m[4]) : 1;
    return [r,g,b,a];
  }
  function relLuminance([r,g,b]) {
    const toLin = (c)=>{ c/=255; return c<=0.03928? c/12.92 : Math.pow((c+0.055)/1.055, 2.4); };
    const [R,G,B] = [toLin(r), toLin(g), toLin(b)];
    return 0.2126*R + 0.7152*G + 0.0722*B;
  }
  function contrastRatio(fg, bg) {
    const L1 = relLuminance(fg) + 0.05;
    const L2 = relLuminance(bg) + 0.05;
    return L1 > L2 ? L1/L2 : L2/L1;
  }
  function compositeOver(fg, bg) {
    // fg: [r,g,b,a], bg: [r,g,b]
    const a = fg[3];
    const inv = 1 - a;
    return [
      Math.round(fg[0] * a + bg[0] * inv),
      Math.round(fg[1] * a + bg[1] * inv),
      Math.round(fg[2] * a + bg[2] * inv)
    ];
  }

  function resolveBackground(el) {
    // Composite ancestor background colors until opaque or root.
    // If backgrounds are all transparent or involve images, fallback to document/body color.
    let accum = null;
    let node = el;
    while (node && node instanceof Element) {
      const cs = computedStyleCache.get(node) || getComputedStyle(node);
      if (!computedStyleCache.has(node)) computedStyleCache.set(node, cs);
      const bgCol = cs.backgroundColor;
      if (bgCol && bgCol !== 'transparent') {
        const rgba = parseColorToRgb(bgCol);
        if (rgba) {
          if (!accum) {
            accum = rgba[3] === 1 ? rgba.slice(0,3) : compositeOver(rgba, [255,255,255]);
          } else {
            accum = rgba[3] === 1 ? rgba.slice(0,3) : compositeOver(rgba, accum);
          }
          if (rgba[3] === 1) break;
        }
      }
      // If background-image present, we cannot reliably compute; break and fallback later
      const bgImg = cs.backgroundImage;
      if (bgImg && bgImg !== 'none') { accum = accum || null; break; }
      node = node.parentElement;
    }
    if (!accum) {
      const root = document.body || document.documentElement;
      const rootCs = computedStyleCache.get(root) || getComputedStyle(root);
      if (!computedStyleCache.has(root)) computedStyleCache.set(root, rootCs);
      const rgb = parseColorToRgb(rootCs.backgroundColor);
    return rgb ? rgb.slice(0,3) : [255,255,255];
    }
    return accum;
  }

  function makeFinding({ ruleId, impact='serious', message, el, wcag=[], evidence={}, confidence=0.9 }) {
    return { ruleId, impact, message, selector: cssPath(el), wcag, evidence, confidence };
  }

  const ruleImgAlt = {
    id: 'img-alt',
    description: 'Images must have a text alternative (alt or accessible name)',
    evaluate() {
      const nodes = Array.from(document.querySelectorAll('img, [role="img"]'));
      const out = [];
      for (const el of nodes) {
        if (!isElementVisible(el)) continue;
        const role = el.getAttribute('role');
        const ariaHidden = el.getAttribute('aria-hidden') === 'true';
        const isDecorative = ariaHidden || (el.tagName === 'IMG' && el.getAttribute('alt') === '' && role === 'presentation');
        if (isDecorative) continue;
        const hasAlt = el.tagName === 'IMG' && el.hasAttribute('alt');
        const hasAria = el.hasAttribute('aria-label') || el.hasAttribute('aria-labelledby');
        if (!hasAlt && !hasAria) {
          out.push(makeFinding({
            ruleId: 'img-alt', message: 'Image lacks a text alternative.', el, wcag: ['1.1.1'],
            evidence: { role, alt: el.getAttribute('alt') || null }, confidence: 0.95
          }));
        }
      }
      return out;
    }
  };

  const ruleControlName = {
    id: 'control-name',
    description: 'Interactive controls must have an accessible name',
    evaluate() {
      const pool = Array.from(document.querySelectorAll('a, button, input, select, textarea, [role], [tabindex]'));
      const out = [];
      for (const el of pool) {
        if (!isElementVisible(el)) continue;
        if (!isFocusableByHeuristic(el)) continue;
        const disabled = el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true';
        if (disabled) continue;
        // Dedupe: if this is a form control and will be flagged by label-control, skip here to align with axe's 'label'
        if (el.matches && el.matches('input, select, textarea')) {
          const { name } = getAccName(el, new Set(), { sources: [] });
          if (!name) continue; // leave to label-control
        }
        const { name, evidence } = getAccName(el, new Set(), { sources: [] });
        if (!name) {
          out.push(makeFinding({
            ruleId: 'control-name', message: 'Interactive control lacks an accessible name.', el,
            wcag: ['4.1.2','2.5.3'], evidence, confidence: 0.9
          }));
        }
      }
      return out;
    }
  };

  const ruleLabelControl = {
    id: 'label-control',
    description: 'Form controls must have programmatic labels',
    evaluate() {
      const out = [];
      const controls = Array.from(document.querySelectorAll('input, select, textarea')).filter(el => {
        const type = (el.getAttribute('type')||'').toLowerCase();
        return type !== 'hidden';
      });
      for (const el of controls) {
        if (!isElementVisible(el)) continue;
        const { name, evidence } = getAccName(el, new Set(), { sources: [] });
        if (!name) {
          out.push(makeFinding({
            ruleId: 'label-control', message: 'Form control is missing an associated label.', el,
            wcag: ['3.3.2','1.3.1'], evidence: { ...evidence, placeholder: el.getAttribute('placeholder') || null }, confidence: 0.9
          }));
        }
      }
      return out;
    }
  };

  const ruleHeadingsOrder = {
    id: 'headings-order',
    description: 'Headings levels should be hierarchical without large jumps',
    evaluate() {
      const out = [];
      const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6'));
      let prev = 0;
      headings.forEach((el, i) => {
        const lvl = parseInt(el.tagName.substring(1), 10);
        if (i === 0) { prev = lvl; return; }
        if (Math.abs(lvl - prev) > 1) {
          out.push(makeFinding({
            ruleId: 'headings-order', impact: 'moderate',
            message: `Heading level jump from H${prev} to H${lvl}.`, el, wcag: ['2.4.6','1.3.1'],
            evidence: { prev, current: lvl }, confidence: 0.8
          }));
        }
        prev = lvl;
      });
      return out;
    }
  };

  const ruleLandmarks = {
    id: 'landmarks',
    description: 'Landmarks should be present and not conflicting',
    evaluate() {
      const out = [];
      const mains = Array.from(document.querySelectorAll('main, [role="main"]'));
      if (mains.length === 0) {
        out.push(makeFinding({
          ruleId: 'landmarks', impact: 'moderate',
          message: 'No main landmark found. Consider <main> or role="main".',
          el: document.body, wcag: ['1.3.1','2.4.1'], confidence: 0.8
        }));
      } else if (mains.length > 1) {
        out.push(makeFinding({
          ruleId: 'landmarks', impact: 'moderate',
          message: 'Multiple main landmarks detected; only one is recommended.',
          el: mains[1], wcag: ['1.3.1','2.4.1'], evidence: { count: mains.length }, confidence: 0.8
        }));
      }
      return out;
    }
  };

  const VALID_ROLES = new Set([ 'alert','alertdialog','application','article','banner','button','cell','checkbox','columnheader','combobox',
    'complementary','contentinfo','definition','dialog','directory','document','feed','figure','form','grid','gridcell','group','heading','img','link','list','listbox','listitem','log','main','marquee','math','menu','menubar','menuitem','menuitemcheckbox','menuitemradio','navigation','none','note','option','presentation','progressbar','radio','radiogroup','region','row','rowgroup','rowheader','scrollbar','search','searchbox','separator','slider','spinbutton','status','switch','tab','table','tablist','tabpanel','term','textbox','timer','toolbar','tooltip','tree','treegrid','treeitem' ]);
  const ruleAriaRoleValid = {
    id: 'aria-role-valid',
    description: 'ARIA role attribute must use a valid value',
    evaluate() {
      const out = [];
      const nodes = Array.from(document.querySelectorAll('[role]'));
      for (const el of nodes) {
        const role = (el.getAttribute('role')||'').trim();
        if (!role) continue;
        const tokens = role.split(/\s+/);
        const valid = tokens.find(t => VALID_ROLES.has(t));
        if (!valid) {
          out.push(makeFinding({
            ruleId: 'aria-role-valid', impact: 'moderate',
            message: `Invalid ARIA role value: "${role}".`, el, wcag: ['4.1.2'], evidence: { role }, confidence: 0.95
          }));
        }
      }
      return out;
    }
  };

  // Additional ARIA checks: required properties and invalid attributes
  const ARIA_REQUIRED_PROPS = {
    heading: ['aria-level'],
    checkbox: ['aria-checked'],
    switch: ['aria-checked'],
    slider: ['aria-valuemin','aria-valuemax','aria-valuenow'],
    spinbutton: ['aria-valuemin','aria-valuemax','aria-valuenow']
  };

  const ARIA_VALID_ATTRS = new Set([
    // Global states and properties
    'aria-activedescendant','aria-atomic','aria-autocomplete','aria-busy','aria-checked','aria-colcount','aria-colindex','aria-colspan','aria-controls','aria-current','aria-describedby','aria-details','aria-disabled','aria-errormessage','aria-expanded','aria-flowto','aria-haspopup','aria-hidden','aria-invalid','aria-keyshortcuts','aria-label','aria-labelledby','aria-level','aria-live','aria-modal','aria-multiline','aria-multiselectable','aria-orientation','aria-owns','aria-placeholder','aria-posinset','aria-pressed','aria-readonly','aria-relevant','aria-required','aria-roledescription','aria-rowcount','aria-rowindex','aria-rowspan','aria-selected','aria-setsize','aria-sort','aria-valuemax','aria-valuemin','aria-valuenow','aria-valuetext'
  ]);

  const ruleAriaRequiredProps = {
    id: 'aria-required-props',
    description: 'ARIA roles must include required properties',
    evaluate() {
      const out = [];
      const nodes = Array.from(document.querySelectorAll('[role]'));
      for (const el of nodes) {
        const role = (el.getAttribute('role')||'').trim().split(/\s+/)[0] || '';
        const req = ARIA_REQUIRED_PROPS[role];
        if (!req) continue;
        const missing = req.filter(attr => !el.hasAttribute(attr));
        if (missing.length) {
          out.push(makeFinding({
            ruleId: 'aria-required-props', impact: 'serious',
            message: `Role "${role}" is missing required ARIA property/properties: ${missing.join(', ')}.`, el, wcag: ['4.1.2'], evidence: { role, missing }, confidence: 0.95
          }));
        }
      }
      return out;
    }
  };

  const ruleAriaAttrValid = {
    id: 'aria-attr-valid',
    description: 'ARIA attributes must be valid',
    evaluate() {
      const out = [];
      const nodes = Array.from(document.querySelectorAll('*'));
      for (const el of nodes) {
        for (const attr of el.getAttributeNames()) {
          if (!attr.startsWith('aria-')) continue;
          if (!ARIA_VALID_ATTRS.has(attr)) {
            out.push(makeFinding({
              ruleId: 'aria-attr-valid', impact: 'moderate',
              message: `Invalid ARIA attribute: ${attr}.`, el, wcag: ['4.1.2'], evidence: { attr }, confidence: 0.9
            }));
          }
        }
      }
      return out;
    }
  };

  // ARIA allowed attributes (basic whitelist per role not implemented; generic guard against conflicting attributes)
  const ruleAriaAllowedAttr = {
    id: 'aria-allowed-attr',
    description: 'ARIA attributes used must be allowed on the element/role',
    evaluate() {
      const out = [];
      const nodes = Array.from(document.querySelectorAll('*'));
      for (const el of nodes) {
        const role = (el.getAttribute('role')||'').trim().split(/\s+/)[0] || '';
        for (const attr of el.getAttributeNames()) {
          if (!attr.startsWith('aria-')) continue;
          if (!ARIA_VALID_ATTRS.has(attr)) continue; // other rule handles invalid attrs
          // Heuristic: presentation/none should not use global/interactive attrs
          if ((role === 'presentation' || role === 'none') && (attr === 'aria-label' || attr === 'aria-labelledby' || attr === 'aria-describedby')) {
            out.push(makeFinding({ ruleId: 'aria-allowed-attr', impact: 'moderate', message: `role="${role}" should not have naming ARIA attributes (${attr}).`, el, wcag: ['4.1.2'], evidence: { role, attr }, confidence: 0.85 }));
          }
        }
      }
      return out;
    }
  };

  // ARIA allowed role — heuristic: forbid interactive role on inputs with implicit role conflict
  const ruleAriaAllowedRole = {
    id: 'aria-allowed-role',
    description: 'ARIA role should be allowed for the given element',
    evaluate() {
      const out = [];
      const nodes = Array.from(document.querySelectorAll('[role]'));
      for (const el of nodes) {
        const role = (el.getAttribute('role')||'').trim().split(/\s+/)[0] || '';
        const tag = el.tagName;
        // Example conflict: <input type="text" role="button">
        if (tag === 'INPUT' && role && INTERACTIVE_ROLES.has(role) && role !== 'textbox') {
          const type = (el.getAttribute('type')||'').toLowerCase();
          if (['text','search','email','tel','url','password'].includes(type)) {
            out.push(makeFinding({ ruleId: 'aria-allowed-role', impact: 'moderate', message: `Conflicting ARIA role "${role}" on ${tag.toLowerCase()} input.`, el, wcag: ['4.1.2'], evidence: { role, type }, confidence: 0.85 }));
          }
        }
      }
      return out;
    }
  };

  // Required children/parent (heuristic subset)
  const ruleAriaRequiredChildren = {
    id: 'aria-required-children',
    description: 'Certain roles require specific child roles',
    evaluate() {
      const out = [];
      const tablists = Array.from(document.querySelectorAll('[role="tablist"]'));
      for (const tl of tablists) {
        const hasTab = !!tl.querySelector('[role="tab"]');
        if (!hasTab) out.push(makeFinding({ ruleId: 'aria-required-children', impact: 'serious', message: 'role=tablist must contain elements with role=tab.', el: tl, wcag: ['4.1.2'], confidence: 0.95 }));
      }
      return out;
    }
  };
  const ruleAriaRequiredParent = {
    id: 'aria-required-parent',
    description: 'Certain roles require a specific parent',
    evaluate() {
      const out = [];
      const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
      for (const tab of tabs) {
        if (!tab.closest('[role="tablist"]')) out.push(makeFinding({ ruleId: 'aria-required-parent', impact: 'serious', message: 'role=tab must be within a role=tablist.', el: tab, wcag: ['4.1.2'], confidence: 0.95 }));
      }
      return out;
    }
  };

  // Tables: headers association heuristic
  const ruleTableHeadersAssociation = {
    id: 'table-headers-association',
    description: 'Data cells should be associated with table headers via scope or headers/id',
    evaluate() {
      const out = [];
      const tables = Array.from(document.querySelectorAll('table'));
      for (const table of tables) {
        const hasTh = !!table.querySelector('th');
        if (!hasTh) continue;
        const badTds = Array.from(table.querySelectorAll('td')).filter(td => {
          const headers = (td.getAttribute('headers')||'').trim();
          if (headers) return false;
          // Look for row/col TH with scope
          const row = td.parentElement;
          const colIndex = Array.from(row.children).indexOf(td);
          const rowTh = row && row.querySelector('th[scope="row"]');
          const colTh = table.querySelector(`tr > th[scope="col"]:nth-child(${colIndex+1})`);
          return !(rowTh || colTh);
        });
        if (badTds.length) {
          out.push(makeFinding({ ruleId: 'table-headers-association', impact: 'serious', message: 'Some table data cells are not associated with headers via scope or headers/id.', el: table, wcag: ['1.3.1'], evidence: { sample: badTds.slice(0,3).map(cssPath) }, confidence: 0.8 }));
        }
      }
      return out;
    }
  };

  // Table completeness: caption presence (advisory but useful)
  const ruleTableCaption = {
    id: 'table-caption',
    description: 'Data tables should include a <caption> describing the table contents',
    evaluate() {
      const out = [];
      const tables = Array.from(document.querySelectorAll('table'));
      for (const table of tables) {
        const hasTh = !!table.querySelector('th');
        if (!hasTh) continue; // likely layout table, skip
        const hasCaption = !!table.querySelector(':scope > caption');
        if (!hasCaption) {
          out.push(makeFinding({
            ruleId: 'table-caption', impact: 'moderate',
            message: 'Data table is missing a <caption> describing its contents.',
            el: table, wcag: ['1.3.1'], confidence: 0.8
          }));
        }
      }
      return out;
    }
  };

  const ruleAriaPresentationMisuse = {
    id: 'aria-presentation-misuse',
    description: 'role="presentation/none" must not be used on interactive/native semantic elements',
    evaluate() {
      const out = [];
      const nodes = Array.from(document.querySelectorAll('[role="presentation"], [role="none"]'));
      for (const el of nodes) {
        const isInteractiveNative = (() => {
          const t = el.tagName;
          if (['BUTTON','SELECT','TEXTAREA'].includes(t)) return true;
          if (t === 'A' && el.hasAttribute('href')) return true;
          if (t === 'INPUT' && (el.getAttribute('type')||'').toLowerCase() !== 'hidden') return true;
          return false;
        })();
        if (isInteractiveNative) {
          out.push(makeFinding({
            ruleId: 'aria-presentation-misuse', impact: 'moderate',
            message: 'role="presentation/none" should not be used on interactive/native semantic elements.', el, wcag: ['1.3.1','4.1.2'], confidence: 0.9
          }));
        }
      }
      return out;
    }
  };

  // Axe parity: aria-hidden-focus — aria-hidden containers must not contain focusable content
  const ruleAriaHiddenFocus = {
    id: 'aria-hidden-focus',
    description: 'aria-hidden elements must not be focusable nor contain focusable elements',
    evaluate() {
      const out = [];
      const containers = Array.from(document.querySelectorAll('[aria-hidden="true"]'));
      for (const c of containers) {
        const disabled = c.getAttribute('aria-disabled') === 'true' || c.hasAttribute('disabled');
        const offenders = [];
        // Check the container itself and any descendant
        const pool = [c, ...Array.from(c.querySelectorAll('a, button, input, select, textarea, [role], [tabindex]'))];
        for (const el of pool) {
          if (disabled) break;
          if (el === c) {
            if (isFocusableByHeuristic(el)) offenders.push(cssPath(el));
          } else {
            if (isFocusableByHeuristic(el)) offenders.push(cssPath(el));
          }
          if (offenders.length >= 3) break; // cap evidence
        }
        if (offenders.length) {
          out.push(makeFinding({
            ruleId: 'aria-hidden-focus', impact: 'serious',
            message: 'ARIA hidden element contains focusable content. Remove from tab order or remove aria-hidden.',
            el: c, wcag: ['4.1.2'], evidence: { offenders }, confidence: 0.95
          }));
        }
      }
      return out;
    }
  };

  const ruleTargetSize = {
    id: 'target-size',
    description: 'Interactive controls should be at least 24×24 CSS px',
    evaluate() {
      const out = [];
      const pool = Array.from(document.querySelectorAll('a, button, input, [role], [tabindex]'));
      for (const el of pool) {
        if (!isElementVisible(el)) continue;
        const rect = el.getBoundingClientRect();
        const isInteractive = (() => {
          const name = el.tagName;
          if (['BUTTON','SELECT','TEXTAREA'].includes(name)) return true;
          if (name === 'A' && el.hasAttribute('href')) return true;
          if (name === 'INPUT') return true;
          const role = el.getAttribute('role');
          const interactiveRoles = new Set(['button','link','switch','menuitem','tab','textbox','checkbox','radio','combobox','listbox','option','slider','spinbutton']);
          if (role && interactiveRoles.has(role)) return true;
          const ti = el.getAttribute('tabindex');
          return ti !== null && !isNaN(parseInt(ti)) && parseInt(ti) >= 0;
        })();
        if (!isInteractive) continue;
        if (rect.width < 24 || rect.height < 24) {
          out.push(makeFinding({
            ruleId: 'target-size', impact: 'moderate',
            message: `Hit target is ${Math.round(rect.width)}×${Math.round(rect.height)}px; recommended ≥ 24×24px.`,
            el, wcag: ['2.5.8'], evidence: { width: rect.width, height: rect.height }, confidence: 0.85
          }));
        }
      }
      return out;
    }
  };

  // Axe parity: button-name — buttons must have a discernible text (accessible name)
  const ruleButtonName = {
    id: 'button-name',
    description: 'Buttons must have discernible text (accessible name)',
    evaluate() {
      const out = [];
      const nodes = Array.from(document.querySelectorAll('button, [role="button"], input[type="button"], input[type="submit"], input[type="reset"]'));
      for (const el of nodes) {
        if (!isElementVisible(el)) continue;
        const disabled = el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true';
        if (disabled) continue;
        const { name, evidence } = getAccName(el, new Set(), { sources: [] });
        if (!name) {
          out.push(makeFinding({
            ruleId: 'button-name', impact: 'critical',
            message: 'Button lacks a discernible text (accessible name).',
            el, wcag: ['4.1.2'], evidence, confidence: 0.95
          }));
        }
      }
      return out;
    }
  };

  // Axe parity: link-name — links must have discernible text (accessible name)
  const ruleLinkName = {
    id: 'link-name',
    description: 'Links must have discernible text (accessible name)',
    evaluate() {
      const out = [];
      const nodes = Array.from(document.querySelectorAll('a[href], [role="link"]'));
      for (const el of nodes) {
        if (!isElementVisible(el)) continue;
        const disabled = el.getAttribute('aria-disabled') === 'true';
        if (disabled) continue;
        // axe focuses on elements in tab order; heuristic covers that
        if (!isFocusableByHeuristic(el)) continue;
        const { name, evidence } = getAccName(el, new Set(), { sources: [] });
        if (!name) {
          out.push(makeFinding({
            ruleId: 'link-name', impact: 'serious',
            message: 'Link lacks a discernible text (accessible name).',
            el, wcag: ['2.4.4','4.1.2'], evidence, confidence: 0.95
          }));
        }
      }
      return out;
    }
  };

  const ruleContrastText = {
    id: 'contrast-text',
    description: 'Visible text must meet WCAG color contrast thresholds',
    evaluate() {
      const out = [];
      for (const node of walkTreeWithShadow(document.body)) {
        if (node.nodeType !== Node.TEXT_NODE) continue;
        const el = node.parentElement;
        if (!el || !isElementVisible(el)) continue;
        // Skip heavy work off-viewport when requested
        try {
          if (window.__a11yConfig && window.__a11yConfig.viewportOnly) {
            const r = el.getBoundingClientRect();
            const inView = r.bottom > 0 && r.right > 0 && r.top < (window.innerHeight||0) && r.left < (window.innerWidth||0);
            if (!inView) continue;
          }
        } catch {}
        const cs = computedStyleCache.get(el) || getComputedStyle(el);
        if (!computedStyleCache.has(el)) computedStyleCache.set(el, cs);
        const fgRgba = (function(){ try { return cs.color; } catch { return null; } })();
        if (!fgRgba) continue;
        const rgba = (function(){ const m = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([0-9.]+))?\)/.exec(fgRgba); if (!m) return null; return [parseInt(m[1],10),parseInt(m[2],10),parseInt(m[3],10), m[4]!==undefined?parseFloat(m[4]):1]; })();
        if (!rgba) continue;
        const bg = resolveBackground(el);
        const fg = rgba[3] < 1 ? compositeOver(rgba, bg) : rgba.slice(0,3);
        const ratio = contrastRatio(fg, bg);
        const fontSizePx = parseFloat(cs.fontSize);
        const isBold = parseInt(cs.fontWeight, 10) >= 700;
        const isLarge = fontSizePx >= 24 || (fontSizePx >= 18.66 && isBold);
        const threshold = isLarge ? 3 : 4.5;
        const bgImg = (function(){
          let node = el; while (node && node instanceof Element) {
            const cs2 = computedStyleCache.get(node) || getComputedStyle(node);
            if (!computedStyleCache.has(node)) computedStyleCache.set(node, cs2);
            if (cs2.backgroundImage && cs2.backgroundImage !== 'none') return true; node = node.parentElement;
          } return false; })();
        let confidence = bgImg ? 0.6 : 0.9; if (rgba[3] < 1) confidence = Math.min(confidence, 0.85);
        if (ratio < threshold) {
          out.push(makeFinding({
            ruleId: 'contrast-text', impact: 'serious',
            message: `Text contrast ${ratio.toFixed(2)}:1 is below ${threshold}:1.`,
            el, wcag: ['1.4.3'],
            evidence: { ratio: Number(ratio.toFixed(2)), fontSizePx, isBold, fg, bg, bgImage: !!bgImg }, confidence
          }));
        }
      }
      return out;
    }
  };

  // Axe parity: link-in-text-block — links must be visually distinguishable without relying on color alone
  const ruleLinkInTextBlock = {
    id: 'link-in-text-block',
    description: 'Links within text must be visually distinguished from surrounding text (underline or ≥3:1 color contrast)',
    evaluate() {
      const out = [];
      const candidates = Array.from(document.querySelectorAll('a[href]'));
      for (const a of candidates) {
        if (!isElementVisible(a)) continue;
        // Consider only links inside text blocks
        const block = a.closest('p, li, dd, dt, span, div');
        if (!block) continue;
        // If link has underline/border-bottom, consider it distinguished
        const csA = computedStyleCache.get(a) || getComputedStyle(a);
        if (!computedStyleCache.has(a)) computedStyleCache.set(a, csA);
        const tdl = (csA.textDecorationLine || '').toLowerCase();
        const bbs = (csA.borderBottomStyle || '').toLowerCase();
        if (tdl.includes('underline') || (bbs && bbs !== 'none')) continue;
        // Compare link color vs surrounding text color
        const aCol = parseColorToRgb(csA.color);
        if (!aCol) continue;
        const csP = computedStyleCache.get(block) || getComputedStyle(block);
        if (!computedStyleCache.has(block)) computedStyleCache.set(block, csP);
        const pCol = parseColorToRgb(csP.color);
        if (!pCol) continue;
        const fg = aCol.slice(0,3);
        const bg = pCol.slice(0,3);
        const ratio = contrastRatio(fg, bg);
        if (ratio < 3) {
          out.push(makeFinding({
            ruleId: 'link-in-text-block', impact: 'serious',
            message: 'Link is not visually distinguished from surrounding text (no underline and < 3:1 contrast).',
            el: a, wcag: ['1.4.1'], evidence: { linkColor: fg, textColor: bg, ratio: Number(ratio.toFixed(2)) }, confidence: 0.9
          }));
        }
      }
      return out;
    }
  };

  // Phase 2 — Coverage expansion rules
  const ruleHtmlLang = {
    id: 'html-lang',
    description: 'Document must declare a language on <html lang="…">',
    evaluate() {
      const out = [];
      const html = document.documentElement;
      const lang = (html.getAttribute('lang')||'').trim();
      if (!lang) {
        out.push(makeFinding({ ruleId: 'html-lang', impact: 'moderate', message: 'Missing or empty lang attribute on <html>.', el: html, wcag: ['3.1.1'] }));
      }
      return out;
    }
  };

  const ruleDocumentTitle = {
    id: 'document-title',
    description: 'Page should have a descriptive <title>',
    evaluate() {
      const out = [];
      const titleEl = document.querySelector('head > title');
      const text = (titleEl && titleEl.textContent ? titleEl.textContent : document.title || '').trim();
      if (!text) {
        out.push(makeFinding({ ruleId: 'document-title', impact: 'moderate', message: 'Missing or empty <title> element.', el: document.documentElement, wcag: ['2.4.2'] }));
      }
      return out;
    }
  };

  const ruleSkipLink = {
    id: 'skip-link',
    description: 'Provide a skip link to main content',
    evaluate() {
      const out = [];
      const links = Array.from(document.querySelectorAll('a[href^="#"]'));
      const candidates = links.filter(a => /skip|content|main/i.test(a.textContent || '') || ['#main','#content','#skip','#skip-link'].includes((a.getAttribute('href')||'').toLowerCase()));
      const ok = candidates.some(a => {
        const targetId = (a.getAttribute('href')||'').slice(1);
        const t = targetId ? document.getElementById(targetId) : null;
        if (!t) return false;
        if (t.tagName === 'MAIN') return true;
        const role = (t.getAttribute('role')||'').toLowerCase();
        return role === 'main';
      });
      if (!ok) {
        out.push(makeFinding({ ruleId: 'skip-link', impact: 'moderate', message: 'No skip link to main content detected.', el: document.body, wcag: ['2.4.1'] }));
      }
      return out;
    }
  };

  const ruleLinkButtonMisuse = {
    id: 'link-button-misuse',
    description: 'Anchors should have valid href; buttons should be used for actions',
    evaluate() {
      const out = [];
      const anchors = Array.from(document.querySelectorAll('a'));
      for (const a of anchors) {
        if (!isElementVisible(a)) continue;
        const hasHref = a.hasAttribute('href') && (a.getAttribute('href')||'').trim() !== '' && (a.getAttribute('href')||'').trim() !== '#';
        const role = (a.getAttribute('role')||'').toLowerCase();
        const tabIndexAttr = a.getAttribute('tabindex');
        const tabIndexNum = tabIndexAttr !== null ? parseInt(tabIndexAttr, 10) : null;
        const clickable = a.onclick || a.getAttribute('onclick');
        if (!hasHref && (role !== 'button') && (clickable || (tabIndexNum !== null && tabIndexNum >= 0))) {
          out.push(makeFinding({
            ruleId: 'link-button-misuse', impact: 'moderate',
            message: 'Anchor used as interactive control without a valid href. Use <button> for actions or provide a real URL.',
            el: a, wcag: ['4.1.2','2.1.1']
          }));
        }
      }
      return out;
    }
  };

  const ruleTabindexPositive = {
    id: 'tabindex-positive',
    description: 'Avoid tabindex greater than 0; use DOM order and tabindex="0" for custom widgets',
    evaluate() {
      const out = [];
      const nodes = Array.from(document.querySelectorAll('[tabindex]'));
      for (const el of nodes) {
        if (!isElementVisible(el)) continue;
        const ti = parseInt(el.getAttribute('tabindex')||'', 10);
        if (!isNaN(ti) && ti > 0) {
          out.push(makeFinding({ ruleId: 'tabindex-positive', impact: 'moderate', message: `Element has tabindex="${ti}" > 0; this can break logical focus order.`, el, wcag: ['2.4.3'] }));
        }
      }
      return out;
    }
  };

  const ruleFieldsetLegend = {
    id: 'fieldset-legend',
    description: 'Related radio inputs should be grouped in <fieldset> with a <legend>',
    evaluate() {
      const out = [];
      const radios = Array.from(document.querySelectorAll('input[type="radio"][name]'));
      const byName = new Map();
      for (const r of radios) {
        const nm = r.getAttribute('name');
        if (!byName.has(nm)) byName.set(nm, []);
        byName.get(nm).push(r);
      }
      for (const [name, group] of byName.entries()) {
        if (group.length < 2) continue;
        const allGrouped = group.every(r => {
          const fs = r.closest('fieldset');
          return !!(fs && fs.querySelector('legend'));
        });
        if (!allGrouped) {
          out.push(makeFinding({ ruleId: 'fieldset-legend', impact: 'moderate', message: `Radio group "${name}" should be within a <fieldset> with a <legend>.`, el: group[0], wcag: ['1.3.1','3.3.2'], evidence: { count: group.length, name } }));
        }
      }
      return out;
    }
  };

  const ruleAutocomplete = {
    id: 'autocomplete',
    description: 'Inputs that collect user data should include appropriate autocomplete attributes',
    evaluate() {
      const out = [];
      const nodes = Array.from(document.querySelectorAll('input'));
      for (const el of nodes) {
        if (!isElementVisible(el)) continue;
        const type = (el.getAttribute('type')||'').toLowerCase();
        const ac = (el.getAttribute('autocomplete')||'').trim();
        if (type === 'email' || type === 'tel' || type === 'name') {
          if (!ac) out.push(makeFinding({ ruleId: 'autocomplete', impact: 'moderate', message: `Consider providing autocomplete for input[type=${type}].`, el, wcag: ['1.3.5'] }));
        }
        if (type === 'password') {
          if (!ac || ac.toLowerCase() === 'off') out.push(makeFinding({ ruleId: 'autocomplete', impact: 'moderate', message: 'Provide an appropriate autocomplete value for password fields (e.g., current-password, new-password).', el, wcag: ['1.3.5'] }));
        }
      }
      return out;
    }
  };

  const ruleMediaCaptions = {
    id: 'media-captions',
    description: 'Video with audio should provide captions/subtitles',
    evaluate() {
      const out = [];
      const videos = Array.from(document.querySelectorAll('video'));
      for (const v of videos) {
        if (!isElementVisible(v)) continue;
        const hasTrack = v.querySelector('track[kind="captions"], track[kind="subtitles"]');
        if (!hasTrack) {
          out.push(makeFinding({ ruleId: 'media-captions', impact: 'serious', message: 'Video element lacks captions/subtitles track.', el: v, wcag: ['1.2.2'] }));
        }
      }
      return out;
    }
  };

  const ruleAudioTranscript = {
    id: 'audio-transcript',
    description: 'Audio content should provide a transcript or alternative',
    evaluate() {
      const out = [];
      const audios = Array.from(document.querySelectorAll('audio'));
      for (const a of audios) {
        if (!isElementVisible(a)) continue;
        const describedby = a.getAttribute('aria-describedby');
        const hasNearbyTranscript = !!Array.from(document.querySelectorAll('a,button,details,div,section')).find(n => /transcript/i.test(n.textContent||''));
        if (!describedby && !hasNearbyTranscript) {
          out.push(makeFinding({ ruleId: 'audio-transcript', impact: 'moderate', message: 'Audio element should provide a transcript or alternative description.', el: a, wcag: ['1.2.1'] }));
        }
      }
      return out;
    }
  };

  const ruleHeadingH1 = {
    id: 'heading-h1',
    description: 'Document should have a top-level heading (h1)',
    evaluate() {
      const out = [];
      const h1s = document.querySelectorAll('h1');
      if (!h1s.length) out.push(makeFinding({ ruleId: 'heading-h1', impact: 'moderate', message: 'No <h1> found on the page.', el: document.body, wcag: ['2.4.6','1.3.1'] }));
      return out;
    }
  };

  const ruleRegionName = {
    id: 'region-name',
    description: 'ARIA region landmarks must have an accessible name',
    evaluate() {
      const out = [];
      const regions = Array.from(document.querySelectorAll('[role="region"]'));
      for (const el of regions) {
        if (!isElementVisible(el)) continue;
        const { name } = getAccName(el, new Set(), { sources: [] });
        if (!name) out.push(makeFinding({ ruleId: 'region-name', impact: 'moderate', message: 'Region landmark is missing an accessible name.', el, wcag: ['1.3.1','2.4.1'] }));
      }
      return out;
    }
  };

  const ruleIframeTitle = {
    id: 'iframe-title',
    description: '<iframe> elements must have non-empty title attributes',
    evaluate() {
      const out = [];
      const iframes = Array.from(document.querySelectorAll('iframe'));
      for (const el of iframes) {
        const title = (el.getAttribute('title')||'').trim();
        if (!title) out.push(makeFinding({ ruleId: 'iframe-title', impact: 'serious', message: 'Iframe is missing a non-empty title attribute.', el, wcag: ['2.4.1','4.1.2'] }));
      }
      return out;
    }
  };

  const ruleMetaViewport = {
    id: 'meta-viewport',
    description: 'Responsive pages should include an appropriate viewport meta tag',
    evaluate() {
      const out = [];
      const meta = document.querySelector('meta[name="viewport"]');
      if (!meta) {
        out.push(makeFinding({ ruleId: 'meta-viewport', impact: 'moderate', message: 'Missing <meta name="viewport"> for responsive/zoom behavior.', el: document.head || document.documentElement, wcag: ['1.4.4','1.4.10'] }));
      } else {
        const content = (meta.getAttribute('content')||'').toLowerCase();
        const disablesZoom = content.includes('user-scalable=no') || /maximum-scale\s*=\s*1(\.0)?/.test(content);
        if (disablesZoom) {
          out.push(makeFinding({ ruleId: 'meta-viewport', impact: 'critical', message: 'Zooming and scaling are disabled via viewport settings. Avoid user-scalable=no and maximum-scale=1.', el: meta, wcag: ['1.4.4'], confidence: 0.95 }));
        }
      }
      return out;
    }
  };

  // Axe parity: list — <ul>/<ol> must contain only allowed direct children
  const ruleListStructure = {
    id: 'list',
    description: '<ul>/<ol> must directly contain only <li>, <script>, or <template>',
    evaluate() {
      const out = [];
      const allowed = new Set(['LI','SCRIPT','TEMPLATE']);
      const lists = Array.from(document.querySelectorAll('ul, ol'));
      for (const list of lists) {
        const bad = Array.from(list.children).filter(ch => !allowed.has(ch.tagName));
        if (bad.length) {
          out.push(makeFinding({
            ruleId: 'list', impact: 'serious',
            message: 'List element has direct children that are not allowed.',
            el: list, wcag: ['1.3.1'], evidence: { offenders: bad.slice(0,3).map(cssPath) }, confidence: 0.95
          }));
        }
      }
      return out;
    }
  };

  // New: duplicate-ids — IDs in the document must be unique
  const ruleDuplicateIds = {
    id: 'duplicate-ids',
    description: 'ID values must be unique within the document',
    evaluate() {
      const out = [];
      const seen = new Map(); // id -> first element
      const nodes = Array.from(document.querySelectorAll('[id]'));
      for (const el of nodes) {
        const id = el.getAttribute('id');
        if (!id) continue;
        if (!seen.has(id)) { seen.set(id, el); continue; }
        // Report on duplicates (first 3 offenders as evidence)
        const first = seen.get(id);
        out.push(makeFinding({
          ruleId: 'duplicate-ids', impact: 'serious',
          message: `Duplicate id value "${id}" found. IDs must be unique.`,
          el, wcag: ['4.1.1'], evidence: { id, first: cssPath(first) }, confidence: 0.95
        }));
      }
      return out;
    }
  };

  // New: dl-structure — <dl> must contain only sequences of <dt>/<dd>
  const ruleDlStructure = {
    id: 'dl-structure',
    description: '<dl> must directly contain only <dt> and <dd> elements',
    evaluate() {
      const out = [];
      const lists = Array.from(document.querySelectorAll('dl'));
      for (const dl of lists) {
        const bad = Array.from(dl.children).filter(ch => ch.tagName !== 'DT' && ch.tagName !== 'DD');
        if (bad.length) {
          out.push(makeFinding({
            ruleId: 'dl-structure', impact: 'moderate',
            message: '<dl> contains elements other than <dt>/<dd>.',
            el: dl, wcag: ['1.3.1'], evidence: { offenders: bad.slice(0,3).map(cssPath) }, confidence: 0.9
          }));
        }
      }
      return out;
    }
  };

  // New: interactive-role-focusable — elements with interactive ARIA roles must be keyboard focusable
  const INTERACTIVE_ROLES = new Set(['button','link','switch','menuitem','tab','textbox','checkbox','radio','combobox','listbox','option','slider','spinbutton']);
  const ruleInteractiveRoleFocusable = {
    id: 'interactive-role-focusable',
    description: 'Elements with interactive roles must be keyboard focusable',
    evaluate() {
      const out = [];
      const nodes = Array.from(document.querySelectorAll('[role]'));
      for (const el of nodes) {
        const role = (el.getAttribute('role')||'').split(/\s+/)[0];
        if (!INTERACTIVE_ROLES.has(role)) continue;
        if (!isElementVisible(el)) continue;
        // Heuristic: must be focusable via tabindex>=0 or natively focusable
        const focusable = isFocusableByHeuristic(el);
        if (!focusable) {
          out.push(makeFinding({
            ruleId: 'interactive-role-focusable', impact: 'serious',
            message: `Element with interactive role "${role}" is not keyboard focusable.`,
            el, wcag: ['2.1.1','4.1.2'], evidence: { role }, confidence: 0.9
          }));
        }
      }
      return out;
    }
  };

  const ALL_RULES = [
    ruleImgAlt,
    ruleControlName,
    ruleButtonName,
    ruleLinkName,
    ruleLabelControl,
    ruleHeadingsOrder,
    ruleLandmarks,
    ruleAriaRoleValid,
    ruleAriaRequiredProps,
    ruleAriaAttrValid,
    ruleAriaPresentationMisuse,
    ruleAriaHiddenFocus,
    ruleTargetSize,
    ruleContrastText,
    ruleLinkInTextBlock,
    // Phase 2 additions
    ruleHtmlLang,
    ruleDocumentTitle,
    ruleSkipLink,
    ruleLinkButtonMisuse,
    ruleTabindexPositive,
    ruleFieldsetLegend,
    ruleAutocomplete,
    ruleMediaCaptions,
    ruleAudioTranscript,
    ruleHeadingH1,
    ruleRegionName,
    ruleIframeTitle,
    ruleMetaViewport,
    ruleListStructure
    , ruleDuplicateIds
    , ruleDlStructure
    , ruleInteractiveRoleFocusable
    , ruleAriaAllowedAttr
    , ruleAriaAllowedRole
    , ruleAriaRequiredChildren
    , ruleAriaRequiredParent
    , ruleTableHeadersAssociation
    , ruleTableCaption
  ];

  function runEnabledRules(enabledIds) {
    const rules = ALL_RULES.filter(r => enabledIds.has(r.id));
    const results = [];
    for (const r of rules) {
      try { results.push(...r.evaluate()); } catch (e) { console.warn('Rule error', r.id, e); }
    }
    return results;
  }

  let __profile = 'default';
  window.__a11yEngine = {
    allRuleIds: ALL_RULES.map(r => r.id),
    ruleMeta: RULE_META,
    setProfile: (p) => { __profile = (p || 'default'); },
    run: (enabled) => {
      const paramList = Array.isArray(enabled) ? enabled : null;
      const configList = Array.isArray(window.__a11yConfig?.enabledRules) ? window.__a11yConfig.enabledRules : null;
      const selected = (paramList && paramList.length)
        ? paramList
        : (configList && configList.length)
          ? configList
          : window.__a11yEngine.allRuleIds;
      const results = runEnabledRules(new Set(selected));
      // Profile-specific impact overrides and needsReview policies
      if (__profile === 'axe') {
        for (const f of results) {
          if (f.ruleId === 'img-alt') f.impact = 'critical';
          if (f.ruleId === 'label-control') f.impact = 'critical';
          if (f.ruleId === 'button-name') f.impact = 'critical';
          if (f.ruleId === 'link-name') f.impact = 'serious';
          if (f.ruleId === 'aria-hidden-focus') f.impact = 'serious';
          if (f.ruleId === 'list') f.impact = 'serious';
          if (f.ruleId === 'meta-viewport' && /Missing/.test(f.message)) f.impact = 'moderate';
        }
        for (const f of results) {
          if (f.ruleId === 'contrast-text' && typeof f.confidence === 'number' && f.confidence < 0.7) {
            f.needsReview = true;
          }
        }
      } else if (__profile === 'lighthouse') {
        for (const f of results) {
          if (f.ruleId === 'contrast-text') f.impact = 'serious';
          if (f.ruleId === 'img-alt') f.impact = 'serious';
          if (f.ruleId === 'button-name') f.impact = 'serious';
          if (f.ruleId === 'link-name') f.impact = 'serious';
          if (f.ruleId === 'label-control') f.impact = 'serious';
          if (f.ruleId === 'control-name') f.impact = 'moderate';
          if (f.ruleId === 'html-lang') f.impact = 'moderate';
          if (f.ruleId === 'document-title') f.impact = 'moderate';
          if (f.ruleId === 'meta-viewport' && /Missing/.test(f.message)) f.impact = 'moderate';
          if (f.ruleId === 'target-size') f.impact = 'moderate';
        }
        // Lighthouse does not expose "needs review" category; leave as violations only
      } else if (__profile === 'ibm') {
        for (const f of results) {
          // IBM often categorizes certain heuristics as Needs review
          if (f.ruleId === 'contrast-text' && (f.evidence && (f.evidence.bgImage || f.confidence < 0.7))) f.needsReview = true;
          if (f.ruleId === 'link-in-text-block') f.needsReview = true;
          if (f.ruleId === 'target-size') f.needsReview = true;
          // Impact normalization
          if (f.ruleId === 'aria-role-valid' || f.ruleId === 'aria-required-props' || f.ruleId === 'aria-attr-valid') f.impact = 'serious';
          if (f.ruleId === 'iframe-title') f.impact = 'serious';
          if (f.ruleId === 'region-name') f.impact = 'moderate';
          if (f.ruleId === 'headings-order') f.impact = 'moderate';
        }
      }
      return results;
    }
  };
})();
