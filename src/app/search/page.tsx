import * as React from "react"
import { Metadata } from "next"
import { Layout } from "@/components/layout"
import { SearchResults } from "@/components/search/search-results"
import { AdvancedSearchBar } from "@/components/search/advanced-search-bar"

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const params = await searchParams
  const query = typeof params.q === 'string' ? params.q : ''
  
  return {
    title: query 
      ? `Search results for "${query}" | Military Tees UK`
      : 'Search Products | Military Tees UK',
    description: query
      ? `Find military-themed apparel and accessories matching "${query}". Browse our collection of army, navy, and RAF designs.`
      : 'Search our complete collection of military-themed apparel and accessories. Find army, navy, RAF, and veteran designs.',
    openGraph: {
      title: query 
        ? `Search results for "${query}" | Military Tees UK`
        : 'Search Products | Military Tees UK',
      description: query
        ? `Find military-themed apparel matching "${query}"`
        : 'Search military-themed apparel and accessories',
      type: 'website',
    }
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const query = typeof params.q === 'string' ? params.q : ''
  const category = typeof params.category === 'string' ? params.category : undefined
  const minPrice = typeof params.min_price === 'string' ? parseFloat(params.min_price) : undefined
  const maxPrice = typeof params.max_price === 'string' ? parseFloat(params.max_price) : undefined
  const colors = typeof params.colors === 'string' ? params.colors.split(',') : undefined
  const sizes = typeof params.sizes === 'string' ? params.sizes.split(',') : undefined
  const inStock = params.in_stock === 'true'
  const isNew = params.new === 'true'
  const isSale = params.sale === 'true'
  const rating = typeof params.rating === 'string' ? parseInt(params.rating) : undefined

  const initialFilters = {
    ...(category && { category: [category] }),
    ...(minPrice !== undefined && maxPrice !== undefined && { 
      priceRange: { min: minPrice, max: maxPrice } 
    }),
    ...(colors && { colors }),
    ...(sizes && { sizes }),
    ...(inStock && { inStock }),
    ...(isNew && { isNew }),
    ...(isSale && { isSale }),
    ...(rating && { rating })
  }

  return (
    <Layout>
      {/* Search Bar */}
      <div className="border-b-2 border-border bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-2xl mx-auto">
            <AdvancedSearchBar
              placeholder="Search for military tees, categories, or designs..."
              showHistory={true}
              onSearch={(searchQuery) => {
                // Update URL with new search query
                const url = new URL(window.location.href)
                url.searchParams.set('q', searchQuery)
                window.history.pushState({}, '', url.toString())
                window.location.reload()
              }}
              onResultSelect={(result) => {
                // Navigate to selected result
                window.location.href = result.url
              }}
            />
          </div>
        </div>
      </div>

      {/* Search Results */}
      <SearchResults 
        query={query}
        initialFilters={initialFilters}
      />
    </Layout>
  )
}