"use client"

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function StripeDebugInfo() {
  const [debugInfo, setDebugInfo] = useState<Record<string, any>>({})

  useEffect(() => {
    const checkStripeEnvironment = () => {
      const info: Record<string, any> = {
        // Environment
        nodeEnv: process.env.NODE_ENV,
        publicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'Present' : 'Missing',
        publicKeyLength: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.length || 0,
        
        // Browser capabilities
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        
        // Apple Pay detection
        applePaySession: 'ApplePaySession' in window,
        applePayCanMakePayments: false,
        applePayCanMakeActiveCard: false,
        
        // Google Pay detection
        googlePayAPI: 'google' in window && 'payments' in (window as any).google,
        
        // Payment Request API
        paymentRequest: 'PaymentRequest' in window,
        
        // Secure context
        isSecureContext: window.isSecureContext,
        protocol: window.location.protocol,
        
        // Stripe loading
        stripeLoaded: false,
        stripeError: null
      }

      // Check Apple Pay
      if (window.ApplePaySession) {
        info.applePayCanMakePayments = window.ApplePaySession.canMakePayments()
        
        if (info.applePayCanMakePayments) {
          window.ApplePaySession.canMakePaymentsWithActiveCard()
            .then((canMake) => {
              setDebugInfo(prev => ({ ...prev, applePayCanMakeActiveCard: canMake }))
            })
            .catch((error) => {
              setDebugInfo(prev => ({ ...prev, applePayError: error.message }))
            })
        }
      }

      // Check Google Pay
      if ('google' in window && 'payments' in (window as any).google) {
        info.googlePayAPI = true
      }

      setDebugInfo(info)
    }

    checkStripeEnvironment()

    // Also test Stripe loading
    import('@stripe/stripe-js').then((stripeJs) => {
      return stripeJs.loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
    }).then((stripe) => {
      setDebugInfo(prev => ({ 
        ...prev, 
        stripeLoaded: !!stripe,
        stripeVersion: (stripe as any)?._versionString || 'unknown'
      }))
    }).catch((error) => {
      setDebugInfo(prev => ({ ...prev, stripeError: error.message }))
    })
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Stripe & Payment Debug Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {Object.entries(debugInfo).map(([key, value]) => (
          <div key={key} className="flex justify-between items-center text-xs">
            <span className="font-mono text-muted-foreground">{key}:</span>
            <span className={`font-mono ${
              value === true ? 'text-green-600' : 
              value === false ? 'text-red-600' : 
              value === 'Present' ? 'text-green-600' :
              value === 'Missing' ? 'text-red-600' :
              'text-foreground'
            }`}>
              {typeof value === 'boolean' ? (value ? '✓' : '✗') : String(value)}
            </span>
          </div>
        ))}
        
        {/* Environment Status */}
        <div className="mt-4 flex gap-2 flex-wrap">
          <Badge variant={debugInfo.isSecureContext ? 'default' : 'destructive'} className="text-xs">
            {debugInfo.isSecureContext ? 'Secure Context' : 'Insecure Context'}
          </Badge>
          <Badge variant={debugInfo.applePayCanMakePayments ? 'default' : 'secondary'} className="text-xs">
            Apple Pay {debugInfo.applePayCanMakePayments ? 'Available' : 'Unavailable'}
          </Badge>
          <Badge variant={debugInfo.googlePayAPI ? 'default' : 'secondary'} className="text-xs">
            Google Pay {debugInfo.googlePayAPI ? 'Available' : 'Unavailable'}
          </Badge>
          <Badge variant={debugInfo.stripeLoaded ? 'default' : 'destructive'} className="text-xs">
            Stripe {debugInfo.stripeLoaded ? 'Loaded' : 'Failed'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}