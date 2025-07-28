"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface ColorOption {
  color: string
  label: string
  hexCode?: string
  stock: number
  isAvailable: boolean
}

interface ColorSelectorProps {
  colors: ColorOption[]
  selectedColor?: string
  onColorChange?: (color: string) => void
  className?: string
  disabled?: boolean
  showLabels?: boolean
}

export function ColorSelector({
  colors,
  selectedColor,
  onColorChange,
  className,
  disabled = false,
  showLabels = true
}: ColorSelectorProps) {
  const [internalSelectedColor, setInternalSelectedColor] = React.useState(selectedColor || "")

  const handleColorSelect = (color: string) => {
    if (disabled) return
    
    const colorOption = colors.find(c => c.color === color)
    if (!colorOption?.isAvailable) return
    
    setInternalSelectedColor(color)
    onColorChange?.(color)
  }

  const currentColor = selectedColor || internalSelectedColor

  // Military color palette mapping
  const getColorDisplay = (colorOption: ColorOption) => {
    const colorMap: Record<string, string> = {
      'black': '#000000',
      'white': '#FFFFFF',
      'olive': '#708238',
      'khaki': '#C3B091',
      'navy': '#001F3F',
      'grey': '#808080',
      'charcoal': '#36454F',
      'tan': '#D2B48C',
      'forest': '#355E3B',
      'brown': '#8B4513'
    }

    return colorOption.hexCode || colorMap[colorOption.color.toLowerCase()] || '#808080'
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Color Label */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-display font-bold tracking-wide uppercase text-foreground">
          Color
        </h3>
        {currentColor && (
          <Badge className="rounded-none bg-primary text-primary-foreground">
            {colors.find(c => c.color === currentColor)?.label || currentColor}
          </Badge>
        )}
      </div>

      {/* Color Swatches */}
      <div className="flex flex-wrap gap-3">
        {colors.map((colorOption) => {
          const isSelected = currentColor === colorOption.color
          const isOutOfStock = !colorOption.isAvailable || colorOption.stock === 0
          const isLowStock = colorOption.stock > 0 && colorOption.stock <= 5
          const displayColor = getColorDisplay(colorOption)

          return (
            <div key={colorOption.color} className="flex flex-col items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "w-12 h-12 p-0 rounded-none border-2 relative overflow-hidden",
                  "hover:scale-105 transition-transform",
                  isSelected && "border-primary ring-2 ring-primary/20",
                  !isSelected && "border-border hover:border-primary/50",
                  isOutOfStock && "opacity-50 cursor-not-allowed",
                  !isOutOfStock && !disabled && "hover:border-primary"
                )}
                onClick={() => handleColorSelect(colorOption.color)}
                disabled={disabled || isOutOfStock}
                style={{
                  backgroundColor: displayColor
                }}
              >
                {/* Selected Checkmark */}
                {isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={cn(
                      "rounded-full p-1",
                      displayColor === '#FFFFFF' || displayColor === '#ffffff' 
                        ? "bg-black text-white" 
                        : "bg-white text-black"
                    )}>
                      <Check className="h-3 w-3" />
                    </div>
                  </div>
                )}

                {/* Out of Stock Overlay */}
                {isOutOfStock && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-none border-2 border-muted">
                    <span className="text-[8px] font-bold text-muted-foreground transform -rotate-45">
                      OUT
                    </span>
                  </div>
                )}

                {/* Low Stock Indicator */}
                {isLowStock && !isOutOfStock && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full border border-background"></div>
                )}

                {/* White color special border */}
                {displayColor === '#FFFFFF' || displayColor === '#ffffff' ? (
                  <div className="absolute inset-1 border border-border rounded-none"></div>
                ) : null}
              </Button>

              {/* Color Label */}
              {showLabels && (
                <span className="text-xs text-center font-medium text-foreground tracking-wide">
                  {colorOption.label}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Stock Information */}
      {currentColor && (
        <div className="flex items-center justify-between text-xs">
          <div className="text-muted-foreground">
            {(() => {
              const selected = colors.find(c => c.color === currentColor)
              if (!selected) return null
              
              if (selected.stock === 0) return "Out of Stock"
              if (selected.stock <= 5) return `Only ${selected.stock} left`
              if (selected.stock <= 10) return `${selected.stock} in stock`
              return "In Stock"
            })()}
          </div>
          
          <div className="flex items-center gap-1">
            <div 
              className="w-3 h-3 rounded-none border border-border"
              style={{ backgroundColor: getColorDisplay(colors.find(c => c.color === currentColor)!) }}
            ></div>
            <span className="text-foreground font-medium">
              {colors.find(c => c.color === currentColor)?.label}
            </span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {!currentColor && (
        <p className="text-xs text-muted-foreground">
          Please select a color to continue
        </p>
      )}
    </div>
  )
}