import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { authenticator } from 'otplib'

// Secure admin authentication with server-side validation
export class SecureAdminAuth {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex')
  private static readonly JWT_EXPIRES_IN = '24h'
  private static readonly SESSION_COOKIE_NAME = 'admin_session'

  /**
   * Validate admin user and check permissions
   */
  static async validateAdmin(userId: string): Promise<boolean> {
    try {
      const supabase = createSupabaseAdmin()
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, is_active, role')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single()
      
      if (error || !data) {
        console.warn(`Admin validation failed for user ${userId}:`, error?.message)
        return false
      }
      
      return true
    } catch (error) {
      console.error('Error validating admin:', error)
      return false
    }
  }

  /**
   * Create secure admin session with JWT + HttpOnly cookie
   */
  static async createSecureSession(userId: string, require2FA = true): Promise<{ token: string; response: NextResponse }> {
    // Validate admin status first
    const isAdmin = await this.validateAdmin(userId)
    if (!isAdmin) {
      throw new Error('User is not an admin or inactive')
    }

    // Check 2FA requirement
    if (require2FA) {
      const needs2FA = await this.check2FAEnabled(userId)
      if (needs2FA) {
        throw new Error('2FA verification required')
      }
    }

    // Generate secure JWT token
    const payload = {
      sub: userId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
      role: 'admin',
      sessionId: crypto.randomUUID()
    }

    const token = jwt.sign(payload, this.JWT_SECRET, {
      algorithm: 'HS256',
      expiresIn: this.JWT_EXPIRES_IN
    })

    // Store session in database for revocation capability
    await this.storeSession(userId, payload.sessionId, payload.exp)

    // Create response with secure HttpOnly cookie
    const response = new NextResponse()
    response.cookies.set(this.SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/'
    })

