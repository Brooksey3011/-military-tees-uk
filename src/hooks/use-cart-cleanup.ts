"use client"

import { useEffect } from 'react'
import { useSimpleCart } from './use-simple-cart'

/**
 * Hook to clean up invalid cart items
 * Removes items with missing or invalid variant IDs
 */
export function useCartCleanup() {
  const { items, removeItem } = useSimpleCart()

  useEffect(() => {
    // Check each cart item for validity
    items.forEach(async (item) => {
      try {
        // Validate the variant still exists
        const response = await fetch(`/api/products/variants/${item.variantId}`)
        if (!response.ok) {
          console.warn(`Removing invalid cart item: ${item.name} (variant not found)`)
          removeItem(item.id)
        }
      } catch (error) {
        // If we can't validate, assume it's invalid and remove it
        console.warn(`Removing cart item due to validation error: ${item.name}`)
        removeItem(item.id)
      }
    })
  }, [items, removeItem])
}

/**
 * Manual cleanup function for clearing invalid items
 */
export function clearInvalidCartItems() {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('military-tees-cart')
    if (saved) {
      try {
        const data = JSON.parse(saved)
        // Clear all items for now since we don't have products in the database
        const cleanedData = { ...data, items: [] }
        localStorage.setItem('military-tees-cart', JSON.stringify(cleanedData))
        console.log('✅ Cleared invalid cart items')
        // Reload the page to reflect changes
        window.location.reload()
      } catch (error) {
        console.error('Error cleaning cart:', error)
      }
    }
  }
}