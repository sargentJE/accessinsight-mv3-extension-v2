#!/bin/bash
# AccessInsight Automated Test Executor
# Comprehensive testing orchestrator for Phase 8 Real-World Validation
# Usage: ./run-tests.sh [mode] [options]

set -e  # Exit on error
set -o pipefail  # Catch errors in pipes

# ============================================================================
# CONFIGURATION
# ============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEST_BRANCH="claude/test-aria-rules-phase-4-011CUq3zzD76mLZzj6aKHVc1"
RESULTS_DIR="$SCRIPT_DIR/results"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Test modes and their configurations
declare -A MODE_SITES=(
  ["quick"]=10
  ["standard"]=20
  ["full"]=40
)

declare -A MODE_CATEGORIES=(
  ["quick"]="government,ecommerce"
  ["standard"]="government,ecommerce,news,education"
  ["full"]="all"
)

declare -A MODE_TIMEOUTS=(
  ["quick"]=600     # 10 minutes
  ["standard"]=1200 # 20 minutes
  ["full"]=2400     # 40 minutes
)

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

log_info() {
  echo -e "${BLUE}ℹ${NC}  $1"
}

log_success() {
  echo -e "${GREEN}✅${NC} $1"
}

log_warning() {
  echo -e "${YELLOW}⚠️${NC}  $1"
}

log_error() {
  echo -e "${RED}❌${NC} $1"
}

log_step() {
  echo -e "\n${CYAN}$1${NC}"
  echo -e "${CYAN}$(printf '=%.0s' {1..60})${NC}\n"
}

show_usage() {
  cat <<EOF
${CYAN}AccessInsight Automated Test Executor${NC}

${BLUE}USAGE:${NC}
  ./run-tests.sh [mode] [options]

${BLUE}MODES:${NC}
  ${GREEN}quick${NC}       Quick validation (10 sites, ~10 min)
  ${GREEN}standard${NC}    Standard validation (20 sites, ~20 min)
  ${GREEN}full${NC}        Full validation (40 sites, ~40 min)
  ${GREEN}unit${NC}        Run unit tests only
  ${GREEN}integration${NC} Run integration tests only
  ${GREEN}pipeline${NC}    Run analysis pipeline on existing results

${BLUE}OPTIONS:${NC}
  --with-baseline      Include axe-core baseline comparison
  --sites N            Override number of sites to test
  --categories LIST    Comma-separated categories to test
  --output FILE        Specify output file path
  --skip-install       Skip dependency installation
  --skip-unit          Skip unit tests
  --skip-integration   Skip integration tests
  --skip-pipeline      Skip pipeline execution
  --dry-run            Show what would be executed without running
  --help, -h           Show this help message

${BLUE}EXAMPLES:${NC}
  ./run-tests.sh quick
  ./run-tests.sh standard --with-baseline
  ./run-tests.sh full --sites 30
  ./run-tests.sh integration --categories "government,news"
  ./run-tests.sh pipeline results/batch-results.json

${BLUE}ENVIRONMENT:${NC}
  Node.js 18+, npm, and Playwright required
  Run './run-tests.sh check' to verify environment

EOF
}

check_command() {
  if command -v "$1" &> /dev/null; then
    log_success "$1 is installed"
    return 0
  else
    log_error "$1 is not installed"
    return 1
  fi
}

check_environment() {
  log_step "Checking Environment"

  local all_ok=true

  # Check Node.js
  if command -v node &> /dev/null; then
    local node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$node_version" -ge 18 ]; then
      log_success "Node.js $(node -v) is installed"
    else
      log_error "Node.js version is too old (need 18+, have $node_version)"
      all_ok=false
    fi
  else
    log_error "Node.js is not installed"
    all_ok=false
  fi

  # Check npm
  if command -v npm &> /dev/null; then
    log_success "npm $(npm -v) is installed"
  else
    log_error "npm is not installed"
    all_ok=false
  fi

  # Check git
  if command -v git &> /dev/null; then
    log_success "git $(git --version | cut -d' ' -f3) is installed"
  else
    log_error "git is not installed"
    all_ok=false
  fi

  # Check if we're in a git repository
  if git rev-parse --git-dir > /dev/null 2>&1; then
    log_success "Inside git repository"
  else
    log_error "Not inside a git repository"
    all_ok=false
  fi

  # Check for node_modules
  if [ -d "$SCRIPT_DIR/node_modules" ]; then
    log_success "Dependencies installed (node_modules exists)"
  else
    log_warning "Dependencies not installed (node_modules missing)"
  fi

  # Check for Playwright browsers
  if [ -d "$HOME/.cache/ms-playwright" ] || [ -d "$HOME/Library/Caches/ms-playwright" ]; then
    log_success "Playwright browsers installed"
  else
    log_warning "Playwright browsers may not be installed"
  fi

  echo ""

  if [ "$all_ok" = false ]; then
    log_error "Environment check failed. Please install missing dependencies."
    return 1
  else
    log_success "Environment check passed!"
    return 0
  fi
}

