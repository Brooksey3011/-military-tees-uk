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
      className={cn("relative", className)}
    >
      <ShoppingCart className="h-4 w-4" />
      
      {showBadge && isClient && totalItems > 0 && (
          <div
            className={cn(
              "absolute -top-1 -right-1 flex items-center justify-center rounded-full text-xs font-medium min-w-[18px] h-[18px] px-1 animate-fade-in",
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