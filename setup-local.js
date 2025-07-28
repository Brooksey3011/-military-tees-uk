#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🛡️  Military Tees UK - Local Development Setup')
console.log('===============================================\n')

// Check if Node.js version is 18+
const nodeVersion = process.version.match(/^v(\d+)/)[1]
if (parseInt(nodeVersion) < 18) {
  console.error('❌ Node.js 18+ is required. Current version:', process.version)
  console.log('Please update Node.js: https://nodejs.org/')
  process.exit(1)
}

console.log('✅ Node.js version check passed:', process.version)

// Check if package.json exists
if (!fs.existsSync('package.json')) {
  console.error('❌ package.json not found. Make sure you\'re in the project root directory.')
  process.exit(1)
}

console.log('✅ Project structure verified')

// Install dependencies
console.log('\n📦 Installing dependencies...')
try {
  execSync('npm install', { stdio: 'inherit' })
  console.log('✅ Dependencies installed successfully')
} catch (error) {
  console.error('❌ Failed to install dependencies')
  console.error('Try running: npm install --legacy-peer-deps')
  process.exit(1)
}

// Check if .env.local exists
const envLocalPath = '.env.local'
const envExamplePath = '.env.example'

if (!fs.existsSync(envLocalPath)) {
  console.log('\n🔧 Setting up environment file...')
  
  if (fs.existsSync(envExamplePath)) {
    // Copy .env.example to .env.local
    const envExample = fs.readFileSync(envExamplePath, 'utf8')
    
    // Replace with development defaults
    const envLocal = envExample
      .replace('your-nextauth-secret', generateRandomString(32))
      .replace('your-supabase-project-url', 'https://your-project.supabase.co')
      .replace('your-supabase-anon-key', 'your-anon-key-here')
      .replace('your-supabase-service-role-key', 'your-service-role-key-here')
      .replace('development', 'development')
    
    fs.writeFileSync(envLocalPath, envLocal)
    console.log('✅ Created .env.local from template')
    console.log('⚠️  IMPORTANT: You need to add your Supabase credentials to .env.local')
  } else {
    // Create minimal .env.local
    const minimalEnv = `# Military Tees UK - Local Development Environment
# Created by setup script

# Database - Supabase (REQUIRED - Update these!)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"

# Authentication
NEXTAUTH_SECRET="${generateRandomString(32)}"
NEXTAUTH_URL="http://localhost:3000"

# Development
NODE_ENV="development"

# Email (Optional for local development)
EMAIL_PROVIDER="smtp"
SMTP_HOST="localhost"
SMTP_PORT="1025"

# Stripe (Optional - use test keys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your-key"
STRIPE_SECRET_KEY="sk_test_your-key"
`
    
    fs.writeFileSync(envLocalPath, minimalEnv)
    console.log('✅ Created minimal .env.local file')
    console.log('⚠️  IMPORTANT: You need to add your Supabase credentials to .env.local')
  }
} else {
  console.log('✅ Environment file already exists')
}

// Check for required dependencies
console.log('\n🔍 Checking project health...')

const requiredDeps = ['next', 'react', '@supabase/supabase-js', 'typescript']
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies }

let missingDeps = []
requiredDeps.forEach(dep => {
  if (!allDeps[dep]) {
    missingDeps.push(dep)
  }
})

if (missingDeps.length === 0) {
  console.log('✅ All required dependencies found')
} else {
  console.log('⚠️  Missing dependencies:', missingDeps.join(', '))
}

// Final instructions
console.log('\n🎉 Setup Complete!')
console.log('=================')
console.log('')
console.log('Next steps:')
console.log('1. 📝 Edit .env.local with your Supabase credentials')
console.log('   - Get them from: https://supabase.com/dashboard')
console.log('   - You need: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY')
console.log('')
console.log('2. 🗄️  Set up your database:')
console.log('   - Run the SQL files in /database/ folder in your Supabase SQL editor')
console.log('   - Start with schema.sql, then the others')
console.log('')
console.log('3. 🚀 Start the development server:')
console.log('   npm run dev')
console.log('')
console.log('4. 🌐 Open your browser:')
console.log('   http://localhost:3000')
console.log('')
console.log('📖 For detailed setup instructions, see: LOCAL-SETUP.md')
console.log('')
console.log('🛡️  Military Tees UK - Ready for Development!')

function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}