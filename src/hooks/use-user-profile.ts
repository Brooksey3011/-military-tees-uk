"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Address {
  id?: string
  address_line_1: string
  address_line_2?: string
  city: string
  county?: string
  postcode: string
  country: string
  address_type: 'home' | 'work' | 'other'
  is_default_shipping: boolean
  is_default_billing: boolean
}

interface UserProfile {
  id: string
  user_id: string
  first_name: string
  last_name: string
  phone?: string
  date_of_birth?: string
  preferences?: {
    newsletter?: boolean
    sms_marketing?: boolean
    size_preference?: string
    style_preference?: string[]
  }
  marketing_consent: boolean
  created_at: string
  updated_at: string
  default_shipping_address_id?: string
  addresses?: Address[]
}

interface User {
  id: string
  email: string
  email_confirmed: boolean
  created_at: string
}

interface UserProfileState {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  error: string | null
}

export function useUserProfile() {
  const [state, setState] = useState<UserProfileState>({
    user: null,
    profile: null,
    loading: true,
    error: null
  })
  const router = useRouter()

  const fetchProfile = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      const response = await fetch('/api/user', {
        method: 'GET',
        credentials: 'include'
      })

      if (response.status === 401) {
        // User not authenticated, redirect to login
        router.push('/login')
        return
      }

      if (!response.ok) {
        throw new Error('Failed to fetch profile')
      }

      const data = await response.json()

      if (data.success) {
        setState({
          user: data.user,
          profile: data.profile,
          loading: false,
          error: null
        })
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: data.error || 'Failed to fetch profile'
        }))
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred'
      }))
    }
  }

  const updateProfile = async (updates: {
    profile?: Partial<UserProfile>
    addresses?: Address[]
    delete_addresses?: string[]
  }) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      const response = await fetch('/api/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(updates)
      })

      if (response.status === 401) {
        router.push('/login')
        return { success: false, error: 'Unauthorized' }
      }

      const data = await response.json()

      if (data.success) {
        setState(prev => ({
          ...prev,
          profile: data.profile,
          loading: false,
          error: null
        }))
        return { success: true }
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: data.error || 'Failed to update profile'
        }))
        return { success: false, error: data.error }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred'
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }))
      return { success: false, error: errorMessage }
    }
  }

  const getDefaultAddress = (type: 'shipping' | 'billing'): Address | null => {
    if (!state.profile?.addresses) return null
    
    return state.profile.addresses.find(addr => 
      type === 'shipping' ? addr.is_default_shipping : addr.is_default_billing
    ) || null
  }

  const getFullName = (): string => {
    if (!state.profile) return ''
    return `${state.profile.first_name} ${state.profile.last_name}`.trim()
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  return {
    ...state,
    fetchProfile,
    updateProfile,
    getDefaultAddress,
    getFullName,
    refetch: fetchProfile
  }
}

// Type exports for use in components
export type { UserProfile, Address, User }