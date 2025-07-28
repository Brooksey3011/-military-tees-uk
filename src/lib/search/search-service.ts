export interface SearchResult {
  id: string
  title: string
  type: 'product' | 'category' | 'brand'
  description?: string
  image?: string
  price?: number
  originalPrice?: number
  category?: string
  url: string
  rating?: number
  reviewCount?: number
  tags?: string[]
  isNew?: boolean
  isSale?: boolean
}

export interface SearchFilters {
  category?: string[]
  priceRange?: { min: number; max: number }
  colors?: string[]
  sizes?: string[]
  rating?: number
  inStock?: boolean
  isNew?: boolean
  isSale?: boolean
  brands?: string[]
}

export interface SearchOptions {
  query?: string
  filters?: SearchFilters
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'name'
  page?: number
  limit?: number
  facets?: boolean
}

export interface SearchResponse {
  results: SearchResult[]
  total: number
  page: number
  limit: number
  facets?: {
    categories: Array<{ name: string; count: number }>
    colors: Array<{ name: string; count: number }>
    sizes: Array<{ name: string; count: number }>
    priceRanges: Array<{ min: number; max: number; count: number }>
    brands: Array<{ name: string; count: number }>
  }
  suggestions?: string[]
}

export interface SearchService {
  search(options: SearchOptions): Promise<SearchResponse>
  suggest(query: string): Promise<string[]>
  getPopularSearches(): Promise<string[]>
  trackSearch(query: string): Promise<void>
}

// Abstract base class for search implementations
export abstract class BaseSearchService implements SearchService {
  abstract search(options: SearchOptions): Promise<SearchResponse>
  abstract suggest(query: string): Promise<string[]>
  
  async getPopularSearches(): Promise<string[]> {
    // Default implementation - can be overridden
    return [
      'British Army',
      'Royal Navy',
      'RAF',
      'Paratrooper',
      'Military',
      'Veterans',
      'Combat',
      'Tactical'
    ]
  }

  async trackSearch(query: string): Promise<void> {
    // Default implementation - can be overridden
    console.log('Search tracked:', query)
  }
}