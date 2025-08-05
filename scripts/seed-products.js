import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rdpjldootsglcbzhfkdi.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkcGpsZG9vdHNnbGNiemhma2RpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzEzNzYyMywiZXhwIjoyMDY4NzEzNjIzfQ.gOErYwxvYfh5D1ofayzIBivOYVCaQ0qEM5kuhOmqxhE'

const supabase = createClient(supabaseUrl, supabaseKey)

// Available sizes and colors
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
const COLORS = [
  'Black', 'Navy', 'Army Green', 'White', 'Grey', 'Maroon', 'Sand', 'Olive'
]

// Military t-shirt products
const PRODUCTS = [
  {
    name: 'British Army Logo Classic Tee',
    slug: 'british-army-logo-classic',
    description: 'Premium military heritage t-shirt featuring the iconic British Army logo. Made from high-quality cotton blend for comfort and durability.',
    price: 22.99,
    category_name: 'Armoury',
    main_image_url: '/images/products/british-army-logo.jpg',
    featured: true,
    is_active: true
  },
  {
    name: 'Royal Navy Anchor Heritage',
    slug: 'royal-navy-anchor-heritage',
    description: 'Honor naval tradition with this classic Royal Navy anchor design. Perfect for serving personnel and maritime enthusiasts.',
    price: 24.99,
    category_name: 'Armoury',
    main_image_url: '/images/products/royal-navy-anchor.jpg',
    featured: true,
    is_active: true
  },
  {
    name: 'RAF Wings of Victory',
    slug: 'raf-wings-of-victory',
    description: 'Celebrate the Royal Air Force with this stunning wings design. A tribute to air power and aviation excellence.',
    price: 23.99,
    category_name: 'Armoury',
    main_image_url: '/images/products/raf-wings.jpg',
    featured: true,
    is_active: true
  },
  {
    name: 'SAS Who Dares Wins',
    slug: 'sas-who-dares-wins',
    description: 'Elite Special Air Service tribute tee featuring the iconic "Who Dares Wins" motto. For those who appreciate elite military excellence.',
    price: 26.99,
    category_name: 'Armoury',
    main_image_url: '/images/products/sas-who-dares-wins.jpg',
    featured: true,
    is_active: true
  },
  {
    name: 'Parachute Regiment Wings',
    slug: 'parachute-regiment-wings',
    description: 'Honor the Paras with this authentic parachute wings design. Celebrating airborne forces and their proud tradition.',
    price: 25.99,
    category_name: 'Armoury',
    main_image_url: '/images/products/para-wings.jpg',
    featured: true,
    is_active: true
  },
  {
    name: 'Royal Marines Commando',
    slug: 'royal-marines-commando',
    description: 'Per Mare Per Terram - By Sea By Land. Classic Royal Marines commando design celebrating elite amphibious forces.',
    price: 25.99,
    category_name: 'Armoury',
    main_image_url: '/images/products/royal-marines.jpg',
    featured: true,
    is_active: true
  },
  {
    name: 'British Army Veteran',
    slug: 'british-army-veteran',
    description: 'Proud veteran design for those who served with honor. A respectful tribute to military service and sacrifice.',
    price: 21.99,
    category_name: 'Veterans',
    main_image_url: '/images/products/army-veteran.jpg',
    featured: false,
    is_active: true
  },
  {
    name: 'Remembrance Poppy Military',
    slug: 'remembrance-poppy-military',
    description: 'Lest We Forget - Beautiful remembrance poppy design honoring fallen heroes. Perfect for commemorative events.',
    price: 21.99,
    category_name: 'Veterans',
    main_image_url: '/images/products/remembrance-poppy.jpg',
    featured: true,
    is_active: true
  },
  {
    name: 'Military Medic Cross',
    slug: 'military-medic-cross',
    description: 'Honoring military medical personnel who serve on the front lines. Featuring medical corps insignia and symbols.',
    price: 23.99,
    category_name: 'Med Centre',
    main_image_url: '/images/products/medic-cross.jpg',
    featured: false,
    is_active: true
  },
  {
    name: 'Tank Regiment Pride',
    slug: 'tank-regiment-pride',
    description: 'Armoured strength and steel resolve. Classic tank design celebrating armoured regiment tradition and power.',
    price: 24.99,
    category_name: 'MT',
    main_image_url: '/images/products/tank-regiment.jpg',
    featured: false,
    is_active: true
  },
  {
    name: 'Military Signals Corps',
    slug: 'military-signals-corps',
    description: 'Communications are vital. Signals corps design honoring military communications specialists and radio operators.',
    price: 22.99,
    category_name: 'Signals',
    main_image_url: '/images/products/signals-corps.jpg',
    featured: false,
    is_active: true
  },
  {
    name: 'Mess Hall Brotherhood',
    slug: 'mess-hall-brotherhood',
    description: 'Celebrating military camaraderie and the bonds formed over shared meals. Perfect for mess events and reunions.',
    price: 20.99,
    category_name: 'Mess Hall',
    main_image_url: '/images/products/mess-hall.jpg',
    featured: false,
    is_active: true
  }
]

