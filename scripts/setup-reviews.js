import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const supabaseUrl = 'https://rdpjldootsglcbzhfkdi.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkcGpsZG9vdHNnbGNiemhma2RpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzEzNzYyMywiZXhwIjoyMDY4NzEzNjIzfQ.gOErYwxvYfh5D1ofayzIBivOYVCaQ0qEM5kuhOmqxhE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupReviews() {
  try {
    console.log('🔧 Setting up reviews system...')
    
    // Read and execute the SQL file
    const sql = readFileSync('scripts/create-reviews-table.sql', 'utf8')
    
    // Split SQL into individual statements and execute them
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0)
    
    for (const statement of statements) {
      const trimmedStatement = statement.trim()
      if (trimmedStatement) {
        console.log(`Executing: ${trimmedStatement.split('\n')[0]}...`)
        
        const { error } = await supabase.rpc('execute_sql', { 
          sql_string: trimmedStatement 
        })
        
        if (error && !error.message.includes('already exists')) {
          console.error('SQL Error:', error.message)
        }
      }
    }
    
    console.log('✅ Reviews system setup completed!')
    
    // Test the table creation
    const { data, error } = await supabase
      .from('product_reviews')
      .select('id')
      .limit(1)
    
    if (error) {
      console.error('❌ Table test failed:', error)
    } else {
      console.log('✅ Reviews table is ready!')
    }
    
  } catch (error) {
    console.error('❌ Setup failed:', error)
    process.exit(1)
  }
}

// Alternative direct approach if RPC doesn't work
async function setupReviewsDirect() {
  try {
    console.log('🔧 Setting up reviews system (direct approach)...')
    
    // Create the table directly using Supabase client
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS product_reviews (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        product_id UUID NOT NULL,
        display_name VARCHAR(50) NOT NULL,
        email VARCHAR(255) NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        review_title VARCHAR(100) NOT NULL,
        review_content TEXT NOT NULL,
        images TEXT[],
        video_url TEXT,
        helpful_votes INTEGER DEFAULT 0,
        status VARCHAR(20) DEFAULT 'pending',
        verified_purchase BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );
    `
    
    // Try to execute using raw SQL query
    const { error } = await supabase.rpc('execute_sql', { 
      query: createTableSQL 
    })
    
    if (error) {
      console.log('RPC method failed, trying direct table creation...')
      
      // Manual table verification
      const { data: tables, error: listError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'product_reviews')
      
      console.log('Tables check:', { tables, listError })
    } else {
      console.log('✅ Reviews table created successfully!')
    }
    
  } catch (error) {
    console.error('❌ Direct setup failed:', error)
  }
}

// Run the setup
setupReviews().catch(() => {
  console.log('Falling back to direct approach...')
  setupReviewsDirect()
})