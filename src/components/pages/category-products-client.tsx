"use client"

import { Filter, SortAsc } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductGrid } from "@/components/product/product-grid"
import { EmptyProductGrid, ProductGridSkeleton } from "@/components/ui"
import { useProducts } from "@/hooks/use-products"
import { cn } from "@/lib/utils"

interface CategoryProductsClientProps {
  categorySlug: string
  categoryName: string
}

export function CategoryProductsClient({ categorySlug, categoryName }: CategoryProductsClientProps) {
  // Use the products hook to fetch real data
  const { products, loading, error } = useProducts({
    category: categorySlug,
    limit: 20
  })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Filters Sidebar */}
      <aside className="lg:col-span-1">
        <div className="sticky top-24">
          <h3 className={cn(
            "text-lg font-display font-semibold text-foreground mb-4",
            "tracking-wide uppercase"
          )}>
            Filter Products
          </h3>
          
          {/* TODO: Replace with actual ProductFilters component when connected to data */}
          <div className={cn(
            "bg-card border-2 border-border p-4",
            "rounded-none" // Sharp military styling
          )}>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Filter className="h-4 w-4" />
                <span className="text-sm">Filters will appear here when products are loaded</span>
              </div>
              
              <div className="flex items-center gap-2 text-muted-foreground">
                <SortAsc className="h-4 w-4" />
                <span className="text-sm">Sorting options available soon</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Products Grid */}
      <main className="lg:col-span-3">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {categoryName} Products
            </h2>
            <p className="text-sm text-muted-foreground">
              {loading ? "Loading..." : products.length === 0 ? "No products available" : `${products.length} products found`}
            </p>
          </div>
          
          {/* Sort Dropdown - TODO: Make functional */}
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-none border-2"
            disabled
          >
            <SortAsc className="h-4 w-4 mr-2" />
            Sort By
          </Button>
        </div>

        {/* Products Display */}
        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg mb-6">
              Something went wrong: {error}
            </p>
            <Button onClick={() => window.location.reload()} className="rounded-none">
              Try Again
            </Button>
          </div>
        ) : products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <EmptyProductGrid 
            category={categoryName}
          />
        )}
      </main>
    </div>
  )
}