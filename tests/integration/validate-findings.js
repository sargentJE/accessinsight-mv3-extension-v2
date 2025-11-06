#!/usr/bin/env node

/**
 * Manual Validation Helper
 * Interactive tool to help validate AccessInsight findings
 */

const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');
const { safePrecision } = require('./helpers/safe-math');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

class ValidationHelper {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this.findings = [];
    this.currentIndex = 0;
    this.validationData = [];
  }

  /**
   * Load findings from batch results
   */
  async loadFindings(filePath) {
    console.log(`${colors.cyan}📥 Loading findings...${colors.reset}`);
    const data = JSON.parse(await fs.readFile(filePath, 'utf8'));

    // Extract findings with metadata
    data.results.forEach(result => {
      result.findings.forEach((finding, index) => {
        this.findings.push({
          finding_id: `${result.siteName}-${finding.rule}-${index}`,
          site_name: result.siteName,
          rule: finding.rule,
          selector: finding.selector || 'N/A',
          message: finding.message,
          confidence: finding.confidence,
          wcag: finding.wcag?.join(', ') || 'N/A',
          classification: '',
          notes: ''
        });
      });
    });

    console.log(`${colors.green}   ✅ Loaded ${this.findings.length} findings${colors.reset}\n`);
  }

  /**
   * Load existing validation data if present
   */
  async loadExistingValidation(filePath) {
    try {
      const csv = await fs.readFile(filePath, 'utf8');
      const lines = csv.split('\n').slice(1); // Skip header

      const validated = new Map();
      lines.forEach(line => {
        if (!line.trim()) return;

        const parts = this.parseCSVLine(line);
        if (parts.length >= 8) {
          validated.set(parts[0], {
            classification: parts[6],
            notes: parts[7] || ''
          });
        }
      });

      // Merge with findings
      this.findings.forEach(finding => {
        if (validated.has(finding.finding_id)) {
          const val = validated.get(finding.finding_id);
          finding.classification = val.classification;
          finding.notes = val.notes;
        }
      });

      const validatedCount = Array.from(validated.values())
        .filter(v => v.classification && v.classification !== '').length;

      console.log(`${colors.green}   ✅ Loaded ${validatedCount} existing validations${colors.reset}\n`);
    } catch (error) {
      // File doesn't exist yet, that's okay
    }
  }

  /**
   * Parse CSV line handling quoted fields (RFC 4180 compliant)
   * Properly handles double-quote escaping ("") instead of backslash escaping
   */
  parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
          // Escaped quote ("") - add single quote to current field
          current += '"';
          i += 2;  // Skip both quotes
          continue;
        } else {
          // Toggle quote mode
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // Field separator
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
      i++;
    }

    result.push(current.trim());
    return result;
  }

  /**
   * Display current finding
   */
  displayFinding(finding) {
    const progress = `${this.currentIndex + 1}/${this.findings.length}`;
    const percentage = Math.round(((this.currentIndex + 1) / this.findings.length) * 100);

    console.clear();
    console.log('='.repeat(80));
    console.log(`${colors.bright}Manual Validation Helper${colors.reset} - Progress: ${progress} (${percentage}%)`);
    console.log('='.repeat(80));
    console.log('');

    console.log(`${colors.cyan}Site:${colors.reset} ${finding.site_name}`);
    console.log(`${colors.cyan}Rule:${colors.reset} ${finding.rule}`);
    console.log(`${colors.cyan}Message:${colors.reset} ${finding.message}`);
    console.log(`${colors.cyan}Selector:${colors.reset} ${finding.selector}`);
    console.log(`${colors.cyan}Confidence:${colors.reset} ${(finding.confidence * 100).toFixed(0)}%`);
    console.log(`${colors.cyan}WCAG:${colors.reset} ${finding.wcag}`);
    console.log('');

    if (finding.classification) {
      const status = this.getClassificationDisplay(finding.classification);
      console.log(`${colors.yellow}Current Classification:${colors.reset} ${status}`);
      if (finding.notes) {
        console.log(`${colors.yellow}Notes:${colors.reset} ${finding.notes}`);
      }
      console.log('');
    }

    console.log(`${colors.dim}───────────────────────────────────────────────────────────────────────────────${colors.reset}`);
    console.log(`${colors.bright}Commands:${colors.reset}`);
    console.log(`  ${colors.green}t${colors.reset} - True Positive (real issue)`);
    console.log(`  ${colors.red}f${colors.reset} - False Positive (incorrect)`);
    console.log(`  ${colors.yellow}n${colors.reset} - Needs Review (uncertain)`);
    console.log(`  ${colors.blue}s${colors.reset} - Skip (come back later)`);
    console.log(`  ${colors.magenta}p${colors.reset} - Previous finding`);
    console.log(`  ${colors.cyan}q${colors.reset} - Quit and save`);
    console.log(`  ${colors.cyan}h${colors.reset} - Show help`);
    console.log(`${colors.dim}───────────────────────────────────────────────────────────────────────────────${colors.reset}`);
  }

  /**
   * Get display string for classification
   */
  getClassificationDisplay(classification) {
    switch (classification) {
      case 'true_positive':
        return `${colors.green}✓ True Positive${colors.reset}`;
      case 'false_positive':
        return `${colors.red}✗ False Positive${colors.reset}`;
      case 'needs_review':
        return `${colors.yellow}? Needs Review${colors.reset}`;
      default:
        return `${colors.dim}Not classified${colors.reset}`;
    }
  }

  /**
   * Show help screen
   */
  async showHelp() {
    console.clear();
    console.log('='.repeat(80));
    console.log(`${colors.bright}Manual Validation Guide${colors.reset}`);
    console.log('='.repeat(80));
    console.log('');
    console.log(`${colors.green}True Positive (t):${colors.reset}`);
    console.log('  - The finding correctly identifies an actual accessibility issue');
    console.log('  - The element truly violates WCAG criteria');
    console.log('  - A user with a disability would encounter problems');
    console.log('');
    console.log(`${colors.red}False Positive (f):${colors.reset}`);
    console.log('  - The finding is incorrect - no actual issue exists');
    console.log('  - The element is actually accessible');
    console.log('  - The rule misunderstood the element\'s purpose');
    console.log('');
    console.log(`${colors.yellow}Needs Review (n):${colors.reset}`);
    console.log('  - Uncertain classification requiring expert judgment');
    console.log('  - Need additional context or testing');
    console.log('  - Edge case or ambiguous WCAG interpretation');
    console.log('');
    console.log(`${colors.cyan}Common False Positive Patterns:${colors.reset}`);
    console.log('  - Decorative images with alt="" (correct!)');
    console.log('  - Elements with aria-label providing accessible name');
    console.log('  - Navigation links flagged for text block contrast');
    console.log('  - Hidden elements with style="display:none"');
    console.log('');
    console.log(`${colors.cyan}Tips:${colors.reset}`);
    console.log('  - Consider: Would a screen reader user understand this?');
    console.log('  - Check for ARIA attributes (aria-label, aria-labelledby)');
    console.log('  - Context matters: Is this decorative or informative?');
    console.log('  - When in doubt, mark as "needs review" and add notes');
    console.log('');
    console.log(`${colors.dim}See MANUAL_VALIDATION_GUIDE.md for detailed guidance${colors.reset}`);
    console.log('');
    await this.question('Press Enter to continue...');
  }

  /**
   * Prompt for input
   */
  question(prompt) {
    return new Promise(resolve => {
      this.rl.question(prompt, resolve);
    });
  }

  /**
   * Validate current finding
   */
  async validateFinding(finding) {
    while (true) {
      this.displayFinding(finding);

      const answer = await this.question(`\n${colors.bright}Your choice:${colors.reset} `);
      const cmd = answer.toLowerCase().trim();

      if (cmd === 't' || cmd === 'tp' || cmd === 'true') {
        finding.classification = 'true_positive';
        const notes = await this.question(`${colors.dim}Notes (optional):${colors.reset} `);
        if (notes.trim()) finding.notes = notes.trim();
        return true;
      } else if (cmd === 'f' || cmd === 'fp' || cmd === 'false') {
        finding.classification = 'false_positive';
        const notes = await this.question(`${colors.dim}Notes (optional):${colors.reset} `);
        if (notes.trim()) finding.notes = notes.trim();
        return true;
      } else if (cmd === 'n' || cmd === 'nr' || cmd === 'needs') {
        finding.classification = 'needs_review';
        const notes = await this.question(`${colors.dim}Notes (optional):${colors.reset} `);
        if (notes.trim()) finding.notes = notes.trim();
        return true;
      } else if (cmd === 's' || cmd === 'skip') {
        return true; // Move to next without classification
      } else if (cmd === 'p' || cmd === 'prev' || cmd === 'back') {
        return 'previous';
      } else if (cmd === 'q' || cmd === 'quit' || cmd === 'exit') {
        return 'quit';
      } else if (cmd === 'h' || cmd === 'help' || cmd === '?') {
        await this.showHelp();
      } else {
        console.log(`${colors.red}Invalid command. Type 'h' for help.${colors.reset}`);
        await this.question('Press Enter to continue...');
      }
    }
  }

  /**
   * Run validation session
   */
  async run() {
    console.log(`${colors.bright}Starting validation session...${colors.reset}\n`);

    // Find first unvalidated finding
    let firstUnvalidated = this.findings.findIndex(f => !f.classification || f.classification === '');
    if (firstUnvalidated !== -1) {
      this.currentIndex = firstUnvalidated;
      console.log(`${colors.green}Resuming from finding ${this.currentIndex + 1}${colors.reset}\n`);
    }

    await this.question('Press Enter to start...');

    while (this.currentIndex < this.findings.length) {
      const finding = this.findings[this.currentIndex];
      const result = await this.validateFinding(finding);

      if (result === 'quit') {
        break;
      } else if (result === 'previous') {
        if (this.currentIndex > 0) {
          this.currentIndex--;
        }
      } else {
        this.currentIndex++;
      }
    }

    await this.save();
    await this.showStatistics();

    this.rl.close();
  }

  /**
   * Save validation data to CSV
   */
  async save() {
    console.log(`\n${colors.cyan}💾 Saving validation data...${colors.reset}`);

    const outputDir = path.join(__dirname, 'results');
    const outputPath = path.join(outputDir, 'manual-validation-completed.csv');

    // Generate CSV
    const lines = [];
    lines.push('finding_id,site_name,rule,selector,message,confidence,classification,notes');

    this.findings.forEach(finding => {
      const escapeCsv = (str) => {
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      lines.push([
        escapeCsv(finding.finding_id),
        escapeCsv(finding.site_name),
        escapeCsv(finding.rule),
        escapeCsv(finding.selector),
        escapeCsv(finding.message),
        finding.confidence,
        finding.classification || '',
        escapeCsv(finding.notes || '')
      ].join(','));
    });

    await fs.writeFile(outputPath, lines.join('\n'), 'utf8');
    console.log(`${colors.green}   ✅ Saved to: ${outputPath}${colors.reset}`);
  }

  /**
   * Show validation statistics
   */
  async showStatistics() {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`${colors.bright}Validation Statistics${colors.reset}`);
    console.log('='.repeat(80));

    const total = this.findings.length;
    const validated = this.findings.filter(f => f.classification && f.classification !== '').length;
    const truePositives = this.findings.filter(f => f.classification === 'true_positive').length;
    const falsePositives = this.findings.filter(f => f.classification === 'false_positive').length;
    const needsReview = this.findings.filter(f => f.classification === 'needs_review').length;
    const unvalidated = total - validated;

    console.log('');
    console.log(`${colors.cyan}Total Findings:${colors.reset} ${total}`);
    console.log(`${colors.green}Validated:${colors.reset} ${validated} (${((validated / total) * 100).toFixed(1)}%)`);
    console.log(`${colors.dim}Unvalidated:${colors.reset} ${unvalidated} (${((unvalidated / total) * 100).toFixed(1)}%)`);
    console.log('');

    if (validated > 0) {
      console.log(`${colors.bright}Classifications:${colors.reset}`);
      console.log(`  ${colors.green}True Positives:${colors.reset} ${truePositives} (${((truePositives / validated) * 100).toFixed(1)}%)`);
      console.log(`  ${colors.red}False Positives:${colors.reset} ${falsePositives} (${((falsePositives / validated) * 100).toFixed(1)}%)`);
      console.log(`  ${colors.yellow}Needs Review:${colors.reset} ${needsReview} (${((needsReview / validated) * 100).toFixed(1)}%)`);
      console.log('');

      if (validated >= 50) {
        const denominator = truePositives + falsePositives;
        if (denominator > 0) {
          const precision = safePrecision(truePositives, falsePositives);
          console.log(`${colors.bright}Estimated Precision:${colors.reset} ${(precision * 100).toFixed(1)}%`);
        } else {
          console.log(`${colors.yellow}Cannot calculate precision: no TP/FP classifications yet${colors.reset}`);
        }
        console.log('');
      }
    }

    if (validated < 50) {
      console.log(`${colors.yellow}⚠️  Warning: Sample size < 50. Need ${50 - validated} more for statistical significance.${colors.reset}`);
      console.log('');
    } else if (validated < 100) {
      console.log(`${colors.cyan}ℹ️  Good progress! ${100 - validated} more validations recommended for higher confidence.${colors.reset}`);
      console.log('');
    } else {
      console.log(`${colors.green}✅ Excellent sample size! Ready for analysis.${colors.reset}`);
      console.log('');
    }

    console.log(`${colors.dim}Next steps:${colors.reset}`);
    console.log(`  1. Review your validation data: cat results/manual-validation-completed.csv`);
    console.log(`  2. Run analysis: node calculate-metrics.js --validation manual-validation-completed.csv`);
    console.log(`  3. View report: node generate-report.js --format markdown`);
    console.log('');
  }
}

