import { Layout } from "@/components/layout"
import { ProductsServer } from "@/components/pages/products-server"

export const metadata = {
  title: "All Products | Military Tees UK",
  description: "Discover our complete collection of military-themed apparel and accessories",
}

export default function ProductsPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <ProductsServer />
      </div>
    </Layout>
  )
}