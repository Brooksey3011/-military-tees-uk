@echo off
REM 🧪 Military Tees UK - Automated Test Execution Script (Windows)
REM Run this script to execute the complete testing framework

echo.
echo 🛡️  MILITARY TEES UK - TESTING FRAMEWORK
echo ========================================
echo.

echo 🚀 Starting comprehensive testing framework...
echo.

REM Phase 1: Environment Check
echo [INFO] Phase 1: Environment Validation
node --version
npm --version
echo.

REM Phase 2: Install Dependencies
echo [INFO] Phase 2: Installing Dependencies
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo [SUCCESS] Dependencies installed
echo.

REM Phase 3: Unit Tests
echo [INFO] Phase 3: Unit Tests
echo.

echo [INFO] Running Component Tests...
call npm run test:component
if errorlevel 1 (
    echo [ERROR] Component tests failed
    set COMPONENT_FAILED=1
) else (
    echo [SUCCESS] Component tests passed
    set COMPONENT_FAILED=0
)

echo [INFO] Running Hook Tests...
call npm run test:hooks
if errorlevel 1 (
    echo [ERROR] Hook tests failed
    set HOOK_FAILED=1
) else (
    echo [SUCCESS] Hook tests passed
    set HOOK_FAILED=0
)

echo [INFO] Running API Tests...
call npm run test:api
if errorlevel 1 (
    echo [ERROR] API tests failed
    set API_FAILED=1
) else (
    echo [SUCCESS] API tests passed
    set API_FAILED=0
)

echo [INFO] Running Database Tests...
call npm run test:database
if errorlevel 1 (
    echo [ERROR] Database tests failed
    set DB_FAILED=1
) else (
    echo [SUCCESS] Database tests passed
    set DB_FAILED=0
)

echo.

REM Phase 4: E2E Tests Information
echo [INFO] Phase 4: E2E Tests
echo [WARNING] E2E tests require development server to be running
echo [INFO] Please run 'npm run dev' in another terminal, then run:
echo [INFO]   npm run test:e2e
echo [INFO]   npm run test:journey
echo.

REM Phase 5: Coverage Report
echo [INFO] Phase 5: Generating Coverage Report
call npm run test:coverage
if errorlevel 1 (
    echo [ERROR] Coverage report failed
    set COVERAGE_FAILED=1
) else (
    echo [SUCCESS] Coverage report generated
    set COVERAGE_FAILED=0
)

echo.
echo 📊 TEST EXECUTION SUMMARY
echo ========================

REM Calculate results
set /a TOTAL_TESTS=5
set /a PASSED_TESTS=0

if %COMPONENT_FAILED%==0 (
    echo ✅ Component Tests: PASSED
    set /a PASSED_TESTS+=1
) else (
    echo ❌ Component Tests: FAILED
)

if %HOOK_FAILED%==0 (
    echo ✅ Hook Tests: PASSED
    set /a PASSED_TESTS+=1
) else (
    echo ❌ Hook Tests: FAILED
)

if %API_FAILED%==0 (
    echo ✅ API Tests: PASSED
    set /a PASSED_TESTS+=1
) else (
    echo ❌ API Tests: FAILED
)

if %DB_FAILED%==0 (
    echo ✅ Database Tests: PASSED
    set /a PASSED_TESTS+=1
) else (
    echo ❌ Database Tests: FAILED
)

if %COVERAGE_FAILED%==0 (
    echo ✅ Coverage Report: GENERATED
    set /a PASSED_TESTS+=1
) else (
    echo ❌ Coverage Report: FAILED
)

echo.
echo 📈 RESULTS: %PASSED_TESTS%/%TOTAL_TESTS% tests passed

REM Final status
if %PASSED_TESTS%==%TOTAL_TESTS% (
    echo [SUCCESS] 🎖️  ALL TESTS PASSED - MILITARY-GRADE QUALITY ACHIEVED!
    echo.
    echo [INFO] Next steps:
    echo   1. Run E2E tests: npm run test:e2e (requires dev server)
    echo   2. View coverage: open coverage/index.html
    echo   3. Deploy with confidence!
) else if %PASSED_TESTS% gtr 2 (
    echo [WARNING] ⚠️  PARTIAL SUCCESS - Some tests passed, review failures
    echo.
    echo [INFO] Recommendation: Fix failing tests before deployment
) else (
    echo [ERROR] 💥 MULTIPLE FAILURES - Review test configuration
    echo.
    echo [INFO] Recommendation: Check TEST-EXECUTION-CHECKLIST.md for troubleshooting
)

echo.
echo 📚 Documentation:
echo   - TEST-EXECUTION-CHECKLIST.md: Detailed testing guide
echo   - TESTING.md: Comprehensive testing documentation
echo   - QUICK-START-TESTING.md: Quick start guide
echo.

pause