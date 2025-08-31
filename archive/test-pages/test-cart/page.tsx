"use client"

import * as React from "react"
import { Layout } from "@/components/layout/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSimpleCart } from "@/hooks/use-simple-cart"
import { ShoppingCart, Plus } from "lucide-react"
import Link from "next/link"

export default function TestCartPage() {
  const { items, totalItems, totalPrice, addItem } = useSimpleCart()

  const testProducts = [
    {
      id: "test-1",
      variantId: "variant-test-1",
      name: "Military Green T-Shirt",
      price: 24.99,
      size: "Large",
      color: "Military Green",
      image: "/images/test-product.jpg"
    },
    {
      id: "test-2", 
      variantId: "variant-test-2",
      name: "Desert Combat Hoodie",
      price: 39.99,
      size: "Medium",
      color: "Desert Sand",
      image: "/images/test-hoodie.jpg"
    },
    {
      id: "test-3",
      variantId: "variant-test-3", 
      name: "Tactical Polo Shirt",
      price: 29.99,
      size: "Large",
      color: "Navy Blue",
      image: "/images/test-polo.jpg"
    }
  ]

  const handleAddToCart = (product: typeof testProducts[0]) => {
    addItem({
      id: product.id,
      variantId: product.variantId,
      name: product.name,
      price: product.price,
      quantity: 1,
      size: product.size,
      color: product.color,
      image: product.image,
      productId: product.id
    })
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-green-50/30 to-background">
        <div className="container mx-auto px-4 py-8">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold tracking-wider uppercase text-green-800 mb-4">
              Test Enhanced Checkout
            </h1>
            <p className="text-muted-foreground">
              Add test items to your cart and try the enhanced checkout experience
            </p>
          </div>

          {/* Current Cart Status */}
          <Card className="border-2 border-green-200 rounded-none mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display font-bold tracking-wide uppercase text-green-800">
                <ShoppingCart className="h-5 w-5" />
                Current Cart Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <span>Items in cart: <strong>{totalItems}</strong></span>
                <span>Total: <strong>£{totalPrice.toFixed(2)}</strong></span>
              </div>
              
              {items.length > 0 && (
                <div className="space-y-2 mb-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded">
                      <span className="text-sm">{item.name}</span>
                      <span className="text-sm font-semibold">£{item.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-4">
                <Link href="/cart">
                  <Button variant="outline" className="rounded-none border-2 font-display font-bold tracking-wide uppercase">
                    View Cart
                  </Button>
                </Link>
                {items.length > 0 && (
                  <Link href="/checkout/enhanced">
                    <Button className="rounded-none bg-green-700 hover:bg-green-800 font-display font-bold tracking-wide uppercase">
                      ✨ Try Enhanced Checkout
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Test Products */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testProducts.map((product) => (
              <Card key={product.id} className="border-2 border-border rounded-none">
                <CardHeader>
                  <CardTitle className="font-semibold text-lg">{product.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <p className="text-2xl font-bold text-green-700">£{product.price.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">Size: {product.size}</p>
                    <p className="text-sm text-muted-foreground">Color: {product.color}</p>
                  </div>
                  
                  <Button
                    onClick={() => handleAddToCart(product)}
                    className="w-full rounded-none bg-green-700 hover:bg-green-800 font-display font-bold tracking-wide uppercase"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Instructions */}
          <Card className="border-2 border-green-200 rounded-none mt-8">
            <CardHeader>
              <CardTitle className="font-display font-bold tracking-wide uppercase text-green-800">
                Testing Instructions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>1. <strong>Add items to cart</strong> using the buttons above</p>
                <p>2. <strong>View your cart</strong> to see the enhanced checkout button</p>
                <p>3. <strong>Try the Enhanced Checkout</strong> to experience the new flow</p>
                <p>4. <strong>Test promo codes:</strong> MILITARY10, FIRSTORDER, SAVE5</p>
                <p>5. <strong>Test different delivery options</strong> and payment methods</p>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </Layout>
  )
}