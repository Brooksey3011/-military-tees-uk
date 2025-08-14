"use client"

import { useEffect, useState } from "react"

interface Product {
  id: string
  name: string
  price: number
  main_image_url: string
  description: string
  slug: string
}

export function NewArrivalsSafe() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true)
        const timestamp = Date.now()
        const response = await fetch(`/api/products?limit=12&t=${timestamp}`, {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          },
          cache: 'no-store',
        })
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('API Error Response:', {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            body: errorText
          })
          throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
        }
        
        const data = await response.json()
        console.log('✅ Successfully fetched products:', data.products?.length || 0)
        setProducts(data.products || [])
      } catch (err) {
        console.error('Error fetching new arrivals:', err)
        console.error('Full error details:', {
          message: err instanceof Error ? err.message : 'Unknown error',
          stack: err instanceof Error ? err.stack : undefined,
          name: err instanceof Error ? err.name : undefined
        })
        setError(err instanceof Error ? err.message : 'Failed to load products')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="bg-gray-100 h-96 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Unable to Load New Arrivals</h2>
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

  if (products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">No New Arrivals</h2>
        <p className="text-gray-600">Check back soon for our latest products!</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                <span className="text-2xl font-bold text-green-600">
                  £{product.price}
                </span>
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
    </div>
  )
}