// CLI
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
${colors.bright}Manual Validation Helper${colors.reset}

Interactive tool to validate AccessInsight findings.

${colors.bright}Usage:${colors.reset}
  node validate-findings.js [options]

${colors.bright}Options:${colors.reset}
  --batch FILE          Batch scan results file (default: mock-batch-scan.json)
  --resume              Resume existing validation session
  --help, -h            Show this help message

${colors.bright}Examples:${colors.reset}
  # Start new validation session
  node validate-findings.js

  # Resume existing session
  node validate-findings.js --resume

  # Validate specific batch
  node validate-findings.js --batch real-scan-results.json

${colors.bright}Interactive Commands:${colors.reset}
  t  - True Positive (real accessibility issue)
  f  - False Positive (incorrect finding)
  n  - Needs Review (uncertain, requires expert judgment)
  s  - Skip (come back to this later)
  p  - Previous (go back to previous finding)
  h  - Help (show detailed guidance)
  q  - Quit and save

${colors.bright}Tips:${colors.reset}
  - Read MANUAL_VALIDATION_GUIDE.md for detailed guidance
  - Aim for 50-100 validated findings minimum
  - Add notes to explain uncertain classifications
  - Take breaks every 20-30 findings to stay focused
  - Save frequently by quitting (q) and resuming later

${colors.bright}See Also:${colors.reset}
  - MANUAL_VALIDATION_GUIDE.md - Detailed validation guidance
  - PIPELINE_USAGE_GUIDE.md - Full pipeline documentation
    `);
    process.exit(0);
  }

  const batchFile = args.find((arg, i) => args[i - 1] === '--batch') || 'mock-batch-scan.json';
  const resume = args.includes('--resume');

  const helper = new ValidationHelper();

  const outputDir = path.join(__dirname, 'results');
  const batchPath = path.join(outputDir, batchFile);

  try {
    await helper.loadFindings(batchPath);

    if (resume) {
      const validationPath = path.join(outputDir, 'manual-validation-completed.csv');
      await helper.loadExistingValidation(validationPath);
    }

    await helper.run();

    console.log(`${colors.green}✅ Validation session complete!${colors.reset}\n`);
    process.exit(0);
  } catch (error) {
    console.error(`${colors.red}❌ Error:${colors.reset}`, error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = ValidationHelper;
