import { Metadata } from "next"
import { Utensils } from "lucide-react"
import { Layout } from "@/components/layout"
import { CategoryProductsServer } from "@/components/pages/category-products-server"

export const metadata: Metadata = {
  title: "Mess Hall - Military Dining & Camaraderie | Military Tees UK",
  description: "Military dining and camaraderie themed t-shirts. Celebrating the bonds formed over shared meals and military brotherhood.",
  robots: {
    index: true,
    follow: true,
  }
}

export default function MessHallPage() {

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <section className="border-b-2 border-border bg-muted/10">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-block p-4 mb-6 border-2 border-primary rounded-none bg-background">
                <Utensils className="h-12 w-12 text-primary mx-auto" />
              </div>
              
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4 tracking-wider uppercase">
                Mess Hall
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                Military dining and camaraderie designs. Celebrating the bonds formed over shared meals, military brotherhood, and mess hall memories.
              </p>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16">
          <CategoryProductsServer 
            categorySlug="mess-hall"
            categoryName="Mess Hall"
          />
        </section>
      </div>
    </Layout>
  )
}