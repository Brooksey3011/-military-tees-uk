"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ProductGrid } from "@/components/product/product-grid"
import { LoadingState, ErrorDisplay } from "@/components/ui"
import { useProducts } from "@/hooks/use-products"
import Link from "next/link"

export function NewArrivalsContent() {
  const { products, loading, error } = useProducts({
    featured: true,
    limit: 12
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <LoadingState />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <ErrorDisplay 
            message="Failed to load new arrivals. Please try again."
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="border-b-2 border-border bg-muted/10">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-4 border-primary text-primary font-display tracking-wider">
              LATEST ARRIVALS
            </Badge>
            
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4 tracking-wider uppercase">
              Fresh From The Armoury
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed">
              Discover our newest military-themed apparel. Premium designs honoring service and tradition.
            </p>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="container mx-auto px-4 py-16">
        <ProductGrid products={products} />
        
        {products.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg mb-6">
              No new arrivals at the moment. Check back soon for fresh stock!
            </p>
            <Link href="/products">
              <Button size="lg" className="rounded-none">
                Browse All Products
              </Button>
            </Link>
          </div>
        )}
      </section>
    </div>
  )
}