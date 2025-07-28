import { z } from 'zod'

// Email validation schema
export const emailSchema = z.object({
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
})

// Newsletter subscription schema
export const newsletterSchema = z.object({
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  preferences: z.object({
    newArrivals: z.boolean().optional(),
    specialOffers: z.boolean().optional(),
    militaryNews: z.boolean().optional(),
  }).optional(),
})

// Contact form schema
export const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject too long'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000, 'Message too long'),
})

// Product creation schema  
export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(100, 'Name too long'),
  slug: z.string().min(1, 'Slug is required').max(100, 'Slug too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description too long'),
  price: z.number().min(0.01, 'Price must be greater than 0').max(9999.99, 'Price too high'),
  category_id: z.string().uuid('Invalid category ID'),
  main_image_url: z.string().url('Invalid image URL').optional(),
  is_featured: z.boolean().optional(),
  is_active: z.boolean().optional(),
})

// Category creation schema
export const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(50, 'Name too long'),
  slug: z.string().min(1, 'Slug is required').max(50, 'Slug too long'),
  description: z.string().max(500, 'Description too long').optional(),
  image_url: z.string().url('Invalid image URL').optional(),
  sort_order: z.number().int().min(0).max(999).optional(),
})

// Checkout session schema
export const checkoutSchema = z.object({
  items: z.array(z.object({
    product_id: z.string().uuid('Invalid product ID'),
    variant_id: z.string().uuid('Invalid variant ID').optional(),
    quantity: z.number().int().min(1, 'Quantity must be at least 1').max(99, 'Quantity too high'),
    price: z.number().min(0.01, 'Price must be greater than 0'),
  })).min(1, 'At least one item is required'),
  customer_email: z.string().email('Invalid email address').optional(),
  shipping_address: z.object({
    name: z.string().min(1, 'Name is required'),
    line1: z.string().min(1, 'Address line 1 is required'),
    line2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    postal_code: z.string().min(1, 'Postal code is required'),
    country: z.string().min(2, 'Country is required').max(2, 'Country must be 2 characters'),
  }).optional(),
})

// Generic validation helper
export function validateRequestBody<T>(schema: z.ZodSchema<T>, body: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const data = schema.parse(body)
    return { success: true, data }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
      return { success: false, error: errorMessage }
    }
    return { success: false, error: 'Invalid request data' }
  }
}

// Sanitize HTML input to prevent XSS
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim()
}