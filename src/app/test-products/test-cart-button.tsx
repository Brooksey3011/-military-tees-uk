'use client'

import { Button } from "@/components/ui/button"

interface TestCartButtonProps {
  productName: string
  variantId: string
  price: number
}

export function TestCartButton({ productName, variantId, price }: TestCartButtonProps) {
  return (
    <Button 
      className="bg-green-600 hover:bg-green-700"
      onClick={() => {
        // This would add to cart in a real implementation
        alert(`Would add to cart:\nProduct: ${productName}\nVariant ID: ${variantId}\nPrice: £${price}`)
      }}
    >
      🧪 Test Add to Cart
    </Button>
  )
}