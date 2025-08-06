import { Metadata } from "next"
import { Target, Crosshair, Zap } from "lucide-react"
import { Layout } from "@/components/layout"
import { CategoryProductsSafe } from "@/components/pages/category-products-safe"
import { ClientOnly } from "@/components/ui/client-only"

export const metadata: Metadata = {
  title: "The Ranges - Shooting & Marksmanship | Military Tees UK",
  description: "Shooting and marksmanship designs from the ranges. Premium military t-shirts celebrating accuracy, precision, and weapons training.",
  robots: {
    index: true,
    follow: true,
  }
}

export default function RangesPage() {

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <section className="border-b-2 border-border bg-muted/10">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-block p-4 mb-6 border-2 border-primary rounded-none bg-background">
                <Target className="h-12 w-12 text-primary mx-auto" />
              </div>
              
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4 tracking-wider uppercase">
                The Ranges
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                Shooting and marksmanship designs celebrating accuracy, precision, and weapons training excellence on the military ranges.
              </p>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16">
          <ClientOnly fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-100 h-96 rounded animate-pulse"></div>
              ))}
            </div>
          }>
            <CategoryProductsSafe 
              categorySlug="ranges"
              categoryName="Ranges"
            />
          </ClientOnly>
        </section>
      </div>
    </Layout>
  )
}