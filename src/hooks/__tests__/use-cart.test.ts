import { renderHook, act } from '@testing-library/react'
import { useCart } from '@/hooks/use-cart'
import { mockProducts, mockLocalStorage } from '@/test/utils'

describe('useCart Hook', () => {
  const mockProduct = mockProducts[0]
  const mockVariant = {
    id: 'var-1',
    size: 'M',
    color: 'Black',
    price: 24.99,
    stock_quantity: 10
  }

  let mockStorage: ReturnType<typeof mockLocalStorage>

  beforeEach(() => {
    mockStorage = mockLocalStorage()
    mockStorage.getItem.mockReturnValue(null)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('initializes with empty cart', () => {
    const { result } = renderHook(() => useCart())

    expect(result.current.items).toEqual([])
    expect(result.current.getCartCount()).toBe(0)
    expect(result.current.getCartTotal()).toBe(0)
    expect(result.current.isOpen).toBe(false)
  })

  test('loads cart from localStorage on initialization', () => {
    const savedCart = [{
      id: '1',
      product: mockProduct,
      variant: mockVariant,
      quantity: 2
    }]
    
    mockStorage.getItem.mockReturnValue(JSON.stringify(savedCart))

    const { result } = renderHook(() => useCart())

    expect(result.current.items).toEqual(savedCart)
    expect(result.current.getCartCount()).toBe(2)
  })

  test('adds item to cart correctly', () => {
    const { result } = renderHook(() => useCart())

    act(() => {
      result.current.addItem(mockProduct, mockVariant, 1)
    })

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0]).toEqual({
      id: '1-var-1',
      product: mockProduct,
      variant: mockVariant,
      quantity: 1
    })
    expect(result.current.getCartCount()).toBe(1)
    expect(result.current.getCartTotal()).toBe(24.99)
  })

  test('increases quantity when adding existing item', () => {
    const { result } = renderHook(() => useCart())

    act(() => {
      result.current.addItem(mockProduct, mockVariant, 1)
    })

    act(() => {
      result.current.addItem(mockProduct, mockVariant, 2)
    })

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].quantity).toBe(3)
    expect(result.current.getCartCount()).toBe(3)
    expect(result.current.getCartTotal()).toBe(74.97)
  })

  test('removes item from cart', () => {
    const { result } = renderHook(() => useCart())

    act(() => {
      result.current.addItem(mockProduct, mockVariant, 2)
    })

    act(() => {
      result.current.removeItem('1-var-1')
    })

    expect(result.current.items).toHaveLength(0)
    expect(result.current.getCartCount()).toBe(0)
    expect(result.current.getCartTotal()).toBe(0)
  })

  test('updates item quantity', () => {
    const { result } = renderHook(() => useCart())

    act(() => {
      result.current.addItem(mockProduct, mockVariant, 2)
    })

    act(() => {
      result.current.updateQuantity('1-var-1', 5)
    })

    expect(result.current.items[0].quantity).toBe(5)
    expect(result.current.getCartCount()).toBe(5)
    expect(result.current.getCartTotal()).toBe(124.95)
  })

  test('removes item when quantity updated to 0', () => {
    const { result } = renderHook(() => useCart())

    act(() => {
      result.current.addItem(mockProduct, mockVariant, 2)
    })

    act(() => {
      result.current.updateQuantity('1-var-1', 0)
    })

    expect(result.current.items).toHaveLength(0)
  })

  test('prevents negative quantities', () => {
    const { result } = renderHook(() => useCart())

    act(() => {
      result.current.addItem(mockProduct, mockVariant, 2)
    })

    act(() => {
      result.current.updateQuantity('1-var-1', -1)
    })

    expect(result.current.items[0].quantity).toBe(2) // Should remain unchanged
  })

  test('clears entire cart', () => {
    const { result } = renderHook(() => useCart())

    act(() => {
      result.current.addItem(mockProduct, mockVariant, 2)
      result.current.addItem(mockProducts[1], mockVariant, 1)
    })

    expect(result.current.items).toHaveLength(2)

    act(() => {
      result.current.clearCart()
    })

    expect(result.current.items).toHaveLength(0)
    expect(result.current.getCartCount()).toBe(0)
    expect(result.current.getCartTotal()).toBe(0)
  })

  test('calculates correct cart total with sale prices', () => {
    const saleProduct = { ...mockProduct, sale_price: 19.99 }
    const saleVariant = { ...mockVariant, price: 19.99 }
    
    const { result } = renderHook(() => useCart())

    act(() => {
      result.current.addItem(saleProduct, saleVariant, 2)
    })

    expect(result.current.getCartTotal()).toBe(39.98)
  })

  test('handles multiple different products', () => {
    const { result } = renderHook(() => useCart())
    const variant2 = { ...mockVariant, id: 'var-2', color: 'Green' }

    act(() => {
      result.current.addItem(mockProduct, mockVariant, 1)
      result.current.addItem(mockProducts[1], variant2, 2)
    })

    expect(result.current.items).toHaveLength(2)
    expect(result.current.getCartCount()).toBe(3)
    expect(result.current.getCartTotal()).toBe(74.97) // 24.99 + (24.99 * 2)
  })

  test('toggles cart drawer open/closed', () => {
    const { result } = renderHook(() => useCart())

    expect(result.current.isOpen).toBe(false)

    act(() => {
      result.current.setIsOpen(true)
    })

    expect(result.current.isOpen).toBe(true)

    act(() => {
      result.current.setIsOpen(false)
    })

    expect(result.current.isOpen).toBe(false)
  })

  test('persists cart to localStorage on changes', () => {
    const { result } = renderHook(() => useCart())

    act(() => {
      result.current.addItem(mockProduct, mockVariant, 1)
    })

    expect(mockStorage.setItem).toHaveBeenCalledWith(
      'military-tees-cart',
      JSON.stringify(result.current.items)
    )
  })

  test('handles corrupted localStorage data gracefully', () => {
    mockStorage.getItem.mockReturnValue('invalid json')

    const { result } = renderHook(() => useCart())

    expect(result.current.items).toEqual([])
    expect(result.current.getCartCount()).toBe(0)
  })

  test('generates correct cart item IDs', () => {
    const { result } = renderHook(() => useCart())

    act(() => {
      result.current.addItem(mockProduct, mockVariant, 1)
    })

    expect(result.current.items[0].id).toBe('1-var-1')
  })

  test('handles stock quantity limits', () => {
    const lowStockVariant = { ...mockVariant, stock_quantity: 2 }
    const { result } = renderHook(() => useCart())

    act(() => {
      result.current.addItem(mockProduct, lowStockVariant, 5) // Try to add more than stock
    })

    // Should limit to available stock
    expect(result.current.items[0].quantity).toBe(2)
  })

  test('validates product and variant data', () => {
    const { result } = renderHook(() => useCart())

    // Try to add invalid product
    act(() => {
      result.current.addItem(null as any, mockVariant, 1)
    })

    expect(result.current.items).toHaveLength(0)

    // Try to add invalid variant
    act(() => {
      result.current.addItem(mockProduct, null as any, 1)
    })

    expect(result.current.items).toHaveLength(0)
  })

  test('calculates subtotal correctly', () => {
    const { result } = renderHook(() => useCart())

    act(() => {
      result.current.addItem(mockProduct, mockVariant, 2)
      result.current.addItem(mockProducts[1], { ...mockVariant, id: 'var-2', price: 22.99 }, 1)
    })

    const expectedSubtotal = (24.99 * 2) + 22.99
    expect(result.current.getCartTotal()).toBe(expectedSubtotal)
  })

  test('handles cart operations when cart is closed', () => {
    const { result } = renderHook(() => useCart())

    // Add item when cart is closed
    act(() => {
      result.current.addItem(mockProduct, mockVariant, 1)
    })

    expect(result.current.items).toHaveLength(1)
    expect(result.current.isOpen).toBe(false) // Should remain closed
  })

  test('provides cart summary information', () => {
    const { result } = renderHook(() => useCart())

    act(() => {
      result.current.addItem(mockProduct, mockVariant, 2)
      result.current.addItem(mockProducts[1], { ...mockVariant, id: 'var-2' }, 1)
    })

    expect(result.current.getCartCount()).toBe(3) // Total items
    expect(result.current.items).toHaveLength(2) // Unique products
    expect(result.current.getCartTotal()).toBeGreaterThan(0)
  })
})