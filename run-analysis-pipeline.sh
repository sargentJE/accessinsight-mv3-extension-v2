#!/bin/bash
# Automated Analysis Pipeline Runner
# Usage: ./run-analysis-pipeline.sh <batch-results.json>

set -e  # Exit on error

# Check arguments
if [ -z "$1" ]; then
  echo "❌ Error: Missing batch results file"
  echo "Usage: ./run-analysis-pipeline.sh <batch-results.json>"
  exit 1
fi

BATCH_RESULTS="$1"
RESULTS_DIR="$(dirname "$BATCH_RESULTS")"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "🔍 AccessInsight Analysis Pipeline"
echo "====================================="
echo ""
echo "Input: $BATCH_RESULTS"
echo "Output: $RESULTS_DIR"
echo "Timestamp: $TIMESTAMP"
echo ""

# Verify input file exists
if [ ! -f "$BATCH_RESULTS" ]; then
  echo "❌ Error: Batch results file not found: $BATCH_RESULTS"
  exit 1
fi

# Create output directory
mkdir -p "$RESULTS_DIR/reports"

echo "📊 Step 1/4: Calculating Metrics..."
node tests/integration/calculate-metrics.js \
  "$BATCH_RESULTS" \
  > "$RESULTS_DIR/reports/metrics-$TIMESTAMP.json"
echo "✅ Metrics calculated"
echo ""

echo "🔍 Step 2/4: Analyzing Patterns..."
node tests/integration/analyze-patterns.js \
  "$BATCH_RESULTS" \
  > "$RESULTS_DIR/reports/patterns-$TIMESTAMP.json"
echo "✅ Patterns analyzed"
echo ""

echo "📊 Step 3/4: Baseline Comparison..."
if [ -d "$RESULTS_DIR/baseline" ]; then
  node tests/integration/compare-baseline.js \
    "$BATCH_RESULTS" \
    "$RESULTS_DIR/baseline/" \
    > "$RESULTS_DIR/reports/baseline-comparison-$TIMESTAMP.json"
  echo "✅ Baseline comparison complete"
  BASELINE_FILE="$RESULTS_DIR/reports/baseline-comparison-$TIMESTAMP.json"
else
  echo "⚠️  No baseline directory found, skipping comparison"
  BASELINE_FILE=""
fi
echo ""

echo "📄 Step 4/4: Generating Report..."
if [ -n "$BASELINE_FILE" ]; then
  node tests/integration/generate-report.js \
    "$RESULTS_DIR/reports/metrics-$TIMESTAMP.json" \
    "$RESULTS_DIR/reports/patterns-$TIMESTAMP.json" \
    "$BASELINE_FILE" \
    > "$RESULTS_DIR/reports/VALIDATION-REPORT-$TIMESTAMP.md"
else
  node tests/integration/generate-report.js \
    "$RESULTS_DIR/reports/metrics-$TIMESTAMP.json" \
    "$RESULTS_DIR/reports/patterns-$TIMESTAMP.json" \
    > "$RESULTS_DIR/reports/VALIDATION-REPORT-$TIMESTAMP.md"
fi
echo "✅ Report generated"
echo ""

echo "====================================="
echo "✨ Pipeline Complete!"
echo ""
echo "📊 Results:"
echo "  - Metrics:    $RESULTS_DIR/reports/metrics-$TIMESTAMP.json"
echo "  - Patterns:   $RESULTS_DIR/reports/patterns-$TIMESTAMP.json"
if [ -n "$BASELINE_FILE" ]; then
echo "  - Baseline:   $BASELINE_FILE"
fi
echo "  - Report:     $RESULTS_DIR/reports/VALIDATION-REPORT-$TIMESTAMP.md"
echo ""
echo "📖 View report: cat $RESULTS_DIR/reports/VALIDATION-REPORT-$TIMESTAMP.md"
echo ""
