"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSimpleCart } from "@/hooks/use-simple-cart"
import { SizeSelector } from "@/components/product/size-selector"

interface Product {
  id: string
  name: string
  price: number
  sale_price?: number
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
  }>
}

export function ProductDetailHydrationSafe() {
  const params = useParams()
  const router = useRouter()
  const { addItem } = useSimpleCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSize, setSelectedSize] = useState<string>("")
  const [selectedColor, setSelectedColor] = useState<string>("")
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Handle hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Prepare size options for SizeSelector component (MUST be before early returns)
  const sizeOptions = React.useMemo(() => {
    if (!mounted || !product?.variants) return []
    
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
      size.stock += variant.stock_quantity
      size.isAvailable = size.isAvailable || variant.stock_quantity > 0
    })
    return Array.from(sizeMap.values())
  }, [mounted, product?.variants])

  // Determine product type for size guide (MUST be before early returns)
  const productType = React.useMemo(() => {
    if (!mounted || !product?.category?.name) return 'tshirt'
    const category = product.category.name.toLowerCase()
    if (category.includes('hoodie') || category.includes('sweatshirt')) return 'hoodie'
    if (category.includes('polo')) return 'polo'
    return 'tshirt'
  }, [mounted, product?.category])

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
        
        // Set default selections
        if (data.product.variants && data.product.variants.length > 0) {
          const availableVariant = data.product.variants.find((v: any) => v.stock_quantity > 0)
          if (availableVariant) {
            setSelectedSize(availableVariant.size)
            setSelectedColor(availableVariant.color)
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

  // Don't render until hydrated to prevent hydration mismatch
  if (!mounted) {
    return null
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-100 aspect-square rounded animate-pulse"></div>
          <div className="space-y-4">
            <div className="bg-gray-100 h-8 rounded animate-pulse"></div>
            <div className="bg-gray-100 h-6 rounded animate-pulse"></div>
            <div className="bg-gray-100 h-12 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
        <p className="text-gray-600 mb-6">{error}</p>
        <button 
          onClick={() => router.back()}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          Go Back
        </button>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
        <button 
          onClick={() => router.back()}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          Go Back
        </button>
      </div>
    )
  }

  // Get unique colors (moved after useMemo hooks)
  const colors = [...new Set(product?.variants?.map(v => v.color) || [])]

  // Find current variant
  const currentVariant = product.variants?.find(
    v => v.size === selectedSize && v.color === selectedColor
  )

  const displayPrice = product.sale_price || product.price

  const handleAddToCart = async () => {
    if (!product || !currentVariant) return

    setIsAddingToCart(true)
    
    try {
      addItem({
        productId: product.id,
        variantId: currentVariant.id,
        name: product.name,
        price: displayPrice,
        image: product.main_image_url,
        size: selectedSize,
        color: selectedColor,
        maxQuantity: currentVariant.stock_quantity
      })
      
      // Show success feedback
      setTimeout(() => setIsAddingToCart(false), 1000)
    } catch (error) {
      console.error('Error adding to cart:', error)
      setIsAddingToCart(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8">
        <button onClick={() => router.push('/')} className="hover:text-green-600">Home</button>
        <span>/</span>
        <button onClick={() => router.push('/products')} className="hover:text-green-600">Products</button>
        <span>/</span>
        <span className="text-green-600">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Image */}
        <div>
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={product.main_image_url}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = '/placeholder-product.jpg'
              }}
            />
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <p className="text-gray-600 mb-4">{product.description}</p>
            
            <div className="flex items-center gap-4 mb-6">
              <span className="text-3xl font-bold text-green-600">
                £{displayPrice}
              </span>
              {product.sale_price && (
                <span className="text-xl text-gray-500 line-through">
                  £{product.price}
                </span>
              )}
            </div>
          </div>

          {/* Size Selection with Integrated Size Guide */}
          {sizeOptions.length > 0 && (
            <SizeSelector
              sizes={sizeOptions}
              selectedSize={selectedSize}
              onSizeChange={setSelectedSize}
              productType={productType}
            />
          )}

          {/* Color Selection */}
          {colors.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Color</h3>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 border rounded ${
                      selectedColor === color
                        ? 'border-green-600 bg-green-50 text-green-600'
                        : 'border-gray-300 hover:border-green-600'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock Status */}
          <div>
            {currentVariant ? (
              <p className={`text-sm ${
                currentVariant.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {currentVariant.stock_quantity > 0 
                  ? `In Stock (${currentVariant.stock_quantity} available)`
                  : 'Out of Stock'
                }
              </p>
            ) : (
              <p className="text-sm text-gray-600">Select size and color to see availability</p>
            )}
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
              currentVariant && currentVariant.stock_quantity > 0
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            disabled={!currentVariant || currentVariant.stock_quantity === 0 || isAddingToCart}
          >
            {isAddingToCart 
              ? 'Adding...' 
              : currentVariant && currentVariant.stock_quantity > 0 
              ? 'Add to Cart' 
              : 'Select Options'
            }
          </button>

          {/* Product Info */}
          <div className="border-t pt-6 space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Product Details</h3>
              <p className="text-gray-600 text-sm">
                Premium quality military-themed apparel. Made with high-quality materials 
                and designed to honor military heritage and service.
              </p>
            </div>
            
            {product.category && (
              <div>
                <h3 className="font-semibold mb-2">Category</h3>
                <p className="text-gray-600 text-sm">{product.category.name}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}