"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Filter, SortAsc, ShoppingCart, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AddToCartButton } from "@/components/cart/add-to-cart-button"
import { cn } from "@/lib/utils"
import { OptimizedImage } from "@/components/ui/optimized-image"

interface Product {
  id: string
  name: string
  price: number
  sale_price?: number
  main_image_url: string
  description: string
  slug: string
  category?: {
    name: string
    slug: string
  }
}

export function RoyalAirForceProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<string>('name')
  const [priceFilter, setPriceFilter] = useState<string>('all')

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true)
        
        // Fetch products from aviation-related categories
        const aviationCategories = ['signals', 'training-wing', 'ops-room', 'ranges', 'armoury']
        const responses = await Promise.all(
          aviationCategories.map(cat => 
            fetch(`/api/products?category=${cat}&limit=50`)
              .then(res => res.ok ? res.json() : { products: [] })
          )
        )
        
        const allProducts = responses.flatMap(data => data.products || [])
        
        // Remove duplicates and filter for aviation/air force themed products
        const uniqueProducts = allProducts
          .filter((product, index, self) => 
            index === self.findIndex(p => p.id === product.id)
          )
          .filter(product => 
            product.name.toLowerCase().includes('air') ||
            product.name.toLowerCase().includes('raf') ||
            product.name.toLowerCase().includes('pilot') ||
            product.name.toLowerCase().includes('squadron') ||
            product.name.toLowerCase().includes('aviation') ||
            product.name.toLowerCase().includes('flight') ||
            product.description.toLowerCase().includes('air') ||
            product.description.toLowerCase().includes('sky') ||
            product.description.toLowerCase().includes('aviation')
          )
        
        setProducts(uniqueProducts)
      } catch (err) {
        console.error('Error fetching Royal Air Force products:', err)
        setError(err instanceof Error ? err.message : 'Failed to load products')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Sort products based on selected option
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return (a.sale_price || a.price) - (b.sale_price || b.price)
      case 'price-high':
        return (b.sale_price || b.price) - (a.sale_price || a.price)
      case 'name':
      default:
        return a.name.localeCompare(b.name)
    }
  })

  // Filter products by price range
  const filteredProducts = sortedProducts.filter(product => {
    const price = product.sale_price || product.price
    switch (priceFilter) {
      case 'under-20':
        return price < 20
      case '20-30':
        return price >= 20 && price <= 30
      case '30-40':
        return price >= 30 && price <= 40
      case 'over-40':
        return price > 40
      default:
        return true
    }
  })

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar Skeleton */}
        <aside className="lg:col-span-1">
          <div className="bg-muted/20 h-64 rounded-none animate-pulse border border-border"></div>
        </aside>

        {/* Products Grid Skeleton */}
        <main className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-muted/20 h-96 rounded-none animate-pulse border border-border"></div>
            ))}
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-display font-bold mb-4 tracking-wide uppercase">Unable to Load Products</h2>
        <p className="text-muted-foreground mb-6">Error: {error}</p>
        <Button 
          onClick={() => window.location.reload()}
          className="rounded-none font-display font-bold tracking-wide uppercase"
        >
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Filters Sidebar */}
      <aside className="lg:col-span-1">
        <div className="sticky top-24">
          <div className="border-2 border-border rounded-none bg-background p-6">
            <h3 className="text-lg font-display font-bold mb-6 tracking-wide uppercase flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              Filter Products
            </h3>
            
            {/* Sort Options */}
            <div className="mb-6">
              <h4 className="font-semibold mb-3 text-foreground">Sort By</h4>
              <div className="space-y-2">
                {[
                  { value: 'name', label: 'Name A-Z' },
                  { value: 'price-low', label: 'Price: Low to High' },
                  { value: 'price-high', label: 'Price: High to Low' }
                ].map(option => (
                  <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="sort"
                      value={option.value}
                      checked={sortBy === option.value}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-muted-foreground">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="mb-6">
              <h4 className="font-semibold mb-3 text-foreground">Price Range</h4>
              <div className="space-y-2">
                {[
                  { value: 'all', label: 'All Prices' },
                  { value: 'under-20', label: 'Under £20' },
                  { value: '20-30', label: '£20 - £30' },
                  { value: '30-40', label: '£30 - £40' },
                  { value: 'over-40', label: 'Over £40' }
                ].map(option => (
                  <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="price"
                      value={option.value}
                      checked={priceFilter === option.value}
                      onChange={(e) => setPriceFilter(e.target.value)}
                      className="text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-muted-foreground">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Product Count */}
            <div className="pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline" className="rounded-none">
                  {filteredProducts.length}
                </Badge>
                <span>products available</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Products Grid */}
      <main className="lg:col-span-3">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-display font-bold tracking-wide uppercase text-foreground">
              Royal Air Force Collection
            </h2>
            <p className="text-sm text-muted-foreground">
              {filteredProducts.length === 0 ? "No products match your filters" : `${filteredProducts.length} products found`}
            </p>
          </div>
        </div>

        {/* Products Display */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className={cn(
                "bg-background border-2 border-border rounded-none",
                "hover:border-primary hover:shadow-lg transition-all duration-200",
                "group"
              )}>
                <Link href={`/products/${product.slug}`} className="block">
                  {/* Product Image */}
                  <div className="aspect-square relative bg-muted/20">
                    <OptimizedImage
                      src={product.main_image_url || '/placeholder-product.jpg'}
                      alt={product.name}
                      width={400}
                      height={400}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.sale_price && (
                      <div className="absolute top-3 right-3">
                        <Badge className="rounded-none bg-red-600 text-white font-bold">
                          SALE
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <div className="mb-2">
                      {product.category && (
                        <Badge variant="outline" className="rounded-none text-xs mb-2">
                          {product.category.name}
                        </Badge>
                      )}
                    </div>
                    
                    <h3 className="font-display font-semibold text-lg mb-2 text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                    
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                      {product.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-primary">
                          £{(product.sale_price || product.price).toFixed(2)}
                        </span>
                        {product.sale_price && (
                          <span className="text-sm text-muted-foreground line-through">
                            £{product.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                      
                      {/* Star rating placeholder */}
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Add to Cart Button */}
                <div className="p-4 pt-0">
                  <AddToCartButton
                    productId={product.id}
                    variantId={product.id} // Using product ID as variant ID for now
                    name={product.name}
                    price={product.sale_price || product.price}
                    image={product.main_image_url || '/placeholder-product.jpg'}
                    size="One Size"
                    color="Standard"
                    maxQuantity={10} // Default max quantity
                    quantity={1}
                    className={cn(
                      "w-full rounded-none font-display font-bold tracking-wide uppercase",
                      "border-2"
                    )}
                    buttonSize="default"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="mb-6">
              <div className={cn(
                "inline-block p-6 mb-4",
                "border-2 border-muted-foreground/20 rounded-none bg-muted/10"
              )}>
                <ShoppingCart className="h-12 w-12 text-muted-foreground/50" />
              </div>
            </div>
            <h3 className="text-xl font-display font-bold mb-4 tracking-wide uppercase">No Products Found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your filters or check back soon for new Royal Air Force products!
            </p>
            <Button 
              onClick={() => {
                setSortBy('name')
                setPriceFilter('all')
              }}
              variant="outline"
              className="rounded-none font-display font-bold tracking-wide uppercase border-2"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}