import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rdpjldootsglcbzhfkdi.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkcGpsZG9vdHNnbGNiemhma2RpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzEzNzYyMywiZXhwIjoyMDY4NzEzNjIzfQ.gOErYwxvYfh5D1ofayzIBivOYVCaQ0qEM5kuhOmqxhE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function cleanDatabase() {
  try {
    console.log('🧹 Starting database cleanup...')

    // Get all data first to see what we're working with
    const { data: variants } = await supabase.from('product_variants').select('id')
    const { data: products } = await supabase.from('products').select('id') 
    const { data: categories } = await supabase.from('categories').select('id')

    console.log(`Found: ${variants?.length || 0} variants, ${products?.length || 0} products, ${categories?.length || 0} categories`)

    // Delete in correct order due to foreign key constraints
    if (variants && variants.length > 0) {
      console.log('🗑️ Deleting all product variants...')
      const { error: variantError } = await supabase
        .from('product_variants')
        .delete()
        .in('id', variants.map(v => v.id))
      
      if (variantError) {
        console.error('Error deleting variants:', variantError)
      } else {
        console.log('✅ Deleted all variants')
      }
    }

    if (products && products.length > 0) {
      console.log('🗑️ Deleting all products...')
      const { error: productError } = await supabase
        .from('products')
        .delete()
        .in('id', products.map(p => p.id))
      
      if (productError) {
        console.error('Error deleting products:', productError)  
      } else {
        console.log('✅ Deleted all products')
      }
    }

    if (categories && categories.length > 0) {
      console.log('🗑️ Deleting all categories...')
      const { error: categoryError } = await supabase
        .from('categories')
        .delete()
        .in('id', categories.map(c => c.id))
      
      if (categoryError) {
        console.error('Error deleting categories:', categoryError)
      } else {
        console.log('✅ Deleted all categories')
      }
    }

    console.log('✅ Database cleanup completed!')

  } catch (error) {
    console.error('❌ Cleanup failed:', error)
  }
}

cleanDatabase()