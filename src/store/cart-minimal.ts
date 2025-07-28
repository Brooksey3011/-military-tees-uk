import { create } from 'zustand'

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
}

interface CartActions {
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
}

type CartStore = CartState & CartActions

// Simple cart store without persistence middleware
export const useCartStore = create<CartStore>()((set, get) => ({
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
    let newTotalItems = 0
    let newTotalPrice = 0

    if (existingItemIndex >= 0) {
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
      const cartItem: CartItem = {
        ...newItem,
        quantity: 1,
        id: `${newItem.productId}-${newItem.variantId}`
      }
      updatedItems = [...items, cartItem]
    }

    // Calculate totals
    newTotalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0)
    newTotalPrice = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    
    set({
      items: updatedItems,
      totalItems: newTotalItems,
      totalPrice: newTotalPrice,
      isOpen: true
    })
  },

  removeItem: (id) => {
    const { items } = get()
    const updatedItems = items.filter(item => item.id !== id)
    const newTotalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0)
    const newTotalPrice = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    
    set({
      items: updatedItems,
      totalItems: newTotalItems,
      totalPrice: newTotalPrice
    })
  },

  updateQuantity: (id, quantity) => {
    if (quantity <= 0) {
      get().removeItem(id)
      return
    }

    const { items } = get()
    const updatedItems = items.map(item => {
      if (item.id === id) {
        const newQuantity = Math.min(quantity, item.maxQuantity)
        return { ...item, quantity: newQuantity }
      }
      return item
    })

    const newTotalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0)
    const newTotalPrice = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    
    set({
      items: updatedItems,
      totalItems: newTotalItems,
      totalPrice: newTotalPrice
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
}))

// Utility hooks
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