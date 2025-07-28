import BestsellersContent from "@/components/pages/bestsellers-content"

export const metadata = {
  title: "Bestsellers - Military Tees UK",
  description: "Our most popular military-themed apparel. Top-rated British Army inspired tees loved by customers nationwide.",
  openGraph: {
    title: "Bestsellers - Military Tees UK", 
    description: "Our most popular military-themed apparel. Top-rated British Army inspired tees loved by customers nationwide.",
    type: "website",
  },
}

export default function BestsellersPage() {
  return <BestsellersContent />
}