setup_test_infrastructure() {
  log_step "Setting Up Test Infrastructure"

  # Check if test files exist in current directory
  if [ -d "$SCRIPT_DIR/tests/integration" ]; then
    log_success "Test infrastructure already available in current branch"
    return 0
  fi

  # Check if we can access the test branch
  if ! git rev-parse --verify "$TEST_BRANCH" &> /dev/null; then
    log_error "Test branch '$TEST_BRANCH' not found"
    log_info "You may need to fetch it: git fetch origin $TEST_BRANCH"
    return 1
  fi

  log_warning "Test infrastructure not in current branch"
  log_info "Test files are on branch: $TEST_BRANCH"
  echo ""

  # Ask user what to do
  if [ "$DRY_RUN" = true ]; then
    log_info "Would ask user to merge test branch or switch branches"
    return 0
  fi

  echo "Options:"
  echo "  1) Merge test branch into current branch (recommended)"
  echo "  2) Switch to test branch temporarily"
  echo "  3) Cancel and exit"
  echo ""
  read -p "Choose option (1-3): " choice

  case $choice in
    1)
      log_info "Merging $TEST_BRANCH into current branch..."
      local current_branch=$(git branch --show-current)
      git merge "$TEST_BRANCH" --no-edit
      log_success "Test infrastructure merged into $current_branch"
      ;;
    2)
      log_info "Switching to $TEST_BRANCH..."
      # Stash any changes
      if ! git diff-index --quiet HEAD --; then
        log_info "Stashing uncommitted changes..."
        git stash push -m "Auto-stash before test execution $TIMESTAMP"
      fi
      git checkout "$TEST_BRANCH"
      log_success "Switched to $TEST_BRANCH"
      ;;
    3)
      log_info "Cancelled by user"
      exit 0
      ;;
    *)
      log_error "Invalid choice"
      exit 1
      ;;
  esac
}

install_dependencies() {
  if [ "$SKIP_INSTALL" = true ]; then
    log_info "Skipping dependency installation (--skip-install)"
    return 0
  fi

  log_step "Installing Dependencies"

  if [ ! -d "$SCRIPT_DIR/node_modules" ]; then
    log_info "Installing npm packages..."
    if [ "$DRY_RUN" = true ]; then
      log_info "Would run: npm install"
    else
      npm install
      log_success "Dependencies installed"
    fi
  else
    log_success "Dependencies already installed"
  fi

  # Check Playwright browsers
  if [ "$DRY_RUN" = false ]; then
    log_info "Ensuring Playwright browsers are installed..."
    npx playwright install chromium --with-deps 2>&1 | grep -v "Downloading" || true
    log_success "Playwright browsers ready"
  fi
}

run_unit_tests() {
  if [ "$SKIP_UNIT" = true ]; then
    log_info "Skipping unit tests (--skip-unit)"
    return 0
  fi

  log_step "Running Unit Tests"

  if [ ! -f "$SCRIPT_DIR/tests/run-all-tests.sh" ]; then
    log_warning "Unit test runner not found (tests/run-all-tests.sh)"
    log_info "Unit tests may be on a different branch"
    return 0
  fi

  if [ "$DRY_RUN" = true ]; then
    log_info "Would run: ./tests/run-all-tests.sh"
    return 0
  fi

  log_info "Running 315 unit tests across 46 accessibility rules..."
  echo ""

  if bash "$SCRIPT_DIR/tests/run-all-tests.sh"; then
    log_success "All unit tests passed!"
  else
    log_error "Unit tests failed"
    return 1
  fi
}

