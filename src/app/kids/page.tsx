import { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Baby, Shield, Star } from "lucide-react"
import { Layout } from "@/components/layout"
import { ClientOnly } from "@/components/ui/client-only"
import { cn } from "@/lib/utils"
import { KidsProducts } from "@/components/pages/kids-products"

export const metadata: Metadata = {
  title: "Kids Collection | Military Tees UK",
  description: "Premium military-themed apparel for young recruits. Comfortable, durable kids clothing celebrating military family heritage.",
  keywords: [
    "kids military clothing UK", "children military apparel", "military family kids", "young recruit clothing",
    "kids army shirts", "military children wear", "British military kids", "proud family apparel"
  ],
  openGraph: {
    title: "Kids Collection | Military Tees UK",
    description: "Premium military-themed apparel for young recruits. Comfortable, durable kids clothing celebrating military family heritage.",
    type: "website",
  },
}

export default function KidsPage() {
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
              <span className="text-foreground font-medium">Kids</span>
            </nav>
          </div>
        </div>

        {/* Category Header */}
        <section className="border-b-2 border-border bg-muted/10">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl">
              <Link 
                href="/"
                className={cn(
                  "inline-flex items-center gap-2 text-sm text-muted-foreground",
                  "hover:text-foreground transition-colors mb-6"
                )}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
              
              <div className="flex items-center gap-4">
                <div className={cn(
                  "inline-block p-4",
                  "border-2 border-primary",
                  "rounded-none bg-background"
                )}>
                  <Baby className="h-12 w-12 text-primary" />
                </div>
                <div>
                  <h1 className={cn(
                    "text-3xl md:text-5xl font-display font-bold text-foreground",
                    "tracking-wider uppercase"
                  )}>
                    Kids Collection
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <div className="container mx-auto px-4 py-8">
          <ClientOnly fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="bg-gray-100 h-96 rounded animate-pulse"></div>
              ))}
            </div>
          }>
            <KidsProducts />
          </ClientOnly>
        </div>
      </div>
    </Layout>
  )
}