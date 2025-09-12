"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product/product-card"
import { ArrowRight, Loader2 } from "lucide-react"
import { motion } from "framer-motion"

interface Product {
  id: string
  name: string
  slug: string
  description?: string
  price: number
  main_image_url: string
  category_id: string
  variants: {
    id: string
    size: string
    color: string
    stock_quantity: number
    price: number
    sku: string
  }[]
  rating?: number
  review_count?: number
  created_at: string
}

export function LatestArrivals() {
  const [products, setProducts] = React.useState<Product[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchLatestProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/products?limit=6&sort=newest', {
          credentials: 'include'
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch products')
        }
        
        const data = await response.json()
        
        if (data.success && Array.isArray(data.products)) {
          setProducts(data.products.slice(0, 6)) // Ensure we only show 6 products
        } else {
          throw new Error('Invalid response format')
        }
        
      } catch (error) {
        console.error('Error fetching latest products:', error)
        setError('Failed to load latest arrivals')
      } finally {
        setLoading(false)
      }
    }

    fetchLatestProducts()
  }, [])

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <motion.h2 
            className="text-3xl font-display font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Latest Arrivals
          </motion.h2>
          <motion.p 
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Discover our newest military-themed apparel and accessories
          </motion.p>
        </div>
        
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading latest arrivals...</span>
          </div>
        )}
        
        {error && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        )}
        
        {!loading && !error && products.length > 0 && (
          <>
            {/* Product Grid - Consistent with product listing pages */}
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.6, 
                    delay: 0.3 + (index * 0.1) // Stagger animation
                  }}
                >
                  <ProductCard
                    product={product}
                    variant="default"
                    className="h-full"
                  />
                </motion.div>
              ))}
            </motion.div>
            
            {/* CTA Button */}
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <Button 
                size="lg" 
                className="font-display font-bold uppercase tracking-wide px-8 py-3 rounded-none border-2 border-primary hover:border-primary/80 transition-all duration-300 group" 
                asChild
              >
                <Link href="/products">
                  <span className="relative z-10">View All Products</span>
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </motion.div>
          </>
        )}
        
        {!loading && !error && products.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-4">No Products Available</h3>
            <p className="text-muted-foreground mb-6">
              We're working hard to stock our barracks. Check back soon!
            </p>
            <Button asChild>
              <Link href="/products">Browse All Categories</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}