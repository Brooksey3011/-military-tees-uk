import { Layout } from "@/components/layout"
import { ProductsServer } from "@/components/pages/products-server"
import { cn } from "@/lib/utils"

export const metadata = {
  title: "All Products | Military Tees UK",
  description: "Discover our complete collection of military-themed apparel and accessories",
}

export default function ProductsPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Header Section */}
        <section className="bg-muted/10 border-b-2 border-border">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
              <div className="text-center">
                <h1 className={cn(
                  "text-3xl md:text-5xl font-display font-bold text-foreground mb-2",
                  "tracking-wider uppercase"
                )}>
                  All Products
                </h1>
                <p className="text-sm text-muted-foreground uppercase tracking-wide">
                  (18 PRODUCTS)
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <div className="container mx-auto px-4 py-8">
          <ProductsServer />
        </div>
      </div>
    </Layout>
  )
}