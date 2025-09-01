import { Metadata } from "next"
import { Shield, Swords } from "lucide-react"
import { Layout } from "@/components/layout"
import { CategoryProductsSafe } from "@/components/pages/category-products-safe"
import { ClientOnly } from "@/components/ui/client-only"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Military Essentials | Combat & Tactical Apparel - Military Tees UK",
  description: "Combat, tactical, and command military-themed t-shirts and apparel. Authentic British Army designs including armoury, operations, and command structure themes.",
  keywords: [
    "military essentials", "combat t-shirts", "tactical apparel", "army command", 
    "military operations", "armoury designs", "British military", "tactical clothing"
  ]
}

export default function MilitaryEssentialsPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <section className="border-b-2 border-border bg-muted/10">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-block p-4 mb-6 border-2 border-primary rounded-none bg-background">
                <Swords className="h-12 w-12 text-primary mx-auto" />
              </div>
              
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4 tracking-wider uppercase">
                Military Essentials
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                Combat, tactical, and command designs - the core of military service. From front-line operations to strategic command.
              </p>

              {/* Subcategory Navigation */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" size="sm" className="rounded-none border-2" asChild>
                  <Link href="/categories/armoury">Combat & Tactical</Link>
                </Button>
                <Button variant="outline" size="sm" className="rounded-none border-2" asChild>
                  <Link href="/categories/ops-room">Operations</Link>
                </Button>
                <Button variant="outline" size="sm" className="rounded-none border-2" asChild>
                  <Link href="/categories/regimental-hq">Command</Link>
                </Button>
                <Button variant="outline" size="sm" className="rounded-none border-2" asChild>
                  <Link href="/categories/parade-square">Ceremonial</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Products from all subcategories */}
        <section className="container mx-auto px-4 py-16">
          <ClientOnly fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-100 h-96 rounded animate-pulse"></div>
              ))}
            </div>
          }>
            <CategoryProductsSafe 
              categorySlug="military-essentials"
              categoryName="Military Essentials"
            />
          </ClientOnly>
        </section>
      </div>
    </Layout>
  )
}