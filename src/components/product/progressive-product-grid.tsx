"use client"

import * as React from "react"
import { ProductCard } from "@/components/product/product-card"
import { ProductViewToggle } from "@/components/ui/product-view-toggle"
import { useProductView } from "@/hooks/use-product-view"
import { useProgressiveLoading } from "@/hooks/use-progressive-loading"
import { cn } from "@/lib/utils"
import { Loader2, Package } from "lucide-react"

interface Product {
  id: string
  name: string
  slug: string
  price: number
  main_image_url?: string | null
  category?: {
    id: string
    name: string
    slug: string
  } | null
  variants?: Array<{
    id: string
    color?: string
    size?: string
    stock_quantity?: number
  }>
  is_featured?: boolean
  created_at?: string
  updated_at?: string
  is_active?: boolean
  description?: string | null
  stock_quantity?: number
  sku?: string
  category_id?: string
}

interface ProgressiveProductGridProps {
  products: Product[]
  className?: string
  initialLoad?: number
  loadIncrement?: number
  showProgress?: boolean
  emptyStateMessage?: string
  emptyStateDescription?: string
}

export function ProgressiveProductGrid({
  products,
  className,
  initialLoad = 12,
  loadIncrement = 8,
  showProgress = true,
  emptyStateMessage = "No products found",
  emptyStateDescription = "Try adjusting your search or filters"
}: ProgressiveProductGridProps) {
  const { view } = useProductView()
  
  const {
    visibleItems,
    loadMoreRef,
    isLoading,
    hasMore,
    loadedCount,
    totalCount,
    loadProgress
  } = useProgressiveLoading(products, {
    initialLoad,
    loadIncrement,
    threshold: 0.1,
    rootMargin: '200px' // Start loading when 200px away from viewport
  })

  // Empty state
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <Package className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {emptyStateMessage}
        </h3>
        <p className="text-muted-foreground max-w-md">
          {emptyStateDescription}
        </p>
      </div>
    )
  }

  const gridClasses = cn(
    "grid gap-6",
    view === 'grid' 
      ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" 
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    className
  )

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      {showProgress && totalCount > initialLoad && (
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

      {/* Product Grid */}
      <div className={gridClasses}>
        {visibleItems.map((product, index) => (
          <div
            key={product.id}
            className={cn(
              "transform transition-all duration-300 ease-out",
              "animate-in fade-in slide-in-from-bottom-4"
            )}
            style={{
              animationDelay: `${(index % loadIncrement) * 50}ms`,
              animationFillMode: 'both'
            }}
          >
            <ProductCard
              product={product}
              priority={index < 4} // Prioritize loading for first 4 images
              className="h-full"
            />
          </div>
        ))}
      </div>

      {/* Loading More Indicator */}
      {hasMore && (
        <div 
          ref={loadMoreRef}
          className="flex items-center justify-center py-8"
        >
          {isLoading ? (
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

      {/* End of Results */}
      {!hasMore && loadedCount === totalCount && totalCount > initialLoad && (
        <div className="text-center py-8 border-t border-border/50">
          <p className="text-sm text-muted-foreground">
            You've seen all {totalCount} products
          </p>
        </div>
      )}
    </div>
  )
}

// Enhanced version with virtual scrolling for very large lists
export function VirtualizedProductGrid({
  products,
  className,
  itemHeight = 400,
  containerHeight = 600,
  ...props
}: ProgressiveProductGridProps & {
  itemHeight?: number
  containerHeight?: number
}) {
  const [scrollTop, setScrollTop] = React.useState(0)
  const { view } = useProductView()
  
  const itemsPerRow = view === 'grid' ? 4 : 3
  const rowHeight = itemHeight + 24 // Add gap
  const totalRows = Math.ceil(products.length / itemsPerRow)
  const visibleRows = Math.ceil(containerHeight / rowHeight) + 2 // Buffer rows
  
  const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - 1)
  const endRow = Math.min(totalRows, startRow + visibleRows)
  
  const visibleItems = products.slice(
    startRow * itemsPerRow,
    endRow * itemsPerRow
  )

  const handleScroll = React.useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  return (
    <div className="space-y-4">
      <div 
        className="overflow-auto border border-border/50 rounded-lg"
        style={{ height: containerHeight }}
        onScroll={handleScroll}
      >
        <div style={{ height: totalRows * rowHeight, position: 'relative' }}>
          <div 
            style={{ 
              transform: `translateY(${startRow * rowHeight}px)`,
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0
            }}
          >
            <div className={cn(
              "grid gap-6 p-6",
              view === 'grid' 
                ? "grid-cols-4" 
                : "grid-cols-3",
              className
            )}>
              {visibleItems.map((product) => (
                <div key={product.id} style={{ height: itemHeight }}>
                  <ProductCard product={product} className="h-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}