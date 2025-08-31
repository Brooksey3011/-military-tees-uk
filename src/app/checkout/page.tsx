"use client"

import { useEffect } from 'react'
import { useSimpleCart } from '@/hooks/use-simple-cart'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, ArrowLeft, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { trackBeginCheckout } from '@/components/analytics/plausible'
import Link from 'next/link'

export default function CheckoutRedirectPage() {
  const { items } = useSimpleCart()

  useEffect(() => {
    // Auto-redirect to direct checkout if items exist
    if (items.length > 0) {
      handleDirectCheckout()
    }
  }, [items])

  const handleDirectCheckout = async () => {
    try {
      // Track checkout initiation
      const totalValue = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      trackBeginCheckout(totalValue, items.length)

      // Convert cart items to API format
      const checkoutItems = items.map(item => ({
        variantId: item.variantId,
        quantity: item.quantity
      }))

      // Call direct checkout API
      const response = await fetch('/api/direct-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: checkoutItems })
      })

      const data = await response.json()

      if (response.ok && data.url) {
        // Immediate redirect to Stripe Checkout
        window.location.href = data.url
      } else {
        console.error('Checkout failed:', data.error)
      }
    } catch (error) {
      console.error('Checkout error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/30 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-green-900 mb-2">
              Redirecting to Secure Checkout
            </h1>
            <p className="text-green-700">
              Taking you directly to Stripe for payment
            </p>
          </div>

          <Card className="border-2 border-green-200">
            <CardContent className="p-8">
              
              {items.length > 0 ? (
                // Redirecting state
                <div className="text-center space-y-6">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-green-900 mb-2">
                      Redirecting to Stripe Checkout...
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      You'll be redirected to our secure payment processor in a moment.
                    </p>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        Your payment is secured by Stripe
                      </span>
                    </div>
                    <p className="text-xs text-green-700 text-center">
                      SSL encrypted • PCI compliant • All major cards accepted • No VAT applied
                    </p>
                  </div>

                  {/* Manual redirect button in case auto-redirect fails */}
                  <Button 
                    onClick={handleDirectCheckout}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Continue to Checkout
                  </Button>
                </div>
              ) : (
                // Empty cart state
                <div className="text-center space-y-6">
                  <div className="text-6xl opacity-50">🛒</div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Your cart is empty
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      Add some items to your cart before checking out.
                    </p>
                  </div>

                  <Link href="/">
                    <Button className="bg-green-600 hover:bg-green-700">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Info Message */}
          <div className="mt-6 text-center">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-1">
                🚀 Streamlined Checkout Experience
              </h4>
              <p className="text-sm text-blue-800">
                We've simplified our checkout process! No more forms - you'll be taken directly to Stripe's secure checkout page where you can complete your purchase quickly and safely.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}