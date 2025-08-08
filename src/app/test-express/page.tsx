"use client"

import React from 'react'
import { useSimpleCart } from '@/hooks/use-simple-cart'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StripeExpressCheckout, PaymentMethodDetector } from '@/components/checkout/stripe-express-element'
import { Smartphone, Zap, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function TestExpressPage() {
  const { items, addItem, clearCart } = useSimpleCart()

  const addTestProduct = () => {
    const testProduct = {
      id: 'd9c1525c-7dfe-4fe8-a377-d290d08a9c48',
      productId: 'd9c1525c-7dfe-4fe8-a377-d290d08a9c48',
      variantId: 'd9c1525c-7dfe-4fe8-a377-d290d08a9c48',
      name: 'Mess Hall Brotherhood',
      price: 20.99,
      quantity: 1,
      maxQuantity: 10,
      size: 'XS',
      color: 'Black',
      image: '/images/products/mess-hall-brotherhood-black.jpg'
    }
    addItem(testProduct)
  }

  const testShippingAddress = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'test@militarytees.co.uk',
    phone: '+44 1234 567890',
    address1: '123 Test Street',
    address2: 'Apartment 1',
    city: 'London',
    postcode: 'SW1A 1AA',
    country: 'GB'
  }

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal >= 50 ? 0 : 4.99
  const tax = Math.round((subtotal + shipping) * 0.2 * 100) / 100
  const total = subtotal + shipping + tax

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/30 to-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <Card className="border-2 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Zap className="h-6 w-6" />
              Express Checkout Test & Device Detection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              This page demonstrates the intelligent Stripe Express Checkout that automatically detects 
              your device's payment capabilities and shows the best available options.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm">Device Detection</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <span className="text-sm">Smart Payment Methods</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-purple-600" />
                <span className="text-sm">One-Click Checkout</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Column - Cart Management */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cart Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button onClick={addTestProduct}>
                    Add Test Product
                  </Button>
                  <Button onClick={clearCart} variant="outline">
                    Clear Cart
                  </Button>
                </div>
                <p className="text-sm">Cart items: <strong>{items.length}</strong></p>
                {items.length > 0 && (
                  <div className="space-y-2">
                    {items.map(item => (
                      <div key={item.id} className="p-3 border rounded-lg bg-muted/20">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.size && `Size: ${item.size}`} {item.color && `• Color: ${item.color}`}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">£{item.price}</p>
                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Order Summary */}
                    <div className="pt-3 border-t space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span>£{subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Shipping:</span>
                        <span>{shipping === 0 ? 'FREE' : `£${shipping.toFixed(2)}`}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>VAT (20%):</span>
                        <span>£{tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                        <span>Total:</span>
                        <span>£{total.toFixed(2)}</span>
                      </div>
                    </div>

                    <Link href="/checkout">
                      <Button className="w-full bg-green-600 hover:bg-green-700 mt-4">
                        Go to Main Checkout
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Device Detection Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Device Detection Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PaymentMethodDetector />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Express Checkout Demo */}
          <div className="space-y-6">
            {items.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Express Checkout Demo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    This component will automatically show the best payment methods for your device:
                  </p>
                  
                  <StripeExpressCheckout
                    items={items.map(item => ({
                      variantId: item.variantId,
                      quantity: item.quantity
                    }))}
                    shippingAddress={testShippingAddress}
                    totalAmount={total * 100} // Convert to pence
                    onSuccess={(result) => {
                      console.log('Express checkout success:', result)
                      alert('Express checkout successful! Check console for details.')
                    }}
                    onError={(error) => {
                      console.error('Express checkout error:', error)
                      alert(`Express checkout error: ${error}`)
                    }}
                  />
                  
                  <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded-lg">
                    <p className="font-medium mb-2">How it works:</p>
                    <ul className="space-y-1">
                      <li>• Automatically detects if Apple Pay is available (Safari/iOS/macOS)</li>
                      <li>• Shows Google Pay on compatible Chrome/Android devices</li>
                      <li>• Displays Link for saved payment methods</li>
                      <li>• Falls back to standard card input</li>
                      <li>• Blocks PayPal and Klarna as requested</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Testing Instructions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <h4 className="font-semibold mb-1">Apple Pay Testing:</h4>
                  <ul className="text-muted-foreground space-y-1 ml-4">
                    <li>• Best on Safari (macOS/iOS)</li>
                    <li>• Requires Touch ID/Face ID setup</li>
                    <li>• Chrome on macOS also works</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-1">Google Pay Testing:</h4>
                  <ul className="text-muted-foreground space-y-1 ml-4">
                    <li>• Chrome browser recommended</li>
                    <li>• Android devices work best</li>
                    <li>• Requires Google account setup</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-1">General:</h4>
                  <ul className="text-muted-foreground space-y-1 ml-4">
                    <li>• Desktop fallback: Standard card form</li>
                    <li>• Link: Appears for saved payment methods</li>
                    <li>• All methods redirect to secure Stripe Checkout</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Feature Overview */}
        <Card className="border-2 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">Express Checkout Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Smart Detection</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✓ Automatically detects device capabilities</li>
                  <li>✓ Shows optimal payment methods first</li>
                  <li>✓ Adapts to user's browser and OS</li>
                  <li>✓ Graceful fallbacks for all scenarios</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Payment Methods</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>🍎 Apple Pay (Safari, iOS, macOS)</li>
                  <li>📱 Google Pay (Chrome, Android)</li>
                  <li>🔗 Link (Stripe's instant checkout)</li>
                  <li>💳 All major cards as fallback</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}