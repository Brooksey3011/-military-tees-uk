"use client"

import React from 'react'
import { useSimpleCart } from '@/hooks/use-simple-cart'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Checkout Test</CardTitle>
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
              <div className="text-sm space-y-2">
                {items.map(item => (
                  <div key={item.id} className="p-2 border rounded">
                    {item.name} - £{item.price} x {item.quantity}
                  </div>
                ))}
                <Link href="/checkout">
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Go to Checkout
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Simplified Checkout</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Single Checkout:</strong> One streamlined checkout experience</p>
            <p><strong>ThruDark-Style:</strong> Simple, effective, conversion-focused design</p>
            <p><strong>Stripe Integration:</strong> Secure payment processing with all methods</p>
            <p><strong>Mobile Optimized:</strong> Works perfectly on all devices</p>
            <p className="text-muted-foreground">
              Clean, simple checkout that just works.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}