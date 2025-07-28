# 🧪 Test Execution Checklist - Military Tees UK

## **STEP-BY-STEP TESTING GUIDE**

Follow this checklist to systematically test the entire framework. Check off each step as you complete it.

---

## **📋 PRE-TESTING SETUP**

### **□ Step 1: Verify Environment**
```bash
# Check Node.js version (should be 18+)
node --version

# Check npm version
npm --version

# Verify you're in the correct directory
pwd
# Should show: .../military-tees-uk
```

### **□ Step 2: Install Dependencies**
```bash
# Install all dependencies
npm install

# Verify critical testing packages are installed
npm list @playwright/test @testing-library/react vitest
```

### **□ Step 3: Environment Variables**
```bash
# Create test environment file (if not exists)
cp .env.example .env.test.local

# Edit .env.test.local with test credentials
# Required variables:
# NODE_ENV=test
# NEXT_PUBLIC_SUPABASE_URL=your_test_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_test_key
```

---

## **🧪 PHASE 1: UNIT TESTS**

### **□ Step 4: Test Setup Validation**
```bash
# Test the test utilities first
npm run test -- src/test/utils.tsx
```
**Expected**: No errors, utility functions load correctly

### **□ Step 5: Component Tests**
```bash
# Test individual components
npm run test:component
```
**Expected Results:**
- ✅ ProductCard tests: 8 tests passing
- ✅ CartDrawer tests: 10 tests passing  
- ✅ Navbar tests: 12 tests passing
- ✅ QuoteForm tests: 12 tests passing
- ✅ AdvancedSearchBar tests: 15 tests passing

**If Errors Occur:**
- Note the exact error message
- Check if component props match test expectations
- Verify import paths are correct

### **□ Step 6: Hook Tests**
```bash
# Test React hooks
npm run test:hooks
```
**Expected**: useCart hook tests should pass (15+ tests)

---

## **🔌 PHASE 2: API TESTS**

### **□ Step 7: API Endpoint Tests**
```bash
# Test API endpoints
npm run test:api
```
**Expected Results:**
- ✅ Products API: 8 tests passing
- ✅ Custom Quote API: 10 tests passing
- ✅ Search API: 12 tests passing

**If Errors Occur:**
- Check if API route files exist
- Verify Supabase mock configuration
- Ensure NextRequest is properly mocked

---

## **🗄️ PHASE 3: DATABASE TESTS**

### **□ Step 8: Database Integration**
```bash
# Test database operations
npm run test:database
```
**Expected**: Database integration tests should pass (20+ tests)

---

## **🎭 PHASE 4: E2E TESTS**

### **□ Step 9: Start Development Server**
```bash
# In Terminal 1 - Start dev server
npm run dev
```
**Expected**: Server starts on http://localhost:3000

### **□ Step 10: Install Playwright Browsers**
```bash
# In Terminal 2 - Install browsers (if not already done)
npx playwright install
```

### **□ Step 11: Basic E2E Tests**
```bash
# Test homepage functionality
npm run test:e2e tests/e2e/homepage.spec.ts
```
**Expected**: Homepage tests pass (10+ tests)

### **□ Step 12: Shopping Flow Tests**
```bash
# Test complete shopping workflow
npm run test:e2e tests/e2e/shopping-flow.spec.ts
```
**Expected**: Shopping flow tests pass (6+ tests)

### **□ Step 13: Custom Orders Tests**
```bash
# Test custom order functionality
npm run test:e2e tests/e2e/custom-orders.spec.ts
```
**Expected**: Custom order tests pass (8+ tests)

### **□ Step 14: Authentication Tests**
```bash
# Test auth flows
npm run test:e2e tests/e2e/auth-flow.spec.ts
```
**Expected**: Auth tests pass (12+ tests)

---

## **🚀 PHASE 5: USER JOURNEY TESTS**

