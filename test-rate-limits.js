#!/usr/bin/env node

const baseUrl = 'http://localhost:3000';

async function testRateLimit() {
  console.log('🧪 Testing Rate Limiting Implementation\n');

  // Test 1: Authentication rate limiting
  console.log('1. Testing Authentication Rate Limiting (5 requests max per 15min)');
  for (let i = 1; i <= 7; i++) {
    try {
      const response = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `test${i}@example.com`,
          password: 'InvalidPassword',
          firstName: 'Test',
          lastName: 'User'
        })
      });

      const result = await response.json();
      const headers = {
        remaining: response.headers.get('x-ratelimit-remaining'),
        limit: response.headers.get('x-ratelimit-limit'),
        reset: response.headers.get('x-ratelimit-reset'),
        retryAfter: response.headers.get('retry-after')
      };

      console.log(`  Request ${i}: Status ${response.status}`);
      console.log(`    Remaining: ${headers.remaining}/${headers.limit}`);
      if (response.status === 429) {
        console.log(`    ❌ Rate limited! Retry after: ${headers.retryAfter} seconds`);
        console.log(`    Message: ${result.error}`);
        break;
      } else {
        console.log(`    ✅ Allowed - ${result.error || result.message}`);
      }
    } catch (error) {
      console.log(`  Request ${i}: Error - ${error.message}`);
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 2: Newsletter rate limiting
  console.log('2. Testing Contact Form Rate Limiting (5 requests max per hour)');
  for (let i = 1; i <= 7; i++) {
    try {
      const response = await fetch(`${baseUrl}/api/newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `newsletter${i}@example.com`,
          firstName: 'Test',
          lastName: 'User'
        })
      });

      const result = await response.json();
      const headers = {
        remaining: response.headers.get('x-ratelimit-remaining'),
        limit: response.headers.get('x-ratelimit-limit'),
        reset: response.headers.get('x-ratelimit-reset'),
        retryAfter: response.headers.get('retry-after')
      };

      console.log(`  Request ${i}: Status ${response.status}`);
      console.log(`    Remaining: ${headers.remaining}/${headers.limit}`);
      if (response.status === 429) {
        console.log(`    ❌ Rate limited! Retry after: ${headers.retryAfter} seconds`);
        console.log(`    Message: ${result.error}`);
        break;
      } else {
        console.log(`    ✅ Allowed - ${result.error || result.message || 'Success'}`);
      }
    } catch (error) {
      console.log(`  Request ${i}: Error - ${error.message}`);
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 3: Password reset rate limiting (very strict)
  console.log('3. Testing Password Reset Rate Limiting (3 requests max per hour)');
  for (let i = 1; i <= 5; i++) {
    try {
      const response = await fetch(`${baseUrl}/api/auth/password-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `reset${i}@example.com`,
          reset_url: 'https://example.com/reset'
        })
      });

      const result = await response.json();
      const headers = {
        remaining: response.headers.get('x-ratelimit-remaining'),
        limit: response.headers.get('x-ratelimit-limit'),
        reset: response.headers.get('x-ratelimit-reset'),
        retryAfter: response.headers.get('retry-after')
      };

      console.log(`  Request ${i}: Status ${response.status}`);
      console.log(`    Remaining: ${headers.remaining}/${headers.limit}`);
      if (response.status === 429) {
        console.log(`    ❌ Rate limited! Retry after: ${headers.retryAfter} seconds`);
        console.log(`    Message: ${result.error}`);
        break;
      } else {
        console.log(`    ✅ Allowed - ${result.error || result.message || 'Success'}`);
      }
    } catch (error) {
      console.log(`  Request ${i}: Error - ${error.message}`);
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n✅ Rate limiting test completed!');
  console.log('\nRate Limit Configuration:');
  console.log('  • Authentication: 5 requests per 15 minutes');
  console.log('  • Password Reset: 3 requests per hour');
  console.log('  • Contact Forms: 5 requests per hour');
  console.log('  • Payment/Checkout: 10 requests per 10 minutes');
  console.log('  • General API: 100 requests per minute');
}

// Run the test
testRateLimit().catch(console.error);