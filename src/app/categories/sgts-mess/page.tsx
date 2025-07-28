import { Metadata } from "next"
import { Crown, Users, Award } from "lucide-react"
import { Layout } from "@/components/layout"
import { ProductGrid } from "@/components/product/product-grid"

export const metadata: Metadata = {
  title: "Sergeants' Mess - NCO & Leadership | Military Tees UK",
  description: "NCO and leadership designs from the Sergeants' Mess. Premium military t-shirts celebrating non-commissioned officers and leadership.",
  robots: {
    index: true,
    follow: true,
  }
}

export default function SgtsMessPage() {
  const mockProducts = [
    {
      id: "21",
      name: "Sergeant's Stripes",
      slug: "sergeant-stripes",
      price: 25.99,
      main_image_url: "/images/products/placeholder-tshirt.svg",
      category_id: "sgts-mess",
      description: "Non-commissioned officer leadership and military backbone",
      variants: [
        {
          id: "21-1",
          size: "S",
          color: "Army Green",
          stockQuantity: 10,
          imageUrls: ["/images/products/placeholder-tshirt.svg"]
        },
        {
          id: "21-2",
          size: "M",
          color: "Army Green",
          stockQuantity: 14,
          imageUrls: ["/images/products/placeholder-tshirt.svg"]
        },
        {
          id: "21-3",
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
                <Crown className="h-12 w-12 text-primary mx-auto" />
              </div>
              
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4 tracking-wider uppercase">
                Sergeants' Mess
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                NCO and leadership designs celebrating the backbone of the military - our non-commissioned officers and their vital leadership role.
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