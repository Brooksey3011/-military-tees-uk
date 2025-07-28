"use client"

import { useState } from "react"
import { Layout } from "@/components/layout"
import { ProductGrid, ProductFilters } from "@/components/product"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useProducts, useCategories } from "@/hooks/use-products"
import { useCart } from "@/hooks/use-cart"
import type { Product, ProductVariant, FilterOptions } from "@/types"

export default function ProductsPage() {
  const { addItem } = useCart()
  const { categories } = useCategories()
  
  const [filters, setFilters] = useState<FilterOptions>({
    categories: [],
    colors: [],
    sizes: [],
    priceRange: [0, Infinity],
    sortBy: "newest"
  })
  
  const [favorites, setFavorites] = useState<string[]>([])

  // Convert filter format for API
  const apiFilters = {
    category: filters.categories[0], // For now, just use first category
    sortBy: filters.sortBy === 'newest' ? 'created_at' : 
           filters.sortBy === 'name' ? 'name' : 
           filters.sortBy.includes('price') ? 'price' : 'created_at',
    sortOrder: filters.sortBy === 'price-high' ? 'desc' as const : 'asc' as const
  }

  const { products, loading, error, hasMore, loadMore } = useProducts(apiFilters)

  // Get available colors and sizes from loaded products
  const availableColors = Array.from(new Set(
    products.flatMap(p => p.variants?.map(v => v.color).filter(Boolean) || [])
  ))
  
  const availableSizes = Array.from(new Set(
    products.flatMap(p => p.variants?.map(v => v.size).filter(Boolean) || [])
  ))

  const handleAddToCart = (product: Product, variant: ProductVariant) => {
    addItem(product, variant, 1)
  }

  const handleToggleFavorite = (productId: string) => {
    setFavorites(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-destructive mb-4">
              Error Loading Products
            </h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <ProductFilters
              filters={filters}
              onFiltersChange={setFilters}
              categories={categories}
              availableColors={availableColors}
              availableSizes={availableSizes}
              priceRange={[0, 100]}
              compact={true}
            />
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="mb-6">
              <h1 className="text-3xl font-display font-bold mb-2">
                All Products
              </h1>
              <p className="text-muted-foreground">
                Discover our complete collection of British Army themed apparel
              </p>
            </div>

            {loading && products.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
                <span className="ml-3">Loading products...</span>
              </div>
            ) : (
              <ProductGrid
                products={products}
                onAddToCart={handleAddToCart}
                onToggleFavorite={handleToggleFavorite}
                favoriteProducts={favorites}
                filters={filters}
                hasMore={hasMore}
                onLoadMore={loadMore}
                loadingMore={loading}
                columns={{
                  mobile: 1,
                  tablet: 2,
                  desktop: 3
                }}
              />
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}