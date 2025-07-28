"use client"

import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/cart-ultra-minimal"

export function TestAddToCart() {
  const handleAddTestItem = () => {
    console.log('Adding test item to cart...')
    
    useCartStore.getState().addItem({
      productId: "test-product-1",
      variantId: "test-variant-1", 
      name: "Test Military T-Shirt",
      price: 24.99,
      image: "/test-image.jpg",
      size: "L",
      color: "Army Green",
      maxQuantity: 10
    })
    
    // Debug: Log cart state after adding
    setTimeout(() => {
      const state = useCartStore.getState()
      console.log('Cart state after adding:', {
        items: state.items,
        totalItems: state.totalItems,
        totalPrice: state.totalPrice
      })
    }, 100)
  }

  return (
    <Button onClick={handleAddTestItem} className="mb-4">
      🛒 Add Test Item to Cart
    </Button>
  )
}