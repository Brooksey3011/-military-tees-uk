"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface CartItem {
  id: string
  productId: string
  variantId: string
  name: string
  price: number
  image: string
  size?: string
  color?: string
  quantity: number
  maxQuantity: number
}

interface CartContextType {
  items: CartItem[]
  totalItems: number
  totalPrice: number
  isOpen: boolean
  addItem: (item: Omit<CartItem, 'id' | 'quantity'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  // Calculate totals
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  // Hydrate from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('military-tees-cart')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setItems(parsed.items || [])
        } catch (error) {
          console.error('Error loading cart from localStorage:', error)
        }
      }
      setIsHydrated(true)
    }
  }, [])

  // Save to localStorage whenever items change (but only after hydration)
  useEffect(() => {
    if (isHydrated && typeof window !== 'undefined') {
      localStorage.setItem('military-tees-cart', JSON.stringify({ items }))
    }
  }, [items, isHydrated])

  const addItem = (newItem: Omit<CartItem, 'id' | 'quantity'>) => {
    if (!isHydrated) return

    setItems(currentItems => {
      const existingItemIndex = currentItems.findIndex(
        item => item.productId === newItem.productId && item.variantId === newItem.variantId
      )

      if (existingItemIndex >= 0) {
        // Update existing item quantity
        const updatedItems = [...currentItems]
        const existingItem = updatedItems[existingItemIndex]
        updatedItems[existingItemIndex] = {
          ...existingItem,
          quantity: Math.min(existingItem.quantity + 1, existingItem.maxQuantity)
        }
        return updatedItems
      } else {
        // Add new item
        const cartItem: CartItem = {
          ...newItem,
          id: `${newItem.productId}-${newItem.variantId}`,
          quantity: 1
        }
        return [...currentItems, cartItem]
      }
    })
    setIsOpen(true) // Open cart when item is added
  }

  const removeItem = (id: string) => {
    if (!isHydrated) return
    setItems(currentItems => currentItems.filter(item => item.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (!isHydrated) return

    if (quantity <= 0) {
      removeItem(id)
      return
    }

    setItems(currentItems =>
      currentItems.map(item => {
        if (item.id === id) {
          return { ...item, quantity: Math.min(quantity, item.maxQuantity) }
        }
        return item
      })
    )
  }

  const clearCart = () => {
    if (!isHydrated) return
    setItems([])
    setIsOpen(false)
  }

  const openCart = () => setIsOpen(true)
  const closeCart = () => setIsOpen(false)
  const toggleCart = () => setIsOpen(prev => !prev)

  // Don't provide cart functionality until hydrated
  const value: CartContextType = {
    items: isHydrated ? items : [],
    totalItems: isHydrated ? totalItems : 0,
    totalPrice: isHydrated ? totalPrice : 0,
    isOpen: isHydrated ? isOpen : false,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    openCart,
    closeCart,
    toggleCart
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useSimpleCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useSimpleCart must be used within a CartProvider')
  }
  return context
}