"use client"

import { useState, useEffect } from 'react'

// Force dynamic rendering for test pages
export const dynamic = 'force-dynamic'
import { VercelExpressCheckout, ExpressCheckoutDeviceTest } from '@/components/checkout/vercel-express-checkout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Zap, CheckCircle, AlertTriangle, Info } from 'lucide-react'

// Fix hydration issues with client-side only rendering
function EnvironmentInfo() {
  const [mounted, setMounted] = useState(false)
  const [envInfo, setEnvInfo] = useState({
    protocol: 'N/A',
    hostname: 'N/A'
  })

  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined') {
      setEnvInfo({
        protocol: window.location.protocol,
        hostname: window.location.hostname
      })
    }
  }, [])

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Environment Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Loading...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Environment Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Protocol:</span>
          <Badge variant="outline">
            {envInfo.protocol}
          </Badge>
        </div>
        <div className="flex justify-between">
          <span>Host:</span>
          <Badge variant="outline">
            {envInfo.hostname}
          </Badge>
        </div>
        <div className="flex justify-between">
          <span>Stripe Mode:</span>
          <Badge variant="outline">
            Live Keys
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

export default function VercelExpressCheckoutTest() {
  const [cartItems, setCartItems] = useState<Array<{
    variantId: string
    quantity: number
  }>>([])

  // Test product variant ID (using your live data)
  const testVariant = {
    variantId: 'd9c1525c-7dfe-4fe8-a377-d290d08a9c48', // Mess Hall Brotherhood XS Black
    quantity: 1,
    name: 'Mess Hall Brotherhood',
    price: 20.99,
    size: 'XS',
    color: 'Black'
  }

  const totalAmount = cartItems.length > 0 ? 
    (20.99 * cartItems.reduce((sum, item) => sum + item.quantity, 0)) + 4.99 : 0

  const addTestProduct = () => {
    setCartItems([{
      variantId: testVariant.variantId,
      quantity: 1
    }])
  }

  const clearCart = () => {
    setCartItems([])
  }

  const handlePaymentSuccess = (paymentIntent: any) => {
    console.log('🎉 Payment succeeded:', paymentIntent)
    alert(`Payment succeeded! Payment ID: ${paymentIntent.id}`)
    clearCart()
  }

  const handlePaymentError = (error: string) => {
    console.error('❌ Payment failed:', error)
    alert(`Payment failed: ${error}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/30 to-background p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <Card className="border-2 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Zap className="h-6 w-6" />
              Vercel Express Checkout Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              This page tests the corrected Stripe Express Checkout implementation that works on Vercel with HTTPS.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm">PaymentIntent API</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <span className="text-sm">HTTPS Detection</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-purple-600" />
                <span className="text-sm">Vercel Ready</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Column: Cart & Controls */}
          <div className="space-y-6">
            
            {/* Cart Management */}
            <Card>
              <CardHeader>
                <CardTitle>Cart Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button onClick={addTestProduct}>
                    Add Test Product
                  </Button>
                  <Button variant="outline" onClick={clearCart}>
                    Clear Cart
                  </Button>
                </div>
                
                {cartItems.length > 0 ? (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium">Cart Items: {cartItems.length}</p>
                    <p className="text-sm text-muted-foreground">
                      {testVariant.name} ({testVariant.size}, {testVariant.color}) - £{testVariant.price}
                    </p>
                    <p className="text-sm font-medium mt-2">
                      Total: £{totalAmount.toFixed(2)} (inc. shipping)
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Cart is empty</p>
                )}
              </CardContent>
            </Card>

            {/* Device Detection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Device & HTTPS Detection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ExpressCheckoutDeviceTest />
              </CardContent>
            </Card>

            {/* Testing Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>Testing Instructions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <h4 className="font-semibold mb-1">Local Testing (HTTP):</h4>
                  <ul className="text-muted-foreground space-y-1 ml-4">
                    <li>• Express buttons won't show (expected)</li>
                    <li>• Use ngrok for HTTPS testing locally</li>
                    <li>• Command: <code className="bg-gray-100 px-1 rounded">ngrok http 3001</code></li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-1">Vercel Testing (HTTPS):</h4>
                  <ul className="text-muted-foreground space-y-1 ml-4">
                    <li>• Deploy to Vercel with live domain</li>
                    <li>• Apple Pay shows on Safari/iOS/macOS</li>
                    <li>• Google Pay shows on Chrome/Android</li>
                    <li>• Link shows for returning customers</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-1">Test Cards:</h4>
                  <ul className="text-muted-foreground space-y-1 ml-4">
                    <li>• Success: <code className="bg-gray-100 px-1 rounded">4242 4242 4242 4242</code></li>
                    <li>• Decline: <code className="bg-gray-100 px-1 rounded">4000 0000 0000 0002</code></li>
                    <li>• 3D Secure: <code className="bg-gray-100 px-1 rounded">4000 0025 0000 3155</code></li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Express Checkout */}
          <div className="space-y-6">
            
            {/* Express Checkout Component */}
            <Card>
              <CardHeader>
                <CardTitle className="text-green-800">Express Checkout</CardTitle>
              </CardHeader>
              <CardContent>
                {cartItems.length > 0 ? (
                  <VercelExpressCheckout
                    items={cartItems}
                    totalAmount={totalAmount}
                    shippingAddress={{
                      firstName: 'Test',
                      lastName: 'Customer',
                      email: 'test@militarytees.co.uk',
                      phone: '+44 1234 567890',
                      address1: '123 Test Street',
                      city: 'London',
                      postcode: 'SW1A 1AA',
                      country: 'GB'
                    }}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                ) : (
                  <div className="text-center p-8 text-muted-foreground">
                    <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Add a product to test Express Checkout</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Status Indicators */}
            <Card>
              <CardHeader>
                <CardTitle>Implementation Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="bg-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    PaymentIntent API
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Using correct API for Express Checkout
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="bg-blue-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    HTTPS Detection
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Properly detects secure context
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="bg-purple-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Vercel Compatible
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Serverless functions ready
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-orange-500 text-orange-700">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Live Keys Active
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Using live Stripe keys - real charges!
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Environment Info */}
            <EnvironmentInfo />
          </div>
        </div>
      </div>
    </div>
  )
}