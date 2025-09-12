"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Filter, SortAsc, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ProductCard } from "@/components/product/product-card"
import { ProductViewToggle } from "@/components/ui/product-view-toggle"
import { useProductView } from "@/hooks/use-product-view"
import { AddToCartButton } from "@/components/cart/add-to-cart-button"
import { cn } from "@/lib/utils"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { useWishlistAddItem, useWishlistRemoveItem, useWishlistIsIn } from "@/store/wishlist"

interface Product {
  id: string
  name: string
  price: number
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

interface VeteransProductsProps {
  onProductCountChange?: (count: number) => void
}

export function VeteransProducts({ onProductCountChange }: VeteransProductsProps = {}) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<string>('name')
  const [priceFilter, setPriceFilter] = useState<string>('all')
  
  // Product view management
  const { view, setView } = useProductView()

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true)
        
        // Fetch products from veterans category
        const response = await fetch('/api/products?category=veterans&limit=50')
        
        if (!response.ok) {
          throw new Error('Failed to fetch products')
        }
        
        const data = await response.json()
        setProducts(data.products || [])
        
      } catch (err) {
        console.error('Error fetching veterans products:', err)
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
      if (priceFilter === 'under20') return product.price < 20
      if (priceFilter === '20-30') return product.price >= 20 && product.price <= 30
      if (priceFilter === 'over30') return product.price > 30
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price
        case 'price-high':
          return b.price - a.price
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

  // Wishlist hooks
  const addToWishlist = useWishlistAddItem()
  const removeFromWishlist = useWishlistRemoveItem()
  const isInWishlist = useWishlistIsIn()

  const handleWishlistToggle = (product: Product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist({
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image: product.main_image_url,
        category: product.category?.name || "veterans",
        inStock: true,
        sizes: product.variants?.map(v => v.size || 'One Size') || ['One Size']
      })
    }
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <h3 className="text-xl font-semibold mb-4">Unable to load products</h3>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => window.location.reload()}>
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
              <option value="under20">Under £20</option>
              <option value="20-30">£20 - £30</option>
              <option value="over30">Over £30</option>
            </select>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
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
          
          {/* View Toggle */}
          <ProductViewToggle onViewChange={setView} />
        </div>
      </div>

      {/* Products Grid/List */}
      {loading ? (
        <div className={cn(
          view === 'grid' ? 'product-grid-view' : 'product-list-view'
        )}>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-muted/20 h-96 animate-pulse rounded-none border-2 border-border"></div>
          ))}
        </div>
      ) : filteredAndSortedProducts.length === 0 ? (
        <div className="text-center py-16">
          <h3 className="text-xl font-semibold mb-4">No products found</h3>
          <p className="text-muted-foreground">Try adjusting your filters or check back later for new products.</p>
        </div>
      ) : (
        <div className={cn(
          view === 'grid' ? 'product-grid-view' : 'product-list-view',
          "transition-all duration-300 ease-in-out"
        )}>
          {filteredAndSortedProducts.map((product) => {
            // Ensure product has the right structure for ProductCard
            const normalizedProduct = {
              ...product,
              category_id: product.category?.slug || 'veterans',
              variants: product.variants?.map(variant => ({
                ...variant,
                stockQuantity: variant.stock_quantity || 10,
                price: variant.price || product.price
              })) || [{
                id: product.id,
                size: 'One Size',
                color: 'Standard', 
                stock_quantity: 10,
                stockQuantity: 10,
                sku: product.id,
                price: product.price
              }]
            }

            return (
              <ProductCard
                key={product.id}
                product={normalizedProduct}
                variant="default"
                className={cn(
                  "h-full product-card",
                  view === 'list' ? 'list-card' : 'grid-card'
                )}
              />
            )
          })}
        </div>
      )}
      
      {/* Results info */}
      {!loading && filteredAndSortedProducts.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Showing {filteredAndSortedProducts.length} veteran products
        </div>
      )}
    </div>
  )
}