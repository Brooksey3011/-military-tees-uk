"use client"

import * as React from "react"
import Link from "next/link"
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ProductImage } from "@/components/ui/product-image"
import { useSimpleCart } from "@/hooks/use-simple-cart"
import { CheckoutButton } from "./checkout-button"
import { cn, formatPrice } from "@/lib/utils"

interface CartDrawerProps {
  className?: string
}

export function CartDrawer({ className }: CartDrawerProps) {
  const { 
    items, 
    totalItems, 
    totalPrice, 
    isOpen, 
    closeCart, 
    updateQuantity, 
    removeItem, 
    clearCart 
  } = useSimpleCart()


  // Handle backdrop click
  const handleBackdropClick = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    closeCart()
  }, [closeCart])

  // Touch/swipe handling for mobile
  const [touchStart, setTouchStart] = React.useState<number | null>(null)
  const [touchEnd, setTouchEnd] = React.useState<number | null>(null)

  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isRightSwipe = distance < -minSwipeDistance

    if (isRightSwipe) {
      closeCart()
    }
  }

  // Handle escape key
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

  // Handle body scroll separately to avoid conflicts
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  const handleQuantityUpdate = React.useCallback((itemId: string, newQuantity: number) => {
    updateQuantity(itemId, newQuantity)
  }, [updateQuantity])

  const handleRemoveItem = React.useCallback((itemId: string) => {
    removeItem(itemId)
  }, [removeItem])

  const shippingThreshold = 50
  const shippingProgress = Math.min((totalPrice / shippingThreshold) * 100, 100)
  const remainingForFreeShipping = Math.max(shippingThreshold - totalPrice, 0)

  return (
    <>
      {isOpen && (
        <div className={cn("fixed inset-0 z-50 flex", className)}>
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 cursor-pointer animate-fade-in"
            onClick={handleBackdropClick}
          />

          {/* Drawer */}
          <div
            className="ml-auto h-full w-full max-w-md bg-background border-l shadow-xl flex flex-col relative z-10 animate-slide-in-right"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b">
              {/* Mobile-friendly swipe indicator */}
              <div className="hidden sm:flex items-center gap-2">
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

              {/* Mobile header - more compact */}
              <div className="flex sm:hidden items-center gap-2 flex-1">
                <ShoppingBag className="h-4 w-4" />
                <h2 className="text-base font-semibold">
                  Cart
                </h2>
                {totalItems > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {totalItems}
                  </Badge>
                )}
                <div className="ml-auto text-xs text-muted-foreground">
                  Swipe right to close
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  closeCart()
                }}
                className="h-10 w-10 sm:h-8 sm:w-8 flex-shrink-0"
              >
                <X className="h-5 w-5 sm:h-4 sm:w-4" />
                <span className="sr-only">Close cart</span>
              </Button>
            </div>

            {/* Free Shipping Progress */}
            {totalPrice > 0 && totalPrice < shippingThreshold && (
              <div className="p-4 bg-muted/50 border-b">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Free UK delivery</span>
                    <span className="font-medium">
                      {formatPrice(remainingForFreeShipping)} to go
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${shippingProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {totalPrice >= shippingThreshold && (
              <div className="p-4 bg-success/10 border-b">
                <div className="flex items-center gap-2 text-sm text-success-foreground">
                  <div className="h-2 w-2 bg-success rounded-full" />
                  <span>You qualify for free UK delivery!</span>
                </div>
              </div>
            )}

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <EmptyCart onClose={closeCart} />
              ) : (
                <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-3 p-3 sm:p-3 border rounded-lg animate-fade-in"
                      >
                        {/* Product Image - Larger on mobile for better touch */}
                        <ProductImage
                          src={item.image}
                          alt={item.name}
                          className="h-20 w-20 sm:h-16 sm:w-16 flex-shrink-0 overflow-hidden rounded-md border"
                          fill
                          sizes="(max-width: 640px) 80px, 64px"
                        />

                        {/* Product Details */}
                        <div className="flex-1 space-y-2 sm:space-y-1">
                          <Link
                            href={`/products/${item.productId}`}
                            className="text-sm sm:text-sm font-medium hover:text-primary transition-colors line-clamp-2 leading-tight"
                            onClick={closeCart}
                          >
                            {item.name}
                          </Link>

                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            {item.size && (
                              <Badge variant="outline" className="text-xs h-5">
                                {item.size}
                              </Badge>
                            )}
                            {item.color && (
                              <div className="flex items-center gap-1">
                                <div
                                  className="h-3 w-3 rounded-full border border-border"
                                  style={{ backgroundColor: item.color.toLowerCase() }}
                                />
                                <span>{item.color}</span>
                              </div>
                            )}
                          </div>

                          {/* Mobile layout - Stack price and controls */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-medium">
                                {formatPrice(item.price)}
                              </div>

                              {/* Mobile: Remove button separate for better touch */}
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 sm:h-6 sm:w-6 text-destructive hover:text-destructive"
                                onClick={() => handleRemoveItem(item.id)}
                              >
                                <Trash2 className="h-4 w-4 sm:h-3 sm:w-3" />
                              </Button>
                            </div>

                            {/* Quantity Controls - Larger touch targets on mobile */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-8 w-8 sm:h-6 sm:w-6"
                                  onClick={() => handleQuantityUpdate(item.id, item.quantity - 1)}
                                >
                                  <Minus className="h-4 w-4 sm:h-3 sm:w-3" />
                                </Button>

                                <span className="w-10 sm:w-8 text-center text-sm font-medium">
                                  {item.quantity}
                                </span>

                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-8 w-8 sm:h-6 sm:w-6"
                                  onClick={() => handleQuantityUpdate(item.id, item.quantity + 1)}
                                  disabled={item.quantity >= item.maxQuantity}
                                >
                                  <Plus className="h-4 w-4 sm:h-3 sm:w-3" />
                                </Button>
                              </div>

                              {/* Item Total */}
                              <div className="text-sm font-semibold">
                                {formatPrice(item.price * item.quantity)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                  {/* Clear Cart */}
                  {items.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearCart}
                      className="w-full text-destructive hover:text-destructive"
                    >
                      Clear Cart
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Footer - Mobile optimized */}
            {items.length > 0 && (
              <div className="border-t p-4 sm:p-4 space-y-4 bg-background">
                {/* Total */}
                <div className="flex justify-between text-lg sm:text-lg font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>

                {/* Shipping Info */}
                <p className="text-xs text-muted-foreground text-center sm:text-left">
                  {totalPrice >= shippingThreshold
                    ? "✅ Free UK delivery included"
                    : "🚚 Shipping calculated at checkout"
                  }
                </p>

                {/* Actions - Mobile optimized */}
                <div className="space-y-3">
                  <CheckoutButton
                    size="lg"
                    fullWidth
                    className="h-12 sm:h-10 text-base sm:text-sm font-semibold"
                  />

                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full h-10 sm:h-10 text-sm"
                    onClick={closeCart}
                  >
                    Continue Shopping
                  </Button>
                </div>

                {/* Security Badge - Mobile friendly */}
                <div className="text-center text-xs text-muted-foreground pt-2 border-t border-dashed">
                  <div className="flex items-center justify-center gap-2">
                    <span>🔒</span>
                    <span>Secure checkout with SSL encryption</span>
                  </div>
                </div>

                {/* Mobile hint */}
                <div className="sm:hidden text-center text-xs text-muted-foreground/70">
                  Swipe right or tap backdrop to close
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

function EmptyCart({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 sm:p-8 text-center">
      <div className="text-5xl sm:text-6xl mb-4">🛒</div>
      <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
        Your cart is empty
      </h3>
      <p className="text-sm sm:text-base text-muted-foreground mb-6">
        Add some military gear to get started!
      </p>
      <Button
        variant="military"
        size="lg"
        className="h-12 sm:h-10 px-8 text-base sm:text-sm font-semibold"
        onClick={onClose}
      >
        Start Shopping
      </Button>
    </div>
  )
}