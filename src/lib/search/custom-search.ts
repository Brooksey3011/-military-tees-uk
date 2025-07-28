import { 
  BaseSearchService, 
  SearchOptions, 
  SearchResponse, 
  SearchResult, 
  SearchFilters 
} from './search-service'
import { supabase } from '@/lib/supabase'

interface DatabaseProduct {
  id: string
  name: string
  slug: string
  description: string
  price: number
  compare_at_price?: number
  main_image_url?: string
  is_featured: boolean
  is_active: boolean
  tags: string[]
  created_at: string
  categories: {
    id: string
    name: string
    slug: string
  } | null
  product_variants: Array<{
    id: string
    size?: string
    color?: string
    sku: string
    stock_quantity: number
    price_adjustment: number
    image_urls: string[]
    is_active: boolean
  }>
  averageRating?: number
  reviewCount?: number
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  images: string[]
  category: string
  slug: string
  rating: number
  reviewCount: number
  tags: string[]
  variants: Array<{
    id: string
    size: string
    color: string
    stock: number
  }>
  isNew?: boolean
  isSale?: boolean
  createdAt: string
}

export class CustomSearchService extends BaseSearchService {
  private products: Product[] = []
  private searchHistory: string[] = []
  private lastFetch: number = 0
  private cacheTimeout: number = 5 * 60 * 1000 // 5 minutes

  constructor() {
    super()
  }

  private async loadProductsFromDatabase(): Promise<void> {
    // Check if we need to refresh the cache
    const now = Date.now()
    if (this.products.length > 0 && (now - this.lastFetch) < this.cacheTimeout) {
      return
    }

    try {
      const { data: dbProducts, error } = await supabase
        .from('products')
        .select(`
          *,
          categories!category_id (
            id,
            name,
            slug
          ),
          product_variants!inner (
            id,
            size,
            color,
            sku,
            stock_quantity,
            price_adjustment,
            image_urls,
            is_active
          )
        `)
        .eq('is_active', true)
        .eq('product_variants.is_active', true)

      if (error) {
        console.error('Error loading products:', error)
        return
      }

      // Transform database products to internal format
      this.products = await Promise.all(
        (dbProducts || []).map(async (dbProduct: DatabaseProduct): Promise<Product> => {
          // Get reviews for average rating
          const { data: reviews } = await supabase
            .from('reviews')
            .select('rating')
            .eq('product_id', dbProduct.id)
            .eq('is_approved', true)

          const averageRating = reviews && reviews.length > 0
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
            : 0

          // Determine if product is new (created within last 30 days)
          const createdDate = new Date(dbProduct.created_at)
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          const isNew = createdDate > thirtyDaysAgo

          // Determine if product is on sale
          const isSale = Boolean(dbProduct.compare_at_price && dbProduct.compare_at_price > dbProduct.price)

          return {
            id: dbProduct.id,
            name: dbProduct.name,
            description: dbProduct.description || '',
            price: dbProduct.price,
            originalPrice: dbProduct.compare_at_price,
            images: dbProduct.main_image_url ? [dbProduct.main_image_url] : ['/placeholder-product.jpg'],
            category: dbProduct.categories?.name || 'Uncategorized',
            slug: dbProduct.slug,
            rating: Math.round(averageRating * 10) / 10,
            reviewCount: reviews?.length || 0,
            tags: dbProduct.tags || [],
            variants: dbProduct.product_variants.map(variant => ({
              id: variant.id,
              size: variant.size || '',
              color: variant.color || '',
              stock: variant.stock_quantity
            })),
            isNew,
            isSale,
            createdAt: dbProduct.created_at
          }
        })
      )

      this.lastFetch = now
    } catch (error) {
      console.error('Error transforming products:', error)
    }
  }

  private normalizeText(text: string): string {
    return text.toLowerCase().trim()
  }

  private calculateRelevanceScore(product: Product, query: string): number {
    if (!query) return 1

    const normalizedQuery = this.normalizeText(query)
    let score = 0

    // Exact name match (highest priority)
    if (this.normalizeText(product.name).includes(normalizedQuery)) {
      score += 10
    }

    // Tag matches
    const matchingTags = product.tags.filter(tag => 
      this.normalizeText(tag).includes(normalizedQuery)
    ).length
    score += matchingTags * 5

    // Description match
    if (product.description && this.normalizeText(product.description).includes(normalizedQuery)) {
      score += 3
    }

    // Category match
    if (this.normalizeText(product.category).includes(normalizedQuery)) {
      score += 2
    }

    // Boost popular products
    if (product.rating > 4.5) {
      score += 1
    }

    return score
  }

