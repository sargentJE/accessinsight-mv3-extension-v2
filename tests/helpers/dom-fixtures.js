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
  },

  // ===== PHASE 5: STRUCTURAL RULES =====

  // aria-hidden-focus fixtures
  ariaHiddenWithFocusableButton: () => {
    const container = createTestElement({
      tag: 'div',
      attrs: { 'aria-hidden': 'true' },
      styles: { display: 'block' }
    });
    const button = createTestElement({
      tag: 'button',
      text: 'Focusable button',
      attrs: { tabindex: '0' }
    });
    container.appendChild(button);
    return container;
  },

  ariaHiddenWithFocusableLink: () => {
    const container = createTestElement({
      tag: 'div',
      attrs: { 'aria-hidden': 'true' },
      styles: { display: 'block' }
    });
    const link = createTestElement({
      tag: 'a',
      text: 'Focusable link',
      attrs: { href: '#' }
    });
    container.appendChild(link);
    return container;
  },

  ariaHiddenWithInput: () => {
    const container = createTestElement({
      tag: 'div',
      attrs: { 'aria-hidden': 'true' },
      styles: { display: 'block' }
    });
    const input = createTestElement({
      tag: 'input',
      attrs: { type: 'text', placeholder: 'Input field' }
    });
    container.appendChild(input);
    return container;
  },

  ariaHiddenFocusableItself: () => createTestElement({
    tag: 'div',
    attrs: { 'aria-hidden': 'true', tabindex: '0' },
    text: 'Focusable container',
    styles: { display: 'block' }
  }),

  ariaHiddenWithDisabledButton: () => {
    const container = createTestElement({
      tag: 'div',
      attrs: { 'aria-hidden': 'true' },
      styles: { display: 'block' }
    });
    const button = createTestElement({
      tag: 'button',
      text: 'Disabled button',
      attrs: { disabled: 'disabled' }
    });
    container.appendChild(button);
    return container;
  },

  ariaHiddenNonFocusable: () => {
    const container = createTestElement({
      tag: 'div',
      attrs: { 'aria-hidden': 'true' },
      text: 'Non-focusable content',
      styles: { display: 'block' }
    });
    return container;
  },

  // aria-allowed-role fixtures
  textInputWithButtonRole: () => createTestElement({
    tag: 'input',
    attrs: { type: 'text', role: 'button' }
  }),

  emailInputWithLinkRole: () => createTestElement({
    tag: 'input',
    attrs: { type: 'email', role: 'link' }
  }),

  // region-name fixtures
  regionWithoutName: () => createTestElement({
    tag: 'div',
    attrs: { role: 'region' },
    text: 'Region content without name',
    styles: { display: 'block' }
  }),

  regionWithAriaLabel: () => createTestElement({
    tag: 'div',
    attrs: { role: 'region', 'aria-label': 'Sidebar content' },
    text: 'Region with aria-label',
    styles: { display: 'block' }
  }),

  regionWithAriaLabelledby: () => {
    const heading = createTestElement({
      tag: 'h2',
      attrs: { id: 'region-heading' },
      text: 'Region Title'
    });
    const region = createTestElement({
      tag: 'div',
      attrs: { role: 'region', 'aria-labelledby': 'region-heading' },
      styles: { display: 'block' }
    });
    region.appendChild(heading);
    return region;
  },

  // iframe fixtures
  iframeWithoutTitle: () => createTestElement({
    tag: 'iframe',
    attrs: { src: 'about:blank' }
  }),

  iframeWithTitle: () => createTestElement({
    tag: 'iframe',
    attrs: { src: 'about:blank', title: 'Embedded content' }
  }),

  iframeWithEmptyTitle: () => createTestElement({
    tag: 'iframe',
    attrs: { src: 'about:blank', title: '' }
  }),

  // table fixtures
  tableWithoutCaption: () => {
    const table = createTestElement({ tag: 'table', styles: { display: 'table' } });
    const thead = createTestElement({ tag: 'thead' });
    const tr = createTestElement({ tag: 'tr' });
    const th = createTestElement({ tag: 'th', text: 'Name', attrs: { scope: 'col' } });
    tr.appendChild(th);
    thead.appendChild(tr);
    table.appendChild(thead);
    return table;
  },

  tableWithCaption: () => {
    const table = createTestElement({ tag: 'table', styles: { display: 'table' } });
    const caption = createTestElement({ tag: 'caption', text: 'User Information' });
    const thead = createTestElement({ tag: 'thead' });
    const tr = createTestElement({ tag: 'tr' });
    const th = createTestElement({ tag: 'th', text: 'Name', attrs: { scope: 'col' } });
    tr.appendChild(th);
    thead.appendChild(tr);
    table.appendChild(caption);
    table.appendChild(thead);
    return table;
  },

  layoutTable: () => {
    const table = createTestElement({ tag: 'table', attrs: { role: 'presentation' }, styles: { display: 'table' } });
    const tr = createTestElement({ tag: 'tr' });
    const td = createTestElement({ tag: 'td', text: 'Layout cell' });
    tr.appendChild(td);
    table.appendChild(tr);
    return table;
  },

  tableWithoutHeaderAssociation: () => {
    const table = createTestElement({ tag: 'table', styles: { display: 'table' } });

    // Header row
    const headerRow = createTestElement({ tag: 'tr' });
    const th = createTestElement({ tag: 'th', text: 'Name' }); // No scope attribute!
    headerRow.appendChild(th);

    // Data row
    const dataRow = createTestElement({ tag: 'tr' });
    const td = createTestElement({ tag: 'td', text: 'John' }); // Not associated with header
    dataRow.appendChild(td);

    table.appendChild(headerRow);
    table.appendChild(dataRow);
    return table;
  },

  tableWithHeadersAttribute: () => {
    const table = createTestElement({ tag: 'table', styles: { display: 'table' } });

    // Header row
    const headerRow = createTestElement({ tag: 'tr' });
    const th = createTestElement({ tag: 'th', text: 'Name', attrs: { id: 'name-header' } });
    headerRow.appendChild(th);

    // Data row with headers attribute
    const dataRow = createTestElement({ tag: 'tr' });
    const td = createTestElement({ tag: 'td', text: 'John', attrs: { headers: 'name-header' } });
    dataRow.appendChild(td);

    table.appendChild(headerRow);
    table.appendChild(dataRow);
    return table;
  },

  tableWithScope: () => {
    const table = createTestElement({ tag: 'table', styles: { display: 'table' } });

    // Header row with scope
    const headerRow = createTestElement({ tag: 'tr' });
    const th = createTestElement({ tag: 'th', text: 'Name', attrs: { scope: 'col' } });
    headerRow.appendChild(th);

    // Data row
    const dataRow = createTestElement({ tag: 'tr' });
    const td = createTestElement({ tag: 'td', text: 'John' });
    dataRow.appendChild(td);

    table.appendChild(headerRow);
    table.appendChild(dataRow);
    return table;
  },

  // ===== PHASE 6: INTERACTIVE/USABILITY RULES =====

  // skip-link fixtures
  pageWithoutSkipLink: () => {
    const nav = createTestElement({ tag: 'nav' });
    const link = createTestElement({
      tag: 'a',
      attrs: { href: '/about' },
      text: 'About'
    });
    nav.appendChild(link);
    return nav;
  },

  pageWithSkipLink: () => {
    const container = createTestElement({ tag: 'div', styles: { display: 'block' } });
    const skipLink = createTestElement({
      tag: 'a',
      attrs: { href: '#main', class: 'skip-link' },
      text: 'Skip to main content'
    });
    const main = createTestElement({
      tag: 'main',
      attrs: { id: 'main' },
      text: 'Main content here'
    });
    container.appendChild(skipLink);
    container.appendChild(main);
    return container;
  },

  skipLinkBrokenTarget: () => {
    const skipLink = createTestElement({
      tag: 'a',
      attrs: { href: '#nonexistent' },
      text: 'Skip to main content'
    });
    return skipLink;
  },

  // link-button-misuse fixtures
  linkWithOnclickNoHref: () => createTestElement({
    tag: 'a',
    attrs: { onclick: 'doSomething()' },
    text: 'Click me'
  }),

  linkWithHashHref: () => createTestElement({
    tag: 'a',
    attrs: { href: '#', onclick: 'doSomething()' },
    text: 'Click me'
  }),

  linkWithJavascriptHref: () => createTestElement({
    tag: 'a',
    attrs: { href: 'javascript:void(0)', onclick: 'doSomething()' },
    text: 'Click me'
  }),

  linkWithValidHref: () => createTestElement({
    tag: 'a',
    attrs: { href: '/page', onclick: 'track()' },
    text: 'Go to page'
  }),

  buttonWithOnclick: () => createTestElement({
    tag: 'button',
    attrs: { onclick: 'doSomething()' },
    text: 'Click me'
  }),

  // tabindex fixtures
  elementWithPositiveTabindex: (value = '1') => createTestElement({
    tag: 'div',
    attrs: { tabindex: value },
    text: 'Focusable with positive tabindex'
  }),

  elementWithZeroTabindex: () => createTestElement({
    tag: 'div',
    attrs: { tabindex: '0' },
    text: 'Focusable with tabindex 0'
  }),

  elementWithNegativeTabindex: () => createTestElement({
    tag: 'div',
    attrs: { tabindex: '-1' },
    text: 'Programmatically focusable'
  }),

  // fieldset-legend fixtures
  radioGroupWithoutFieldset: () => {
    const container = createTestElement({ tag: 'div', styles: { display: 'block' } });
    const radio1 = createTestElement({
      tag: 'input',
      attrs: { type: 'radio', name: 'color', value: 'red', id: 'red' }
    });
    const label1 = createTestElement({
      tag: 'label',
      attrs: { for: 'red' },
      text: 'Red'
    });
    const radio2 = createTestElement({
      tag: 'input',
      attrs: { type: 'radio', name: 'color', value: 'blue', id: 'blue' }
    });
    const label2 = createTestElement({
      tag: 'label',
      attrs: { for: 'blue' },
      text: 'Blue'
    });
    container.appendChild(radio1);
    container.appendChild(label1);
    container.appendChild(radio2);
    container.appendChild(label2);
    return container;
  },

  radioGroupWithFieldset: () => {
    const fieldset = createTestElement({ tag: 'fieldset', styles: { display: 'block' } });
    const legend = createTestElement({
      tag: 'legend',
      text: 'Choose a color'
    });
    const radio1 = createTestElement({
      tag: 'input',
      attrs: { type: 'radio', name: 'color', value: 'red', id: 'red2' }
    });
    const label1 = createTestElement({
      tag: 'label',
      attrs: { for: 'red2' },
      text: 'Red'
    });
    const radio2 = createTestElement({
      tag: 'input',
      attrs: { type: 'radio', name: 'color', value: 'blue', id: 'blue2' }
    });
    const label2 = createTestElement({
      tag: 'label',
      attrs: { for: 'blue2' },
      text: 'Blue'
    });
    fieldset.appendChild(legend);
    fieldset.appendChild(radio1);
    fieldset.appendChild(label1);
    fieldset.appendChild(radio2);
    fieldset.appendChild(label2);
    return fieldset;
  },

  fieldsetWithoutLegend: () => {
    const fieldset = createTestElement({ tag: 'fieldset', styles: { display: 'block' } });
    const radio = createTestElement({
      tag: 'input',
      attrs: { type: 'radio', name: 'option' }
    });
    fieldset.appendChild(radio);
    return fieldset;
  },

  singleRadio: () => {
    const container = createTestElement({ tag: 'div', styles: { display: 'block' } });
    const radio = createTestElement({
      tag: 'input',
      attrs: { type: 'radio', name: 'single', id: 'single' }
    });
    const label = createTestElement({
      tag: 'label',
      attrs: { for: 'single' },
      text: 'Single option'
    });
    container.appendChild(radio);
    container.appendChild(label);
    return container;
  },

  // autocomplete fixtures
  emailInputWithoutAutocomplete: () => createTestElement({
    tag: 'input',
    attrs: { type: 'email', name: 'email', id: 'user-email' }
  }),

  emailInputWithAutocomplete: () => createTestElement({
    tag: 'input',
    attrs: { type: 'email', name: 'email', autocomplete: 'email' }
  }),

  nameInputWithoutAutocomplete: () => createTestElement({
    tag: 'input',
    attrs: { type: 'text', name: 'fullname', id: 'user-name' }
  }),

  phoneInputWithoutAutocomplete: () => createTestElement({
    tag: 'input',
    attrs: { type: 'tel', name: 'phone', id: 'user-phone' }
  }),

  searchInputWithoutAutocomplete: () => createTestElement({
    tag: 'input',
    attrs: { type: 'text', name: 'search', placeholder: 'Search...' }
  }),

  // ===== MEDIA FIXTURES (Wave 1) =====

  videoWithoutCaptions: () => {
    const video = createTestElement({
      tag: 'video',
      attrs: { src: 'video.mp4', controls: 'true' },
      styles: { display: 'block', width: '320px', height: '240px' }
    });
    return video;
  },

  videoWithCaptions: () => {
    const video = createTestElement({
      tag: 'video',
      attrs: { src: 'video.mp4', controls: 'true' },
      styles: { display: 'block', width: '320px', height: '240px' }
    });
    const track = createTestElement({
      tag: 'track',
      attrs: { kind: 'captions', src: 'captions.vtt', srclang: 'en', label: 'English' }
    });
    video.appendChild(track);
    return video;
  },

  videoWithSubtitles: () => {
    const video = createTestElement({
      tag: 'video',
      attrs: { src: 'video.mp4', controls: 'true' },
      styles: { display: 'block', width: '320px', height: '240px' }
    });
    const track = createTestElement({
      tag: 'track',
      attrs: { kind: 'subtitles', src: 'subtitles.vtt', srclang: 'en', label: 'English' }
    });
    video.appendChild(track);
    return video;
  },

  videoWithDescriptionsOnly: () => {
    const video = createTestElement({
      tag: 'video',
      attrs: { src: 'video.mp4', controls: 'true' },
      styles: { display: 'block', width: '320px', height: '240px' }
    });
    const track = createTestElement({
      tag: 'track',
      attrs: { kind: 'descriptions', src: 'descriptions.vtt', srclang: 'en', label: 'English' }
    });
    video.appendChild(track);
    return video;
  },

  videoWithMultipleTracks: () => {
    const video = createTestElement({
      tag: 'video',
      attrs: { src: 'video.mp4', controls: 'true' },
      styles: { display: 'block', width: '320px', height: '240px' }
    });
    const captionsTrack = createTestElement({
      tag: 'track',
      attrs: { kind: 'captions', src: 'captions-en.vtt', srclang: 'en', label: 'English Captions' }
    });
    const descriptionsTrack = createTestElement({
      tag: 'track',
      attrs: { kind: 'descriptions', src: 'descriptions-en.vtt', srclang: 'en', label: 'English Descriptions' }
    });
    video.appendChild(captionsTrack);
    video.appendChild(descriptionsTrack);
    return video;
  },

  hiddenVideo: () => createTestElement({
    tag: 'video',
    attrs: { src: 'video.mp4', controls: 'true' },
    styles: { display: 'none' }
  }),

  audioWithoutTranscript: () => createTestElement({
    tag: 'audio',
    attrs: { src: 'audio.mp3', controls: 'true' },
    styles: { display: 'block' }
  }),

  audioWithAriaDescribedby: () => createTestElement({
    tag: 'audio',
    attrs: { src: 'audio.mp3', controls: 'true', 'aria-describedby': 'transcript-1' },
    styles: { display: 'block' }
  }),

  audioWithTranscriptLink: () => {
    const container = createTestElement({
      tag: 'div',
      styles: { display: 'block' }
    });
    const audio = createTestElement({
      tag: 'audio',
      attrs: { src: 'audio.mp3', controls: 'true' },
      styles: { display: 'block' }
    });
    const link = createTestElement({
      tag: 'a',
      attrs: { href: '#transcript' },
      text: 'View Transcript'
    });
    container.appendChild(audio);
    container.appendChild(link);
    return container;
  },

  audioWithTranscriptText: () => {
    const container = createTestElement({
      tag: 'div',
      styles: { display: 'block' }
    });
    const audio = createTestElement({
      tag: 'audio',
      attrs: { src: 'audio.mp3', controls: 'true' },
      styles: { display: 'block' }
    });
    const transcriptSection = createTestElement({
      tag: 'section',
      text: 'Full transcript available below'
    });
    container.appendChild(audio);
    container.appendChild(transcriptSection);
    return container;
  },

  multipleAudioWithTranscript: () => {
    const container = createTestElement({
      tag: 'div',
      styles: { display: 'block' }
    });
    const audio1 = createTestElement({
      tag: 'audio',
      attrs: { src: 'audio1.mp3', controls: 'true' },
      styles: { display: 'block' }
    });
    const audio2 = createTestElement({
      tag: 'audio',
      attrs: { src: 'audio2.mp3', controls: 'true' },
      styles: { display: 'block', marginTop: '10px' }
    });
    const transcriptDiv = createTestElement({
      tag: 'div',
      text: 'Transcripts for all audio files'
    });
    container.appendChild(audio1);
    container.appendChild(audio2);
    container.appendChild(transcriptDiv);
    return container;
  },

  audioWithScriptText: () => {
    const container = createTestElement({
      tag: 'div',
      styles: { display: 'block' }
    });
    const audio = createTestElement({
      tag: 'audio',
      attrs: { src: 'audio.mp3', controls: 'true' },
      styles: { display: 'block' }
    });
    const text = createTestElement({
      tag: 'div',
      text: 'Script and dialogue information'
    });
    container.appendChild(audio);
    container.appendChild(text);
    return container;
  },

  hiddenAudio: () => createTestElement({
    tag: 'audio',
    attrs: { src: 'audio.mp3', controls: 'true' },
    styles: { display: 'none' }
  }),

  // ===== INTERACTIVE CORE FIXTURES (Wave 2) =====

  // Target Size Fixtures
  smallButton: (width = 24, height = 24) => createTestElement({
    tag: 'button',
    text: 'OK',
    styles: {
      width: `${width}px`,
      height: `${height}px`,
      padding: '0',
      margin: '0',
      border: '1px solid black',
      display: 'inline-block'
    }
  }),

  tinyLink: () => createTestElement({
    tag: 'a',
    attrs: { href: '#' },
    text: 'Go',
    styles: {
      width: '20px',
      height: '20px',
      display: 'inline-block',
      overflow: 'hidden',
      padding: '0',
      margin: '0'
    }
  }),

  linkWithoutHref: () => createTestElement({
    tag: 'a',
    text: 'Not a link',
    styles: {
      width: '20px',
      height: '20px',
      display: 'inline-block'
    }
  }),

  largeButton: () => createTestElement({
    tag: 'button',
    text: 'Large Button',
    styles: {
      width: '50px',
      height: '50px',
      padding: '0',
      display: 'inline-block'
    }
  }),

  interactiveRole: (role = 'button', width = 24, height = 24) => createTestElement({
    tag: 'div',
    attrs: { role, tabindex: '0' },
    text: 'Interactive',
    styles: {
      width: `${width}px`,
      height: `${height}px`,
      display: 'inline-block',
      padding: '0',
      margin: '0'
    }
  }),

  disabledSmallButton: () => createTestElement({
    tag: 'button',
    attrs: { disabled: 'true' },
    text: 'Disabled',
    styles: {
      width: '20px',
      height: '20px',
      padding: '0',
      display: 'inline-block'
    }
  }),

  smallInput: () => createTestElement({
    tag: 'input',
    attrs: { type: 'text', value: 'Input' },
    styles: {
      width: '30px',
      height: '25px',
      padding: '0',
      margin: '0',
      display: 'block'
    }
  }),

  inlineInteractiveElement: () => createTestElement({
    tag: 'span',
    attrs: { role: 'button', tabindex: '0' },
    text: 'Click',
    styles: {
      width: '23px',
      height: '24px',
      display: 'inline'
    }
  }),

  svgInteractiveElement: () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '24');
    svg.setAttribute('height', '24');
    svg.setAttribute('role', 'button');
    svg.setAttribute('tabindex', '0');
    svg.style.display = 'block';
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('width', '24');
    rect.setAttribute('height', '24');
    rect.setAttribute('fill', 'blue');
    svg.appendChild(rect);
    return svg;
  },

  // Link in Text Block Fixtures
  textBlockWithUnderlinedLink: () => {
    const p = createTestElement({
      tag: 'p',
      styles: { color: 'rgb(0, 0, 0)', fontSize: '16px', lineHeight: '1.5' }
    });
    const text1 = document.createTextNode('This is some text with an ');
    const link = createTestElement({
      tag: 'a',
      attrs: { href: '#' },
      text: 'underlined link',
      styles: { color: 'rgb(0, 0, 255)', textDecorationLine: 'underline' }
    });
    const text2 = document.createTextNode(' in the middle.');
    p.appendChild(text1);
    p.appendChild(link);
    p.appendChild(text2);
    return p;
  },

  textBlockWithBorderedLink: () => {
    const p = createTestElement({
      tag: 'p',
      styles: { color: 'rgb(0, 0, 0)', fontSize: '16px', lineHeight: '1.5' }
    });
    const text1 = document.createTextNode('This is some text with a ');
    const link = createTestElement({
      tag: 'a',
      attrs: { href: '#' },
      text: 'bordered link',
      styles: { color: 'rgb(0, 0, 255)', textDecorationLine: 'none', borderBottom: '1px solid blue' }
    });
    const text2 = document.createTextNode(' in the middle.');
    p.appendChild(text1);
    p.appendChild(link);
    p.appendChild(text2);
    return p;
  },

  textBlockWithContrastLink: (linkColor = 'rgb(0, 0, 255)') => {
    const p = createTestElement({
      tag: 'p',
      styles: { color: 'rgb(0, 0, 0)', fontSize: '16px', lineHeight: '1.5' }
    });
    const text1 = document.createTextNode('This is some text with a ');
    const link = createTestElement({
      tag: 'a',
      attrs: { href: '#' },
      text: 'link with color contrast',
      styles: { color: linkColor, textDecorationLine: 'none' }
    });
    const text2 = document.createTextNode(' in the middle.');
    p.appendChild(text1);
    p.appendChild(link);
    p.appendChild(text2);
    return p;
  },

  textBlockWithPlainLink: () => {
    const p = createTestElement({
      tag: 'p',
      styles: { color: 'rgb(0, 0, 0)', fontSize: '16px', lineHeight: '1.5' }
    });
    const text1 = document.createTextNode('This is some text with a ');
    const link = createTestElement({
      tag: 'a',
      attrs: { href: '#' },
      text: 'plain link',
      styles: { color: 'rgb(0, 0, 0)', textDecorationLine: 'none' }
    });
    const text2 = document.createTextNode(' that looks the same.');
    p.appendChild(text1);
    p.appendChild(link);
    p.appendChild(text2);
    return p;
  },

  linkInNavigation: () => {
    const nav = createTestElement({
      tag: 'nav',
      styles: { display: 'block' }
    });
    const link = createTestElement({
      tag: 'a',
      attrs: { href: '#' },
      text: 'Nav Link',
      styles: { color: 'rgb(0, 0, 0)', textDecorationLine: 'none' }
    });
    nav.appendChild(link);
    return nav;
  },

  nestedTextLink: () => {
    const p = createTestElement({
      tag: 'p',
      styles: { color: 'rgb(0, 0, 0)', fontSize: '16px', lineHeight: '1.5' }
    });
    const span = createTestElement({
      tag: 'span',
      styles: { color: 'rgb(0, 0, 0)' }
    });
    const text1 = document.createTextNode('Text with ');
    const link = createTestElement({
      tag: 'a',
      attrs: { href: '#' },
      text: 'nested link',
      styles: { color: 'rgb(0, 0, 255)', textDecorationLine: 'underline' }
    });
    const text2 = document.createTextNode(' in span.');
    span.appendChild(text1);
    span.appendChild(link);
    span.appendChild(text2);
    p.appendChild(span);
    return p;
  },

  textBlockWithBoldLink: () => {
    const p = createTestElement({
      tag: 'p',
      styles: { color: 'rgb(0, 0, 0)', fontSize: '16px', lineHeight: '1.5', fontWeight: 'normal' }
    });
    const text1 = document.createTextNode('This is some text with a ');
    const link = createTestElement({
      tag: 'a',
      attrs: { href: '#' },
      text: 'bold link',
      styles: { color: 'rgb(0, 0, 0)', textDecorationLine: 'none', fontWeight: 'bold' }
    });
    const text2 = document.createTextNode(' with only weight difference.');
    p.appendChild(text1);
    p.appendChild(link);
    p.appendChild(text2);
    return p;
  },

  textBlockWithOutlineLink: () => {
    const p = createTestElement({
      tag: 'p',
      styles: { color: 'rgb(0, 0, 0)', fontSize: '16px', lineHeight: '1.5' }
    });
    const text1 = document.createTextNode('This is some text with an ');
    const link = createTestElement({
      tag: 'a',
      attrs: { href: '#' },
      text: 'outlined link',
      styles: { color: 'rgb(0, 0, 0)', textDecorationLine: 'none', outline: '1px solid blue' }
    });
    const text2 = document.createTextNode(' in the middle.');
    p.appendChild(text1);
    p.appendChild(link);
    p.appendChild(text2);
    return p;
  }
};

module.exports = {
  createTestElement,
  fixtures
};
