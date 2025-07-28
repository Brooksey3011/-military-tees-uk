import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

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

interface CartState {
  items: CartItem[]
  isOpen: boolean
  totalItems: number
  totalPrice: number
  
  // Actions
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
}

// Ultra-minimal store with basic persistence
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
  // Simple state
  items: [],
  isOpen: false,
  totalItems: 0,
  totalPrice: 0,

  // Simple actions
  addItem: (newItem) => {
    set(state => {
      const existingItemIndex = state.items.findIndex(
        item => item.productId === newItem.productId && item.variantId === newItem.variantId
      )

      let updatedItems: CartItem[]

      if (existingItemIndex >= 0) {
        // Update existing item quantity
        const existingItem = state.items[existingItemIndex]
        const newQuantity = Math.min(existingItem.quantity + 1, existingItem.maxQuantity)
        
        updatedItems = state.items.map((item, index) =>
          index === existingItemIndex ? { ...item, quantity: newQuantity } : item
        )
      } else {
        // Add new item
        const cartItem: CartItem = {
          ...newItem,
          quantity: 1,
          id: `${newItem.productId}-${newItem.variantId}`
        }
        updatedItems = [...state.items, cartItem]
      }

      return {
        items: updatedItems,
        totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        isOpen: true
      }
    })
  },

  removeItem: (id) => {
    set(state => {
      const updatedItems = state.items.filter(item => item.id !== id)
      return {
        items: updatedItems,
        totalItems: updatedItems.length,
        totalPrice: updatedItems.reduce((sum, item) => sum + item.price, 0)
      }
    })
  },

  updateQuantity: (id, quantity) => {
    if (quantity <= 0) {
      get().removeItem(id)
      return
    }
    set(state => {
      const updatedItems = state.items.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
      return {
        items: updatedItems,
        totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      }
    })
  },

  clearCart: () => {
    set({ items: [], totalItems: 0, totalPrice: 0, isOpen: false })
  },

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set(state => ({ isOpen: !state.isOpen })),
    }),
    {
      name: 'military-tees-cart',
      storage: createJSONStorage(() => localStorage),
      // Only persist cart items and totals, not UI state
      partialize: (state) => ({
        items: state.items,
        totalItems: state.totalItems,
        totalPrice: state.totalPrice
      }),
    }
  )
)

// Removed utility hooks - use direct selectors instead to avoid getSnapshot caching issues
// Use useCartStore(state => state.property) directly in components