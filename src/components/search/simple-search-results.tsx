"use client"

import * as React from "react"
import { Search, Filter, Grid, List, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ProductGrid } from "@/components/product/product-grid"
import { ProductViewToggle } from "@/components/ui/product-view-toggle"
import { useProductView } from "@/hooks/use-product-view"
import { useSimpleSearch } from "@/hooks/use-simple-search"
import { cn } from "@/lib/utils"
import Link from "next/link"
import Image from "next/image"

interface SimpleSearchResultsProps {
  query?: string
  category?: string
  className?: string
}

export function SimpleSearchResults({
  query: initialQuery = "",
  category: initialCategory,
  className
}: SimpleSearchResultsProps) {
  const [query, setQuery] = React.useState(initialQuery)
  const [category, setCategory] = React.useState(initialCategory)
  const { view } = useProductView()
  
  const {
    results,
    total,
    isLoading,
    error,
    hasMore,
    search,
    clear
  } = useSimpleSearch()

  // Search when query or category changes
  React.useEffect(() => {
    if (query.trim() || category) {
      search(query, { category })
    } else {
      clear()
    }
  }, [query, category, search, clear])

  // Update query when initialQuery changes (from URL params)
  React.useEffect(() => {
    setQuery(initialQuery)
  }, [initialQuery])

  // Update category when initialCategory changes
  React.useEffect(() => {
    setCategory(initialCategory)
  }, [initialCategory])

  // Convert our search results to the format expected by ProductGrid
  const gridProducts = results.map(product => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    main_image_url: product.main_image_url || '/placeholder-product.jpg',
    category: product.category,
    variants: product.variants || [],
    is_featured: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_active: true,
    description: product.description,
    stock_quantity: 0,
    sku: '',
    category_id: product.category?.id || ''
  }))

  if (error) {
    return (
      <div className={cn("container mx-auto px-4 py-8", className)}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Search Error</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("container mx-auto px-4 py-8", className)}>
      {/* Search Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            {query ? `Search Results for "${query}"` : category ? `Category: ${category}` : 'Search Results'}
          </h1>
          {isLoading ? (
            <p className="text-muted-foreground mt-1">Searching...</p>
          ) : (
            <p className="text-muted-foreground mt-1">
              {total === 0 
                ? 'No products found' 
                : `${total} product${total !== 1 ? 's' : ''} found`
              }
            </p>
          )}
        </div>

        {results.length > 0 && (
          <div className="flex items-center space-x-4">
            <ProductViewToggle />
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Searching products...</p>
          </div>
        </div>
      )}

      {/* No Results */}
      {!isLoading && total === 0 && (query || category) && (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search terms or browse our categories.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge variant="secondary" asChild>
                <Link href="/categories/british-army">British Army</Link>
              </Badge>
              <Badge variant="secondary" asChild>
                <Link href="/categories/royal-navy">Royal Navy</Link>
              </Badge>
              <Badge variant="secondary" asChild>
                <Link href="/categories/royal-air-force">RAF</Link>
              </Badge>
              <Badge variant="secondary" asChild>
                <Link href="/veterans">Veterans</Link>
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Results Grid */}
      {!isLoading && results.length > 0 && (
        <div className="space-y-6">
          <ProductGrid 
            products={gridProducts}
            view={view}
            className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          />
          
          {/* Load More */}
          {hasMore && (
            <div className="text-center pt-6">
              <Button variant="outline" onClick={() => search(query, { category }, Math.floor(results.length / 20) + 2)}>
                Load More Products
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Empty State - No search query */}
      {!isLoading && !query && !category && (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Start your search</h3>
            <p className="text-muted-foreground mb-4">
              Enter a search term above to find military-themed apparel and accessories.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge variant="secondary">Military</Badge>
              <Badge variant="secondary">British Army</Badge>
              <Badge variant="secondary">Royal Navy</Badge>
              <Badge variant="secondary">RAF</Badge>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}