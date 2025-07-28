"use client"

import * as React from "react"
import Link from "next/link"
import { X, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/hooks/use-cart"
import { cn, formatPrice } from "@/lib/utils"

interface SimpleCartDrawerProps {
  className?: string
}

export function SimpleCartDrawer({ className }: SimpleCartDrawerProps) {
  const { 
    items, 
    totalItems, 
    totalPrice, 
    isOpen, 
    closeCart 
  } = useCart()

  // Handle backdrop click
  const handleBackdropClick = React.useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeCart()
    }
  }, [closeCart])

  // Handle escape key - simplified version
  React.useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeCart()
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => {
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen, closeCart])

  if (!isOpen) return null

  return (
    <div 
      className={cn("fixed inset-0 z-50 flex", className)}
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Drawer */}
      <div
        className="ml-auto h-full w-full max-w-md bg-background border-l shadow-xl flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            <h2 className="text-lg font-semibold">
              Shopping Cart
            </h2>
            {totalItems > 0 && (
              <Badge variant="secondary">
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={closeCart}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close cart</span>
          </Button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-6xl mb-4">🛒</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Your cart is empty
              </h3>
              <p className="text-muted-foreground mb-6">
                Add some military gear to get started!
              </p>
              <Button 
                variant="military" 
                onClick={closeCart}
              >
                Start Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 p-3 border rounded-lg">
                  <div className="h-16 w-16 flex-shrink-0 bg-muted rounded-md flex items-center justify-center">
                    <div className="text-2xl">👕</div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{item.product.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {item.variant.size} - {item.variant.color}
                    </p>
                    <p className="text-sm font-medium">
                      Qty: {item.quantity} × {formatPrice(item.product.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-4 space-y-4">
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            <div className="space-y-2">
              <Button 
                variant="military" 
                size="lg" 
                className="w-full"
                onClick={closeCart}
              >
                Checkout - {formatPrice(totalPrice)}
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full"
                onClick={closeCart}
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}