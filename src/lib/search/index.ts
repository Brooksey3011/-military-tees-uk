// Search service exports
export type {
  SearchResult,
  SearchFilters,
  SearchOptions,
  SearchResponse,
  SearchService
} from './search-service'

export { BaseSearchService } from './search-service'
export { AlgoliaSearchService } from './algolia-search'
export { CustomSearchService } from './custom-search'
export { searchProvider, getSearchService } from './search-provider'
export type { SearchConfig } from './search-provider'