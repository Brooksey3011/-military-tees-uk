#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

// Mapping of the new images to product types/themes
const imageMapping = {
  // No Man Left Behind collection - perfect for memorial and veteran products
  'memorial-cross-design': 'GREEN FRONT NO MAN MOTIF .png',
  'remembrance-poppy-tee': 'GREY FRONT NO MAN MOTIF .png',
  'veteran-pride-tee': 'WHITE FRONT NO MAN LEFT BEHIND MOTIF .png',
  'service-before-self': 'SAND FRONT NO MAN MOTIF .png',
  
  // 3 Man Silhouette collection - great for military/army products  
  'british-army-logo-tee': '3 MAN SILOUETTE ON GREEN BACK .png',
  'green-beret-pride-shirt': '3 MAN SILOUETTE ON MAROON BACK .png',
  'army-veteran-pride-shirt': '3 MAN SILOUETTE ON WHITE BACK .png',
  
  // Use back designs for additional products
  'commando-dagger-design': 'green with no man left behind.png',
  'paratrooper-wings-tee': 'GREY no man left behind mock up in black .png',
  'sas-who-dares-wins': 'SAND no man left bening back mock up in black .png',
  'classic-military-tee-sale': 'white no man left behind .png'
}

async function updateProductImages() {
  try {
    console.log('🖼️  Updating product images with new military tees designs...\n')
    
    // Check what images are available in the products folder
    const productsDir = '/Users/militaryteesukltd./Desktop/Project/military-tees-uk/public/products'
    const availableImages = fs.readdirSync(productsDir)
      .filter(file => file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.webp'))
    
    console.log('📁 Available images:')
    availableImages.forEach(img => console.log(`   - ${img}`))
    console.log('')
    
    let updatedCount = 0
    
    for (const [productSlug, imageName] of Object.entries(imageMapping)) {
      // Check if the image file exists
      if (!availableImages.includes(imageName)) {
        console.log(`⚠️  Image not found: ${imageName} for product ${productSlug}`)
        continue
      }
      
      // Update the product in the database
      const { data, error } = await supabase
        .from('products')
        .update({ 
          main_image_url: `/products/${imageName}` 
        })
        .eq('slug', productSlug)
        .select('id, name, slug')
      
      if (error) {
        console.log(`❌ Error updating ${productSlug}: ${error.message}`)
        continue
      }
      
      if (data && data.length > 0) {
        console.log(`✅ Updated ${data[0].name} → /products/${imageName}`)
        updatedCount++
      } else {
        console.log(`⚠️  Product not found: ${productSlug}`)
      }
    }
    
    console.log(`\n🎉 Successfully updated ${updatedCount} product images!`)
    
    // Also update some remaining products with existing images
    console.log('\n🔄 Updating remaining products with existing placeholder images...')
    
    const remainingUpdates = {
      'royal-marines-commando-tee': 'royal-marine-commando-tee.jpg',
      'raf-wings-classic-tee': 'raf-fighter-pilot-heritage.jpg',
      'spitfire-squadron-tee': 'paratrooper-wings-design.jpg',
      'royal-navy-anchor-tee': 'gurkha-regiment-honor.jpg',
      'little-soldier-tee': 'army-medic-corps-tribute.jpg',
      'junior-cadet-shirt': 'sas-regiment-elite-tee.jpg'
    }
    
    for (const [productSlug, imageName] of Object.entries(remainingUpdates)) {
      if (availableImages.includes(imageName)) {
        const { data, error } = await supabase
          .from('products')
          .update({ 
            main_image_url: `/products/${imageName}` 
          })
          .eq('slug', productSlug)
          .select('id, name, slug')
        
        if (!error && data && data.length > 0) {
          console.log(`✅ Updated ${data[0].name} → /products/${imageName}`)
          updatedCount++
        }
      }
    }
    
    console.log(`\n🏆 Total products updated: ${updatedCount}`)
    console.log('\n📸 Image assignments complete! All products now have proper military-themed images.')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

updateProductImages()