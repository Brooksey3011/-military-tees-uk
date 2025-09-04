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
    
    // Use direct Supabase query instead of API endpoints
    const { createClient } = require('@supabase/supabase-js')
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing Supabase credentials')
      return []
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Query products directly from database
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        price,
        sale_price,
        main_image_url,
        description,
        slug,
        category:categories(id, name, slug),
        variants:product_variants(
          id,
          sku,
          name,
          size,
          color,
          price,
          stock_quantity
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(24)

    if (error) {
      console.error('❌ Supabase error:', error)
      return []
    }

    if (!products || products.length === 0) {
      console.log('⚠️ No products found')
      return []
    }

    console.log(`✅ Server-side Supabase fetch successful: ${products.length} products`)
    return products
  } catch (error) {
    console.error('💥 Server-side fetch error:', error)
    return []
  }
}

interface ProductsServerProps {
  onProductCountChange?: (count: number) => void
}

export async function ProductsServer({ onProductCountChange }: ProductsServerProps = {}) {
  const products = await getProducts()

  // Notify parent of product count
  if (onProductCountChange && products.length > 0) {
    onProductCountChange(products.length)
  }

  return (
    <div className="space-y-8">
      {/* Filters and Sorting */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-muted/10 border border-border rounded-none">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">Filter by price:</span>
            <select className="text-sm border border-border rounded-none bg-background px-2 py-1">
              <option value="all">All prices</option>
              <option value="under-20">Under £20</option>
              <option value="20-30">£20 - £30</option>
              <option value="30-40">£30 - £40</option>
              <option value="over-40">Over £40</option>
            </select>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <SortAsc className="h-4 w-4" />
          <span className="text-sm font-medium">Sort by:</span>
          <select className="text-sm border border-border rounded-none bg-background px-2 py-1">
            <option value="name">Name A-Z</option>
            <option value="price-low">Price Low-High</option>
            <option value="price-high">Price High-Low</option>
          </select>
        </div>
      </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
    </div>
  )
}