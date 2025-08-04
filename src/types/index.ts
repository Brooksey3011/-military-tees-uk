export interface Product {
  id: string
  name: string
  slug: string
  description?: string
  price: number
  compare_at_price?: number
  category_id: string
  main_image_url?: string
  is_featured: boolean
  is_active: boolean
  seo_title?: string
  seo_description?: string
  tags?: string[]
  created_at: string
  updated_at: string
  category?: Category
  variants?: ProductVariant[]
  reviews?: Review[]
  averageRating?: number
  reviewCount?: number
}

export interface ProductVariant {
  id: string
  product_id: string
  size?: string
  color?: string
  sku: string
  stock_quantity: number
  price_adjustment: number
  weight_grams?: number
  image_urls?: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image_url?: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  user_id: string
  default_shipping_address_id?: string
  created_at: string
  updated_at: string
  addresses?: Address[]
}

export interface Address {
  id: string
  customer_id: string
  street: string
  city: string
  postcode: string
  country: string
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  customer_id: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total: number
  shipping_address: Address
  billing_address: Address
  created_at: string
  updated_at: string
  items?: OrderItem[]
  customer?: Customer
}

export interface OrderItem {
  id: string
  order_id: string
  product_variant_id: string
  quantity: number
  price_at_purchase: number
  created_at: string
  variant?: ProductVariant
  product?: Product
}

export interface Review {
  id: string
  product_id: string
  customer_id: string
  rating: number
  comment?: string
  photo_urls?: string[]
  created_at: string
  updated_at: string
  customer?: Customer
}

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

export interface FilterOptions {
  categories: string[]
  colors: string[]
  sizes: string[]
  priceRange: [number, number]
  sortBy: 'name' | 'price-low' | 'price-high' | 'newest' | 'rating'
}