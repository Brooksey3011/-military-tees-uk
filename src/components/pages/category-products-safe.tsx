"use client"

import { useEffect, useState } from "react"
import { Filter, SortAsc } from "lucide-react"

interface Product {
  id: string
  name: string
  price: number
  sale_price?: number
  main_image_url: string
  description: string
  slug: string
}

interface CategoryProductsSafeProps {
  categorySlug: string
  categoryName: string
}

export function CategoryProductsSafe({ categorySlug, categoryName }: CategoryProductsSafeProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true)
        const response = await fetch(`/api/products?category=${categorySlug}&limit=20`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        setProducts(data.products || [])
      } catch (err) {
        console.error('Error fetching category products:', err)
        setError(err instanceof Error ? err.message : 'Failed to load products')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [categorySlug])

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar Skeleton */}
        <aside className="lg:col-span-1">
          <div className="bg-gray-100 h-64 rounded animate-pulse"></div>
        </aside>

        {/* Products Grid Skeleton */}
        <main className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-gray-100 h-96 rounded animate-pulse"></div>
            ))}
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Unable to Load Products</h2>
        <p className="text-gray-600 mb-6">Error: {error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Filters Sidebar */}
      <aside className="lg:col-span-1">
        <div className="sticky top-24">
          <h3 className="text-lg font-semibold mb-4 tracking-wide uppercase">
            Filter Products
          </h3>
          
          <div className="bg-white border-2 border-gray-200 p-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Filter className="h-4 w-4" />
                <span className="text-sm">Filters available when products load</span>
              </div>
              
              <div className="flex items-center gap-2 text-gray-600">
                <SortAsc className="h-4 w-4" />
                <span className="text-sm">Sorting options available soon</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Products Grid */}
      <main className="lg:col-span-3">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">
              {categoryName} Products
            </h2>
            <p className="text-sm text-gray-600">
              {products.length === 0 ? "No products available" : `${products.length} products found`}
            </p>
          </div>
          
          <button 
            className="border-2 border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:border-green-600 transition-colors"
            disabled
          >
            <SortAsc className="h-4 w-4 mr-2 inline" />
            Sort By
          </button>
        </div>

        {/* Products Display */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="aspect-square relative bg-gray-100 rounded-t-lg">
                  <img
                    src={product.main_image_url}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-t-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = '/placeholder-product.jpg'
                    }}
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-green-600">
                        £{product.sale_price ?? product.price}
                      </span>
                      {product.sale_price && (
                        <span className="text-sm text-gray-500 line-through">
                          £{product.price}
                        </span>
                      )}
                    </div>
                    <a 
                      href={`/products/${product.slug}`}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors inline-block text-center"
                    >
                      View Product
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold mb-4">No Products Available</h3>
            <p className="text-gray-600">
              Check back soon for products in the {categoryName} category!
            </p>
          </div>
        )}
      </main>
    </div>
  )
}