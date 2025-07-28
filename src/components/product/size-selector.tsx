"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface SizeOption {
  size: string
  label: string
  stock: number
  isAvailable: boolean
}

interface SizeSelectorProps {
  sizes: SizeOption[]
  selectedSize?: string
  onSizeChange?: (size: string) => void
  className?: string
  disabled?: boolean
}

export function SizeSelector({
  sizes,
  selectedSize,
  onSizeChange,
  className,
  disabled = false
}: SizeSelectorProps) {
  const [internalSelectedSize, setInternalSelectedSize] = React.useState(selectedSize || "")

  const handleSizeSelect = (size: string) => {
    if (disabled) return
    
    const sizeOption = sizes.find(s => s.size === size)
    if (!sizeOption?.isAvailable) return
    
    setInternalSelectedSize(size)
    onSizeChange?.(size)
  }

  const currentSize = selectedSize || internalSelectedSize

  return (
    <div className={cn("space-y-3", className)}>
      {/* Size Label */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-display font-bold tracking-wide uppercase text-foreground">
          Size
        </h3>
        {currentSize && (
          <Badge className="rounded-none bg-primary text-primary-foreground">
            {sizes.find(s => s.size === currentSize)?.label || currentSize}
          </Badge>
        )}
      </div>

      {/* Size Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {sizes.map((sizeOption) => {
          const isSelected = currentSize === sizeOption.size
          const isOutOfStock = !sizeOption.isAvailable || sizeOption.stock === 0
          const isLowStock = sizeOption.stock > 0 && sizeOption.stock <= 5

          return (
            <Button
              key={sizeOption.size}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              className={cn(
                "rounded-none border-2 font-display font-bold tracking-wide uppercase relative",
                "min-h-12 p-2 text-xs",
                isSelected && "bg-primary text-primary-foreground border-primary",
                !isSelected && "hover:border-primary/50",
                isOutOfStock && "opacity-50 cursor-not-allowed bg-muted text-muted-foreground",
                !isOutOfStock && !disabled && "hover:bg-primary/10"
              )}
              onClick={() => handleSizeSelect(sizeOption.size)}
              disabled={disabled || isOutOfStock}
            >
              <div className="flex flex-col items-center justify-center">
                <span className="text-xs font-bold">{sizeOption.size}</span>
                <span className="text-[10px] opacity-80 leading-none">
                  {sizeOption.label}
                </span>
              </div>

              {/* Stock Indicators */}
              {isOutOfStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-none border-2 border-muted">
                  <span className="text-[10px] font-bold text-muted-foreground">
                    OUT
                  </span>
                </div>
              )}
              
              {isLowStock && !isOutOfStock && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full border border-background"></div>
              )}
            </Button>
          )
        })}
      </div>

      {/* Size Guide Link */}
      <div className="flex items-center justify-between text-xs">
        <button 
          className="text-primary hover:text-primary/80 font-medium tracking-wide uppercase underline"
          onClick={() => {
            // This would open a size guide modal or page
            console.log("Open size guide")
          }}
        >
          Size Guide
        </button>
        
        {currentSize && (
          <div className="text-muted-foreground">
            {(() => {
              const selected = sizes.find(s => s.size === currentSize)
              if (!selected) return null
              
              if (selected.stock === 0) return "Out of Stock"
              if (selected.stock <= 5) return `Only ${selected.stock} left`
              if (selected.stock <= 10) return `${selected.stock} in stock`
              return "In Stock"
            })()}
          </div>
        )}
      </div>

      {/* Error Message */}
      {!currentSize && (
        <p className="text-xs text-muted-foreground">
          Please select a size to continue
        </p>
      )}
    </div>
  )
}