import { Metadata } from "next"
import { Wrench, Radio } from "lucide-react"
import { Layout } from "@/components/layout"
import { CategoryProductsSafe } from "@/components/pages/category-products-safe"
import { ClientOnly } from "@/components/ui/client-only"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Corps & Specialist | Military Corps Apparel - Military Tees UK",
  description: "Specialist military corps and services themed apparel. Signals, medical, logistics, and specialist military units.",
  keywords: [
    "military corps", "signals corps", "medical corps", "logistics", "specialist units",
    "army specialists", "military services", "support corps", "technical corps"
  ]
}

export default function CorpsSpecialistPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <section className="border-b-2 border-border bg-muted/10">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-block p-4 mb-6 border-2 border-primary rounded-none bg-background">
                <Radio className="h-12 w-12 text-primary mx-auto" />
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4 tracking-wider uppercase">
                Corps & Specialist
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                Specialist military corps and support services - the backbone of operations. Technical expertise in service.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" size="sm" className="rounded-none border-2" asChild>
                  <Link href="/categories/signals">Signals</Link>
                </Button>
                <Button variant="outline" size="sm" className="rounded-none border-2" asChild>
                  <Link href="/categories/med-centre">Medical</Link>
                </Button>
                <Button variant="outline" size="sm" className="rounded-none border-2" asChild>
                  <Link href="/categories/stores">Stores</Link>
                </Button>
                <Button variant="outline" size="sm" className="rounded-none border-2" asChild>
                  <Link href="/categories/g10-stores">G10 Stores</Link>
                </Button>
              </div>
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
              categorySlug="corps-specialist"
              categoryName="Corps & Specialist"
            />
          </ClientOnly>
        </section>
      </div>
    </Layout>
  )
}