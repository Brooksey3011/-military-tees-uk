"use client"

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SizeGuideButton } from './size-guide'
import { cn } from '@/lib/utils'

export interface ProductVariant {
  id: string
  size?: string
  color?: string
  sku: string
  stock_quantity: number
  image_urls?: string[]
  price_modifier?: number // Additional cost for this variant
}

interface VariantSelectorProps {
  variants: ProductVariant[]
  selectedVariant: ProductVariant | null
  onVariantChange: (variant: ProductVariant) => void
  className?: string
}

// Color mapping for the 8 standard colors
const getColorHex = (color: string): string => {
  const colorMap: { [key: string]: string } = {
    'black': '#000000',
    'olive green': '#4B5320',
    'white': '#FFFFFF',
    'navy': '#1E3A8A',
    'maroon': '#800000',
    'brown': '#8B4513',
    'sand': '#C2B280',
    'green': '#16A34A'
  }
  return colorMap[color.toLowerCase()] || '#6b7280'
}

export function VariantSelector({
  variants,
  selectedVariant,
  onVariantChange,
  className
}: VariantSelectorProps) {
  // Define full size range and available colors
  const fullSizeRange = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"]
  const availableSizes = [...new Set(variants.map(v => v.size).filter(Boolean))]
  // Always show full size range
  const sizes = fullSizeRange
  
  const fullColorRange = ["black", "olive green", "white", "navy", "maroon", "brown", "sand", "green"]
  const availableColors = [...new Set(variants.map(v => v.color).filter(Boolean))]
  // Always show full color range
  const colors = fullColorRange
  const hasVariants = sizes.length > 0 || colors.length > 0

  const [selectedSize, setSelectedSize] = useState<string | null>(
    selectedVariant?.size || null
  )
  const [selectedColor, setSelectedColor] = useState<string | null>(
    selectedVariant?.color || null
  )

  // Find variant based on current selections
  const findVariant = (size?: string | null, color?: string | null) => {
    return variants.find(variant => 
      variant.size === size && 
      variant.color === color
    ) || variants.find(variant => 
      variant.size === size || variant.color === color
    ) || variants[0]
  }

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size)
    const variant = findVariant(size, selectedColor)
    if (variant) {
      onVariantChange(variant)
    }
  }

  const handleColorSelect = (color: string) => {
    setSelectedColor(color)
    const variant = findVariant(selectedSize, color)
    if (variant) {
      onVariantChange(variant)
    }
  }

  const getVariantStock = (size?: string, color?: string) => {
    const variant = variants.find(v => v.size === size && v.color === color)
    return variant?.stock_quantity || 0
  }

  const isVariantAvailable = (size?: string, color?: string) => {
    return getVariantStock(size, color) > 0
  }

  if (!hasVariants) {
    return null
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Size Selection */}
      {sizes.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">
              Size
              {selectedSize && (
                <span className="ml-2 text-muted-foreground">
                  ({selectedSize})
                </span>
              )}
            </h3>
            <SizeGuideButton />
          </div>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const isSelected = selectedSize === size
              const stock = selectedColor 
                ? getVariantStock(size, selectedColor)
                : Math.max(...variants.filter(v => v.size === size).map(v => v.stock_quantity))
              const isAvailable = stock > 0
              
              return (
                <Button
                  key={size}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSizeSelect(size)}
                  disabled={!isAvailable}
                  className={cn(
                    "min-w-[60px] rounded-none border-2",
                    isSelected && "border-primary bg-primary text-primary-foreground",
                    !isAvailable && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {size}
                  {!isAvailable && (
                    <span className="ml-1 text-xs">(Out)</span>
                  )}
                </Button>
              )
            })}
          </div>
        </div>
      )}

      {/* Color Selection */}
      {colors.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-foreground">
            Color
            {selectedColor && (
              <span className="ml-2 text-muted-foreground">
                ({selectedColor})
              </span>
            )}
          </h3>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => {
              const isSelected = selectedColor === color
              const stock = selectedSize 
                ? getVariantStock(selectedSize, color)
                : Math.max(...variants.filter(v => v.color === color).map(v => v.stock_quantity))
              const isAvailable = stock > 0
              
              return (
                <Button
                  key={color}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleColorSelect(color)}
                  disabled={!isAvailable}
                  className={cn(
                    "min-w-[80px] rounded-none border-2 capitalize",
                    isSelected && "border-primary bg-primary text-primary-foreground",
                    !isAvailable && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "w-3 h-3 rounded-full border border-border",
                        color.toLowerCase() === 'white' && "border-2 border-gray-400"
                      )}
                      style={{ 
                        backgroundColor: getColorHex(color.toLowerCase())
                      }}
                    />
                    <span className="capitalize">{color}</span>
                  </div>
                  {!isAvailable && (
                    <span className="ml-1 text-xs">(Out)</span>
                  )}
                </Button>
              )
            })}
          </div>
        </div>
      )}

      {/* Stock Information */}
      {selectedVariant && (
        <div className="text-sm text-muted-foreground">
          {selectedVariant.stock_quantity > 0 ? (
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              {selectedVariant.stock_quantity > 10 
                ? 'In Stock' 
                : `Only ${selectedVariant.stock_quantity} left`
              }
            </span>
          ) : (
            <span className="flex items-center gap-2 text-destructive">
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              Out of Stock
            </span>
          )}
        </div>
      )}

      {/* Price Modification */}
      {selectedVariant?.price_modifier && selectedVariant.price_modifier !== 0 && (
        <div className="text-sm">
          <Badge variant="secondary" className="rounded-none">
            {selectedVariant.price_modifier > 0 ? '+' : ''}
            £{Math.abs(selectedVariant.price_modifier).toFixed(2)} for this variant
          </Badge>
        </div>
      )}
    </div>
  )
}