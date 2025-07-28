"use client"

import * as React from "react"
import { ShoppingCart } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useCartTotal, useCartActions } from "@/store/cart-minimal"
import { cn } from "@/lib/utils"

interface CartIconProps {
  className?: string
  showBadge?: boolean
  variant?: "default" | "minimal"
}

export function CartIcon({ 
  className, 
  showBadge = true, 
  variant = "default" 
}: CartIconProps) {
  const { totalItems } = useCartTotal()
  const { toggleCart } = useCartActions()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleCart}
      className={cn("relative", className)}
    >
      <ShoppingCart className="h-4 w-4" />
      
      {showBadge && totalItems > 0 && (
        <AnimatePresence>
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className={cn(
              "absolute -top-1 -right-1 flex items-center justify-center rounded-full text-xs font-medium min-w-[18px] h-[18px] px-1",
              variant === "default" 
                ? "bg-primary text-primary-foreground" 
                : "bg-destructive text-destructive-foreground"
            )}
          >
            {totalItems > 99 ? "99+" : totalItems}
          </motion.div>
        </AnimatePresence>
      )}
      
      <span className="sr-only">
        Shopping cart {totalItems > 0 && `with ${totalItems} items`}
      </span>
    </Button>
  )
}