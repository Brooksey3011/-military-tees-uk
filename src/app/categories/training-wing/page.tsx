import { Metadata } from "next"
import { GraduationCap, BookOpen, Target } from "lucide-react"
import { Layout } from "@/components/layout"
import { ProductGrid } from "@/components/product/product-grid"

export const metadata: Metadata = {
  title: "Training Wing - Military Education | Military Tees UK",
  description: "Military education and training themed t-shirts from the Training Wing. Celebrating military instruction and skill development.",
  robots: {
    index: true,
    follow: true,
  }
}

export default function TrainingWingPage() {
  const mockProducts = [
    {
      id: "23",
      name: "Military Instructor",
      slug: "military-instructor",
      price: 24.99,
      main_image_url: "/images/products/placeholder-tshirt.svg",
      category_id: "training-wing",
      description: "Military education excellence and instruction leadership",
      variants: [
        {
          id: "23-1",
          size: "S",
          color: "Navy",
          stockQuantity: 10,
          imageUrls: ["/images/products/placeholder-tshirt.svg"]
        },
        {
          id: "23-2",
          size: "M",
          color: "Navy",
          stockQuantity: 15,
          imageUrls: ["/images/products/placeholder-tshirt.svg"]
        },
        {
          id: "23-3",
          size: "L",
          color: "Navy",
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
                <GraduationCap className="h-12 w-12 text-primary mx-auto" />
              </div>
              
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4 tracking-wider uppercase">
                Training Wing
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                Military education and training designs celebrating instruction, skill development, and the continuous learning that builds military excellence.
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