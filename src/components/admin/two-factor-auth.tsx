"use client"

import { useState } from 'react'
import { AdminAuthService } from '@/lib/admin-auth'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield, Smartphone, AlertTriangle } from 'lucide-react'

interface TwoFactorAuthProps {
  onSuccess: () => void
}

export function TwoFactorAuth({ onSuccess }: TwoFactorAuthProps) {
  const { user } = useAuth()
  const [step, setStep] = useState<'verify' | 'setup'>('verify')
  const [token, setToken] = useState('')
  const [setupData, setSetupData] = useState<{ secret: string; qrCode: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleVerify = async () => {
    if (!user || !token) return
    
    setLoading(true)
    setError('')
    
    try {
      const isValid = await (AdminAuthService as any).verify2FA(user.id, token)
      
      if (isValid) {
        onSuccess()
      } else {
        setError('Invalid authentication code. Please try again.')
      }
    } catch (error) {
      setError('Verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSetup2FA = async () => {
    if (!user) return
    
    setLoading(true)
    setError('')
    
    try {
      const data = await (AdminAuthService as any).enable2FA(user.id)
      setSetupData(data)
      setStep('setup')
    } catch (error) {
      setError('Failed to setup 2FA. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteSetup = async () => {
    if (!user || !token) return
    
    setLoading(true)
    setError('')
    
    try {
      const isValid = await (AdminAuthService as any).verify2FA(user.id, token)
      
      if (isValid) {
        onSuccess()
      } else {
        setError('Invalid code. Please check your authenticator app.')
      }
    } catch (error) {
      setError('Setup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'setup') {
    return (
      <Card className="w-full max-w-md border-2 border-border rounded-none">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary p-3 border-2 border-primary mb-4 w-fit">
            <Smartphone className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="font-display font-bold tracking-wider uppercase">
            Setup Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Secure your admin account with 2FA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <Badge className="rounded-none bg-yellow-600 text-white mb-4">
              SECURITY SETUP
            </Badge>
            <p className="text-sm text-muted-foreground mb-4">
              Scan this QR code with Google Authenticator or similar app:
            </p>
            
            {/* QR Code would be displayed here */}
            <div className="bg-muted border-2 border-border p-8 mb-4">
              <p className="text-xs font-mono break-all">
                {setupData?.qrCode}
              </p>
            </div>
            
            <p className="text-xs text-muted-foreground mb-4">
              Manual entry key: <span className="font-mono">{setupData?.secret}</span>
            </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Enter verification code:</label>
              <Input
                type="text"
                placeholder="000000"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                maxLength={6}
                className="text-center text-lg tracking-widest rounded-none border-2"
              />
            </div>
            
            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertTriangle className="h-4 w-4" />
                {error}
              </div>
            )}
            
            <Button 
              onClick={handleCompleteSetup}
              disabled={!token || loading}
              className="w-full rounded-none font-display font-bold tracking-wide uppercase"
            >
              {loading ? 'Verifying...' : 'Complete Setup'}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md border-2 border-border rounded-none">
      <CardHeader className="text-center">
        <div className="mx-auto bg-primary p-3 border-2 border-primary mb-4 w-fit">
          <Shield className="h-8 w-8 text-primary-foreground" />
        </div>
        <CardTitle className="font-display font-bold tracking-wider uppercase">
          Admin Authentication Required
        </CardTitle>
        <CardDescription>
          Enter your two-factor authentication code
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <Badge className="rounded-none bg-red-600 text-white mb-4">
            RESTRICTED ACCESS
          </Badge>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Authentication Code:</label>
            <Input
              type="text"
              placeholder="000000"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              maxLength={6}
              className="text-center text-lg tracking-widest rounded-none border-2"
            />
          </div>
          
          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </div>
          )}
          
          <Button 
            onClick={handleVerify}
            disabled={!token || loading}
            className="w-full rounded-none font-display font-bold tracking-wide uppercase"
          >
            {loading ? 'Verifying...' : 'Verify Access'}
          </Button>
          
          <div className="text-center">
            <button
              onClick={handleSetup2FA}
              className="text-sm text-muted-foreground hover:text-foreground underline"
            >
              Need to setup 2FA?
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}