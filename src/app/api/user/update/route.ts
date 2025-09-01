import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase'
import { z } from 'zod'

// Validation schemas
const updateProfileSchema = z.object({
  first_name: z.string().min(1).max(50).optional(),
  last_name: z.string().min(1).max(50).optional(),
  phone: z.string().regex(/^[\+]?[\d\s\-\(\)]{10,}$/).optional().or(z.literal('')),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')),
  preferences: z.object({
    newsletter: z.boolean().optional(),
    sms_marketing: z.boolean().optional(),
    size_preference: z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']).optional(),
    style_preference: z.array(z.string()).optional()
  }).optional(),
  marketing_consent: z.boolean().optional()
})

const addressSchema = z.object({
  id: z.string().uuid().optional(), // For updates
  address_line_1: z.string().min(1).max(100),
  address_line_2: z.string().max(100).optional().or(z.literal('')),
  city: z.string().min(1).max(50),
  county: z.string().max(50).optional().or(z.literal('')),
  postcode: z.string().min(3).max(10),
  country: z.string().min(2).max(2).default('GB'),
  address_type: z.enum(['home', 'work', 'other']).default('home'),
  is_default_shipping: z.boolean().default(false),
  is_default_billing: z.boolean().default(false)
})

const updateRequestSchema = z.object({
  profile: updateProfileSchema.optional(),
  addresses: z.array(addressSchema).optional(),
  delete_addresses: z.array(z.string().uuid()).optional()
})

export async function PUT(request: NextRequest) {
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

    // Parse and validate request body
    const body = await request.json()
    const validatedData = updateRequestSchema.parse(body)

    console.log('🔄 Updating profile for user:', user.id)

    let updatedProfile = null

    // Update profile if provided
    if (validatedData.profile) {
      const { data, error: updateError } = await supabase
        .from('customers')
        .update({
          ...validatedData.profile,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single()

      if (updateError) {
        console.error('❌ Error updating profile:', updateError)
        return NextResponse.json(
          { error: 'Failed to update profile' },
          { status: 500 }
        )
      }

      updatedProfile = data
      console.log('✅ Profile updated successfully')
    }

    // Handle address deletions
    if (validatedData.delete_addresses && validatedData.delete_addresses.length > 0) {
      console.log('🗑️ Deleting addresses:', validatedData.delete_addresses)
      
      const { error: deleteError } = await supabase
        .from('addresses')
        .delete()
        .in('id', validatedData.delete_addresses)
        .eq('customer_id', user.id) // Ensure user can only delete their own addresses

      if (deleteError) {
        console.error('❌ Error deleting addresses:', deleteError)
        return NextResponse.json(
          { error: 'Failed to delete addresses' },
          { status: 500 }
        )
      }
    }

    // Handle address updates/inserts
    if (validatedData.addresses && validatedData.addresses.length > 0) {
      console.log('📍 Processing addresses:', validatedData.addresses.length)

      // Get customer ID
      const { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!customer) {
        return NextResponse.json(
          { error: 'Customer profile not found' },
          { status: 404 }
        )
      }

      for (const address of validatedData.addresses) {
        if (address.id) {
          // Update existing address
          const { error: updateError } = await supabase
            .from('addresses')
            .update({
              address_line_1: address.address_line_1,
              address_line_2: address.address_line_2,
              city: address.city,
              county: address.county,
              postcode: address.postcode,
              country: address.country,
              address_type: address.address_type,
              is_default_shipping: address.is_default_shipping,
              is_default_billing: address.is_default_billing,
              updated_at: new Date().toISOString()
            })
            .eq('id', address.id)
            .eq('customer_id', customer.id) // Security: ensure user owns the address

          if (updateError) {
            console.error('❌ Error updating address:', updateError)
            return NextResponse.json(
              { error: 'Failed to update address' },
              { status: 500 }
            )
          }
        } else {
          // Insert new address
          const { error: insertError } = await supabase
            .from('addresses')
            .insert({
              customer_id: customer.id,
              address_line_1: address.address_line_1,
              address_line_2: address.address_line_2,
              city: address.city,
              county: address.county,
              postcode: address.postcode,
              country: address.country,
              address_type: address.address_type,
              is_default_shipping: address.is_default_shipping,
              is_default_billing: address.is_default_billing
            })

          if (insertError) {
            console.error('❌ Error inserting address:', insertError)
            return NextResponse.json(
              { error: 'Failed to add address' },
              { status: 500 }
            )
          }
        }
      }

      console.log('✅ Addresses processed successfully')
    }

    // Return updated profile data
    const { data: finalProfile, error: fetchError } = await supabase
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
      .single()

    if (fetchError) {
      console.error('❌ Error fetching updated profile:', fetchError)
      return NextResponse.json(
        { error: 'Profile updated but failed to fetch updated data' },
        { status: 500 }
      )
    }

    console.log('✅ Profile update completed successfully')

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      profile: finalProfile
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('❌ User profile update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'