"use client"

import { ProductGrid } from "@/components/product/product-grid"
import { ProductGridSkeleton } from "@/components/ui"
import { useProducts } from "@/hooks/use-products"
import { Button } from "@/components/ui/button"

export function BestsellersClient() {
  const { products, loading, error } = useProducts({
    featured: true,
    limit: 6,
    sortBy: 'created_at',
    sortOrder: 'desc'
  })

  if (loading) {
    return <ProductGridSkeleton count={6} />
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground text-lg mb-6">
          Failed to load bestsellers: {error}
        </p>
        <Button onClick={() => window.location.reload()} className="rounded-none">
          Try Again
        </Button>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground text-lg">
          No bestsellers available at the moment.
        </p>
      </div>
    )
  }

  return <ProductGrid products={products} />
}