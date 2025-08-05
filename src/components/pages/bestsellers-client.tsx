"use client"

import { ProductGrid } from "@/components/product/product-grid"
import { ProductGridSkeleton } from "@/components/ui"
import { useProducts } from "@/hooks/use-products"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export function BestsellersClient() {
  const [isClient, setIsClient] = useState(false)
  const { products, loading, error } = useProducts({
    featured: true,
    limit: 6,
    sortBy: 'created_at',
    sortOrder: 'desc'
  })

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Show skeleton until client-side hydration is complete
  if (!isClient || loading) {
    return <ProductGridSkeleton count={6} />
  }

  if (error) {
    console.error('Bestsellers error:', error)
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground text-lg mb-6">
          Unable to load bestsellers at the moment.
        </p>
        <Button onClick={() => window.location.reload()} className="rounded-none">
          Refresh Page
        </Button>
      </div>
    )
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground text-lg">
          No bestsellers available right now.
        </p>
      </div>
    )
  }

  return (
    <div suppressHydrationWarning>
      <ProductGrid products={products} />
    </div>
  )
}