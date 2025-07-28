"use client"

import { Layout } from "@/components/layout"
import { CartSummary, AddToCartButton } from "@/components/cart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/hooks/use-cart"
import type { Product, ProductVariant } from "@/types"

// Demo products for testing cart functionality
const demoProducts: (Product & { variants: ProductVariant[] })[] = [
  {
    id: "demo-1",
    name: "Regiment Pride T-Shirt",
    slug: "regiment-pride-tshirt",
    description: "Premium cotton t-shirt featuring classic regimental insignia.",
    price: 24.99,
    category_id: "1",
    main_image_url: "/placeholder-tshirt.jpg",
    is_featured: false,
    is_active: true,
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
    variants: [
      {
        id: "demo-1-m-olive",
        product_id: "demo-1",
        size: "M",
        color: "Olive",
        sku: "REG-PRIDE-M-OLIVE",
        stock_quantity: 15,
        price_adjustment: 0,
        image_urls: ["/placeholder-tshirt.jpg"],
        is_active: true,
        created_at: "2024-01-01",
        updated_at: "2024-01-01"
      }
    ]
  },
  {
    id: "demo-2",
    name: "Tactical Operations Tee",
    slug: "tactical-ops-tee",
    description: "Rugged design inspired by special operations units.",
    price: 29.99,
    category_id: "1",
    main_image_url: "/placeholder-tshirt.jpg",
    is_featured: false,
    is_active: true,
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
    variants: [
      {
        id: "demo-2-l-black",
        product_id: "demo-2",
        size: "L",
        color: "Black",
        sku: "TAC-OPS-L-BLACK",
        stock_quantity: 8,
        price_adjustment: 0,
        image_urls: ["/placeholder-tshirt.jpg"],
        is_active: true,
        created_at: "2024-01-01",
        updated_at: "2024-01-01"
      }
    ]
  },
  {
    id: "demo-3",
    name: "NAAFI Heritage Shirt",
    slug: "naafi-heritage",
    description: "Celebrating Navy, Army and Air Force Institutes heritage.",
    price: 26.99,
    category_id: "3",
    main_image_url: "/placeholder-tshirt.jpg",
    is_featured: false,
    is_active: true,
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
    variants: [
      {
        id: "demo-3-s-navy",
        product_id: "demo-3",
        size: "S",
        color: "Navy",
        sku: "NAAFI-HERITAGE-S-NAVY",
        stock_quantity: 0, // Out of stock for testing
        price_adjustment: 0,
        image_urls: ["/placeholder-tshirt.jpg"],
        is_active: true,
        created_at: "2024-01-01",
        updated_at: "2024-01-01"
      }
    ]
  }
]

export default function CartDemo() {
  const { items, totalItems, totalPrice, clearCart, openCart } = useCart()

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Demo Products */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-display font-bold mb-2">
                Shopping Cart Demo
              </h1>
              <p className="text-muted-foreground">
                Test the cart functionality with these demo products
              </p>
            </div>

            {/* Demo Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {demoProducts.map((product) => {
                const variant = product.variants[0]
                const isOutOfStock = variant.stock_quantity <= 0
                
                return (
                  <Card key={product.id}>
                    <CardHeader>
                      <div className="aspect-square bg-muted rounded-lg mb-4 flex items-center justify-center">
                        <div className="text-4xl">👕</div>
                      </div>
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {product.description}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="text-xl font-bold">
                            £{product.price}
                          </div>
                          <div className="flex items-center gap-2">
                            {variant.size && (
                              <Badge variant="outline">{variant.size}</Badge>
                            )}
                            {variant.color && (
                              <Badge variant="outline">{variant.color}</Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          {isOutOfStock ? (
                            <Badge variant="destructive">Out of Stock</Badge>
                          ) : variant.stock_quantity <= 5 ? (
                            <Badge variant="warning">
                              Only {variant.stock_quantity} left
                            </Badge>
                          ) : (
                            <Badge variant="success">In Stock</Badge>
                          )}
                        </div>

                        <AddToCartButton
                          productId={product.id}
                          variantId={variant.id}
                          name={product.name}
                          price={product.price}
                          image={product.main_image_url || "/placeholder-tshirt.jpg"}
                          maxQuantity={variant.stock_quantity}
                          className="w-full"
                          size="lg"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Cart Actions */}
            {items.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Cart Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Button 
                      onClick={openCart} 
                      variant="military"
                      className="w-full"
                    >
                      View Cart Drawer
                    </Button>
                    
                    <Button 
                      onClick={clearCart} 
                      variant="destructive"
                      className="w-full"
                    >
                      Clear Cart
                    </Button>
                    
                    <Button 
                      variant="outline"
                      className="w-full"
                    >
                      Proceed to Checkout
                    </Button>
                  </div>
                  
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Cart Stats</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Items</div>
                        <div className="font-semibold">{totalItems}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Total</div>
                        <div className="font-semibold">£{totalPrice.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Cart Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <CartSummary showItems />
            </div>
          </div>
        </div>

        {/* Features Demo */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🛒 Cart Drawer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Animated slide-out cart with quantity controls and real-time updates.
              </p>
              <ul className="text-xs space-y-1">
                <li>• Framer Motion animations</li>
                <li>• Quantity increment/decrement</li>
                <li>• Remove items functionality</li>
                <li>• Free shipping progress bar</li>
                <li>• Optimistic UI updates</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">💾 Persistence</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Cart state is automatically saved to localStorage and restored on page refresh.
              </p>
              <ul className="text-xs space-y-1">
                <li>• Automatic localStorage sync</li>
                <li>• Cart survives page refresh</li>
                <li>• Cross-tab synchronization</li>
                <li>• Error handling for corrupted data</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">⚡ Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Optimized for performance with memoized calculations and efficient updates.
              </p>
              <ul className="text-xs space-y-1">
                <li>• Memoized cart totals</li>
                <li>• Optimized re-renders</li>
                <li>• Efficient state updates</li>
                <li>• Loading states for UX</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}