"use client"

import { useState, useCallback, useEffect } from 'react'

interface SearchProduct {
  id: string
  name: string
  slug: string
  description?: string
  price: number
  main_image_url?: string
  category?: {
    id: string
    name: string
    slug: string
  }
  variants?: Array<{
    id: string
    color?: string
    size?: string
    stock_quantity?: number
  }>
}

interface SearchFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
}

interface SearchResult {
  products: SearchProduct[]
  total: number
  hasMore: boolean
  page: number
}

interface UseSimpleSearchReturn {
  results: SearchProduct[]
  total: number
  isLoading: boolean
  error: string | null
  hasMore: boolean
  search: (query: string, filters?: SearchFilters, page?: number) => Promise<void>
  clear: () => void
}

export function useSimpleSearch(): UseSimpleSearchReturn {
  const [results, setResults] = useState<SearchProduct[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)

  const search = useCallback(async (
    query: string, 
    filters: SearchFilters = {}, 
    page: number = 1
  ) => {
    if (!query.trim() && !filters.category) {
      setResults([])
      setTotal(0)
      setError(null)
      setHasMore(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Build the search URL
      const searchParams = new URLSearchParams()
      
      if (query.trim()) {
        searchParams.set('search', query.trim())
      }
      
      if (filters.category) {
        searchParams.set('category', filters.category)
      }
      
      if (filters.minPrice) {
        searchParams.set('min_price', filters.minPrice.toString())
      }
      
      if (filters.maxPrice) {
        searchParams.set('max_price', filters.maxPrice.toString())
      }
      
      if (filters.inStock) {
        searchParams.set('in_stock', 'true')
      }
      
      searchParams.set('page', page.toString())
      searchParams.set('limit', '20')
      searchParams.set('sortBy', 'created_at')
      searchParams.set('sortOrder', 'desc')
      
      const response = await fetch(`/api/products?${searchParams.toString()}`)
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Search request failed')
      }
      
      setResults(data.products || [])
      setTotal(data.total || 0)
      setHasMore(data.hasMore || false)
      
    } catch (err) {
      console.error('Search error:', err)
      setError(err instanceof Error ? err.message : 'Search failed')
      setResults([])
      setTotal(0)
      setHasMore(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clear = useCallback(() => {
    setResults([])
    setTotal(0)
    setError(null)
    setHasMore(false)
    setIsLoading(false)
  }, [])

  return {
    results,
    total,
    isLoading,
    error,
    hasMore,
    search,
    clear
  }
}