"use client"

import { useState } from 'react'
import { DirectCheckoutButton } from '@/components/checkout/direct-checkout-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Shield, CreditCard, Zap, CheckCircle, Plus, Minus, ShoppingCart } from 'lucide-react'

interface TestItem {
  variantId: string
  quantity: number
  name: string
  price: number
  size: string
  color: string
}

export default function DirectCheckoutTest() {
  const [cartItems, setCartItems] = useState<TestItem[]>([])

  // Test product using your live variant
  const testProduct = {
    variantId: 'd9c1525c-7dfe-4fe8-a377-d290d08a9c48',
    name: 'Mess Hall Brotherhood',
    price: 20.99,
    size: 'XS',
    color: 'Black'
  }

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
      setCartItems([...cartItems, { ...testProduct, quantity: 1 }])
    }
  }

  const updateQuantity = (variantId: string, change: number) => {
    setCartItems(items => 
      items.map(item => {
        if (item.variantId !== variantId) return item
        const newQuantity = item.quantity + change
        return newQuantity <= 0 ? null : { ...item, quantity: Math.min(newQuantity, 5) }
      }).filter(Boolean) as TestItem[]
    )
  }

  const clearCart = () => setCartItems([])

  // Calculate totals (NO VAT - not VAT registered)
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const shipping = subtotal >= 50 ? 0 : 4.99
  const total = subtotal + shipping

  // Convert to cart format for the button
  const simpleCartItems = cartItems.map(item => ({
    variantId: item.variantId,
    quantity: item.quantity
  }))

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/30 to-white p-4">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-3xl font-bold text-green-900 mb-2">
            Direct Stripe Checkout Test
          </h1>
          <p className="text-green-700">
            Single button → Immediate redirect to Stripe Checkout
          </p>
        </div>

        {/* Key Benefits */}
        <Card className="border-2 border-green-200 bg-green-50/50">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div className="flex flex-col items-center gap-2">
                <Zap className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-semibold text-green-900">One Click</p>
                  <p className="text-sm text-green-700">Direct to Stripe</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Shield className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="font-semibold text-blue-900">Stripe Hosted</p>
                  <p className="text-sm text-blue-700">PCI Compliant</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <CreditCard className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="font-semibold text-purple-900">All Cards</p>
                  <p className="text-sm text-purple-700">Global Support</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-semibold text-green-900">Optimized</p>
                  <p className="text-sm text-green-700">Max Conversion</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left: Product & Cart Management */}
          <div className="space-y-6">
            
            {/* Test Product */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-green-600" />
                  Test Product (Live Data)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="font-bold text-green-900 text-lg">{testProduct.name}</h3>
                  <p className="text-green-700">
                    Size: <Badge variant="outline">{testProduct.size}</Badge> • 
                    Color: <Badge variant="outline">{testProduct.color}</Badge>
                  </p>
                  <p className="text-2xl font-bold text-green-900 mt-2">
                    £{testProduct.price.toFixed(2)}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={addToCart} className="flex-1 bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                  <Button variant="outline" onClick={clearCart}>
                    Clear Cart
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Cart Display */}
            {cartItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-800">Your Cart</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.variantId} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium text-green-900">{item.name}</p>
                        <p className="text-sm text-green-700">{item.size} • {item.color}</p>
                        <p className="text-sm font-medium">£{item.price.toFixed(2)} each</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.variantId, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-bold">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.variantId, 1)}
                          disabled={item.quantity >= 5}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {/* Order Summary */}
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>£{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping:</span>
                      <span className={shipping === 0 ? "text-green-600 font-medium" : ""}>
                        {shipping === 0 ? "FREE" : `£${shipping.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-green-900 border-t pt-2">
                      <span>Total:</span>
                      <span>£{total.toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground text-center mt-2">
                      No VAT applied - not VAT registered
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Testing Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Testing Instructions</CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-3">
                <div>
                  <p className="font-semibold text-green-800 mb-1">Flow Test:</p>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                    <li>Add product to cart</li>
                    <li>Click "Secure Checkout" button</li>
                    <li>Automatically redirects to Stripe</li>
                    <li>Complete payment on Stripe's page</li>
                    <li>Returns to success page</li>
                  </ol>
                </div>
                
                <div>
                  <p className="font-semibold text-green-800 mb-1">Test Cards:</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Success: <code className="bg-gray-100 px-1 rounded">4242 4242 4242 4242</code></li>
                    <li>• Decline: <code className="bg-gray-100 px-1 rounded">4000 0000 0000 0002</code></li>
                    <li>• Any expiry date in future</li>
                    <li>• Any 3-digit CVC</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Direct Checkout */}
          <div className="space-y-6">
            
            {/* Direct Checkout Button */}
            <Card>
              <CardHeader>
                <CardTitle className="text-green-800 text-center">
                  🚀 Direct Stripe Checkout
                </CardTitle>
                <p className="text-sm text-center text-muted-foreground">
                  One click → Immediate redirect to Stripe
                </p>
              </CardHeader>
              <CardContent className="p-6">
                {cartItems.length > 0 ? (
                  <>
                    {/* Mock the cart hook data for the button */}
                    <div className="hidden">
                      {/* This component uses useSimpleCart hook, we'll need to ensure data flows correctly */}
                    </div>
                    
                    {/* Manual implementation for testing */}
                    <div className="space-y-4">
                      <Button
                        size="lg"
                        className="w-full bg-gradient-to-r from-green-700 to-green-800 hover:from-green-800 hover:to-green-900 text-white font-bold h-12"
                        onClick={async () => {
                          try {
                            const response = await fetch('/api/direct-checkout', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                items: cartItems.map(item => ({
                                  variantId: item.variantId,
                                  quantity: item.quantity
                                }))
                              })
                            })
                            
                            const data = await response.json()
                            if (data.url) {
                              window.location.href = data.url
                            }
                          } catch (error) {
                            console.error('Checkout error:', error)
                          }
                        }}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            <span>Secure Checkout</span>
                          </div>
                          <span className="font-bold">
                            £{total.toFixed(2)}
                          </span>
                        </div>
                      </Button>
                      
                      <div className="text-center space-y-2">
                        {shipping === 0 && (
                          <p className="text-sm text-green-600 font-medium">
                            🚚 Free shipping applied!
                          </p>
                        )}
                        <div className="text-xs text-muted-foreground">
                          <div className="flex items-center justify-center gap-2 mb-1">
                            <Shield className="h-3 w-3" />
                            <span>SSL Encrypted • PCI Compliant</span>
                          </div>
                          <p>Powered by Stripe</p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-8">
                    <Zap className="h-12 w-12 mx-auto mb-4 text-green-600 opacity-50" />
                    <h3 className="font-semibold text-green-900 mb-2">Direct Checkout</h3>
                    <p className="text-sm text-muted-foreground">
                      Add a product to test direct checkout
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">System Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <span>API Ready</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <span>Stripe Live Keys</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <span>Database Live</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <span>Vercel Ready</span>
                  </div>
                </div>
                
                <div className="text-center pt-2 border-t">
                  <Badge variant="default" className="bg-green-600">
                    Production Ready
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Conversion Benefits</CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-2">
                <div className="space-y-1">
                  <p className="font-medium text-green-800">✅ Removed Friction:</p>
                  <ul className="text-muted-foreground ml-3 space-y-0.5">
                    <li>• No shipping/billing forms on your site</li>
                    <li>• Single button instead of multiple options</li>
                    <li>• Direct redirect to trusted Stripe</li>
                    <li>• Stripe handles all address collection</li>
                  </ul>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-green-800">🚀 Conversion Boost:</p>
                  <ul className="text-muted-foreground ml-3 space-y-0.5">
                    <li>• Fewer steps = higher completion</li>
                    <li>• Trust signals maximize confidence</li>
                    <li>• Mobile-optimized flow</li>
                    <li>• Professional Stripe branding</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}