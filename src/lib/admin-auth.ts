"use client"

import { createSupabaseAdmin } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'

// Admin user management
export class AdminAuthService {
  static async isAdmin(userId: string): Promise<boolean> {
    try {
      const supabaseAdmin = createSupabaseAdmin()
      const { data, error } = await supabaseAdmin
        .from('admin_users')
        .select('id, is_active')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single()
      
      if (error || !data) {
        return false
      }
      
      return true
    } catch (error) {
      console.error('Error checking admin status:', error)
      return false
    }
  }

  static async requireAdmin(userId: string): Promise<boolean> {
    const isAdmin = await this.isAdmin(userId)
    if (!isAdmin) {
      throw new Error('Admin access required')
    }
    return true
  }

  // 2FA Management
  static async enable2FA(userId: string): Promise<{ secret: string; qrCode: string }> {
    try {
      // This would typically use a library like 'speakeasy' for TOTP
      // For now, we'll create a basic implementation
      const secret = this.generateSecret()
      
      const supabaseAdmin = createSupabaseAdmin()
      const { error } = await supabaseAdmin
        .from('admin_users')
        .update({ 
          two_factor_secret: secret,
          two_factor_enabled: false // Will be enabled after verification
        })
        .eq('user_id', userId)
      
      if (error) {
        throw new Error('Failed to setup 2FA')
      }

      const qrCode = this.generateQRCode(secret, userId)
      
      return { secret, qrCode }
    } catch (error) {
      console.error('Error enabling 2FA:', error)
      throw error
    }
  }

  static async verify2FA(userId: string, token: string): Promise<boolean> {
    try {
      const supabaseAdmin = createSupabaseAdmin()
      const { data, error } = await supabaseAdmin
        .from('admin_users')
        .select('two_factor_secret')
        .eq('user_id', userId)
        .single()
      
      if (error || !data?.two_factor_secret) {
        return false
      }

      // Verify the TOTP token (simplified implementation)
      const isValid = this.verifyTOTP(data.two_factor_secret, token)
      
      if (isValid) {
        // Update to mark 2FA as enabled
        await supabaseAdmin
          .from('admin_users')
          .update({ two_factor_enabled: true })
          .eq('user_id', userId)
      }
      
      return isValid
    } catch (error) {
      console.error('Error verifying 2FA:', error)
      return false
    }
  }

  static async check2FARequired(userId: string): Promise<boolean> {
    try {
      const supabaseAdmin = createSupabaseAdmin()
      const { data, error } = await supabaseAdmin
        .from('admin_users')
        .select('two_factor_enabled')
        .eq('user_id', userId)
        .single()
      
      return data?.two_factor_enabled || false
    } catch (error) {
      return false
    }
  }

  // Helper methods for 2FA (simplified implementations)
  private static generateSecret(): string {
    // In production, use a proper TOTP library like 'speakeasy'
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  private static generateQRCode(secret: string, userId: string): string {
    // In production, generate actual QR code for Google Authenticator
    const issuer = 'Military Tees UK'
    const label = `${issuer}:${userId}`
    return `otpauth://totp/${label}?secret=${secret}&issuer=${issuer}`
  }

  private static verifyTOTP(secret: string, token: string): boolean {
    // In production, use proper TOTP verification
    // This is a simplified implementation for demo purposes
    const expectedToken = this.generateTOTP(secret)
    return token === expectedToken
  }

  private static generateTOTP(secret: string): string {
    // Simplified TOTP generation - in production use speakeasy or similar
    const timeStep = Math.floor(Date.now() / 30000)
    return ((timeStep % 1000000).toString().padStart(6, '0'))
  }

  // Session management
  static async createAdminSession(userId: string): Promise<string> {
    const sessionToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    
    // Store session in localStorage or secure cookie
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_session', sessionToken)
      localStorage.setItem('admin_user_id', userId)
    }
    
    return sessionToken
  }

  static async validateAdminSession(): Promise<string | null> {
    if (typeof window === 'undefined') return null
    
    const sessionToken = localStorage.getItem('admin_session')
    const userId = localStorage.getItem('admin_user_id')
    
    if (!sessionToken || !userId) return null
    
    // Verify the user is still an admin
    const isAdmin = await this.isAdmin(userId)
    if (!isAdmin) {
      this.clearAdminSession()
      return null
    }
    
    return userId
  }

  static clearAdminSession(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_session')
      localStorage.removeItem('admin_user_id')
    }
  }
}