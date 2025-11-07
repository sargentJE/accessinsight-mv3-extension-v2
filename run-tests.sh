#!/bin/bash
# Phase 8 Real-World Validation Test Runner
# Wrapper script for AccessInsight testing and validation

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
    echo -e "\n${BLUE}=====================================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}=====================================================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Command: check - Environment verification
cmd_check() {
    print_header "Phase 8 Environment Check"

    local errors=0

    # Check Node.js
    echo -n "Checking Node.js... "
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js $NODE_VERSION"
    else
        print_error "Node.js not found"
        errors=$((errors + 1))
    fi

    # Check npm
    echo -n "Checking npm... "
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_success "npm $NPM_VERSION"
    else
        print_error "npm not found"
        errors=$((errors + 1))
    fi

    # Check test infrastructure
    echo -n "Checking test infrastructure... "
    if [ -d "tests" ] && [ -f "tests/run-all-tests.sh" ]; then
        print_success "Test directory exists"
    else
        print_error "Test infrastructure missing"
        errors=$((errors + 1))
    fi

    # Check integration pipeline
    echo -n "Checking Phase 8 analysis pipeline... "
    if [ -d "tests/integration" ] && [ -f "tests/integration/generate-mock-data.js" ]; then
        print_success "Analysis pipeline present"
    else
        print_error "Analysis pipeline missing"
        errors=$((errors + 1))
    fi

    # Check node_modules
    echo -n "Checking dependencies... "
    if [ -d "node_modules" ]; then
        print_success "node_modules exists"
    else
        print_warning "node_modules not found - run 'npm install'"
        errors=$((errors + 1))
    fi

    # Check core files
    echo -n "Checking core extension files... "
    if [ -f "engine.js" ] && [ -f "manifest.json" ]; then
        print_success "Core files present"
    else
        print_error "Core extension files missing"
        errors=$((errors + 1))
    fi

    # Check results directory
    echo -n "Checking results directory... "
    if [ ! -d "tests/integration/results" ]; then
        mkdir -p tests/integration/results
        print_success "Created results directory"
    else
        print_success "Results directory exists"
    fi

    echo ""
    if [ $errors -eq 0 ]; then
        print_success "Environment check passed! ✨"
        echo ""
        print_info "Ready to run Phase 8 validation tests"
        return 0
    else
        print_error "Environment check failed with $errors error(s)"
        echo ""
        print_info "Please fix the issues above before proceeding"
        return 1
    fi
}

# Command: quick - Quick validation with mock data
cmd_quick() {
    print_header "Phase 8 Quick Validation"

    print_info "Running end-to-end validation with mock data (~60 seconds)"
    echo ""

    # Step 1: Generate mock data
    print_info "Step 1/6: Generating mock data..."
    if node tests/integration/generate-mock-data.js --subset 15 --baseline --validation 100 > /tmp/mockgen.log 2>&1; then
        print_success "Mock data generated"
    else
        print_error "Failed to generate mock data"
        cat /tmp/mockgen.log
        return 1
    fi

    echo ""

    # Step 2: Populate validation
    print_info "Step 2/6: Simulating manual validation..."
    if node tests/integration/populate-validation.js > /tmp/populate.log 2>&1; then
        print_success "Validation data populated"
    else
        print_error "Failed to populate validation"
        cat /tmp/populate.log
        return 1
    fi

    echo ""

    # Step 3: Calculate metrics
    print_info "Step 3/6: Calculating metrics..."
    if node tests/integration/calculate-metrics.js --validation manual-validation-completed.csv > /tmp/metrics.log 2>&1; then
        print_success "Metrics calculated"
        # Show key metrics
        grep -E "(Precision|Recall|F1 Score|False Positive)" /tmp/metrics.log || true
    else
        print_error "Failed to calculate metrics"
        cat /tmp/metrics.log
        return 1
    fi

    echo ""

    # Step 4: Analyze patterns
    print_info "Step 4/6: Analyzing patterns..."
    if node tests/integration/analyze-patterns.js --validation manual-validation-completed.csv > /tmp/patterns.log 2>&1; then
        print_success "Pattern analysis complete"
        # Show pattern summary
        grep -E "(False Positive|False Negative|pattern)" /tmp/patterns.log | head -5 || true
    else
        print_error "Failed to analyze patterns"
        cat /tmp/patterns.log
        return 1
    fi

    echo ""

    # Step 5: Compare baseline
    print_info "Step 5/6: Comparing with baseline (axe-core)..."
    if node tests/integration/compare-baseline.js > /tmp/baseline.log 2>&1; then
        print_success "Baseline comparison complete"
        # Show comparison summary
        grep -E "(Overlap|Unique|Coverage)" /tmp/baseline.log | head -5 || true
    else
        print_error "Failed to compare baseline"
        cat /tmp/baseline.log
        return 1
    fi

    echo ""

    # Step 6: Generate report
    print_info "Step 6/6: Generating validation report..."
    if node tests/integration/generate-report.js --format all > /tmp/report.log 2>&1; then
        print_success "Report generated"
        REPORT_FILE=$(ls -t tests/integration/results/integration-report-*.md | head -1)
        if [ -f "$REPORT_FILE" ]; then
            print_info "Report available at: $REPORT_FILE"
        fi
    else
        print_error "Failed to generate report"
        cat /tmp/report.log
        return 1
    fi

    echo ""
    print_header "Quick Validation Complete ✨"

    # Extract and display summary
    if [ -f "$REPORT_FILE" ]; then
        echo ""
        print_info "Validation Summary:"
        echo ""
        grep -A 20 "## Executive Summary" "$REPORT_FILE" | head -25 || true
    fi

    return 0
}

