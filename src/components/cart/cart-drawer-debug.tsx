"use client"

import * as React from "react"
import Link from "next/link"
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ProductImage } from "@/components/ui/product-image"
import { useCart } from "@/hooks/use-cart"
import { cn, formatPrice } from "@/lib/utils"

interface CartDrawerDebugProps {
  className?: string
}

export function CartDrawerDebug({ className }: CartDrawerDebugProps) {
  const { 
    items, 
    totalItems, 
    totalPrice, 
    isOpen, 
    closeCart, 
    updateQuantity, 
    removeItem,
    clearCart
  } = useCart()

  // Debug handlers
  const handleBackdropClick = () => {
    console.log("Backdrop clicked")
    closeCart()
  }

  const handleXClick = () => {
    console.log("X button clicked")
    closeCart()
  }

  // Handle escape key
  React.useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        console.log("Escape pressed")
        closeCart()
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen, closeCart])

  if (!isOpen) return null

  return (
    <div 
      className={cn("fixed inset-0 z-50 flex", className)}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 cursor-pointer"
        onClick={handleBackdropClick}
      />

      {/* Drawer */}
      <div
        className="ml-auto h-full w-full max-w-md bg-background border-l shadow-xl flex flex-col relative z-10"
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
            onClick={handleXClick}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close cart</span>
          </Button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
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
            <div className="p-4 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 p-3 border rounded-lg">
                  {/* Product Image */}
                  <ProductImage
                    src={item.variant.image_urls?.[0] || item.product.main_image_url}
                    alt={item.product.name}
                    className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border"
                    fill
                    sizes="64px"
                  />

                  {/* Product Details */}
                  <div className="flex-1 space-y-1">
                    <Link 
                      href={`/products/${item.product.slug}`}
                      className="text-sm font-medium hover:text-primary transition-colors line-clamp-2"
                      onClick={closeCart}
                    >
                      {item.product.name}
                    </Link>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {item.variant.size && (
                        <Badge variant="outline" className="text-xs h-5">
                          {item.variant.size}
                        </Badge>
                      )}
                      {item.variant.color && (
                        <div className="flex items-center gap-1">
                          <div
                            className="h-3 w-3 rounded-full border border-border"
                            style={{ backgroundColor: item.variant.color.toLowerCase() }}
                          />
                          <span>{item.variant.color}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">
                        {formatPrice(item.product.price)}
                      </div>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-6 w-6"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-6 w-6"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>

                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 text-destructive hover:text-destructive ml-2"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className="text-right text-sm font-semibold">
                      {formatPrice(item.product.price * item.quantity)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-4 space-y-4">
            {/* Total */}
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>

            {/* Actions */}
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