import { Layout } from "@/components/layout"
import { ProductsSafe } from "@/components/pages/products-safe"
import { ClientOnly } from "@/components/ui/client-only"

export const metadata = {
  title: "All Products | Military Tees UK",
  description: "Discover our complete collection of military-themed apparel and accessories",
}

export default function ProductsPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <ClientOnly fallback={
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="bg-gray-100 h-96 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        }>
          <ProductsSafe />
        </ClientOnly>
      </div>
    </Layout>
  )
}