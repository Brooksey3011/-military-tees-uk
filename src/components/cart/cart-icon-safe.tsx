"use client"

import * as React from "react"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/cart-ultra-minimal"

export function CartIconSafe() {
  // Use direct selectors
  const totalItems = useCartStore(state => state.totalItems)
  
  const handleToggleCart = () => {
    useCartStore.getState().toggleCart()
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggleCart}
      className="relative"
    >
      <ShoppingCart className="h-4 w-4" />
      
      {totalItems > 0 && (
        <div className="absolute -top-1 -right-1 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium min-w-[18px] h-[18px] px-1">
          {totalItems > 99 ? "99+" : totalItems}
        </div>
      )}
      
      <span className="sr-only">
        Shopping cart {totalItems > 0 && `with ${totalItems} items`}
      </span>
    </Button>
  )
}