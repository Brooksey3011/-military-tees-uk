import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseAdmin } from '@/lib/supabase'

// Secure registration schema with comprehensive validation
const registerSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .max(255, 'Email address too long')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(/(?=.*[a-z])/, 'Password must contain at least one lowercase letter')
    .regex(/(?=.*[A-Z])/, 'Password must contain at least one uppercase letter')
    .regex(/(?=.*\d)/, 'Password must contain at least one number'),
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name too long')
    .trim(),
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name too long')
    .trim(),
  marketingConsent: z.boolean().optional().default(false)
})

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const parseResult = registerSchema.safeParse(body)
    
    if (!parseResult.success) {
      console.log('❌ Registration validation failed:', parseResult.error.flatten())
      return NextResponse.json(
        { 
          error: 'Invalid registration data. Please check your input.',
          details: parseResult.error.flatten().fieldErrors
        },
        { status: 400 }
      )
    }
    
    const validatedData = parseResult.data
    
    console.log('🔐 Registration attempt:', { 
      email: validatedData.email,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName
    })

    // Create admin client for server-side operations
    const supabaseAdmin = createSupabaseAdmin()

    // 1. Check if email already exists
    const { data: existingUser, error: checkError } = await supabaseAdmin.auth.admin.listUsers()
    
    const emailExists = existingUser.users?.some((user: any) => user.email === validatedData.email)
    
    if (emailExists) {
      console.log('❌ Registration failed: Email already exists')
      return NextResponse.json(
        { 
          error: 'Email address is already registered. Please sign in or use a different email.',
          code: 'EMAIL_ALREADY_EXISTS'
        },
        { status: 409 }
      )
    }

    // 2. Create user with Supabase Auth (server-side for better security)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: validatedData.email,
      password: validatedData.password,
      email_confirm: true, // Skip email confirmation in development
      user_metadata: {
        first_name: validatedData.firstName,
        last_name: validatedData.lastName
      }
    })

    if (authError) {
      console.error('❌ Supabase auth error:', authError)
      
      // Handle specific Supabase auth errors
      if (authError.message.includes('email')) {
        return NextResponse.json(
          { error: 'Invalid email address format', code: 'INVALID_EMAIL' },
          { status: 400 }
        )
      }
      
      if (authError.message.includes('password')) {
        return NextResponse.json(
          { error: 'Password does not meet security requirements', code: 'WEAK_PASSWORD' },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: 'Registration failed due to authentication error', code: 'AUTH_ERROR' },
        { status: 500 }
      )
    }

    if (!authData.user) {
      console.error('❌ User creation failed: No user returned')
      return NextResponse.json(
        { error: 'User creation failed', code: 'USER_CREATION_FAILED' },
        { status: 500 }
      )
    }

    // 3. Create customer profile (with minimal required fields)
    const { data: customerData, error: customerError } = await supabaseAdmin
      .from('customers')
      .insert({
        user_id: authData.user.id,
        first_name: validatedData.firstName,
        last_name: validatedData.lastName
      })
      .select()
      .single()

    if (customerError) {
      console.error('❌ Customer profile creation failed:', customerError)
      
      // Try to clean up the auth user if customer creation fails
      try {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
        console.log('🧹 Cleaned up auth user after customer creation failure')
      } catch (cleanupError) {
        console.error('❌ Failed to cleanup auth user:', cleanupError)
      }

      return NextResponse.json(
        { 
          error: 'Failed to create customer profile. Please try again.',
          code: 'PROFILE_CREATION_FAILED',
          details: customerError.message
        },
        { status: 500 }
      )
    }

    // 4. Success response
    console.log('✅ Registration successful:', {
      userId: authData.user.id,
      customerId: customerData.id,
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
      },
      customer: {
        id: customerData.id,
        firstName: customerData.first_name,
        lastName: customerData.last_name
      }
    })

  } catch (error) {
    console.error('❌ Registration error:', error)

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0]
      return NextResponse.json(
        { 
          error: firstError.message,
          code: 'VALIDATION_ERROR',
          field: firstError.path.join('.')
        },
        { status: 400 }
      )
    }

    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid request format', code: 'INVALID_JSON' },
        { status: 400 }
      )
    }

    // Handle unknown errors
    return NextResponse.json(
      { 
        error: 'Registration failed due to server error. Please try again.',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}

// Handle unsupported HTTP methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'