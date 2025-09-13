import * as React from "react"
import { Metadata } from "next"
import { Layout } from "@/components/layout"
import { SimpleSearchResults } from "@/components/search/simple-search-results"
import { SimpleSearchBar } from "@/components/search/simple-search-bar"

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

  return (
    <Layout>
      {/* Search Bar */}
      <div className="border-b-2 border-border bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-2xl mx-auto">
            <SimpleSearchBar
              placeholder="Search for military tees, categories, or designs..."
              defaultValue={query}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Search Results */}
      <SimpleSearchResults 
        query={query}
        category={category}
      />
    </Layout>
  )
}