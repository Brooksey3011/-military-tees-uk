import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rdpjldootsglcbzhfkdi.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkcGpsZG9vdHNnbGNiemhma2RpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzEzNzYyMywiZXhwIjoyMDY4NzEzNjIzfQ.gOErYwxvYfh5D1ofayzIBivOYVCaQ0qEM5kuhOmqxhE'

const supabase = createClient(supabaseUrl, supabaseKey)

// Map product slugs to correct categories
const productCategoryMap = {
  'british-army-logo-classic': 'armoury',
  'royal-navy-anchor-heritage': 'armoury', 
  'raf-wings-of-victory': 'armoury',
  'sas-who-dares-wins': 'armoury',
  'parachute-regiment-wings': 'armoury',
  'royal-marines-commando': 'armoury',
  'british-army-veteran': 'veterans',
  'remembrance-poppy-military': 'veterans',
  'military-medic-cross': 'med-centre',
  'tank-regiment-pride': 'mt',
  'military-signals-corps': 'signals',
  'mess-hall-brotherhood': 'mess-hall'
}

async function updateProductCategories() {
  try {
    console.log('Getting categories...')
    
    // Get all categories
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id, slug')
    
    if (catError) {
      console.error('Category fetch error:', catError)
      return
    }

    const categoryMap = {}
    categories.forEach(cat => {
      categoryMap[cat.slug] = cat.id
    })

    console.log('Available categories:', Object.keys(categoryMap))

    // Update each product
    for (const [productSlug, categorySlug] of Object.entries(productCategoryMap)) {
      const categoryId = categoryMap[categorySlug]
      
      if (!categoryId) {
        console.error(`Category ${categorySlug} not found for product ${productSlug}`)
        continue
      }

      const { error } = await supabase
        .from('products')
        .update({ category_id: categoryId })
        .eq('slug', productSlug)

      if (error) {
        console.error(`Failed to update ${productSlug}:`, error)
      } else {
        console.log(`✓ Updated ${productSlug} -> ${categorySlug}`)
      }
    }

    console.log('✅ Product categories updated successfully!')

  } catch (error) {
    console.error('Update failed:', error)
  }
}

updateProductCategories()