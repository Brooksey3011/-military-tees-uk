"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

interface Product {
  id: string
  name: string
  price: number
  main_image_url: string
  description: string
}

export function BestsellersSafe() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true)
        const response = await fetch('/api/products?featured=true&limit=6')
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        setProducts(data.products || [])
      } catch (err) {
        console.error('Error fetching products:', err)
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-100 h-96 rounded animate-pulse"></div>
          ))}
        </div>
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

  if (products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">No Products Available</h2>
        <p className="text-gray-600">Check back soon for our bestselling items!</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
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
                <span className="text-2xl font-bold text-green-600">
                  £{product.price}
                </span>
                <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors">
                  View Product
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}