import { Layout } from "@/components/layout/layout"
import ThruDarkInspiredCheckout from "@/components/checkout/thrudark-inspired-checkout"

// Force dynamic rendering for this auth-dependent page
export const dynamic = 'force-dynamic'

export default function ThruDarkCheckoutPage() {
  return (
    <Layout>
      <ThruDarkInspiredCheckout />
    </Layout>
  )
}