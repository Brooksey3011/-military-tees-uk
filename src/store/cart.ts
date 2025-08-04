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
  maxQuantity: number // Stock limit
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
  totalItems: number
  totalPrice: number
}

interface CartActions {
  addItem: (item: Omit<CartItem, 'id' | 'quantity'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
}

type CartStore = CartState & CartActions

const calculateTotals = (items: CartItem[]) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  return { totalItems, totalPrice }
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      isOpen: false,
      totalItems: 0,
      totalPrice: 0,

      // Actions
      addItem: (newItem) => {
        const { items } = get()
        const existingItemIndex = items.findIndex(
          item => item.productId === newItem.productId && 
                  item.variantId === newItem.variantId
        )

        let updatedItems: CartItem[]

        if (existingItemIndex >= 0) {
          // Item exists, update quantity
          const existingItem = items[existingItemIndex]
          const newQuantity = Math.min(
            existingItem.quantity + 1,
            existingItem.maxQuantity
          )
          
          updatedItems = items.map((item, index) =>
            index === existingItemIndex
              ? { ...item, quantity: newQuantity }
              : item
          )
        } else {
          // New item, add to cart
          const cartItem: CartItem = {
            ...newItem,
            quantity: 1,
            id: `${newItem.productId}-${newItem.variantId}`
          }
          updatedItems = [...items, cartItem]
        }

        const { totalItems, totalPrice } = calculateTotals(updatedItems)
        
        set({
          items: updatedItems,
          totalItems,
          totalPrice,
          isOpen: true // Open cart when item is added
        })
      },

      removeItem: (id) => {
        const { items } = get()
        const updatedItems = items.filter(item => item.id !== id)
        const { totalItems, totalPrice } = calculateTotals(updatedItems)
        
        set({
          items: updatedItems,
          totalItems,
          totalPrice
        })
      },

      updateQuantity: (id, quantity) => {
        const { items } = get()
        
        if (quantity <= 0) {
          // Remove item if quantity is 0 or less
          get().removeItem(id)
          return
        }

        const updatedItems = items.map(item => {
          if (item.id === id) {
            const newQuantity = Math.min(quantity, item.maxQuantity)
            return { ...item, quantity: newQuantity }
          }
          return item
        })

        const { totalItems, totalPrice } = calculateTotals(updatedItems)
        
        set({
          items: updatedItems,
          totalItems,
          totalPrice
        })
      },

      clearCart: () => {
        set({
          items: [],
          totalItems: 0,
          totalPrice: 0,
          isOpen: false
        })
      },

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set(state => ({ isOpen: !state.isOpen })),
    }),
    {
      name: 'military-tees-cart',
      storage: createJSONStorage(() => localStorage),
      // Persist everything except isOpen state
      partialize: (state) => ({
        items: state.items,
        totalItems: state.totalItems,
        totalPrice: state.totalPrice
      }),
    }
  )
)

// Utility hooks for common cart operations
export const useCartItems = () => useCartStore(state => state.items)
export const useCartTotal = () => useCartStore(state => ({
  totalItems: state.totalItems,
  totalPrice: state.totalPrice
}))
export const useCartActions = () => useCartStore(state => ({
  addItem: state.addItem,
  removeItem: state.removeItem,
  updateQuantity: state.updateQuantity,
  clearCart: state.clearCart,
  openCart: state.openCart,
  closeCart: state.closeCart,
  toggleCart: state.toggleCart
}))
export const useCartOpen = () => useCartStore(state => state.isOpen)