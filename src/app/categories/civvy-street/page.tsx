import { Metadata } from "next"
import { MapPin, ArrowRight, Heart } from "lucide-react"
import { Layout } from "@/components/layout"
import { ProductGrid } from "@/components/product/product-grid"

export const metadata: Metadata = {
  title: "Civvy Street - Civilian Life Transition | Military Tees UK",
  description: "Civilian life transition themed military t-shirts from Civvy Street. Supporting veterans transitioning to civilian life.",
  robots: {
    index: true,
    follow: true,
  }
}

export default function CivvyStreetPage() {
  const mockProducts = [
    {
      id: "25",
      name: "Veteran Transition",
      slug: "veteran-transition",
      price: 23.99,
      main_image_url: "/images/products/placeholder-tshirt.svg",
      category_id: "civvy-street",
      description: "Supporting veterans transitioning to civilian life with pride",
      variants: [
        {
          id: "25-1",
          size: "S",
          color: "Navy",
          stockQuantity: 12,
          imageUrls: ["/images/products/placeholder-tshirt.svg"]
        },
        {
          id: "25-2",
          size: "M",
          color: "Navy",
          stockQuantity: 18,
          imageUrls: ["/images/products/placeholder-tshirt.svg"]
        },
        {
          id: "25-3",
          size: "L",
          color: "Navy",
          stockQuantity: 14,
          imageUrls: ["/images/products/placeholder-tshirt.svg"]
        }
      ]
    }
  ]

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <section className="border-b-2 border-border bg-muted/10">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-block p-4 mb-6 border-2 border-primary rounded-none bg-background">
                <MapPin className="h-12 w-12 text-primary mx-auto" />
              </div>
              
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4 tracking-wider uppercase">
                Civvy Street
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                Civilian life transition gear supporting veterans and service members as they navigate the journey from military to civilian life.
              </p>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16">
          <ProductGrid products={mockProducts as any} />
        </section>
      </div>
    </Layout>
  )
}