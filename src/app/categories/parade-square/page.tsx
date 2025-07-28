import { Metadata } from "next"
import { Medal, Flag, Music } from "lucide-react"
import { Layout } from "@/components/layout"
import { ProductGrid } from "@/components/product/product-grid"

export const metadata: Metadata = {
  title: "Parade Square - Ceremonial & Dress Uniform | Military Tees UK",
  description: "Ceremonial and dress uniform styles from the parade square. Premium designs celebrating military pageantry and tradition.",
  robots: {
    index: true,
    follow: true,
  }
}

export default function ParadeSquarePage() {
  const mockProducts = [
    {
      id: "7",
      name: "Ceremonial Guard",
      slug: "ceremonial-guard",
      price: 25.99,
      main_image_url: "/images/products/placeholder-tshirt.svg",
      category_id: "parade-square",
      description: "Military pageantry and ceremonial excellence",
      variants: [
        {
          id: "7-1",
          size: "S",
          color: "Navy",
          stockQuantity: 9,
          imageUrls: ["/images/products/placeholder-tshirt.svg"]
        },
        {
          id: "7-2",
          size: "M",
          color: "Navy",
          stockQuantity: 15,
          imageUrls: ["/images/products/placeholder-tshirt.svg"]
        },
        {
          id: "7-3",
          size: "L",
          color: "Navy",
          stockQuantity: 11,
          imageUrls: ["/images/products/placeholder-tshirt.svg"]
        }
      ]
    },
    {
      id: "8",
      name: "Trooping the Colour",
      slug: "trooping-colour",
      price: 24.99,
      main_image_url: "/images/products/placeholder-tshirt.svg",
      category_id: "parade-square",
      description: "Celebrating military tradition and parade ground precision",
      variants: [
        {
          id: "8-1",
          size: "S",
          color: "Black",
          stockQuantity: 12,
          imageUrls: ["/images/products/placeholder-tshirt.svg"]
        },
        {
          id: "8-2",
          size: "M",
          color: "Black",
          stockQuantity: 16,
          imageUrls: ["/images/products/placeholder-tshirt.svg"]
        },
        {
          id: "8-3",
          size: "L",
          color: "Black",
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
                <Medal className="h-12 w-12 text-primary mx-auto" />
              </div>
              
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4 tracking-wider uppercase">
                Parade Square
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                Ceremonial and dress uniform styles celebrating military pageantry, tradition, and the precision of parade ground excellence.
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