import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rdpjldootsglcbzhfkdi.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkcGpsZG9vdHNnbGNiemhma2RpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzEzNzYyMywiZXhwIjoyMDY4NzEzNjIzfQ.gOErYwxvYfh5D1ofayzIBivOYVCaQ0qEM5kuhOmqxhE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSchema() {
  try {
    // Check products table structure
    console.log('Checking products table...')
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(1)
    
    if (productsError) {
      console.error('Products table error:', productsError)
    } else {
      console.log('Products table columns:', Object.keys(products[0] || {}))
    }

    // Check categories table structure
    console.log('\nChecking categories table...')
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .limit(1)
    
    if (categoriesError) {
      console.error('Categories table error:', categoriesError)
    } else {
      console.log('Categories table columns:', Object.keys(categories[0] || {}))
    }

    // Check product_variants table structure
    console.log('\nChecking product_variants table...')
    const { data: variants, error: variantsError } = await supabase
      .from('product_variants')
      .select('*')
      .limit(1)
    
    if (variantsError) {
      console.error('Product variants table error:', variantsError)
    } else {
      console.log('Product variants table columns:', Object.keys(variants[0] || {}))
    }

  } catch (error) {
    console.error('Schema check failed:', error)
  }
}

checkSchema()