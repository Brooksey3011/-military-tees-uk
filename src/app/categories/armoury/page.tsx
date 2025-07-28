import { Metadata } from "next"
import { Shield } from "lucide-react"
import { Layout } from "@/components/layout"
import { ProductGrid } from "@/components/product/product-grid"

export const metadata: Metadata = {
  title: "Armoury - Tactical & Combat Gear | Military Tees UK",
  description: "Explore our tactical and combat gear themed military t-shirts. Premium designs inspired by military armaments and tactical equipment.",
  robots: {
    index: true,
    follow: true,
  }
}

export default function ArmouryPage() {
  // Mock products for the category
  const mockProducts = [
    {
      id: "1",
      name: "SAS Tactical Operator Tee",
      slug: "sas-tactical-operator",
      price: 24.99,
      main_image_url: "/images/products/placeholder-tshirt.svg",
      category_id: "armoury",
      description: "Elite tactical operator design celebrating special forces excellence",
      is_featured: false,
      is_active: true,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
      variants: [
        {
          id: "1-1",
          product_id: "1",
          size: "S",
          color: "Black",
          sku: "SAS-TAC-S-BLK",
          stock_quantity: 12,
          price_adjustment: 0,
          image_urls: ["/images/products/placeholder-tshirt.svg"],
          is_active: true,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z"
        },
        {
          id: "1-2",
          product_id: "1",
          size: "M",
          color: "Black",
          sku: "SAS-TAC-M-BLK",
          stock_quantity: 18,
          price_adjustment: 0,
          image_urls: ["/images/products/placeholder-tshirt.svg"],
          is_active: true,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z"
        },
        {
          id: "1-3",
          product_id: "1",
          size: "L",
          color: "Black",
          sku: "SAS-TAC-L-BLK",
          stock_quantity: 15,
          price_adjustment: 0,
          image_urls: ["/images/products/placeholder-tshirt.svg"],
          is_active: true,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z"
        }
      ]
    },
    {
      id: "2", 
      name: "British Army Combat Medic",
      slug: "army-combat-medic",
      price: 22.99,
      main_image_url: "/images/products/placeholder-tshirt.svg",
      category_id: "armoury",
      description: "Honoring battlefield medics and combat medical professionals",
      is_featured: false,
      is_active: true,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
      variants: [
        {
          id: "2-1",
          product_id: "2",
          size: "S",
          color: "Army Green",
          sku: "MEDIC-S-GRN",
          stock_quantity: 10,
          price_adjustment: 0,
          image_urls: ["/images/products/placeholder-tshirt.svg"],
          is_active: true,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z"
        },
        {
          id: "2-2",
          product_id: "2",
          size: "M",
          color: "Army Green",
          sku: "MEDIC-M-GRN",
          stock_quantity: 14,
          price_adjustment: 0,
          image_urls: ["/images/products/placeholder-tshirt.svg"],
          is_active: true,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z"
        },
        {
          id: "2-3",
          product_id: "2",
          size: "L",
          color: "Army Green",
          sku: "MEDIC-L-GRN",
          stock_quantity: 12,
          price_adjustment: 0,
          image_urls: ["/images/products/placeholder-tshirt.svg"],
          is_active: true,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z"
        }
      ]
    }
  ]

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <section className="border-b-2 border-border bg-muted/10">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-block p-4 mb-6 border-2 border-primary rounded-none bg-background">
                <Shield className="h-12 w-12 text-primary mx-auto" />
              </div>
              
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4 tracking-wider uppercase">
                The Armoury
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                Tactical and combat gear themed tees. Premium designs inspired by military armaments, tactical equipment, and operational readiness.
              </p>
            </div>
          </div>
        </section>

        {/* Products */}
        <section className="container mx-auto px-4 py-16">
          <ProductGrid products={mockProducts as any} />
        </section>
      </div>
    </Layout>
  )
}