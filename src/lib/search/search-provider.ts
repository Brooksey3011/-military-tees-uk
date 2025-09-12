import { SearchService } from './search-service'
import { AlgoliaSearchService } from './algolia-search'
import { CustomSearchService } from './custom-search'
import { EnhancedSearchService } from './enhanced-search'
import { ApiSearchService } from './api-search'

export interface SearchConfig {
  provider: 'algolia' | 'custom' | 'enhanced' | 'api'
  algolia?: {
    appId: string
    searchApiKey: string
    indexName: string
  }
}

class SearchProvider {
  private service: SearchService | null = null
  private config: SearchConfig | null = null

  initialize(config: SearchConfig) {
    this.config = config

    switch (config.provider) {
      case 'algolia':
        if (!config.algolia) {
          throw new Error('Algolia configuration is required when using Algolia provider')
        }
        this.service = new AlgoliaSearchService(config.algolia)
        break
      
      case 'api':
        this.service = new ApiSearchService()
        break
      
      case 'enhanced':
        this.service = new EnhancedSearchService()
        break
      
      case 'custom':
        this.service = new CustomSearchService()
        break
      
      default:
        throw new Error(`Unknown search provider: ${config.provider}`)
    }
  }

  getService(): SearchService {
    if (!this.service) {
      // Fallback to API search if not initialized - do this silently
      this.service = new ApiSearchService()
    }
    return this.service
  }

  isInitialized(): boolean {
    return this.service !== null
  }

  getConfig(): SearchConfig | null {
    return this.config
  }
}

// Export singleton instance
export const searchProvider = new SearchProvider()

// Initialize with environment variables or fallback to custom
const initializeSearchProvider = () => {
  const algoliaAppId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID
  const algoliaSearchKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY
  const algoliaIndexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || 'products'

  if (algoliaAppId && algoliaSearchKey) {
    // Use Algolia if credentials are available
    searchProvider.initialize({
      provider: 'algolia',
      algolia: {
        appId: algoliaAppId,
        searchApiKey: algoliaSearchKey,
        indexName: algoliaIndexName
      }
    })
    // Algolia search initialized
  } else {
    // Fallback to API search (uses working /api/products endpoint)
    searchProvider.initialize({
      provider: 'api'
    })
    // API search initialized
  }
}

// Auto-initialize on import
if (typeof window !== 'undefined') {
  // Client-side initialization
  initializeSearchProvider()
} else {
  // Server-side - initialize on first use
  process.nextTick(() => {
    initializeSearchProvider()
  })
}

// Convenience function to get the search service
export const getSearchService = (): SearchService => {
  return searchProvider.getService()
}