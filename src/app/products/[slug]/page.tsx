import { Metadata } from "next"
import { Layout } from "@/components/layout"
import { ProfessionalProductDetail } from "@/components/pages/professional-product-detail"
import { ClientOnly } from "@/components/ui/client-only"

export const metadata: Metadata = {
  title: "Product Details | Military Tees UK",
  description: "View product details for Military Tees UK premium military-themed apparel",
  keywords: ["military t-shirts", "product details", "british military apparel"],
}

export default function ProductPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <ClientOnly fallback={
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-4">
                <div className="aspect-square bg-muted/20 animate-pulse rounded-none border-2 border-border"></div>
                <div className="grid grid-cols-4 gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="aspect-square bg-muted/20 animate-pulse rounded-none border-2 border-border"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <div className="bg-muted/20 h-8 animate-pulse rounded-none"></div>
                <div className="bg-muted/20 h-6 animate-pulse rounded-none"></div>
                <div className="bg-muted/20 h-16 animate-pulse rounded-none"></div>
                <div className="bg-muted/20 h-12 animate-pulse rounded-none"></div>
              </div>
            </div>
          </div>
        }>
          <ProfessionalProductDetail />
        </ClientOnly>
      </div>
    </Layout>
  )
}