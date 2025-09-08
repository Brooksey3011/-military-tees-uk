"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, Eye, ShoppingCart, Star } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn, formatPrice } from "@/lib/utils"
import { AddToCartButton } from "@/components/cart/add-to-cart-button"
import { ProductVariant } from "./variant-selector"
import { useWishlistAddItem, useWishlistRemoveItem, useWishlistIsIn } from "@/store/wishlist"

interface Product {
  id: string
  name: string
  slug: string
  description?: string
  price: number
  main_image_url: string
  category_id: string
  variants: ProductVariant[]
  rating?: number
  review_count?: number
}

interface ProductCardProps {
  product: Product
  variant?: "default" | "compact" | "featured"
  onQuickView?: (product: Product) => void
  onToggleFavorite?: (productId: string) => void
  isFavorite?: boolean
  className?: string
}

export function ProductCard({
  product,
  variant = "default",
  onQuickView,
  onToggleFavorite,
  isFavorite = false,
  className
}: ProductCardProps) {
  const [isHovered, setIsHovered] = React.useState(false)
  const [selectedVariant, setSelectedVariant] = React.useState<ProductVariant | null>(
    product.variants?.find(v => (v.stockQuantity || v.stock_quantity) > 0) || product.variants?.[0] || null
  )
  
  const addItem = useWishlistAddItem()
  const removeItem = useWishlistRemoveItem()
  const isInWishlist = useWishlistIsIn()
  const isInWishlistState = isInWishlist(product.id)

  const averageRating = product.rating || 0
  const stockQuantity = selectedVariant ? (selectedVariant.stockQuantity || selectedVariant.stock_quantity || 0) : 0
  const isOutOfStock = stockQuantity <= 0
  const isLowStock = stockQuantity <= 5 && stockQuantity > 0
  
  // Simplified image handling - just use main image
  const displayImage = product.main_image_url || '/images/products/placeholder-tshirt.svg'

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onQuickView?.(product)
  }

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isInWishlistState) {
      removeItem(product.id)
    } else {
      addItem({
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image: displayImage,
        category: product.category_id,
        inStock: selectedVariant ? (selectedVariant.stockQuantity || selectedVariant.stock_quantity || 0) > 0 : true,
        sizes: product.variants?.map(v => v.size || 'One Size') || ['One Size']
      })
    }
    
    // Still call the optional callback for backward compatibility
    onToggleFavorite?.(product.id)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={cn("group", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="bg-background border-2 border-border/50 hover:border-border hover:shadow-lg rounded-none transition-all duration-300 overflow-hidden">
        <div className="relative">
          {/* Product Image */}
          <Link href={`/products/${product.slug}`} className="block relative aspect-[4/5] overflow-hidden bg-muted">
            <Image
              src={displayImage}
              alt={product.name}
              fill
              className="object-cover transition-all duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            
            {/* Hover Actions */}
            <motion.div 
              className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
            >
              <button
                onClick={handleQuickView}
                className="w-8 h-8 bg-black/70 hover:bg-black/90 text-white rounded-full flex items-center justify-center transition-colors"
              >
                <Eye className="w-4 h-4" />
              </button>
              
              <button
                onClick={handleToggleFavorite}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                  isFavorite 
                    ? "bg-red-500 hover:bg-red-600 text-white" 
                    : "bg-black/70 hover:bg-black/90 text-white"
                )}
              >
                <Heart className={cn("w-4 h-4", isInWishlistState && "fill-current text-red-600")} />
              </button>
            </motion.div>

            {/* Stock Badges */}
            {(isOutOfStock || isLowStock) && (
              <div className="absolute top-2 left-2">
                {isOutOfStock && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-sm font-medium">
                    Out of Stock
                  </span>
                )}
                {isLowStock && (
                  <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-sm font-medium">
                    Low Stock
                  </span>
                )}
              </div>
            )}
          </Link>

          {/* Variant Color Swatches */}
          {product.variants && product.variants.length > 1 && (
            <div className="absolute bottom-4 left-2 flex gap-1">
              {product.variants.slice(0, 5).map((variant) => {
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
                
                const bgColor = colorMap[variant.color?.toLowerCase() || ''] || '#6b7280'
                
                return (
                  <button
                    key={variant.id}
                    onClick={(e) => {
                      e.preventDefault()
                      setSelectedVariant(variant)
                    }}
                    className={cn(
                      "w-4 h-4 rounded-full border-2 transition-all duration-200",
                      selectedVariant?.id === variant.id 
                        ? "border-[#FFAD02] ring-2 ring-[#FFAD02]/30" 
                        : "border-white/70 hover:border-white hover:scale-110"
                    )}
                    style={{ backgroundColor: bgColor }}
                    title={`${variant.color} - ${variant.size}`}
                  />
                )
              })}
              {product.variants.length > 5 && (
                <span className="text-xs text-white bg-black/60 px-1.5 py-0.5 rounded-sm">
                  +{product.variants.length - 5}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4 space-y-3">
          {/* Product Name - Lowercase style like Forcewear */}
          <Link href={`/products/${product.slug}`}>
            <h3 className="text-sm font-normal text-foreground hover:text-[#FFAD02] transition-colors line-clamp-2 lowercase tracking-wide">
              {product.name.toLowerCase()}
            </h3>
          </Link>

          {/* Price - "From" format like Forcewear */}
          <div className="text-sm text-muted-foreground">
            from <span className="text-foreground font-medium">{formatPrice(product.price)} GBP</span>
          </div>

          {/* Reviews - if available */}
          {product.review_count && product.review_count > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-3 w-3",
                      i < Math.floor(averageRating) 
                        ? "text-[#FFAD02] fill-current" 
                        : "text-gray-300"
                    )}
                  />
                ))}
              </div>
              <span>({product.review_count})</span>
            </div>
          )}

          {/* Choose Options Button - Forcewear style */}
          <div className="pt-2">
            {selectedVariant ? (
              <Link href={`/products/${product.slug}`}>
                <Button
                  className={cn(
                    "w-full h-9 text-xs font-medium uppercase tracking-wide transition-all duration-300",
                    isOutOfStock 
                      ? "bg-gray-400 hover:bg-gray-400 cursor-not-allowed text-white"
                      : "bg-[#FFAD02] hover:bg-[#FFAD02]/90 text-black hover:text-black"
                  )}
                  disabled={isOutOfStock}
                >
                  {isOutOfStock ? 'Out of Stock' : 'Choose Options'}
                </Button>
              </Link>
            ) : (
              <Button
                className="w-full h-9 text-xs font-medium uppercase tracking-wide bg-gray-400 hover:bg-gray-400 cursor-not-allowed text-white"
                disabled
              >
                Unavailable
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}