    return { token, response }
  }

  /**
   * Validate admin session from request
   */
  static async validateSession(request: NextRequest): Promise<{ userId: string; sessionId: string } | null> {
    try {
      // Get token from HttpOnly cookie
      const token = request.cookies.get(this.SESSION_COOKIE_NAME)?.value
      if (!token) {
        return null
      }

      // Verify JWT token
      const payload = jwt.verify(token, this.JWT_SECRET) as any
      if (!payload.sub || !payload.sessionId) {
        return null
      }

      // Check if session is still valid in database
      const isValidSession = await this.validateStoredSession(payload.sub, payload.sessionId)
      if (!isValidSession) {
        return null
      }

      // Double-check admin status (in case permissions changed)
      const isAdmin = await this.validateAdmin(payload.sub)
      if (!isAdmin) {
        await this.revokeSession(payload.sub, payload.sessionId)
        return null
      }

      return { 
        userId: payload.sub, 
        sessionId: payload.sessionId 
      }
    } catch (error) {
      console.warn('Session validation failed:', error)
      return null
    }
  }

  /**
   * Secure 2FA implementation with proper TOTP
   */
  static async setup2FA(userId: string): Promise<{ secret: string; qrCode: string }> {
    const isAdmin = await this.validateAdmin(userId)
    if (!isAdmin) {
      throw new Error('Unauthorized')
    }

    // Generate secure secret using otplib
    const secret = authenticator.generateSecret()
    
    const supabase = createSupabaseAdmin()
    const { error } = await supabase
      .from('admin_users')
      .update({
        two_factor_secret: secret,
        two_factor_enabled: false, // Enabled after verification
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
    
    if (error) {
      throw new Error('Failed to setup 2FA')
    }

    // Generate QR code URL for authenticator apps
    const service = 'Military Tees UK'
    const qrCode = authenticator.keyuri(userId, service, secret)
    
    return { secret, qrCode }
  }

  /**
   * Verify 2FA token with constant-time comparison
   */
  static async verify2FA(userId: string, token: string): Promise<boolean> {
    try {
      const supabase = createSupabaseAdmin()
      const { data, error } = await supabase
        .from('admin_users')
        .select('two_factor_secret, two_factor_enabled')
        .eq('user_id', userId)
        .single()
      
      if (error || !data?.two_factor_secret) {
        return false
      }

      // Use otplib for secure TOTP verification (handles timing attacks)
      const isValid = authenticator.verify({
        token: token.trim(),
        secret: data.two_factor_secret
      })
      
      if (isValid && !data.two_factor_enabled) {
        // Enable 2FA after first successful verification
        await supabase
          .from('admin_users')
          .update({ 
            two_factor_enabled: true,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
      }
      
      return isValid
    } catch (error) {
      console.error('2FA verification error:', error)
      return false
    }
  }

  /**
   * Check if 2FA is enabled for user
   */
  static async check2FAEnabled(userId: string): Promise<boolean> {
    try {
      const supabase = createSupabaseAdmin()
      const { data, error } = await supabase
        .from('admin_users')
        .select('two_factor_enabled')
        .eq('user_id', userId)
        .single()
      
      return data?.two_factor_enabled || false
    } catch (error) {
      return false
    }
  }

  /**
   * Store session in database for revocation capability
   */
  private static async storeSession(userId: string, sessionId: string, expiresAt: number): Promise<void> {
    const supabase = createSupabaseAdmin()
    await supabase
      .from('admin_sessions')
      .insert({
        user_id: userId,
        session_id: sessionId,
        expires_at: new Date(expiresAt * 1000).toISOString(),
        created_at: new Date().toISOString()
      })
  }

  /**
   * Validate stored session
   */
  private static async validateStoredSession(userId: string, sessionId: string): Promise<boolean> {
    const supabase = createSupabaseAdmin()
    const { data, error } = await supabase
      .from('admin_sessions')
      .select('id')
      .eq('user_id', userId)
      .eq('session_id', sessionId)
      .gt('expires_at', new Date().toISOString())
      .single()
    
    return !error && !!data
  }

  /**
   * Revoke specific session
   */
  static async revokeSession(userId: string, sessionId: string): Promise<void> {
    const supabase = createSupabaseAdmin()
    await supabase
      .from('admin_sessions')
      .delete()
      .eq('user_id', userId)
      .eq('session_id', sessionId)
  }

  /**
   * Revoke all sessions for user
   */
  static async revokeAllSessions(userId: string): Promise<void> {
    const supabase = createSupabaseAdmin()
    await supabase
      .from('admin_sessions')
      .delete()
      .eq('user_id', userId)
  }

  /**
   * Clear session cookie
   */
  static clearSession(): NextResponse {
    const response = new NextResponse()
    response.cookies.delete(this.SESSION_COOKIE_NAME)
    return response
  }

  /**
   * Middleware helper to protect admin routes
   */
  static async requireAdmin(request: NextRequest): Promise<{ userId: string; sessionId: string } | NextResponse> {
    const session = await this.validateSession(request)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 401 }
      )
    }
    
    return session
  }

  /**
   * Clean up expired sessions (run periodically)
   */
  static async cleanupExpiredSessions(): Promise<void> {
    const supabase = createSupabaseAdmin()
    await supabase
      .from('admin_sessions')
      .delete()
      .lt('expires_at', new Date().toISOString())
  }
}

// Middleware function for admin route protection
export async function withAdminAuth(
  request: NextRequest,
  handler: (request: NextRequest, session: { userId: string; sessionId: string }) => Promise<NextResponse>
): Promise<NextResponse> {
  const sessionResult = await SecureAdminAuth.requireAdmin(request)
  
  if (sessionResult instanceof NextResponse) {
    return sessionResult // Return error response
  }
  
  return handler(request, sessionResult)
}

// Types
export interface AdminSession {
  userId: string
  sessionId: string
}

export interface AdminUser {
  id: string
  user_id: string
  email: string
  role: string
  is_active: boolean
  two_factor_enabled: boolean
}