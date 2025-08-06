"use client"

import { useEffect, useState } from 'react'
import { useCartActions, useCartItems, useCartOpen, rehydrateCartStore } from '@/store/cart'

/**
 * Hydration-safe cart hook that ensures cart store is properly rehydrated
 * before being used in components
 */
export function useHydrationSafeCart() {
  const [isHydrated, setIsHydrated] = useState(false)
  const cartActions = useCartActions()
  const cartItems = useCartItems()
  const isOpen = useCartOpen()

  useEffect(() => {
    // Ensure cart store is rehydrated
    rehydrateCartStore()
    setIsHydrated(true)
  }, [])

  // Return stable default values until hydrated
  if (!isHydrated) {
    return {
      items: [],
      isOpen: false,
      addItem: () => {},
      removeItem: () => {},
      updateQuantity: () => {},
      clearCart: () => {},
      openCart: () => {},
      closeCart: () => {},
      toggleCart: () => {},
      isHydrated: false
    }
  }

  return {
    items: cartItems,
    isOpen,
    ...cartActions,
    isHydrated: true
  }
}