"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Filter, SortAsc } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AddToCartButton } from "@/components/cart/add-to-cart-button"
import { cn } from "@/lib/utils"
import { OptimizedImage } from "@/components/ui/optimized-image"

interface Product {
  id: string
  name: string
  price: number
  sale_price?: number
  main_image_url: string
  description: string
  slug: string
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
  }>
}

interface AllProductsProps {
  onProductCountChange?: (count: number) => void
}

export function AllProducts({ onProductCountChange }: AllProductsProps = {}) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<string>('name')
  const [priceFilter, setPriceFilter] = useState<string>('all')

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true)
        
        // Fetch all products with a higher limit
        const response = await fetch('/api/products?limit=50')
        
        if (!response.ok) {
          throw new Error('Failed to fetch products')
        }
        
        const data = await response.json()
        setProducts(data.products || [])
        
      } catch (err) {
        console.error('Error fetching all products:', err)
        setError(err instanceof Error ? err.message : 'Failed to load products')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const filteredAndSortedProducts = products
    .filter(product => {
      if (priceFilter === 'all') return true
      if (priceFilter === 'under-20') return (product.sale_price || product.price) < 20
      if (priceFilter === '20-30') return (product.sale_price || product.price) >= 20 && (product.sale_price || product.price) <= 30
      if (priceFilter === '30-40') return (product.sale_price || product.price) >= 30 && (product.sale_price || product.price) <= 40
      if (priceFilter === 'over-40') return (product.sale_price || product.price) > 40
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return (a.sale_price || a.price) - (b.sale_price || b.price)
        case 'price-high':
          return (b.sale_price || b.price) - (a.sale_price || a.price)
        case 'name':
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

  // Notify parent of product count changes
  useEffect(() => {
    if (onProductCountChange && !loading) {
      onProductCountChange(filteredAndSortedProducts.length)
    }
  }, [filteredAndSortedProducts.length, loading, onProductCountChange])

  const formatPrice = (price: number) => `£${price.toFixed(2)}`

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Filters and Sorting Skeleton */}
        <div className="bg-muted/20 h-16 animate-pulse border border-border rounded-none"></div>
        
        {/* Products Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-muted/20 h-96 animate-pulse rounded-none border-2 border-border"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-display font-bold mb-4 tracking-wide uppercase">Unable to Load Products</h2>
        <p className="text-muted-foreground mb-6">Error: {error}</p>
        <Button 
          onClick={() => window.location.reload()}
          className="rounded-none font-display font-bold tracking-wide uppercase"
        >
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Filters and Sorting */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-muted/10 border border-border rounded-none">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">Filter by price:</span>
            <select 
              value={priceFilter} 
              onChange={(e) => setPriceFilter(e.target.value)}
              className="text-sm border border-border rounded-none bg-background px-2 py-1"
            >
              <option value="all">All prices</option>
              <option value="under-20">Under £20</option>
              <option value="20-30">£20 - £30</option>
              <option value="30-40">£30 - £40</option>
              <option value="over-40">Over £40</option>
            </select>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <SortAsc className="h-4 w-4" />
          <span className="text-sm font-medium">Sort by:</span>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border border-border rounded-none bg-background px-2 py-1"
          >
            <option value="name">Name A-Z</option>
            <option value="price-low">Price Low-High</option>
            <option value="price-high">Price High-Low</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {filteredAndSortedProducts.length === 0 ? (
        <div className="text-center py-16">
          <h3 className="text-xl font-semibold mb-4">No products found</h3>
          <p className="text-muted-foreground">Try adjusting your filters or check back later for new products.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedProducts.map((product) => {
            const displayPrice = product.sale_price || product.price

            return (
              <div key={product.id} className="group border-2 border-border rounded-none bg-background hover:border-primary transition-colors">
                <div className="relative aspect-square overflow-hidden">
                  <Link href={`/products/${product.slug}`}>
                    <OptimizedImage
                      src={product.main_image_url}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>
                  
                  {product.sale_price && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-red-600 text-white rounded-none">SALE</Badge>
                    </div>
                  )}
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
                        <span className="font-bold text-lg">{formatPrice(displayPrice)}</span>
                        {product.sale_price && (
                          <span className="text-sm text-muted-foreground line-through">
                            {formatPrice(product.price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <AddToCartButton
                      productId={product.id}
                      variantId={product.id}
                      name={product.name}
                      price={displayPrice}
                      image={product.main_image_url}
                      size="One Size"
                      color="Standard"
                      maxQuantity={10}
                      className="w-full rounded-none text-xs"
                      buttonSize="sm"
                      showIcon={true}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
      
      {!loading && filteredAndSortedProducts.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Showing {filteredAndSortedProducts.length} products
        </div>
      )}
    </div>
  )
}