### **□ Step 15: Complete Purchase Journey**
```bash
# Test full purchase workflow
npm run test:journey tests/journeys/complete-purchase.spec.ts
```
**Expected**: Complete purchase journeys pass (6+ tests)

### **□ Step 16: Custom Order Journey**
```bash
# Test custom order lifecycle
npm run test:journey tests/journeys/custom-order-journey.spec.ts
```
**Expected**: Custom order journey passes (5+ tests)

### **□ Step 17: Admin Management Tests**
```bash
# Test admin workflows
npm run test:journey tests/journeys/admin-management.spec.ts
```
**Expected**: Admin management tests pass (5+ tests)

---

## **📊 PHASE 6: COMPREHENSIVE TESTING**

### **□ Step 18: Full Test Suite**
```bash
# Run complete test suite
npm run test:all
```
**Expected**: All tests pass with >80% coverage

### **□ Step 19: Advanced Test Runner**
```bash
# Use advanced test runner
npm run test:runner all
```
**Expected**: Comprehensive test execution with detailed reporting

---

## **✅ SUCCESS CRITERIA**

### **Minimum Passing Requirements:**
- **Unit Tests**: >90% passing (45+ tests)
- **API Tests**: >95% passing (30+ tests)  
- **E2E Tests**: >85% passing (35+ tests)
- **Journey Tests**: >80% passing (15+ tests)
- **Coverage**: >80% overall code coverage

### **Performance Benchmarks:**
- **Unit Tests**: Complete in <30 seconds
- **API Tests**: Complete in <45 seconds
- **E2E Tests**: Complete in <5 minutes
- **Full Suite**: Complete in <10 minutes

---

## **🛠️ TROUBLESHOOTING GUIDE**

### **Common Issues & Solutions:**

#### **Import Errors**
```
Error: Cannot find module '@/components/...'
```
**Solution**: Check if component file exists and path is correct

#### **Supabase Mock Errors**
```
Error: Cannot read properties of undefined (reading 'from')
```
**Solution**: Verify Supabase mock is properly configured

#### **Environment Variable Errors**
```
Error: Missing NEXT_PUBLIC_SUPABASE_URL
```
**Solution**: Check .env.test.local file exists and has correct variables

#### **Playwright Browser Errors**
```
Error: Browser executable not found
```
**Solution**: Run `npx playwright install`

#### **Component Prop Errors**
```
Error: Property 'onQuickView' does not exist
```
**Solution**: Component interface may differ from test - needs adjustment

---

## **📞 HELP & SUPPORT**

### **If Tests Fail:**
1. **Note the exact error message**
2. **Identify which phase failed**
3. **Share the error with Claude for debugging**
4. **Continue with other phases if possible**

### **Quick Commands for Debugging:**
```bash
# Run single test file
npm run test -- specific-test-file.test.tsx

# Run tests in watch mode
npm run test:watch

# Run with verbose output
npm run test -- --verbose

# Generate coverage report
npm run test:coverage
```

---

## **🎖️ FINAL VERIFICATION**

Once all phases complete successfully:

### **□ Step 20: Generate Test Report**
```bash
# Generate comprehensive test coverage
npm run test:coverage

# View coverage report
open coverage/index.html
```

### **□ Step 21: CI/CD Validation**
```bash
# Test CI mode locally
npm run test:runner ci
```

### **□ Step 22: Documentation Review**
- ✅ All tests documented
- ✅ Coverage meets requirements  
- ✅ Performance benchmarks met
- ✅ Security validations passed

---

## **🛡️ MISSION COMPLETE**

When all checkboxes are marked:
- **✅ Unit Testing**: Military-grade component reliability
- **✅ API Testing**: Secure endpoint validation
- **✅ E2E Testing**: Complete user workflow coverage
- **✅ Journey Testing**: Complex scenario validation
- **✅ Performance**: Optimized execution times
- **✅ Security**: Vulnerability-free codebase

**🎖️ Military Tees UK Testing Framework: BATTLE-TESTED & DEPLOYMENT-READY!**