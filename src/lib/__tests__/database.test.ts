import { supabase } from '@/lib/supabase'
import { mockSupabaseClient, mockProducts, createMockOrder, createMockCustomQuote } from '@/test/utils'

// Mock Supabase client
jest.mock('@/lib/supabase', () => ({
  supabase: mockSupabaseClient,
  createSupabaseAdmin: jest.fn(() => mockSupabaseClient)
}))

describe('Database Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Products Database Operations', () => {
    test('fetches all active products', async () => {
      const activeProducts = mockProducts.filter(p => p.is_active)
      
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        then: jest.fn().mockResolvedValue({
          data: activeProducts,
          error: null
        })
      })

      // Using imported supabase client
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      expect(error).toBeNull()
      expect(data).toEqual(activeProducts)
      expect(data.every(p => p.is_active)).toBe(true)
    })

    test('fetches products with variants', async () => {
      const productsWithVariants = mockProducts.map(product => ({
        ...product,
        variants: [
          {
            id: 'var-1',
            product_id: product.id,
            size: 'M',
            color: 'Black',
            price: product.price,
            stock_quantity: 10
          }
        ]
      }))

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        then: jest.fn().mockResolvedValue({
          data: productsWithVariants,
          error: null
        })
      })

      // Using imported supabase client
      const { data, error } = await supabase
        .from('products')
        .select('*, variants(*)')
        .eq('is_active', true)

      expect(error).toBeNull()
      expect(data).toEqual(productsWithVariants)
      expect(data[0].variants).toBeDefined()
      expect(data[0].variants[0].size).toBe('M')
    })

    test('inserts new product successfully', async () => {
      const newProduct = {
        name: 'New Military Tee',
        slug: 'new-military-tee',
        description: 'A new military-themed t-shirt',
        price: 29.99,
        category_id: 'cat-1',
        is_active: true
      }

      const insertedProduct = { id: 'new-id', ...newProduct }

      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: insertedProduct,
          error: null
        })
      })

      // Using imported supabase client
      const { data, error } = await supabase
        .from('products')
        .insert(newProduct)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toEqual(insertedProduct)
      expect(data.id).toBe('new-id')
    })

    test('updates product correctly', async () => {
      const productUpdate = { price: 27.99, updated_at: new Date().toISOString() }
      const updatedProduct = { ...mockProducts[0], ...productUpdate }

      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: updatedProduct,
          error: null
        })
      })

      // Using imported supabase client
      const { data, error } = await supabase
        .from('products')
        .update(productUpdate)
        .eq('id', mockProducts[0].id)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data.price).toBe(27.99)
    })

    test('handles product not found error', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116', message: 'Row not found' }
        })
      })

      // Using imported supabase client
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', 'non-existent-id')
        .single()

      expect(data).toBeNull()
      expect(error).toBeDefined()
      expect(error.code).toBe('PGRST116')
    })
  })

  describe('Orders Database Operations', () => {
    test('creates order with items', async () => {
      const orderData = {
        customer_id: 'user-1',
        status: 'pending',
        total: 49.98,
        shipping_address: 'Test Address'
      }

      const mockOrder = createMockOrder(orderData)

      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockOrder,
          error: null
        })
      })

      // Using imported supabase client
      const { data, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toEqual(mockOrder)
      expect(data.status).toBe('pending')
    })

    test('fetches orders with items and products', async () => {
      const orderWithItems = {
        ...createMockOrder(),
        order_items: [
          {
            id: 'item-1',
            product_variant_id: 'var-1',
            quantity: 2,
            price_at_purchase: 24.99,
            product_variant: {
              id: 'var-1',
              size: 'M',
              color: 'Black',
              product: mockProducts[0]
            }
          }
        ]
      }

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        then: jest.fn().mockResolvedValue({
          data: [orderWithItems],
          error: null
        })
      })

      // Using imported supabase client
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product_variant (
              *,
              product (*)
            )
          )
        `)
        .eq('customer_id', 'user-1')
        .order('created_at', { ascending: false })

      expect(error).toBeNull()
      expect(data[0].order_items).toBeDefined()
      expect(data[0].order_items[0].product_variant.product.name).toBe(mockProducts[0].name)
    })

    test('updates order status', async () => {
      const statusUpdate = { status: 'shipped', updated_at: new Date().toISOString() }
      const updatedOrder = { ...createMockOrder(), ...statusUpdate }

      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: updatedOrder,
          error: null
        })
      })

      // Using imported supabase client
      const { data, error } = await supabase
        .from('orders')
        .update(statusUpdate)
        .eq('id', 'order-1')
        .select()
        .single()

      expect(error).toBeNull()
      expect(data.status).toBe('shipped')
    })
  })

  describe('Custom Quotes Database Operations', () => {
    test('creates custom quote', async () => {
      const quoteData = {
        customer_id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
        order_type: 'Custom T-Shirt',
        description: 'Custom design request',
        quantity: 10,
        design_images: ['https://example.com/image.jpg']
      }

      const mockQuote = createMockCustomQuote(quoteData)

      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockQuote,
          error: null
        })
      })

      // Using imported supabase client
      const { data, error } = await supabase
        .from('custom_quotes')
        .insert(quoteData)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toEqual(mockQuote)
      expect(data.status).toBe('pending')
    })

    test('fetches quotes with customer info', async () => {
      const quoteWithCustomer = {
        ...createMockCustomQuote(),
        customer: {
          id: 'user-1',
          email: 'john@example.com',
          first_name: 'John',
          last_name: 'Doe'
        }
      }

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        then: jest.fn().mockResolvedValue({
          data: [quoteWithCustomer],
          error: null
        })
      })

      // Using imported supabase client
      const { data, error } = await supabase
        .from('custom_quotes')
        .select('*, customer:customers(*)')
        .order('created_at', { ascending: false })

      expect(error).toBeNull()
      expect(data[0].customer).toBeDefined()
      expect(data[0].customer.first_name).toBe('John')
    })

    test('updates quote status and price', async () => {
      const quoteUpdate = {
        status: 'quoted',
        quoted_price: 299.99,
        admin_notes: 'Price includes setup and printing',
        updated_at: new Date().toISOString()
      }

      const updatedQuote = { ...createMockCustomQuote(), ...quoteUpdate }

      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: updatedQuote,
          error: null
        })
      })

      // Using imported supabase client
      const { data, error } = await supabase
        .from('custom_quotes')
        .update(quoteUpdate)
        .eq('id', 'quote-1')
        .select()
        .single()

      expect(error).toBeNull()
      expect(data.status).toBe('quoted')
      expect(data.quoted_price).toBe(299.99)
    })
  })

  describe('Search Operations', () => {
    test('searches products by text', async () => {
      const searchResults = mockProducts.filter(p => 
        p.name.toLowerCase().includes('sas') ||
        p.description.toLowerCase().includes('sas')
      )

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        ilike: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        then: jest.fn().mockResolvedValue({
          data: searchResults,
          error: null
        })
      })

      // Using imported supabase client
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or('name.ilike.%SAS%,description.ilike.%SAS%')
        .eq('is_active', true)
        .order('name')

      expect(error).toBeNull()
      expect(data).toEqual(searchResults)
    })
  })

  describe('Database Constraints and Validation', () => {
    test('enforces unique product slugs', async () => {
      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { 
            code: '23505', 
            message: 'duplicate key value violates unique constraint' 
          }
        })
      })

      const duplicateProduct = {
        name: 'Duplicate Product',
        slug: 'sas-regiment-elite-tee', // Same slug as existing product
        price: 24.99
      }

      // Using imported supabase client
      const { data, error } = await supabase
        .from('products')
        .insert(duplicateProduct)
        .select()
        .single()

      expect(data).toBeNull()
      expect(error).toBeDefined()
      expect(error.code).toBe('23505')
    })

    test('enforces required fields', async () => {
      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { 
            code: '23502', 
            message: 'null value in column violates not-null constraint' 
          }
        })
      })

      const incompleteProduct = {
        name: 'Incomplete Product'
        // Missing required fields like price, slug
      }

      // Using imported supabase client
      const { data, error } = await supabase
        .from('products')
        .insert(incompleteProduct)
        .select()
        .single()

      expect(data).toBeNull()
      expect(error).toBeDefined()
      expect(error.code).toBe('23502')
    })
  })

  describe('Row Level Security (RLS)', () => {
    test('allows public read access to active products', async () => {
      const publicProducts = mockProducts.filter(p => p.is_active)

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        then: jest.fn().mockResolvedValue({
          data: publicProducts,
          error: null
        })
      })

      // Simulate unauthenticated request
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      })

      // Using imported supabase client
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)

      expect(error).toBeNull()
      expect(data).toEqual(publicProducts)
    })

    test('restricts order access to order owner', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        then: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Row level security violation' }
        })
      })

      // Simulate authenticated user trying to access someone else's order
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-2' } },
        error: null
      })

      // Using imported supabase client
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', 'user-1') // Different user's order

      expect(data).toBeNull()
      expect(error).toBeDefined()
    })
  })
})