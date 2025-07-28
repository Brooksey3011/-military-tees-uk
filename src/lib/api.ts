import { supabase } from './supabase'

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

// Helper function to get auth headers
async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession()
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`
  }
  
  return headers
}

// Generic API request function
async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(errorData.error || `HTTP ${response.status}`)
  }

  return response.json()
}

// Auth API calls
export const authAPI = {
  async signIn(email: string, password: string) {
    return supabase.auth.signInWithPassword({ email, password })
  },
  
  async signUp(email: string, password: string, metadata?: Record<string, any>) {
    return supabase.auth.signUp({ 
      email, 
      password,
      options: { data: metadata }
    })
  },
  
  async signOut() {
    return supabase.auth.signOut()
  },
  
  async resetPassword(email: string) {
    return supabase.auth.resetPasswordForEmail(email)
  }
}

// Products API calls
export const productsAPI = {
  async getProducts(params: {
    category?: string
    search?: string
    featured?: boolean
    limit?: number
    offset?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  } = {}) {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value))
      }
    })
    
    const queryString = searchParams.toString()
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`
    
    return apiRequest<{
      products: any[]
      hasMore: boolean
      total: number
    }>(endpoint)
  },
  
  async getProduct(slug: string) {
    return apiRequest<{ product: any }>(`/products/${slug}`)
  },
  
  async createProduct(productData: any) {
    const headers = await getAuthHeaders()
    return apiRequest<{ product: any; message: string }>('/products', {
      method: 'POST',
      headers,
      body: JSON.stringify(productData)
    })
  },
  
  async updateProduct(id: string, productData: any) {
    const headers = await getAuthHeaders()
    return apiRequest<{ product: any; message: string }>(`/products/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(productData)
    })
  },
  
  async deleteProduct(id: string) {
    const headers = await getAuthHeaders()
    return apiRequest<{ message: string }>(`/products/${id}`, {
      method: 'DELETE',
      headers
    })
  }
}

// Categories API calls
export const categoriesAPI = {
  async getCategories(includeProductCount = false) {
    const endpoint = `/categories${includeProductCount ? '?includeProductCount=true' : ''}`
    return apiRequest<{ categories: any[] }>(endpoint)
  },
  
  async createCategory(categoryData: any) {
    const headers = await getAuthHeaders()
    return apiRequest<{ category: any; message: string }>('/categories', {
      method: 'POST',
      headers,
      body: JSON.stringify(categoryData)
    })
  }
}

// Orders API calls
export const ordersAPI = {
  async getOrders(params: {
    status?: string
    limit?: number
    offset?: number
  } = {}) {
    const headers = await getAuthHeaders()
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value))
      }
    })
    
    const queryString = searchParams.toString()
    const endpoint = `/orders${queryString ? `?${queryString}` : ''}`
    
    return apiRequest<{
      orders: any[]
      hasMore: boolean
      total: number
    }>(endpoint, { headers })
  },
  
  async getOrder(id: string) {
    const headers = await getAuthHeaders()
    return apiRequest<{ order: any }>(`/orders/${id}`, { headers })
  },
  
  async createOrder(orderData: any) {
    const headers = await getAuthHeaders()
    return apiRequest<{ order: any; message: string }>('/orders', {
      method: 'POST',
      headers,
      body: JSON.stringify(orderData)
    })
  },
  
  async updateOrderStatus(id: string, status: string, notes?: string) {
    const headers = await getAuthHeaders()
    return apiRequest<{ order: any; message: string }>(`/orders/${id}/status`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ status, notes })
    })
  }
}

// Reviews API calls
export const reviewsAPI = {
  async getReviews(productId: string, params: {
    limit?: number
    offset?: number
  } = {}) {
    const searchParams = new URLSearchParams({ product_id: productId })
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value))
      }
    })
    
    const queryString = searchParams.toString()
    const endpoint = `/reviews?${queryString}`
    
    return apiRequest<{
      reviews: any[]
      hasMore: boolean
      averageRating: number
    }>(endpoint)
  },
  
  async createReview(reviewData: any) {
    const headers = await getAuthHeaders()
    return apiRequest<{ review: any; message: string }>('/reviews', {
      method: 'POST',
      headers,
      body: JSON.stringify(reviewData)
    })
  }
}

// Customer API calls  
export const customerAPI = {
  async getProfile() {
    const headers = await getAuthHeaders()
    return apiRequest<{ customer: any }>('/customer/profile', { headers })
  },
  
  async updateProfile(profileData: any) {
    const headers = await getAuthHeaders()
    return apiRequest<{ customer: any; message: string }>('/customer/profile', {
      method: 'PUT',
      headers,
      body: JSON.stringify(profileData)
    })
  },
  
  async getAddresses() {
    const headers = await getAuthHeaders()
    return apiRequest<{ addresses: any[] }>('/customer/addresses', { headers })
  },
  
  async createAddress(addressData: any) {
    const headers = await getAuthHeaders()
    return apiRequest<{ address: any; message: string }>('/customer/addresses', {
      method: 'POST',
      headers,
      body: JSON.stringify(addressData)
    })
  },
  
  async updateAddress(id: string, addressData: any) {
    const headers = await getAuthHeaders()
    return apiRequest<{ address: any; message: string }>(`/customer/addresses/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(addressData)
    })
  },
  
  async deleteAddress(id: string) {
    const headers = await getAuthHeaders()
    return apiRequest<{ message: string }>(`/customer/addresses/${id}`, {
      method: 'DELETE',
      headers
    })
  }
}

// Checkout/Stripe API calls
export const checkoutAPI = {
  async createCheckoutSession(orderData: {
    items: Array<{ variantId: string; quantity: number }>
    shippingAddress: any
    billingAddress: any
    customerNotes?: string
    discountCode?: string
  }) {
    const headers = await getAuthHeaders()
    return apiRequest<{ 
      sessionId: string; 
      url: string; 
      orderId: string; 
      orderNumber: string 
    }>('/checkout', {
      method: 'POST',
      headers,
      body: JSON.stringify(orderData)
    })
  },

  async verifySession(sessionId: string) {
    const headers = await getAuthHeaders()
    return apiRequest<{ 
      order: any; 
      verified: boolean 
    }>(`/checkout/verify?session_id=${sessionId}`, { headers })
  }
}

// Error types for better error handling
export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message)
    this.name = 'APIError'
  }
}

// Hook for handling API errors
export function handleAPIError(error: unknown): string {
  if (error instanceof APIError) {
    return error.message
  }
  
  if (error instanceof Error) {
    return error.message
  }
  
  return 'An unexpected error occurred'
}