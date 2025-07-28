import { Metadata } from "next"
import { Package, Clipboard, Archive } from "lucide-react"
import { Layout } from "@/components/layout"
import { ProductGrid } from "@/components/product/product-grid"

export const metadata: Metadata = {
  title: "G10 Stores - General Stores & Supplies | Military Tees UK",
  description: "General stores and supplies themed military t-shirts from G10 Stores. Celebrating military supply management and inventory control.",
  robots: {
    index: true,
    follow: true,
  }
}

export default function G10StoresPage() {
  const mockProducts = [
    {
      id: "26",
      name: "Supply Chain Hero",
      slug: "supply-chain",
      price: 22.99,
      main_image_url: "/images/products/placeholder-tshirt.svg",
      category_id: "g10-stores",
      description: "Military supply management and logistics excellence",
      is_featured: false,
      is_active: true,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
      variants: [
        {
          id: "26-1",
          product_id: "26",
          size: "S",
          color: "Army Green",
          sku: "SCH-S-AGR",
          stock_quantity: 13,
          price_adjustment: 0,
          is_active: true,
          image_urls: ["/images/products/placeholder-tshirt.svg"],
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z"
        },
        {
          id: "26-2",
          product_id: "26",
          size: "M",
          color: "Army Green",
          sku: "SCH-M-AGR",
          stock_quantity: 19,
          price_adjustment: 0,
          is_active: true,
          image_urls: ["/images/products/placeholder-tshirt.svg"],
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z"
        },
        {
          id: "26-3",
          product_id: "26",
          size: "L",
          color: "Army Green",
          sku: "SCH-L-AGR",
          stock_quantity: 15,
          price_adjustment: 0,
          is_active: true,
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
                <Archive className="h-12 w-12 text-primary mx-auto" />
              </div>
              
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4 tracking-wider uppercase">
                G10 Stores
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                General stores and supplies designs celebrating military supply management, inventory control, and the logistics that keep operations running.
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