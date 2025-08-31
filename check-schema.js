// Check actual database schema
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔍 Checking actual database schema...\n')

const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function checkSchema() {
  try {
    // Check what columns exist in customers table
    console.log('Checking customers table structure...')
    const { data, error } = await adminClient
      .from('customers')
      .select('*')
      .limit(1)
    
    if (error) {
      console.log('❌ Error querying customers table:', error.message)
      
      // Try to get table info from information_schema if direct query fails
      console.log('\nChecking if table exists...')
      const { data: schemaData, error: schemaError } = await adminClient
        .rpc('exec', { 
          sql: `SELECT column_name, data_type, is_nullable 
                FROM information_schema.columns 
                WHERE table_name = 'customers' 
                ORDER BY ordinal_position;`
        })
      
      if (schemaError) {
        console.log('❌ Schema check failed:', schemaError.message)
      } else {
        console.log('📊 Customer table columns:', schemaData)
      }
      
      return false
    }
    
    if (data && data.length > 0) {
      console.log('✅ customers table accessible')
      console.log('📊 Available columns:', Object.keys(data[0]))
      console.log('🔍 Sample record:', data[0])
    } else {
      console.log('⚠️ customers table is empty')
      // Try to insert a minimal record to see what columns are actually required
      console.log('\nTrying minimal insert to check required columns...')
      const { data: insertData, error: insertError } = await adminClient
        .from('customers')
        .insert({ 
          first_name: 'Test',
          last_name: 'Schema'
        })
        .select()
      
      if (insertError) {
        console.log('❌ Insert failed:', insertError.message)
        console.log('This tells us about the actual schema requirements')
      } else {
        console.log('✅ Insert successful:', insertData)
      }
    }
    
    return true
    
  } catch (error) {
    console.log('❌ Schema check error:', error.message)
    return false
  }
}

checkSchema().then(success => {
  console.log('\n' + (success ? '✅ Schema check completed' : '❌ Schema check failed'))
}).catch(error => {
  console.log('\n💥 Script error:', error.message)
})