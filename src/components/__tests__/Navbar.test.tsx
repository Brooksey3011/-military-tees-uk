import { render, screen, fireEvent } from '@/test/utils'
import { Navbar } from '@/components/layout/navbar'
import { useCart } from '@/hooks/use-cart'
import { mockUseRouter } from '@/test/utils'

// Mock dependencies
jest.mock('@/hooks/use-cart')
jest.mock('next/navigation', () => ({
  useRouter: () => mockUseRouter,
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams()
}))

const mockUseCart = useCart as jest.MockedFunction<typeof useCart>

describe('Navbar', () => {
  beforeEach(() => {
    mockUseCart.mockReturnValue({
      items: [],
      isOpen: false,
      setIsOpen: jest.fn(),
      addItem: jest.fn(),
      removeItem: jest.fn(),
      updateQuantity: jest.fn(),
      clearCart: jest.fn(),
      getCartTotal: jest.fn(() => 0),
      getCartCount: jest.fn(() => 0)
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders logo and main navigation', () => {
    render(<Navbar />)
    
    expect(screen.getByAltText('Military Tees UK')).toBeInTheDocument()
    expect(screen.getByText('Products')).toBeInTheDocument()
    expect(screen.getByText('Custom Orders')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
    expect(screen.getByText('Contact')).toBeInTheDocument()
  })

  it('displays cart count when items present', () => {
    mockUseCart.mockReturnValue({
      items: [],
      isOpen: false,
      setIsOpen: jest.fn(),
      addItem: jest.fn(),
      removeItem: jest.fn(),
      updateQuantity: jest.fn(),
      clearCart: jest.fn(),
      getCartTotal: jest.fn(() => 49.98),
      getCartCount: jest.fn(() => 3)
    })

    render(<Navbar />)
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('opens cart drawer when cart button clicked', () => {
    const mockSetIsOpen = jest.fn()
    mockUseCart.mockReturnValue({
      items: [],
      isOpen: false,
      setIsOpen: mockSetIsOpen,
      addItem: jest.fn(),
      removeItem: jest.fn(),
      updateQuantity: jest.fn(),
      clearCart: jest.fn(),
      getCartTotal: jest.fn(() => 0),
      getCartCount: jest.fn(() => 0)
    })

    render(<Navbar />)
    
    const cartButton = screen.getByLabelText('Open cart')
    fireEvent.click(cartButton)
    
    expect(mockSetIsOpen).toHaveBeenCalledWith(true)
  })

  it('toggles mobile menu correctly', () => {
    render(<Navbar />)
    
    const mobileMenuButton = screen.getByLabelText('Toggle menu')
    fireEvent.click(mobileMenuButton)
    
    // Check if mobile menu items are visible
    expect(screen.getAllByText('Products')).toHaveLength(2) // Desktop + mobile
  })

  it('closes mobile menu when navigation link clicked', () => {
    render(<Navbar />)
    
    // Open mobile menu
    const mobileMenuButton = screen.getByLabelText('Toggle menu')
    fireEvent.click(mobileMenuButton)
    
    // Click a navigation link in mobile menu
    const mobileProductsLink = screen.getAllByText('Products')[1] // Mobile version
    fireEvent.click(mobileProductsLink)
    
    // Mobile menu should close (only desktop version visible)
    expect(screen.getAllByText('Products')).toHaveLength(1)
  })

  it('shows search functionality', () => {
    render(<Navbar />)
    
    const searchButton = screen.getByLabelText('Search')
    expect(searchButton).toBeInTheDocument()
    
    fireEvent.click(searchButton)
    // Should open search modal or expand search bar
    expect(screen.getByPlaceholderText(/search products/i)).toBeInTheDocument()
  })

  it('displays user account menu when logged in', () => {
    // Mock authenticated state
    const mockUser = { name: 'John Doe', email: 'john@example.com' }
    
    render(<Navbar user={mockUser} />)
    
    expect(screen.getByText('Account')).toBeInTheDocument()
    
    fireEvent.click(screen.getByText('Account'))
    expect(screen.getByText('Profile')).toBeInTheDocument()
    expect(screen.getByText('Orders')).toBeInTheDocument()
    expect(screen.getByText('Logout')).toBeInTheDocument()
  })

  it('shows login/signup when not authenticated', () => {
    render(<Navbar />)
    
    expect(screen.getByText('Login')).toBeInTheDocument()
    expect(screen.getByText('Sign Up')).toBeInTheDocument()
  })

  it('highlights active navigation item', () => {
    // Mock being on products page
    jest.mock('next/navigation', () => ({
      useRouter: () => mockUseRouter,
      usePathname: () => '/products',
      useSearchParams: () => new URLSearchParams()
    }))

    render(<Navbar />)
    
    const productsLink = screen.getByText('Products')
    expect(productsLink).toHaveClass('active') // Or whatever active class is used
  })

  it('handles keyboard navigation correctly', () => {
    render(<Navbar />)
    
    const logo = screen.getByAltText('Military Tees UK')
    expect(logo.closest('a')).toHaveAttribute('href', '/')
    
    // Tab navigation should work
    const firstNavLink = screen.getByText('Products')
    firstNavLink.focus()
    expect(firstNavLink).toHaveFocus()
  })

  it('is accessible with proper ARIA labels', () => {
    render(<Navbar />)
    
    expect(screen.getByRole('navigation')).toBeInTheDocument()
    expect(screen.getByLabelText('Toggle menu')).toBeInTheDocument()
    expect(screen.getByLabelText('Open cart')).toBeInTheDocument()
    expect(screen.getByLabelText('Search')).toBeInTheDocument()
  })
})