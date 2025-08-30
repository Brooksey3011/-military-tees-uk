import { createClient } from '@supabase/supabase-js'
import { Layout } from "@/components/layout/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TestCartButton } from "./test-cart-button"

async function getTestProducts() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: products, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        price,
        main_image_url,
        slug,
        category:categories(name),
        variants:product_variants(
          id,
          sku,
          size,
          color,
          price,
          stock_quantity
        )
      `)
      .eq('is_active', true)
      .limit(5)

    if (error) {
      throw error
    }

    return products || []
  } catch (error) {
    console.error('Test products fetch error:', error)
    return []
  }
}

export default async function TestProductsPage() {
  const products = await getTestProducts()

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">🧪 Product Database Test</h1>
          
          <div className="grid gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📊 Database Connection Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {products.length > 0 ? (
                  <div className="space-y-2">
                    <Badge className="bg-green-600 text-white">✅ Connected</Badge>
                    <p>Successfully loaded {products.length} products from Supabase database</p>
                    <div className="text-sm text-gray-600">
                      <p>🔑 Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30)}...</p>
                      <p>🔐 Service Key: {process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Present' : '❌ Missing'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Badge className="bg-red-600 text-white">❌ No Products Found</Badge>
                    <p>Unable to load products from database</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4">
            <h2 className="text-2xl font-semibold">Sample Products (for Cart Testing)</h2>
            {products.map((product) => (
              <Card key={product.id} className="border-2">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      {product.main_image_url ? (
                        <img 
                          src={product.main_image_url} 
                          alt={product.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <span className="text-xs">IMG</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{product.name}</h3>
                      <p className="text-green-600 font-bold">£{product.price.toFixed(2)}</p>
                      <p className="text-sm text-gray-600">
                        Category: {product.category?.name || 'Unknown'}
                      </p>
                      <div className="mt-2">
                        <p className="text-sm font-medium">Available Variants:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {product.variants?.map((variant) => (
                            <Badge 
                              key={variant.id} 
                              variant="outline" 
                              className="text-xs"
                            >
                              {variant.size} {variant.color} (£{variant.price})
                            </Badge>
                          )) || <Badge variant="outline">No variants</Badge>}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Product ID:</p>
                      <p className="font-mono text-xs">{product.id}</p>
                      {product.variants && product.variants.length > 0 && (
                        <>
                          <p className="text-xs text-gray-500 mt-2">First Variant ID:</p>
                          <p className="font-mono text-xs">{product.variants[0].id}</p>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {product.variants && product.variants.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <TestCartButton 
                        productName={product.name}
                        variantId={product.variants[0].id}
                        price={product.variants[0].price}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 p-6 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">🎯 How to Test:</h3>
            <ol className="list-decimal list-inside space-y-1 text-blue-800">
              <li>Visit any product page and add items to cart with real product IDs shown above</li>
              <li>Go to checkout - you should see the express checkout section prominently</li>
              <li>Click "⚡ EXPRESS CHECKOUT" - it should work with real Stripe integration</li>
              <li>Cart items should have valid variant IDs that Stripe can process</li>
            </ol>
          </div>
        </div>
      </div>
    </Layout>
  )
}