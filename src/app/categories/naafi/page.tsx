import { Metadata } from "next"
import { Store, Coffee, ShoppingBag } from "lucide-react"
import { Layout } from "@/components/layout"
import { ProductGrid } from "@/components/product/product-grid"

export const metadata: Metadata = {
  title: "NAAFI - Navy, Army & Air Force Institutes | Military Tees UK",
  description: "NAAFI themed military t-shirts celebrating the Navy, Army and Air Force Institutes. Classic military retail and service designs.",
  robots: {
    index: true,
    follow: true,
  }
}

export default function NAAFIPage() {
  const mockProducts = [
    {
      id: "9",
      name: "NAAFI Classic Logo",
      slug: "naafi-classic",
      price: 23.99,
      main_image_url: "/images/products/placeholder-tshirt.svg",
      category_id: "naafi",
      description: "Classic NAAFI logo celebrating Navy, Army and Air Force Institutes",
      variants: [
        {
          id: "9-1",
          size: "S",
          color: "Navy",
          stockQuantity: 15,
          imageUrls: ["/images/products/placeholder-tshirt.svg"]
        },
        {
          id: "9-2",
          size: "M",
          color: "Navy",
          stockQuantity: 20,
          imageUrls: ["/images/products/placeholder-tshirt.svg"]
        },
        {
          id: "9-3",
          size: "L",
          color: "Navy",
          stockQuantity: 17,
          imageUrls: ["/images/products/placeholder-tshirt.svg"]
        }
      ]
    },
    {
      id: "10",
      name: "Military Retail Heritage",
      slug: "military-retail-heritage",
      price: 22.99,
      main_image_url: "/images/products/placeholder-tshirt.svg",
      category_id: "naafi",
      description: "Celebrating the iconic military retail service and forces welfare",
      variants: [
        {
          id: "10-1",
          size: "S",
          color: "Black",
          stockQuantity: 12,
          imageUrls: ["/images/products/placeholder-tshirt.svg"]
        },
        {
          id: "10-2",
          size: "M",
          color: "Black",
          stockQuantity: 18,
          imageUrls: ["/images/products/placeholder-tshirt.svg"]
        },
        {
          id: "10-3",
          size: "L",
          color: "Black",
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
                <Store className="h-12 w-12 text-primary mx-auto" />
              </div>
              
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4 tracking-wider uppercase">
                NAAFI
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                Navy, Army and Air Force Institutes themed designs. Celebrating the iconic military retail service and its role in forces' welfare.
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