"use client"

import { useEffect, useState } from "react"
import { Filter, SortAsc } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ProductCard } from "@/components/product/product-card"

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
      if (priceFilter === 'under20') return (product.sale_price || product.price) < 20
      if (priceFilter === '20-30') return (product.sale_price || product.price) >= 20 && (product.sale_price || product.price) <= 30
      if (priceFilter === 'over30') return (product.sale_price || product.price) > 30
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
          {filteredAndSortedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={{
                ...product,
                category_id: product.category?.name || "veterans"
              }}
              variant="default"
            />
          ))}
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