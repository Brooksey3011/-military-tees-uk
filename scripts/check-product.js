import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rdpjldootsglcbzhfkdi.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkcGpsZG9vdHNnbGNiemhma2RpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzEzNzYyMywiZXhwIjoyMDY4NzEzNjIzfQ.gOErYwxvYfh5D1ofayzIBivOYVCaQ0qEM5kuhOmqxhE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkProduct() {
  try {
    console.log('Checking for product with slug: british-army-logo-classic')
    
    const { data: product, error } = await supabase
      .from('products')
      .select(`
        id, name, slug,
        category:categories(id, name, slug),
        variants:product_variants(id, name, size, color, sku, stock_quantity)
      `)
      .eq('slug', 'british-army-logo-classic')
      .eq('is_active', true)
      .single()
    
    if (error) {
      console.error('Product fetch error:', error)
    } else if (product) {
      console.log('Product found:')
      console.log(`- Name: ${product.name}`)
      console.log(`- Category: ${product.category?.name} (${product.category?.slug})`)
      console.log(`- Variants count: ${product.variants?.length || 0}`)
      if (product.variants?.length > 0) {
        console.log('- Sample variants:')
        product.variants.slice(0, 3).forEach(v => {
          console.log(`  - ${v.size} ${v.color}: ${v.stock_quantity} in stock`)
        })
      }
    } else {
      console.log('No product found with that slug')
    }

    console.log('\nChecking all products:')
    const { data: allProducts } = await supabase
      .from('products')
      .select('id, name, slug')
      .limit(5)
    
    allProducts?.forEach(p => {
      console.log(`- ${p.name} (slug: ${p.slug})`)
    })

  } catch (error) {
    console.error('Check failed:', error)
  }
}

checkProduct()