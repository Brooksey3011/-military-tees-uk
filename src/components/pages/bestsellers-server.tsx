import { createClient } from "@supabase/supabase-js"

interface Product {
  id: string
  name: string
  price: number
  main_image_url: string
  description: string
  slug: string
}

async function getBestsellers(): Promise<Product[]> {
  try {
    console.log('🔍 Server-side bestsellers fetch starting...')
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: products, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, slug),
        variants:product_variants(*)
      `)
      .eq('is_active', true)
      .eq('featured', true)
      .range(0, 5)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Database error:', error)
      return []
    }

    console.log(`✅ Server-side bestsellers fetch successful: ${products?.length || 0} products`)
    return products || []
  } catch (error) {
    console.error('💥 Server-side bestsellers fetch error:', error)
    return []
  }
}

export async function BestsellersServer() {
  const products = await getBestsellers()

  if (products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">No Bestsellers Available</h2>
        <p className="text-gray-600">Check back soon for our bestselling items!</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="aspect-square relative bg-gray-100 rounded-t-lg">
              <img
                src={product.main_image_url || '/placeholder-product.jpg'}
                alt={product.name}
                className="w-full h-full object-cover rounded-t-lg"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                {product.name}
              </h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                {product.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-green-600">
                  £{product.price}
                </span>
                <a 
                  href={`/products/${product.slug}`}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors inline-block text-center"
                >
                  View Product
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}