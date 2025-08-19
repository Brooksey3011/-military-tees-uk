"use client"

import * as React from "react"
import { Star, Heart, Share2, Shield, Truck, RotateCcw, Ruler } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AddToCartButton } from "@/components/cart/add-to-cart-wrapper"
import { ComprehensiveSizeGuide } from "@/components/product/comprehensive-size-guide"
import { cn, formatPrice } from "@/lib/utils"

interface ProductDetailsClientProps {
  product: {
    id: string
    name: string
    slug: string
    description: string
    longDescription: string
    price: number
    compareAtPrice?: number
    mainImageUrl: string
    category: {
      id: string
      name: string
      slug: string
    }
    variants: Array<{
      id: string
      size: string
      color: string
      sku: string
      stockQuantity: number
      imageUrls: string[]
    }>
    reviews?: Array<{
      id: string
      rating: number
      comment: string
      customerName: string
      createdAt: string
    }>
  }
}

export function ProductDetailsClient({ product }: ProductDetailsClientProps) {
  const averageRating = product.reviews?.length 
    ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length 
    : 0

  // State for variant selection
  const [selectedSize, setSelectedSize] = React.useState<string>("")
  const [selectedColor, setSelectedColor] = React.useState<string>("")
  const [selectedVariant, setSelectedVariant] = React.useState<any>(product.variants[0])

  const availableSizes = product.variants.map(v => v.size).filter((size, index, arr) => arr.indexOf(size) === index)
  const availableColors = product.variants.map(v => v.color).filter((color, index, arr) => arr.indexOf(color) === index)
  const isInStock = product.variants.some(v => v.stockQuantity > 0)
  const isOnSale = product.compareAtPrice && product.compareAtPrice > product.price

  // Function to find variant based on selected size and color
  const findVariant = (size: string, color: string) => {
    return product.variants.find(v => v.size === size && v.color === color) || product.variants[0]
  }

  // Handle size selection
  const handleSizeSelect = (size: string) => {
    setSelectedSize(size)
    if (selectedColor) {
      const variant = findVariant(size, selectedColor)
      setSelectedVariant(variant)
    }
  }

  // Handle color selection
  const handleColorSelect = (color: string) => {
    setSelectedColor(color)
    if (selectedSize) {
      const variant = findVariant(selectedSize, color)
      setSelectedVariant(variant)
    }
  }

  // Get stock for specific size/color combination
  const getVariantStock = (size: string, color: string) => {
    const variant = product.variants.find(v => v.size === size && v.color === color)
    return variant?.stockQuantity || 0
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="secondary" className="rounded-none">
                {product.category.name}
              </Badge>
              {isOnSale && (
                <Badge variant="destructive" className="rounded-none">
                  SALE
                </Badge>
              )}
            </div>
            
            <h1 className={cn(
              "text-2xl md:text-3xl font-display font-bold text-foreground",
              "tracking-wide mb-2"
            )}>
              {product.name}
            </h1>
            
            {/* Rating */}
            {product.reviews && product.reviews.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-4 w-4",
                        i < Math.floor(averageRating) 
                          ? "text-yellow-500 fill-current" 
                          : "text-muted-foreground/30"
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {averageRating.toFixed(1)} ({product.reviews.length} reviews)
                </span>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2 ml-4">
            <Button size="icon" variant="ghost" className="rounded-none">
              <Heart className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" className="rounded-none">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-foreground">
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice && (
            <span className="text-xl text-muted-foreground line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>
      </div>

      {/* Stock Status */}
      <div>
        {isInStock ? (
          <Badge variant="success" className="rounded-none">
            In Stock
          </Badge>
        ) : (
          <Badge variant="destructive" className="rounded-none">
            Out of Stock
          </Badge>
        )}
      </div>

      {/* Description */}
      <div>
        <p className="text-muted-foreground leading-relaxed">
          {product.description}
        </p>
      </div>

      {/* Size & Color Selection */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">
              Size {selectedSize && `(${selectedSize} selected)`}
            </label>
            <ComprehensiveSizeGuide
              trigger={
                <Button variant="ghost" size="sm" className="text-xs h-auto p-1 text-muted-foreground hover:text-primary">
                  <Ruler className="h-3 w-3 mr-1" />
                  Size Guide
                </Button>
              }
            />
          </div>
          <div className="flex gap-2">
            {availableSizes.map((size) => {
              const hasStock = selectedColor 
                ? getVariantStock(size, selectedColor) > 0 
                : product.variants.some(v => v.size === size && v.stockQuantity > 0)
              const isSelected = selectedSize === size
              
              return (
                <Button
                  key={size}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "rounded-none border-2",
                    isSelected && "bg-primary text-primary-foreground border-primary"
                  )}
                  disabled={!hasStock}
                  onClick={() => handleSizeSelect(size)}
                >
                  {size}
                </Button>
              )
            })}
          </div>
        </div>

        {availableColors.length > 1 && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Colour {selectedColor && `(${selectedColor} selected)`}
            </label>
            <div className="flex gap-2">
              {availableColors.map((color) => {
                const hasStock = selectedSize 
                  ? getVariantStock(selectedSize, color) > 0 
                  : product.variants.some(v => v.color === color && v.stockQuantity > 0)
                const isSelected = selectedColor === color
                
                return (
                  <Button
                    key={color}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "rounded-none border-2 min-w-[80px]",
                      isSelected && "bg-primary text-primary-foreground border-primary"
                    )}
                    disabled={!hasStock}
                    onClick={() => handleColorSelect(color)}
                  >
                    {color}
                  </Button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Add to Cart */}
      <div className="space-y-4">
        <AddToCartButton
          product={product}
          variant={selectedVariant}
          disabled={!isInStock || (!selectedSize && !selectedColor)}
          className="w-full h-12 rounded-none"
        />
        
        {(!selectedSize || !selectedColor) && (
          <p className="text-sm text-muted-foreground text-center">
            Please select a size and color to add to cart
          </p>
        )}
        
        <div className="text-sm text-muted-foreground space-y-1">
          <p>• Free UK delivery on orders over £50</p>
          <p>• 30-day returns policy</p>
          <p>• Secure checkout with Stripe</p>
        </div>
      </div>

      {/* Product Info */}
      <div className={cn(
        "border-t-2 border-border pt-6 space-y-4",
        "bg-muted/10 p-4 rounded-none"
      )}>
        <h3 className={cn(
          "font-display font-semibold text-foreground",
          "tracking-wide uppercase"
        )}>
          Product Information
        </h3>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">SKU:</span>
            <span className="ml-2 font-medium">{product.variants[0].sku}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Category:</span>
            <span className="ml-2 font-medium">{product.category.name}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>Quality Guarantee</span>
          </div>
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            <span>Fast Delivery</span>
          </div>
          <div className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            <span>Easy Returns</span>
          </div>
        </div>
      </div>
    </div>
  )
}