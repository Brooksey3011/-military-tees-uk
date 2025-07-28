import { Metadata } from "next"
import { Utensils, Coffee, Users } from "lucide-react"
import { Layout } from "@/components/layout"
import { ProductGrid } from "@/components/product/product-grid"

export const metadata: Metadata = {
  title: "Mess Hall - Military Dining & Camaraderie | Military Tees UK",
  description: "Military dining and camaraderie themed t-shirts. Celebrating the bonds formed over shared meals and military brotherhood.",
  robots: {
    index: true,
    follow: true,
  }
}

export default function MessHallPage() {
  const mockProducts = [
    {
      id: "5",
      name: "Mess Hall Brotherhood",
      slug: "mess-hall-brotherhood",
      price: 22.99,
      main_image_url: "/images/products/placeholder-tshirt.svg",
      category_id: "mess-hall",
      description: "Celebrating the bonds formed over shared meals and military brotherhood",
      variants: [
        {
          id: "5-1",
          size: "S",
          color: "Black",
          stockQuantity: 14,
          imageUrls: ["/images/products/placeholder-tshirt.svg"]
        },
        {
          id: "5-2",
          size: "M",
          color: "Black",
          stockQuantity: 18,
          imageUrls: ["/images/products/placeholder-tshirt.svg"]
        },
        {
          id: "5-3",
          size: "L",
          color: "Black",
          stockQuantity: 12,
          imageUrls: ["/images/products/placeholder-tshirt.svg"]
        }
      ]
    },
    {
      id: "6",
      name: "Military Chef's Pride",
      slug: "military-chef-pride",
      price: 21.99,
      main_image_url: "/images/products/placeholder-tshirt.svg",
      category_id: "mess-hall",
      description: "Honoring military chefs and catering corps excellence",
      variants: [
        {
          id: "6-1",
          size: "S",
          color: "Army Green",
          stockQuantity: 11,
          imageUrls: ["/images/products/placeholder-tshirt.svg"]
        },
        {
          id: "6-2",
          size: "M",
          color: "Army Green",
          stockQuantity: 16,
          imageUrls: ["/images/products/placeholder-tshirt.svg"]
        },
        {
          id: "6-3",
          size: "L",
          color: "Army Green",
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
          <ProductGrid products={mockProducts as any} />
        </section>
      </div>
    </Layout>
  )
}