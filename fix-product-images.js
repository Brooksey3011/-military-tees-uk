const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client with service role key
const supabase = createClient(
  'https://rdpjldootsglcbzhfkdi.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkcGpsZG9vdHNnbGNiemhma2RpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzEzNzYyMywiZXhwIjoyMDY4NzEzNjIzfQ.gOErYwxvYfh5D1ofayzIBivOYVCaQ0qEM5kuhOmqxhE'
)

// Map of product image fixes
const imageUpdates = [
  { 
    name: 'Remembrance Poppy Military',
    correct_image: '/products/royal-marine-commando-tee.jpg'
  },
  {
    name: 'Royal Marines Commando',
    correct_image: '/products/royal-marine-commando-tee.jpg'
  },
  {
    name: 'British Army Veteran',
    correct_image: '/products/army-medic-corps-tribute.jpg'
  },
  {
    name: 'SAS Regiment Elite Tee',
    correct_image: '/products/sas-regiment-elite-tee.jpg'
  },
  {
    name: 'RAF Fighter Pilot Heritage',
    correct_image: '/products/raf-fighter-pilot-heritage.jpg'
  },
  {
    name: 'Paratrooper Wings Design',
    correct_image: '/products/paratrooper-wings-design.jpg'
  }
]

async function fixProductImages() {
  console.log('🖼️ Fixing product image paths...')

  try {
    // Get all products
    const { data: products, error } = await supabase
      .from('products')
      .select('*')

    if (error) {
      console.error('Error fetching products:', error)
      return
    }

    console.log(`Found ${products.length} products`)

    // Update each product with correct image path
    for (const product of products) {
      console.log(`\n📦 Processing: ${product.name}`)
      
      // Find matching image update
      const imageUpdate = imageUpdates.find(update => 
        product.name.toLowerCase().includes(update.name.toLowerCase()) ||
        update.name.toLowerCase().includes(product.name.toLowerCase())
      )
      
      if (imageUpdate) {
        console.log(`  ✅ Updating image to: ${imageUpdate.correct_image}`)
        
        const { error: updateError } = await supabase
          .from('products')
          .update({ main_image_url: imageUpdate.correct_image })
          .eq('id', product.id)
          
        if (updateError) {
          console.log(`  ❌ Error updating: ${updateError.message}`)
        } else {
          console.log(`  ✅ Updated successfully`)
        }
      } else {
        // Use fallback image
        const fallbackImage = '/products/army-medic-corps-tribute.jpg'
        console.log(`  🔄 Using fallback image: ${fallbackImage}`)
        
        const { error: updateError } = await supabase
          .from('products')
          .update({ main_image_url: fallbackImage })
          .eq('id', product.id)
          
        if (updateError) {
          console.log(`  ❌ Error updating: ${updateError.message}`)
        }
      }
    }

    console.log('\n🎉 Product image fix complete!')
    
  } catch (error) {
    console.error('❌ Fix failed:', error)
  }
}

// Run the fix
fixProductImages()