run_integration_tests() {
  if [ "$SKIP_INTEGRATION" = true ]; then
    log_info "Skipping integration tests (--skip-integration)"
    return 0
  fi

  log_step "Running Integration Tests (Browser-Based Scanning)"

  if [ ! -f "$SCRIPT_DIR/tests/integration/batch-scan.js" ]; then
    log_error "Integration test script not found (tests/integration/batch-scan.js)"
    return 1
  fi

  local sites="${SITES:-${MODE_SITES[$MODE]}}"
  local categories="${CATEGORIES:-${MODE_CATEGORIES[$MODE]}}"
  local output="${OUTPUT_FILE:-$RESULTS_DIR/batch-results-$TIMESTAMP.json}"

  log_info "Configuration:"
  log_info "  Sites: $sites"
  log_info "  Categories: $categories"
  log_info "  Output: $output"
  log_info "  Estimated time: ~$((sites * 1)) minutes"
  echo ""

  mkdir -p "$(dirname "$output")"

  if [ "$DRY_RUN" = true ]; then
    log_info "Would run: node tests/integration/batch-scan.js --limit $sites --output $output"
    BATCH_RESULTS_FILE="$output"
    return 0
  fi

  local batch_cmd="node $SCRIPT_DIR/tests/integration/batch-scan.js"

  if [ "$categories" != "all" ]; then
    batch_cmd="$batch_cmd --subset $categories"
  fi

  batch_cmd="$batch_cmd --limit $sites --output $output"

  log_info "Starting batch scan..."
  log_info "Command: $batch_cmd"
  echo ""

  if eval "$batch_cmd"; then
    log_success "Integration tests completed!"
    log_info "Results saved to: $output"
    BATCH_RESULTS_FILE="$output"
  else
    log_error "Integration tests failed"
    return 1
  fi
}

run_analysis_pipeline() {
  if [ "$SKIP_PIPELINE" = true ]; then
    log_info "Skipping analysis pipeline (--skip-pipeline)"
    return 0
  fi

  log_step "Running Analysis Pipeline"

  local batch_results="${BATCH_RESULTS_FILE:-$PIPELINE_INPUT}"

  if [ -z "$batch_results" ]; then
    log_error "No batch results file specified"
    log_info "Usage: ./run-tests.sh pipeline <batch-results.json>"
    return 1
  fi

  if [ ! -f "$batch_results" ]; then
    log_error "Batch results file not found: $batch_results"
    return 1
  fi

  log_info "Input: $batch_results"
  echo ""

  if [ "$DRY_RUN" = true ]; then
    log_info "Would run: ./run-analysis-pipeline.sh $batch_results"
    return 0
  fi

  if [ -f "$SCRIPT_DIR/run-analysis-pipeline.sh" ]; then
    bash "$SCRIPT_DIR/run-analysis-pipeline.sh" "$batch_results"

    # Find the generated report
    local latest_report=$(ls -t "$RESULTS_DIR/reports/VALIDATION-REPORT-"*.md 2>/dev/null | head -1)
    if [ -n "$latest_report" ]; then
      FINAL_REPORT="$latest_report"
      log_success "Analysis complete!"
      log_info "Report: $latest_report"
    fi
  else
    log_error "Pipeline runner not found (run-analysis-pipeline.sh)"
    return 1
  fi
}

evaluate_results() {
  log_step "Evaluating Results Against Success Criteria"

  if [ -z "$FINAL_REPORT" ]; then
    log_warning "No report available for evaluation"
    return 0
  fi

  if [ ! -f "$FINAL_REPORT" ]; then
    log_warning "Report file not found: $FINAL_REPORT"
    return 0
  fi

  log_info "Phase 8 Success Criteria:"
  echo "  • Precision ≥ 75%"
  echo "  • Recall ≥ 60%"
  echo "  • False positive rate < 25%"
  echo "  • Minimum 10 sites tested"
  echo ""

  log_info "Review the full report for detailed metrics:"
  log_info "  cat $FINAL_REPORT"
  echo ""

  # Display summary section if available
  if grep -q "## Summary" "$FINAL_REPORT" 2>/dev/null; then
    echo -e "${CYAN}Report Summary:${NC}"
    echo "───────────────────────────────────────────────────────────"
    sed -n '/## Summary/,/##/p' "$FINAL_REPORT" | head -n -1
    echo "───────────────────────────────────────────────────────────"
  fi

  echo ""
  log_success "Evaluation complete - review report for decision guidance"
}

