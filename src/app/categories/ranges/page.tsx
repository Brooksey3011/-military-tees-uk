import { Metadata } from "next"
import { Target, Crosshair, Zap } from "lucide-react"
import { Layout } from "@/components/layout"
import { ProductGrid } from "@/components/product/product-grid"

export const metadata: Metadata = {
  title: "The Ranges - Shooting & Marksmanship | Military Tees UK",
  description: "Shooting and marksmanship designs from the ranges. Premium military t-shirts celebrating accuracy, precision, and weapons training.",
  robots: {
    index: true,
    follow: true,
  }
}

export default function RangesPage() {
  const mockProducts = [
    {
      id: "11",
      name: "Marksman Expert",
      slug: "marksman-expert",
      price: 25.99,
      main_image_url: "/images/products/placeholder-tshirt.svg",
      category_id: "ranges",
      description: "Celebrating marksmanship excellence and shooting precision",
      variants: [
        {
          id: "11-1",
          size: "S",
          color: "Army Green",
          stockQuantity: 9,
          imageUrls: ["/images/products/placeholder-tshirt.svg"]
        },
        {
          id: "11-2",
          size: "M",
          color: "Army Green",
          stockQuantity: 14,
          imageUrls: ["/images/products/placeholder-tshirt.svg"]
        },
        {
          id: "11-3",
          size: "L",
          color: "Army Green",
          stockQuantity: 11,
          imageUrls: ["/images/products/placeholder-tshirt.svg"]
        }
      ]
    },
    {
      id: "12",
      name: "Sniper School Graduate",
      slug: "sniper-school",
      price: 27.99,
      main_image_url: "/images/products/placeholder-tshirt.svg",
      category_id: "ranges",
      description: "Elite sniper training and tactical marksmanship excellence",
      variants: [
        {
          id: "12-1",
          size: "S",
          color: "Black",
          stockQuantity: 6,
          imageUrls: ["/images/products/placeholder-tshirt.svg"]
        },
        {
          id: "12-2",
          size: "M",
          color: "Black",
          stockQuantity: 10,
          imageUrls: ["/images/products/placeholder-tshirt.svg"]
        },
        {
          id: "12-3",
          size: "L",
          color: "Black",
          stockQuantity: 8,
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
                <Target className="h-12 w-12 text-primary mx-auto" />
              </div>
              
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4 tracking-wider uppercase">
                The Ranges
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                Shooting and marksmanship designs celebrating accuracy, precision, and weapons training excellence on the military ranges.
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