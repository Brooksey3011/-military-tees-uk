"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Filter, SortAsc } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product/product-card"
import { cn } from "@/lib/utils"

interface Product {
  id: string
  name: string
  price: number
  sale_price?: number
  main_image_url: string
  description: string
  slug: string
  category_id: string
  category?: {
    name: string
    slug: string
  }
  variants: Array<{
    id: string
    size: string
    color: string
    stock_quantity: number
    stockQuantity?: number
    sku: string
    price: number
  }>
  rating?: number
  review_count?: number
  created_at?: string
}

interface BritishArmyProductsProps {
  onProductCountChange?: (count: number) => void
}

export function BritishArmyProducts({ onProductCountChange }: BritishArmyProductsProps = {}) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<string>('name')
  const [priceFilter, setPriceFilter] = useState<string>('all')

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true)
        
        // Fetch products from multiple army-related categories
        const armyCategories = ['armoury', 'regimental-hq', 'parade-square', 'ops-room', 'ranges']
        const responses = await Promise.all(
          armyCategories.map(cat => 
            fetch(`/api/products?category=${cat}&limit=50`)
              .then(res => res.ok ? res.json() : { products: [] })
          )
        )
        
        const allProducts = responses.flatMap(data => data.products || [])
        
        // Remove duplicates based on product ID
        const uniqueProducts = allProducts.filter((product, index, self) => 
          index === self.findIndex(p => p.id === product.id)
        )
        
        setProducts(uniqueProducts)
      } catch (err) {
        console.error('Error fetching British Army products:', err)
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

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar Skeleton */}
        <aside className="lg:col-span-1">
          <div className="bg-muted/20 h-64 rounded-none animate-pulse border border-border"></div>
        </aside>

        {/* Products Grid Skeleton */}
        <main className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-muted/20 h-96 rounded-none animate-pulse border border-border"></div>
            ))}
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
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
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedProducts.map((product) => {
            // Ensure product has the right structure for ProductCard
            const normalizedProduct = {
              ...product,
              category_id: product.category_id || product.category?.slug || 'british-army',
              variants: product.variants?.map(variant => ({
                ...variant,
                stockQuantity: variant.stock_quantity || variant.stockQuantity || 0,
                price: variant.price || 0
              })) || []
            }

            return (
              <ProductCard
                key={product.id}
                product={normalizedProduct}
                variant="default"
                className="h-full"
              />
            )
          })}
        </div>
      )}
      
      {!loading && filteredAndSortedProducts.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Showing {filteredAndSortedProducts.length} British Army products
        </div>
      )}
    </div>
  )
}