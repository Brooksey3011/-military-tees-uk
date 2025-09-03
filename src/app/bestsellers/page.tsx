import { Layout } from "@/components/layout"
import { BestsellersServer } from "@/components/pages/bestsellers-server"
import { cn } from "@/lib/utils"

export const metadata = {
  title: "Bestsellers - Military Tees UK",
  description: "Our most popular military-themed apparel. Top-rated British Army inspired tees loved by customers nationwide.",
  openGraph: {
    title: "Bestsellers - Military Tees UK", 
    description: "Our most popular military-themed apparel. Top-rated British Army inspired tees loved by customers nationwide.",
    type: "website",
  },
}

export default function BestsellersPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Header Section */}
        <section className="bg-muted/10 border-b-2 border-border">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl">
              <div className="text-center">
                <h1 className={cn(
                  "text-3xl md:text-5xl font-display font-bold text-foreground mb-2",
                  "tracking-wider uppercase"
                )}>
                  Bestsellers
                </h1>
                <p className="text-sm text-muted-foreground uppercase tracking-wide">
                  (6 PRODUCTS)
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <BestsellersServer />
      </div>
    </Layout>
  )
}