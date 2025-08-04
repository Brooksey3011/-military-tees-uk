"use client"

import * as React from "react"
import { ShoppingCart, Check } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useCart } from "@/hooks/use-cart"
import { cn } from "@/lib/utils"

interface AddToCartButtonProps {
  productId: string
  variantId: string
  name: string
  price: number
  image: string
  size?: string
  color?: string
  maxQuantity: number
  quantity?: number
  buttonSize?: "sm" | "default" | "lg"
  className?: string
  disabled?: boolean
  showIcon?: boolean
  onSuccess?: () => void
}

export function AddToCartButton({
  productId,
  variantId,
  name,
  price,
  image,
  size,
  color,
  maxQuantity,
  quantity = 1,
  buttonSize = "default",
  className,
  disabled,
  showIcon = true,
  onSuccess
}: AddToCartButtonProps) {
  const [isAdding, setIsAdding] = React.useState(false)
  const [isAdded, setIsAdded] = React.useState(false)
  const { addItem } = useCart()

  const isOutOfStock = maxQuantity <= 0
  const isDisabled = disabled || isOutOfStock || isAdding

  const handleAddToCart = async () => {
    if (isDisabled) return

    setIsAdding(true)
    
    try {
      // Small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 300))
      
      addItem({
        productId,
        variantId,
        name,
        price,
        image,
        size,
        color,
        maxQuantity
      })
      
      // Show success state
      setIsAdded(true)
      onSuccess?.()
      
      // Reset success state after 1.5 seconds
      setTimeout(() => setIsAdded(false), 1500)
      
    } catch (error) {
      console.error("Failed to add item to cart:", error)
    } finally {
      // Reset adding state immediately
      setIsAdding(false)
    }
  }

  const getButtonText = () => {
    if (isAdding) return "Adding..."
    if (isAdded) return "Added!"
    if (isOutOfStock) return "Out of Stock"
    return "Add to Cart"
  }

  const getButtonIcon = () => {
    if (isAdding) return <LoadingSpinner size="sm" />
    if (isAdded) return <Check className="h-4 w-4" />
    return <ShoppingCart className="h-4 w-4" />
  }

  return (
    <Button
      variant={isOutOfStock ? "secondary" : isAdded ? "default" : "military"}
      size={buttonSize}
      disabled={isDisabled}
      onClick={handleAddToCart}
      className={cn(
        "relative overflow-hidden transition-all duration-200",
        isAdded && "bg-green-600 hover:bg-green-700 text-white border-green-600",
        className
      )}
    >
      {/* Background animation for success state */}
      {isAdded && (
        <motion.div
          className="absolute inset-0 bg-green-500"
          initial={{ scale: 0, borderRadius: "100%" }}
          animate={{ scale: 2, borderRadius: "0%" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      )}
      
      <div className="relative flex items-center gap-2">
        {showIcon && getButtonIcon()}
        <span>{getButtonText()}</span>
      </div>
    </Button>
  )
}