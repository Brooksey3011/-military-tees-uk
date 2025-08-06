import { Layout } from "@/components/layout"
import { ProductDetailSafe } from "@/components/pages/product-detail-safe"
import { ClientOnly } from "@/components/ui/client-only"

export const metadata = {
  title: "Product Details | Military Tees UK",
  description: "View product details for Military Tees UK premium military-themed apparel",
}

export default function ProductPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <ClientOnly fallback={
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-100 aspect-square rounded animate-pulse"></div>
              <div className="space-y-4">
                <div className="bg-gray-100 h-8 rounded animate-pulse"></div>
                <div className="bg-gray-100 h-6 rounded animate-pulse"></div>
                <div className="bg-gray-100 h-12 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        }>
          <ProductDetailSafe />
        </ClientOnly>
      </div>
    </Layout>
  )
}