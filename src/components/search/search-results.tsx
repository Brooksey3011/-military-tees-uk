"use client"

import * as React from "react"
import { Search, Filter, Grid, List, SortAsc } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ProductGrid } from "@/components/product/product-grid"
import { FilterControls } from "@/components/product/filter-controls"
import { ProductViewToggle } from "@/components/ui/product-view-toggle"
import { useProductView } from "@/hooks/use-product-view"
import { cn } from "@/lib/utils"
import { getSearchService } from "@/lib/search/search-provider"
import type { SearchResult, SearchFilters } from "@/lib/search/search-service"

interface FilterGroup {
  id: string
  label: string
  type: 'checkbox' | 'radio' | 'range' | 'select'
  options?: Array<{ id: string; label: string; value: string; count?: number }>
  min?: number
  max?: number
  step?: number
}

interface ActiveFilter {
  groupId: string
  groupLabel: string
  optionId: string
  optionLabel: string
  value: string
}

interface SearchResultsProps {
  query?: string
  initialFilters?: SearchFilters
  className?: string
}

export function SearchResults({
  query: initialQuery = "",
  initialFilters = {},
  className
}: SearchResultsProps) {
  const [query, setQuery] = React.useState(initialQuery)
  const [results, setResults] = React.useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [total, setTotal] = React.useState(0)
  const [page, setPage] = React.useState(0)
  const [sortBy, setSortBy] = React.useState<string>('relevance')
  const [showFilters, setShowFilters] = React.useState(false)
  
  // Use global product view state
  const { view, setView } = useProductView()
  
  // Filter state
  const [activeFilters, setActiveFilters] = React.useState<ActiveFilter[]>([])
  const [filters, setFilters] = React.useState<SearchFilters>(initialFilters)
  const [facets, setFacets] = React.useState<any>(null)

  // Filter groups configuration
  const filterGroups: FilterGroup[] = React.useMemo(() => [
    {
      id: 'category',
      label: 'Category',
      type: 'checkbox',
      options: facets?.categories?.map((cat: any) => ({
        id: cat.name.toLowerCase(),
        label: cat.name,
        value: cat.name,
        count: cat.count
      })) || []
    },
    {
      id: 'price',
      label: 'Price Range',
      type: 'range',
      min: 0,
      max: 100,
      step: 5
    },
    {
      id: 'colors',
      label: 'Colors',
      type: 'checkbox',
      options: facets?.colors?.map((color: any) => ({
        id: color.name.toLowerCase(),
        label: color.name.charAt(0).toUpperCase() + color.name.slice(1),
        value: color.name,
        count: color.count
      })) || []
    },
    {
      id: 'sizes',
      label: 'Sizes',
      type: 'checkbox',
      options: facets?.sizes?.map((size: any) => ({
        id: size.name.toLowerCase(),
        label: size.name,
        value: size.name,
        count: size.count
      })) || []
    },
    {
      id: 'rating',
      label: 'Minimum Rating',
      type: 'select',
      options: [
        { id: '4', label: '4+ Stars', value: '4' },
        { id: '3', label: '3+ Stars', value: '3' },
        { id: '2', label: '2+ Stars', value: '2' },
        { id: '1', label: '1+ Stars', value: '1' }
      ]
    },
    {
      id: 'availability',
      label: 'Availability',
      type: 'checkbox',
      options: [
        { id: 'instock', label: 'In Stock', value: 'instock' },
        { id: 'new', label: 'New Products', value: 'new' },
        { id: 'sale', label: 'On Sale', value: 'sale' }
      ]
    }
  ], [facets])

  // Perform search
  const performSearch = React.useCallback(async (
    searchQuery: string,
    searchFilters: SearchFilters,
    searchPage: number = 0,
    searchSortBy: string = 'relevance'
  ) => {
    setIsLoading(true)
    try {
      const searchService = getSearchService()
      
      const response = await searchService.search({
        query: searchQuery,
        filters: searchFilters,
        sortBy: searchSortBy as any,
        page: searchPage,
        limit: 20,
        facets: true
      })

      setResults(response.results)
      setTotal(response.total)
      setPage(response.page)
      setFacets(response.facets)
    } catch (error) {
      console.error('Search failed:', error)
      setResults([])
      setTotal(0)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial search
  React.useEffect(() => {
    performSearch(query, filters, page, sortBy)
  }, [query, filters, page, sortBy, performSearch])

  // Handle filter changes
  const handleFilterChange = (groupId: string, optionId: string, value: string, action: 'add' | 'remove') => {
    setFilters(prev => {
      const newFilters = { ...prev }

      switch (groupId) {
        case 'category':
          if (action === 'add') {
            newFilters.category = [...(prev.category || []), value]
          } else {
            newFilters.category = (prev.category || []).filter(c => c !== value)
          }
          break

        case 'colors':
          if (action === 'add') {
            newFilters.colors = [...(prev.colors || []), value]
          } else {
            newFilters.colors = (prev.colors || []).filter(c => c !== value)
          }
          break

        case 'sizes':
          if (action === 'add') {
            newFilters.sizes = [...(prev.sizes || []), value]
          } else {
            newFilters.sizes = (prev.sizes || []).filter(s => s !== value)
          }
          break

        case 'rating':
          if (action === 'add') {
            newFilters.rating = parseInt(value)
          } else {
            delete newFilters.rating
          }
          break

        case 'availability':
          if (optionId === 'instock') {
            newFilters.inStock = action === 'add'
          } else if (optionId === 'new') {
            newFilters.isNew = action === 'add'
          } else if (optionId === 'sale') {
            newFilters.isSale = action === 'add'
          }
          break
      }

      return newFilters
    })

    // Update active filters
    if (action === 'add') {
      const group = filterGroups.find(g => g.id === groupId)
      const option = group?.options?.find(o => o.id === optionId)
      
      if (group && option) {
        setActiveFilters(prev => [...prev, {
          groupId,
          groupLabel: group.label,
          optionId,
          optionLabel: option.label,
          value
        }])
      }
    } else {
      setActiveFilters(prev => prev.filter(f => 
        !(f.groupId === groupId && f.optionId === optionId)
      ))
    }

    // Reset to first page when filters change
    setPage(0)
  }

  const handleClearAllFilters = () => {
    setFilters({})
    setActiveFilters([])
    setPage(0)
  }

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'newest', label: 'Newest' },
    { value: 'name', label: 'Name A-Z' }
  ]

  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {/* Search Header */}
      <div className="border-b-2 border-border bg-muted/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold tracking-wide uppercase text-foreground">
                {query ? `Search Results for "${query}"` : 'All Products'}
              </h1>
              <p className="text-muted-foreground mt-1">
                {isLoading ? 'Searching...' : `${total} products found`}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Super Visible View Toggle */}
              <ProductViewToggle onViewChange={setView} />

              {/* Sort Dropdown */}
              <Select
                options={sortOptions}
                value={sortBy}
                onValueChange={setSortBy}
                className="rounded-none border-2"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-4">
              <div className="flex items-center justify-between mb-4 lg:hidden">
                <Button
                  variant="outline"
                  className="rounded-none border-2"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters {activeFilters.length > 0 && `(${activeFilters.length})`}
                </Button>
              </div>

              <div className={cn(
                "lg:block",
                showFilters ? "block" : "hidden"
              )}>
                <FilterControls
                  filterGroups={filterGroups}
                  activeFilters={activeFilters}
                  onFilterChange={handleFilterChange}
                  onClearAll={handleClearAllFilters}
                  layout="vertical"
                  showFilterCount={true}
                />
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="bg-muted rounded-none h-80 animate-pulse"></div>
                ))}
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-6">
                <div className={cn(
                  view === 'grid' ? 'product-grid-view' : 'product-list-view',
                  "transition-all duration-300 ease-in-out"
                )}>
                  <ProductGrid 
                    products={results.map(result => ({
                      id: result.id,
                      name: result.title,
                      price: result.price || 0,
                      image: result.image || '',
                      category: result.category || '',
                      rating: result.rating || 0,
                      reviewCount: result.reviewCount || 0,
                      isNew: result.isNew,
                      isSale: result.isSale,
                      slug: result.url.replace('/products/', '')
                    }))}
                    className={cn(
                      "product-card h-full",
                      view === 'list' ? 'list-card' : 'grid-card'
                    )}
                  />
                </div>

                {/* Load More / Pagination */}
                {total > results.length && (
                  <div className="text-center">
                    <Button
                      variant="outline"
                      className="rounded-none border-2"
                      onClick={() => setPage(prev => prev + 1)}
                      disabled={isLoading}
                    >
                      Load More Products
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-display font-bold text-foreground mb-2">
                  No products found
                </h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your search terms or filters
                </p>
                <Button
                  variant="outline"
                  className="rounded-none border-2"
                  onClick={handleClearAllFilters}
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}