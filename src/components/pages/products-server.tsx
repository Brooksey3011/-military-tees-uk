import { Filter, SortAsc } from "lucide-react"
import { createClient } from "@supabase/supabase-js"

interface Product {
  id: string
  name: string
  price: number
  sale_price?: number
  main_image_url: string
  description: string
  slug: string
}

async function getProducts(): Promise<Product[]> {
  try {
    console.log('🔍 Server-side products fetch starting...')
    
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
      .range(0, 23)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Database error:', error)
      return []
    }

    console.log(`✅ Server-side fetch successful: ${products?.length || 0} products`)
    return products || []
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
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-green-600">
                          £{product.sale_price ?? product.price}
                        </span>
                        {product.sale_price && (
                          <span className="text-sm text-gray-500 line-through">
                            £{product.price}
                          </span>
                        )}
                      </div>
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
          ) : (
            <div className="text-center py-16">
              <h3 className="text-xl font-semibold mb-4">No Products Available</h3>
              <p className="text-gray-600">
                Check back soon for our latest products!
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}