async function createCategories() {
  console.log('Creating categories...')
  
  const categories = [
    { name: 'Armoury', slug: 'armoury', description: 'Tactical and combat gear themed tees' },
    { name: 'Veterans', slug: 'veterans', description: 'Honoring those who served with pride' },
    { name: 'Med Centre', slug: 'med-centre', description: 'Military medical corps designs' },
    { name: 'MT', slug: 'mt', description: 'Vehicle and logistics themed' },
    { name: 'Signals', slug: 'signals', description: 'Communications corps gear' },
    { name: 'Mess Hall', slug: 'mess-hall', description: 'Military dining and camaraderie' }
  ]

  for (const category of categories) {
    const { error } = await supabase
      .from('categories')
      .upsert(category, { onConflict: 'slug' })
    
    if (error) {
      console.error(`Error creating category ${category.name}:`, error)
    } else {
      console.log(`✓ Created category: ${category.name}`)
    }
  }
}

async function createProducts() {
  console.log('Creating products...')
  
  // Get categories for ID mapping
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
  
  const categoryMap = {}
  categories?.forEach(cat => {
    categoryMap[cat.name] = cat.id
  })

  for (const product of PRODUCTS) {
    const productData = {
      ...product,
      category_id: categoryMap[product.category_name]
    }
    delete productData.category_name

    const { data: createdProduct, error } = await supabase
      .from('products')
      .upsert(productData, { onConflict: 'slug' })
      .select('id, slug')
      .single()

    if (error) {
      console.error(`Error creating product ${product.name}:`, error)
      continue
    }

    console.log(`✓ Created product: ${product.name}`)

    // Create variants for each size/color combination
    await createVariants(createdProduct.id, product.slug)
  }
}

async function createVariants(productId, productSlug) {
  console.log(`Creating variants for product ${productSlug}...`)
  
  const variants = []
  
  for (const size of SIZES) {
    for (const color of COLORS) {
      const sku = `${productSlug.toUpperCase().replace(/-/g, '_')}_${size}_${color.toUpperCase().replace(' ', '_')}`
      
      variants.push({
        product_id: productId,
        name: `${size} - ${color}`,
        size: size,
        color: color,
        sku: sku,
        price: 0, // Use base product price
        stock_quantity: Math.floor(Math.random() * 20) + 5, // Random stock 5-24
        image_urls: [`/images/products/${productSlug}-${color.toLowerCase().replace(' ', '-')}.jpg`],
        is_active: true
      })
    }
  }

  // Insert variants in batches
  const batchSize = 20
  for (let i = 0; i < variants.length; i += batchSize) {
    const batch = variants.slice(i, i + batchSize)
    
    const { error } = await supabase
      .from('product_variants')
      .upsert(batch, { onConflict: 'sku' })

    if (error) {
      console.error(`Error creating variants batch for ${productSlug}:`, error)
    }
  }
  
  console.log(`✓ Created ${variants.length} variants for ${productSlug}`)
}

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...')
    
    await createCategories()
    await createProducts()
    
    console.log('✅ Database seeding completed successfully!')
    console.log(`Created ${PRODUCTS.length} products with ${SIZES.length * COLORS.length} variants each`)
    console.log(`Total variants: ${PRODUCTS.length * SIZES.length * COLORS.length}`)
    
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  }
}

// Run the seeding
seedDatabase()