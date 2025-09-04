"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AddToCartButton } from "@/components/cart/add-to-cart-button"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { ArrowRight } from "lucide-react"

interface Product {
  id: string
  name: string
  slug: string
  description?: string
  price: number
  sale_price?: number
  main_image_url: string
  category_id: string
  variants?: Array<{
    id: string
    size: string
    color: string
    stock_quantity: number
    sku: string
    price: number
  }>
}

export function LatestArrivals() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

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
  }, [mounted])

  const formatPrice = (price: number) => `£${price.toFixed(2)}`

  if (!mounted || loading) {
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
        
        {/* Larger Product Cards Grid - Matching Site Design */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => {
            const displayPrice = product.sale_price || product.price

            return (
              <div key={product.id} className="group border-2 border-border rounded-none bg-background hover:border-primary transition-colors">
                <div className="relative aspect-square overflow-hidden">
                  <Link href={`/products/${product.slug}`}>
                    <OptimizedImage
                      src={product.main_image_url}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>
                  
                  {product.sale_price && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-red-600 text-white rounded-none">SALE</Badge>
                    </div>
                  )}
                </div>
                
                <div className="p-6 space-y-4">
                  <div>
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="font-display font-bold text-base uppercase tracking-wide group-hover:text-primary transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {product.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xl">{formatPrice(displayPrice)}</span>
                        {product.sale_price && (
                          <span className="text-base text-muted-foreground line-through">
                            {formatPrice(product.price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <AddToCartButton
                      productId={product.id}
                      variantId={product.id}
                      name={product.name}
                      price={displayPrice}
                      image={product.main_image_url}
                      size="One Size"
                      color="Standard"
                      maxQuantity={10}
                      className="w-full rounded-none text-sm"
                      buttonSize="default"
                      showIcon={true}
                    />
                  </div>
                </div>
              </div>
            )
          })}
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