show_summary() {
  log_step "Test Execution Summary"

  echo -e "${GREEN}✅ Test execution completed successfully!${NC}"
  echo ""

  echo "Results Location: $RESULTS_DIR"
  echo ""

  if [ -n "$BATCH_RESULTS_FILE" ] && [ -f "$BATCH_RESULTS_FILE" ]; then
    echo "📊 Batch Results:  $BATCH_RESULTS_FILE"
  fi

  if [ -n "$FINAL_REPORT" ] && [ -f "$FINAL_REPORT" ]; then
    echo "📄 Final Report:   $FINAL_REPORT"
    echo ""
    echo "To view the report:"
    echo "  cat $FINAL_REPORT"
    echo ""
    echo "Or open in your editor:"
    echo "  code $FINAL_REPORT"
  fi

  echo ""
  echo -e "${CYAN}Next Steps:${NC}"
  echo "1. Review the validation report"
  echo "2. Check if metrics meet Phase 8 criteria (Precision ≥75%, Recall ≥60%)"
  echo "3. Decide on next phase:"
  echo "   • If passing → Proceed to Phase 9 (Performance)"
  echo "   • If close → Tune engine (4-8 hours)"
  echo "   • If failing → Return to unit testing"
  echo ""
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

main() {
  # Parse arguments
  MODE=""
  SITES=""
  CATEGORIES=""
  OUTPUT_FILE=""
  PIPELINE_INPUT=""
  WITH_BASELINE=false
  SKIP_INSTALL=false
  SKIP_UNIT=false
  SKIP_INTEGRATION=false
  SKIP_PIPELINE=false
  DRY_RUN=false

  # Parse command line arguments
  while [[ $# -gt 0 ]]; do
    case $1 in
      quick|standard|full|unit|integration|pipeline)
        MODE="$1"
        shift
        ;;
      check)
        check_environment
        exit $?
        ;;
      --sites)
        SITES="$2"
        shift 2
        ;;
      --categories)
        CATEGORIES="$2"
        shift 2
        ;;
      --output)
        OUTPUT_FILE="$2"
        shift 2
        ;;
      --with-baseline)
        WITH_BASELINE=true
        shift
        ;;
      --skip-install)
        SKIP_INSTALL=true
        shift
        ;;
      --skip-unit)
        SKIP_UNIT=true
        shift
        ;;
      --skip-integration)
        SKIP_INTEGRATION=true
        shift
        ;;
      --skip-pipeline)
        SKIP_PIPELINE=true
        shift
        ;;
      --dry-run)
        DRY_RUN=true
        shift
        ;;
      --help|-h)
        show_usage
        exit 0
        ;;
      *)
        # Check if it's a file path for pipeline mode
        if [ "$MODE" = "pipeline" ] && [ -z "$PIPELINE_INPUT" ]; then
          PIPELINE_INPUT="$1"
          shift
        else
          log_error "Unknown option: $1"
          echo ""
          show_usage
          exit 1
        fi
        ;;
    esac
  done

  # Show header
  clear
  echo -e "${MAGENTA}"
  echo "╔════════════════════════════════════════════════════════════╗"
  echo "║                                                            ║"
  echo "║        AccessInsight Automated Test Executor v1.0          ║"
  echo "║        Phase 8: Real-World Validation                      ║"
  echo "║                                                            ║"
  echo "╚════════════════════════════════════════════════════════════╝"
  echo -e "${NC}"

  # Validate mode
  if [ -z "$MODE" ]; then
    log_error "No mode specified"
    echo ""
    show_usage
    exit 1
  fi

  log_info "Mode: $MODE"
  log_info "Timestamp: $TIMESTAMP"
  if [ "$DRY_RUN" = true ]; then
    log_warning "DRY RUN MODE - No changes will be made"
  fi
  echo ""

  # Execute based on mode
  case $MODE in
    quick|standard|full)
      check_environment || exit 1
      setup_test_infrastructure || exit 1
      install_dependencies || exit 1
      run_unit_tests || log_warning "Unit tests skipped or unavailable"
      run_integration_tests || exit 1
      run_analysis_pipeline || exit 1
      evaluate_results
      show_summary
      ;;
    unit)
      check_environment || exit 1
      setup_test_infrastructure || exit 1
      install_dependencies || exit 1
      run_unit_tests || exit 1
      log_success "Unit tests completed!"
      ;;
    integration)
      check_environment || exit 1
      setup_test_infrastructure || exit 1
      install_dependencies || exit 1
      run_integration_tests || exit 1
      log_success "Integration tests completed!"
      ;;
    pipeline)
      check_environment || exit 1
      run_analysis_pipeline || exit 1
      evaluate_results
      show_summary
      ;;
    *)
      log_error "Invalid mode: $MODE"
      show_usage
      exit 1
      ;;
  esac

  echo ""
  log_success "All operations completed successfully!"
  echo ""
}

# Run main function
main "$@"
