#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function checkProducts() {
  console.log('🔍 Checking current products and images...\n')
  
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, slug, main_image_url, created_at')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('❌ Error:', error.message)
    return
  }
  
  console.log(`Found ${products.length} products:\n`)
  products.forEach(p => {
    console.log(`📦 ${p.name}`)
    console.log(`   Slug: ${p.slug}`)
    console.log(`   Image: ${p.main_image_url || 'NO IMAGE SET'}`)
    console.log(`   Created: ${new Date(p.created_at).toLocaleDateString()}`)
    console.log('')
  })
  
  // Check variants with missing images
  console.log('🎨 Checking product variants with image issues...\n')
  const { data: variants, error: variantError } = await supabase
    .from('product_variants')
    .select('id, product_id, name, image_urls, sku')
    .order('product_id')
  
  if (variantError) {
    console.error('❌ Variant Error:', variantError.message)
    return
  }
  
  const problemVariants = variants.filter(v => !v.image_urls || v.image_urls.length === 0 || v.image_urls[0] === '/placeholder-product.jpg')
  
  console.log(`Found ${problemVariants.length} variants with image issues:`)
  problemVariants.forEach(v => {
    console.log(`- ${v.name} (${v.sku}) - Images: ${JSON.stringify(v.image_urls)}`)
  })
}

checkProducts()