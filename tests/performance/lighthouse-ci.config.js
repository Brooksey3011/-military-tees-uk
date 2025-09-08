/**
 * 🚀 LIGHTHOUSE CI CONFIGURATION
 * Automated performance regression testing for Military Tees UK
 */
module.exports = {
  ci: {
    collect: {
      url: [
        // 🏠 Critical user journeys
        'http://localhost:3000',                    // Homepage
        'http://localhost:3000/categories',         // Category listing
        'http://localhost:3000/products/test-product', // Product details
        'http://localhost:3000/cart',               // Cart page
        'http://localhost:3000/checkout',           // Checkout flow
        
        // 📱 Mobile-specific tests
        'http://localhost:3000/?mobile=true',
        'http://localhost:3000/categories?mobile=true'
      ],
      numberOfRuns: 3, // Average across multiple runs
      settings: {
        preset: 'desktop',
        chromeFlags: '--no-sandbox --headless',
        // Simulate slower connections for real-world testing
        throttling: {
          rttMs: 150,
          throughputKbps: 1638,
          requestLatencyMs: 562.5,
          downloadThroughputKbps: 1638,
          uploadThroughputKbps: 675
        }
      }
    },
    
    assert: {
      // 🎯 PERFORMANCE BUDGETS
      assertions: {
        // Core Web Vitals thresholds
        'categories:performance': ['error', { minScore: 0.85 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.90 }],
        'categories:seo': ['error', { minScore: 0.95 }],
        
        // Specific metrics
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
        
        // Resource budgets
        'resource-summary:script:size': ['error', { maxNumericValue: 350000 }], // 350KB JS
        'resource-summary:image:size': ['error', { maxNumericValue: 500000 }],  // 500KB images
        'resource-summary:font:size': ['error', { maxNumericValue: 100000 }],   // 100KB fonts
        'resource-summary:total:size': ['error', { maxNumericValue: 2000000 }], // 2MB total
        
        // E-commerce specific
        'interactive': ['error', { maxNumericValue: 3500 }], // Time to Interactive
        'speed-index': ['error', { maxNumericValue: 2500 }],  // Visual progress
        
        // Bundle analysis
        'unused-javascript': ['error', { maxNumericValue: 50000 }], // Max 50KB unused JS
        'render-blocking-resources': ['error', { maxLength: 3 }],    // Max 3 blocking resources
      }
    },
    
    upload: {
      target: 'temporary-public-storage',
      // Enable for CI/CD integration
      // target: 'lhci',
      // serverBaseUrl: process.env.LHCI_SERVER_URL,
      // token: process.env.LHCI_TOKEN
    },
    
    server: {
      port: 9001,
      storage: {
        storageMethod: 'sql',
        sqlDialect: 'sqlite',
        sqlDatabasePath: './lighthouse-ci-results.db'
      }
    }
  }
}