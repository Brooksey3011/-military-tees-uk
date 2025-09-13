"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ProductCard } from "./product-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useProgressiveLoading } from "@/hooks/use-progressive-loading"
import { cn } from "@/lib/utils"
import type { Product, ProductVariant, FilterOptions } from "@/types"
import { Loader2, Package } from "lucide-react"

interface ProductGridProps {
  products: Product[]
  loading?: boolean
  onQuickView?: (product: Product) => void
  onAddToCart?: (product: Product, variant: ProductVariant) => void
  onToggleFavorite?: (productId: string) => void
  favoriteProducts?: string[]
  filters?: FilterOptions
  onLoadMore?: () => void
  hasMore?: boolean
  loadingMore?: boolean
  className?: string
  variant?: "default" | "compact" | "featured"
  columns?: {
    mobile: 1 | 2
    tablet: 2 | 3
    desktop: 3 | 4 | 5
  }
  // Progressive loading options
  progressiveLoading?: {
    enabled: boolean
    initialLoad?: number
    loadIncrement?: number
    showProgress?: boolean
  }
  view?: 'grid' | 'list'
}

const defaultColumns = {
  mobile: 1 as const,
  tablet: 2 as const,
  desktop: 4 as const,
}

const gridClasses = {
  mobile: {
    1: "grid-cols-1",
    2: "grid-cols-2",
  },
  tablet: {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-3",
  },
  desktop: {
    3: "lg:grid-cols-3",
    4: "lg:grid-cols-4", 
    5: "lg:grid-cols-5",
  },
}

