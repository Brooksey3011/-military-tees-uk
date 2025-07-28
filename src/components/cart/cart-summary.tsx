"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductImage } from "@/components/ui/product-image"
import { useCart } from "@/hooks/use-cart"
import { formatPrice } from "@/lib/utils"

interface CartSummaryProps {
  showItems?: boolean
  className?: string
}

export function CartSummary({ showItems = true, className }: CartSummaryProps) {
  const { items, totalItems, totalPrice } = useCart()

  const subtotal = totalPrice
  const shippingThreshold = 50
  const shipping = totalPrice >= shippingThreshold ? 0 : 4.99
  const tax = totalPrice * 0.2 // 20% VAT
  const finalTotal = subtotal + shipping + tax

  if (items.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <div className="text-4xl mb-2">🛒</div>
          <p className="text-muted-foreground">Your cart is empty</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">
          Order Summary
          <Badge variant="secondary" className="ml-2">
            {totalItems} {totalItems === 1 ? 'item' : 'items'}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Items List */}
        {showItems && (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 py-2 border-b last:border-b-0">
                {/* Product Image */}
                <ProductImage
                  src={item.variant.image_urls?.[0] || item.product.main_image_url}
                  alt={item.product.name}
                  className="h-12 w-12 flex-shrink-0 overflow-hidden rounded border"
                  fill
                  sizes="48px"
                />

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium truncate">
                    {item.product.name}
                  </h4>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {item.variant.size && (
                      <Badge variant="outline" className="text-xs h-4">
                        {item.variant.size}
                      </Badge>
                    )}
                    {item.variant.color && (
                      <div className="flex items-center gap-1">
                        <div
                          className="h-2 w-2 rounded-full border"
                          style={{ backgroundColor: item.variant.color.toLowerCase() }}
                        />
                        <span>{item.variant.color}</span>
                      </div>
                    )}
                    <span>× {item.quantity}</span>
                  </div>
                </div>

                {/* Price */}
                <div className="text-sm font-medium">
                  {formatPrice(item.product.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        <div className="space-y-2 pt-4 border-t">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-1">
              Shipping
              {shipping === 0 && (
                <Badge variant="success" className="text-xs">
                  FREE
                </Badge>
              )}
            </span>
            <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span>VAT (20%)</span>
            <span>{formatPrice(tax)}</span>
          </div>

          <div className="flex justify-between text-base font-semibold pt-2 border-t">
            <span>Total</span>
            <span>{formatPrice(finalTotal)}</span>
          </div>
        </div>

        {/* Shipping Threshold Message */}
        {totalPrice < shippingThreshold && (
          <div className="bg-muted p-3 rounded-lg text-sm">
            <p className="font-medium text-foreground">
              Add {formatPrice(shippingThreshold - totalPrice)} more for free UK delivery!
            </p>
            <div className="mt-2 w-full bg-background rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(totalPrice / shippingThreshold) * 100}%` }}
              />
            </div>
          </div>
        )}

        {totalPrice >= shippingThreshold && (
          <div className="bg-success/10 p-3 rounded-lg text-sm">
            <div className="flex items-center gap-2 text-success-foreground">
              <div className="h-2 w-2 bg-success rounded-full" />
              <span className="font-medium">You qualify for free UK delivery!</span>
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
          <div>• Prices include VAT</div>
          <div>• Free returns within 30 days</div>
          <div>• Secure payment with SSL encryption</div>
        </div>
      </CardContent>
    </Card>
  )
}