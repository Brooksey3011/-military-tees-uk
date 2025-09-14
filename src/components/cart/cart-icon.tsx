"use client"

import * as React from "react"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSimpleCart } from "@/hooks/use-simple-cart"
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
  const [isClient, setIsClient] = React.useState(false)
  const { totalItems, toggleCart } = useSimpleCart()

  // Prevent hydration issues
  React.useEffect(() => {
    setIsClient(true)
  }, [])

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleCart}
      className={cn("relative min-h-[48px] min-w-[48px] touch-manipulation", className)}
      aria-label={`Shopping cart${isClient && totalItems > 0 ? ` with ${totalItems} items` : ''}`}
    >
      <ShoppingCart className="h-5 w-5 sm:h-4 sm:w-4" />

      {showBadge && isClient && totalItems > 0 && (
          <div
            className={cn(
              "absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 flex items-center justify-center rounded-full text-xs font-bold min-w-[20px] h-[20px] sm:min-w-[18px] sm:h-[18px] px-1 animate-fade-in",
              variant === "default"
                ? "bg-primary text-primary-foreground"
                : "bg-destructive text-destructive-foreground"
            )}
          >
            {totalItems > 99 ? "99+" : totalItems}
          </div>
      )}

      <span className="sr-only">
        Shopping cart {isClient && totalItems > 0 && `with ${totalItems} items`}
      </span>
    </Button>
  )
}