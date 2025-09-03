import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rdpjldootsglcbzhfkdi.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkcGpsZG9vdHNnbGNiemhma2RpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzEzNzYyMywiZXhwIjoyMDY4NzEzNjIzfQ.gOErYwxvYfh5D1ofayzIBivOYVCaQ0qEM5kuhOmqxhE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function restructureCategories() {
  try {
    console.log('🔧 Starting category restructure...')

    // 1. First, delete all existing products and variants to clean slate
    console.log('🗑️ Cleaning existing products and variants...')
    
    const { error: variantDeleteError } = await supabase
      .from('product_variants')
      .delete()
      .neq('id', 'dummy') // Delete all

    if (variantDeleteError) {
      console.error('Error deleting variants:', variantDeleteError)
    }

    const { error: productDeleteError } = await supabase
      .from('products')
      .delete()
      .neq('id', 'dummy') // Delete all

    if (productDeleteError) {
      console.error('Error deleting products:', productDeleteError)
    }

    // 2. Delete all existing categories
    console.log('🗑️ Cleaning existing categories...')
    const { error: categoryDeleteError } = await supabase
      .from('categories')
      .delete()
      .neq('id', 'dummy') // Delete all

    if (categoryDeleteError) {
      console.error('Error deleting categories:', categoryDeleteError)
    }

    // 3. Create new category structure
    console.log('📁 Creating new category structure...')
    
    const newCategories = [
      // Military dropdown categories (4 main services)
      {
        name: 'British Army',
        slug: 'british-army',
        description: 'British Army themed apparel and designs',
        sort_order: 1
      },
      {
        name: 'Royal Navy',
        slug: 'royal-navy', 
        description: 'Royal Navy themed apparel and designs',
        sort_order: 2
      },
      {
        name: 'Royal Air Force',
        slug: 'royal-air-force',
        description: 'Royal Air Force themed apparel and designs',
        sort_order: 3
      },
      {
        name: 'Royal Marines',
        slug: 'royal-marines',
        description: 'Royal Marines themed apparel and designs',
        sort_order: 4
      },
      // Navigation categories
      {
        name: 'Memorial Collection',
        slug: 'memorial',
        description: 'Remembrance and memorial designs',
        sort_order: 5
      },
      {
        name: 'Veterans',
        slug: 'veterans',
        description: 'Honoring those who served with pride',
        sort_order: 6
      },
      {
        name: 'Kids Collection',
        slug: 'kids',
        description: 'Military-themed clothing for children',
        sort_order: 7
      },
      {
        name: 'Sale Items',
        slug: 'sale',
        description: 'Discounted military apparel',
        sort_order: 8
      }
    ]

    const { data: categories, error: categoryError } = await supabase
      .from('categories')
      .insert(newCategories)
      .select()

    if (categoryError) {
      console.error('Error creating categories:', categoryError)
      return
    }

    console.log(`✅ Created ${categories.length} new categories`)

    // 4. Create new products with proper images and stock
    console.log('🛍️ Creating new products with live data...')

    const products = [
      // British Army Products
      {
        name: 'British Army Logo Tee',
        slug: 'british-army-logo-tee',
        description: 'Classic British Army logo design on premium cotton tee. Perfect for showing your pride in the British Army.',
        price: 19.99,
        main_image_url: '/images/products/placeholder-tshirt.svg',
        category_id: categories.find(c => c.slug === 'british-army').id,
        featured: true
      },
      {
        name: 'Army Veteran Pride Shirt', 
        slug: 'army-veteran-pride-shirt',
        description: 'Honor your service with this Army veteran pride shirt. Quality design for those who served.',
        price: 21.99,
        main_image_url: '/images/products/placeholder-tshirt.svg',
        category_id: categories.find(c => c.slug === 'british-army').id
      },
      {
        name: 'Paratrooper Wings Tee',
        slug: 'paratrooper-wings-tee', 
        description: 'Elite Paratrooper wings design. For those who jump into action.',
        price: 22.99,
        main_image_url: '/images/products/placeholder-tshirt.svg',
        category_id: categories.find(c => c.slug === 'british-army').id
      },

      // Royal Navy Products
      {
        name: 'Royal Navy Anchor Tee',
        slug: 'royal-navy-anchor-tee',
        description: 'Traditional Royal Navy anchor design. Sailing with pride since 1660.',
        price: 20.99,
        main_image_url: '/images/products/placeholder-tshirt.svg',
        category_id: categories.find(c => c.slug === 'royal-navy').id,
        featured: true
      },
      {
        name: 'Fleet Air Arm Wings',
        slug: 'fleet-air-arm-wings',
        description: 'Royal Navy Fleet Air Arm wings design. Naval aviation excellence.',
        price: 21.99,
        main_image_url: '/images/products/placeholder-tshirt.svg',
        category_id: categories.find(c => c.slug === 'royal-navy').id
      },

      // Royal Air Force Products  
      {
        name: 'RAF Wings Classic Tee',
        slug: 'raf-wings-classic-tee',
        description: 'Classic Royal Air Force wings design. Per Ardua Ad Astra - Through adversity to the stars.',
        price: 20.99,
        main_image_url: '/images/products/placeholder-tshirt.svg',
        category_id: categories.find(c => c.slug === 'royal-air-force').id,
        featured: true
      },
      {
        name: 'Spitfire Squadron Tee',
        slug: 'spitfire-squadron-tee',
        description: 'Iconic Spitfire aircraft design. Celebrating RAF heritage and the Battle of Britain.',
        price: 23.99,
        main_image_url: '/images/products/placeholder-tshirt.svg',
        category_id: categories.find(c => c.slug === 'royal-air-force').id
      },

      // Royal Marines Products
      {
        name: 'Royal Marines Commando Tee',
        slug: 'royal-marines-commando-tee', 
        description: 'Royal Marines commando design. Per Mare Per Terram - By Sea By Land.',
        price: 22.99,
        main_image_url: '/images/products/placeholder-tshirt.svg',
        category_id: categories.find(c => c.slug === 'royal-marines').id,
        featured: true
      },
      {
        name: 'Green Beret Pride Shirt',
        slug: 'green-beret-pride-shirt',
        description: 'Elite Royal Marines green beret design. For the few, the proud, the Marines.',
        price: 21.99,
        main_image_url: '/images/products/placeholder-tshirt.svg',
        category_id: categories.find(c => c.slug === 'royal-marines').id
      },

      // Memorial Collection
      {
        name: 'Remembrance Poppy Tee',
        slug: 'remembrance-poppy-tee',
        description: 'Beautiful remembrance poppy design. Lest we forget those who made the ultimate sacrifice.',
        price: 19.99,
        main_image_url: '/images/products/placeholder-tshirt.svg',
        category_id: categories.find(c => c.slug === 'memorial').id
      },
      {
        name: 'Memorial Cross Design',
        slug: 'memorial-cross-design',
        description: 'Respectful memorial cross design honoring fallen heroes.',
        price: 20.99,
        main_image_url: '/images/products/placeholder-tshirt.svg',
        category_id: categories.find(c => c.slug === 'memorial').id
      },

      // Veterans Collection
      {
        name: 'Veteran Pride Tee',
        slug: 'veteran-pride-tee',
        description: 'Show your veteran pride with this classic design. Thank you for your service.',
        price: 21.99,
        main_image_url: '/images/products/placeholder-tshirt.svg',
        category_id: categories.find(c => c.slug === 'veterans').id
      },

      // Kids Collection
      {
        name: 'Little Soldier Tee',
        slug: 'little-soldier-tee',
        description: 'Adorable military design for little ones. Following in proud footsteps.',
        price: 15.99,
        main_image_url: '/images/products/placeholder-tshirt.svg',
        category_id: categories.find(c => c.slug === 'kids').id
      }
    ]

    const { data: insertedProducts, error: productError } = await supabase
      .from('products')
      .insert(products)
      .select()

    if (productError) {
      console.error('Error creating products:', productError)
      return
    }

    console.log(`✅ Created ${insertedProducts.length} new products`)

    // 5. Create variants for each product with proper stock levels
    console.log('📦 Creating product variants with stock...')

    const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']
    const colors = ['Black', 'Navy', 'Olive', 'White', 'Grey']

    let variantCount = 0
    
    for (const product of insertedProducts) {
      const variants = []
      
      for (const size of sizes) {
        for (const color of colors) {
          variants.push({
            product_id: product.id,
            sku: `${product.slug.toUpperCase().replace(/-/g, '_')}_${size}_${color.toUpperCase()}`,
            name: `${size} - ${color}`,
            size: size,
            color: color,
            price: 0, // Use product price
            stock_quantity: Math.floor(Math.random() * 20) + 15, // Random stock 15-35
            image_urls: ['/images/products/placeholder-tshirt.svg'],
            is_active: true
          })
        }
      }

      const { error: variantError } = await supabase
        .from('product_variants')
        .insert(variants)

      if (variantError) {
        console.error(`Error creating variants for ${product.name}:`, variantError)
      } else {
        variantCount += variants.length
        console.log(`✅ Created ${variants.length} variants for ${product.name}`)
      }
    }

    console.log(`✅ Total variants created: ${variantCount}`)
    console.log(`✅ Category restructure completed successfully!`)
    console.log(`
📊 NEW STRUCTURE SUMMARY:
- 4 Military Categories: British Army, Royal Navy, Royal Air Force, Royal Marines  
- 4 Navigation Categories: Memorial, Veterans, Kids, Sale
- ${insertedProducts.length} Products with realistic descriptions
- ${variantCount} Product variants with stock levels 15-35 each
- All using working placeholder images
    `)

  } catch (error) {
    console.error('❌ Restructure failed:', error)
  }
}

restructureCategories()