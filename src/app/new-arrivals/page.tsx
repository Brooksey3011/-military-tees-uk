import { Layout } from "@/components/layout/layout"
import { NewArrivalsContent } from "@/components/pages/new-arrivals-content"

export const metadata = {
  title: "New Arrivals - Military Tees UK",
  description: "Discover the latest military-themed apparel and tactical gear. Fresh stock of premium British Army inspired tees.",
  openGraph: {
    title: "New Arrivals - Military Tees UK",
    description: "Discover the latest military-themed apparel and tactical gear. Fresh stock of premium British Army inspired tees.",
    type: "website",
  },
}

export default function NewArrivalsPage() {
  return (
    <Layout>
      <NewArrivalsContent />
    </Layout>
  )
}