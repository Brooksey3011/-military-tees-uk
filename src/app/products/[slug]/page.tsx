import { Layout } from "@/components/layout"
import { ProductDetailSafe } from "@/components/pages/product-detail-safe"

export const metadata = {
  title: "Product Details | Military Tees UK",
  description: "View product details for Military Tees UK premium military-themed apparel",
}

export default function ProductPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <ProductDetailSafe />
      </div>
    </Layout>
  )
}