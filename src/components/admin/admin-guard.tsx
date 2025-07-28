"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminAuthService } from '@/lib/admin-auth'
import { useAuth } from '@/hooks/use-auth'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { TwoFactorAuth } from './two-factor-auth'

interface AdminGuardProps {
  children: React.ReactNode
}

export function AdminGuard({ children }: AdminGuardProps) {
  // Only use auth hooks on the client side
  const { user, loading } = typeof window !== 'undefined' ? useAuth() : { user: null, loading: true }
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [requires2FA, setRequires2FA] = useState<boolean | null>(null)
  const [is2FAVerified, setIs2FAVerified] = useState(false)

  useEffect(() => {
    async function checkAdminAccess() {
      if (loading || typeof window === 'undefined') return
      
      if (!user) {
        router.push('/login?redirect=/admin')
        return
      }

      try {
        // Check if user is admin
        const adminStatus = await AdminAuthService.isAdmin(user.id)
        setIsAdmin(adminStatus)
        
        if (!adminStatus) {
          router.push('/')
          return
        }

        // Check if 2FA is required
        const requires2FA = await AdminAuthService.check2FARequired(user.id)
        setRequires2FA(requires2FA)
        
        // Check existing admin session
        const existingSession = await AdminAuthService.validateAdminSession()
        if (existingSession && requires2FA) {
          setIs2FAVerified(true)
        } else if (!requires2FA) {
          setIs2FAVerified(true)
        }
        
      } catch (error) {
        console.error('Error checking admin access:', error)
        router.push('/')
      }
    }

    checkAdminAccess()
  }, [user, loading, router])

  const handle2FASuccess = async () => {
    if (user) {
      await AdminAuthService.createAdminSession(user.id)
      setIs2FAVerified(true)
    }
  }

  if (loading || isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
          <p className="text-muted-foreground">You do not have admin privileges.</p>
        </div>
      </div>
    )
  }

  if (requires2FA && !is2FAVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <TwoFactorAuth onSuccess={handle2FASuccess} />
      </div>
    )
  }

  return <>{children}</>
}