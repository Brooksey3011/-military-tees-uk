import { Metadata } from "next"
import { Shield, Eye, Lock } from "lucide-react"
import { Layout } from "@/components/layout"
import { ProductGrid } from "@/components/product/product-grid"

export const metadata: Metadata = {
  title: "Guard Room - Security & Duty | Military Tees UK",
  description: "Security and duty themed military t-shirts from the Guard Room. Celebrating military police, security forces, and guard duties.",
  robots: {
    index: true,
    follow: true,
  }
}

export default function GuardRoomPage() {
  const mockProducts = [
    {
      id: "20",
      name: "Military Police",
      slug: "military-police",
      price: 24.99,
      main_image_url: "/images/products/placeholder-tshirt.svg",
      category_id: "guard-room",
      description: "Military police excellence and security force operations",
      variants: [
        {
          id: "20-1",
          size: "S",
          color: "Black",
          stockQuantity: 11,
          imageUrls: ["/images/products/placeholder-tshirt.svg"]
        },
        {
          id: "20-2",
          size: "M",
          color: "Black",
          stockQuantity: 16,
          imageUrls: ["/images/products/placeholder-tshirt.svg"]
        },
        {
          id: "20-3",
          size: "L",
          color: "Black",
          stockQuantity: 13,
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
                <Shield className="h-12 w-12 text-primary mx-auto" />
              </div>
              
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4 tracking-wider uppercase">
                Guard Room
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                Security and duty themed designs celebrating military police, security forces, and the vigilant guard duties that protect our bases.
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