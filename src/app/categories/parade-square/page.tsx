import { Metadata } from "next"
import { Medal } from "lucide-react"
import { Layout } from "@/components/layout"
import { CategoryProductsSafe } from "@/components/pages/category-products-safe"
import { ClientOnly } from "@/components/ui/client-only"

export const metadata: Metadata = {
  title: "Parade Square - Ceremonial & Dress Uniform | Military Tees UK",
  description: "Ceremonial and dress uniform styles from the parade square. Premium designs celebrating military pageantry and tradition.",
  robots: {
    index: true,
    follow: true,
  }
}

export default function ParadeSquarePage() {

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <section className="border-b-2 border-border bg-muted/10">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-block p-4 mb-6 border-2 border-primary rounded-none bg-background">
                <Medal className="h-12 w-12 text-primary mx-auto" />
              </div>
              
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4 tracking-wider uppercase">
                Parade Square
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                Ceremonial and dress uniform styles celebrating military pageantry, tradition, and the precision of parade ground excellence.
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
              categorySlug="parade-square"
              categoryName="Parade Square"
            />
          </ClientOnly>
        </section>
      </div>
    </Layout>
  )
}