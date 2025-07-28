"use client"

import * as React from "react"
import { X, ShoppingCart, Heart, Share2, Eye, Star, Truck } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ProductImageGallery } from "./product-image-gallery"
import { SizeSelector } from "./size-selector"
import { ColorSelector } from "./color-selector"
import { cn } from "@/lib/utils"

interface ProductVariant {
  id: string
  size: string
  color: string
  stock: number
  price: number
  sku: string
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  images: string[]
  category: string
  rating: number
  reviewCount: number
  isNew?: boolean
  isSale?: boolean
  variants: ProductVariant[]
}

interface QuickViewModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onAddToCart?: (productId: string, variantId: string, quantity: number) => void
  onViewFullProduct?: (productId: string) => void
  className?: string
}

export function QuickViewModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onViewFullProduct,
  className
}: QuickViewModalProps) {
  const [selectedSize, setSelectedSize] = React.useState("")
  const [selectedColor, setSelectedColor] = React.useState("")
  const [quantity, setQuantity] = React.useState(1)
  const [isAddingToCart, setIsAddingToCart] = React.useState(false)

  // Reset selections when product changes
  React.useEffect(() => {
    if (product) {
      setSelectedSize("")
      setSelectedColor("")
      setQuantity(1)
    }
  }, [product?.id])

  // Close modal with Escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  // Get available sizes and colors from variants - moved before early return
  const availableSizes = React.useMemo(() => {
    if (!product || !product.variants) return []
    const sizeMap = new Map()
    product.variants.forEach(variant => {
      if (!sizeMap.has(variant.size)) {
        sizeMap.set(variant.size, {
          size: variant.size,
          label: variant.size,
          stock: 0,
          isAvailable: false
        })
      }
      const size = sizeMap.get(variant.size)
      size.stock += variant.stock
      size.isAvailable = size.isAvailable || variant.stock > 0
    })
    return Array.from(sizeMap.values())
  }, [product])

  const availableColors = React.useMemo(() => {
    if (!product || !product.variants) return []
    const colorMap = new Map()
    product.variants.forEach(variant => {
      if (!colorMap.has(variant.color)) {
        colorMap.set(variant.color, {
          color: variant.color,
          label: variant.color.charAt(0).toUpperCase() + variant.color.slice(1),
          stock: 0,
          isAvailable: false
        })
      }
      const color = colorMap.get(variant.color)
      color.stock += variant.stock
      color.isAvailable = color.isAvailable || variant.stock > 0
    })
    return Array.from(colorMap.values())
  }, [product])

  if (!product) return null

  // Get selected variant
  const selectedVariant = product.variants.find(
    v => v.size === selectedSize && v.color === selectedColor
  )

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!selectedVariant) return

    setIsAddingToCart(true)
    try {
      await onAddToCart?.(product.id, selectedVariant.id, quantity)
      // Could show success message here
    } catch (error) {
      console.error("Failed to add to cart:", error)
    } finally {
      setIsAddingToCart(false)
    }
  }

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className={cn(
              "bg-background border-2 border-border rounded-none max-w-4xl w-full max-h-[90vh] overflow-hidden",
              className
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="border-b-2 border-border p-4 flex items-center justify-between bg-muted/10">
              <div className="flex items-center gap-3">
                <Eye className="h-5 w-5 text-primary" />
                <h2 className="font-display font-bold tracking-wide uppercase text-foreground">
                  Quick View
                </h2>
                {product.isNew && (
                  <Badge className="rounded-none bg-green-600 hover:bg-green-700">
                    NEW
                  </Badge>
                )}
                {product.isSale && (
                  <Badge className="rounded-none bg-red-600 hover:bg-red-700">
                    SALE
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-none p-2"
                  onClick={() => console.log("Share product")}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-none p-2"
                  onClick={() => console.log("Add to wishlist")}
                >
                  <Heart className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-none p-2"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 max-h-[calc(90vh-80px)] overflow-y-auto">
              
              {/* Product Images */}
              <div>
                <ProductImageGallery
                  images={product.images}
                  productName={product.name}
                  className="w-full"
                />
              </div>

              {/* Product Details */}
              <div className="space-y-6">
                
                {/* Product Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge className="rounded-none bg-primary/10 text-primary">
                      {product.category}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-3 w-3",
                              i < Math.floor(product.rating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground"
                            )}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        ({product.reviewCount})
                      </span>
                    </div>
                  </div>
                  
                  <h1 className="text-2xl font-display font-bold tracking-wide uppercase text-foreground">
                    {product.name}
                  </h1>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-primary">
                      £{product.price.toFixed(2)}
                    </span>
                    {product.originalPrice && (
                      <>
                        <span className="text-lg text-muted-foreground line-through">
                          £{product.originalPrice.toFixed(2)}
                        </span>
                        <Badge className="rounded-none bg-red-600 text-white">
                          -{discountPercentage}%
                        </Badge>
                      </>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Size Selection */}
                <SizeSelector
                  sizes={availableSizes}
                  selectedSize={selectedSize}
                  onSizeChange={setSelectedSize}
                />

                {/* Color Selection */}
                <ColorSelector
                  colors={availableColors}
                  selectedColor={selectedColor}
                  onColorChange={setSelectedColor}
                />

                {/* Quantity & Stock */}
                {selectedVariant && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-display font-bold tracking-wide uppercase">
                        Quantity
                      </label>
                      <span className="text-xs text-muted-foreground">
                        {selectedVariant.stock > 10 
                          ? "In Stock" 
                          : `${selectedVariant.stock} left`
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-none border-2 w-8 h-8 p-0"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                      >
                        −
                      </Button>
                      <span className="w-12 text-center font-medium">
                        {quantity}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-none border-2 w-8 h-8 p-0"
                        onClick={() => setQuantity(Math.min(selectedVariant.stock, quantity + 1))}
                        disabled={quantity >= selectedVariant.stock}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    className="w-full rounded-none font-display font-bold tracking-wide uppercase"
                    onClick={handleAddToCart}
                    disabled={!selectedSize || !selectedColor || isAddingToCart}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {isAddingToCart ? "Adding..." : "Add to Cart"}
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full rounded-none border-2 font-display font-bold tracking-wide uppercase"
                    onClick={() => onViewFullProduct?.(product.id)}
                  >
                    View Full Details
                  </Button>
                </div>

                {/* Shipping Info */}
                <div className="border-t border-border pt-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Truck className="h-4 w-4" />
                    <span>Free shipping on orders over £50</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}