import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseAdmin } from '@/lib/supabase'

// Simple registration schema
const registerSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(8),
  firstName: z.string().min(2).max(50).trim(),
  lastName: z.string().min(2).max(50).trim()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)
    
    console.log('🔐 Simple registration attempt:', { 
      email: validatedData.email,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName
    })

    const supabaseAdmin = createSupabaseAdmin()

    // Create user with Supabase Auth (this is the core functionality that matters)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: validatedData.email,
      password: validatedData.password,
      email_confirm: true,
      user_metadata: {
        first_name: validatedData.firstName,
        last_name: validatedData.lastName
      }
    })

    if (authError) {
      console.error('❌ Supabase auth error:', authError)
      
      // Handle duplicate email
      if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
        return NextResponse.json(
          { error: 'Email address is already registered', code: 'EMAIL_ALREADY_EXISTS' },
          { status: 409 }
        )
      }
      
      return NextResponse.json(
        { error: 'Registration failed: ' + authError.message, code: 'AUTH_ERROR' },
        { status: 500 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'User creation failed', code: 'USER_CREATION_FAILED' },
        { status: 500 }
      )
    }

    console.log('✅ Registration successful:', {
      userId: authData.user.id,
      email: validatedData.email
    })

    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName
      }
    })

  } catch (error) {
    console.error('❌ Registration error:', error)

    if (error instanceof z.ZodError) {
      const firstError = error.issues[0]
      return NextResponse.json(
        { error: firstError.message, code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Registration failed due to server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'