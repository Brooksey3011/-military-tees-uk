#!/usr/bin/env node

/**
 * Test Runner Script
 * 
 * Provides convenient commands for running different types of tests
 * with proper environment setup and reporting.
 */

const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

// Test configurations
const TEST_CONFIGS = {
  unit: {
    command: 'vitest',
    args: ['run', '--coverage'],
    env: { NODE_ENV: 'test' },
    description: 'Run unit tests with coverage'
  },
  
  unit_watch: {
    command: 'vitest',
    args: ['--watch'],
    env: { NODE_ENV: 'test' },
    description: 'Run unit tests in watch mode'
  },
  
  unit_ui: {
    command: 'vitest',
    args: ['--ui'],
    env: { NODE_ENV: 'test' },
    description: 'Run unit tests with UI interface'
  },
  
  component: {
    command: 'vitest',
    args: ['run', 'src/components/**/*.test.tsx'],
    env: { NODE_ENV: 'test' },
    description: 'Run component tests only'
  },
  
  api: {
    command: 'vitest',
    args: ['run', 'src/app/api/**/*.test.ts'],
    env: { NODE_ENV: 'test' },
    description: 'Run API tests only'
  },
  
  database: {
    command: 'vitest',
    args: ['run', 'src/lib/__tests__/database.test.ts'],
    env: { NODE_ENV: 'test' },
    description: 'Run database integration tests'
  },
  
  hooks: {
    command: 'vitest',
    args: ['run', 'src/hooks/**/*.test.ts'],
    env: { NODE_ENV: 'test' },
    description: 'Run React hooks tests'
  },
  
  e2e: {
    command: 'playwright',
    args: ['test'],
    env: { NODE_ENV: 'test' },
    description: 'Run E2E tests with Playwright'
  },
  
  e2e_ui: {
    command: 'playwright',
    args: ['test', '--ui'],
    env: { NODE_ENV: 'test' },
    description: 'Run E2E tests with Playwright UI'
  },
  
  e2e_headed: {
    command: 'playwright',
    args: ['test', '--headed'],
    env: { NODE_ENV: 'test' },
    description: 'Run E2E tests with visible browser'
  },
  
  journey: {
    command: 'playwright',
    args: ['test', 'tests/journeys/'],
    env: { NODE_ENV: 'test' },
    description: 'Run user journey tests'
  },
  
  smoke: {
    command: 'playwright',
    args: ['test', 'tests/smoke/'],
    env: { NODE_ENV: 'test' },
    description: 'Run smoke tests'
  },
  
  all: {
    description: 'Run all tests (unit, API, E2E)',
    isComposite: true
  },
  
  ci: {
    description: 'Run tests in CI mode',
    isComposite: true
  }
}

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function error(message) {
  log(`❌ ${message}`, 'red')
}

function success(message) {
  log(`✅ ${message}`, 'green')
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue')
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow')
}

function runCommand(command, args = [], env = {}) {
  return new Promise((resolve, reject) => {
    const fullEnv = { ...process.env, ...env }
    
    log(`Running: ${command} ${args.join(' ')}`, 'cyan')
    
    const child = spawn(command, args, {
      stdio: 'inherit',
      env: fullEnv,
      shell: true
    })
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`Command failed with exit code ${code}`))
      }
    })
    
    child.on('error', (err) => {
      reject(err)
    })
  })
}

async function checkTestEnvironment() {
  // Check if test environment files exist
  const testEnv = path.join(process.cwd(), '.env.test.local')
  if (!fs.existsSync(testEnv)) {
    warning('Test environment file (.env.test.local) not found')
    info('Creating sample test environment file...')
    
    const sampleEnv = `
NODE_ENV=test
NEXT_PUBLIC_SUPABASE_URL=https://test.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=test-anon-key
SUPABASE_SERVICE_ROLE_KEY=test-service-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
`
    
    fs.writeFileSync(testEnv, sampleEnv.trim())
    success('Created .env.test.local - please update with your test credentials')
  }
  
  // Check if test setup files exist
  const testSetup = path.join(process.cwd(), 'src/test/setup.ts')
  if (!fs.existsSync(testSetup)) {
    error('Test setup file not found: src/test/setup.ts')
    process.exit(1)
  }
}

