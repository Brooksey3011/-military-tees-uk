"use client"

import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Filter, SortAsc } from "lucide-react"
import { Layout } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { ProductGrid } from "@/components/product/product-grid"
import { EmptyProductGrid, ProductGridSkeleton } from "@/components/ui"
import { useProducts } from "@/hooks/use-products"
import { cn } from "@/lib/utils"
import { use } from "react"

// Category data matching navbar structure
const categoryData: Record<string, { 
  name: string
  description: string
  longDescription: string
}> = {
  "armoury": {
    name: "Armoury",
    description: "Tactical and combat gear themed tees",
    longDescription: "Discover our collection of tactical and combat gear inspired designs. From military hardware to specialist equipment, these tees celebrate the tools of the trade that keep our forces ready for action."
  },
  "regimental-hq": {
    name: "Regimental HQ", 
    description: "Command and leadership designs",
    longDescription: "Command respect with designs inspired by military leadership and regimental traditions. Perfect for those who understand the importance of structure, discipline, and leading from the front."
  },
  "mess-hall": {
    name: "Mess Hall",
    description: "Military dining and camaraderie", 
    longDescription: "Celebrate the bonds forged over shared meals and military camaraderie. These designs capture the spirit of mess hall culture, where friendships are made and stories are shared."
  },
  "parade-square": {
    name: "Parade Square",
    description: "Ceremonial and dress uniform styles",
    longDescription: "Honor military tradition with designs inspired by ceremonial duties and dress uniforms. From changing of the guard to remembrance parades, celebrate the pomp and ceremony of military life."
  },
  "med-centre": {
    name: "Med Centre", 
    description: "Military medical corps designs",
    longDescription: "Salute the unsung heroes of the medical corps. These designs honor the medics, nurses, and medical professionals who serve on the front lines of military healthcare."
  },
  "mt": {
    name: "Motor Transport",
    description: "Vehicle and logistics themed",
    longDescription: "Keep the wheels turning with designs celebrating military transport and logistics. From armoured vehicles to supply convoys, honor those who keep the military machine moving."
  },
  "signals": {
    name: "Signals", 
    description: "Communications corps gear",
    longDescription: "Stay connected with designs inspired by military communications. From radio operators to cyber specialists, celebrate the vital role of keeping forces in contact."
  },
  "ops-room": {
    name: "Operations Room",
    description: "Strategic operations themed", 
    longDescription: "Command and control designs for strategic thinkers. These pieces celebrate the planning, coordination, and decision-making that happens behind the scenes of military operations."
  },
  "naafi": {
    name: "NAAFI",
    description: "Navy, Army and Air Force Institutes",
    longDescription: "Celebrate the institution that's been serving forces since 1921. NAAFI designs honor the shops, cafes, and services that provide a taste of home for military personnel worldwide."
  },
  "gym": {
    name: "Gym", 
    description: "Physical training and fitness",
    longDescription: "No pain, no gain. Our gym collection celebrates military fitness culture, from early morning PT sessions to the dedication required to maintain peak physical condition."
  },
  "guard-room": {
    name: "Guard Room",
    description: "Security and duty themed",
    longDescription: "Stand to attention with designs honoring guard duty and military security. From sentry duty to close protection, celebrate those who keep watch while others sleep."
  },
  "sgts-mess": {
    name: "Sergeants' Mess", 
    description: "NCO and leadership designs",
    longDescription: "Honor the backbone of the military - the Non-Commissioned Officers. These designs celebrate the experience, leadership, and mentorship that sergeants bring to every unit."
  },
  "stores": {
    name: "The Stores",
    description: "Supply and logistics gear",
    longDescription: "Everything you need, when you need it. Our stores collection celebrates the supply chain specialists who ensure forces have the right equipment at the right time."
  },
  "training-wing": {
    name: "Training Wing",
    description: "Military education and training", 
    longDescription: "Train hard, fight easy. Designs celebrating military education, from basic training to advanced specialist courses. Honor the instructors and students who never stop learning."
  },
  "block": {
    name: "The Block",
    description: "Barracks and accommodation themed",
    longDescription: "Home away from home. Our block collection celebrates military accommodation culture, from shared rooms to the unique bonds formed in barracks life."
  },
  "ranges": {
    name: "The Ranges", 
    description: "Shooting and marksmanship designs",
    longDescription: "Precision and accuracy define military marksmanship. These designs celebrate shooting sports, range culture, and the discipline required for expert marksmanship."
  },
  "civvy-street": {
    name: "Civvy Street",
    description: "Civilian life transition gear",
    longDescription: "The transition from military to civilian life is a journey many face. These designs celebrate veterans adapting to civilian life while maintaining their military values."
  },
  "g10-stores": {
    name: "G10 Stores", 
    description: "General stores and supplies",
    longDescription: "General stores for general needs. Our G10 collection covers all the miscellaneous supplies and equipment that keep military operations running smoothly."
  }
}

