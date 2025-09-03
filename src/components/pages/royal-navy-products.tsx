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

export function RoyalNavyProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<string>('name')
  const [priceFilter, setPriceFilter] = useState<string>('all')

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true)
        
        // Fetch products from naval-related categories
        const navalCategories = ['ops-room', 'signals', 'mess-hall', 'stores', 'mt']
        const responses = await Promise.all(
          navalCategories.map(cat => 
            fetch(`/api/products?category=${cat}&limit=50`)
              .then(res => res.ok ? res.json() : { products: [] })
          )
        )
        
        const allProducts = responses.flatMap(data => data.products || [])
        
        // Remove duplicates and filter for naval/maritime themed products
        const uniqueProducts = allProducts
          .filter((product, index, self) => 
            index === self.findIndex(p => p.id === product.id)
          )
          .filter(product => 
            product.name.toLowerCase().includes('navy') ||
            product.name.toLowerCase().includes('naval') ||
            product.name.toLowerCase().includes('ship') ||
            product.name.toLowerCase().includes('fleet') ||
            product.name.toLowerCase().includes('maritime') ||
            product.name.toLowerCase().includes('sailor') ||
            product.name.toLowerCase().includes('anchor') ||
            product.description.toLowerCase().includes('navy') ||
            product.description.toLowerCase().includes('sea') ||
            product.description.toLowerCase().includes('maritime')
          )
        
        setProducts(uniqueProducts)
      } catch (err) {
        console.error('Error fetching Royal Navy products:', err)
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
    <div className="space-y-8">
      {/* Filters and Sorting */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-muted/10 border border-border rounded-none">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">Filter by price:</span>
            <select 
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="text-sm border border-border rounded-none bg-background px-2 py-1"
            >
              <option value="all">All prices</option>
              <option value="under-20">Under £20</option>
              <option value="20-30">£20 - £30</option>
              <option value="30-40">£30 - £40</option>
              <option value="over-40">Over £40</option>
            </select>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <SortAsc className="h-4 w-4" />
          <span className="text-sm font-medium">Sort by:</span>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border border-border rounded-none bg-background px-2 py-1"
          >
            <option value="name">Name A-Z</option>
            <option value="price-low">Price Low-High</option>
            <option value="price-high">Price High-Low</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <main>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-display font-bold tracking-wide uppercase text-foreground">
              Royal Navy Collection
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
              Try adjusting your filters or check back soon for new Royal Navy products!
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