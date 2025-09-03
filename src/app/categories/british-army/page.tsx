import { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Shield, Zap } from "lucide-react"
import { Layout } from "@/components/layout"
import { ClientOnly } from "@/components/ui/client-only"
import { cn } from "@/lib/utils"
import { BritishArmyProducts } from "@/components/pages/british-army-products"

export const metadata: Metadata = {
  title: "British Army Collection | Military Tees UK",
  description: "Discover our premium British Army themed apparel collection. Infantry, armoured corps, and army regiment designs celebrating British military heritage.",
  keywords: [
    "British Army t-shirts", "army clothing", "military infantry", "armoured corps", 
    "British military apparel", "army regiment designs", "military heritage clothing"
  ],
  openGraph: {
    title: "British Army Collection | Military Tees UK",
    description: "Premium British Army themed apparel - Infantry, armoured corps, and army regiment designs",
    type: "website",
  },
}

export default function BritishArmyPage() {
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
              <span className="text-foreground font-medium">British Army</span>
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
                Back to British Armed Forces
              </Link>
              
              <div className="flex items-center gap-4">
                <div className={cn(
                  "inline-block p-4",
                  "border-2 border-primary",
                  "rounded-none bg-background"
                )}>
                  <Shield className="h-12 w-12 text-primary" />
                </div>
                <div>
                  <h1 className={cn(
                    "text-3xl md:text-5xl font-display font-bold text-foreground",
                    "tracking-wider uppercase"
                  )}>
                    British Army
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
            <BritishArmyProducts />
          </ClientOnly>
        </div>
      </div>
    </Layout>
  )
}