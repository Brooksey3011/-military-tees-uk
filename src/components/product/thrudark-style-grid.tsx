"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { cn } from "@/lib/utils"
import { 
  Heart, 
  ShoppingCart, 
  Eye, 
  Star,
  Truck,
  Shield,
  Award,
  Clock,
  Users,
  ArrowRight
} from "lucide-react"
import Link from "next/link"
import type { Product, ProductVariant } from "@/types"

interface ThruDarkStyleGridProps {
  products: Product[]
  loading?: boolean
  onQuickView?: (product: Product) => void
  onAddToCart?: (product: Product, variant: ProductVariant) => void
  onToggleFavorite?: (productId: string) => void
  favoriteProducts?: string[]
  className?: string
  showFilters?: boolean
}

// Premium Product Card Component (ThruDark Style)
function PremiumProductCard({ 
  product, 
  onQuickView, 
  onAddToCart, 
  onToggleFavorite, 
  isFavorite 
}: {
  product: Product
  onQuickView?: (product: Product) => void
  onAddToCart?: (product: Product, variant: ProductVariant) => void
  onToggleFavorite?: (productId: string) => void
  isFavorite?: boolean
}) {
  const [isHovered, setIsHovered] = React.useState(false)
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0)
  
  // Mock data - replace with actual product data
  const images = [
    product.main_image_url || '/placeholder-product.jpg',
    product.main_image_url || '/placeholder-product.jpg' // Would be different angles
  ]
  
  const rating = 4.8 // Mock rating - replace with actual
  const reviewCount = 247 // Mock reviews - replace with actual
  const isNew = product.is_featured // Using featured as "new" flag
  const isOnSale = false // Would come from product data
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className="overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-500 bg-white">
        {/* Image Section */}
        <div className="relative aspect-[4/5] overflow-hidden bg-gray-50">
          {/* Product Image */}
          <OptimizedImage
            src={images[currentImageIndex]}
            alt={product.name}
            fill
            className={cn(
              "object-cover transition-all duration-700",
              isHovered ? "scale-105" : "scale-100"
            )}
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
          
          {/* Overlay on Hover */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/20 flex items-center justify-center"
              >
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="rounded-full bg-white/90 hover:bg-white shadow-lg"
                    onClick={() => onQuickView?.(product)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="rounded-full bg-white/90 hover:bg-white shadow-lg"
                    onClick={() => onToggleFavorite?.(product.id)}
                  >
                    <Heart className={cn("h-4 w-4", isFavorite && "fill-red-500 text-red-500")} />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {isNew && (
              <Badge className="bg-green-600 text-white font-semibold px-2 py-1 text-xs">
                NEW
              </Badge>
            )}
            {isOnSale && (
              <Badge className="bg-red-600 text-white font-semibold px-2 py-1 text-xs">
                SALE
              </Badge>
            )}
          </div>
          
          {/* Quick Add Button */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-3 left-3 right-3"
              >
                <Button
                  className="w-full bg-green-800 hover:bg-green-900 text-white font-semibold rounded-lg shadow-lg"
                  onClick={() => {
                    // Add first variant to cart by default
                    // In real implementation, this would open size/variant selector
                    console.log('Quick add to cart')
                  }}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Quick Add
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Image Navigation Dots */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1">
              {images.map((_, index) => (
                <button
                  key={index}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-200",
                    currentImageIndex === index ? "bg-white" : "bg-white/50"
                  )}
                  onClick={() => setCurrentImageIndex(index)}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Product Details */}
        <CardContent className="p-4 space-y-3">
          {/* Rating & Reviews */}
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-3 w-3",
                    i < Math.floor(rating) 
                      ? "fill-yellow-400 text-yellow-400" 
                      : "text-gray-300"
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-gray-600">
              {rating} ({reviewCount})
            </span>
          </div>
          
          {/* Product Name */}
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-semibold text-gray-900 hover:text-green-800 transition-colors line-clamp-2 cursor-pointer">
              {product.name}
            </h3>
          </Link>
          
          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">
              £{product.price.toFixed(2)}
            </span>
            {isOnSale && (
              <span className="text-sm text-gray-500 line-through">
                £{(product.price * 1.2).toFixed(2)}
              </span>
            )}
          </div>
          
          {/* Features */}
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <Truck className="h-3 w-3" />
              <span>Free UK Delivery</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              <span>30 Day Returns</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Loading Skeleton
function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden border-0 shadow-sm">
      <div className="aspect-[4/5] bg-gray-200 animate-pulse" />
      <CardContent className="p-4 space-y-3">
        <div className="h-3 bg-gray-200 rounded animate-pulse w-24" />
        <div className="h-4 bg-gray-200 rounded animate-pulse" />
        <div className="h-5 bg-gray-200 rounded animate-pulse w-20" />
        <div className="h-3 bg-gray-200 rounded animate-pulse w-32" />
      </CardContent>
    </Card>
  )
}

// Filter Bar Component
function FilterBar() {
  return (
    <div className="flex items-center justify-between py-6 border-b border-gray-200">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-bold text-gray-900">All Products</h2>
        <Badge variant="outline" className="text-gray-600">
          247 items
        </Badge>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Sort Dropdown */}
        <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
          <option>Best Selling</option>
          <option>Newest</option>
          <option>Price: Low to High</option>
          <option>Price: High to Low</option>
          <option>Customer Rating</option>
        </select>
        
        {/* View Options */}
        <div className="flex items-center gap-1 border border-gray-300 rounded-lg p-1">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <div className="grid grid-cols-2 gap-0.5 w-3 h-3">
              <div className="bg-current rounded-sm" />
              <div className="bg-current rounded-sm" />
              <div className="bg-current rounded-sm" />
              <div className="bg-current rounded-sm" />
            </div>
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <div className="grid grid-cols-3 gap-0.5 w-3 h-3">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="bg-current rounded-sm" />
              ))}
            </div>
          </Button>
        </div>
      </div>
    </div>
  )
}

// Trust Signals Component
function TrustSignals() {
  return (
    <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-600 rounded-full">
            <Truck className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="font-semibold text-sm">Free UK Delivery</div>
            <div className="text-xs text-gray-600">On orders over £50</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-600 rounded-full">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="font-semibold text-sm">30-Day Returns</div>
            <div className="text-xs text-gray-600">No questions asked</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-600 rounded-full">
            <Award className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="font-semibold text-sm">Premium Quality</div>
            <div className="text-xs text-gray-600">Military-grade materials</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-600 rounded-full">
            <Users className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="font-semibold text-sm">Veteran Owned</div>
            <div className="text-xs text-gray-600">Supporting our community</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ThruDarkStyleGrid({
  products,
  loading = false,
  onQuickView,
  onAddToCart,
  onToggleFavorite,
  favoriteProducts = [],
  className,
  showFilters = true
}: ThruDarkStyleGridProps) {
  if (loading) {
    return (
      <div className={cn("container mx-auto px-4", className)}>
        {showFilters && <FilterBar />}
        <TrustSignals />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={cn("container mx-auto px-4", className)}>
      {showFilters && <FilterBar />}
      <TrustSignals />
      
      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <PremiumProductCard
            key={product.id}
            product={product}
            onQuickView={onQuickView}
            onAddToCart={onAddToCart}
            onToggleFavorite={onToggleFavorite}
            isFavorite={favoriteProducts.includes(product.id)}
          />
        ))}
      </div>
      
      {/* Load More */}
      <div className="flex justify-center pt-12">
        <Button 
          variant="outline" 
          size="lg"
          className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white font-semibold px-8"
        >
          Load More Products
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}