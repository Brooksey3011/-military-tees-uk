import { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Anchor, Waves } from "lucide-react"
import { Layout } from "@/components/layout"
import { ClientOnly } from "@/components/ui/client-only"
import { cn } from "@/lib/utils"
import { RoyalMarinesProducts } from "@/components/pages/royal-marines-products"

export const metadata: Metadata = {
  title: "Royal Marines Collection | Military Tees UK",
  description: "Discover our premium Royal Marines themed apparel collection. Commando and amphibious warfare designs celebrating elite marine traditions.",
  keywords: [
    "Royal Marines t-shirts", "marine clothing", "commando apparel", "amphibious warfare", 
    "British Marines", "elite forces clothing", "military commando designs"
  ],
  openGraph: {
    title: "Royal Marines Collection | Military Tees UK",
    description: "Premium Royal Marines themed apparel - Commando and amphibious warfare designs",
    type: "website",
  },
}

export default function RoyalMarinesPage() {
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
                British Armed Forces
              </Link>
              <span>/</span>
              <span className="text-foreground font-medium">Royal Marines</span>
            </nav>
          </div>
        </div>

        {/* Category Header */}
        <section className="border-b-2 border-border bg-muted/10">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
              <Link 
                href="/categories"
                className={cn(
                  "inline-flex items-center gap-2 text-sm text-muted-foreground",
                  "hover:text-foreground transition-colors mb-6"
                )}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to British Armed Forces
              </Link>
              
              <div className="text-center">
                <h1 className={cn(
                  "text-3xl md:text-5xl font-display font-bold text-foreground mb-2",
                  "tracking-wider uppercase"
                )}>
                  Royal Marines
                </h1>
                <p className="text-sm text-muted-foreground uppercase tracking-wide">
                  (5 PRODUCTS)
                </p>
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
            <RoyalMarinesProducts />
          </ClientOnly>
        </div>
      </div>
    </Layout>
  )
}