import { Metadata } from "next"
import { Package, Warehouse, ClipboardList } from "lucide-react"
import { Layout } from "@/components/layout"
import { ProductGrid } from "@/components/product/product-grid"

export const metadata: Metadata = {
  title: "The Stores - Supply & Logistics | Military Tees UK",
  description: "Supply and logistics themed military t-shirts from The Stores. Celebrating military supply chain and quartermaster operations.",
  robots: {
    index: true,
    follow: true,
  }
}

export default function StoresPage() {
  const mockProducts = [
    {
      id: "22",
      name: "Quartermaster Corps",
      slug: "quartermaster",
      price: 23.99,
      main_image_url: "/images/products/placeholder-tshirt.svg",
      category_id: "stores",
      description: "Supply chain excellence and quartermaster operations",
      variants: [
        {
          id: "22-1",
          size: "S",
          color: "Army Green",
          stockQuantity: 13,
          imageUrls: ["/images/products/placeholder-tshirt.svg"]
        },
        {
          id: "22-2",
          size: "M",
          color: "Army Green",
          stockQuantity: 17,
          imageUrls: ["/images/products/placeholder-tshirt.svg"]
        },
        {
          id: "22-3",
          size: "L",
          color: "Army Green",
          stockQuantity: 12,
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
                <Warehouse className="h-12 w-12 text-primary mx-auto" />
              </div>
              
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4 tracking-wider uppercase">
                The Stores
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                Supply and logistics gear celebrating the quartermaster operations and supply chain heroes who keep our forces equipped and ready.
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