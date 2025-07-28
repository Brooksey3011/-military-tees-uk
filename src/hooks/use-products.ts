"use client"

import { useState, useEffect } from 'react'
import { productsAPI, categoriesAPI, handleAPIError } from '@/lib/api'
import type { Product, Category } from '@/types'

interface UseProductsOptions {
  category?: string
  search?: string
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

interface UseProductsReturn {
  products: Product[]
  loading: boolean
  error: string | null
  hasMore: boolean
  loadMore: () => void
  refetch: () => void
}

export function useProducts(options: UseProductsOptions = {}): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [offset, setOffset] = useState(0)

  const {
    category,
    search,
    limit = 12,
    sortBy = 'created_at',
    sortOrder = 'desc'
  } = options

  const fetchProducts = async (reset = false) => {
    try {
      const currentOffset = reset ? 0 : offset
      setLoading(true)
      setError(null)

      const data = await productsAPI.getProducts({
        category,
        search,
        limit,
        offset: currentOffset,
        sortBy,
        sortOrder
      })
      
      if (reset) {
        setProducts(data.products)
        setOffset(data.products.length)
      } else {
        setProducts(prev => [...prev, ...data.products])
        setOffset(prev => prev + data.products.length)
      }
      
      setHasMore(data.hasMore)

    } catch (err) {
      setError(handleAPIError(err))
    } finally {
      setLoading(false)
    }
  }

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchProducts(false)
    }
  }

  const refetch = () => {
    setOffset(0)
    fetchProducts(true)
  }

  useEffect(() => {
    refetch()
  }, [category, search, sortBy, sortOrder])

  return {
    products,
    loading,
    error,
    hasMore,
    loadMore,
    refetch
  }
}

export function useProduct(slug: string) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        setError(null)

        const data = await productsAPI.getProduct(slug)
        setProduct(data.product)

      } catch (err) {
        setError(handleAPIError(err))
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchProduct()
    }
  }, [slug])

  return { product, loading, error }
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        setError(null)

        const data = await categoriesAPI.getCategories(true)
        setCategories(data.categories)

      } catch (err) {
        setError(handleAPIError(err))
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return { categories, loading, error }
}