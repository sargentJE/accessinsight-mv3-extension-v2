/**
 * Reusable DOM Fixtures for Testing
 *
 * This module provides factory functions for creating common test DOM elements.
 * Benefits:
 * - DRY: Don't repeat element creation across 40+ test files
 * - Consistency: All tests use same baseline elements
 * - Maintainability: Change fixture once, updates all tests
 * - Speed: 2-3x faster to write new tests
 *
 * Usage:
 *   const { createTestElement, fixtures } = require('./helpers/dom-fixtures');
 *   const button = fixtures.accessibleButton();
 *   document.body.appendChild(button);
 */

/**
 * Generic element factory
 * @param {Object} options
 * @param {string} options.tag - HTML tag name
 * @param {string} [options.text] - Text content
 * @param {Object} [options.styles] - CSS styles
 * @param {Object} [options.attrs] - HTML attributes
 * @param {Array} [options.children] - Child elements
 * @returns {HTMLElement}
 */
function createTestElement({ tag = 'div', text = '', styles = {}, attrs = {}, children = [] }) {
  const el = document.createElement(tag);

  if (text) el.textContent = text;

  Object.assign(el.style, styles);

  Object.entries(attrs).forEach(([key, value]) => {
    el.setAttribute(key, value);
  });

  children.forEach(child => el.appendChild(child));

  return el;
}

/**
 * Pre-configured fixtures for common test scenarios
 */
