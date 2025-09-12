#!/usr/bin/env node

/**
 * Script to add UK Flag T-shirt with popular military colors
 * Run with: node add-uk-flag-tee.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Product data for UK Flag T-shirt
const productData = {
  name: 'UK Flag Military T-Shirt',
  slug: 'uk-flag-military-tee',
  description: 'Premium military-style t-shirt featuring the iconic UK flag on the sleeve. Made from high-quality cotton blend for comfort and durability. Perfect for showing your British pride.',
  price: 19.99,
  main_image_url: '/images/products/uk-flag-tee-white.webp',
  is_active: true,
  featured: false,
  stock_quantity: 100,
  sku: 'UK-FLAG-BASE'
}

// Popular military colors for variants
const militaryColors = [
  { name: 'Arctic White', hex: '#F5F5F5', popular: true },
  { name: 'Military Green', hex: '#4B5320', popular: true },
  { name: 'Tactical Black', hex: '#2C2C2C', popular: true },
  { name: 'Navy Blue', hex: '#1B1B3A', popular: true },
  { name: 'Desert Sand', hex: '#C19A6B', popular: true },
  { name: 'Olive Drab', hex: '#6B8E23', popular: true },
  { name: 'Charcoal Gray', hex: '#36454F', popular: false },
  { name: 'Maroon', hex: '#800000', popular: false }
]

// Standard UK sizes
const sizes = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL']

async function addProduct() {
  try {
    console.log('🚀 Adding UK Flag Military T-Shirt...')

    // 1. Get British Army category ID
    console.log('📁 Finding British Army category...')
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', 'british-army')
      .single()

    if (categoryError) {
      console.error('❌ Error finding British Army category:', categoryError.message)
      return
    }

    if (!category) {
      console.error('❌ British Army category not found. Please create it first.')
      return
    }

    console.log('✅ Found British Army category:', category.id)

    // 2. Insert the main product
    console.log('👕 Creating main product...')
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        ...productData,
        category_id: category.id
      })
      .select()
      .single()

    if (productError) {
      console.error('❌ Error creating product:', productError.message)
      return
    }

    console.log('✅ Product created:', product.name)

    // 3. Create variants for each color and size combination
    console.log('🎨 Creating color and size variants...')
    const variants = []
    
    for (const color of militaryColors) {
      for (const size of sizes) {
        const sku = `UK-FLAG-${color.name.replace(/\s+/g, '').toUpperCase()}-${size}`
        const stockQuantity = color.popular ? 50 : 25 // More stock for popular colors
        const variantName = `${size} - ${color.name}`
        
        variants.push({
          product_id: product.id,
          name: variantName,
          size: size,
          color: color.name,
          sku: sku,
          stock_quantity: stockQuantity,
          price: productData.price,
          image_urls: [`/images/products/uk-flag-tee-${color.name.toLowerCase().replace(/\s+/g, '-')}.webp`],
          is_active: true,
          low_stock_threshold: 5,
          track_inventory: true
        })
      }
    }

    // Insert variants in batches to avoid hitting limits
    console.log(`📦 Inserting ${variants.length} variants...`)
    const { data: insertedVariants, error: variantError } = await supabase
      .from('product_variants')
      .insert(variants)

    if (variantError) {
      console.error('❌ Error creating variants:', variantError.message)
      return
    }

    console.log('✅ All variants created successfully!')

    // 4. Display summary
    console.log('\n🎉 UK Flag Military T-Shirt Added Successfully!')
    console.log('==========================================')
    console.log(`Product Name: ${product.name}`)
    console.log(`Product ID: ${product.id}`)
    console.log(`Price: £${productData.price}`)
    console.log(`Total Variants: ${variants.length}`)
    console.log(`Colors: ${militaryColors.length} (${militaryColors.filter(c => c.popular).length} popular)`)
    console.log(`Sizes: ${sizes.join(', ')}`)
    console.log('\n📸 Image Files Needed:')
    console.log('Upload these images to your storage:')
    militaryColors.forEach(color => {
      const filename = `/images/products/uk-flag-tee-${color.name.toLowerCase().replace(/\s+/g, '-')}.webp`
      console.log(`- ${filename} (${color.name} - ${color.hex})`)
    })
    
    console.log('\n🔗 Product URL: https://your-domain.com/products/uk-flag-military-tee')
    console.log('\n⚡ Popular Colors for Marketing:')
    militaryColors.filter(c => c.popular).forEach(color => {
      console.log(`- ${color.name} (${color.hex})`)
    })

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

// Run the script
addProduct()