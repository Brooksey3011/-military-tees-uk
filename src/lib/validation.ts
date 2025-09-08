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

// More flexible UK postcode validation - allows various formats
const UK_POSTCODE_REGEX = /^[A-Z]{1,2}[0-9][A-Z0-9]?\s*[0-9][A-Z]{2}$/i

// Comprehensive checkout schema that matches frontend data structure
export const checkoutSchema = z.object({
  items: z.array(z.object({
    variantId: z.string().min(1, 'Variant ID is required'),
    quantity: z.number().int().min(1, 'Quantity must be at least 1').max(99, 'Quantity too high'),
    price: z.number().min(0.01, 'Price must be greater than 0').optional()
  })).min(1, 'At least one item is required'),
  
  shippingAddress: z.object({
    firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
    lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(1, 'Phone number is required').max(20, 'Phone number too long'),
    address1: z.string().min(1, 'Address line 1 is required').max(100, 'Address too long'),
    address2: z.string().max(100, 'Address too long').optional().nullable().transform(val => val || undefined),
    city: z.string().min(1, 'City is required').max(50, 'City name too long'),
    postcode: z.string().min(1, 'Postcode is required').max(10, 'Postcode too long'),
    country: z.string().min(1, 'Country is required')
  }),
  
  billingAddress: z.object({
    firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
    lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
    address1: z.string().min(1, 'Address line 1 is required').max(100, 'Address too long'),
    address2: z.string().max(100, 'Address too long').optional().nullable().transform(val => val || undefined),
    city: z.string().min(1, 'City is required').max(50, 'City name too long'),
    postcode: z.string().min(1, 'Postcode is required').max(10, 'Postcode too long'),
    country: z.string().min(1, 'Country is required')
  }),
  
  customerNotes: z.string().max(500, 'Notes too long').optional()
})

// Legacy checkout schema for backward compatibility
export const legacyCheckoutSchema = z.object({
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
      // More detailed error reporting
      const errorDetails = error.issues.map(err => {
        const path = err.path.length > 0 ? err.path.join('.') : 'root'
        const receivedValue = err.code === 'invalid_type' && 'received' in err ? 
          ` (received: ${typeof err.received === 'string' ? `"${err.received}"` : err.received})` : ''
        return `${path}: ${err.message}${receivedValue}`
      }).join(', ')
      
      return { success: false, error: errorDetails }
    }
    return { success: false, error: 'Invalid request data' }
  }
}

// Additional security validation schemas
export const uuidSchema = z.string().uuid('Invalid UUID format')
export const slugValidationSchema = z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Invalid slug format')
export const phoneSchema = z.string().regex(/^[\+]?[(]?[\d\s\(\)\-\+]{10,}$/, 'Invalid phone number format').optional()

// User profile update schema
export const userProfileUpdateSchema = z.object({
  first_name: z.string().min(1).max(50).trim().optional(),
  last_name: z.string().min(1).max(50).trim().optional(), 
  phone: phoneSchema,
  marketing_consent: z.boolean().optional(),
  addresses: z.array(z.object({
    id: uuidSchema.optional(),
    type: z.enum(['billing', 'shipping']),
    first_name: z.string().min(1).max(50).trim(),
    last_name: z.string().min(1).max(50).trim(),
    street: z.string().min(1).max(255).trim(),
    city: z.string().min(1).max(100).trim(),
    postcode: z.string().min(2).max(12).trim(),
    country: z.string().length(2, 'Country must be 2-letter ISO code').default('GB'),
    phone: phoneSchema,
    is_default: z.boolean().default(false)
  })).max(5, 'Maximum 5 addresses allowed').optional()
})

// Custom quote request schema with enhanced validation
export const customQuoteRequestSchema = z.object({
  customer_email: z.string().email('Invalid email address'),
  customer_name: z.string().min(1, 'Name is required').max(100).trim(),
  requirements: z.string().min(10, 'Requirements must be at least 10 characters').max(2000, 'Requirements too long'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(10000, 'Quantity too high'),
  budget: z.number().min(0, 'Budget cannot be negative').optional(),
  deadline: z.string().datetime('Invalid date format').optional(),
  contact_phone: phoneSchema
})

// Admin authentication schemas
export const adminLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  totp_token: z.string().length(6, '2FA token must be 6 digits').optional()
})

