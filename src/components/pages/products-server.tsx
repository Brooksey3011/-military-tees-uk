import { Filter, SortAsc } from "lucide-react"

interface Product {
  id: string
  name: string
  price: number
  sale_price?: number
  main_image_url: string
  description: string
  slug: string
  category: {
    id: string
    name: string
    slug: string
  }
  variants: Array<{
    id: string
    sku: string
    name: string
    size: string
    color: string
    price: number
    stock_quantity: number
  }>
}

async function getProducts(): Promise<Product[]> {
  try {
    console.log('🔍 Server-side products fetch starting...')
    
    // During build time, skip API calls and return empty array
    if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
      console.log('⏭️ Skipping API call during build...')
      return []
    }
    
    // Use the working API endpoint instead of direct Supabase queries
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'
    const response = await fetch(`${baseUrl}/api/products?limit=24`, {
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 }, // Cache for 1 minute
      // Add timeout for build process
      signal: AbortSignal.timeout(5000) // 5 second timeout
    })

    if (!response.ok) {
      console.error('❌ API response error:', response.status, response.statusText)
      return []
    }

    const data = await response.json()
    
    if (data.error) {
      console.error('❌ API error:', data.error)
      return []
    }

    const products = data.products || []
    console.log(`✅ Server-side fetch successful: ${products.length} products`)
    return products
  } catch (error) {
    console.error('💥 Server-side fetch error:', error)
    return []
  }
}

export async function ProductsServer() {
  const products = await getProducts()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24">
            <h3 className="text-lg font-semibold mb-4 tracking-wide uppercase">
              Filter Products
            </h3>
            
            <div className="bg-white border-2 border-gray-200 p-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Filter className="h-4 w-4" />
                  <span className="text-sm">Filters available when products load</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600">
                  <SortAsc className="h-4 w-4" />
                  <span className="text-sm">Sorting options available soon</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <main className="lg:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">All Products</h1>
              <p className="text-gray-600">
                Discover our complete collection of military-themed apparel
              </p>
              <p className="text-sm text-gray-600 mt-2">
                {products.length === 0 ? "No products available" : `${products.length} products found`}
              </p>
            </div>
            
            <button 
              className="border-2 border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:border-green-600 transition-colors"
              disabled
            >
              <SortAsc className="h-4 w-4 mr-2 inline" />
              Sort By
            </button>
          </div>

          {/* Products Display */}
          {products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => {
                const availableVariants = product.variants?.filter(v => v.stock_quantity > 0) || []
                const totalStock = product.variants?.reduce((sum, v) => sum + v.stock_quantity, 0) || 0
                
                return (
                  <div key={product.id} className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="aspect-square relative bg-gray-100 rounded-t-lg">
                      <img
                        src={product.main_image_url || '/placeholder-product.jpg'}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-t-lg"
                      />
                      {product.sale_price && (
                        <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 text-xs font-bold rounded">
                          SALE
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-lg line-clamp-2">
                          {product.name}
                        </h3>
                        {product.category && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            {product.category.name}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {product.description}
                      </p>
                      
                      {/* Stock and Variant Info */}
                      <div className="text-xs text-gray-500 mb-3">
                        <span>{availableVariants.length} sizes available</span>
                        <span className="mx-1">•</span>
                        <span className={totalStock > 10 ? 'text-green-600' : totalStock > 0 ? 'text-orange-600' : 'text-red-600'}>
                          {totalStock > 0 ? `${totalStock} in stock` : 'Out of stock'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-green-600">
                            £{(product.sale_price ?? product.price).toFixed(2)}
                          </span>
                          {product.sale_price && (
                            <span className="text-sm text-gray-500 line-through">
                              £{product.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                        <a 
                          href={`/products/${product.slug}`}
                          className={`px-4 py-2 rounded transition-colors inline-block text-center text-sm font-medium ${
                            totalStock > 0 
                              ? 'bg-green-600 text-white hover:bg-green-700' 
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {totalStock > 0 ? 'View Product' : 'Out of Stock'}
                        </a>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <h3 className="text-xl font-semibold mb-4">Loading Products...</h3>
                <p className="text-gray-600 mb-4">
                  Fetching the latest military-themed apparel from our database.
                </p>
                <div className="animate-pulse flex space-x-4">
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}