const fixtures = {
  // ===== TEXT & CONTRAST =====

  lowContrastText: () => createTestElement({
    tag: 'div',
    text: 'Low contrast text',
    styles: {
      color: '#999', // 2.85:1 on white - fails AA
      backgroundColor: '#fff',
      fontSize: '14px',
      display: 'block',
      width: '200px',
      height: '50px'
    }
  }),

  highContrastText: () => createTestElement({
    tag: 'div',
    text: 'High contrast text',
    styles: {
      color: '#000',
      backgroundColor: '#fff',
      fontSize: '14px',
      display: 'block'
    }
  }),

  largeText: () => createTestElement({
    tag: 'div',
    text: 'Large text (18pt)',
    styles: {
      color: '#666',
      backgroundColor: '#fff',
      fontSize: '24px', // 18pt = 24px
      display: 'block'
    }
  }),

  semiTransparentText: () => createTestElement({
    tag: 'div',
    text: 'Semi-transparent text',
    styles: {
      color: 'rgba(0, 0, 0, 0.5)',
      backgroundColor: '#fff',
      fontSize: '14px',
      display: 'block'
    }
  }),

  // ===== BUTTONS & INTERACTIVE =====

  accessibleButton: () => createTestElement({
    tag: 'button',
    text: 'Click me',
    styles: { display: 'block', width: '100px', height: '50px' }
  }),

  buttonWithoutName: () => createTestElement({
    tag: 'button',
    text: '', // No text content
    styles: { display: 'block', width: '50px', height: '50px' }
  }),

  buttonWithAriaLabel: () => createTestElement({
    tag: 'button',
    text: '',
    attrs: { 'aria-label': 'Close dialog' },
    styles: { display: 'block' }
  }),

  nonFocusableButton: () => createTestElement({
    tag: 'div',
    text: 'Fake button',
    attrs: { role: 'button' }, // No tabindex!
    styles: { display: 'block', cursor: 'pointer' }
  }),

  focusableButton: () => createTestElement({
    tag: 'div',
    text: 'Proper button',
    attrs: { role: 'button', tabindex: '0' },
    styles: { display: 'block', cursor: 'pointer' }
  }),

  // ===== IMAGES =====

  imageWithoutAlt: () => createTestElement({
    tag: 'img',
    attrs: { src: 'test.jpg', width: '100', height: '100' },
    styles: { display: 'block' }
  }),

  imageWithAlt: () => createTestElement({
    tag: 'img',
    attrs: { src: 'test.jpg', alt: 'Test image', width: '100', height: '100' },
    styles: { display: 'block' }
  }),

  decorativeImage: () => createTestElement({
    tag: 'img',
    attrs: { src: 'decorative.jpg', alt: '', role: 'presentation', width: '100', height: '100' },
    styles: { display: 'block' }
  }),

  // ===== FORM CONTROLS =====

  inputWithoutLabel: () => createTestElement({
    tag: 'input',
    attrs: { type: 'text', id: 'test-input' },
    styles: { display: 'block' }
  }),

  inputWithLabel: function() {
    const input = createTestElement({
      tag: 'input',
      attrs: { type: 'text', id: 'labeled-input' },
      styles: { display: 'block' }
    });
    const label = createTestElement({
      tag: 'label',
      text: 'Username',
      attrs: { 'for': 'labeled-input' }
    });
    return { input, label };
  },

  inputWithAriaLabel: () => createTestElement({
    tag: 'input',
    attrs: { type: 'text', 'aria-label': 'Search query' },
    styles: { display: 'block' }
  }),

  // ===== LINKS =====

  linkWithoutName: () => createTestElement({
    tag: 'a',
    attrs: { href: 'https://example.com' },
    styles: { display: 'inline-block' }
  }),

  linkWithText: () => createTestElement({
    tag: 'a',
    text: 'Click here',
    attrs: { href: 'https://example.com' },
    styles: { display: 'inline-block' }
  }),

  linkInText: (underlined = false) => {
    const paragraph = createTestElement({
      tag: 'p',
      text: 'This is some text with a ',
      styles: { color: '#000', backgroundColor: '#fff' }
    });
    const link = createTestElement({
      tag: 'a',
      text: 'link',
      attrs: { href: 'https://example.com' },
      styles: {
        color: '#0000FF',
        textDecoration: underlined ? 'underline' : 'none'
      }
    });
    paragraph.appendChild(link);
    paragraph.appendChild(document.createTextNode(' in the middle.'));
    return paragraph;
  },

  // ===== HEADINGS =====

  heading: (level, text = 'Heading text') => createTestElement({
    tag: `h${level}`,
    text,
    styles: { display: 'block' }
  }),

  headingSequence: () => {
    const h1 = fixtures.heading(1, 'Main title');
    const h2 = fixtures.heading(2, 'Section');
    const h3 = fixtures.heading(3, 'Subsection');
    return [h1, h2, h3];
  },

  skippedHeading: () => {
    const h1 = fixtures.heading(1, 'Title');
    const h3 = fixtures.heading(3, 'Skipped h2!'); // Violation
    return [h1, h3];
  },

  // ===== LANDMARKS =====

  mainLandmark: () => createTestElement({
    tag: 'main',
    text: 'Main content here',
    styles: { display: 'block', minHeight: '100px' }
  }),

  navLandmark: () => createTestElement({
    tag: 'nav',
    attrs: { 'aria-label': 'Main navigation' },
    styles: { display: 'block' }
  }),

  roleLandmark: (role) => createTestElement({
    tag: 'div',
    attrs: { role },
    text: `${role} content`,
    styles: { display: 'block' }
  }),

  // ===== ARIA ELEMENTS =====

  ariaElement: (role, extraAttrs = {}) => createTestElement({
    tag: 'div',
    attrs: { role, ...extraAttrs },
    styles: { display: 'block' }
  }),

  invalidAriaRole: () => createTestElement({
    tag: 'div',
    attrs: { role: 'invalid-role-name' },
    text: 'Invalid ARIA role',
    styles: { display: 'block' }
  }),

  ariaMissingRequiredProps: () => createTestElement({
    tag: 'div',
    attrs: { role: 'checkbox' }, // Missing aria-checked
    text: 'Checkbox without aria-checked',
    styles: { display: 'block' }
  }),

  ariaWithRequiredProps: () => createTestElement({
    tag: 'div',
    attrs: { role: 'checkbox', 'aria-checked': 'false' },
    text: 'Proper checkbox',
    styles: { display: 'block' }
  }),

  // ===== HIDDEN ELEMENTS =====

  hiddenElement: (method = 'display') => {
    const styles = { display: 'block' };

    switch (method) {
      case 'display':
        styles.display = 'none';
        break;
      case 'visibility':
        styles.visibility = 'hidden';
        break;
      case 'opacity':
        styles.opacity = '0';
        break;
      case 'aria':
        // Use aria-hidden attribute
        break;
    }

    const el = createTestElement({
      tag: 'div',
      text: 'Hidden content',
      styles
    });

    if (method === 'aria') {
      el.setAttribute('aria-hidden', 'true');
      el.style.display = 'block'; // Visually visible but hidden from AT
    }

    return el;
  },

  zeroSizeElement: () => createTestElement({
    tag: 'div',
    text: 'Zero size',
    styles: { width: '0px', height: '0px', overflow: 'hidden' }
  }),

  // ===== DOCUMENT STRUCTURE =====

  htmlWithLang: (lang = 'en') => {
    // Note: Can't actually create <html> element, so return attributes
    return { lang };
  },

  htmlWithoutLang: () => {
    return {}; // No lang attribute
  },

  documentWithTitle: (title = 'Test Page') => {
    // Note: Can't modify document.title in some test contexts
    return { title };
  },

  // ===== TOUCH TARGETS =====

  smallTouchTarget: () => createTestElement({
    tag: 'button',
    text: '×',
    styles: {
      width: '20px',
      height: '20px',
      padding: '0',
      fontSize: '16px',
      display: 'inline-block'
    }
  }),

  adequateTouchTarget: () => createTestElement({
    tag: 'button',
    text: 'Close',
    styles: {
      width: '44px',
      height: '44px',
      display: 'inline-block'
    }
  }),

  // ===== LISTS =====

  properList: () => {
    const ul = createTestElement({ tag: 'ul', styles: { display: 'block' } });
    const li1 = createTestElement({ tag: 'li', text: 'Item 1' });
    const li2 = createTestElement({ tag: 'li', text: 'Item 2' });
    ul.appendChild(li1);
    ul.appendChild(li2);
    return ul;
  },

  improperList: () => {
    const ul = createTestElement({ tag: 'ul', styles: { display: 'block' } });
    const div = createTestElement({ tag: 'div', text: 'Not an LI!' });
    ul.appendChild(div); // Violation: <ul> should only contain <li>
    return ul;
  },

  // ===== TABLES =====

  tableWithHeaders: () => {
    const table = createTestElement({ tag: 'table', styles: { display: 'table' } });
    const thead = createTestElement({ tag: 'thead' });
    const tr = createTestElement({ tag: 'tr' });
    const th = createTestElement({ tag: 'th', text: 'Header', attrs: { scope: 'col' } });
    tr.appendChild(th);
    thead.appendChild(tr);
    table.appendChild(thead);
    return table;
  },

  tableWithoutHeaders: () => {
    const table = createTestElement({ tag: 'table', styles: { display: 'table' } });
    const tr = createTestElement({ tag: 'tr' });
    const td = createTestElement({ tag: 'td', text: 'Data' });
    tr.appendChild(td);
    table.appendChild(tr);
    return table; // Missing <thead>, <th> elements
  }
};

module.exports = {
  createTestElement,
  fixtures
};
