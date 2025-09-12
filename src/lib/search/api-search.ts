import { 
  BaseSearchService, 
  SearchOptions, 
  SearchResponse, 
  SearchResult, 
  SearchFilters 
} from './search-service'

// API-based search service that uses the working /api/products endpoint
export class ApiSearchService extends BaseSearchService {
  private cache: Map<string, { data: SearchResponse; timestamp: number }> = new Map()
  private cacheTimeout = 2 * 60 * 1000 // 2 minutes

  constructor() {
    super()
  }

  private buildApiUrl(options: SearchOptions): string {
    const baseUrl = '/api/products'
    const params = new URLSearchParams()

    // Add search query
    if (options.query?.trim()) {
      params.set('search', options.query.trim())
    }

    // Add filters
    if (options.filters?.category?.length) {
      params.set('category', options.filters.category[0]) // Use first category for now
    }

    if (options.filters?.priceRange) {
      params.set('min_price', options.filters.priceRange.min.toString())
      params.set('max_price', options.filters.priceRange.max.toString())
    }

    if (options.filters?.inStock) {
      params.set('in_stock', 'true')
    }

    if (options.filters?.isNew) {
      params.set('new', 'true')
    }

    if (options.filters?.isSale) {
      params.set('sale', 'true')
    }

    // Add sorting
    if (options.sortBy) {
      const sortMap: Record<string, string> = {
        'price_asc': 'price',
        'price_desc': 'price',
        'newest': 'created_at',
        'name': 'name',
        'relevance': 'created_at'
      }
      
      params.set('sortBy', sortMap[options.sortBy] || 'created_at')
      
      if (options.sortBy === 'price_desc') {
        params.set('sortOrder', 'desc')
      } else {
        params.set('sortOrder', 'asc')
      }
    }

    // Add pagination
    params.set('page', ((options.page || 0) + 1).toString()) // API uses 1-based pages
    params.set('limit', (options.limit || 20).toString())

    const queryString = params.toString()
    return queryString ? `${baseUrl}?${queryString}` : baseUrl
  }

  private convertApiProductToSearchResult(product: any): SearchResult {
    return {
      id: product.id,
      title: product.name,
      type: 'product',
      description: product.description || '',
      image: product.main_image_url || '/placeholder-product.jpg',
      price: product.price,
      originalPrice: product.compare_at_price,
      category: product.category?.name || 'Uncategorized',
      url: `/products/${product.slug}`,
      rating: 0, // We'll need to calculate this from reviews later
      reviewCount: 0,
      tags: product.tags || [],
      isNew: false, // We'll calculate this based on created date
      isSale: Boolean(product.compare_at_price && product.compare_at_price > product.price)
    }
  }

  private generateFacetsFromProducts(products: any[]) {
    const categories = new Map<string, number>()
    const colors = new Map<string, number>()
    const sizes = new Map<string, number>()

    products.forEach(product => {
      // Categories
      if (product.category?.name) {
        categories.set(product.category.name, (categories.get(product.category.name) || 0) + 1)
      }

      // Colors and sizes from variants
      if (product.variants) {
        product.variants.forEach((variant: any) => {
          if (variant.color) {
            colors.set(variant.color, (colors.get(variant.color) || 0) + 1)
          }
          if (variant.size) {
            sizes.set(variant.size, (sizes.get(variant.size) || 0) + 1)
          }
        })
      }
    })

    return {
      categories: Array.from(categories.entries()).map(([name, count]) => ({ name, count })),
      colors: Array.from(colors.entries()).map(([name, count]) => ({ name, count })),
      sizes: Array.from(sizes.entries()).map(([name, count]) => ({ name, count })),
      priceRanges: [
        { min: 0, max: 25, count: products.filter(p => p.price <= 25).length },
        { min: 25, max: 50, count: products.filter(p => p.price > 25 && p.price <= 50).length },
        { min: 50, max: 100, count: products.filter(p => p.price > 50).length }
      ],
      brands: [{ name: 'Military Tees UK', count: products.length }]
    }
  }

  async search(options: SearchOptions): Promise<SearchResponse> {
    // Create cache key
    const cacheKey = JSON.stringify(options)
    const cached = this.cache.get(cacheKey)
    const now = Date.now()

    // Return cached result if still valid
    if (cached && (now - cached.timestamp) < this.cacheTimeout) {
      return cached.data
    }

    try {
      // Build the API URL
      const apiUrl = this.buildApiUrl(options)
      
      // Fetch from the API
      const response = await fetch(apiUrl)
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'API request failed')
      }

      // Convert API response to search response format
      const searchResponse: SearchResponse = {
        results: (data.products || []).map((product: any) => this.convertApiProductToSearchResult(product)),
        total: data.total || 0,
        page: options.page || 0,
        limit: options.limit || 20,
        facets: options.facets ? this.generateFacetsFromProducts(data.products || []) : undefined
      }

      // Cache the result
      this.cache.set(cacheKey, { data: searchResponse, timestamp: now })

      return searchResponse
    } catch (error) {
      console.error('API search error:', error)
      
      // Return empty results instead of throwing
      return {
        results: [],
        total: 0,
        page: options.page || 0,
        limit: options.limit || 20,
        facets: options.facets ? {
          categories: [],
          colors: [],
          sizes: [],
          priceRanges: [],
          brands: []
        } : undefined
      }
    }
  }

  async suggest(query: string): Promise<string[]> {
    if (!query || query.length < 2) return []

    try {
      // Use a simple search to get suggestions
      const response = await this.search({
        query,
        limit: 10,
        page: 0
      })

      // Extract unique words from product names
      const suggestions = new Set<string>()
      const normalizedQuery = query.toLowerCase().trim()

      response.results.forEach(result => {
        const words = result.title.toLowerCase().split(' ')
        words.forEach(word => {
          if (word.startsWith(normalizedQuery) && word.length > normalizedQuery.length) {
            suggestions.add(word.charAt(0).toUpperCase() + word.slice(1))
          }
        })
      })

      return Array.from(suggestions).slice(0, 8).sort()
    } catch (error) {
      console.error('Suggest error:', error)
      return []
    }
  }

  async getPopularSearches(): Promise<string[]> {
    // Return popular military-themed search terms
    return [
      'Military',
      'British Army',
      'Royal Navy',
      'RAF',
      'Regiment',
      'Veterans',
      'Tactical',
      'Combat'
    ]
  }
}