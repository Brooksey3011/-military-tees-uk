import { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Anchor, Ship } from "lucide-react"
import { Layout } from "@/components/layout"
import { ClientOnly } from "@/components/ui/client-only"
import { cn } from "@/lib/utils"
import { RoyalNavyProducts } from "@/components/pages/royal-navy-products"

export const metadata: Metadata = {
  title: "Royal Navy Collection | Military Tees UK",
  description: "Discover our premium Royal Navy themed apparel collection. Naval traditions and fleet designs celebrating maritime heritage.",
  keywords: [
    "Royal Navy t-shirts", "naval clothing", "maritime apparel", "navy designs", 
    "fleet clothing", "naval traditions", "RN merchandise", "sailor apparel"
  ],
  openGraph: {
    title: "Royal Navy Collection | Military Tees UK",
    description: "Premium Royal Navy themed apparel - Naval traditions and fleet designs",
    type: "website",
  },
}

export default function RoyalNavyPage() {
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
                Military
              </Link>
              <span>/</span>
              <span className="text-foreground font-medium">Royal Navy</span>
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
                Back to Military Collections
              </Link>
              
              <div className="flex items-center gap-4 mb-6">
                <div className={cn(
                  "inline-block p-4",
                  "border-2 border-primary",
                  "rounded-none bg-background"
                )}>
                  <Ship className="h-12 w-12 text-primary" />
                </div>
                <div>
                  <h1 className={cn(
                    "text-3xl md:text-5xl font-display font-bold text-foreground mb-2",
                    "tracking-wider uppercase"
                  )}>
                    Royal Navy
                  </h1>
                  <p className="text-xl text-muted-foreground">
                    Naval traditions and fleet designs
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="flex items-center gap-3 p-4 border border-border rounded-none bg-background">
                  <Ship className="h-6 w-6 text-primary" />
                  <div>
                    <div className="font-semibold text-foreground">Fleet Operations</div>
                    <div className="text-sm text-muted-foreground">Surface & submarine warfare</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 border border-border rounded-none bg-background">
                  <Anchor className="h-6 w-6 text-primary" />
                  <div>
                    <div className="font-semibold text-foreground">Maritime Traditions</div>
                    <div className="text-sm text-muted-foreground">Naval heritage & customs</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 border border-border rounded-none bg-background">
                  <Ship className="h-6 w-6 text-primary" />
                  <div>
                    <div className="font-semibold text-foreground">Shore Support</div>
                    <div className="text-sm text-muted-foreground">Naval bases & logistics</div>
                  </div>
                </div>
              </div>
              
              <p className="text-muted-foreground leading-relaxed">
                Navigate the Royal Navy collection, celebrating Britain's Senior Service and its proud maritime heritage. 
                From Nelson's victories to modern fleet operations, these designs honor the sailors who have defended 
                Britain's shores for centuries. Whether you're celebrating surface ships, submarines, or shore establishments, 
                each piece reflects the naval tradition of courage, honor, and seamanship that rules the waves.
              </p>
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
            <RoyalNavyProducts />
          </ClientOnly>
        </div>
      </div>
    </Layout>
  )
}