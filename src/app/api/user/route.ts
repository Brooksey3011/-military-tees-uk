import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServer()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('📋 Fetching profile for user:', user.id)

    // Get user profile from customers table
    const { data: profile, error: profileError } = await supabase
      .from('customers')
      .select(`
        id,
        user_id,
        first_name,
        last_name,
        phone,
        date_of_birth,
        preferences,
        marketing_consent,
        created_at,
        updated_at,
        default_shipping_address_id,
        addresses (
          id,
          address_line_1,
          address_line_2,
          city,
          county,
          postcode,
          country,
          is_default_shipping,
          is_default_billing,
          address_type
        )
      `)
      .eq('user_id', user.id)
      .maybeSingle()

    if (profileError) {
      console.error('❌ Error fetching profile:', profileError)
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      )
    }

    // If no profile exists, create a basic one
    if (!profile) {
      console.log('🆕 Creating new customer profile for user:', user.id)
      
      const { data: newProfile, error: createError } = await supabase
        .from('customers')
        .insert({
          user_id: user.id,
          first_name: user.user_metadata?.first_name || '',
          last_name: user.user_metadata?.last_name || '',
          preferences: {},
          marketing_consent: false
        })
        .select(`
          id,
          user_id,
          first_name,
          last_name,
          phone,
          date_of_birth,
          preferences,
          marketing_consent,
          created_at,
          updated_at,
          default_shipping_address_id
        `)
        .single()

      if (createError) {
        console.error('❌ Error creating profile:', createError)
        return NextResponse.json(
          { error: 'Failed to create profile' },
          { status: 500 }
        )
      }

      // Return new profile with empty addresses array
      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          email_confirmed: !!user.email_confirmed_at,
          created_at: user.created_at
        },
        profile: {
          ...newProfile,
          addresses: []
        }
      })
    }

    console.log('✅ Profile fetched successfully')

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        email_confirmed: !!user.email_confirmed_at,
        created_at: user.created_at
      },
      profile: profile
    })

  } catch (error) {
    console.error('❌ User profile API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'