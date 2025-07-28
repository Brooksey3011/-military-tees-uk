"use client"

import * as React from "react"
import Link from "next/link"
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCartStore, type CartItem } from "@/store/cart-ultra-minimal"
import { cn, formatPrice } from "@/lib/utils"

interface CartDrawerProps {
  className?: string
}

export function CartDrawerMilitary({ className }: CartDrawerProps) {
  const isOpen = useCartStore(state => state.isOpen)
  const items = useCartStore(state => state.items)
  const totalItems = useCartStore(state => state.totalItems)
  const totalPrice = useCartStore(state => state.totalPrice)

  const handleCloseCart = () => {
    useCartStore.getState().closeCart()
  }

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    useCartStore.getState().updateQuantity(itemId, quantity)
  }

  const handleRemoveItem = (itemId: string) => {
    useCartStore.getState().removeItem(itemId)
  }

  const handleClearCart = () => {
    useCartStore.getState().clearCart()
  }

  // Handle escape key
  React.useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCloseCart()
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen])

  // Handle body scroll
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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 z-40"
            onClick={handleCloseCart}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className={cn(
              "fixed right-0 top-0 h-full w-full max-w-md bg-background border-l-2 border-border shadow-2xl z-50 flex flex-col",
              className
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b-2 border-border bg-muted/20">
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-6 w-6 text-primary" />
                <div>
                  <h2 className="text-lg font-display font-bold tracking-wide uppercase">
                    Shopping Cart
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {totalItems} {totalItems === 1 ? 'item' : 'items'}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCloseCart}
                className="h-8 w-8 rounded-none border border-border hover:bg-muted"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close cart</span>
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <ShoppingBag className="h-16 w-16 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-display font-bold tracking-wide uppercase mb-2">
                    Your Cart is Empty
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Add some military gear to get started.
                  </p>
                  <Button
                    onClick={handleCloseCart}
                    className="rounded-none font-display font-bold tracking-wide uppercase"
                    asChild
                  >
                    <Link href="/categories">
                      Continue Shopping
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {items.map((item) => (
                    <CartItemMilitary
                      key={item.id}
                      item={item}
                      onUpdateQuantity={handleUpdateQuantity}
                      onRemove={handleRemoveItem}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t-2 border-border bg-muted/20 p-6 space-y-4">
                {/* Clear Cart Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearCart}
                  className="text-muted-foreground hover:text-destructive rounded-none border border-border"
                >
                  <Trash2 className="h-3 w-3 mr-2" />
                  Clear Cart
                </Button>

                {/* Total */}
                <div className="space-y-2">
                  <div className="flex justify-between text-base">
                    <span>Subtotal:</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Shipping:</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <div className="border-t border-border pt-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span className="font-display tracking-wide uppercase">Total:</span>
                      <span className="font-display">{formatPrice(totalPrice)}</span>
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                <Button
                  size="lg"
                  className="w-full rounded-none font-display font-bold tracking-wide uppercase h-12"
                  onClick={() => {
                    window.location.href = '/checkout-simple'
                  }}
                >
                  Secure Checkout
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Secure payment with military-grade encryption
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Military-styled cart item component
interface CartItemMilitaryProps {
  item: CartItem
  onUpdateQuantity: (itemId: string, quantity: number) => void
  onRemove: (itemId: string) => void
}

function CartItemMilitary({ item, onUpdateQuantity, onRemove }: CartItemMilitaryProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex gap-4 p-4 bg-background border-2 border-border rounded-none"
    >
      {/* Product Image */}
      <div className="w-16 h-16 bg-muted border border-border flex items-center justify-center rounded-none">
        <span className="text-xs font-bold text-muted-foreground">IMG</span>
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm leading-tight mb-1 truncate">
          {item.name}
        </h4>
        
        {(item.size || item.color) && (
          <p className="text-xs text-muted-foreground mb-2">
            {item.size && `Size: ${item.size}`}
            {item.size && item.color && " • "}
            {item.color && `Color: ${item.color}`}
          </p>
        )}

        <div className="flex items-center justify-between">
          <span className="font-bold text-sm">{formatPrice(item.price)}</span>
          
          {/* Quantity Controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6 rounded-none border border-border"
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
            >
              <Minus className="h-3 w-3" />
            </Button>
            
            <span className="w-8 text-center text-sm font-medium">
              {item.quantity}
            </span>
            
            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6 rounded-none border border-border"
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              disabled={item.quantity >= item.maxQuantity}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Remove Button */}
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 text-muted-foreground hover:text-destructive rounded-none"
        onClick={() => onRemove(item.id)}
      >
        <Trash2 className="h-3 w-3" />
        <span className="sr-only">Remove item</span>
      </Button>
    </motion.div>
  )
}