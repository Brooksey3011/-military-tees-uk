"use client"

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Star, Heart, Share2, ChevronLeft, ChevronRight, Truck, Shield, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { VariantSelector, ProductVariant } from './variant-selector'
import { AddToCartButton } from '@/components/cart/add-to-cart-button'
import { cn, formatPrice } from '@/lib/utils'

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  main_image_url: string
  category_id: string
  variants: ProductVariant[]
  rating?: number
  review_count?: number
  features?: string[]
  materials?: string[]
  care_instructions?: string[]
}

interface ProductPageProps {
  product: Product
  categoryName?: string
}

export function ProductPage({ product, categoryName }: ProductPageProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants.find(v => v.stock_quantity > 0) || product.variants[0] || null
  )
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isWishlisted, setIsWishlisted] = useState(false)

  // Get all images including main image and variant images
  const allImages = [
    product.main_image_url,
    ...(selectedVariant?.image_urls || [])
  ].filter(Boolean)

  const currentPrice = product.price + (selectedVariant?.price_modifier || 0)
  const isInStock = selectedVariant && selectedVariant.stock_quantity > 0

  const handlePreviousImage = () => {
    setSelectedImageIndex((prev) => 
      prev === 0 ? allImages.length - 1 : prev - 1
    )
  }

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => 
      prev === allImages.length - 1 ? 0 : prev + 1
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-8 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary">Home</Link>
        <span className="mx-2">/</span>
        {categoryName && (
          <>
            <Link href={`/categories/${product.category_id}`} className="hover:text-primary">
              {categoryName}
            </Link>
            <span className="mx-2">/</span>
          </>
        )}
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative aspect-square bg-muted border-2 border-border rounded-none overflow-hidden">
            <Image
              src={allImages[selectedImageIndex]}
              alt={product.name}
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            
            {/* Image Navigation */}
            {allImages.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-none bg-background/80 backdrop-blur"
                  onClick={handlePreviousImage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-none bg-background/80 backdrop-blur"
                  onClick={handleNextImage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}

            {/* Image Indicators */}
            {allImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {allImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-colors",
                      index === selectedImageIndex 
                        ? "bg-primary" 
                        : "bg-white/50 hover:bg-white/70"
                    )}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Thumbnail Images */}
          {allImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {allImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={cn(
                    "relative flex-shrink-0 w-20 h-20 border-2 rounded-none overflow-hidden",
                    index === selectedImageIndex 
                      ? "border-primary" 
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <Image
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          {/* Product Header */}
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              {product.name}
            </h1>
            
            {/* Rating and Reviews */}
            {product.rating && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-4 w-4",
                        i < Math.floor(product.rating!)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.rating} ({product.review_count || 0} reviews)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="text-3xl font-bold text-primary mb-4">
              {formatPrice(currentPrice)}
              {selectedVariant?.price_modifier && selectedVariant.price_modifier !== 0 && (
                <span className="text-lg text-muted-foreground ml-2">
                  (Base: {formatPrice(product.price)})
                </span>
              )}
            </div>
          </div>

          {/* Variant Selection */}
          <VariantSelector
            variants={product.variants}
            selectedVariant={selectedVariant}
            onVariantChange={setSelectedVariant}
          />

          {/* Add to Cart */}
          <div className="flex gap-3">
            {selectedVariant && (
              <AddToCartButton
                productId={product.id}
                variantId={selectedVariant.id}
                name={product.name}
                price={currentPrice}
                image={allImages[0]}
                size={selectedVariant.size}
                color={selectedVariant.color}
                maxQuantity={selectedVariant.stock_quantity}
                buttonSize="lg"
                className="flex-1"
              />
            )}
            
            <Button
              variant="outline"
              size="lg"
              onClick={() => setIsWishlisted(!isWishlisted)}
              className={cn(
                "rounded-none border-2",
                isWishlisted && "bg-primary text-primary-foreground border-primary"
              )}
            >
              <Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="rounded-none border-2"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Product Description */}
          <div className="space-y-4">
            <h2 className="text-xl font-display font-semibold">Description</h2>
            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Product Features */}
          {product.features && product.features.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-display font-semibold">Features</h2>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-muted-foreground">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Materials & Care */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {product.materials && product.materials.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Materials</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {product.materials.map((material, index) => (
                    <li key={index}>• {material}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {product.care_instructions && product.care_instructions.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Care Instructions</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {product.care_instructions.map((instruction, index) => (
                    <li key={index}>• {instruction}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Shipping & Returns */}
          <div className="space-y-4 pt-6 border-t">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-sm">Free UK Delivery</p>
                  <p className="text-xs text-muted-foreground">Orders over £50</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <RotateCcw className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-sm">30-Day Returns</p>
                  <p className="text-xs text-muted-foreground">Free returns</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-sm">Secure Payment</p>
                  <p className="text-xs text-muted-foreground">SSL encrypted</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}