# Command: unit - Run unit tests
cmd_unit() {
    print_header "Running Unit Tests"

    if [ -x "tests/run-all-tests.sh" ]; then
        bash tests/run-all-tests.sh
    else
        print_error "tests/run-all-tests.sh not found or not executable"
        return 1
    fi
}

# Command: full - Full validation (requires browser environment)
cmd_full() {
    print_header "Phase 8 Full Validation"

    print_warning "Full validation requires Playwright and browser environment"
    print_info "This will scan real websites and perform comprehensive validation"
    echo ""

    read -p "Continue? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Cancelled"
        return 0
    fi

    # Check Playwright
    if ! npm list playwright &> /dev/null; then
        print_warning "Playwright not installed. Installing..."
        npm install --save-dev playwright
        npx playwright install chromium
    fi

    # Run full validation
    print_info "Running batch scan on real websites..."
    node tests/integration/batch-scan.js --subset 15

    # Continue with rest of pipeline
    print_info "Calculating metrics..."
    node tests/integration/calculate-metrics.js

    print_info "Analyzing patterns..."
    node tests/integration/analyze-patterns.js

    print_info "Generating report..."
    node tests/integration/generate-report.js --format all

    print_success "Full validation complete!"
}

# Command: help
cmd_help() {
    cat << EOF
Phase 8 Real-World Validation Test Runner

Usage: ./run-tests.sh <command>

Commands:
  check     Verify environment and dependencies
  quick     Run quick validation with mock data (~60s)
  unit      Run unit tests only
  full      Run full validation on real websites (requires Playwright)
  help      Show this help message

Examples:
  ./run-tests.sh check        # Verify environment
  ./run-tests.sh quick        # Quick validation
  ./run-tests.sh unit         # Run unit tests
  ./run-tests.sh full         # Full website validation

Phase 8 Validation Pipeline:
  1. Generate/scan data (mock or real websites)
  2. Calculate comprehensive metrics
  3. Analyze patterns (false positives/negatives)
  4. Compare with baseline tools (axe-core)
  5. Generate validation report with recommendations

For more information, see:
  - tests/integration/PIPELINE_USAGE_GUIDE.md
  - docs/PHASE_8_INTEGRATION_TESTING_PLAN.md

EOF
}

# Main command dispatcher
main() {
    if [ $# -eq 0 ]; then
        cmd_help
        exit 0
    fi

    case "$1" in
        check)
            cmd_check
            ;;
        quick)
            cmd_quick
            ;;
        unit)
            cmd_unit
            ;;
        full)
            cmd_full
            ;;
        help|--help|-h)
            cmd_help
            ;;
        *)
            print_error "Unknown command: $1"
            echo ""
            cmd_help
            exit 1
            ;;
    esac
}

main "$@"
