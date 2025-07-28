#!/bin/bash

# 🧪 Military Tees UK - Automated Test Execution Script
# Run this script to execute the complete testing framework

echo "🛡️  MILITARY TEES UK - TESTING FRAMEWORK"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to run command and check result
run_test() {
    local test_name="$1"
    local command="$2"
    
    print_status "Running $test_name..."
    
    if eval "$command"; then
        print_success "$test_name completed successfully"
        return 0
    else
        print_error "$test_name failed"
        return 1
    fi
}

# Start testing
echo "🚀 Starting comprehensive testing framework..."
echo ""

# Phase 1: Environment Check
print_status "Phase 1: Environment Validation"
echo "Node.js version: $(node --version)"
echo "NPM version: $(npm --version)"
echo ""

# Phase 2: Install Dependencies
print_status "Phase 2: Installing Dependencies"
if ! npm install; then
    print_error "Failed to install dependencies"
    exit 1
fi
print_success "Dependencies installed"
echo ""

# Phase 3: Unit Tests
print_status "Phase 3: Unit Tests"
echo ""

run_test "Component Tests" "npm run test:component"
COMPONENT_RESULT=$?

run_test "Hook Tests" "npm run test:hooks"
HOOK_RESULT=$?

run_test "API Tests" "npm run test:api"
API_RESULT=$?

run_test "Database Tests" "npm run test:database"
DB_RESULT=$?

echo ""

# Phase 4: E2E Tests (only if dev server is not running)
print_status "Phase 4: E2E Tests"
print_warning "E2E tests require development server to be running"
print_status "Please run 'npm run dev' in another terminal, then run:"
print_status "  npm run test:e2e"
print_status "  npm run test:journey"
echo ""

# Phase 5: Coverage Report
print_status "Phase 5: Generating Coverage Report"
run_test "Coverage Report" "npm run test:coverage"
COVERAGE_RESULT=$?

echo ""
echo "📊 TEST EXECUTION SUMMARY"
echo "========================"

# Calculate overall result
TOTAL_TESTS=5
PASSED_TESTS=0

if [ $COMPONENT_RESULT -eq 0 ]; then
    echo "✅ Component Tests: PASSED"
    ((PASSED_TESTS++))
else
    echo "❌ Component Tests: FAILED"
fi

if [ $HOOK_RESULT -eq 0 ]; then
    echo "✅ Hook Tests: PASSED"
    ((PASSED_TESTS++))
else
    echo "❌ Hook Tests: FAILED"
fi

if [ $API_RESULT -eq 0 ]; then
    echo "✅ API Tests: PASSED"
    ((PASSED_TESTS++))
else
    echo "❌ API Tests: FAILED"
fi

if [ $DB_RESULT -eq 0 ]; then
    echo "✅ Database Tests: PASSED"
    ((PASSED_TESTS++))
else
    echo "❌ Database Tests: FAILED"
fi

if [ $COVERAGE_RESULT -eq 0 ]; then
    echo "✅ Coverage Report: GENERATED"
    ((PASSED_TESTS++))
else
    echo "❌ Coverage Report: FAILED"
fi

echo ""
echo "📈 RESULTS: $PASSED_TESTS/$TOTAL_TESTS tests passed"

# Final status
if [ $PASSED_TESTS -eq $TOTAL_TESTS ]; then
    print_success "🎖️  ALL TESTS PASSED - MILITARY-GRADE QUALITY ACHIEVED!"
    echo ""
    print_status "Next steps:"
    echo "  1. Run E2E tests: npm run test:e2e (requires dev server)"
    echo "  2. View coverage: open coverage/index.html"
    echo "  3. Deploy with confidence!"
elif [ $PASSED_TESTS -gt 2 ]; then
    print_warning "⚠️  PARTIAL SUCCESS - Some tests passed, review failures"
    echo ""
    print_status "Recommendation: Fix failing tests before deployment"
else
    print_error "💥 MULTIPLE FAILURES - Review test configuration"
    echo ""
    print_status "Recommendation: Check TEST-EXECUTION-CHECKLIST.md for troubleshooting"
fi

echo ""
echo "📚 Documentation:"
echo "  - TEST-EXECUTION-CHECKLIST.md: Detailed testing guide"
echo "  - TESTING.md: Comprehensive testing documentation"
echo "  - QUICK-START-TESTING.md: Quick start guide"
echo ""

exit 0