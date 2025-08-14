"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Truck, Shield, CreditCard } from "lucide-react"
import { useSimpleCart } from "@/hooks/use-simple-cart"
import { StripeExpressCheckout } from "@/components/checkout/stripe-express-element"
import Image from "next/image"

interface OrderSummaryProps {
  showItems?: boolean
  compact?: boolean
  showExpressCheckout?: boolean
  shippingAddress?: any
  customerData?: any
}

export function OrderSummary({ 
  showItems = true, 
  compact = false, 
  showExpressCheckout = false,
  shippingAddress,
  customerData 
}: OrderSummaryProps) {
  const { items, totalItems, totalPrice } = useSimpleCart()
  
  const shippingCost = totalPrice > 50 ? 0 : 4.99
  const tax = totalPrice * 0.2 // 20% VAT
  const finalTotal = totalPrice + shippingCost + tax

  if (compact) {
    return (
      <Card className="border border-border/50">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Subtotal ({totalItems} items)</span>
              <span>£{totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Shipping</span>
              <span className={shippingCost === 0 ? 'text-green-600 font-medium' : ''}>
                {shippingCost === 0 ? 'FREE' : `£${shippingCost.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>VAT (20%)</span>
              <span>£{tax.toFixed(2)}</span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>£{finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border border-border/50 sticky top-6">
      <CardHeader>
        <CardTitle className="font-display font-bold tracking-wide uppercase flex items-center justify-between">
          Order Summary
          <Badge variant="secondary">{totalItems} items</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Order Items */}
        {showItems && items.length > 0 && (
          <div className="space-y-3 border-b pb-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="w-12 h-12 bg-muted border border-border/50 rounded-md overflow-hidden flex-shrink-0">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                      IMG
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  {(item.size || item.color) && (
                    <p className="text-xs text-muted-foreground">
                      {item.size && `${item.size}`} 
                      {item.size && item.color && ' • '} 
                      {item.color && `${item.color}`}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">£{item.price.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Order Totals */}
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>Subtotal ({totalItems} items)</span>
            <span>£{totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span className={shippingCost === 0 ? 'text-green-600 font-medium' : ''}>
              {shippingCost === 0 ? 'FREE' : `£${shippingCost.toFixed(2)}`}
            </span>
          </div>
          <div className="flex justify-between">
            <span>VAT (20%)</span>
            <span>£{tax.toFixed(2)}</span>
          </div>
          
          <div className="border-t pt-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>£{finalTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        {/* Free Shipping Notice */}
        {shippingCost === 0 && (
          <div className="bg-green-50 border border-green-200 p-3 rounded-md">
            <div className="flex items-center gap-2 text-green-800 text-sm">
              <Truck className="h-4 w-4" />
              <span className="font-medium">Free shipping included!</span>
            </div>
          </div>
        )}

        {/* Express Checkout */}
        {showExpressCheckout && items.length > 0 && (
          <div className="border-t pt-4">
            <StripeExpressCheckout
              items={items.map(item => ({
                variantId: item.variantId,
                quantity: item.quantity
              }))}
              totalAmount={finalTotal}
              shippingAddress={shippingAddress ? {
                firstName: shippingAddress.firstName,
                lastName: shippingAddress.lastName,
                email: customerData?.email || 'customer@example.com',
                phone: customerData?.phone || '',
                address1: shippingAddress.address1,
                address2: shippingAddress.address2,
                city: shippingAddress.city,
                postcode: shippingAddress.postcode,
                country: shippingAddress.country
              } : undefined}
              onSuccess={(result) => {
                console.log('Express checkout success:', result)
                // Handle successful express checkout
              }}
              onError={(error) => {
                console.error('Express checkout error:', error)
                // Handle express checkout error
              }}
            />
          </div>
        )}

        {/* Security Info */}
        <div className="border-t pt-4">
          <div className="text-xs text-muted-foreground space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="h-3 w-3" />
              <span>256-bit SSL Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-3 w-3" />
              <span>PCI Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="h-3 w-3" />
              <span>Free UK Shipping Over £50</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}