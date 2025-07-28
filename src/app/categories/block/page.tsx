import { Metadata } from "next"
import { Building, Bed, Home } from "lucide-react"
import { Layout } from "@/components/layout"
import { ProductGrid } from "@/components/product/product-grid"

export const metadata: Metadata = {
  title: "The Block - Barracks & Accommodation | Military Tees UK",
  description: "Barracks and accommodation themed military t-shirts from The Block. Celebrating military living quarters and barrack life.",
  robots: {
    index: true,
    follow: true,
  }
}

export default function BlockPage() {
  const mockProducts = [
    {
      id: "24",
      name: "Barrack Room Blues",
      slug: "barrack-room",
      price: 22.99,
      main_image_url: "/images/products/placeholder-tshirt.svg",
      category_id: "block",
      description: "Celebrating barrack life and military living quarters bonds",
      is_featured: false,
      is_active: true,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
      variants: [
        {
          id: "24-1",
          product_id: "24",
          size: "S",
          color: "Black",
          sku: "BRB-S-BLK",
          stock_quantity: 15,
          image_urls: ["/images/products/placeholder-tshirt.svg"],
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z"
        },
        {
          id: "24-2",
          product_id: "24",
          size: "M",
          color: "Black", 
          sku: "BRB-M-BLK",
          stock_quantity: 20,
          image_urls: ["/images/products/placeholder-tshirt.svg"],
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z"
        },
        {
          id: "24-3",
          product_id: "24",
          size: "L",
          color: "Black",
          sku: "BRB-L-BLK",
          stock_quantity: 16,
          image_urls: ["/images/products/placeholder-tshirt.svg"],
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z"
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
                <Building className="h-12 w-12 text-primary mx-auto" />
              </div>
              
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4 tracking-wider uppercase">
                The Block
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                Barracks and accommodation themed designs celebrating military living quarters, shared experiences, and the bonds formed in barrack life.
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