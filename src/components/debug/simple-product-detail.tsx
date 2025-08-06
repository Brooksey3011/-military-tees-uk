"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"

interface Product {
  id: string
  name: string
  price: number
  main_image_url: string
  description: string
  slug: string
}

export function SimpleProductDetail() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProduct() {
      if (!params.slug) return

      try {
        setLoading(true)
        const response = await fetch(`/api/products/${params.slug}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Product not found')
          } else {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          return
        }
        
        const data = await response.json()
        setProduct(data.product)
        
      } catch (err) {
        console.error('Error fetching product:', err)
        setError(err instanceof Error ? err.message : 'Failed to load product')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [params.slug])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading product...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
        <p className="text-gray-600 mb-6">{error}</p>
        <button 
          onClick={() => router.back()}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          Go Back
        </button>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
        <button 
          onClick={() => router.back()}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Image */}
        <div>
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={product.main_image_url}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = '/placeholder-product.jpg'
              }}
            />
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <p className="text-gray-600 mb-4">{product.description}</p>
            
            <div className="flex items-center gap-4 mb-6">
              <span className="text-3xl font-bold text-green-600">
                £{product.price}
              </span>
            </div>
          </div>

          {/* Simple Add to Cart - no cart store for now */}
          <button
            className="w-full py-3 px-6 rounded-lg font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors"
          >
            Add to Cart (Simple Version)
          </button>
        </div>
      </div>
    </div>
  )
}