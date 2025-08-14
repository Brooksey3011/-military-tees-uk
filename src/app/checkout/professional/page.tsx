"use client"

import { CheckoutFlow } from "@/components/checkout/checkout-flow"

// Force dynamic rendering for this checkout page
export const dynamic = 'force-dynamic'

export default function ProfessionalCheckoutPage() {
  return <CheckoutFlow />
}