  private applyFilters(products: Product[], filters: SearchFilters): Product[] {
    return products.filter(product => {
      // Category filter
      if (filters.category?.length && !filters.category.includes(product.category)) {
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
        const productColors = product.variants.map(v => v.color)
        if (!filters.colors.some(color => productColors.includes(color))) {
          return false
        }
      }

      // Sizes filter
      if (filters.sizes?.length) {
        const productSizes = product.variants.map(v => v.size)
        if (!filters.sizes.some(size => productSizes.includes(size))) {
          return false
        }
      }

      // Rating filter
      if (filters.rating && product.rating < filters.rating) {
        return false
      }

      // In stock filter
      if (filters.inStock) {
        const hasStock = product.variants.some(v => v.stock > 0)
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

  private sortProducts(products: Product[], sortBy: string): Product[] {
    const sortedProducts = [...products]

    switch (sortBy) {
      case 'price_asc':
        return sortedProducts.sort((a, b) => a.price - b.price)
      
      case 'price_desc':
        return sortedProducts.sort((a, b) => b.price - a.price)
      
      case 'rating':
        return sortedProducts.sort((a, b) => b.rating - a.rating)
      
      case 'newest':
        return sortedProducts.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      
      case 'name':
        return sortedProducts.sort((a, b) => a.name.localeCompare(b.name))
      
      case 'relevance':
      default:
        return sortedProducts // Already sorted by relevance in search method
    }
  }

  private convertProductToSearchResult(product: Product): SearchResult {
    return {
      id: product.id,
      title: product.name,
      type: 'product',
      description: product.description,
      image: product.images[0],
      price: product.price,
      originalPrice: product.originalPrice,
      category: product.category,
      url: `/products/${product.slug}`,
      rating: product.rating,
      reviewCount: product.reviewCount,
      tags: product.tags,
      isNew: product.isNew,
      isSale: product.isSale
    }
  }

  private generateFacets(products: Product[]) {
    const categories = new Map<string, number>()
    const colors = new Map<string, number>()
    const sizes = new Map<string, number>()

    products.forEach(product => {
      // Categories
      categories.set(product.category, (categories.get(product.category) || 0) + 1)

      // Colors and sizes from variants
      product.variants.forEach(variant => {
        colors.set(variant.color, (colors.get(variant.color) || 0) + 1)
        sizes.set(variant.size, (sizes.get(variant.size) || 0) + 1)
      })
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
    // Load products from database first
    await this.loadProductsFromDatabase()
    
    let results = [...this.products]

    // Apply text search if query provided
    if (options.query) {
      results = results
        .map(product => ({
          product,
          score: this.calculateRelevanceScore(product, options.query!)
        }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .map(({ product }) => product)
    }

    // Apply filters
    if (options.filters) {
      results = this.applyFilters(results, options.filters)
    }

    // Generate facets before pagination if requested
    const facets = options.facets ? this.generateFacets(results) : undefined

    // Apply sorting
    if (options.sortBy && options.sortBy !== 'relevance') {
      results = this.sortProducts(results, options.sortBy)
    }

    // Apply pagination
    const page = options.page || 0
    const limit = options.limit || 20
    const startIndex = page * limit
    const paginatedResults = results.slice(startIndex, startIndex + limit)

    return {
      results: paginatedResults.map(product => this.convertProductToSearchResult(product)),
      total: results.length,
      page,
      limit,
      facets
    }
  }

  async suggest(query: string): Promise<string[]> {
    if (!query || query.length < 2) return []

    // Load products from database first
    await this.loadProductsFromDatabase()

    const normalizedQuery = this.normalizeText(query)
    const suggestions = new Set<string>()

    // Get suggestions from product names
    this.products.forEach(product => {
      const words = this.normalizeText(product.name).split(' ')
      words.forEach(word => {
        if (word.startsWith(normalizedQuery) && word.length > normalizedQuery.length) {
          suggestions.add(word)
        }
      })
    })

    // Get suggestions from tags
    this.products.forEach(product => {
      product.tags.forEach(tag => {
        const normalizedTag = this.normalizeText(tag)
        if (normalizedTag.startsWith(normalizedQuery) && normalizedTag.length > normalizedQuery.length) {
          suggestions.add(tag)
        }
      })
    })

    return Array.from(suggestions).slice(0, 5)
  }

  async trackSearch(query: string): Promise<void> {
    // Add to search history
    this.searchHistory.unshift(query)
    this.searchHistory = this.searchHistory.slice(0, 50) // Keep last 50 searches
    
    console.log('Custom search tracked:', query)
  }

  async getPopularSearches(): Promise<string[]> {
    // Return most frequent searches from history
    const searchCounts = new Map<string, number>()
    
    this.searchHistory.forEach(search => {
      searchCounts.set(search, (searchCounts.get(search) || 0) + 1)
    })

    const popular = Array.from(searchCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([search]) => search)

    // Fallback to default if no history
    return popular.length > 0 ? popular : await super.getPopularSearches()
  }
}