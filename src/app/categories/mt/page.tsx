import { Metadata } from "next"
import { Truck, Wrench, Fuel } from "lucide-react"
import { Layout } from "@/components/layout"
import { ProductGrid } from "@/components/product/product-grid"

export const metadata: Metadata = {
  title: "Motor Transport - Vehicle & Logistics | Military Tees UK",
  description: "Vehicle and logistics themed military t-shirts from Motor Transport. Celebrating military drivers, mechanics, and transport operations.",
  robots: {
    index: true,
    follow: true,
  }
}

export default function MTPage() {
  const mockProducts = [
    {
      id: "15",
      name: "Military Driver",
      slug: "military-driver",
      price: 22.99,
      main_image_url: "/images/products/placeholder-tshirt.svg",
      category_id: "mt",
      description: "Celebrating military drivers and transport operations",
      variants: [
        {
          id: "15-1",
          size: "S",
          color: "Army Green",
          stockQuantity: 11,
          imageUrls: ["/images/products/placeholder-tshirt.svg"]
        },
        {
          id: "15-2",
          size: "M",
          color: "Army Green",
          stockQuantity: 17,
          imageUrls: ["/images/products/placeholder-tshirt.svg"]
        },
        {
          id: "15-3",
          size: "L",
          color: "Army Green",
          stockQuantity: 13,
          imageUrls: ["/images/products/placeholder-tshirt.svg"]
        }
      ]
    },
    {
      id: "16",
      name: "Logistics Corps",
      slug: "logistics-corps",
      price: 24.99,
      main_image_url: "/images/products/placeholder-tshirt.svg",
      category_id: "mt",
      description: "Military logistics excellence and vehicle maintenance",
      variants: [
        {
          id: "16-1",
          size: "S",
          color: "Black",
          stockQuantity: 8,
          imageUrls: ["/images/products/placeholder-tshirt.svg"]
        },
        {
          id: "16-2",
          size: "M",
          color: "Black",
          stockQuantity: 14,
          imageUrls: ["/images/products/placeholder-tshirt.svg"]
        },
        {
          id: "16-3",
          size: "L",
          color: "Black",
          stockQuantity: 10,
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
                <Truck className="h-12 w-12 text-primary mx-auto" />
              </div>
              
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4 tracking-wider uppercase">
                Motor Transport
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                Vehicle and logistics themed designs celebrating military drivers, mechanics, and the vital transport operations that keep forces mobile.
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