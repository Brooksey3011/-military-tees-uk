import { render, screen, fireEvent, waitFor } from '@/test/utils'
import { CartDrawer } from '@/components/cart/cart-drawer'
import { useCart } from '@/hooks/use-cart'
import { mockProducts } from '@/test/utils'

// Mock the cart hook
jest.mock('@/hooks/use-cart')
const mockUseCart = useCart as jest.MockedFunction<typeof useCart>

const mockCartItem = {
  id: '1',
  product: mockProducts[0],
  variant: {
    id: 'var-1',
    size: 'M',
    color: 'Black',
    price: 24.99,
    stock_quantity: 10
  },
  quantity: 2
}

describe('CartDrawer', () => {
  const mockCartActions = {
    addItem: jest.fn(),
    removeItem: jest.fn(),
    updateQuantity: jest.fn(),
    clearCart: jest.fn(),
    getCartTotal: jest.fn(() => 49.98),
    getCartCount: jest.fn(() => 2)
  }

  beforeEach(() => {
    mockUseCart.mockReturnValue({
      items: [mockCartItem],
      isOpen: true,
      setIsOpen: jest.fn(),
      ...mockCartActions
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders cart items correctly', () => {
    render(<CartDrawer />)
    
    expect(screen.getByText('Shopping Cart (2)')).toBeInTheDocument()
    expect(screen.getByText('SAS Regiment Elite Tee')).toBeInTheDocument()
    expect(screen.getByText('Size: M')).toBeInTheDocument()
    expect(screen.getByText('Color: Black')).toBeInTheDocument()
    expect(screen.getByText('£24.99')).toBeInTheDocument()
  })

  it('displays correct cart total', () => {
    render(<CartDrawer />)
    expect(screen.getByText('Total: £49.98')).toBeInTheDocument()
  })

  it('handles quantity updates correctly', async () => {
    render(<CartDrawer />)
    
    const quantityInput = screen.getByDisplayValue('2')
    fireEvent.change(quantityInput, { target: { value: '3' } })
    
    await waitFor(() => {
      expect(mockCartActions.updateQuantity).toHaveBeenCalledWith('1', 3)
    })
  })

  it('handles item removal', () => {
    render(<CartDrawer />)
    
    const removeButton = screen.getByLabelText('Remove item')
    fireEvent.click(removeButton)
    
    expect(mockCartActions.removeItem).toHaveBeenCalledWith('1')
  })

  it('shows empty cart state when no items', () => {
    mockUseCart.mockReturnValue({
      items: [],
      isOpen: true,
      setIsOpen: jest.fn(),
      ...mockCartActions,
      getCartCount: jest.fn(() => 0)
    })

    render(<CartDrawer />)
    
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument()
    expect(screen.getByText('Continue Shopping')).toBeInTheDocument()
  })

  it('handles checkout button click', () => {
    render(<CartDrawer />)
    
    const checkoutButton = screen.getByText('Proceed to Checkout')
    expect(checkoutButton).toBeInTheDocument()
    expect(checkoutButton).not.toBeDisabled()
  })

  it('closes drawer when close button clicked', () => {
    const mockSetIsOpen = jest.fn()
    mockUseCart.mockReturnValue({
      items: [mockCartItem],
      isOpen: true,
      setIsOpen: mockSetIsOpen,
      ...mockCartActions
    })

    render(<CartDrawer />)
    
    const closeButton = screen.getByLabelText('Close cart')
    fireEvent.click(closeButton)
    
    expect(mockSetIsOpen).toHaveBeenCalledWith(false)
  })

  it('prevents quantity below 1', async () => {
    render(<CartDrawer />)
    
    const quantityInput = screen.getByDisplayValue('2')
    fireEvent.change(quantityInput, { target: { value: '0' } })
    
    await waitFor(() => {
      expect(mockCartActions.updateQuantity).not.toHaveBeenCalled()
    })
  })

  it('handles clear cart functionality', () => {
    render(<CartDrawer />)
    
    const clearButton = screen.getByText('Clear Cart')
    fireEvent.click(clearButton)
    
    // Should show confirmation dialog
    expect(screen.getByText('Are you sure?')).toBeInTheDocument()
    
    const confirmButton = screen.getByText('Clear All Items')
    fireEvent.click(confirmButton)
    
    expect(mockCartActions.clearCart).toHaveBeenCalled()
  })

  it('displays correct shipping information', () => {
    render(<CartDrawer />)
    
    expect(screen.getByText(/free shipping on orders over £50/i)).toBeInTheDocument()
  })
})