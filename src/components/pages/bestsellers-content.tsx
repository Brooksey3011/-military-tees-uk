"use client"

import { Layout } from "@/components/layout/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProductGrid } from "@/components/product/product-grid"
import { LoadingState, ErrorDisplay } from "@/components/ui"
import { useProducts } from "@/hooks/use-products"
import Link from "next/link"

export default function BestsellersContent() {
  const { products, loading, error } = useProducts({
    featured: true,
    limit: 6,
    sortBy: 'created_at',
    sortOrder: 'desc'
  })

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen">
          <div className="container mx-auto px-4 py-16">
            <LoadingState />
          </div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen">
          <div className="container mx-auto px-4 py-16">
            <ErrorDisplay 
              message="Failed to load bestsellers. Please try again."
              onRetry={() => window.location.reload()}
            />
          </div>
        </div>
      </Layout>
    )
  }
  return (
    <Layout>
      <div className="min-h-screen">
        {/* Header Section */}
        <section className="bg-gradient-to-b from-muted/20 to-background py-16 border-b-2 border-border">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <Badge className="rounded-none bg-gold-600 text-white mb-4">
                🏆 TOP PERFORMERS
              </Badge>
              <h1 className="text-4xl md:text-5xl font-display font-bold tracking-wider uppercase text-foreground mb-4">
                Bestsellers
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Our most popular military-themed designs. Proven favorites that have earned their stripes with customers across the UK.
              </p>
            </div>
            
            {/* Featured Collection Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-muted/30 p-6 border-2 border-border">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">Premium</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wide">Quality Materials</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">UK Made</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wide">British Crafted</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">Military</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wide">Heritage Inspired</div>
              </div>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <ProductGrid products={products} />
            
            {products.length === 0 && (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg mb-6">
                  No bestsellers available at the moment. Check back soon!
                </p>
                <Link href="/products">
                  <Button size="lg" className="rounded-none">
                    Browse All Products
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Featured Collection Benefits */}
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-display font-bold text-center mb-12">
              Our Featured Collection
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl mb-4">🎨</div>
                <h3 className="text-xl font-display font-bold mb-2">Authentic Designs</h3>
                <p className="text-muted-foreground">
                  Military heritage-inspired designs created with respect for service and tradition.
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">🏭</div>
                <h3 className="text-xl font-display font-bold mb-2">UK Crafted</h3>
                <p className="text-muted-foreground">
                  Designed and crafted in Britain with premium materials and attention to detail.
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">💪</div>
                <h3 className="text-xl font-display font-bold mb-2">Premium Quality</h3>
                <p className="text-muted-foreground">
                  High-quality materials and printing that honor military standards of excellence.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-gradient-to-r from-primary to-secondary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-display font-bold mb-4">
              Start Your Military Heritage Collection
            </h2>
            <p className="text-xl opacity-90 mb-8">
              Discover premium military-inspired apparel crafted with pride and tradition
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="secondary" 
                size="lg"
                className="bg-background text-foreground hover:bg-background/90 rounded-none"
                asChild
              >
                <Link href="/categories">
                  Explore All Products
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="bg-transparent border-2 border-background text-background hover:bg-background hover:text-foreground rounded-none"
                asChild
              >
                <Link href="/new-arrivals">
                  See New Arrivals
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
}