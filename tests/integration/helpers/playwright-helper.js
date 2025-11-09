const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

/**
 * Playwright Helper for AccessInsight Integration Testing
 * Provides browser automation for scanning real websites
 */
class PlaywrightHelper {
  constructor(options = {}) {
    this.browser = null;
    this.context = null;
    this.options = {
      headless: options.headless !== false, // Default true
      verbose: options.verbose || false,
      timeout: options.timeout || 30000
    };
  }

  /**
   * Initialize browser instance
   */
  async init() {
    if (this.options.verbose) {
      console.log('Initializing Playwright browser...');
    }

    this.browser = await chromium.launch({
      headless: this.options.headless,
      args: [
        '--disable-web-security', // For CORS during testing
        '--disable-blink-features=AutomationControlled',
        '--no-sandbox', // Required for container environments
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage' // Overcome limited resource problems
      ]
    });

    this.context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'AccessInsight-Testing/1.0 (Playwright)',
      ignoreHTTPSErrors: true // Allow testing sites with cert issues
    });

    if (this.options.verbose) {
      console.log('✅ Browser initialized');
    }
  }

  /**
   * Scan a website with AccessInsight engine
   * @param {string} url - URL to scan
   * @param {object} options - Scan options
   * @returns {object} Scan results
   */
  async scanWebsite(url, options = {}) {
    if (!this.context) {
      throw new Error('Browser not initialized. Call init() first.');
    }

    const page = await this.context.newPage();

    try {
      if (this.options.verbose) {
        console.log(`  Navigating to: ${url}`);
      }

      // Navigate to page with timeout
      await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: this.options.timeout
      });

      // Wait for page to stabilize (dynamic content)
      await page.waitForTimeout(2000);

      if (this.options.verbose) {
        console.log(`  Page loaded, injecting engine...`);
      }

      // Inject AccessInsight engine
      const enginePath = path.join(__dirname, '../../../engine.js');
      const engineCode = await fs.readFile(enginePath, 'utf8');
      await page.addScriptTag({ content: engineCode });

      if (this.options.verbose) {
        console.log(`  Running accessibility scan...`);
      }

      // Run scan and collect results
      const result = await page.evaluate((opts) => {
        const startTime = performance.now();

        try {
          // Check if engine loaded
          if (!window.__a11yEngine) {
            throw new Error('AccessInsight engine not loaded');
          }

          // Run engine with specified rules (or all)
          const findings = window.__a11yEngine.run(opts.rules);

          const endTime = performance.now();

          return {
            success: true,
            findings: findings,
            scanTime: endTime - startTime,
            elementCount: document.querySelectorAll('*').length,
            url: window.location.href,
            title: document.title,
            viewport: {
              width: window.innerWidth,
              height: window.innerHeight
            },
            timestamp: new Date().toISOString()
          };
        } catch (error) {
          return {
            success: false,
            error: error.message,
            url: window.location.href,
            timestamp: new Date().toISOString()
          };
        }
      }, options);

      if (!result.success) {
        throw new Error(result.error);
      }

      if (this.options.verbose) {
        console.log(`  ✅ Scan complete: ${result.findings.length} findings in ${Math.round(result.scanTime)}ms`);
      }

      return result;

    } catch (error) {
      if (this.options.verbose) {
        console.error(`  ❌ Error scanning ${url}:`, error.message);
      }

      return {
        success: false,
        error: error.message,
        url: url,
        timestamp: new Date().toISOString()
      };
    } finally {
      await page.close();
    }
  }

  /**
   * Scan website with axe-core for baseline comparison
   * @param {string} url - URL to scan
   * @returns {object} axe-core results
   */
  async scanWithAxe(url) {
    if (!this.context) {
      throw new Error('Browser not initialized. Call init() first.');
    }

    const page = await this.context.newPage();

    try {
      if (this.options.verbose) {
        console.log(`  Running axe-core on: ${url}`);
      }

      await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: this.options.timeout
      });

      await page.waitForTimeout(2000);

      // Inject axe-core from CDN
      await page.addScriptTag({
        url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.8.2/axe.min.js'
      });

      // Run axe
      const results = await page.evaluate(() => {
        return axe.run();
      });

      if (this.options.verbose) {
        const totalIssues = results.violations.reduce((sum, v) => sum + v.nodes.length, 0);
        console.log(`  ✅ axe-core: ${results.violations.length} violation types, ${totalIssues} total issues`);
      }

      return {
        success: true,
        results: results,
        url: url,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      if (this.options.verbose) {
        console.error(`  ❌ Error running axe on ${url}:`, error.message);
      }

      return {
        success: false,
        error: error.message,
        url: url,
        timestamp: new Date().toISOString()
      };
    } finally {
      await page.close();
    }
  }

  /**
   * Take screenshot for debugging
   * @param {string} url - URL to screenshot
   * @param {string} outputPath - Where to save screenshot
   */
  async screenshot(url, outputPath) {
    if (!this.context) {
      throw new Error('Browser not initialized. Call init() first.');
    }

    const page = await this.context.newPage();

    try {
      await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: this.options.timeout
      });

      await page.waitForTimeout(1000);

      // Ensure output directory exists
      await fs.mkdir(path.dirname(outputPath), { recursive: true });

      await page.screenshot({
        path: outputPath,
        fullPage: true
      });

      if (this.options.verbose) {
        console.log(`  ✅ Screenshot saved: ${outputPath}`);
      }

      return { success: true, path: outputPath };

    } catch (error) {
      if (this.options.verbose) {
        console.error(`  ❌ Screenshot error:`, error.message);
      }

      return { success: false, error: error.message };
    } finally {
      await page.close();
    }
  }

  /**
   * Get page metadata
   * @param {string} url - URL to analyze
   * @returns {object} Page metadata
   */
  async getPageMetadata(url) {
    if (!this.context) {
      throw new Error('Browser not initialized. Call init() first.');
    }

    const page = await this.context.newPage();

    try {
      await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: this.options.timeout
      });

      const metadata = await page.evaluate(() => {
        return {
          title: document.title,
          url: window.location.href,
          elementCount: document.querySelectorAll('*').length,
          imageCount: document.querySelectorAll('img').length,
          linkCount: document.querySelectorAll('a').length,
          formCount: document.querySelectorAll('form').length,
          buttonCount: document.querySelectorAll('button, [role="button"]').length,
          headingCount: document.querySelectorAll('h1, h2, h3, h4, h5, h6').length,
          landmarkCount: document.querySelectorAll('header, nav, main, aside, footer, [role]').length,
          hasMain: !!document.querySelector('main, [role="main"]'),
          hasNav: !!document.querySelector('nav, [role="navigation"]'),
          lang: document.documentElement.lang,
          charset: document.characterSet
        };
      });

      return { success: true, metadata };

    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      await page.close();
    }
  }

  /**
   * Cleanup browser resources
   */
  async close() {
    if (this.browser) {
      if (this.options.verbose) {
        console.log('Closing browser...');
      }
      await this.browser.close();
      this.browser = null;
      this.context = null;
    }
  }
}

module.exports = PlaywrightHelper;
