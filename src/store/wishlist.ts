import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface WishlistItem {
  id: string
  productId: string
  name: string
  slug: string
  price: number
  originalPrice?: number
  image: string
  category: string
  inStock: boolean
  sizes: string[]
  addedDate: string
}

interface WishlistState {
  items: WishlistItem[]
  totalItems: number
}

interface WishlistActions {
  addItem: (item: Omit<WishlistItem, 'id' | 'addedDate'>) => void
  removeItem: (productId: string) => void
  clearWishlist: () => void
  isInWishlist: (productId: string) => boolean
}

type WishlistStore = WishlistState & WishlistActions

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      totalItems: 0,

      // Actions
      addItem: (newItem) => {
        const { items } = get()
        const existingItem = items.find(item => item.productId === newItem.productId)
        
        if (existingItem) {
          // Item already in wishlist, don't add duplicate
          return
        }

        const wishlistItem: WishlistItem = {
          ...newItem,
          id: `wishlist-${newItem.productId}`,
          addedDate: new Date().toISOString().split('T')[0] // YYYY-MM-DD format
        }

        const updatedItems = [...items, wishlistItem]
        
        set({
          items: updatedItems,
          totalItems: updatedItems.length
        })
      },

      removeItem: (productId) => {
        const { items } = get()
        const updatedItems = items.filter(item => item.productId !== productId)
        
        set({
          items: updatedItems,
          totalItems: updatedItems.length
        })
      },

      clearWishlist: () => {
        set({
          items: [],
          totalItems: 0
        })
      },

      isInWishlist: (productId) => {
        const { items } = get()
        return items.some(item => item.productId === productId)
      },
    }),
    {
      name: 'military-tees-wishlist',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// Utility hooks for common wishlist operations
export const useWishlistItems = () => useWishlistStore(state => state.items)
export const useWishlistCount = () => useWishlistStore(state => state.totalItems)
// Export individual action hooks to prevent re-render issues
export const useWishlistAddItem = () => useWishlistStore(state => state.addItem)
export const useWishlistRemoveItem = () => useWishlistStore(state => state.removeItem)
export const useWishlistClear = () => useWishlistStore(state => state.clearWishlist)
export const useWishlistIsIn = () => useWishlistStore(state => state.isInWishlist)

// Backward compatibility - but this creates new objects each render
export const useWishlistActions = () => ({
  addItem: useWishlistStore(state => state.addItem),
  removeItem: useWishlistStore(state => state.removeItem),
  clearWishlist: useWishlistStore(state => state.clearWishlist),
  isInWishlist: useWishlistStore(state => state.isInWishlist),
})