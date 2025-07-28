import { Metadata } from "next"
import { Cross, Heart, Shield } from "lucide-react"
import { Layout } from "@/components/layout"
import { ProductGrid } from "@/components/product/product-grid"

export const metadata: Metadata = {
  title: "Med Centre - Military Medical Corps | Military Tees UK",
  description: "Military medical corps designs from the medical centre. Premium t-shirts celebrating military healthcare and medical personnel.",
  robots: {
    index: true,
    follow: true,
  }
}

export default function MedCentrePage() {
  const mockProducts = [
    {
      id: "13",
      name: "Military Medic Cross",
      slug: "military-medic",
      price: 24.99,
      main_image_url: "/images/products/placeholder-tshirt.svg",
      category_id: "med-centre",
      description: "Honoring military medical corps and healthcare heroes",
      variants: [
        {
          id: "13-1",
          size: "S",
          color: "Navy",
          stockQuantity: 10,
          imageUrls: ["/images/products/placeholder-tshirt.svg"]
        },
        {
          id: "13-2",
          size: "M",
          color: "Navy",
          stockQuantity: 16,
          imageUrls: ["/images/products/placeholder-tshirt.svg"]
        },
        {
          id: "13-3",
          size: "L",
          color: "Navy",
          stockQuantity: 12,
          imageUrls: ["/images/products/placeholder-tshirt.svg"]
        }
      ]
    },
    {
      id: "14",
      name: "Combat Medical Technician",
      slug: "combat-medic-tech",
      price: 23.99,
      main_image_url: "/images/products/placeholder-tshirt.svg",
      category_id: "med-centre",
      description: "Combat medical excellence and battlefield healthcare",
      variants: [
        {
          id: "14-1",
          size: "S",
          color: "Black",
          stockQuantity: 14,
          imageUrls: ["/images/products/placeholder-tshirt.svg"]
        },
        {
          id: "14-2",
          size: "M",
          color: "Black",
          stockQuantity: 18,
          imageUrls: ["/images/products/placeholder-tshirt.svg"]
        },
        {
          id: "14-3",
          size: "L",
          color: "Black",
          stockQuantity: 15,
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
                <Cross className="h-12 w-12 text-primary mx-auto" />
              </div>
              
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4 tracking-wider uppercase">
                Med Centre
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                Military medical corps designs honoring the healthcare heroes who serve in the medical centre, providing life-saving care to our forces.
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