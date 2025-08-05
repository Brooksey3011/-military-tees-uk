import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rdpjldootsglcbzhfkdi.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkcGpsZG9vdHNnbGNiemhma2RpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzEzNzYyMywiZXhwIjoyMDY4NzEzNjIzfQ.gOErYwxvYfh5D1ofayzIBivOYVCaQ0qEM5kuhOmqxhE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkCategories() {
  try {
    console.log('Checking categories in database...')
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
    
    if (error) {
      console.error('Categories error:', error)
    } else {
      console.log('Categories found:')
      categories.forEach(cat => {
        console.log(`- ID: ${cat.id}, Name: ${cat.name}, Slug: ${cat.slug}`)
      })
    }

    console.log('\nChecking products with categories...')
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select(`
        id, name, category_id,
        category:categories(id, name, slug)
      `)
      .limit(3)
    
    if (productsError) {
      console.error('Products error:', productsError)
    } else {
      console.log('Sample products with categories:')
      products.forEach(prod => {
        console.log(`- ${prod.name} -> Category: ${prod.category?.name} (${prod.category?.slug})`)
      })
    }

  } catch (error) {
    console.error('Check failed:', error)
  }
}

checkCategories()