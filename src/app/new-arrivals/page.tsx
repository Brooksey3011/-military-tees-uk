import { Layout } from "@/components/layout"
import { NewArrivalsClient } from "@/components/pages/new-arrivals-client"
import { HydrationWrapper } from "@/components/ui/hydration-wrapper"
import { ProductGridSkeleton } from "@/components/ui"
import { cn } from "@/lib/utils"

export const metadata = {
  title: "New Arrivals - Military Tees UK",
  description: "Discover the latest military-themed apparel and tactical gear. Fresh stock of premium British Army inspired tees.",
  openGraph: {
    title: "New Arrivals - Military Tees UK",
    description: "Discover the latest military-themed apparel and tactical gear. Fresh stock of premium British Army inspired tees.",
    type: "website",
  },
}

export default function NewArrivalsPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Header Section */}
        <section className="bg-muted/10 border-b-2 border-border">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl">
              <h1 className={cn(
                "text-3xl md:text-5xl font-display font-bold text-foreground mb-4",
                "tracking-wider uppercase"
              )}>
                New Arrivals
              </h1>
              
              <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
                Latest military-themed apparel designs
              </p>
              
              <p className="text-muted-foreground leading-relaxed">
                Discover our newest additions to the Military Tees UK collection. Fresh designs celebrating military heritage, service, and pride. Each piece is crafted with the same attention to detail and respect for military tradition that defines our brand.
              </p>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <div className="container mx-auto px-4 py-8">
          <HydrationWrapper fallback={<ProductGridSkeleton count={12} />}>
            <NewArrivalsClient />
          </HydrationWrapper>
        </div>
      </div>
    </Layout>
  )
}