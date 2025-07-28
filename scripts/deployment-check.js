#!/usr/bin/env node

/**
 * Military Tees UK - Deployment Readiness Check
 * 
 * This script validates that the application is ready for Hostinger deployment
 * by checking all critical components, configurations, and dependencies.
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// Logging functions
const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  header: (msg) => console.log(`\n${colors.bold}${colors.magenta}🚀 ${msg}${colors.reset}`)
};

// Configuration checks
const checks = {
  files: [
    'package.json',
    'next.config.ts',
    'src/app/layout.tsx',
    'src/app/page.tsx',
    'src/lib/supabase.ts',
    'src/lib/stripe.ts',
    'database/schema.sql',
    'DEPLOYMENT.md',
    'README.md'
  ],
  
  directories: [
    'src',
    'src/app',
    'src/components',
    'src/lib',
    'public',
    'database'
  ],
  
  packageDependencies: [
    'next',
    'react',
    'react-dom',
    '@supabase/supabase-js',
    'stripe',
    'tailwindcss',
    'framer-motion',
    'zustand',
    'zod'
  ],
  
  apiRoutes: [
    'src/app/api/products/route.ts',
    'src/app/api/categories/route.ts',
    'src/app/api/search/route.ts',
    'src/app/api/checkout/route.ts',
    'src/app/api/webhooks/stripe/route.ts'
  ],
  
  legalPages: [
    'src/app/terms/page.tsx',
    'src/app/privacy/page.tsx',
    'src/app/cookies/page.tsx',
    'src/app/shipping/page.tsx',
    'src/app/returns/page.tsx',
    'src/app/faq/page.tsx'
  ],
  
  adminPages: [
    'src/app/admin/page.tsx',
    'src/app/admin/layout.tsx',
    'src/components/admin/admin-guard.tsx'
  ]
};

// Environment variables that should be configured
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET'
];

let allPassed = true;
let warnings = 0;

// Utility functions
function fileExists(filePath) {
  return fs.existsSync(path.join(process.cwd(), filePath));
}

function directoryExists(dirPath) {
  try {
    return fs.statSync(path.join(process.cwd(), dirPath)).isDirectory();
  } catch (e) {
    return false;
  }
}

function readJsonFile(filePath) {
  try {
    const content = fs.readFileSync(path.join(process.cwd(), filePath), 'utf8');
    return JSON.parse(content);
  } catch (e) {
    return null;
  }
}

// Check functions
function checkFiles() {
  log.header('Checking Critical Files');
  
  checks.files.forEach(file => {
    if (fileExists(file)) {
      log.success(`${file} exists`);
    } else {
      log.error(`${file} is missing`);
      allPassed = false;
    }
  });
}

function checkDirectories() {
  log.header('Checking Directory Structure');
  
  checks.directories.forEach(dir => {
    if (directoryExists(dir)) {
      log.success(`${dir}/ exists`);
    } else {
      log.error(`${dir}/ directory is missing`);
      allPassed = false;
    }
  });
}

function checkPackageJson() {
  log.header('Checking package.json Configuration');
  
  const pkg = readJsonFile('package.json');
  if (!pkg) {
    log.error('package.json could not be read');
    allPassed = false;
    return;
  }
  
  // Check required scripts
  const requiredScripts = ['dev', 'build', 'start', 'lint'];
  requiredScripts.forEach(script => {
    if (pkg.scripts && pkg.scripts[script]) {
      log.success(`Script "${script}" is defined`);
    } else {
      log.error(`Script "${script}" is missing`);
      allPassed = false;
    }
  });
  
  // Check dependencies (in both dependencies and devDependencies)
  checks.packageDependencies.forEach(dep => {
    const inDeps = pkg.dependencies && pkg.dependencies[dep];
    const inDevDeps = pkg.devDependencies && pkg.devDependencies[dep];
    
    if (inDeps || inDevDeps) {
      const location = inDeps ? 'dependencies' : 'devDependencies';
      log.success(`Dependency "${dep}" is installed (${location})`);
    } else {
      log.error(`Dependency "${dep}" is missing`);
      allPassed = false;
    }
  });
  
  // Check Node.js version compatibility
  if (pkg.engines && pkg.engines.node) {
    log.success(`Node.js version specified: ${pkg.engines.node}`);
  } else {
    log.warning('Node.js engine version not specified in package.json');
    warnings++;
  }
}

function checkApiRoutes() {
  log.header('Checking API Routes');
  
  checks.apiRoutes.forEach(route => {
    if (fileExists(route)) {
      log.success(`API route ${route} exists`);
    } else {
      log.error(`API route ${route} is missing`);
      allPassed = false;
    }
  });
}

function checkLegalPages() {
  log.header('Checking Legal Pages');
  
  checks.legalPages.forEach(page => {
    if (fileExists(page)) {
      log.success(`Legal page ${page} exists`);
    } else {
      log.error(`Legal page ${page} is missing`);
      allPassed = false;
    }
  });
}

function checkAdminPages() {
  log.header('Checking Admin System');
  
  checks.adminPages.forEach(page => {
    if (fileExists(page)) {
      log.success(`Admin page ${page} exists`);
    } else {
      log.error(`Admin page ${page} is missing`);
      allPassed = false;
    }
  });
}

function checkNextConfig() {
  log.header('Checking Next.js Configuration');
  
  if (fileExists('next.config.ts')) {
    log.success('next.config.ts exists');
    
    // Read and check configuration
    try {
      const config = fs.readFileSync(path.join(process.cwd(), 'next.config.ts'), 'utf8');
      
      if (config.includes('images:')) {
        log.success('Image optimization configured');
      } else {
        log.warning('Image optimization not configured');
        warnings++;
      }
      
      if (config.includes('headers()')) {
        log.success('Security headers configured');
      } else {
        log.warning('Security headers not configured');
        warnings++;
      }
      
    } catch (e) {
      log.error('Could not read next.config.ts');
      allPassed = false;
    }
  } else {
    log.error('next.config.ts is missing');
    allPassed = false;
  }
}

function checkDatabase() {
  log.header('Checking Database Configuration');
  
  if (fileExists('database/schema.sql')) {
    log.success('Database schema file exists');
  } else {
    log.error('Database schema file is missing');
    allPassed = false;
  }
  
  if (fileExists('database/functions.sql')) {
    log.success('Database functions file exists');
  } else {
    log.warning('Database functions file is missing');
    warnings++;
  }
  
  if (fileExists('src/lib/supabase.ts')) {
    log.success('Supabase client configuration exists');
  } else {
    log.error('Supabase client configuration is missing');
    allPassed = false;
  }
}

function checkStripeIntegration() {
  log.header('Checking Stripe Integration');
  
  if (fileExists('src/lib/stripe.ts')) {
    log.success('Stripe client configuration exists');
  } else {
    log.error('Stripe client configuration is missing');
    allPassed = false;
  }
  
  // Check for webhook handler
  if (fileExists('src/app/api/webhooks/stripe/route.ts')) {
    log.success('Stripe webhook handler exists');
  } else {
    log.error('Stripe webhook handler is missing');
    allPassed = false;
  }
}

function checkEnvironmentVars() {
  log.header('Checking Environment Variables');
  
  requiredEnvVars.forEach(envVar => {
    if (process.env[envVar]) {
      log.success(`${envVar} is set`);
    } else {
      log.warning(`${envVar} is not set (configure in Hostinger panel)`);
      // Don't fail deployment check for env vars as they're set in Hostinger
      warnings++;
    }
  });
}

function checkDeploymentReadiness() {
  log.header('Checking Deployment Readiness');
  
  // Check if build would succeed
  if (fileExists('.next')) {
    log.success('Next.js build artifacts exist');
  } else {
    log.info('Run "npm run build" to test production build');
  }
  
  // Check public assets
  if (directoryExists('public')) {
    const publicFiles = fs.readdirSync(path.join(process.cwd(), 'public'));
    if (publicFiles.length > 0) {
      log.success(`Public assets directory has ${publicFiles.length} files`);
    } else {
      log.warning('Public assets directory is empty');
      warnings++;
    }
  }
  
  // Check favicon
  if (fileExists('public/favicon.ico') || fileExists('src/app/favicon.ico')) {
    log.success('Favicon exists');
  } else {
    log.warning('Favicon not found');
    warnings++;
  }
}

function displaySummary() {
  log.header('Deployment Check Summary');
  
  if (allPassed && warnings === 0) {
    log.success('🎉 All checks passed! Application is ready for Hostinger deployment.');
    console.log(`\n${colors.green}${colors.bold}✅ DEPLOYMENT READY${colors.reset}`);
    console.log(`\n${colors.cyan}Next steps:${colors.reset}`);
    console.log('1. Set up Node.js application in Hostinger control panel');
    console.log('2. Configure environment variables in Hostinger');
    console.log('3. Deploy via Git integration or file upload');
    console.log('4. Run database schema in Supabase');
    console.log('5. Configure Stripe webhooks');
    console.log(`\n${colors.blue}📖 See DEPLOYMENT.md for detailed instructions${colors.reset}`);
  } else if (allPassed && warnings > 0) {
    log.warning(`Application is ready for deployment with ${warnings} warnings.`);
    console.log(`\n${colors.yellow}${colors.bold}⚠️  DEPLOYMENT READY WITH WARNINGS${colors.reset}`);
    console.log(`\n${colors.cyan}Address warnings before deployment for optimal results.${colors.reset}`);
  } else {
    log.error('Application is NOT ready for deployment. Fix the errors above.');
    console.log(`\n${colors.red}${colors.bold}❌ DEPLOYMENT NOT READY${colors.reset}`);
    console.log(`\n${colors.cyan}Fix all errors before attempting deployment.${colors.reset}`);
    process.exit(1);
  }
}

// Main execution
function main() {
  console.log(`${colors.bold}${colors.magenta}🛡️  Military Tees UK - Deployment Readiness Check${colors.reset}`);
  console.log(`${colors.cyan}Checking Hostinger deployment readiness...${colors.reset}\n`);
  
  try {
    checkFiles();
    checkDirectories();
    checkPackageJson();
    checkNextConfig();
    checkApiRoutes();
    checkLegalPages();
    checkAdminPages();
    checkDatabase();
    checkStripeIntegration();
    checkEnvironmentVars();
    checkDeploymentReadiness();
    
    displaySummary();
  } catch (error) {
    log.error(`Deployment check failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the deployment check
if (require.main === module) {
  main();
}

module.exports = {
  main,
  checks,
  requiredEnvVars
};