import { Layout } from "@/components/layout/layout"
import EnhancedExpressCheckout from "@/components/checkout/enhanced-express-checkout"

// Force dynamic rendering for this auth-dependent page
export const dynamic = 'force-dynamic'

export default function ExpressCheckoutPage() {
  return (
    <Layout>
      <EnhancedExpressCheckout />
    </Layout>
  )
}