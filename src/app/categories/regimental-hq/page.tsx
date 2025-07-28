import { Metadata } from "next"
import { Crown, Star, Award } from "lucide-react"
import { Layout } from "@/components/layout"
import { ProductGrid } from "@/components/product/product-grid"

export const metadata: Metadata = {
  title: "Regimental HQ - Command & Leadership | Military Tees UK",
  description: "Command and leadership designs from Regimental Headquarters. Premium military t-shirts celebrating military hierarchy and command structure.",
  robots: {
    index: true,
    follow: true,
  }
}

export default function RegimentalHQPage() {
  const mockProducts = [
    {
      id: "3",
      name: "Regimental Sergeant Major",
      slug: "rsm-leadership",
      price: 26.99,
      main_image_url: "/images/products/placeholder-tshirt.svg",
      category_id: "regimental-hq",
      description: "Leadership excellence in military command structure",
      variants: [
        {
          id: "3-1",
          size: "S",
          color: "Black",
          stockQuantity: 10,
          imageUrls: ["/images/products/placeholder-tshirt.svg"]
        },
        {
          id: "3-2", 
          size: "M",
          color: "Black",
          stockQuantity: 15,
          imageUrls: ["/images/products/placeholder-tshirt.svg"]
        },
        {
          id: "3-3",
          size: "L", 
          color: "Black",
          stockQuantity: 12,
          imageUrls: ["/images/products/placeholder-tshirt.svg"]
        }
      ]
    },
    {
      id: "4",
      name: "Officer Command Badge",
      slug: "officer-command",
      price: 24.99,
      main_image_url: "/images/products/placeholder-tshirt.svg",
      category_id: "regimental-hq",
      description: "Distinguished military leadership insignia",
      variants: [
        {
          id: "4-1",
          size: "S",
          color: "Navy",
          stockQuantity: 8,
          imageUrls: ["/images/products/placeholder-tshirt.svg"]
        },
        {
          id: "4-2",
          size: "M", 
          color: "Navy",
          stockQuantity: 12,
          imageUrls: ["/images/products/placeholder-tshirt.svg"]
        },
        {
          id: "4-3",
          size: "L",
          color: "Navy", 
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
                <Crown className="h-12 w-12 text-primary mx-auto" />
              </div>
              
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4 tracking-wider uppercase">
                Regimental HQ
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                Command and leadership designs celebrating military hierarchy, decision-making, and the backbone of regimental structure.
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