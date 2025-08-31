"use client"

import { useState, useEffect } from 'react'
import { ExpressCheckoutSimple } from '@/components/checkout/express-checkout-simple'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Shield, CreditCard, Zap, CheckCircle, AlertCircle, Plus, Minus } from 'lucide-react'

interface TestProduct {
  variantId: string
  name: string
  price: number
  size: string
  color: string
  image?: string
}

export default function CheckoutProTest() {
  const [cartItems, setCartItems] = useState<Array<{
    variantId: string
    quantity: number
  }>>([])
  
  const [isSecure, setIsSecure] = useState(false)
  const [environment, setEnvironment] = useState({
    protocol: 'N/A',
    hostname: 'N/A'
  })

  // Test product - using your live variant ID
  const testProduct: TestProduct = {
    variantId: 'd9c1525c-7dfe-4fe8-a377-d290d08a9c48',
    name: 'Mess Hall Brotherhood',
    price: 20.99,
    size: 'XS',
    color: 'Black'
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const secure = window.isSecureContext || window.location.protocol === 'https:' || 
                    window.location.hostname === 'localhost'
      setIsSecure(secure)
      setEnvironment({
        protocol: window.location.protocol,
        hostname: window.location.hostname
      })
    }
  }, [])

  const totalAmount = cartItems.length > 0 ? 
    (testProduct.price * cartItems.reduce((sum, item) => sum + item.quantity, 0)) + 4.99 : 0

  const addToCart = () => {
    const existingItem = cartItems.find(item => item.variantId === testProduct.variantId)
    if (existingItem) {
      setCartItems(items => 
        items.map(item => 
          item.variantId === testProduct.variantId 
            ? { ...item, quantity: Math.min(item.quantity + 1, 5) }
            : item
        )
      )
    } else {
      setCartItems([{ variantId: testProduct.variantId, quantity: 1 }])
    }
  }

  const updateQuantity = (change: number) => {
    setCartItems(items => 
      items.map(item => {
        const newQuantity = item.quantity + change
        return newQuantity <= 0 
          ? null
          : { ...item, quantity: Math.min(newQuantity, 5) }
      }).filter(Boolean) as typeof items
    )
  }

  const clearCart = () => setCartItems([])

  const handlePaymentSuccess = (result: any) => {
    console.log('🎉 Payment successful:', result)
    alert(`Payment completed successfully!\nPayment ID: ${result.id}`)
    clearCart()
  }

  const handlePaymentError = (error: string) => {
    console.error('❌ Payment failed:', error)
    alert(`Payment failed: ${error}`)
  }

  const currentItem = cartItems.find(item => item.variantId === testProduct.variantId)

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/30 to-white p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-3xl font-bold text-green-900 mb-2">
            Military Tees UK - Express Checkout
          </h1>
          <p className="text-green-700">Optimized for maximum conversion</p>
        </div>

        {/* Environment Status */}
        <Card className={`border-2 ${isSecure ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${isSecure ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={isSecure ? 'text-green-800' : 'text-red-800'}>
                  {environment.protocol} - {isSecure ? 'Secure' : 'Insecure'}
                </span>
              </div>
              <Badge variant="outline">
                {environment.hostname}
              </Badge>
              <Badge variant={isSecure ? "default" : "destructive"}>
                {isSecure ? 'Express Checkout Available' : 'HTTPS Required'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left: Product & Cart */}
          <div className="space-y-6">
            
            {/* Test Product */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-green-600" />
                  Test Product
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900">{testProduct.name}</h3>
                  <p className="text-sm text-green-700">
                    Size: {testProduct.size} • Color: {testProduct.color}
                  </p>
                  <p className="text-lg font-bold text-green-900 mt-2">
                    £{testProduct.price.toFixed(2)}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={addToCart} className="flex-1">
                    <Plus className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                  <Button variant="outline" onClick={clearCart}>
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Cart Status */}
            {cartItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-800">Your Cart</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{testProduct.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {testProduct.size} • {testProduct.color}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(-1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-medium">
                        {currentItem?.quantity || 0}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(1)}
                        disabled={(currentItem?.quantity || 0) >= 5}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="border-t pt-3 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>£{(testProduct.price * (currentItem?.quantity || 0)).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span>£4.99</span>
                    </div>
                    <div className="flex justify-between font-bold text-green-900 border-t pt-1">
                      <span>Total:</span>
                      <span>£{totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Testing Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Testing Instructions</CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-2">
                <div>
                  <p className="font-medium text-green-800">Express Checkout:</p>
                  <ul className="text-muted-foreground ml-3">
                    <li>• Apple Pay: Safari on iOS/macOS (HTTPS only)</li>
                    <li>• Google Pay: Chrome/Android (HTTPS only)</li>
                    <li>• Test card: 4242 4242 4242 4242</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-green-800">Conversion Features:</p>
                  <ul className="text-muted-foreground ml-3">
                    <li>• Single button design</li>
                    <li>• Optimized error handling</li>
                    <li>• Trust signals included</li>
                    <li>• Loading states</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Express Checkout */}
          <div className="space-y-6">
            
            {/* Express Checkout Component */}
            {cartItems.length > 0 ? (
              <ExpressCheckoutSimple
                items={cartItems}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Zap className="h-12 w-12 mx-auto mb-4 text-green-600 opacity-50" />
                  <h3 className="font-semibold text-green-900 mb-2">Express Checkout</h3>
                  <p className="text-sm text-muted-foreground">
                    Add a product to enable express checkout
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Trust Signals */}
            <Card>
              <CardHeader>
                <CardTitle className="text-green-800 text-sm">Security & Trust</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span>SSL Encrypted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>PCI Compliant</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-green-600" />
                    <span>Secure Payments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-green-600" />
                    <span>Fast Checkout</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Environment Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">System Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>Stripe Keys:</span>
                  <Badge variant="default">Live Mode</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Environment:</span>
                  <Badge variant="outline">{environment.hostname}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Security:</span>
                  <Badge variant={isSecure ? "default" : "destructive"}>
                    {isSecure ? 'Secure' : 'Insecure'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}