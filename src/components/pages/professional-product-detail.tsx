"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Star, StarHalf, Heart, Share2, ShieldCheck, Truck, RotateCcw, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { AddToCartButton } from "@/components/cart/add-to-cart-button"
import { SizeGuideButton } from "@/components/product/size-guide"
import { ReviewsSection } from "@/components/product/reviews-section"
import { ReviewSummary } from "@/components/product/review-summary"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { cn } from "@/lib/utils"

interface Product {
  id: string
  name: string
  price: number
  sale_price?: number | null
  main_image_url: string
  description: string
  slug: string
  stock_quantity: number
  category?: {
    name: string
    slug: string
  }
  variants?: Array<{
    id: string
    size: string
    color: string
    stock_quantity: number
    sku: string
    image_urls?: string[]
  }>
}

interface ProductImages {
  main: string
  gallery: string[]
}

// Helper function for safe price display
const formatPrice = (price?: number | null): string => {
  if (typeof price === 'number' && !isNaN(price)) {
    return price.toFixed(2)
  }
  return '0.00'
}

export function ProfessionalProductDetail() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSize, setSelectedSize] = useState<string>("")
  const [selectedColor, setSelectedColor] = useState<string>("Standard")
  const [selectedImage, setSelectedImage] = useState<string>("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    async function fetchProduct() {
      if (!params.slug) return

      try {
        setLoading(true)
        const response = await fetch(`/api/products/${params.slug}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Product not found')
          } else {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          return
        }
        
        const data = await response.json()
        setProduct(data.product)
        setSelectedImage(data.product.main_image_url)
        
        // Set default size if variants available
        if (data.product.variants && data.product.variants.length > 0) {
          const availableVariant = data.product.variants.find((v: any) => v.stock_quantity > 0)
          if (availableVariant) {
            setSelectedSize(availableVariant.size)
            setSelectedColor(availableVariant.color || "Standard")
          }
        }
        
      } catch (err) {
        console.error('Error fetching product:', err)
        setError(err instanceof Error ? err.message : 'Failed to load product')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [params.slug])

  // Get available sizes
  const availableSizes = React.useMemo(() => {
    if (!product?.variants) return []
    
    const sizeMap = new Map()
    product.variants.forEach(variant => {
      if (!sizeMap.has(variant.size)) {
        sizeMap.set(variant.size, {
          size: variant.size,
          stock: 0,
          isAvailable: false
        })
      }
      const size = sizeMap.get(variant.size)
      size.stock += variant.stock_quantity
      size.isAvailable = size.isAvailable || variant.stock_quantity > 0
    })
    
    // Sort sizes in standard order
    const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"]
    return Array.from(sizeMap.values()).sort((a, b) => {
      const aIndex = sizeOrder.indexOf(a.size)
      const bIndex = sizeOrder.indexOf(b.size)
      return aIndex - bIndex
    })
  }, [product?.variants])

  // Get current variant
  const currentVariant = React.useMemo(() => {
    if (!product?.variants || !selectedSize) return null
    return product.variants.find(v => v.size === selectedSize && v.color === selectedColor)
  }, [product?.variants, selectedSize, selectedColor])

  // Calculate savings with proper null checks
  const savings = product?.sale_price && product?.price ? product.price - product.sale_price : 0
  const savingsPercentage = savings > 0 && product?.price ? Math.round((savings / product.price) * 100) : 0

  // Product images
  const productImages: ProductImages = React.useMemo(() => {
    if (!product) return { main: '', gallery: [] }
    
    const gallery = [product.main_image_url]
    
    // Add variant images if available
    if (currentVariant?.image_urls && currentVariant.image_urls.length > 0) {
      gallery.push(...currentVariant.image_urls)
    }
    
    return {
      main: selectedImage || product.main_image_url,
      gallery: [...new Set(gallery)] // Remove duplicates
    }
  }, [product, currentVariant, selectedImage])

  if (!mounted) return null

  // Early return for missing essential data
  if (!product && !loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-display font-bold mb-4 tracking-wide uppercase">Product Not Found</h2>
        <p className="text-muted-foreground mb-6">This product could not be found.</p>
        <Button asChild className="rounded-none font-display font-bold tracking-wide uppercase">
          <Link href="/categories">Browse Categories</Link>
        </Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="aspect-square bg-muted/20 animate-pulse rounded-none"></div>
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-square bg-muted/20 animate-pulse rounded-none"></div>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-muted/20 h-8 animate-pulse rounded-none"></div>
            <div className="bg-muted/20 h-6 animate-pulse rounded-none"></div>
            <div className="bg-muted/20 h-12 animate-pulse rounded-none"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-display font-bold mb-4 tracking-wide uppercase">Product Not Found</h2>
        <p className="text-muted-foreground mb-6">{error || 'This product could not be found.'}</p>
        <Button asChild className="rounded-none font-display font-bold tracking-wide uppercase">
          <Link href="/categories">Browse Categories</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <span>/</span>
        {product.category && (
          <>
            <Link href="/categories" className="hover:text-foreground transition-colors">Categories</Link>
            <span>/</span>
            <Link 
              href={`/categories/${product.category.slug}`}
              className="hover:text-foreground transition-colors"
            >
              {product.category.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-foreground font-medium">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="aspect-square relative border-2 border-border rounded-none overflow-hidden bg-muted/10">
            <OptimizedImage
              src={productImages.main || '/placeholder-product.jpg'}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
            {product.sale_price && (
              <div className="absolute top-4 right-4">
                <Badge className="rounded-none bg-red-600 text-white font-bold">
                  -{savingsPercentage}% OFF
                </Badge>
              </div>
            )}
          </div>

          {/* Image Gallery */}
          {productImages.gallery.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {productImages.gallery.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(image)}
                  className={cn(
                    "aspect-square relative border-2 rounded-none overflow-hidden transition-colors",
                    selectedImage === image ? "border-primary" : "border-border hover:border-muted-foreground"
                  )}
                >
                  <OptimizedImage
                    src={image}
                    alt={`${product.name} - View ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-display font-bold tracking-wide uppercase text-foreground mb-2">
              {product.name}
            </h1>
            
            {/* Real Review Summary */}
            <ReviewSummary productId={product.id} className="mb-4" />

            {product.category && (
              <Badge variant="outline" className="rounded-none mb-4">
                {product.category.name}
              </Badge>
            )}
          </div>

          {/* Pricing */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-foreground">
                £{formatPrice(product.sale_price || product.price)}
              </span>
              {product.sale_price && product.price && (
                <span className="text-xl text-muted-foreground line-through">
                  £{formatPrice(product.price)}
                </span>
              )}
            </div>
            {savings > 0 && (
              <div className="text-green-600 font-medium">
                You save £{formatPrice(savings)} ({savingsPercentage}% off)
              </div>
            )}
          </div>

          <Separator />

          {/* Size Selection */}
          {availableSizes.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-foreground">Size</label>
                <SizeGuideButton category="adult" className="text-xs" />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {availableSizes.map((size) => (
                  <Button
                    key={size.size}
                    variant={selectedSize === size.size ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSize(size.size)}
                    disabled={!size.isAvailable}
                    className={cn(
                      "rounded-none font-display font-bold tracking-wide uppercase",
                      !size.isAvailable && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {size.size}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            {currentVariant && currentVariant.stock_quantity > 0 ? (
              <>
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600 font-medium">
                  {currentVariant.stock_quantity > 5 ? 'In Stock' : `Only ${currentVariant.stock_quantity} left!`}
                </span>
              </>
            ) : (
              <>
                <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                <span className="text-sm text-red-600 font-medium">Out of Stock</span>
              </>
            )}
          </div>

          {/* Add to Cart */}
          <div className="space-y-3">
            <AddToCartButton
              productId={product.id}
              variantId={currentVariant?.id || product.id}
              name={product.name}
              price={product.sale_price || product.price || 0}
              image={productImages.main}
              size={selectedSize || "One Size"}
              color={selectedColor}
              maxQuantity={currentVariant?.stock_quantity || product.stock_quantity || 0}
              className="w-full rounded-none font-display font-bold tracking-wide uppercase text-lg py-4"
              buttonSize="lg"
            />
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 rounded-none"
                onClick={() => {
                  // Simple wishlist functionality - could be enhanced with actual storage
                  const wishlistKey = 'military-tees-wishlist'
                  const existing = JSON.parse(localStorage.getItem(wishlistKey) || '[]')
                  const productData = {
                    id: product.id,
                    name: product.name,
                    price: product.sale_price || product.price,
                    image: productImages.main,
                    slug: product.slug
                  }
                  
                  const isAlreadyInWishlist = existing.some((item: any) => item.id === product.id)
                  if (!isAlreadyInWishlist) {
                    existing.push(productData)
                    localStorage.setItem(wishlistKey, JSON.stringify(existing))
                    alert('Added to wishlist!')
                  } else {
                    alert('Already in wishlist!')
                  }
                }}
              >
                <Heart className="h-4 w-4 mr-2" />
                Add to Wishlist
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 rounded-none"
                onClick={() => {
                  // Simple share functionality
                  if (navigator.share) {
                    navigator.share({
                      title: product.name,
                      text: `Check out this ${product.name} from Military Tees UK`,
                      url: window.location.href
                    })
                  } else {
                    // Fallback - copy to clipboard
                    navigator.clipboard.writeText(window.location.href)
                    alert('Product link copied to clipboard!')
                  }
                }}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          <Separator />

          {/* Trust Signals */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <div className="text-sm">
                <div className="font-medium">Secure Checkout</div>
                <div className="text-muted-foreground text-xs">SSL Encrypted</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              <div className="text-sm">
                <div className="font-medium">Free UK Shipping</div>
                <div className="text-muted-foreground text-xs">Orders over £50</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-primary" />
              <div className="text-sm">
                <div className="font-medium">Easy Returns</div>
                <div className="text-muted-foreground text-xs">30-day guarantee</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              <div className="text-sm">
                <div className="font-medium">Premium Quality</div>
                <div className="text-muted-foreground text-xs">Military-grade materials</div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Product Description */}
          <div className="space-y-4">
            <h3 className="text-lg font-display font-bold tracking-wide uppercase">Product Details</h3>
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            
            {/* Technical Specs */}
            <div className="space-y-2">
              <h4 className="font-semibold">Specifications:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 100% Premium Cotton</li>
                <li>• Pre-shrunk for perfect fit</li>
                <li>• Double needle stitching for durability</li>
                <li>• Side-seamed construction</li>
                <li>• Machine washable</li>
                <li>• Unisex sizing</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-16">
        <ReviewsSection 
          productId={product.id}
          productName={product.name}
          className="border-2 border-border rounded-none p-6"
        />
      </div>
    </div>
  )
}