"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ProductCard } from "@/components/product/product-card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

interface Product {
  id: string
  name: string
  slug: string
  description?: string
  price: number
  main_image_url: string
  category_id: string
  variants: Array<{
    id: string
    size: string
    color: string
    stock_quantity: number
    sku: string
    price: number
  }>
  rating?: number
  review_count?: number
}

export function LatestArrivals() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLatestProducts() {
      try {
        const response = await fetch('/api/products?limit=6&sort=created_at&order=desc')
        if (response.ok) {
          const data = await response.json()
          setProducts(data.products || [])
        }
      } catch (error) {
        console.error('Failed to fetch latest products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLatestProducts()
  }, [])

  if (loading) {
    return (
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground tracking-wider uppercase">
              Latest Arrivals
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-muted/20 h-96 animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (!products.length) {
    return null
  }

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header - Left Aligned */}
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground tracking-wider uppercase">
            Latest Arrivals
          </h2>
          <Button 
            variant="ghost" 
            className="text-primary hover:text-primary/90 font-medium group"
            asChild
          >
            <Link href="/new-arrivals" className="flex items-center gap-2">
              View All
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
        
        {/* Larger Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div key={product.id} className="transform transition-all duration-300">
              <ProductCard 
                product={product}
                variant="featured"
                className="h-full"
              />
            </div>
          ))}
        </div>
        
        {/* Call to Action */}
        <div className="text-center mt-12">
          <Button 
            size="lg"
            className="font-bold uppercase tracking-wide px-8 py-3"
            asChild
          >
            <Link href="/products">
              Shop All Products
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}