async function runCompositeTest(testType) {
  switch (testType) {
    case 'all':
      info('Running all tests sequentially...')
      try {
        log('\n📋 Step 1: Unit Tests', 'bright')
        await runSingleTest('unit')
        
        log('\n🔌 Step 2: API Tests', 'bright')
        await runSingleTest('api')
        
        log('\n🎭 Step 3: E2E Tests', 'bright')
        await runSingleTest('e2e')
        
        success('\n🎉 All tests completed successfully!')
      } catch (err) {
        error(`\n💥 Test suite failed: ${err.message}`)
        process.exit(1)
      }
      break
      
    case 'ci':
      info('Running tests in CI mode...')
      try {
        // Set CI environment
        process.env.CI = 'true'
        
        log('\n🔍 Step 1: Linting', 'bright')
        await runCommand('npm', ['run', 'lint'])
        
        log('\n📝 Step 2: Type Checking', 'bright')
        await runCommand('npm', ['run', 'type-check'])
        
        log('\n🧪 Step 3: Unit Tests', 'bright')
        await runCommand('vitest', ['run', '--coverage', '--reporter=verbose'], {
          NODE_ENV: 'test',
          CI: 'true'
        })
        
        log('\n🔌 Step 4: API Tests', 'bright')
        await runSingleTest('api')
        
        success('\n🎉 CI tests completed successfully!')
      } catch (err) {
        error(`\n💥 CI tests failed: ${err.message}`)
        process.exit(1)
      }
      break
      
    default:
      error(`Unknown composite test: ${testType}`)
      process.exit(1)
  }
}

async function runSingleTest(testType) {
  const config = TEST_CONFIGS[testType]
  
  if (!config) {
    error(`Unknown test type: ${testType}`)
    process.exit(1)
  }
  
  try {
    await runCommand(config.command, config.args, config.env)
    success(`${testType} tests completed successfully`)
  } catch (err) {
    throw new Error(`${testType} tests failed: ${err.message}`)
  }
}

function showHelp() {
  log('\n🧪 Military Tees UK - Test Runner', 'bright')
  log('=====================================\n', 'bright')
  
  log('Usage: npm run test:runner <test-type>\n', 'cyan')
  
  log('Available test types:\n', 'bright')
  
  Object.entries(TEST_CONFIGS).forEach(([key, config]) => {
    const description = config.description || 'No description'
    log(`  ${key.padEnd(15)} - ${description}`, 'green')
  })
  
  log('\nExamples:', 'bright')
  log('  npm run test:runner unit', 'cyan')
  log('  npm run test:runner e2e', 'cyan')
  log('  npm run test:runner all', 'cyan')
  log('  npm run test:runner ci', 'cyan')
  
  log('\nEnvironment:', 'bright')
  log('  Tests run with NODE_ENV=test', 'yellow')
  log('  Make sure .env.test.local is configured', 'yellow')
}

async function generateTestReport() {
  const reportDir = path.join(process.cwd(), 'test-reports')
  
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir)
  }
  
  const report = {
    timestamp: new Date().toISOString(),
    testRun: process.argv[2] || 'unknown',
    environment: {
      node: process.version,
      npm: process.env.npm_version,
      os: process.platform
    },
    status: 'completed'
  }
  
  const reportFile = path.join(reportDir, `test-report-${Date.now()}.json`)
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2))
  
  info(`Test report saved: ${reportFile}`)
}

async function main() {
  const testType = process.argv[2]
  
  if (!testType || testType === 'help' || testType === '--help' || testType === '-h') {
    showHelp()
    return
  }
  
  try {
    log('🔧 Checking test environment...', 'blue')
    await checkTestEnvironment()
    
    log(`\n🚀 Starting ${testType} tests...`, 'bright')
    
    const config = TEST_CONFIGS[testType]
    
    if (config.isComposite) {
      await runCompositeTest(testType)
    } else {
      await runSingleTest(testType)
    }
    
    await generateTestReport()
    
  } catch (err) {
    error(`Test execution failed: ${err.message}`)
    process.exit(1)
  }
}

// Handle process termination
process.on('SIGINT', () => {
  log('\n\n⏹️  Test execution interrupted', 'yellow')
  process.exit(0)
})

process.on('SIGTERM', () => {
  log('\n\n⏹️  Test execution terminated', 'yellow')
  process.exit(0)
})

// Run the main function
main().catch(err => {
  error(`Unexpected error: ${err.message}`)
  process.exit(1)
})