"use client"

import * as React from "react"
import { X, Minus, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore, type CartItem } from "@/store/cart-ultra-minimal"

// Simple cart item component
function CartItemComponent({ item }: { item: CartItem }) {
  const handleUpdateQuantity = (quantity: number) => {
    useCartStore.getState().updateQuantity(item.id, quantity)
  }
  
  const handleRemoveItem = () => {
    useCartStore.getState().removeItem(item.id)
  }

  return (
    <div className="flex items-center gap-3 p-3 border rounded">
      <div className="w-16 h-16 bg-gray-100 border rounded flex items-center justify-center">
        <span className="text-xs font-bold">IMG</span>
      </div>
      <div className="flex-1">
        <h4 className="font-medium">{item.name}</h4>
        <p className="text-sm text-gray-500">
          {item.size && `Size: ${item.size}`} {item.color && `| Color: ${item.color}`}
        </p>
        <p className="text-sm font-medium">£{item.price.toFixed(2)}</p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => handleUpdateQuantity(item.quantity - 1)}
          disabled={item.quantity <= 1}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className="w-8 text-center font-medium">{item.quantity}</span>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => handleUpdateQuantity(item.quantity + 1)}
          disabled={item.quantity >= item.maxQuantity}
        >
          <Plus className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-red-500 hover:text-red-700"
          onClick={handleRemoveItem}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}

export function CartDrawerSafe() {
  // Use direct Zustand selectors
  const isOpen = useCartStore(state => state.isOpen)
  const items = useCartStore(state => state.items)
  const totalPrice = useCartStore(state => state.totalPrice)
  
  const handleCloseCart = () => {
    useCartStore.getState().closeCart()
  }

  // Simple escape key handler without dependencies
  React.useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        useCartStore.getState().closeCart()
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen]) // Only depend on isOpen, not closeCart function

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={handleCloseCart} // Direct function call, no useCallback
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-96 bg-white border-l shadow-lg z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Shopping Cart</h2>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleCloseCart} // Direct function call
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {items.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <CartItemComponent key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-4 space-y-4">
            <div className="flex justify-between text-lg font-semibold">
              <span>Total:</span>
              <span>£{totalPrice.toFixed(2)}</span>
            </div>
            <Button 
              className="w-full"
              onClick={() => {
                // Basic checkout - redirect to checkout page
                window.location.href = '/checkout'
              }}
            >
              Checkout
            </Button>
          </div>
        )}
      </div>
    </>
  )
}