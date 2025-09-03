import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rdpjldootsglcbzhfkdi.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkcGpsZG9vdHNnbGNiemhma2RpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzEzNzYyMywiZXhwIjoyMDY4NzEzNjIzfQ.gOErYwxvYfh5D1ofayzIBivOYVCaQ0qEM5kuhOmqxhE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupNewStructure() {
  try {
    console.log('🚀 Setting up new Military Tees structure...')

    // 1. Create new category structure - ONLY the required ones
    console.log('📁 Creating new category structure...')
    
    const newCategories = [
      // Military dropdown categories (4 main services)
      {
        name: 'British Army',
        slug: 'british-army',
        description: 'British Army themed apparel and designs',
        sort_order: 1,
        is_active: true
      },
      {
        name: 'Royal Navy',
        slug: 'royal-navy', 
        description: 'Royal Navy themed apparel and designs',
        sort_order: 2,
        is_active: true
      },
      {
        name: 'Royal Air Force',
        slug: 'royal-air-force',
        description: 'Royal Air Force themed apparel and designs',
        sort_order: 3,
        is_active: true
      },
      {
        name: 'Royal Marines',
        slug: 'royal-marines',
        description: 'Royal Marines themed apparel and designs',
        sort_order: 4,
        is_active: true
      },
      // Navigation categories
      {
        name: 'Memorial Collection',
        slug: 'memorial',
        description: 'Remembrance and memorial designs',
        sort_order: 5,
        is_active: true
      },
      {
        name: 'Veterans',
        slug: 'veterans',
        description: 'Honoring those who served with pride',
        sort_order: 6,
        is_active: true
      },
      {
        name: 'Kids Collection', 
        slug: 'kids',
        description: 'Military-themed clothing for children',
        sort_order: 7,
        is_active: true
      },
      {
        name: 'Sale Items',
        slug: 'sale',
        description: 'Discounted military apparel',
        sort_order: 8,
        is_active: true
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

    // 2. Create new products with proper stock and working images
    console.log('🛍️ Creating new products...')

    const products = [
      // British Army Products
      {
        name: 'British Army Logo Tee',
        slug: 'british-army-logo-tee',
        description: 'Classic British Army logo design on premium cotton tee. Show your pride in the British Army with this professional quality shirt featuring the iconic crossed swords and crown.',
        price: 19.99,
        sale_price: null,
        main_image_url: '/images/products/placeholder-tshirt.svg',
        category_id: categories.find(c => c.slug === 'british-army').id,
        featured: true,
        is_active: true,
        stock_quantity: 100
      },
      {
        name: 'Army Veteran Pride Shirt', 
        slug: 'army-veteran-pride-shirt',
        description: 'Honor your service with this Army veteran pride shirt. Quality design for those who served with distinction. Features subtle military styling with veteran pride messaging.',
        price: 21.99,
        sale_price: null,
        main_image_url: '/images/products/placeholder-tshirt.svg',
        category_id: categories.find(c => c.slug === 'british-army').id,
        featured: false,
        is_active: true,
        stock_quantity: 100
      },
      {
        name: 'Paratrooper Wings Tee',
        slug: 'paratrooper-wings-tee', 
        description: 'Elite Paratrooper wings design for the airborne elite. Features the distinctive paratrooper wings badge worn by qualified military parachutists.',
        price: 22.99,
        sale_price: null,
        main_image_url: '/images/products/placeholder-tshirt.svg',
        category_id: categories.find(c => c.slug === 'british-army').id,
        featured: false,
        is_active: true,
        stock_quantity: 100
      },
      {
        name: 'SAS Who Dares Wins',
        slug: 'sas-who-dares-wins',
        description: 'Special Air Service elite forces design. "Who Dares Wins" - the motto of the world\'s most elite special forces regiment.',
        price: 24.99,
        sale_price: null,
        main_image_url: '/images/products/placeholder-tshirt.svg',
        category_id: categories.find(c => c.slug === 'british-army').id,
        featured: true,
        is_active: true,
        stock_quantity: 100
      },

      // Royal Navy Products
      {
        name: 'Royal Navy Anchor Tee',
        slug: 'royal-navy-anchor-tee',
        description: 'Traditional Royal Navy anchor design. Sailing with pride since 1660. Features the classic fouled anchor symbol of the Senior Service.',
        price: 20.99,
        sale_price: null,
        main_image_url: '/images/products/placeholder-tshirt.svg',
        category_id: categories.find(c => c.slug === 'royal-navy').id,
        featured: true,
        is_active: true,
        stock_quantity: 100
      },
      {
        name: 'Fleet Air Arm Wings',
        slug: 'fleet-air-arm-wings',
        description: 'Royal Navy Fleet Air Arm wings design. Naval aviation excellence from carriers and shore stations worldwide.',
        price: 21.99,
        sale_price: null,
        main_image_url: '/images/products/placeholder-tshirt.svg',
        category_id: categories.find(c => c.slug === 'royal-navy').id,
        featured: false,
        is_active: true,
        stock_quantity: 100
      },
      {
        name: 'HMS Victory Heritage',
        slug: 'hms-victory-heritage',
        description: 'Celebrating HMS Victory and Nelson\'s legacy. The most famous warship in Royal Navy history.',
        price: 23.99,
        sale_price: null,
        main_image_url: '/images/products/placeholder-tshirt.svg',
        category_id: categories.find(c => c.slug === 'royal-navy').id,
        featured: false,
        is_active: true,
        stock_quantity: 100
      },

      // Royal Air Force Products  
      {
        name: 'RAF Wings Classic Tee',
        slug: 'raf-wings-classic-tee',
        description: 'Classic Royal Air Force wings design. Per Ardua Ad Astra - Through adversity to the stars. The iconic wings worn by aircrew.',
        price: 20.99,
        sale_price: null,
        main_image_url: '/images/products/placeholder-tshirt.svg',
        category_id: categories.find(c => c.slug === 'royal-air-force').id,
        featured: true,
        is_active: true,
        stock_quantity: 100
      },
      {
        name: 'Spitfire Squadron Tee',
        slug: 'spitfire-squadron-tee',
        description: 'Iconic Spitfire aircraft design celebrating RAF heritage and the Battle of Britain. The fighter that saved Britain.',
        price: 23.99,
        sale_price: null,
        main_image_url: '/images/products/placeholder-tshirt.svg',
        category_id: categories.find(c => c.slug === 'royal-air-force').id,
        featured: true,
        is_active: true,
        stock_quantity: 100
      },
      {
        name: 'Red Arrows Formation',
        slug: 'red-arrows-formation',
        description: 'RAF Red Arrows aerobatic team design. Precision flying and British excellence on display worldwide.',
        price: 22.99,
        sale_price: null,
        main_image_url: '/images/products/placeholder-tshirt.svg',
        category_id: categories.find(c => c.slug === 'royal-air-force').id,
        featured: false,
        is_active: true,
        stock_quantity: 100
      },

      // Royal Marines Products
      {
        name: 'Royal Marines Commando Tee',
        slug: 'royal-marines-commando-tee', 
        description: 'Royal Marines commando design. Per Mare Per Terram - By Sea By Land. The original and still the best.',
        price: 22.99,
        sale_price: null,
        main_image_url: '/images/products/placeholder-tshirt.svg',
        category_id: categories.find(c => c.slug === 'royal-marines').id,
        featured: true,
        is_active: true,
        stock_quantity: 100
      },
      {
        name: 'Green Beret Pride Shirt',
        slug: 'green-beret-pride-shirt',
        description: 'Elite Royal Marines green beret design. For the few, the proud, the Marines. Earning the green beret - the hardest test.',
        price: 21.99,
        sale_price: null,
        main_image_url: '/images/products/placeholder-tshirt.svg',
        category_id: categories.find(c => c.slug === 'royal-marines').id,
        featured: false,
        is_active: true,
        stock_quantity: 100
      },
      {
        name: 'Commando Dagger Design',
        slug: 'commando-dagger-design',
        description: 'Royal Marines Commando dagger and scroll design. Symbol of elite amphibious warfare capabilities.',
        price: 23.99,
        sale_price: null,
        main_image_url: '/images/products/placeholder-tshirt.svg',
        category_id: categories.find(c => c.slug === 'royal-marines').id,
        featured: false,
        is_active: true,
        stock_quantity: 100
      },

      // Memorial Collection
      {
        name: 'Remembrance Poppy Tee',
        slug: 'remembrance-poppy-tee',
        description: 'Beautiful remembrance poppy design. Lest we forget those who made the ultimate sacrifice for our freedom.',
        price: 19.99,
        sale_price: null,
        main_image_url: '/images/products/placeholder-tshirt.svg',
        category_id: categories.find(c => c.slug === 'memorial').id,
        featured: true,
        is_active: true,
        stock_quantity: 100
      },
      {
        name: 'Memorial Cross Design',
        slug: 'memorial-cross-design',
        description: 'Respectful memorial cross design honoring fallen heroes. They shall not grow old, as we that are left grow old.',
        price: 20.99,
        sale_price: null,
        main_image_url: '/images/products/placeholder-tshirt.svg',
        category_id: categories.find(c => c.slug === 'memorial').id,
        featured: false,
        is_active: true,
        stock_quantity: 100
      },

      // Veterans Collection
      {
        name: 'Veteran Pride Tee',
        slug: 'veteran-pride-tee',
        description: 'Show your veteran pride with this classic design. Thank you for your service - honoring all who served.',
        price: 21.99,
        sale_price: null,
        main_image_url: '/images/products/placeholder-tshirt.svg',
        category_id: categories.find(c => c.slug === 'veterans').id,
        featured: true,
        is_active: true,
        stock_quantity: 100
      },
      {
        name: 'Service Before Self',
        slug: 'service-before-self',
        description: 'Service Before Self - the veteran\'s creed. Honoring those who put country before personal interest.',
        price: 22.99,
        sale_price: null,
        main_image_url: '/images/products/placeholder-tshirt.svg',
        category_id: categories.find(c => c.slug === 'veterans').id,
        featured: false,
        is_active: true,
        stock_quantity: 100
      },

      // Kids Collection
      {
        name: 'Little Soldier Tee',
        slug: 'little-soldier-tee',
        description: 'Adorable military design for little ones. Following in proud footsteps with age-appropriate military styling.',
        price: 15.99,
        sale_price: null,
        main_image_url: '/images/products/placeholder-tshirt.svg',
        category_id: categories.find(c => c.slug === 'kids').id,
        featured: true,
        is_active: true,
        stock_quantity: 100
      },
      {
        name: 'Junior Cadet Shirt',
        slug: 'junior-cadet-shirt',
        description: 'Junior cadet design for aspiring young service members. Building character and pride from an early age.',
        price: 16.99,
        sale_price: null,
        main_image_url: '/images/products/placeholder-tshirt.svg',
        category_id: categories.find(c => c.slug === 'kids').id,
        featured: false,
        is_active: true,
        stock_quantity: 100
      },

      // Sale Items
      {
        name: 'Classic Military Tee - SALE',
        slug: 'classic-military-tee-sale',
        description: 'Classic military design now on sale. Quality military styling at an unbeatable price.',
        price: 19.99,
        sale_price: 14.99,
        main_image_url: '/images/products/placeholder-tshirt.svg',
        category_id: categories.find(c => c.slug === 'sale').id,
        featured: true,
        is_active: true,
        stock_quantity: 100
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

    // 3. Create variants for each product with good stock levels
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
            stock_quantity: Math.floor(Math.random() * 25) + 20, // Random stock 20-45
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
    console.log(`
🎉 NEW MILITARY TEES STRUCTURE COMPLETE!

📊 SUMMARY:
✅ 8 Categories Created:
  • British Army (4 products)
  • Royal Navy (3 products)  
  • Royal Air Force (3 products)
  • Royal Marines (3 products)
  • Memorial Collection (2 products)
  • Veterans (2 products)
  • Kids Collection (2 products)
  • Sale Items (1 product)

✅ ${insertedProducts.length} Products with realistic military descriptions
✅ ${variantCount} Product variants with stock levels 20-45 each
✅ All using working placeholder images (/images/products/placeholder-tshirt.svg)
✅ Proper pricing: £15.99 - £24.99
✅ Featured products marked for homepage display
✅ All products active and ready for purchase

🚀 Ready for live testing!
    `)

  } catch (error) {
    console.error('❌ Setup failed:', error)
  }
}

setupNewStructure()