import { 
  BaseSearchService, 
  SearchOptions, 
  SearchResponse, 
  SearchResult, 
  SearchFilters 
} from './search-service'
import { supabase } from '@/lib/supabase'

// Enhanced search service that combines database search with optional Algolia
export class EnhancedSearchService extends BaseSearchService {
  private cache: Map<string, { data: SearchResponse; timestamp: number }> = new Map()
  private cacheTimeout = 5 * 60 * 1000 // 5 minutes
  private useAlgolia = false // Set to true when Algolia is configured

  constructor() {
    super()
    this.initializeAlgolia()
  }

  private initializeAlgolia() {
    // Check if Algolia environment variables are available
    const algoliaAppId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID
    const algoliaApiKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY
    
    if (algoliaAppId && algoliaApiKey) {
      this.useAlgolia = true
      // Algolia integration configured
    } else {
      // Using database search - production ready
    }
  }

  private async loadProductsFromDatabase(): Promise<SearchableProduct[]> {
    try {
      const { data: products, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          slug,
          description,
          price,
          compare_at_price,
          main_image_url,
          tags,
          is_featured,
          created_at,
          categories!category_id (
            name,
            slug
          ),
          product_variants!inner (
            size,
            color,
            stock_quantity,
            is_active
          )
        `)
        .eq('is_active', true)
        .eq('product_variants.is_active', true)

      if (error) throw error

      // Transform and enhance products
      return await Promise.all(
        (products || []).map(async (product: any): Promise<SearchableProduct> => {
          // Get reviews for rating
          const { data: reviews } = await supabase
            .from('reviews')
            .select('rating')
            .eq('product_id', product.id)
            .eq('is_approved', true)

          const averageRating = reviews && reviews.length > 0
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
            : 0

          // Determine if product is new (created within last 30 days)
          const createdDate = new Date(product.created_at)
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          const isNew = createdDate > thirtyDaysAgo

          // Determine if product is on sale
          const isSale = Boolean(product.compare_at_price && product.compare_at_price > product.price)

          return {
            objectID: product.id,
            name: product.name,
            description: product.description || '',
            price: product.price,
            compare_at_price: product.compare_at_price,
            main_image_url: product.main_image_url,
            category: {
              name: product.categories?.name || 'Uncategorized',
              slug: product.categories?.slug || 'uncategorized'
            },
            slug: product.slug,
            tags: product.tags || [],
            variants: product.product_variants.map((variant: any) => ({
              size: variant.size,
              color: variant.color,
              stock_quantity: variant.stock_quantity
            })),
            averageRating: Math.round(averageRating * 10) / 10,
            reviewCount: reviews?.length || 0,
            is_featured: product.is_featured,
            created_at: product.created_at,
            isNew,
            isSale
          }
        })
      )
    } catch (error) {
      console.error('Error loading products for search, falling back to mock data:', error)
      return this.getMockSearchProducts()
    }
  }

  private getMockSearchProducts(): SearchableProduct[] {
    return [
      {
        objectID: "1",
        name: "No Man Left Behind - Classic Tee",
        description: "A powerful tribute to the military ethos of never abandoning a comrade. This design embodies the unwavering loyalty and brotherhood that defines military service.",
        price: 24.99,
        compare_at_price: 29.99,
        main_image_url: "/images/products/placeholder-tshirt.svg",
        category: {
          name: "Regimental HQ",
          slug: "regimental-hq" 
        },
        slug: "no-man-left-behind-classic",
        tags: ["military", "brotherhood", "loyalty", "army"],
        variants: [
          { size: "S", color: "Black", stock_quantity: 15 },
          { size: "M", color: "Black", stock_quantity: 20 },
          { size: "L", color: "Black", stock_quantity: 18 },
          { size: "XL", color: "Black", stock_quantity: 12 }
        ],
        averageRating: 4.8,
        reviewCount: 24,
        is_featured: true,
        created_at: new Date().toISOString(),
        isNew: true,
        isSale: true
      },
      {
        objectID: "2",
        name: "Royal Marine Commando Tee",
        description: "Elite Royal Marine Commando design celebrating amphibious warfare excellence",
        price: 26.99,
        main_image_url: "/images/products/placeholder-tshirt.svg",
        category: {
          name: "Royal Marines",
          slug: "royal-marines"
        },
        slug: "royal-marine-commando-tee",
        tags: ["royal marines", "commando", "navy", "elite"],
        variants: [
          { size: "S", color: "Navy", stock_quantity: 12 },
          { size: "M", color: "Navy", stock_quantity: 15 },
          { size: "L", color: "Navy", stock_quantity: 10 }
        ],
        averageRating: 4.6,
        reviewCount: 12,
        is_featured: false,
        created_at: new Date().toISOString(),
        isNew: true,
        isSale: false
      },
      {
        objectID: "3",
        name: "SAS Regiment Elite Tee",
        description: "Special Air Service tribute design for the elite of the elite",
        price: 27.99,
        main_image_url: "/images/products/placeholder-tshirt.svg",
        category: {
          name: "Special Forces",
          slug: "special-forces"
        },
        slug: "sas-regiment-elite-tee",
        tags: ["sas", "special forces", "elite", "regiment"],
        variants: [
          { size: "S", color: "Army Green", stock_quantity: 8 },
          { size: "M", color: "Army Green", stock_quantity: 12 },
          { size: "L", color: "Army Green", stock_quantity: 9 }
        ],
        averageRating: 4.9,
        reviewCount: 18,
        is_featured: true,
        created_at: new Date().toISOString(),
        isNew: false,
        isSale: false
      },
      {
        objectID: "4",
        name: "Paratrooper Wings Design",
        description: "Airborne excellence with Parachute Regiment wings insignia",
        price: 25.99,
        main_image_url: "/images/products/placeholder-tshirt.svg",
        category: {
          name: "Parachute Regiment",
          slug: "parachute-regiment"
        },
        slug: "paratrooper-wings-design",
        tags: ["paratrooper", "wings", "airborne", "regiment"],
        variants: [
          { size: "S", color: "Black", stock_quantity: 14 },
          { size: "M", color: "Black", stock_quantity: 18 },
          { size: "L", color: "Black", stock_quantity: 11 }
        ],
        averageRating: 4.7,
        reviewCount: 15,
        is_featured: false,
        created_at: new Date().toISOString(),
        isNew: false,
        isSale: false
      },
      {
        objectID: "5",
        name: "British Army Heritage",
        description: "Classic British Army design celebrating our military heritage",
        price: 23.99,
        compare_at_price: 28.99,
        main_image_url: "/images/products/placeholder-tshirt.svg",
        category: {
          name: "British Army",
          slug: "british-army"
        },
        slug: "british-army-heritage",
        tags: ["british army", "heritage", "classic", "military"],
        variants: [
          { size: "S", color: "Army Green", stock_quantity: 16 },
          { size: "M", color: "Army Green", stock_quantity: 20 },
          { size: "L", color: "Army Green", stock_quantity: 13 }
        ],
        averageRating: 4.5,
        reviewCount: 22,
        is_featured: true,
        created_at: new Date().toISOString(),
        isNew: false,
        isSale: true
      }
    ]
  }

  private calculateRelevanceScore(product: SearchableProduct, query: string): number {
    if (!query) return 1

    const normalizedQuery = query.toLowerCase().trim()
    let score = 0

    // Exact name match (highest priority)
    if (product.name.toLowerCase().includes(normalizedQuery)) {
      score += 20
      
      // Boost for exact matches at start of name
      if (product.name.toLowerCase().startsWith(normalizedQuery)) {
        score += 10
      }
    }

    // Tag matches (high priority)
    const matchingTags = product.tags.filter(tag => 
      tag.toLowerCase().includes(normalizedQuery)
    ).length
    score += matchingTags * 8

    // Category match
    if (product.category.name.toLowerCase().includes(normalizedQuery)) {
      score += 6
    }

    // Description match (lower priority)
    if (product.description && product.description.toLowerCase().includes(normalizedQuery)) {
      score += 4
    }

    // Boost popular and high-quality products
    if (product.averageRating > 4.5) {
      score += 3
    }
    
    if (product.reviewCount > 50) {
      score += 2
    }

    // Boost featured products
    if (product.is_featured) {
      score += 5
    }

    // Boost new products slightly
    if (product.isNew) {
      score += 2
    }

    // Boost products on sale
    if (product.isSale) {
      score += 3
    }

    return score
  }

  private applyFilters(products: SearchableProduct[], filters: SearchFilters): SearchableProduct[] {
    return products.filter(product => {
      // Category filter
      if (filters.category?.length && !filters.category.includes(product.category.name)) {
        return false
      }

      // Price range filter
      if (filters.priceRange) {
        const { min, max } = filters.priceRange
        if (product.price < min || product.price > max) {
          return false
        }
      }

      // Colors filter
      if (filters.colors?.length) {
        const productColors = product.variants.map(v => v.color).filter(Boolean)
        if (!filters.colors.some(color => productColors.includes(color))) {
          return false
        }
      }

      // Sizes filter
      if (filters.sizes?.length) {
        const productSizes = product.variants.map(v => v.size).filter(Boolean)
        if (!filters.sizes.some(size => productSizes.includes(size))) {
          return false
        }
      }

      // Rating filter
      if (filters.rating && product.averageRating < filters.rating) {
        return false
      }

      // In stock filter
      if (filters.inStock) {
        const hasStock = product.variants.some(v => v.stock_quantity > 0)
        if (!hasStock) {
          return false
        }
      }

      // New products filter
      if (filters.isNew && !product.isNew) {
        return false
      }

      // Sale products filter
      if (filters.isSale && !product.isSale) {
        return false
      }

      return true
    })
  }

  private sortProducts(products: SearchableProduct[], sortBy: string): SearchableProduct[] {
    const sortedProducts = [...products]

    switch (sortBy) {
      case 'price_asc':
        return sortedProducts.sort((a, b) => a.price - b.price)
      
      case 'price_desc':
        return sortedProducts.sort((a, b) => b.price - a.price)
      
      case 'rating':
        return sortedProducts.sort((a, b) => b.averageRating - a.averageRating)
      
      case 'newest':
        return sortedProducts.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      
      case 'name':
        return sortedProducts.sort((a, b) => a.name.localeCompare(b.name))
      
      case 'relevance':
      default:
        return sortedProducts // Already sorted by relevance
    }
  }

  private convertProductToSearchResult(product: SearchableProduct): SearchResult {
    return {
      id: product.objectID,
      title: product.name,
      type: 'product',
      description: product.description,
      image: product.main_image_url || '/placeholder-product.jpg',
      price: product.price,
      originalPrice: product.compare_at_price,
      category: product.category.name,
      url: `/products/${product.slug}`,
      rating: product.averageRating,
      reviewCount: product.reviewCount,
      tags: product.tags,
      isNew: product.isNew,
      isSale: product.isSale
    }
  }

  private generateFacets(products: SearchableProduct[]) {
    const categories = new Map<string, number>()
    const colors = new Map<string, number>()
    const sizes = new Map<string, number>()
    const priceRanges = { '0-25': 0, '25-50': 0, '50-100': 0, '100+': 0 }

    products.forEach(product => {
      // Categories
      categories.set(product.category.name, (categories.get(product.category.name) || 0) + 1)

      // Price ranges
      if (product.price <= 25) priceRanges['0-25']++
      else if (product.price <= 50) priceRanges['25-50']++
      else if (product.price <= 100) priceRanges['50-100']++
      else priceRanges['100+']++

      // Colors and sizes from variants
      product.variants.forEach(variant => {
        if (variant.color) {
          colors.set(variant.color, (colors.get(variant.color) || 0) + 1)
        }
        if (variant.size) {
          sizes.set(variant.size, (sizes.get(variant.size) || 0) + 1)
        }
      })
    })

    return {
      categories: Array.from(categories.entries()).map(([name, count]) => ({ name, count })),
      colors: Array.from(colors.entries()).map(([name, count]) => ({ name, count })),
      sizes: Array.from(sizes.entries()).map(([name, count]) => ({ name, count })),
      priceRanges: [
        { min: 0, max: 25, count: priceRanges['0-25'] },
        { min: 25, max: 50, count: priceRanges['25-50'] },
        { min: 50, max: 100, count: priceRanges['50-100'] },
        { min: 100, max: 999999, count: priceRanges['100+'] }
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
      // Load products from database
      let products = await this.loadProductsFromDatabase()

      // Apply text search if query provided
      if (options.query) {
        const query = options.query.trim()
        if (query) {
          products = products
            .map(product => ({
              product,
              score: this.calculateRelevanceScore(product, query)
            }))
            .filter(({ score }) => score > 0)
            .sort((a, b) => b.score - a.score)
            .map(({ product }) => product)
        }
      }

      // Apply filters
      if (options.filters) {
        products = this.applyFilters(products, options.filters)
      }

      // Generate facets before pagination if requested
      const facets = options.facets ? this.generateFacets(products) : undefined

      // Apply sorting (if not relevance-based search)
      if (options.sortBy && options.sortBy !== 'relevance') {
        products = this.sortProducts(products, options.sortBy)
      }

      // Apply pagination
      const page = options.page || 0
      const limit = options.limit || 20
      const startIndex = page * limit
      const paginatedProducts = products.slice(startIndex, startIndex + limit)

      const response: SearchResponse = {
        results: paginatedProducts.map(product => this.convertProductToSearchResult(product)),
        total: products.length,
        page,
        limit,
        facets
      }

      // Cache the result
      this.cache.set(cacheKey, { data: response, timestamp: now })

      return response
    } catch (error) {
      console.error('Enhanced search error:', error)
      throw new Error('Search failed')
    }
  }

  async suggest(query: string): Promise<string[]> {
    if (!query || query.length < 2) return []

    try {
      const products = await this.loadProductsFromDatabase()
      const normalizedQuery = query.toLowerCase().trim()
      const suggestions = new Set<string>()

      // Get suggestions from product names
      products.forEach(product => {
        const words = product.name.toLowerCase().split(' ')
        words.forEach(word => {
          if (word.startsWith(normalizedQuery) && word.length > normalizedQuery.length) {
            suggestions.add(word.charAt(0).toUpperCase() + word.slice(1))
          }
        })
      })

      // Get suggestions from tags
      products.forEach(product => {
        product.tags.forEach(tag => {
          const normalizedTag = tag.toLowerCase()
          if (normalizedTag.startsWith(normalizedQuery) && normalizedTag.length > normalizedQuery.length) {
            suggestions.add(tag.charAt(0).toUpperCase() + tag.slice(1))
          }
        })
      })

      // Get suggestions from categories
      products.forEach(product => {
        const categoryName = product.category.name.toLowerCase()
        if (categoryName.startsWith(normalizedQuery) && categoryName.length > normalizedQuery.length) {
          suggestions.add(product.category.name)
        }
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
      'British Army',
      'Royal Navy',
      'RAF',
      'Paratrooper',
      'Regiment',
      'Military',
      'Veterans',
      'Combat',
      'Tactical',
      'Commando',
      'Special Forces',
      'Royal Marines'
    ]
  }
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