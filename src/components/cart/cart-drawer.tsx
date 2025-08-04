"use client"

import * as React from "react"
import Link from "next/link"
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ProductImage } from "@/components/ui/product-image"
import { useCart } from "@/hooks/use-cart"
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
  } = useCart()


  // Handle backdrop click - Improved version
  const handleBackdropClick = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    closeCart()
  }, []) // Remove closeCart dependency to prevent infinite loop

  // Handle escape key - Fixed version
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
  }, [isOpen]) // Remove closeCart dependency to prevent infinite loop

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
  }, []) // Remove updateQuantity dependency to prevent infinite loop

  const handleRemoveItem = React.useCallback((itemId: string) => {
    removeItem(itemId)
  }, [removeItem])

  const shippingThreshold = 50
  const shippingProgress = Math.min((totalPrice / shippingThreshold) * 100, 100)
  const remainingForFreeShipping = Math.max(shippingThreshold - totalPrice, 0)

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={cn("fixed inset-0 z-50 flex", className)}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 cursor-pointer"
            onClick={handleBackdropClick}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
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
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  closeCart()
                }}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
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
                    <motion.div
                      className="bg-primary h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${shippingProgress}%` }}
                      transition={{ duration: 0.5 }}
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
                <div className="p-4 space-y-4">
                  <AnimatePresence mode="popLayout">
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="flex gap-3 p-3 border rounded-lg"
                      >
                        {/* Product Image */}
                        <ProductImage
                          src={item.image}
                          alt={item.name}
                          className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border"
                          fill
                          sizes="64px"
                        />

                        {/* Product Details */}
                        <div className="flex-1 space-y-1">
                          <Link 
                            href={`/products/${item.productId}`}
                            className="text-sm font-medium hover:text-primary transition-colors line-clamp-2"
                            onClick={closeCart}
                          >
                            {item.name}
                          </Link>
                          
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
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

                          <div className="flex items-center justify-between">
                            <div className="text-sm font-medium">
                              {formatPrice(item.price)}
                            </div>
                            
                            {/* Quantity Controls */}
                            <div className="flex items-center gap-1">
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-6 w-6"
                                onClick={() => handleQuantityUpdate(item.id, item.quantity - 1)}
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
                                onClick={() => handleQuantityUpdate(item.id, item.quantity + 1)}
                                disabled={item.quantity >= item.maxQuantity}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>

                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 text-destructive hover:text-destructive ml-2"
                                onClick={() => handleRemoveItem(item.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          {/* Item Total */}
                          <div className="text-right text-sm font-semibold">
                            {formatPrice(item.price * item.quantity)}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

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

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t p-4 space-y-4">
                {/* Total */}
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>

                {/* Shipping Info */}
                <p className="text-xs text-muted-foreground">
                  {totalPrice >= shippingThreshold 
                    ? "Free UK delivery included"
                    : "Shipping calculated at checkout"
                  }
                </p>

                {/* Actions */}
                <div className="space-y-2">
                  <CheckoutButton
                    size="lg"
                    fullWidth
                  />
                  
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full"
                    onClick={closeCart}
                  >
                    Continue Shopping
                  </Button>
                </div>

                {/* Security Badge */}
                <div className="text-center text-xs text-muted-foreground">
                  🔒 Secure checkout with SSL encryption
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function EmptyCart({ onClose }: { onClose: () => void }) {
  return (
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
        onClick={onClose}
      >
        Start Shopping
      </Button>
    </div>
  )
}