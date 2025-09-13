"use client"

import * as React from "react"
import { Search, X, TrendingUp, Clock, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface SearchResult {
  id: string
  title: string
  type: 'product' | 'category' | 'suggestion'
  description?: string
  image?: string
  price?: number
  category?: string
  url: string
}

interface SearchHistory {
  id: string
  query: string
  timestamp: Date
}

interface AdvancedSearchBarProps {
  placeholder?: string
  onSearch?: (query: string) => void
  onResultSelect?: (result: SearchResult) => void
  className?: string
  showHistory?: boolean
}

export function AdvancedSearchBar({
  placeholder = "Search military tees, categories, or brands...",
  onSearch,
  onResultSelect,
  className,
  showHistory = true
}: AdvancedSearchBarProps) {
  const [query, setQuery] = React.useState("")
  const [isOpen, setIsOpen] = React.useState(false)
  const [results, setResults] = React.useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [searchHistory, setSearchHistory] = React.useState<SearchHistory[]>([])

  const searchRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const [popularSearches, setPopularSearches] = React.useState<string[]>([])

  // Load popular searches on mount
  React.useEffect(() => {
    const loadPopularSearches = async () => {
      // Set fallback searches immediately
      const fallbackSearches = [
        'British Army',
        'Royal Navy', 
        'RAF',
        'Paratrooper',
        'Military',
        'Veterans'
      ]
      setPopularSearches(fallbackSearches)

      // Try to load from service
      try {
        const { getSearchService } = await import('@/lib/search/search-provider')
        const searchService = getSearchService()
        const popular = await searchService.getPopularSearches()
        if (popular && popular.length > 0) {
          setPopularSearches(popular)
        }
      } catch (error) {
        console.error('Failed to load popular searches:', error)
        // Keep fallback searches already set
      }
    }

    loadPopularSearches()
  }, [])

  // Real search with debounce
  React.useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const searchTimer = setTimeout(async () => {
      setIsLoading(true)
      try {
        const { getSearchService } = await import('@/lib/search/search-provider')
        const searchService = getSearchService()
        
        const response = await searchService.search({
          query,
          limit: 5, // Limit results for dropdown
          facets: false
        })
        
        setResults(response.results as any || [])
      } catch (error) {
        console.error('Search failed:', error)
        // Fallback to mock results for better UX
        setResults([
          {
            id: "search-" + Date.now(),
            title: `Search for "${query}"`,
            type: 'product' as const,  
            description: 'Find products matching your search',
            url: `/search?q=${encodeURIComponent(query)}`
          }
        ])
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => clearTimeout(searchTimer)
  }, [query])

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return

    // Add to search history
    const newHistoryItem: SearchHistory = {
      id: Date.now().toString(),
      query: searchQuery,
      timestamp: new Date()
    }
    setSearchHistory(prev => [newHistoryItem, ...prev.slice(0, 4)]) // Keep last 5 searches

    // Track search in service
    try {
      const { getSearchService } = await import('@/lib/search/search-provider')
      const searchService = getSearchService()
      await searchService.trackSearch(searchQuery)
    } catch (error) {
      console.error('Failed to track search:', error)
      // Don't block the search if tracking fails
    }

    onSearch?.(searchQuery)
    setIsOpen(false)
  }

  const handleResultClick = (result: SearchResult) => {
    onResultSelect?.(result)
    setQuery("")
    setIsOpen(false)
  }

  const clearSearch = () => {
    setQuery("")
    setResults([])
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch(query)
    } else if (e.key === "Escape") {
      setIsOpen(false)
    }
  }

  return (
    <div ref={searchRef} className={cn("relative w-full max-w-2xl", className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-10 rounded-none border-2 border-border focus:border-primary"
        />
        {query && (
          <Button
            size="sm"
            variant="ghost"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 rounded-none"
            onClick={clearSearch}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Search Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border-2 border-border rounded-none shadow-lg z-50 max-h-96 overflow-y-auto">
          
          {/* Loading State */}
          {isLoading && (
            <div className="p-4 text-center text-muted-foreground">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
              Searching...
            </div>
          )}

          {/* Search Results */}
          {!isLoading && results.length > 0 && (
            <div className="py-2">
              <div className="px-3 py-2 text-xs font-display font-bold tracking-wide uppercase text-muted-foreground border-b border-border">
                Search Results
              </div>
              {results.map((result) => (
                <button
                  key={result.id}
                  className="w-full px-3 py-3 text-left hover:bg-muted/20 flex items-center gap-3 border-b border-border/50 last:border-b-0"
                  onClick={() => handleResultClick(result)}
                >
                  {result.image && (
                    <div className="w-10 h-10 bg-muted rounded-none border border-border flex-shrink-0">
                      {/* Placeholder for product image */}
                      <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/20"></div>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium text-foreground truncate">
                        {result.title}
                      </h4>
                      <Badge className="rounded-none text-xs" variant="outline">
                        {result.type}
                      </Badge>
                    </div>
                    {result.description && (
                      <p className="text-xs text-muted-foreground truncate">
                        {result.description}
                      </p>
                    )}
                    {result.price && (
                      <p className="text-sm font-bold text-primary">
                        £{result.price.toFixed(2)}
                      </p>
                    )}
                  </div>
                  {result.category && (
                    <Badge className="rounded-none bg-primary/10 text-primary">
                      {result.category}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {!isLoading && query && results.length === 0 && (
            <div className="p-4 text-center text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No results found for "{query}"</p>
              <Button
                size="sm"
                variant="outline"
                className="rounded-none mt-2"
                onClick={() => handleSearch(query)}
              >
                Search anyway
              </Button>
            </div>
          )}

          {/* Search History */}
          {!query && showHistory && searchHistory.length > 0 && (
            <div className="py-2">
              <div className="px-3 py-2 text-xs font-display font-bold tracking-wide uppercase text-muted-foreground border-b border-border flex items-center gap-2">
                <Clock className="h-3 w-3" />
                Recent Searches
              </div>
              {searchHistory.map((item) => (
                <button
                  key={item.id}
                  className="w-full px-3 py-2 text-left hover:bg-muted/20 flex items-center gap-3 text-sm"
                  onClick={() => {
                    setQuery(item.query)
                    handleSearch(item.query)
                  }}
                >
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-foreground">{item.query}</span>
                </button>
              ))}
            </div>
          )}

          {/* Popular Searches */}
          {!query && (
            <div className="py-2">
              <div className="px-3 py-2 text-xs font-display font-bold tracking-wide uppercase text-muted-foreground border-b border-border flex items-center gap-2">
                <TrendingUp className="h-3 w-3" />
                Popular Searches
              </div>
              <div className="p-3 flex flex-wrap gap-2">
                {popularSearches.map((search) => (
                  <Button
                    key={search}
                    size="sm"
                    variant="outline"
                    className="rounded-none text-xs h-7"
                    onClick={() => {
                      setQuery(search)
                      handleSearch(search)
                    }}
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {search}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="border-t border-border p-2 bg-muted/10">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="rounded-none text-xs flex-1"
                onClick={() => console.log("Advanced search")}
              >
                Advanced Search
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="rounded-none text-xs flex-1"
                onClick={() => console.log("Browse all")}
              >
                Browse All
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}