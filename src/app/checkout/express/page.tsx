"use client"

import { useEffect } from 'react'
import { useSimpleCart } from '@/hooks/use-simple-cart'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, ArrowLeft, Zap, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function ExpressCheckoutRedirectPage() {
  const { items } = useSimpleCart()

  useEffect(() => {
    // Auto-redirect to direct checkout if items exist
    if (items.length > 0) {
      handleDirectCheckout()
    }
  }, [items])

  const handleDirectCheckout = async () => {
    try {
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
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap className="h-6 w-6 text-green-600" />
              <h1 className="text-2xl font-bold text-green-900">
                Express Checkout
              </h1>
            </div>
            <p className="text-green-700">
              Lightning-fast direct to Stripe payment
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
                      ⚡ Redirecting to Express Checkout...
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Taking you directly to Stripe for the fastest possible checkout experience.
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        Express & Secure Payment
                      </span>
                    </div>
                    <p className="text-xs text-green-700 text-center mb-2">
                      SSL encrypted • PCI compliant • One-click checkout
                    </p>
                    <div className="text-xs text-blue-700 text-center">
                      🍎 Apple Pay • 🅱️ Google Pay • 💳 All Cards Supported
                    </div>
                  </div>

                  {/* Manual redirect button in case auto-redirect fails */}
                  <Button 
                    onClick={handleDirectCheckout}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Continue to Express Checkout
                  </Button>
                </div>
              ) : (
                // Empty cart state
                <div className="text-center space-y-6">
                  <div className="text-6xl opacity-50">⚡</div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Ready for Express Checkout
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      Add some items to your cart for lightning-fast checkout.
                    </p>
                  </div>

                  <Link href="/">
                    <Button className="bg-green-600 hover:bg-green-700">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Start Shopping
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enhanced Info Message */}
          <div className="mt-6 text-center">
            <div className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200 rounded-lg p-6">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Zap className="h-5 w-5 text-blue-600" />
                <h4 className="font-bold text-blue-900">
                  Express Checkout = Maximum Speed
                </h4>
              </div>
              <div className="space-y-2 text-sm text-blue-800">
                <p>
                  🚀 <strong>No Forms:</strong> Skip all the paperwork - Stripe handles everything
                </p>
                <p>
                  ⚡ <strong>One Click:</strong> From cart to payment in seconds
                </p>
                <p>
                  🛡️ <strong>Secure:</strong> Industry-leading security with Stripe
                </p>
                <p>
                  📱 <strong>Mobile Optimized:</strong> Perfect for touch devices
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}