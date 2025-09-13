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
    product.variants?.find(v => ((v as any).stockQuantity || v.stock_quantity) > 0) || product.variants?.[0] || null
  )
  
  const addItem = useWishlistAddItem()
  const removeItem = useWishlistRemoveItem()
  const isInWishlist = useWishlistIsIn()
  const isInWishlistState = isInWishlist(product.id)

  const averageRating = product.rating || 0
  const stockQuantity = selectedVariant ? ((selectedVariant as any).stockQuantity || selectedVariant.stock_quantity || 0) : 0
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
        inStock: selectedVariant ? ((selectedVariant as any).stockQuantity || selectedVariant.stock_quantity || 0) > 0 : true,
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
      <div className="group border-2 border-border rounded-none bg-background hover:border-primary transition-colors">
        <div className="relative aspect-square overflow-hidden">
          {/* Product Image */}
          <Link href={`/products/${product.slug}`} className="block">
            <Image
              src={displayImage}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            

            {/* Wishlist Heart Button */}
            <button
              onClick={handleToggleFavorite}
              className={cn(
                "absolute top-2 left-2 p-2 rounded-full transition-colors",
                isInWishlistState 
                  ? "bg-red-500 text-white hover:bg-red-600" 
                  : "bg-white/80 text-gray-600 hover:bg-white hover:text-red-500"
              )}
              title={isInWishlistState ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart className={cn("h-4 w-4", isInWishlistState && "fill-current")} />
            </button>

          </Link>
        </div>

        <div className="p-4 space-y-3">
          <div>
            <Link href={`/products/${product.slug}`}>
              <h3 className="font-display font-bold text-sm uppercase tracking-wide group-hover:text-primary transition-colors line-clamp-2">
                {product.name}
              </h3>
            </Link>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {product.description}
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg">{formatPrice(product.price)}</span>
              </div>
            </div>
          </div>
          
          <div className="pt-2">
            <AddToCartButton
              productId={product.id}
              variantId={selectedVariant?.id || product.id}
              name={product.name}
              price={product.price}
              image={displayImage}
              size={selectedVariant?.size || "One Size"}
              color={selectedVariant?.color || "Standard"}
              maxQuantity={10}
              className="w-full rounded-none text-xs"
              buttonSize="sm"
              showIcon={true}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}