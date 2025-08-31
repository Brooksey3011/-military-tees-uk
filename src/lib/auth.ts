import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

type Customer = Database['public']['Tables']['customers']['Row']

export interface AuthUser extends User {
  customer?: Customer
}

export class AuthService {
  // Sign up with email and password
  static async signUp(email: string, password: string, metadata?: { 
    first_name?: string
    last_name?: string 
  }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })

    if (error) {
      throw new Error(error.message)
    }

    // Create customer profile if user was created
    if (data.user) {
      await this.createCustomerProfile(data.user.id, {
        first_name: metadata?.first_name || null,
        last_name: metadata?.last_name || null
      })
    }

    return data
  }

  // Sign in with email and password
  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  // Sign out
  static async signOut() {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      throw new Error(error.message)
    }
  }

  // Reset password
  static async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })

    if (error) {
      throw new Error(error.message)
    }
  }

  // Update password
  static async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      throw new Error(error.message)
    }
  }

  // Get current user
  static async getCurrentUser(): Promise<AuthUser | null> {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }

    // Get customer profile
    const customer = await this.getCustomerProfile(user.id)
    
    return {
      ...user,
      customer
    }
  }

  // Get current session
  static async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      throw new Error(error.message)
    }

    return session
  }

  // Listen to auth state changes
  static onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }

  // Create customer profile
  private static async createCustomerProfile(userId: string, profile: {
    first_name?: string | null
    last_name?: string | null
  }) {
    const { data, error } = await supabase
      .from('customers')
      .insert({
        user_id: userId,
        first_name: profile.first_name,
        last_name: profile.last_name,
        marketing_consent: false
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating customer profile:', error)
      throw new Error('Failed to create customer profile')
    }

    return data
  }

  // Get customer profile
  static async getCustomerProfile(userId: string): Promise<Customer | null> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle() // Use maybeSingle instead of single to handle no rows gracefully

      if (error) {
        console.error('Error fetching customer profile:', error)
        return null
      }

      // maybeSingle returns null if no rows found, which is normal for new users
      return data
    } catch (error) {
      console.error('Unexpected error fetching customer profile:', error)
      return null
    }
  }

  // Update customer profile
  static async updateCustomerProfile(userId: string, updates: Partial<Omit<Customer, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) {
    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  // Check if user is admin
  static async isAdmin(userId: string): Promise<boolean> {
    const { data } = await supabase
      .from('customers')
      .select('role')
      .eq('user_id', userId)
      .single()

    return data?.role === 'admin'
  }

  // Refresh session
  static async refreshSession() {
    const { data, error } = await supabase.auth.refreshSession()
    
    if (error) {
      throw new Error(error.message)
    }

    return data
  }
}

// Auth context types for React
export interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, metadata?: { first_name?: string, last_name?: string }) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateProfile: (updates: Partial<Customer>) => Promise<void>
}

// Utility functions
export const getInitials = (user: AuthUser | null): string => {
  if (!user) return ''
  
  if (user.customer?.first_name && user.customer?.last_name) {
    return `${user.customer.first_name.charAt(0)}${user.customer.last_name.charAt(0)}`.toUpperCase()
  }
  
  if (user.email) {
    return user.email.charAt(0).toUpperCase()
  }
  
  return 'U'
}

export const getDisplayName = (user: AuthUser | null): string => {
  if (!user) return 'Guest'
  
  if (user.customer?.first_name && user.customer?.last_name) {
    return `${user.customer.first_name} ${user.customer.last_name}`
  }
  
  if (user.customer?.first_name) {
    return user.customer.first_name
  }
  
  if (user.email) {
    return user.email.split('@')[0]
  }
  
  return 'User'
}