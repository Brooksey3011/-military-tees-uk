"use client"

import * as React from "react"
import { Search, X, Clock, TrendingUp } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ProductImage } from "@/components/ui/product-image"
import { cn, formatPrice } from "@/lib/utils"
import type { Product } from "@/types"

interface SearchResult extends Product {
  matchScore?: number
  matchType?: 'name' | 'category' | 'description'
}

interface AdvancedSearchBarProps {
  onSearch?: (query: string) => void
  onProductSelect?: (product: Product) => void
  className?: string
  placeholder?: string
  products?: Product[]
}

// Fuzzy search implementation for typo-tolerance
const fuzzyMatch = (text: string, query: string): { score: number; matches: boolean } => {
  const textLower = text.toLowerCase()
  const queryLower = query.toLowerCase()
  
  // Exact match gets highest score
  if (textLower.includes(queryLower)) {
    return { score: 100, matches: true }
  }
  
  // Character-by-character fuzzy matching
  let score = 0
  let queryIndex = 0
  const queryChars = queryLower.split('')
  
  for (let i = 0; i < textLower.length && queryIndex < queryChars.length; i++) {
    if (textLower[i] === queryChars[queryIndex]) {
      score += 10
      queryIndex++
    } else if (Math.abs(textLower.charCodeAt(i) - queryChars[queryIndex].charCodeAt(0)) <= 1) {
      // Allow for typos (adjacent keys)
      score += 5
      queryIndex++
    }
  }
  
  // Bonus for matching all characters
  if (queryIndex === queryChars.length) {
    score += 20
  }
  
  return { score, matches: score > 30 }
}

const searchProducts = (products: Product[], query: string): SearchResult[] => {
  if (!query.trim()) return []
  
  const results: SearchResult[] = []
  
  products.forEach(product => {
    // Search in product name
    const nameMatch = fuzzyMatch(product.name, query)
    if (nameMatch.matches) {
      results.push({
        ...product,
        matchScore: nameMatch.score,
        matchType: 'name'
      })
      return
    }
    
    // Search in category name
    if (product.category?.name) {
      const categoryMatch = fuzzyMatch(product.category.name, query)
      if (categoryMatch.matches) {
        results.push({
          ...product,
          matchScore: categoryMatch.score * 0.8,
          matchType: 'category'
        })
        return
      }
    }
    
    // Search in description
    if (product.description) {
      const descMatch = fuzzyMatch(product.description, query)
      if (descMatch.matches) {
        results.push({
          ...product,
          matchScore: descMatch.score * 0.6,
          matchType: 'description'
        })
      }
    }
  })
  
  // Sort by match score descending, limit to 8 results
  return results
    .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
    .slice(0, 8)
}

export function AdvancedSearchBar({
  onSearch,
  onProductSelect,
  className,
  placeholder = "Search for products...",
  products = []
}: AdvancedSearchBarProps) {
  const [query, setQuery] = React.useState("")
  const [isOpen, setIsOpen] = React.useState(false)
  const [results, setResults] = React.useState<SearchResult[]>([])
  const [recentSearches, setRecentSearches] = React.useState<string[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const searchRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  
  // Load recent searches from localStorage on mount
  React.useEffect(() => {
    const saved = localStorage.getItem('military-tees-recent-searches')
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved))
      } catch (error) {
        console.error('Failed to load recent searches:', error)
      }
    }
  }, [])
  
  // Handle search with debouncing
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        setIsLoading(true)
        const searchResults = searchProducts(products, query)
        setResults(searchResults)
        setIsLoading(false)
      } else {
        setResults([])
      }
    }, 150) // 150ms debounce for instant feel
    
    return () => clearTimeout(timeoutId)
  }, [query, products])
  
  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
        inputRef.current?.blur()
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setIsOpen(true)
  }
  
  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return
    
    // Add to recent searches
    const updatedRecent = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5)
    setRecentSearches(updatedRecent)
    localStorage.setItem('military-tees-recent-searches', JSON.stringify(updatedRecent))
    
    onSearch?.(searchQuery)
    setIsOpen(false)
  }
  
  const handleProductSelect = (product: Product) => {
    onProductSelect?.(product)
    setIsOpen(false)
    setQuery("")
  }
  
  const handleRecentSearchClick = (recentQuery: string) => {
    setQuery(recentQuery)
    handleSearch(recentQuery)
  }
  
  const clearSearch = () => {
    setQuery("")
    setResults([])
    inputRef.current?.focus()
  }
  
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-primary/20 text-primary font-medium">
          {part}
        </mark>
      ) : part
    )
  }
  
  return (
    <div ref={searchRef} className={cn("relative w-full max-w-md", className)}>
      {/* Search Input - Military styling with sharp edges */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="search"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && query.trim()) {
              handleSearch(query)
            }
          }}
          placeholder={placeholder}
          className={cn(
            "pl-10 pr-10 w-full",
            "border-2 border-border",
            "rounded-none", // Sharp edges per military design mandate
            "focus:border-primary focus:ring-1 focus:ring-primary/20",
            "bg-background text-foreground"
          )}
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      
      {/* Search Results Dropdown */}
      <AnimatePresence>
        {isOpen && (query.trim() || recentSearches.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute top-full left-0 right-0 z-50 mt-1",
              "bg-background border-2 border-border", // Sharp military styling
              "rounded-none", // No rounded corners per design mandate
              "shadow-lg max-h-96 overflow-y-auto"
            )}
          >
            {/* Loading State */}
            {isLoading && (
              <div className="p-4 text-center">
                <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                <p className="text-sm text-muted-foreground mt-2">Searching...</p>
              </div>
            )}
            
            {/* Search Results */}
            {!isLoading && query.trim() && (
              <>
                {results.length > 0 ? (
                  <div className="p-2">
                    <div className="text-xs font-medium text-muted-foreground px-2 py-1 border-b">
                      SEARCH RESULTS ({results.length})
                    </div>
                    {results.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => handleProductSelect(product)}
                        className={cn(
                          "w-full p-3 flex items-center gap-3",
                          "hover:bg-muted transition-colors",
                          "border-b border-border/50 last:border-b-0",
                          "text-left"
                        )}
                      >
                        <ProductImage
                          src={product.main_image_url}
                          alt={product.name}
                          className="w-10 h-10 rounded-none" // Sharp edges
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {highlightMatch(product.name, query)}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-bold text-sm">
                              {formatPrice(product.price)}
                            </span>
                            {product.matchType && (
                              <Badge variant="secondary" className="text-xs">
                                {product.matchType}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      No products found for &ldquo;{query}&rdquo;
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Try different keywords or check spelling
                    </p>
                  </div>
                )}
              </>
            )}
            
            {/* Recent Searches */}
            {!query.trim() && recentSearches.length > 0 && (
              <div className="p-2">
                <div className="text-xs font-medium text-muted-foreground px-2 py-1 border-b">
                  RECENT SEARCHES
                </div>
                {recentSearches.map((recentQuery, index) => (
                  <button
                    key={index}
                    onClick={() => handleRecentSearchClick(recentQuery)}
                    className={cn(
                      "w-full p-2 flex items-center gap-2",
                      "hover:bg-muted transition-colors",
                      "text-left text-sm"
                    )}
                  >
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span>{recentQuery}</span>
                  </button>
                ))}
              </div>
            )}
            
            {/* Search All Results Link */}
            {query.trim() && results.length >= 8 && (
              <div className="p-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSearch(query)}
                  className="w-full justify-start text-primary hover:text-primary"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  See all results for &ldquo;{query}&rdquo;
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}