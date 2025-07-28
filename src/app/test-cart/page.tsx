"use client"

import { Layout } from "@/components/layout"
import { AddToCartButton } from "@/components/cart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCart } from "@/hooks/use-cart"
import type { Product, ProductVariant } from "@/types"

// Simple test product
const testProduct: Product = {
  id: "test-1",
  name: "Test Military Shirt",
  slug: "test-military-shirt",
  description: "A simple test product for cart functionality",
  price: 25.00,
  category_id: "1",
  main_image_url: "/placeholder-tshirt.jpg",
  created_at: "2024-01-01",
  updated_at: "2024-01-01",
}

const testVariant: ProductVariant = {
  id: "test-variant-1",
  product_id: "test-1",
  size: "M",
  color: "Green",
  sku: "TEST-M-GREEN",
  stock_quantity: 10,
  image_urls: ["/placeholder-tshirt.jpg"],
  created_at: "2024-01-01",
  updated_at: "2024-01-01"
}

export default function TestCart() {
  const { items, totalItems, totalPrice, clearCart, openCart } = useCart()

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Cart Test Page
        </h1>

        {/* Simple Add to Cart Test */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Test Product</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-200 h-32 rounded flex items-center justify-center">
              <span className="text-4xl">👕</span>
            </div>
            
            <div>
              <h3 className="font-semibold">{testProduct.name}</h3>
              <p className="text-sm text-gray-600">{testProduct.description}</p>
              <p className="text-lg font-bold">£{testProduct.price}</p>
              <p className="text-sm">Size: {testVariant.size} | Color: {testVariant.color}</p>
            </div>

            <AddToCartButton
              product={testProduct}
              variant={testVariant}
              className="w-full"
            />
          </CardContent>
        </Card>

        {/* Cart Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Cart Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>Items in cart: <strong>{totalItems}</strong></p>
              <p>Total price: <strong>£{totalPrice.toFixed(2)}</strong></p>
              
              <div className="flex gap-2 mt-4">
                <Button 
                  onClick={openCart} 
                  disabled={items.length === 0}
                  className="flex-1"
                >
                  Open Cart
                </Button>
                <Button 
                  onClick={clearCart} 
                  variant="outline"
                  disabled={items.length === 0}
                  className="flex-1"
                >
                  Clear Cart
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cart Items List */}
        {items.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Items in Cart</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="p-2 border rounded text-sm">
                    <strong>{item.product.name}</strong><br />
                    Size: {item.variant.size} | Color: {item.variant.color}<br />
                    Quantity: {item.quantity} | Price: £{(item.product.price * item.quantity).toFixed(2)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  )
}