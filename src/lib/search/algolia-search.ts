import { 
  BaseSearchService, 
  SearchOptions, 
  SearchResponse, 
  SearchResult, 
  SearchFilters 
} from './search-service'
import { supabase } from '@/lib/supabase'

// Types for Algolia integration
interface AlgoliaConfig {
  appId: string
  searchApiKey: string
  indexName: string
}

// Enhanced product interface for search
interface SearchableProduct {
  objectID: string
  name: string
  description: string
  price: number
  compare_at_price?: number
  main_image_url?: string
  category: {
    name: string
    slug: string
  }
  slug: string
  tags: string[]
  variants: Array<{
    size?: string
    color?: string
    stock_quantity: number
  }>
  averageRating: number
  reviewCount: number
  is_featured: boolean
  created_at: string
  isNew: boolean
  isSale: boolean
}

interface AlgoliaHit {
  objectID: string
  name: string
  description?: string
  price: number
  originalPrice?: number
  main_image_url?: string
  category: {
    name: string
    slug: string
  }
  rating?: number
  reviewCount?: number
  tags?: string[]
  variants: Array<{
    size: string
    color: string
    stock: number
  }>
  isNew?: boolean
  isSale?: boolean
  createdAt: string
  slug: string
}

interface AlgoliaResponse {
  hits: AlgoliaHit[]
  nbHits: number
  page: number
  nbPages: number
  hitsPerPage: number
  facets?: Record<string, Record<string, number>>
  query: string
}

export class AlgoliaSearchService extends BaseSearchService {
  private config: AlgoliaConfig
  private client: any // Would be algoliasearch client in real implementation

  constructor(config: AlgoliaConfig) {
    super()
    this.config = config
    this.initializeClient()
  }

  private initializeClient() {
    // In a real implementation, you would:
    // import algoliasearch from 'algoliasearch/lite'
    // this.client = algoliasearch(this.config.appId, this.config.searchApiKey)
    
    // For now, we'll simulate the client
    this.client = {
      initIndex: (indexName: string) => ({
        search: this.mockSearch.bind(this),
        searchForFacetValues: this.mockFacetSearch.bind(this)
      })
    }
  }

  private mockSearch(query: string, options: any): Promise<AlgoliaResponse> {
    // Mock Algolia response for demonstration - return immediately to avoid CSP issues
    return new Promise((resolve) => {
        const mockHits: AlgoliaHit[] = [
          {
            objectID: '1',
            name: 'British Army Regiment T-Shirt',
            description: 'Classic British Army regimental design with authentic military styling',
            price: 24.99,
            originalPrice: 29.99,
            main_image_url: '/images/products/british-army-tshirt.jpg',
            category: { name: 'Army', slug: 'army' },
            rating: 4.5,
            reviewCount: 127,
            tags: ['british', 'army', 'military', 'regiment'],
            variants: [
              { size: 'S', color: 'black', stock: 15 },
              { size: 'M', color: 'black', stock: 20 },
              { size: 'L', color: 'olive', stock: 12 }
            ],
            isSale: true,
            createdAt: '2024-01-15',
            slug: 'british-army-regiment-tshirt'
          },
          {
            objectID: '2',
            name: 'Royal Navy Anchor Design',
            description: 'Traditional Royal Navy anchor design on premium cotton',
            price: 26.99,
            main_image_url: '/images/products/royal-navy-anchor.jpg',
            category: { name: 'Navy', slug: 'navy' },
            rating: 4.7,
            reviewCount: 89,
            tags: ['royal navy', 'navy', 'anchor', 'maritime'],
            variants: [
              { size: 'M', color: 'navy', stock: 18 },
              { size: 'L', color: 'navy', stock: 25 },
              { size: 'XL', color: 'white', stock: 8 }
            ],
            isNew: true,
            createdAt: '2024-02-01',
            slug: 'royal-navy-anchor-design'
          },
          {
            objectID: '3',
            name: 'RAF Wings Badge Shirt',
            description: 'Royal Air Force wings badge design for aviation enthusiasts',
            price: 28.99,
            main_image_url: '/images/products/raf-wings.jpg',
            category: { name: 'RAF', slug: 'raf' },
            rating: 4.3,
            reviewCount: 64,
            tags: ['raf', 'wings', 'aviation', 'air force'],
            variants: [
              { size: 'S', color: 'grey', stock: 10 },
              { size: 'M', color: 'grey', stock: 15 },
              { size: 'L', color: 'black', stock: 12 }
            ],
            createdAt: '2024-01-20',
            slug: 'raf-wings-badge-shirt'
          }
        ]

        // Filter results based on query
        const filteredHits = query 
          ? mockHits.filter(hit => 
              hit.name.toLowerCase().includes(query.toLowerCase()) ||
              hit.description?.toLowerCase().includes(query.toLowerCase()) ||
              hit.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
            )
          : mockHits

      resolve({
        hits: filteredHits,
        nbHits: filteredHits.length,
        page: options.page || 0,
        nbPages: Math.ceil(filteredHits.length / (options.hitsPerPage || 20)),
        hitsPerPage: options.hitsPerPage || 20,
        query,
        facets: {
          category: {
            'Army': 1,
            'Navy': 1,
            'RAF': 1
          },
          'variants.color': {
            'black': 2,
            'navy': 1,
            'olive': 1,
            'grey': 1,
            'white': 1
          },
          'variants.size': {
            'S': 2,
            'M': 3,
            'L': 3,
            'XL': 1
          }
        }
      })
    })
  }

