import { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Heart, Star } from "lucide-react"
import { Layout } from "@/components/layout"
import { ClientOnly } from "@/components/ui/client-only"
import { cn } from "@/lib/utils"
import { MemorialProducts } from "@/components/pages/memorial-products"

export const metadata: Metadata = {
  title: "Memorial Collection | Military Tees UK - Honouring the Fallen",
  description: "Pay tribute to those who made the ultimate sacrifice with our memorial collection. Respectful designs honouring fallen heroes, remembrance day apparel & custom memorial tributes.",
  keywords: [
    "military memorial clothing", "remembrance day apparel", "fallen heroes tribute", "military tribute shirts",
    "poppy collection UK", "memorial t-shirts", "remembrance clothing", "military memorial gifts",
    "custom memorial designs", "battlefield memorial apparel", "service tribute clothing", "UK memorial wear"
  ],
  openGraph: {
    title: "Memorial Collection | Military Tees UK - Honouring the Fallen",
    description: "Pay tribute to those who made the ultimate sacrifice with our memorial collection. Respectful designs honouring fallen heroes and remembrance day apparel.",
    type: "website",
  },
}

export default function MemorialPage() {
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
              <span className="text-foreground font-medium">Memorial</span>
            </nav>
          </div>
        </div>

        {/* Category Header */}
        <section className="border-b-2 border-border bg-muted/10">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
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
              
              <div className="text-center">
                <h1 className={cn(
                  "text-3xl md:text-5xl font-display font-bold text-foreground mb-2",
                  "tracking-wider uppercase"
                )}>
                  Memorial Collection
                </h1>
                <p className="text-sm text-muted-foreground uppercase tracking-wide">
                  (6 PRODUCTS)
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
            <MemorialProducts />
          </ClientOnly>
        </div>
      </div>
    </Layout>
  )
}