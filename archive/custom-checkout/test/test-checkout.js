// Test Script for Military Tees UK Checkout System
// Run with: node test/test-checkout.js

const https = require('https');

// Configuration
const BASE_URL = process.env.TEST_BASE_URL || 'https://military-tees-checkout.vercel.app';
const TEST_DATA = {
  items: [
    {
      id: '1',
      name: 'Royal Marines Commando T-Shirt',
      price: 24.99,
      quantity: 1,
      size: 'Large',
      color: 'Olive Green'
    },
    {
      id: '2',
      name: 'SAS Wings Cap',
      price: 19.99,
      quantity: 1,
      size: 'One Size',
      color: 'Black'
    }
  ],
  shippingAddress: {
    firstName: 'John',
    lastName: 'Smith',
    email: 'test@example.com',
    address1: '123 Test Street',
    address2: 'Flat 4B',
    city: 'London',
    postcode: 'SW1A 1AA',
    country: 'GB',
    phone: '+44 7123 456789'
  },
  deliveryOption: 'standard',
  promoCode: 'MILITARY10'
};

// Test utilities
class CheckoutTester {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.results = [];
  }

  async runTests() {
    console.log('🧪 Starting Military Tees UK Checkout Tests...\n');
    console.log(`Base URL: ${this.baseUrl}\n`);

    // Test suite
    await this.testStripeConfig();
    await this.testPromoValidation();
    await this.testCreatePaymentIntent();
    await this.testUpdatePaymentIntent();
    await this.testInvalidRequests();

    // Results summary
    this.printResults();
  }

  async testStripeConfig() {
    console.log('📋 Testing Stripe Configuration...');
    
    try {
      const response = await this.makeRequest('GET', '/api/config/stripe');
      
      if (response.publishableKey && response.publishableKey.startsWith('pk_')) {
        this.logSuccess('Stripe config', 'Publishable key configured correctly');
      } else {
        this.logError('Stripe config', 'Invalid or missing publishable key');
      }

      if (response.supportedPaymentMethods && response.supportedPaymentMethods.length > 0) {
        this.logSuccess('Payment methods', `${response.supportedPaymentMethods.length} methods supported`);
      } else {
        this.logWarning('Payment methods', 'No payment methods configured');
      }

    } catch (error) {
      this.logError('Stripe config', error.message);
    }
  }

  async testPromoValidation() {
    console.log('\n🎟️ Testing Promo Code Validation...');

    // Test valid promo code
    try {
      const validPromo = await this.makeRequest('POST', '/api/validate-promo', {
        code: 'MILITARY10',
        subtotal: 44.98
      });

      if (validPromo.valid && validPromo.discount === 10) {
        this.logSuccess('Valid promo', 'MILITARY10 validated correctly');
      } else {
        this.logError('Valid promo', 'Failed to validate MILITARY10');
      }
    } catch (error) {
      this.logError('Valid promo', error.message);
    }

    // Test invalid promo code
    try {
      const invalidPromo = await this.makeRequest('POST', '/api/validate-promo', {
        code: 'INVALID123',
        subtotal: 44.98
      });

      if (!invalidPromo.valid) {
        this.logSuccess('Invalid promo', 'Correctly rejected invalid code');
      } else {
        this.logError('Invalid promo', 'Should have rejected invalid code');
      }
    } catch (error) {
      this.logError('Invalid promo', error.message);
    }

    // Test minimum amount requirement
    try {
      const belowMinPromo = await this.makeRequest('POST', '/api/validate-promo', {
        code: 'FIRSTORDER',
        subtotal: 10 // Below minimum
      });

      if (!belowMinPromo.valid && belowMinPromo.error.includes('minimum')) {
        this.logSuccess('Minimum amount', 'Correctly enforced minimum amount');
      } else {
        this.logError('Minimum amount', 'Failed to enforce minimum amount');
      }
    } catch (error) {
      this.logError('Minimum amount', error.message);
    }
  }

  async testCreatePaymentIntent() {
    console.log('\n💳 Testing Payment Intent Creation...');

    try {
      const response = await this.makeRequest('POST', '/api/create-payment-intent', {
        items: TEST_DATA.items,
        shippingAddress: TEST_DATA.shippingAddress,
        deliveryOption: TEST_DATA.deliveryOption,
        promoCode: TEST_DATA.promoCode,
        amount: Math.round(54.47 * 100) // Expected total in pence
      });

      if (response.clientSecret && response.clientSecret.startsWith('pi_')) {
        this.logSuccess('Payment intent', 'Created successfully with client secret');
        this.paymentIntentId = response.clientSecret.split('_secret_')[0];
      } else {
        this.logError('Payment intent', 'Invalid or missing client secret');
      }

      if (response.appliedPromo && response.appliedPromo.code === 'MILITARY10') {
        this.logSuccess('Promo application', 'Promo code applied during payment intent creation');
      } else {
        this.logWarning('Promo application', 'Promo code not applied');
      }

      if (response.deliveryOption && response.deliveryOption.price === 4.99) {
        this.logSuccess('Delivery option', 'Standard delivery correctly configured');
      } else {
        this.logError('Delivery option', 'Delivery option not configured correctly');
      }

    } catch (error) {
      this.logError('Payment intent', error.message);
    }
  }

  async testUpdatePaymentIntent() {
    if (!this.paymentIntentId) {
      this.logWarning('Payment intent update', 'Skipped - no payment intent ID');
      return;
    }

    console.log('\n🔄 Testing Payment Intent Update...');

    try {
      const response = await this.makeRequest('POST', '/api/update-payment-intent', {
        paymentIntentId: this.paymentIntentId,
        amount: Math.round(58.46 * 100), // New total with express delivery
        deliveryOption: 'express',
        promoCode: 'MILITARY10'
      });

      if (response.success) {
        this.logSuccess('Payment update', 'Payment intent updated successfully');
      } else {
        this.logError('Payment update', 'Failed to update payment intent');
      }

      if (response.deliveryOption && response.deliveryOption.price === 8.99) {
        this.logSuccess('Delivery update', 'Express delivery correctly applied');
      } else {
        this.logError('Delivery update', 'Failed to update delivery option');
      }

    } catch (error) {
      this.logError('Payment update', error.message);
    }
  }

  async testInvalidRequests() {
    console.log('\n🚫 Testing Error Handling...');

    // Test missing required fields
    try {
      await this.makeRequest('POST', '/api/create-payment-intent', {
        items: [],
        shippingAddress: {}
      });
      this.logError('Validation', 'Should have rejected empty request');
    } catch (error) {
      if (error.message.includes('required')) {
        this.logSuccess('Validation', 'Correctly validated required fields');
      } else {
        this.logError('Validation', 'Unexpected error: ' + error.message);
      }
    }

    // Test invalid delivery option
    try {
      await this.makeRequest('POST', '/api/create-payment-intent', {
        items: TEST_DATA.items,
        shippingAddress: TEST_DATA.shippingAddress,
        deliveryOption: 'invalid_option',
        amount: 5000
      });
      this.logError('Delivery validation', 'Should have rejected invalid delivery option');
    } catch (error) {
      if (error.message.includes('Invalid delivery option')) {
        this.logSuccess('Delivery validation', 'Correctly validated delivery options');
      } else {
        this.logError('Delivery validation', 'Unexpected error: ' + error.message);
      }
    }

    // Test minimum amount
    try {
      await this.makeRequest('POST', '/api/create-payment-intent', {
        items: TEST_DATA.items,
        shippingAddress: TEST_DATA.shippingAddress,
        amount: 25 // Below minimum
      });
      this.logError('Amount validation', 'Should have rejected low amount');
    } catch (error) {
      if (error.message.includes('minimum')) {
        this.logSuccess('Amount validation', 'Correctly enforced minimum amount');
      } else {
        this.logError('Amount validation', 'Unexpected error: ' + error.message);
      }
    }
  }

  async makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(this.baseUrl + path);
      const options = {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname + url.search,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Military-Tees-Test/1.0'
        }
      };

      const req = https.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          try {
            const parsed = JSON.parse(responseData);
            
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(parsed);
            } else {
              reject(new Error(parsed.error || `HTTP ${res.statusCode}`));
            }
          } catch (error) {
            reject(new Error(`Parse error: ${error.message}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`Request error: ${error.message}`));
      });

      if (data) {
        req.write(JSON.stringify(data));
      }

      req.end();
    });
  }

  logSuccess(test, message) {
    this.results.push({ test, status: 'PASS', message });
    console.log(`  ✅ ${test}: ${message}`);
  }

  logError(test, message) {
    this.results.push({ test, status: 'FAIL', message });
    console.log(`  ❌ ${test}: ${message}`);
  }

  logWarning(test, message) {
    this.results.push({ test, status: 'WARN', message });
    console.log(`  ⚠️ ${test}: ${message}`);
  }

  printResults() {
    console.log('\n📊 Test Results Summary');
    console.log('========================\n');

    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const warnings = this.results.filter(r => r.status === 'WARN').length;

    console.log(`Total Tests: ${this.results.length}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⚠️ Warnings: ${warnings}\n`);

    if (failed > 0) {
      console.log('❌ Failed Tests:');
      this.results
        .filter(r => r.status === 'FAIL')
        .forEach(r => console.log(`  - ${r.test}: ${r.message}`));
      console.log('');
    }

    if (warnings > 0) {
      console.log('⚠️ Warnings:');
      this.results
        .filter(r => r.status === 'WARN')
        .forEach(r => console.log(`  - ${r.test}: ${r.message}`));
      console.log('');
    }

    const successRate = Math.round((passed / this.results.length) * 100);
    console.log(`Success Rate: ${successRate}%`);

    if (successRate >= 80) {
      console.log('🎉 Checkout system is ready for production!');
    } else if (successRate >= 60) {
      console.log('⚠️ Checkout system needs some fixes before production');
    } else {
      console.log('🚨 Checkout system has critical issues - do not deploy');
    }
  }
}

// Run tests
const tester = new CheckoutTester(BASE_URL);
tester.runTests().catch(error => {
  console.error('Test runner error:', error);
  process.exit(1);
});