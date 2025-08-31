// Quick test to verify Supabase credentials
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔍 Testing Supabase API Credentials...\n')

console.log('Environment Variables:')
console.log('- SUPABASE_URL:', supabaseUrl ? '✅ SET' : '❌ MISSING')
console.log('- ANON_KEY:', supabaseAnonKey ? '✅ SET' : '❌ MISSING')
console.log('- SERVICE_KEY:', supabaseServiceKey ? '✅ SET' : '❌ MISSING')

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('\n❌ Critical environment variables missing!')
  process.exit(1)
}

// Test client connection
console.log('\n🔗 Testing Supabase Connection...')
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  try {
    // Test basic connection
    console.log('1. Testing auth session...')
    const { data: session, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.log('   ❌ Auth session error:', sessionError.message)
      return false
    }
    console.log('   ✅ Auth connection successful')

    // Test database access
    console.log('2. Testing database access...')
    const { data, error } = await supabase
      .from('customers')
      .select('id')
      .limit(1)

    if (error) {
      if (error.code === '42P01') {
        console.log('   ❌ customers table does not exist')
      } else {
        console.log('   ❌ Database error:', error.message)
      }
      return false
    }
    
    console.log('   ✅ Database connection successful')
    console.log('   📊 customers table accessible')

    // Test service role key if available
    if (supabaseServiceKey) {
      console.log('3. Testing service role key...')
      const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { autoRefreshToken: false, persistSession: false }
      })

      try {
        const { data: users, error: adminError } = await adminClient.auth.admin.listUsers()
        
        if (adminError) {
          console.log('   ❌ Service role error:', adminError.message)
          return false
        }
        
        console.log('   ✅ Service role key working')
        console.log('   👥 Total users in system:', users.users?.length || 0)
      } catch (adminErr) {
        console.log('   ❌ Service role connection failed:', adminErr.message)
        return false
      }
    }

    return true

  } catch (error) {
    console.log('❌ Connection test failed:', error.message)
    return false
  }
}

testConnection().then(success => {
  if (success) {
    console.log('\n🎉 All Supabase API tests PASSED!')
    console.log('✅ Your credentials are working correctly')
    console.log('✅ Registration system should work properly')
  } else {
    console.log('\n🚨 Supabase API tests FAILED!')
    console.log('❌ Please check your environment variables')
    console.log('❌ Registration will not work until this is fixed')
  }
}).catch(error => {
  console.log('\n💥 Test script error:', error.message)
})