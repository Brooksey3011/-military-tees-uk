"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { formatPrice } from "@/lib/utils"

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
        
        {/* Larger Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => {
            const displayPrice = product.price
            const hasStock = product.variants?.some(v => v.stock_quantity > 0) ?? true
            
            return (
              <div key={product.id} className="group bg-background border border-border/50 hover:border-primary transition-all duration-300 hover:shadow-lg">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Link href={`/products/${product.slug}`}>
                    <Image
                      src={product.main_image_url || '/placeholder-product.jpg'}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </Link>
                  
                  {!hasStock && (
                    <div className="absolute top-3 left-3">
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded font-medium">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-6 space-y-4">
                  <Link href={`/products/${product.slug}`}>
                    <h3 className="font-display font-bold text-lg uppercase tracking-wide hover:text-primary transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>
                  
                  {product.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xl font-bold text-primary">
                      {formatPrice ? formatPrice(displayPrice) : `£${displayPrice.toFixed(2)}`}
                    </div>
                  </div>
                  
                  <Link href={`/products/${product.slug}`} className="block">
                    <Button
                      className={`w-full font-bold uppercase tracking-wide ${
                        hasStock 
                          ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                          : 'bg-gray-400 cursor-not-allowed text-white'
                      }`}
                      disabled={!hasStock}
                    >
                      {hasStock ? 'View Product' : 'Out of Stock'}
                    </Button>
                  </Link>
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