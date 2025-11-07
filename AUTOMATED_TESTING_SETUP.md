# Automated Testing Environment Setup Guide

## Overview

This guide provides multiple approaches to set up an automated testing environment for running browser-based integration tests. The Playwright framework is already built and ready - you just need an environment that can run browsers.

---

## Quick Decision Matrix

**Choose your approach:**

- **Local Machine** → Fastest, easiest, best for one-time validation
- **GitHub Actions** → Best for CI/CD, automated testing on every push
- **Docker** → Best for reproducible environments, team consistency
- **Cloud Service** → Best for scale, parallel testing, no local setup

---

## Approach 1: Local Machine ⭐ RECOMMENDED

**Setup Time**: 5-10 minutes
**Cost**: Free
**Best For**: Quick validation, development

### Prerequisites
- Node.js 18+ ([download](https://nodejs.org/))
- Git
- Chrome/Chromium browser (Playwright will install if missing)

### Setup

**1. Clone and setup**
```bash
# Clone repository
git clone https://github.com/sargentJE/accessinsight-mv3-extension-v2.git
cd accessinsight-mv3-extension-v2

# Checkout test branch
git checkout claude/test-aria-rules-phase-4-011CUq3zzD76mLZzj6aKHVc1

# Install dependencies
npm install
```

**2. Install Playwright browsers**
```bash
# Install Chromium (~300MB download)
npx playwright install chromium

# Or install all browsers (Chrome, Firefox, WebKit)
npx playwright install
```

**3. Verify installation**
```bash
# Test browser launch
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  console.log('✅ Browser launched successfully!');
  await browser.close();
})();
"
```

### Run Tests

**Quick validation (10 sites, ~10 minutes)**
```bash
# Scan high-priority sites
node tests/integration/batch-scan.js \
  --subset government,ecommerce,news \
  --limit 10 \
  --output results/quick-validation.json

# Run analysis pipeline
./run-analysis-pipeline.sh results/quick-validation.json

# View report
cat results/reports/VALIDATION-REPORT-*.md
```

**Full validation (40 sites, ~30 minutes)**
```bash
# Scan all 40 curated sites
node tests/integration/batch-scan.js \
  --output results/full-validation.json

# Run analysis pipeline
./run-analysis-pipeline.sh results/full-validation.json

# View report
cat results/reports/VALIDATION-REPORT-*.md
```

**With baseline comparison (against axe-core)**
```bash
# First, collect axe baselines manually or via script
# Then run with baseline comparison
node tests/integration/batch-scan.js \
  --output results/batch-results.json \
  --with-baseline

# Pipeline automatically detects baseline files
./run-analysis-pipeline.sh results/batch-results.json
```

### Pros & Cons

✅ **Pros:**
- Fastest setup (5-10 minutes)
- Full control over execution
- Easy debugging (can run headful mode)
- No ongoing costs

❌ **Cons:**
- Requires local resources
- Not automated on code changes
- One machine at a time

---

## Approach 2: GitHub Actions (CI/CD)

**Setup Time**: 30-60 minutes
**Cost**: Free (2,000 min/month private, unlimited public)
**Best For**: Automated testing on every commit, PR validation

### Setup

**1. Create GitHub Actions workflow**

Create `.github/workflows/integration-tests.yml`:

```yaml
name: Integration Tests

on:
  push:
    branches: [ main, develop, claude/* ]
  pull_request:
    branches: [ main, develop ]
  workflow_dispatch:  # Manual trigger

jobs:
  integration-tests:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm install

    - name: Install Playwright browsers
      run: npx playwright install --with-deps chromium

    - name: Run unit tests
      run: ./tests/run-all-tests.sh

    - name: Run integration tests (subset)
      run: |
        node tests/integration/batch-scan.js \
          --subset government,ecommerce,news \
          --limit 10 \
          --quiet \
          --output results/ci-validation.json
      continue-on-error: true

    - name: Run analysis pipeline
      run: ./run-analysis-pipeline.sh results/ci-validation.json

    - name: Upload results
      uses: actions/upload-artifact@v3
      with:
        name: test-results
        path: results/reports/
        retention-days: 30

    - name: Comment on PR with results
      if: github.event_name == 'pull_request'
      uses: actions/github-script@v7
      with:
        script: |
          const fs = require('fs');
          const report = fs.readFileSync('results/reports/VALIDATION-REPORT-*.md', 'utf8');

          github.rest.issues.createComment({
            issue_number: context.issue.number,
            owner: context.repo.owner,
            repo: context.repo.repo,
            body: '## Integration Test Results\n\n' + report
          });
```

**2. Weekly full validation**

Create `.github/workflows/weekly-full-validation.yml`:

```yaml
name: Weekly Full Validation

on:
  schedule:
    # Run every Monday at 2am UTC
    - cron: '0 2 * * 1'
  workflow_dispatch:  # Manual trigger

jobs:
  full-validation:
    runs-on: ubuntu-latest
    timeout-minutes: 60

    steps:
    - uses: actions/checkout@v4

    - uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm install

    - name: Install Playwright browsers
      run: npx playwright install --with-deps chromium

    - name: Run full integration tests (40 sites)
      run: |
        node tests/integration/batch-scan.js \
          --output results/weekly-validation.json
      timeout-minutes: 45

    - name: Run analysis pipeline
      run: ./run-analysis-pipeline.sh results/weekly-validation.json

    - name: Upload results
      uses: actions/upload-artifact@v3
      with:
        name: weekly-validation-results
        path: results/reports/
        retention-days: 90

    - name: Create issue if validation fails
      if: failure()
      uses: actions/github-script@v7
      with:
        script: |
          github.rest.issues.create({
            owner: context.repo.owner,
            repo: context.repo.repo,
            title: '🚨 Weekly Validation Failed',
            body: 'The weekly integration validation failed. Check the workflow run for details.',
            labels: ['bug', 'automated-test']
          });
```

**3. Commit and push**
```bash
git add .github/workflows/
git commit -m "ci: Add GitHub Actions integration testing"
git push
```

**4. View results**
- Go to repository → Actions tab
- Click on workflow run
- Download artifacts to see detailed reports

### Pros & Cons

✅ **Pros:**
- Fully automated (runs on every push)
- No local setup needed
- Free for public repos
- Historical results tracking
- PR validation before merge

❌ **Cons:**
- Longer setup time
- Requires GitHub repository
- Limited free minutes for private repos
- Debugging is harder

---

## Approach 3: Docker with Browser Support

**Setup Time**: 60-90 minutes
**Cost**: Free
**Best For**: Reproducible environment, team consistency

### Setup

**1. Create Dockerfile with browser support**

Create `Dockerfile.testing`:

```dockerfile
FROM mcr.microsoft.com/playwright:v1.40.0-jammy

WORKDIR /app

# Install Node.js 18
RUN apt-get update && apt-get install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get install -y nodejs

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Install Playwright browsers (already in base image, but ensure latest)
RUN npx playwright install chromium

# Set environment variables
ENV NODE_ENV=test
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# Verify browser installation
RUN node -e "const { chromium } = require('playwright'); (async () => { const b = await chromium.launch(); await b.close(); console.log('✅ Browser OK'); })();"

# Default command
CMD ["./tests/run-all-tests.sh"]
```

**2. Create docker-compose for easy management**

Create `docker-compose.test.yml`:

```yaml
version: '3.8'

services:
  integration-tests:
    build:
      context: .
      dockerfile: Dockerfile.testing
    volumes:
      - ./results:/app/results
      - ./tests:/app/tests:ro
    environment:
      - NODE_ENV=test
      - DEBUG=pw:api  # Playwright debug logs
    command: |
      bash -c "
        echo '🧪 Running Integration Tests'
        node tests/integration/batch-scan.js \
          --subset government,ecommerce,news \
          --limit 10 \
          --output results/docker-validation.json
        echo '📊 Running Analysis Pipeline'
        ./run-analysis-pipeline.sh results/docker-validation.json
        echo '✅ Complete - Check results/ directory'
      "
```

**3. Build and run**

```bash
# Build Docker image
docker-compose -f docker-compose.test.yml build

# Run tests
docker-compose -f docker-compose.test.yml up

# View results (written to ./results/ directory)
cat results/reports/VALIDATION-REPORT-*.md
```

**4. Alternative: Use without docker-compose**

```bash
# Build image
docker build -f Dockerfile.testing -t accessinsight-tests .

# Run tests
docker run --rm \
  -v $(pwd)/results:/app/results \
  accessinsight-tests \
  bash -c "
    node tests/integration/batch-scan.js \
      --limit 10 \
      --output results/docker-validation.json && \
    ./run-analysis-pipeline.sh results/docker-validation.json
  "

# View results
cat results/reports/VALIDATION-REPORT-*.md
```

### Pros & Cons

✅ **Pros:**
- Reproducible environment
- Works on any machine with Docker
- Isolated from host system
- Team consistency
- Can be used in CI/CD

❌ **Cons:**
- More complex setup
- Requires Docker knowledge
- Larger resource usage
- Slower startup time

---

## Approach 4: Cloud Testing Services

**Setup Time**: 20-30 minutes
**Cost**: Paid (starting ~$99/month)
**Best For**: Scale, parallel testing, no local setup

### Option A: BrowserStack

**1. Sign up**: https://www.browserstack.com/automate

**2. Install BrowserStack Playwright library**
```bash
npm install --save-dev @browserstack/playwright
```

**3. Create browserstack.config.js**
```javascript
module.exports = {
  auth: {
    username: process.env.BROWSERSTACK_USERNAME,
    accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
  },
  browserstackLocal: true,  // Test localhost
  buildName: 'AccessInsight Integration Tests',
  projectName: 'AccessInsight MV3',
  browsers: [
    {
      browser: 'chrome',
      os: 'Windows',
      os_version: '11',
      browser_version: 'latest'
    }
  ],
};
```

**4. Modify batch-scan.js to use BrowserStack**
```javascript
// At top of tests/integration/batch-scan.js
const { chromium } = require('@browserstack/playwright');

// Use BrowserStack for browser launch
const browser = await chromium.connect({
  wsEndpoint: process.env.BROWSERSTACK_ENDPOINT
});
```

**5. Run tests**
```bash
export BROWSERSTACK_USERNAME="your_username"
export BROWSERSTACK_ACCESS_KEY="your_key"

node tests/integration/batch-scan.js \
  --output results/browserstack-validation.json
```

### Option B: Sauce Labs

Similar setup to BrowserStack:
- Sign up: https://saucelabs.com/
- Install `@saucelabs/playwright-driver`
- Configure and run

### Option C: LambdaTest

- Sign up: https://www.lambdatest.com/
- Install `@lambdatest/playwright-driver`
- Configure and run

### Pros & Cons

✅ **Pros:**
- No local/server setup needed
- Massive scale (parallel testing)
- Real device testing
- Video recordings
- Advanced debugging tools
- Multiple browsers/OS combinations

❌ **Cons:**
- Ongoing costs ($99-500+/month)
- Dependency on third-party service
- Network latency
- Learning curve

---

## Comparison Summary

### For One-Time Validation
**→ Use Local Machine**
- 10 minutes setup
- Run tests immediately
- Free

### For Regular Development
**→ Use GitHub Actions**
- 60 minutes one-time setup
- Automated on every push
- Free (within limits)

### For Team Consistency
**→ Use Docker**
- 90 minutes one-time setup
- Same environment for everyone
- Free

### For Production-Grade Testing
**→ Use Cloud Service**
- 30 minutes setup
- Scale & parallel testing
- Paid

---

## Recommended Workflow

**Phase 1: Initial Validation (Local)**
```bash
# Quick local test to verify everything works
npm install
npx playwright install chromium
node tests/integration/batch-scan.js --limit 10 --output results/test.json
./run-analysis-pipeline.sh results/test.json
```

**Phase 2: Full Validation (Local or Docker)**
```bash
# Run complete 40-site validation
node tests/integration/batch-scan.js --output results/full.json
./run-analysis-pipeline.sh results/full.json
```

**Phase 3: Automated CI/CD (GitHub Actions)**
```bash
# Set up workflows for automated testing
git add .github/workflows/
git commit -m "ci: Add automated integration testing"
git push
```

**Phase 4: Scale (Cloud Service)**
```bash
# If needed: parallel testing across browsers/devices
# Use BrowserStack/Sauce Labs for enterprise needs
```

---

## Troubleshooting

### Issue: Playwright browser won't launch

**Solution 1**: Install system dependencies
```bash
# Ubuntu/Debian
npx playwright install-deps chromium

# macOS
# Usually works without extra deps

# Windows
# Usually works without extra deps
```

**Solution 2**: Try headless mode explicitly
```javascript
const browser = await chromium.launch({ headless: true });
```

**Solution 3**: Check for conflicting processes
```bash
# Kill any hanging Chrome processes
pkill -f chrome
pkill -f chromium
```

### Issue: Tests timing out

**Solution**: Increase timeout in batch-scan.js
```javascript
// In tests/integration/batch-scan.js
page.setDefaultTimeout(60000); // 60 seconds instead of default 30
```

### Issue: Memory issues with 40 sites

**Solution**: Scan in batches
```bash
# Scan 10 at a time
node tests/integration/batch-scan.js --limit 10 --offset 0 --output results/batch-1.json
node tests/integration/batch-scan.js --limit 10 --offset 10 --output results/batch-2.json
# ... continue

# Then merge results
node -e "
const fs = require('fs');
const merged = { scans: [] };
for (let i = 1; i <= 4; i++) {
  const batch = JSON.parse(fs.readFileSync(\`results/batch-\${i}.json\`));
  merged.scans.push(...batch.scans);
}
fs.writeFileSync('results/full-validation.json', JSON.stringify(merged, null, 2));
"

# Run pipeline on merged results
./run-analysis-pipeline.sh results/full-validation.json
```

### Issue: GitHub Actions running out of time

**Solution**: Use matrix strategy for parallel execution
```yaml
# In .github/workflows/integration-tests.yml
strategy:
  matrix:
    category: [government, ecommerce, news, education]
steps:
  - name: Run subset
    run: |
      node tests/integration/batch-scan.js \
        --category ${{ matrix.category }} \
        --output results/${{ matrix.category }}.json
```

---

## Next Steps After Setup

1. **Verify setup** with quick test (5 sites)
2. **Run full validation** (40 sites)
3. **Review results** in generated report
4. **Make decision** based on metrics:
   - Precision ≥75% → Proceed to Phase 9
   - Precision 60-75% → Tune engine
   - Precision <60% → Investigate issues

---

## Cost Comparison

| Approach | Setup Cost | Running Cost | Time Cost |
|----------|------------|--------------|-----------|
| Local | $0 | $0 | 10 min setup, 10-30 min per run |
| GitHub Actions | $0 | $0* | 60 min setup, automated after |
| Docker | $0 | $0 | 90 min setup, 10-30 min per run |
| BrowserStack | $0 | $99-499/mo | 30 min setup, 5-15 min per run |

*Free tier: 2,000 min/month private repos, unlimited public repos

---

## Recommendation

**Start with Local Machine** (10 minutes):
```bash
npm install
npx playwright install chromium
node tests/integration/batch-scan.js --limit 10 --output results/test.json
./run-analysis-pipeline.sh results/test.json
```

**If satisfied, set up GitHub Actions** (60 minutes one-time) for ongoing automated testing.

**Skip Docker/Cloud** unless you have specific needs for those approaches.