  private mockFacetSearch(facetName: string, facetQuery: string): Promise<any> {
    return Promise.resolve({
      facetHits: [
        { value: 'British Army', count: 15 },
        { value: 'Royal Navy', count: 12 },
        { value: 'RAF', count: 8 }
      ]
    })
  }

  private convertAlgoliaHitToSearchResult(hit: AlgoliaHit): SearchResult {
    return {
      id: hit.objectID,
      title: hit.name,
      type: 'product',
      description: hit.description,
      image: hit.main_image_url,
      price: hit.price,
      originalPrice: hit.originalPrice,
      category: hit.category.name,
      url: `/products/${hit.slug}`,
      rating: hit.rating,
      reviewCount: hit.reviewCount,
      tags: hit.tags,
      isNew: hit.isNew,
      isSale: hit.isSale
    }
  }

  private buildAlgoliaFilters(filters: SearchFilters): string {
    const filterParts: string[] = []

    if (filters.category?.length) {
      const categoryFilter = filters.category
        .map(cat => `category.name:"${cat}"`)
        .join(' OR ')
      filterParts.push(`(${categoryFilter})`)
    }

    if (filters.colors?.length) {
      const colorFilter = filters.colors
        .map(color => `variants.color:"${color}"`)
        .join(' OR ')
      filterParts.push(`(${colorFilter})`)
    }

    if (filters.sizes?.length) {
      const sizeFilter = filters.sizes
        .map(size => `variants.size:"${size}"`)
        .join(' OR ')
      filterParts.push(`(${sizeFilter})`)
    }

    if (filters.priceRange) {
      filterParts.push(`price:${filters.priceRange.min} TO ${filters.priceRange.max}`)
    }

    if (filters.inStock) {
      filterParts.push('variants.stock > 0')
    }

    if (filters.isNew) {
      filterParts.push('isNew:true')
    }

    if (filters.isSale) {
      filterParts.push('isSale:true')
    }

    if (filters.rating) {
      filterParts.push(`rating >= ${filters.rating}`)
    }

    return filterParts.join(' AND ')
  }

  async search(options: SearchOptions): Promise<SearchResponse> {
    const index = this.client.initIndex(this.config.indexName)
    
    const algoliaOptions: any = {
      page: options.page || 0,
      hitsPerPage: options.limit || 20,
      facets: options.facets ? ['category.name', 'variants.color', 'variants.size'] : undefined
    }

    if (options.filters) {
      const filters = this.buildAlgoliaFilters(options.filters)
      if (filters) {
        algoliaOptions.filters = filters
      }
    }

    // Handle sorting
    if (options.sortBy && options.sortBy !== 'relevance') {
      const sortMap = {
        'price_asc': 'price_asc',
        'price_desc': 'price_desc',
        'rating': 'rating_desc',
        'newest': 'created_at_desc',
        'name': 'name_asc'
      }
      algoliaOptions.indexName = `${this.config.indexName}_${sortMap[options.sortBy]}`
    }

    try {
      const response: AlgoliaResponse = await index.search(options.query || '', algoliaOptions)
      
      return {
        results: response.hits.map(hit => this.convertAlgoliaHitToSearchResult(hit)),
        total: response.nbHits,
        page: response.page,
        limit: response.hitsPerPage,
        facets: response.facets ? {
          categories: Object.entries(response.facets['category.name'] || {})
            .map(([name, count]) => ({ name, count })),
          colors: Object.entries(response.facets['variants.color'] || {})
            .map(([name, count]) => ({ name, count })),
          sizes: Object.entries(response.facets['variants.size'] || {})
            .map(([name, count]) => ({ name, count })),
          priceRanges: [
            { min: 0, max: 25, count: 10 },
            { min: 25, max: 50, count: 15 },
            { min: 50, max: 100, count: 8 }
          ],
          brands: [
            { name: 'Military Tees UK', count: response.nbHits }
          ]
        } : undefined
      }
    } catch (error) {
      console.error('Algolia search error:', error)
      throw new Error('Search failed')
    }
  }

  async suggest(query: string): Promise<string[]> {
    if (!query || query.length < 2) return []

    const index = this.client.initIndex(this.config.indexName)
    
    try {
      const response = await index.searchForFacetValues('tags', query, { maxFacetHits: 5 })
      return response.facetHits.map((hit: any) => hit.value)
    } catch (error) {
      console.error('Algolia suggest error:', error)
      return []
    }
  }

  async trackSearch(query: string): Promise<void> {
    // In a real implementation, you would use Algolia's analytics
    // import { aa } from 'search-insights'
    // aa('clickedObjectIDsAfterSearch', {
    //   index: this.config.indexName,
    //   queryID: 'query-id',
    //   objectIDs: ['object-id']
    // })
    
    console.log('Algolia search tracked:', query)
  }
}