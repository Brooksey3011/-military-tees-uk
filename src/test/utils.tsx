import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { CartProvider } from '@/hooks/use-cart'

// Mock Supabase client
export const mockSupabaseClient = {
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    gt: jest.fn().mockReturnThis(),
    lt: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
    then: jest.fn().mockResolvedValue({ data: [], error: null })
  })),
  auth: {
    getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
    signUp: jest.fn().mockResolvedValue({ data: null, error: null }),
    signInWithPassword: jest.fn().mockResolvedValue({ data: null, error: null }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
    onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } })
  },
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn().mockResolvedValue({ data: null, error: null }),
      getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'https://test.com/image.jpg' } })
    }))
  }
}

// Mock product data for tests
export const mockProducts = [
  {
    id: '1',
    name: 'SAS Regiment Elite Tee',
    slug: 'sas-regiment-elite-tee',
    description: 'Premium quality t-shirt honoring the elite SAS Regiment.',
    price: 24.99,
    sale_price: null,
    main_image_url: '/products/sas-regiment-elite-tee.jpg',
    is_active: true,
    featured: true,
    category_id: 'cat-1',
    sku: 'SAS-TEE-001',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z'
  },
  {
    id: '2',
    name: 'Royal Marine Commando Tee',
    slug: 'royal-marine-commando-tee',
    description: 'Honor the Royal Marines with this premium commando-themed t-shirt.',
    price: 24.99,
    sale_price: 22.99,
    main_image_url: '/products/royal-marine-commando-tee.jpg',
    is_active: true,
    featured: false,
    category_id: 'cat-1',
    sku: 'RMC-TEE-001',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z'
  }
]

// Mock categories
export const mockCategories = [
  {
    id: 'cat-1',
    name: 'T-Shirts',
    slug: 't-shirts',
    description: 'Military-themed t-shirts and casual wear',
    image_url: '/categories/t-shirts.jpg',
    is_active: true,
    sort_order: 0,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z'
  }
]

// Mock user data
export const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  user_metadata: {
    first_name: 'John',
    last_name: 'Doe'
  },
  app_metadata: {
    role: 'customer'
  }
}

// Mock admin user
export const mockAdminUser = {
  ...mockUser,
  id: 'admin-1',
  email: 'admin@militarytees.co.uk',
  app_metadata: {
    role: 'admin'
  }
}

// Custom render function with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <CartProvider>
      {children}
    </CartProvider>
  )
}

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Helper functions for testing
export const mockLocalStorage = () => {
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  }
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
  })
  return localStorageMock
}

export const mockSessionStorage = () => {
  const sessionStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  }
  Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock
  })
  return sessionStorageMock
}

// Mock fetch for API testing
export const mockFetch = (response: any) => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => response,
    text: async () => JSON.stringify(response),
  })
}

// Mock next/router
export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  pathname: '/',
  route: '/',
  query: {},
  asPath: '/',
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
}

// Mock next/navigation
export const mockUseRouter = () => mockRouter
export const mockUsePathname = () => '/'
export const mockUseSearchParams = () => new URLSearchParams()

// Test data generators
export const createMockOrder = (overrides = {}) => ({
  id: 'order-1',
  order_number: 'MT20240101-0001',
  customer_id: 'user-1',
  status: 'pending',
  subtotal: 24.99,
  tax_amount: 0,
  shipping_amount: 4.99,
  total: 29.98,
  currency: 'GBP',
  payment_status: 'pending',
  shipping_name: 'John Doe',
  shipping_address_line_1: '123 Test Street',
  shipping_city: 'London',
  shipping_postcode: 'SW1A 1AA',
  shipping_country: 'United Kingdom',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
  ...overrides
})

export const createMockCustomQuote = (overrides = {}) => ({
  id: 'quote-1',
  customer_id: 'user-1',
  name: 'John Doe',
  email: 'test@example.com',
  order_type: 'Custom T-Shirt',
  description: 'I would like a custom design featuring...',
  quantity: 10,
  design_images: ['https://test.com/design1.jpg'],
  status: 'pending',
  admin_notes: null,
  quoted_price: null,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
  ...overrides
})

// Database test helpers
export const createTestDatabase = () => {
  // This would set up a test database instance
  // For now, we'll use mocks, but in a real scenario
  // you might use a test database or memory database
  return {
    cleanup: jest.fn(),
    seed: jest.fn(),
    reset: jest.fn()
  }
}

// Error boundary test helper
export const ErrorBoundaryWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      {children}
    </div>
  )
}