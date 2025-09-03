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
              
              <div className="flex items-center gap-4 mb-6">
                <div className={cn(
                  "inline-block p-4",
                  "border-2 border-primary",
                  "rounded-none bg-background"
                )}>
                  <Heart className="h-12 w-12 text-primary" />
                </div>
                <div>
                  <h1 className={cn(
                    "text-3xl md:text-5xl font-display font-bold text-foreground mb-2",
                    "tracking-wider uppercase"
                  )}>
                    Memorial Collection
                  </h1>
                  <p className="text-xl text-muted-foreground">
                    Honouring those who made the ultimate sacrifice
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="flex items-center gap-3 p-4 border border-border rounded-none bg-background">
                  <Heart className="h-6 w-6 text-primary" />
                  <div>
                    <div className="font-semibold text-foreground">Remembrance</div>
                    <div className="text-sm text-muted-foreground">They shall not be forgotten</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 border border-border rounded-none bg-background">
                  <Star className="h-6 w-6 text-primary" />
                  <div>
                    <div className="font-semibold text-foreground">Fallen Heroes</div>
                    <div className="text-sm text-muted-foreground">Honouring ultimate sacrifice</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 border border-border rounded-none bg-background">
                  <Heart className="h-6 w-6 text-primary" />
                  <div>
                    <div className="font-semibold text-foreground">Memorial Respect</div>
                    <div className="text-sm text-muted-foreground">Dignity in remembrance</div>
                  </div>
                </div>
              </div>
              
              <p className="text-muted-foreground leading-relaxed">
                We remember those who made the ultimate sacrifice in service to their country. These designs 
                serve as lasting tributes to fallen heroes, ensuring their memory and sacrifice are never 
                forgotten. Each piece is crafted with the utmost respect and dignity.
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
            <MemorialProducts />
          </ClientOnly>
        </div>
      </div>
    </Layout>
  )
}