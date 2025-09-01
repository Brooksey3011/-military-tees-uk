import { Metadata } from "next"
import { Home, Coffee } from "lucide-react"
import { Layout } from "@/components/layout"
import { CategoryProductsSafe } from "@/components/pages/category-products-safe"
import { ClientOnly } from "@/components/ui/client-only"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Barracks Life | Military Community Apparel - Military Tees UK",
  description: "Military community and barracks life themed apparel. Mess halls, NAAFI, and the camaraderie of military service life.",
  keywords: [
    "barracks life", "mess hall", "NAAFI", "military community", "army mess", 
    "sergeants mess", "military lifestyle", "barracks apparel"
  ]
}

export default function BarracksLifePage() {
  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <section className="border-b-2 border-border bg-muted/10">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-block p-4 mb-6 border-2 border-primary rounded-none bg-background">
                <Home className="h-12 w-12 text-primary mx-auto" />
              </div>
              
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4 tracking-wider uppercase">
                Barracks Life
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                Military community and camaraderie - life beyond the battlefield. The bonds forged in mess halls and quarters.
              </p>

              {/* Subcategory Navigation */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" size="sm" className="rounded-none border-2" asChild>
                  <Link href="/categories/mess-hall">Mess Hall</Link>
                </Button>
                <Button variant="outline" size="sm" className="rounded-none border-2" asChild>
                  <Link href="/categories/naafi">NAAFI</Link>
                </Button>
                <Button variant="outline" size="sm" className="rounded-none border-2" asChild>
                  <Link href="/categories/sgts-mess">Sgts Mess</Link>
                </Button>
                <Button variant="outline" size="sm" className="rounded-none border-2" asChild>
                  <Link href="/categories/block">Block Life</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Products */}
        <section className="container mx-auto px-4 py-16">
          <ClientOnly fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-100 h-96 rounded animate-pulse"></div>
              ))}
            </div>
          }>
            <CategoryProductsSafe 
              categorySlug="barracks-life"
              categoryName="Barracks Life"
            />
          </ClientOnly>
        </section>
      </div>
    </Layout>
  )
}