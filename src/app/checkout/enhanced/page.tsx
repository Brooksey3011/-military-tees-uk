"use client"

import * as React from "react"
import { Layout } from "@/components/layout/layout"
import { useSimpleCart } from "@/hooks/use-simple-cart"
import { useAuth } from "@/hooks/use-auth"
import EnhancedCheckout from "@/components/checkout/enhanced-checkout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// Force dynamic rendering for this cart-dependent page
export const dynamic = 'force-dynamic'

export default function EnhancedCheckoutPage() {
  const { user } = useAuth()
  const { items, totalItems, totalPrice, clearCart } = useSimpleCart()
  const router = useRouter()

  // Redirect if cart is empty after mount
  React.useEffect(() => {
    if (items.length === 0) {
      router.push('/categories')
    }
  }, [items.length, router])

  const handlePaymentSuccess = async (result: any) => {
    console.log('Payment successful:', result)
    
    // Clear the cart
    clearCart()
    
    // Redirect to success page
    router.push(`/checkout/success?payment_intent=${result.paymentIntent}`)
  }

  const handlePaymentError = (error: string) => {
    console.error('Payment failed:', error)
    // Error is already displayed in the component
  }

  const handleBack = () => {
    router.push('/cart')
  }

  // Show loading state while cart loads
  if (items.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-green-50/30 to-background">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-2xl mx-auto text-center">
              <Card className="border-2 border-border rounded-none">
                <CardHeader>
                  <CardTitle className="font-display font-bold tracking-wide uppercase text-green-800">
                    <ShoppingBag className="h-8 w-8 mx-auto mb-4" />
                    Your Cart is Empty
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Add some items to your cart before checking out.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Link href="/categories">
                      <Button className="rounded-none font-display font-bold tracking-wide uppercase bg-green-700 hover:bg-green-800">
                        Continue Shopping
                      </Button>
                    </Link>
                    <Link href="/cart">
                      <Button 
                        variant="outline"
                        className="rounded-none border-2 font-display font-bold tracking-wide uppercase"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        View Cart
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  // Transform cart items to match the enhanced checkout interface
  const checkoutItems = items.map(item => ({
    id: item.id,
    variantId: item.variantId,
    quantity: item.quantity,
    price: item.price,
    name: item.name,
    size: item.size,
    color: item.color,
    image: item.image
  }))

  return (
    <Layout>
      <EnhancedCheckout
        items={checkoutItems}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentError={handlePaymentError}
        onBack={handleBack}
      />
    </Layout>
  )
}