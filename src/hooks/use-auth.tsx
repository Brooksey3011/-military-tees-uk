"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { AuthService, type AuthUser, type AuthContextType } from '@/lib/auth'
import type { Database } from '@/types/database'

type Customer = Database['public']['Tables']['customers']['Row']

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const currentUser = await AuthService.getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error('Error getting initial session:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = AuthService.onAuthStateChange(
      async (event, session) => {
        setLoading(true)
        
        if (session?.user) {
          try {
            const currentUser = await AuthService.getCurrentUser()
            setUser(currentUser)
          } catch (error) {
            console.error('Error updating user on auth change:', error)
            setUser(null)
          }
        } else {
          setUser(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      await AuthService.signIn(email, password)
      // User state will be updated by the onAuthStateChange listener
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const signUp = async (
    email: string, 
    password: string, 
    metadata?: { first_name?: string, last_name?: string }
  ) => {
    setLoading(true)
    try {
      await AuthService.signUp(email, password, metadata)
      // User state will be updated by the onAuthStateChange listener
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      await AuthService.signOut()
      // User state will be updated by the onAuthStateChange listener
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const resetPassword = async (email: string) => {
    await AuthService.resetPassword(email)
  }

  const updateProfile = async (updates: Partial<Customer>) => {
    if (!user) throw new Error('No user logged in')
    
    try {
      const updatedProfile = await AuthService.updateCustomerProfile(user.id, updates)
      
      // Update local state
      setUser({
        ...user,
        customer: updatedProfile
      })
    } catch (error) {
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Custom hook for checking if user is authenticated
export function useRequireAuth() {
  const { user, loading } = useAuth()
  
  useEffect(() => {
    if (!loading && !user) {
      // Redirect to login page
      window.location.href = '/login'
    }
  }, [user, loading])
  
  return { user, loading }
}

// Custom hook for admin-only access
export function useRequireAdmin() {
  const { user, loading } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [checkingAdmin, setCheckingAdmin] = useState(true)

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!loading && user) {
        try {
          const adminStatus = await AuthService.isAdmin(user.id)
          setIsAdmin(adminStatus)
          
          if (!adminStatus) {
            // Redirect to home if not admin
            window.location.href = '/'
          }
        } catch (error) {
          console.error('Error checking admin status:', error)
          setIsAdmin(false)
          window.location.href = '/'
        }
      } else if (!loading && !user) {
        // Redirect to login if not authenticated
        window.location.href = '/login'
      }
      
      setCheckingAdmin(false)
    }

    checkAdminStatus()
  }, [user, loading])

  return { 
    user, 
    loading: loading || checkingAdmin, 
    isAdmin 
  }
}