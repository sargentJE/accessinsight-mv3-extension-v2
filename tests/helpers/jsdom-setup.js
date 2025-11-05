/**
 * Centralized JSDOM Setup for Tests
 *
 * This module provides a consistent JSDOM environment across all tests.
 * Benefits:
 * - DRY: Don't repeat setup code in every test file
 * - Consistency: All tests use same mocks and configuration
 * - Maintainability: Fix setup once, applies to all tests
 * - Discoverability: One place to see what's mocked
 *
 * Usage:
 *   const { setupJSDOM, loadEngine } = require('./helpers/jsdom-setup');
 *   setupJSDOM();
 *   loadEngine();
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

/**
 * Create and configure JSDOM environment
 * @returns {JSDOM} Configured JSDOM instance
 */
function setupJSDOM() {
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    url: 'https://example.com',
    pretendToBeVisual: true
  });

  // Set global DOM references
  global.window = dom.window;
  global.document = dom.window.document;
  global.getComputedStyle = dom.window.getComputedStyle;
  global.Node = dom.window.Node;
  global.Element = dom.window.Element;
  global.HTMLElement = dom.window.HTMLElement;
  global.DocumentFragment = dom.window.DocumentFragment;
  global.Document = dom.window.Document;

  // CSS.escape polyfill (JSDOM doesn't provide it)
  global.CSS = dom.window.CSS || {
    escape: (str) => String(str).replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, '\\$&')
  };
  if (!dom.window.CSS) {
    dom.window.CSS = global.CSS;
  }

  // Mock getBoundingClientRect (JSDOM returns all zeros by default)
  mockGetBoundingClientRect(dom);

  return dom;
}

/**
 * Mock getBoundingClientRect to return reasonable layout values
 * @param {JSDOM} dom - JSDOM instance
 */
function mockGetBoundingClientRect(dom) {
  const originalGetBoundingClientRect = dom.window.Element.prototype.getBoundingClientRect;

  dom.window.Element.prototype.getBoundingClientRect = function() {
    // Check if element is hidden
    if (this.style.display === 'none') {
      return { width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0, x: 0, y: 0 };
    }

    // Use explicit width/height from styles
    const width = parseFloat(this.style.width) || 100;
    const height = parseFloat(this.style.height) || 30;

    return {
      width,
      height,
      top: 0,
      left: 0,
      right: width,
      bottom: height,
      x: 0,
      y: 0
    };
  };
}

/**
 * Create color parsing mock for JSDOM (canvas not available)
 * @returns {Function} Mock parseColorToRgb function
 */
function createColorMock() {
  return function mockParseColorToRgb(colorStr) {
    if (!colorStr || colorStr === 'transparent') return [0, 0, 0, 0];

    // Named colors (top 30 most common)
    const namedColors = {
      'white': [255, 255, 255, 1],
      'black': [0, 0, 0, 1],
      'red': [255, 0, 0, 1],
      'green': [0, 128, 0, 1],
      'blue': [0, 0, 255, 1],
      'yellow': [255, 255, 0, 1],
      'cyan': [0, 255, 255, 1],
      'magenta': [255, 0, 255, 1],
      'gray': [128, 128, 128, 1],
      'grey': [128, 128, 128, 1],
      'silver': [192, 192, 192, 1],
      'maroon': [128, 0, 0, 1],
      'purple': [128, 0, 128, 1],
      'lime': [0, 255, 0, 1],
      'olive': [128, 128, 0, 1],
      'navy': [0, 0, 128, 1],
      'teal': [0, 128, 128, 1],
      'aqua': [0, 255, 255, 1],
      'orange': [255, 165, 0, 1],
      'pink': [255, 192, 203, 1],
      'brown': [165, 42, 42, 1],
      'gold': [255, 215, 0, 1]
    };

    const color = colorStr.toLowerCase().trim();
    if (namedColors[color]) return namedColors[color];

    // rgb() and rgba() with numbers or percentages
    const rgbaMatch = color.match(/rgba?\s*\(\s*([\d.]+%?)\s*,\s*([\d.]+%?)\s*,\s*([\d.]+%?)\s*(?:,\s*([\d.]+))?\)/);
    if (rgbaMatch) {
      const parse = (val) => {
        if (val.endsWith('%')) {
          return Math.round(255 * parseFloat(val) / 100);
        }
        return parseInt(val);
      };

      return [
        parse(rgbaMatch[1]),
        parse(rgbaMatch[2]),
        parse(rgbaMatch[3]),
        rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 1
      ];
    }

    // Hex format: #RGB, #RRGGBB, #RGBA, #RRGGBBAA
    const hexMatch = color.match(/^#([0-9a-f]{3,8})$/);
    if (hexMatch) {
      let hex = hexMatch[1];

      // Expand shorthand
      if (hex.length === 3 || hex.length === 4) {
        hex = hex.split('').map(c => c + c).join('');
      }

      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      const a = hex.length === 8 ? parseInt(hex.substr(6, 2), 16) / 255 : 1;

      return [r, g, b, a];
    }

    // Fallback: return white
    return [255, 255, 255, 1];
  };
}

/**
 * Load engine.js and inject color mock
 * @param {string} [enginePath] - Path to engine.js (optional)
 * @returns {void}
 */
function loadEngine(enginePath = null) {
  // Default path: relative to project root
  const defaultPath = path.join(__dirname, '../../engine.js');
  const actualPath = enginePath || defaultPath;

  // Create and inject color mock
  global.mockParseColorToRgb = createColorMock();

  // Load engine code
  let engineCode = fs.readFileSync(actualPath, 'utf8');

  // Replace canvas-based parseColorToRgb with mock
  engineCode = engineCode.replace(
    /function parseColorToRgb\(str\) \{[\s\S]*?return \[r,g,b,a\];[\s\n]*\}/m,
    'const parseColorToRgb = global.mockParseColorToRgb'
  );

  // Evaluate engine code in global scope
  eval(engineCode);
}

/**
 * Reset DOM between tests
 * @returns {void}
 */
function resetDOM() {
  if (global.document && global.document.body) {
    global.document.body.innerHTML = '';
  }
}

/**
 * Complete setup: JSDOM + Engine + Reset
 * Use this for most tests
 * @param {string} [enginePath] - Optional custom engine path
 * @returns {void}
 */
function fullSetup(enginePath = null) {
  setupJSDOM();
  loadEngine(enginePath);
  resetDOM();
}

module.exports = {
  setupJSDOM,
  mockGetBoundingClientRect,
  createColorMock,
  loadEngine,
  resetDOM,
  fullSetup
};