export const admin2FASetupSchema = z.object({
  user_id: uuidSchema,
  totp_token: z.string().length(6, '2FA token must be 6 digits')
})

// Search and filter validation
export const searchParametersSchema = z.object({
  q: z.string().min(1).max(100).trim().optional(),
  category: z.string().min(1).max(100).optional(), // Accept any valid category string
  sort: z.enum(['name', 'price', 'created_at', 'updated_at']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(1000).default(20),
  min_price: z.coerce.number().min(0).optional(),
  max_price: z.coerce.number().min(0).optional(),
  featured: z.boolean().optional()
})

// Rate limiting validation
export const rateLimitSchema = z.object({
  ip: z.string().min(1).max(45), // IP addresses are max 45 chars (IPv6)
  endpoint: z.string().min(1).max(100),
  user_id: uuidSchema.optional(),
  timestamp: z.number().min(0)
})

// File upload validation with enhanced security
export const fileUploadValidationSchema = z.object({
  filename: z.string()
    .min(1, 'Filename is required')
    .max(255, 'Filename too long')
    .refine(name => !/[<>:"/\\|?*]/.test(name), 'Filename contains invalid characters'),
  mimetype: z.enum([
    'image/jpeg',
    'image/png', 
    'image/gif',
    'image/webp',
    'application/pdf'
  ], { errorMap: () => ({ message: 'Unsupported file type' }) }),
  size: z.number()
    .min(1, 'File cannot be empty')
    .max(10 * 1024 * 1024, 'File too large (max 10MB)'),
  content: z.string().optional() // Base64 encoded content
})

// Enhanced security validation function
export function validateAndSanitize<T>(
  schema: z.ZodSchema<T>, 
  data: unknown,
  options: { sanitizeStrings?: boolean; maxDepth?: number } = {}
): { success: true; data: T } | { success: false; error: string } {
  const { sanitizeStrings = true, maxDepth = 10 } = options
  
  try {
    const parsed = schema.parse(data)
    
    if (sanitizeStrings && typeof parsed === 'object' && parsed !== null) {
      const sanitized = sanitizeObjectStrings(parsed, maxDepth)
      return { success: true, data: sanitized as T }
    }
    
    return { success: true, data: parsed }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map(issue => {
        const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : ''
        return `${path}${issue.message}`
      }).join(', ')
      return { success: false, error: errorMessages }
    }
    return { success: false, error: 'Validation failed' }
  }
}

// Deep sanitization of object strings
function sanitizeObjectStrings(obj: any, maxDepth: number, currentDepth = 0): any {
  if (currentDepth >= maxDepth || obj === null || obj === undefined) {
    return obj
  }
  
  if (typeof obj === 'string') {
    return sanitizeInput(obj)
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObjectStrings(item, maxDepth, currentDepth + 1))
  }
  
  if (typeof obj === 'object') {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObjectStrings(value, maxDepth, currentDepth + 1)
    }
    return sanitized
  }
  
  return obj
}

// Enhanced XSS prevention
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return input
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/data:/gi, '') // Remove data: protocols
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim()
    .slice(0, 10000) // Prevent extremely long strings
}

// SQL injection prevention for search queries
export function sanitizeSearchQuery(query: string): string {
  return query
    .replace(/[';-]/g, '') // Remove SQL comment and statement terminators
    .replace(/-{2,}/g, '') // Remove double dashes
    .replace(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|OR|AND)\b)/gi, '') // Remove SQL keywords
    .trim()
    .slice(0, 100) // Limit length
}

// Security headers validation
export const securityHeadersSchema = z.object({
  'user-agent': z.string().max(1000).optional(),
  'x-forwarded-for': z.string().min(1).max(45).optional(), // IP address
  'x-real-ip': z.string().min(1).max(45).optional(), // IP address
  'origin': z.string().url().optional(),
  'referer': z.string().url().optional()
})

// Environment validation
export function validateEnvironmentVariables(requiredVars: string[]): void {
  const missing = requiredVars.filter(varName => !process.env[varName])
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}