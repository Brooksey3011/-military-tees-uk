export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image_url: string | null
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          image_url?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          image_url?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          price: number
          compare_at_price: number | null
          category_id: string | null
          main_image_url: string | null
          is_featured: boolean
          is_active: boolean
          seo_title: string | null
          seo_description: string | null
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          price: number
          compare_at_price?: number | null
          category_id?: string | null
          main_image_url?: string | null
          is_featured?: boolean
          is_active?: boolean
          seo_title?: string | null
          seo_description?: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          price?: number
          compare_at_price?: number | null
          category_id?: string | null
          main_image_url?: string | null
          is_featured?: boolean
          is_active?: boolean
          seo_title?: string | null
          seo_description?: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      product_variants: {
        Row: {
          id: string
          product_id: string
          size: string | null
          color: string | null
          sku: string
          stock_quantity: number
          price_adjustment: number
          weight_grams: number | null
          image_urls: string[] | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          size?: string | null
          color?: string | null
          sku: string
          stock_quantity?: number
          price_adjustment?: number
          weight_grams?: number | null
          image_urls?: string[] | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          size?: string | null
          color?: string | null
          sku?: string
          stock_quantity?: number
          price_adjustment?: number
          weight_grams?: number | null
          image_urls?: string[] | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          user_id: string | null
          first_name: string | null
          last_name: string | null
          phone: string | null
          date_of_birth: string | null
          marketing_consent: boolean
          default_shipping_address_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          date_of_birth?: string | null
          marketing_consent?: boolean
          default_shipping_address_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          date_of_birth?: string | null
          marketing_consent?: boolean
          default_shipping_address_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      addresses: {
        Row: {
          id: string
          customer_id: string
          type: string
          first_name: string
          last_name: string
          company: string | null
          address_line_1: string
          address_line_2: string | null
          city: string
          county: string | null
          postcode: string
          country: string
          phone: string | null
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          type?: string
          first_name: string
          last_name: string
          company?: string | null
          address_line_1: string
          address_line_2?: string | null
          city: string
          county?: string | null
          postcode: string
          country?: string
          phone?: string | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          type?: string
          first_name?: string
          last_name?: string
          company?: string | null
          address_line_1?: string
          address_line_2?: string | null
          city?: string
          county?: string | null
          postcode?: string
          country?: string
          phone?: string | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          customer_id: string
          status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          subtotal: number
          shipping_cost: number
          tax_amount: number
          discount_amount: number
          total: number
          shipping_address: Json
          billing_address: Json
          payment_status: string
          payment_method: string | null
          stripe_payment_intent_id: string | null
          shipped_at: string | null
          delivered_at: string | null
          tracking_number: string | null
          tracking_url: string | null
          customer_notes: string | null
          admin_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number?: string
          customer_id: string
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          subtotal: number
          shipping_cost?: number
          tax_amount?: number
          discount_amount?: number
          total: number
          shipping_address: Json
          billing_address: Json
          payment_status?: string
          payment_method?: string | null
          stripe_payment_intent_id?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
          tracking_number?: string | null
          tracking_url?: string | null
          customer_notes?: string | null
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          customer_id?: string
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          subtotal?: number
          shipping_cost?: number
          tax_amount?: number
          discount_amount?: number
          total?: number
          shipping_address?: Json
          billing_address?: Json
          payment_status?: string
          payment_method?: string | null
          stripe_payment_intent_id?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
          tracking_number?: string | null
          tracking_url?: string | null
          customer_notes?: string | null
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_variant_id: string
          product_snapshot: Json
          quantity: number
          unit_price: number
          total_price: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_variant_id: string
          product_snapshot: Json
          quantity: number
          unit_price: number
          total_price: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_variant_id?: string
          product_snapshot?: Json
          quantity?: number
          unit_price?: number
          total_price?: number
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          product_id: string
          customer_id: string
          order_id: string | null
          rating: number
          title: string | null
          comment: string | null
          photo_urls: string[] | null
          is_verified_purchase: boolean
          is_approved: boolean
          admin_reply: string | null
          replied_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          customer_id: string
          order_id?: string | null
          rating: number
          title?: string | null
          comment?: string | null
          photo_urls?: string[] | null
          is_verified_purchase?: boolean
          is_approved?: boolean
          admin_reply?: string | null
          replied_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          customer_id?: string
          order_id?: string | null
          rating?: number
          title?: string | null
          comment?: string | null
          photo_urls?: string[] | null
          is_verified_purchase?: boolean
          is_approved?: boolean
          admin_reply?: string | null
          replied_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      inventory_movements: {
        Row: {
          id: string
          product_variant_id: string
          movement_type: 'sale' | 'restock' | 'adjustment' | 'return'
          quantity_change: number
          reference_id: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          product_variant_id: string
          movement_type: 'sale' | 'restock' | 'adjustment' | 'return'
          quantity_change: number
          reference_id?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          product_variant_id?: string
          movement_type?: 'sale' | 'restock' | 'adjustment' | 'return'
          quantity_change?: number
          reference_id?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      coupons: {
        Row: {
          id: string
          code: string
          type: 'percentage' | 'fixed_amount'
          value: number
          minimum_order_amount: number
          usage_limit: number | null
          used_count: number
          valid_from: string
          valid_until: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          type: 'percentage' | 'fixed_amount'
          value: number
          minimum_order_amount?: number
          usage_limit?: number | null
          used_count?: number
          valid_from?: string
          valid_until?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          type?: 'percentage' | 'fixed_amount'
          value?: number
          minimum_order_amount?: number
          usage_limit?: number | null
          used_count?: number
          valid_from?: string
          valid_until?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_customer_by_user_id: {
        Args: {
          user_uuid: string
        }
        Returns: {
          id: string
          first_name: string | null
          last_name: string | null
          email: string | null
          phone: string | null
        }[]
      }
    }
    Enums: {
      order_status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
      user_role: 'customer' | 'admin'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}