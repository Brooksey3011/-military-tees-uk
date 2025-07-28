import { Metadata } from "next"
import { Dumbbell, Activity, Trophy } from "lucide-react"
import { Layout } from "@/components/layout"
import { ProductGrid } from "@/components/product/product-grid"

export const metadata: Metadata = {
  title: "Gym - Physical Training & Fitness | Military Tees UK",
  description: "Physical training and fitness themed military t-shirts. Celebrating military PT, fitness standards, and warrior conditioning.",
  robots: {
    index: true,
    follow: true,
  }
}

export default function GymPage() {
  const mockProducts = [
    {
      id: "19",
      name: "Military PT",
      slug: "military-pt",
      price: 21.99,
      main_image_url: "/images/products/placeholder-tshirt.svg",
      category_id: "gym",
      description: "Physical training excellence and military fitness standards",
      variants: [
        {
          id: "19-1",
          size: "S",
          color: "Black",
          stockQuantity: 20,
          imageUrls: ["/images/products/placeholder-tshirt.svg"]
        },
        {
          id: "19-2",
          size: "M",
          color: "Black",
          stockQuantity: 25,
          imageUrls: ["/images/products/placeholder-tshirt.svg"]
        },
        {
          id: "19-3",
          size: "L",
          color: "Black",
          stockQuantity: 18,
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
                <Dumbbell className="h-12 w-12 text-primary mx-auto" />
              </div>
              
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4 tracking-wider uppercase">
                The Gym
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                Physical training and fitness designs celebrating military PT, fitness standards, and the warrior conditioning that builds combat readiness.
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