const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(
  'https://rdpjldootsglcbzhfkdi.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkcGpsZG9vdHNnbGNiemhma2RpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzEzNzYyMywiZXhwIjoyMDY4NzEzNjIzfQ.gOErYwxvYfh5D1ofayzIBivOYVCaQ0qEM5kuhOmqxhE'
)

async function setupCompleteDatabase() {
  console.log('🚀 Setting up complete Military Tees UK database...')

  try {
    // Check what's currently in the database
    console.log('📊 Checking current database state...')
    
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*')
    
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('*')
    
    const { data: variants, error: varError } = await supabase
      .from('product_variants')
      .select('*')

    console.log(`Current state:`)
    console.log(`- Categories: ${categories?.length || 0}`)
    console.log(`- Products: ${products?.length || 0}`)
    console.log(`- Variants: ${variants?.length || 0}`)

    // If we have no products, add them
    if (!products || products.length === 0) {
      console.log('📁 Adding categories...')
      
      // First ensure we have categories
      const categoriesToAdd = [
        { name: 'Veterans Collection', slug: 'veterans', description: 'Premium apparel for military veterans' },
        { name: 'Memorial Collection', slug: 'memorial', description: 'Remembrance and memorial designs' },
        { name: 'Kids Collection', slug: 'kids', description: 'Military-themed clothing for children' },
        { name: 'Armoury', slug: 'armoury', description: 'Military equipment inspired designs' },
        { name: 'Mess Hall', slug: 'mess-hall', description: 'Military dining and social themes' },
        { name: 'Parade Square', slug: 'parade-square', description: 'Ceremonial and parade themes' },
        { name: 'Regimental HQ', slug: 'regimental-hq', description: 'Official regimental designs' },
      ]

      // Insert categories (ignore if they exist)
      for (const category of categoriesToAdd) {
        const { error } = await supabase
          .from('categories')
          .upsert(category, { onConflict: 'slug' })
        
        if (error && !error.message.includes('duplicate')) {
          console.log(`Category error for ${category.name}:`, error.message)
        }
      }

      // Get fresh category data
      const { data: newCategories } = await supabase
        .from('categories')
        .select('id, slug')

      const categoryMap = {}
      newCategories?.forEach(cat => {
        categoryMap[cat.slug] = cat.id
      })

      console.log('👕 Adding products...')
      
      const productsToAdd = [
        {
          name: 'British Army Veteran Pride T-Shirt',
          slug: 'british-army-veteran-pride-tshirt',
          description: 'Show your pride in your service with this premium quality British Army veteran t-shirt. Features authentic military styling and comfortable fit.',
          price: 24.99,
          category_id: categoryMap['veterans'],
          main_image_url: '/products/army-medic-corps-tribute.jpg',
          is_active: true,
          featured: true
        },
        {
          name: 'Royal Marines Commando Heritage Tee',
          slug: 'royal-marines-commando-heritage-tee',
          description: 'Commemorate the elite Royal Marines with this heritage design t-shirt. Per Mare Per Terram - By Land and By Sea.',
          price: 26.99,
          category_id: categoryMap['veterans'],
          main_image_url: '/products/royal-marine-commando-tee.jpg',
          is_active: true,
          featured: true
        },
        {
          name: 'Paratrooper Wings Design T-Shirt',
          slug: 'paratrooper-wings-design-tshirt',
          description: 'Honor the airborne forces with this striking paratrooper wings design. Perfect for serving and former paratroopers.',
          price: 25.99,
          category_id: categoryMap['veterans'],
          main_image_url: '/products/paratrooper-wings-design.jpg',
          is_active: true,
          featured: false
        },
        {
          name: 'RAF Fighter Pilot Heritage T-Shirt',
          slug: 'raf-fighter-pilot-heritage-tshirt',
          description: 'Tribute to Royal Air Force fighter pilots with authentic RAF styling and heritage design.',
          price: 27.99,
          category_id: categoryMap['veterans'],
          main_image_url: '/products/raf-fighter-pilot-heritage.jpg',
          is_active: true,
          featured: false
        },
        {
          name: 'SAS Regiment Elite Forces Tee',
          slug: 'sas-regiment-elite-forces-tee',
          description: 'Who Dares Wins - SAS regiment tribute design for special forces appreciation and military pride.',
          price: 29.99,
          category_id: categoryMap['regimental-hq'],
          main_image_url: '/products/sas-regiment-elite-tee.jpg',
          is_active: true,
          featured: true
        },
        {
          name: 'Army Medical Corps Tribute Shirt',
          slug: 'army-medical-corps-tribute-shirt',
          description: 'Honoring the brave medics who serve on the front lines, saving lives in combat zones.',
          price: 24.99,
          category_id: categoryMap['regimental-hq'],
          main_image_url: '/products/army-medic-corps-tribute.jpg',
          is_active: true,
          featured: false
        },
        {
          name: 'Remembrance Day Poppy Design',
          slug: 'remembrance-day-poppy-design',
          description: 'Beautiful poppy design for Remembrance Day - We Will Remember Them. Perfect for memorial events.',
          price: 22.99,
          category_id: categoryMap['memorial'],
          main_image_url: '/products/army-medic-corps-tribute.jpg',
          is_active: true,
          featured: true
        },
        {
          name: 'Fallen Heroes Memorial T-Shirt',
          slug: 'fallen-heroes-memorial-tshirt',
          description: 'Respectful tribute to fallen heroes with memorial design. Honoring those who made the ultimate sacrifice.',
          price: 23.99,
          category_id: categoryMap['memorial'],
          main_image_url: '/products/royal-marine-commando-tee.jpg',
          is_active: true,
          featured: false
        },
        {
          name: 'Kids Future Soldier T-Shirt',
          slug: 'kids-future-soldier-tshirt',
          description: 'Fun military-inspired design for kids who admire our forces. Safe, comfortable, and inspiring.',
          price: 16.99,
          category_id: categoryMap['kids'],
          main_image_url: '/products/paratrooper-wings-design.jpg',
          is_active: true,
          featured: true
        },
        {
          name: 'Military Cadet Training Tee',
          slug: 'military-cadet-training-tee',
          description: 'Perfect for young cadets and military enthusiasts. Builds pride and discipline.',
          price: 18.99,
          category_id: categoryMap['kids'],
          main_image_url: '/products/raf-fighter-pilot-heritage.jpg',
          is_active: true,
          featured: false
        }
      ]

      // Insert products one by one to handle conflicts
      const insertedProducts = []
      for (const product of productsToAdd) {
        const { data, error } = await supabase
          .from('products')
          .upsert(product, { onConflict: 'slug' })
          .select()
        
        if (error) {
          console.log(`Product error for ${product.name}:`, error.message)
        } else {
          insertedProducts.push(...(data || []))
        }
      }

      console.log(`✅ Products processed: ${insertedProducts.length}`)

      // Get all products for variants
      const { data: allProducts } = await supabase
        .from('products')
        .select('*')

      if (allProducts && allProducts.length > 0) {
        console.log('📦 Adding product variants...')
        
        const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
        const colors = ['Black', 'Navy', 'Olive Green', 'Grey']
        
        const variants = []
        
        allProducts.forEach(product => {
          sizes.forEach(size => {
            colors.forEach(color => {
              variants.push({
                product_id: product.id,
                name: `${product.name} - ${size} ${color}`,
                size: size,
                color: color,
                sku: `${product.slug.toUpperCase().replace(/-/g, '_')}_${size}_${color.replace(' ', '_').toUpperCase()}`,
                stock_quantity: Math.floor(Math.random() * 50) + 10,
                image_urls: [product.main_image_url]
              })
            })
          })
        })

        // Insert variants in batches
        const batchSize = 50
        for (let i = 0; i < variants.length; i += batchSize) {
          const batch = variants.slice(i, i + batchSize)
          const { error } = await supabase
            .from('product_variants')
            .upsert(batch, { onConflict: 'sku' })
          
          if (error) {
            console.log(`Variant batch error:`, error.message)
            // Try individual inserts for this batch
            for (const variant of batch) {
              const { error: singleError } = await supabase
                .from('product_variants')
                .upsert(variant, { onConflict: 'sku' })
              
              if (singleError && !singleError.message.includes('duplicate')) {
                console.log(`Single variant error:`, singleError.message)
              }
            }
          }
        }

        console.log(`✅ Variants processed: ${variants.length}`)
      }
    }

    // Final check
    const { data: finalProducts } = await supabase
      .from('products')
      .select('*')
    
    const { data: finalVariants } = await supabase
      .from('product_variants')
      .select('*')

    console.log('🎉 Database setup complete!')
    console.log(`
📊 Final Database State:
- Categories: ${categories?.length || 0}
- Products: ${finalProducts?.length || 0}
- Variants: ${finalVariants?.length || 0}

🛒 Your website now has products for customers to purchase!
✅ Add to basket functionality should work
✅ Product pages should load properly
✅ Search should return results
`)

  } catch (error) {
    console.error('❌ Setup error:', error)
  }
}

// Run the setup
setupCompleteDatabase()