import { Metadata } from "next"
import { Map, Command, AlertTriangle } from "lucide-react"
import { Layout } from "@/components/layout"
import { ProductGrid } from "@/components/product/product-grid"

export const metadata: Metadata = {
  title: "Operations Room - Strategic Operations | Military Tees UK",
  description: "Strategic operations themed military t-shirts from the Operations Room. Command, control, and tactical planning designs.",
  robots: {
    index: true,
    follow: true,
  }
}

export default function OpsRoomPage() {
  const mockProducts = [
    {
      id: "18",
      name: "Command & Control",
      slug: "command-control",
      price: 26.99,
      main_image_url: "/images/products/placeholder-tshirt.svg",
      category_id: "ops-room",
      description: "Strategic operations command and tactical planning excellence",
      variants: [
        {
          id: "18-1",
          size: "S",
          color: "Navy",
          stockQuantity: 7,
          imageUrls: ["/images/products/placeholder-tshirt.svg"]
        },
        {
          id: "18-2",
          size: "M",
          color: "Navy",
          stockQuantity: 11,
          imageUrls: ["/images/products/placeholder-tshirt.svg"]
        },
        {
          id: "18-3",
          size: "L",
          color: "Navy",
          stockQuantity: 9,
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
                <Command className="h-12 w-12 text-primary mx-auto" />
              </div>
              
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4 tracking-wider uppercase">
                Operations Room
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                Strategic operations themed designs celebrating command, control, and tactical planning from the heart of military operations.
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