export function ProductGrid({
  products,
  loading = false,
  onQuickView,
  onAddToCart,
  onToggleFavorite,
  favoriteProducts = [],
  filters,
  onLoadMore,
  hasMore = false,
  loadingMore = false,
  className,
  variant = "default",
  columns = defaultColumns,
  progressiveLoading,
  view = 'grid'
}: ProductGridProps) {
  const [filteredProducts, setFilteredProducts] = React.useState<Product[]>(products)
  
  // Progressive loading setup
  const {
    visibleItems,
    loadMoreRef,
    isLoading: progressiveLoading_isLoading,
    hasMore: progressiveHasMore,
    loadedCount,
    totalCount,
    loadProgress
  } = useProgressiveLoading(filteredProducts, progressiveLoading?.enabled ? {
    initialLoad: progressiveLoading.initialLoad || 12,
    loadIncrement: progressiveLoading.loadIncrement || 8,
    threshold: 0.1,
    rootMargin: '150px'
  } : {
    initialLoad: filteredProducts.length, // Show all if progressive loading disabled
    loadIncrement: 0
  })

  const displayProducts = progressiveLoading?.enabled ? visibleItems : filteredProducts

  // Apply filters
  React.useEffect(() => {
    let filtered = [...products]

    if (filters) {
      // Filter by categories
      if (filters.categories.length > 0) {
        filtered = filtered.filter(product => 
          product.category && filters.categories.includes(product.category.slug)
        )
      }

      // Filter by colors
      if (filters.colors.length > 0) {
        filtered = filtered.filter(product =>
          product.variants?.some(variant =>
            variant.color && filters.colors.includes(variant.color.toLowerCase())
          )
        )
      }

      // Filter by sizes
      if (filters.sizes.length > 0) {
        filtered = filtered.filter(product =>
          product.variants?.some(variant =>
            variant.size && filters.sizes.includes(variant.size)
          )
        )
      }

      // Filter by price range
      const [minPrice, maxPrice] = filters.priceRange
      if (minPrice > 0 || maxPrice < Infinity) {
        filtered = filtered.filter(product =>
          product.price >= minPrice && product.price <= maxPrice
        )
      }

      // Sort products
      switch (filters.sortBy) {
        case 'price-low':
          filtered.sort((a, b) => a.price - b.price)
          break
        case 'price-high':
          filtered.sort((a, b) => b.price - a.price)
          break
        case 'name':
          filtered.sort((a, b) => a.name.localeCompare(b.name))
          break
        case 'newest':
          filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          break
        case 'rating':
          filtered.sort((a, b) => {
            const avgRatingA = a.reviews?.length 
              ? a.reviews.reduce((sum, r) => sum + r.rating, 0) / a.reviews.length 
              : 0
            const avgRatingB = b.reviews?.length 
              ? b.reviews.reduce((sum, r) => sum + r.rating, 0) / b.reviews.length 
              : 0
            return avgRatingB - avgRatingA
          })
          break
        default:
          break
      }
    }

    setFilteredProducts(filtered)
  }, [products, filters])

  const gridClassName = cn(
    "grid gap-6",
    gridClasses.mobile[columns.mobile],
    gridClasses.tablet[columns.tablet],
    gridClasses.desktop[columns.desktop],
    className
  )

  if (loading) {
    return <ProductGridSkeleton columns={columns} />
  }

  if (filteredProducts.length === 0) {
    return <EmptyState filters={filters} />
  }

  return (
    <div className="space-y-6">
      {/* Progressive Loading Progress */}
      {progressiveLoading?.enabled && progressiveLoading.showProgress && totalCount > (progressiveLoading.initialLoad || 12) && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {loadedCount} of {totalCount} products
          </span>
          <div className="flex items-center space-x-2">
            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300 ease-out"
                style={{ width: `${loadProgress}%` }}
              />
            </div>
            <span className="font-medium">
              {Math.round(loadProgress)}%
            </span>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {progressiveLoading?.enabled ? loadedCount : filteredProducts.length} of {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
          </span>
          {filters && (
            <div className="flex gap-1">
              {filters.categories.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {filters.categories.length} category filter{filters.categories.length !== 1 ? 's' : ''}
                </Badge>
              )}
              {filters.colors.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {filters.colors.length} color filter{filters.colors.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Product Grid */}
      <motion.div 
        className={gridClassName}
        layout
      >
        <AnimatePresence>
          {displayProducts.map((product, index) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ 
                duration: 0.3,
                delay: index * 0.05 // Stagger animation
              }}
            >
              <ProductCard
                product={product}
                variant={variant}
                onQuickView={onQuickView}
                onAddToCart={onAddToCart}
                onToggleFavorite={onToggleFavorite}
                isFavorite={favoriteProducts.includes(product.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Progressive Loading Trigger */}
      {progressiveLoading?.enabled && progressiveHasMore && (
        <div 
          ref={loadMoreRef}
          className="flex items-center justify-center py-8"
        >
          {progressiveLoading_isLoading ? (
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading more products...</span>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">
              Scroll down to load more
            </div>
          )}
        </div>
      )}

      {/* End of Progressive Loading */}
      {progressiveLoading?.enabled && !progressiveHasMore && loadedCount === totalCount && totalCount > (progressiveLoading.initialLoad || 12) && (
        <div className="text-center py-8 border-t border-border/50">
          <p className="text-sm text-muted-foreground">
            You've seen all {totalCount} products
          </p>
        </div>
      )}

      {/* Legacy Load More Button (when progressive loading is disabled) */}
      {!progressiveLoading?.enabled && hasMore && (
        <div className="flex justify-center pt-8">
          <Button
            variant="outline"
            size="lg"
            onClick={onLoadMore}
            disabled={loadingMore}
            className="min-w-32"
          >
            {loadingMore ? "Loading..." : "Load More Products"}
          </Button>
        </div>
      )}

      {/* Loading More Indicator */}
      {loadingMore && (
        <div className="grid gap-6 mt-6" style={{ gridTemplateColumns: `repeat(${columns.desktop}, 1fr)` }}>
          {[...Array(4)].map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      )}
    </div>
  )
}

// Skeleton Components
function ProductGridSkeleton({ columns }: { columns: ProductGridProps['columns'] }) {
  return (
    <div className={cn(
      "grid gap-6",
      gridClasses.mobile[columns?.mobile || 1],
      gridClasses.tablet[columns?.tablet || 2],
      gridClasses.desktop[columns?.desktop || 4]
    )}>
      {[...Array(8)].map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

function ProductCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-square w-full rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  )
}

// Empty State Component
function EmptyState({ filters }: { filters?: FilterOptions }) {
  const hasFilters = filters && (
    filters.categories.length > 0 ||
    filters.colors.length > 0 ||
    filters.sizes.length > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < Infinity
  )

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-6xl mb-4">🎯</div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {hasFilters ? "No products match your filters" : "No products found"}
      </h3>
      <p className="text-muted-foreground max-w-md">
        {hasFilters 
          ? "Try adjusting your search criteria or browse all products to find what you're looking for."
          : "We're working hard to stock our barracks. Check back soon for new arrivals!"
        }
      </p>
      {hasFilters && (
        <Button variant="outline" className="mt-4">
          Clear All Filters
        </Button>
      )}
    </div>
  )
}