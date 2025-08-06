"use client"

import React, { useEffect } from 'react'
import { SmartPaymentCheckout } from '@/components/checkout/smart-payment-checkout'
import { useSimpleCart } from '@/hooks/use-simple-cart'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
    email: 'test@example.com',
    phone: '01234567890',
    address1: '123 Test Street',
    address2: '',
    city: 'London',
    postcode: 'SW1A 1AA',
    country: 'GB'
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Express Checkout Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={addTestProduct}>
                Add Test Product to Cart
              </Button>
              <Button onClick={clearCart} variant="outline">
                Clear Cart
              </Button>
            </div>
            <p>Cart items: {items.length}</p>
            {items.length > 0 && (
              <div className="text-sm">
                {items.map(item => (
                  <div key={item.id}>
                    {item.name} - £{item.price} x {item.quantity}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {items.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Smart Payment Checkout Component</CardTitle>
              <p className="text-sm text-muted-foreground">
                The system will automatically detect your device capabilities and show appropriate payment methods.
              </p>
            </CardHeader>
            <CardContent>
              <SmartPaymentCheckout
                items={items.map(item => ({
                  variantId: item.variantId || item.id,
                  quantity: item.quantity,
                  price: item.price
                }))}
                shippingAddress={testShippingAddress}
                customerNotes="Test order for Smart Payment Checkout verification"
                onPaymentSuccess={(result) => {
                  console.log('Payment success:', result)
                  alert('Payment successful! Check console for details.')
                }}
                onPaymentError={(error) => {
                  console.error('Payment error:', error)
                  // Don't show alert for initialization errors, just log them
                  if (!error.includes('initialization')) {
                    alert(`Payment error: ${error}`)
                  }
                }}
              />
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Testing Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Device Detection:</strong> The component automatically detects your device and browser capabilities</p>
            <p><strong>Apple Pay:</strong> Available on Safari (iOS/macOS) and Chrome (macOS only)</p>
            <p><strong>Google Pay:</strong> Available on Chrome, Edge, and Android browsers</p>
            <p><strong>Card Payments:</strong> Universal fallback always available</p>
            <p><strong>Payment Restrictions:</strong> Klarna, Link, and other unwanted methods are blocked</p>
            <p className="text-muted-foreground">
              The system will show personalized recommendations based on your current setup.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}