interface CategoryPageProps {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<{
    search?: string
    sort?: string
    page?: string
  }>
}

export default function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = use(params)
  const category = categoryData[slug]
  
  if (!category) {
    notFound()
  }

  // Get category slug for API query - map display names to database slugs
  const categorySlugMap: Record<string, string> = {
    'armoury': 'armoury',
    'regimental-hq': 'regimental-hq', 
    'mess-hall': 'mess-hall',
    'parade-square': 'parade-square',
    'med-centre': 'med-centre',
    'mt': 'mt',
    'signals': 'signals',
    'ops-room': 'ops-room',
    'naafi': 'naafi',
    'gym': 'gym',
    'guard-room': 'guard-room',
    'sgts-mess': 'sgts-mess',
    'stores': 'stores',
    'training-wing': 'training-wing',
    'block': 'block',
    'ranges': 'ranges',
    'civvy-street': 'civvy-street',
    'g10-stores': 'g10-stores'
  }

  const categorySlug = categorySlugMap[slug]
  
  // Use the products hook to fetch real data
  const { products, loading, error } = useProducts({
    category: categorySlug,
    limit: 20
  })
  
  return (
    <Layout>
      <div className="min-h-screen bg-background">
      {/* Breadcrumb Navigation */}
      <div className="border-b border-border/50 bg-muted/10">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link 
              href="/" 
              className="hover:text-foreground transition-colors"
            >
              Home
            </Link>
            <span>/</span>
            <Link 
              href="/categories" 
              className="hover:text-foreground transition-colors"
            >
              Camp Map
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">{category.name}</span>
          </nav>
        </div>
      </div>

      {/* Category Header */}
      <section className="border-b-2 border-border bg-muted/10">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl">
            <Link 
              href="/categories"
              className={cn(
                "inline-flex items-center gap-2 text-sm text-muted-foreground",
                "hover:text-foreground transition-colors mb-6"
              )}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Camp Map
            </Link>
            
            <h1 className={cn(
              "text-3xl md:text-5xl font-display font-bold text-foreground mb-4",
              "tracking-wider uppercase" // Military stencil feel
            )}>
              {category.name}
            </h1>
            
            <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
              {category.description}
            </p>
            
            <p className="text-muted-foreground leading-relaxed">
              {category.longDescription}
            </p>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24">
              <h3 className={cn(
                "text-lg font-display font-semibold text-foreground mb-4",
                "tracking-wide uppercase"
              )}>
                Filter Products
              </h3>
              
              {/* TODO: Replace with actual ProductFilters component when connected to data */}
              <div className={cn(
                "bg-card border-2 border-border p-4",
                "rounded-none" // Sharp military styling
              )}>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Filter className="h-4 w-4" />
                    <span className="text-sm">Filters will appear here when products are loaded</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <SortAsc className="h-4 w-4" />
                    <span className="text-sm">Sorting options available soon</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <main className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  {category.name} Products
                </h2>
                <p className="text-sm text-muted-foreground">
                  {products.length === 0 ? "No products available" : `${products.length} products found`}
                </p>
              </div>
              
              {/* Sort Dropdown - TODO: Make functional */}
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-none border-2"
                disabled
              >
                <SortAsc className="h-4 w-4 mr-2" />
                Sort By
              </Button>
            </div>

            {/* Products Display */}
            {loading ? (
              <ProductGridSkeleton count={8} />
            ) : error ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg mb-6">
                  Failed to load products. Please try again.
                </p>
                <Button onClick={() => window.location.reload()} className="rounded-none">
                  Try Again
                </Button>
              </div>
            ) : products.length > 0 ? (
              <ProductGrid products={products} />
            ) : (
              <EmptyProductGrid 
                category={category.name}
              />
            )}
          </main>
        </div>
      </div>
      </div>
    </Layout>
  )
}

