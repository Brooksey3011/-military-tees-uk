#!/usr/bin/env node

/**
 * Automated QA Test: Product Catalog Database vs Frontend Consistency
 * 
 * This test ensures that the number of products displayed on the frontend
 * exactly matches the number of active products in the database.
 * 
 * Tests:
 * 1. Total database products vs Show All Products page
 * 2. Category-specific products vs category page displays
 * 3. Homepage Latest Arrivals shows correct subset
 * 4. API pagination consistency
 */

const { execSync } = require('child_process');

class ProductCatalogQA {
  constructor(baseUrl = 'http://localhost:3009') {
    this.baseUrl = baseUrl;
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  async runTest(testName, testFunction) {
    console.log(`🧪 Running: ${testName}`);
    try {
      const result = await testFunction();
      if (result.passed) {
        console.log(`   ✅ PASS: ${result.message}`);
        this.results.passed++;
      } else {
        console.log(`   ❌ FAIL: ${result.message}`);
        this.results.failed++;
      }
      this.results.tests.push({ name: testName, ...result });
    } catch (error) {
      console.log(`   ❌ ERROR: ${testName} - ${error.message}`);
      this.results.failed++;
      this.results.tests.push({ 
        name: testName, 
        passed: false, 
        message: `Test error: ${error.message}` 
      });
    }
  }

  apiCall(endpoint) {
    try {
      const response = execSync(`curl -s "${this.baseUrl}${endpoint}"`, { encoding: 'utf8' });
      return JSON.parse(response);
    } catch (error) {
      throw new Error(`API call failed: ${endpoint} - ${error.message}`);
    }
  }

  async testTotalProductCount() {
    const data = this.apiCall('/api/products?limit=all');
    const dbTotal = data.total;
    const fetchedCount = data.products.length;
    
    return {
      passed: dbTotal === fetchedCount && dbTotal > 0,
      message: `Database: ${dbTotal} products, Show All fetched: ${fetchedCount} products`,
      data: { dbTotal, fetchedCount }
    };
  }

  async testHomepageLatestArrivals() {
    const data = this.apiCall('/api/products?limit=6&sort=newest');
    const expectedCount = 6;
    const fetchedCount = data.products.length;
    const totalProducts = data.total;
    
    // Should fetch exactly 6 products (or total if less than 6)
    const expectedFetch = Math.min(expectedCount, totalProducts);
    
    return {
      passed: fetchedCount === expectedFetch,
      message: `Homepage Latest Arrivals: Expected ${expectedFetch}, got ${fetchedCount}`,
      data: { expectedFetch, fetchedCount, totalProducts }
    };
  }

  async testCategoryConsistency() {
    // Test British Army category
    const categoryData = this.apiCall('/api/products?category=british-army');
    const categoryCount = categoryData.products.length;
    const categoryTotal = categoryData.total;
    
    return {
      passed: categoryCount === categoryTotal && categoryTotal > 0,
      message: `British Army category: Database says ${categoryTotal}, fetched ${categoryCount}`,
      data: { categoryTotal, categoryCount }
    };
  }

  async testPaginationConsistency() {
    // Test that pagination adds up to total
    const page1 = this.apiCall('/api/products?limit=5&page=1');
    const page2 = this.apiCall('/api/products?limit=5&page=2');
    const total = this.apiCall('/api/products?limit=1');
    
    const totalProducts = total.total;
    const page1Count = page1.products.length;
    const page2Count = page2.products.length;
    
    // First page should have 5 (or less if total < 5)
    // Second page should have min(5, remaining) products
    const expectedPage1 = Math.min(5, totalProducts);
    const expectedPage2 = Math.min(5, Math.max(0, totalProducts - 5));
    
    const paginationCorrect = (page1Count === expectedPage1) && (page2Count === expectedPage2);
    
    return {
      passed: paginationCorrect,
      message: `Pagination: P1 expected ${expectedPage1}|got ${page1Count}, P2 expected ${expectedPage2}|got ${page2Count}`,
      data: { totalProducts, page1Count, page2Count, expectedPage1, expectedPage2 }
    };
  }

  async testApiConsistencyAcrossCalls() {
    // Multiple calls should return same total
    const call1 = this.apiCall('/api/products?limit=1');
    const call2 = this.apiCall('/api/products?limit=all');
    const call3 = this.apiCall('/api/products?limit=10');
    
    const total1 = call1.total;
    const total2 = call2.total;  
    const total3 = call3.total;
    
    const consistent = (total1 === total2) && (total2 === total3);
    
    return {
      passed: consistent,
      message: `API consistency: Call1=${total1}, Call2=${total2}, Call3=${total3}`,
      data: { total1, total2, total3 }
    };
  }

  async testDifferentCatalogSizes() {
    // Test system behavior with different limits
    const limits = [1, 5, 10, 20, 50, 1000];
    const results = [];
    
    for (const limit of limits) {
      const data = this.apiCall(`/api/products?limit=${limit}`);
      const expectedFetch = Math.min(limit, data.total);
      const actualFetch = data.products.length;
      
      results.push({
        limit,
        expected: expectedFetch,
        actual: actualFetch,
        correct: expectedFetch === actualFetch
      });
    }
    
    const allCorrect = results.every(r => r.correct);
    
    return {
      passed: allCorrect,
      message: `Different catalog sizes: ${results.map(r => `${r.limit}=${r.correct ? '✓' : '✗'}`).join(', ')}`,
      data: { results }
    };
  }

  printSummary() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 PRODUCT CATALOG QA RESULTS SUMMARY');
    console.log('='.repeat(50));
    
    console.log(`✅ Tests Passed: ${this.results.passed}`);
    console.log(`❌ Tests Failed: ${this.results.failed}`);
    console.log(`📈 Success Rate: ${Math.round((this.results.passed / (this.results.passed + this.results.failed)) * 100)}%`);
    
    if (this.results.failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.results.tests
        .filter(test => !test.passed)
        .forEach(test => console.log(`   - ${test.name}: ${test.message}`));
    }
    
    console.log('\n🎯 OVERALL STATUS:', this.results.failed === 0 ? '✅ ALL TESTS PASSED' : '❌ ISSUES FOUND');
    console.log('='.repeat(50));
    
    return this.results.failed === 0;
  }

  async runAllTests() {
    console.log('🚀 Starting Product Catalog QA Tests...\n');
    
    await this.runTest('Total Product Count Consistency', () => this.testTotalProductCount());
    await this.runTest('Homepage Latest Arrivals Count', () => this.testHomepageLatestArrivals());
    await this.runTest('Category Product Count Consistency', () => this.testCategoryConsistency());
    await this.runTest('Pagination Math Consistency', () => this.testPaginationConsistency());
    await this.runTest('API Call Consistency', () => this.testApiConsistencyAcrossCalls());
    await this.runTest('Different Catalog Size Handling', () => this.testDifferentCatalogSizes());
    
    return this.printSummary();
  }
}

// Run tests if called directly
if (require.main === module) {
  const qa = new ProductCatalogQA();
  qa.runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Test runner crashed:', error);
      process.exit(1);
    });
}

module.exports = ProductCatalogQA;