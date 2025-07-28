"use client"

import { Layout } from "@/components/layout/layout"
import { useCartStore } from "@/store/cart-ultra-minimal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice } from "@/lib/utils"

export default function CheckoutSimplePage() {
  const items = useCartStore(state => state.items)
  const totalPrice = useCartStore(state => state.totalPrice)
  const totalItems = useCartStore(state => state.totalItems)

  // Debug: Log cart state
  console.log('Checkout page - Cart state:', {
    items,
    totalItems,
    totalPrice,
    itemsLength: items.length
  })

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
            <p className="text-muted-foreground mb-6">Add some items before checking out.</p>
            <Button asChild>
              <a href="/categories">Continue Shopping</a>
            </Button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>
          
          {/* Order Summary */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity} × {formatPrice(item.price)}
                      </p>
                    </div>
                    <span className="font-medium">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
                
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total ({totalItems} items):</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Checkout Form */}
          <Card>
            <CardHeader>
              <CardTitle>Payment & Shipping</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Checkout functionality coming soon!
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  This is a demo checkout page. The full payment integration will be implemented next.
                </p>
                <div className="space-y-3">
                  <Button 
                    size="lg" 
                    className="w-full"
                    onClick={() => {
                      alert("Demo checkout completed! Cart will be cleared.")
                      useCartStore.getState().clearCart()
                      window.location.href = "/"
                    }}
                  >
                    Complete Order (Demo)
                  </Button>
                  <Button variant="outline" asChild className="w-full">
                    <a href="/">Back to Home</a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}