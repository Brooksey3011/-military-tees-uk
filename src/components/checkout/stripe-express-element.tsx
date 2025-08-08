"use client"

import React, { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { ExpressCheckoutElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Smartphone, Zap } from 'lucide-react'

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!, {
  stripeAccount: undefined, // Use your default account
})

// Debug Stripe loading
stripePromise.then((stripe) => {
  console.log('Stripe loaded successfully:', !!stripe)
}).catch((error) => {
  console.error('Failed to load Stripe:', error)
})

interface ExpressCheckoutProps {
  items: Array<{
    variantId: string
    quantity: number
  }>
  shippingAddress?: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address1: string
    address2?: string
    city: string
    postcode: string
    country: string
  }
  onSuccess?: (result: any) => void
  onError?: (error: string) => void
  totalAmount: number
}

function ExpressCheckoutForm({ items, shippingAddress, onSuccess, onError, totalAmount }: ExpressCheckoutProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [hasExpressMethods, setHasExpressMethods] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  useEffect(() => {
    console.log('ExpressCheckoutForm: Stripe loaded:', !!stripe)
    console.log('ExpressCheckoutForm: Elements loaded:', !!elements)
  }, [stripe, elements])

  const handleExpressPayment = async (event: any) => {
    console.log('Express payment initiated:', event)
    
    if (!stripe || !elements) {
      const error = 'Payment system not ready'
      console.error(error)
      onError?.(error)
      return
    }

    setIsLoading(true)

    try {
      // Use existing shipping address if provided, otherwise extract from event
      const finalShippingAddress = shippingAddress || {
        firstName: event.shippingAddress?.recipient?.split(' ')[0] || 'Customer',
        lastName: event.shippingAddress?.recipient?.split(' ').slice(1).join(' ') || '',
        email: event.billingDetails?.email || 'customer@example.com',
        phone: event.billingDetails?.phone || '',
        address1: event.shippingAddress?.addressLine?.[0] || '',
        address2: event.shippingAddress?.addressLine?.[1] || '',
        city: event.shippingAddress?.city || '',
        postcode: event.shippingAddress?.postalCode || '',
        country: event.shippingAddress?.country || 'GB'
      }

      const billingAddress = {
        firstName: event.billingDetails?.name?.split(' ')[0] || finalShippingAddress.firstName,
        lastName: event.billingDetails?.name?.split(' ').slice(1).join(' ') || finalShippingAddress.lastName,
        address1: event.billingDetails?.address?.line1 || finalShippingAddress.address1,
        address2: event.billingDetails?.address?.line2 || finalShippingAddress.address2,
        city: event.billingDetails?.address?.city || finalShippingAddress.city,
        postcode: event.billingDetails?.address?.postal_code || finalShippingAddress.postcode,
        country: event.billingDetails?.address?.country || finalShippingAddress.country
      }

      console.log('Calling checkout API with:', {
        items: items.length,
        shippingAddress: finalShippingAddress,
        billingAddress
      })

      // Call your checkout API
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items,
          shippingAddress: finalShippingAddress,
          billingAddress,
          customerNotes: 'Express checkout payment'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Checkout failed')
      }

      const { url } = await response.json()
      console.log('Checkout API response:', { url })

      // Complete the express payment
      if (url) {
        // For express checkout, we redirect to Stripe
        window.location.href = url
      } else {
        throw new Error('No checkout URL received from server')
      }

      onSuccess?.(event)
    } catch (error) {
      console.error('Express checkout error:', error)
      onError?.(error instanceof Error ? error.message : 'Express checkout failed')
    } finally {
      setIsLoading(false)
    }
  }

  if (!stripe) {
    return (
      <div className="text-center p-4 bg-muted/20 rounded-lg">
        <p className="text-sm text-muted-foreground">Loading payment options...</p>
      </div>
    )
  }

  const options = {
    buttonType: {
      applePay: 'buy' as const,
      googlePay: 'buy' as const,
    },
    paymentMethods: {
      applePay: 'always' as const,
      googlePay: 'always' as const,
      link: 'auto' as const,
      paypal: 'never' as const, // Disable PayPal as requested
      klarna: 'never' as const, // Disable Klarna as requested
    },
  }

  const handleReady = (event: any) => {
    console.log('ExpressCheckoutElement ready:', event)
    setIsReady(true)
    setHasExpressMethods(event.availablePaymentMethods?.length > 0)
    setDebugInfo(prev => [...prev, `Ready: ${event.availablePaymentMethods?.length || 0} methods available`])
  }

  const handleLoadError = (error: any) => {
    console.error('ExpressCheckoutElement load error:', error)
    setDebugInfo(prev => [...prev, `Error: ${error.message || error}`])
  }

  const handleClick = (event: any) => {
    console.log('ExpressCheckoutElement clicked:', event)
    setDebugInfo(prev => [...prev, `Clicked: ${event.expressPaymentType}`])
  }

  return (
    <div className="w-full space-y-3">
      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && debugInfo.length > 0 && (
        <div className="text-xs text-muted-foreground bg-yellow-50 p-2 rounded">
          <div className="font-medium mb-1">Debug Info:</div>
          {debugInfo.map((info, i) => (
            <div key={i}>• {info}</div>
          ))}
        </div>
      )}
      
      <div className="min-h-[50px] flex items-center justify-center">
        <ExpressCheckoutElement 
          options={options}
          onConfirm={handleExpressPayment}
          onReady={handleReady}
          onLoadError={handleLoadError}
          onClick={handleClick}
        />
      </div>
      
      {isLoading && (
        <div className="text-center text-sm text-muted-foreground">
          <div className="animate-pulse">Processing your payment...</div>
        </div>
      )}
      
      {isReady && !hasExpressMethods && (
        <div className="text-center text-xs text-muted-foreground">
          No express payment methods available on this device
        </div>
      )}
    </div>
  )
}

export function StripeExpressCheckout({ items, shippingAddress, onSuccess, onError, totalAmount }: ExpressCheckoutProps) {
  const [showExpressCheckout, setShowExpressCheckout] = useState(true)
  const [stripeError, setStripeError] = useState<string | null>(null)

  // Don't show if we don't have the required data
  if (!items || items.length === 0) {
    return null
  }

  // Check for Stripe key
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    console.error('Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY')
    return (
      <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-600">Payment system configuration error</p>
      </div>
    )
  }

  console.log('StripeExpressCheckout: Rendering with', {
    itemCount: items.length,
    totalAmount,
    hasShippingAddress: !!shippingAddress
  })

  return (
    <Card className="border border-green-200 rounded-lg bg-gradient-to-r from-green-50/50 to-blue-50/50">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-green-600" />
          <h3 className="font-semibold text-green-800">Express Checkout</h3>
          <div className="ml-auto">
            <div className="flex items-center gap-1">
              <Smartphone className="h-4 w-4 text-green-600" />
              <span className="text-xs text-green-700">Smart Detection</span>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground">
          One-click payment with your device's available methods
        </p>
        
        {showExpressCheckout ? (
          <Elements 
            stripe={stripePromise}
            options={{
              appearance: {
                theme: 'stripe',
                variables: {
                  colorPrimary: '#16a34a' // Military green
                }
              }
            }}
          >
            <ExpressCheckoutForm
              items={items}
              shippingAddress={shippingAddress}
              onSuccess={onSuccess}
              onError={onError}
              totalAmount={totalAmount}
            />
          </Elements>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              Express checkout not available on this device
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExpressCheckout(true)}
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        )}
        
        <div className="text-xs text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-4">
            <span>Secure • Instant • Convenient</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Utility component for detecting available payment methods
export function PaymentMethodDetector() {
  const [availableMethods, setAvailableMethods] = useState<string[]>([])
  
  useEffect(() => {
    const detectMethods = async () => {
      const methods: string[] = []
      
      // Apple Pay detection
      if (window.ApplePaySession) {
        if (window.ApplePaySession.canMakePayments()) {
          methods.push('Apple Pay Available')
          try {
            const canMakeActiveCard = await window.ApplePaySession.canMakePaymentsWithActiveCard()
            if (canMakeActiveCard) {
              methods.push('Apple Pay Ready')
            }
          } catch (e) {
            methods.push('Apple Pay (Setup Required)')
          }
        }
      }
      
      // Google Pay detection (basic)
      if ('google' in window && 'payments' in (window as any).google) {
        methods.push('Google Pay Available')
      }
      
      // Browser/OS detection
      const userAgent = navigator.userAgent
      if (/iPad|iPhone|iPod/.test(userAgent)) {
        methods.push('iOS Device')
      } else if (/Android/.test(userAgent)) {
        methods.push('Android Device')
      } else if (/Mac/.test(userAgent)) {
        methods.push('Mac Device')
      }
      
      // Payment Request API support
      if (window.PaymentRequest) {
        methods.push('Payment Request API')
      }
      
      setAvailableMethods(methods)
    }
    
    detectMethods()
  }, [])
  
  return (
    <div className="text-xs text-muted-foreground">
      <div className="font-medium mb-1">Detected Payment Options:</div>
      {availableMethods.length > 0 ? (
        <div className="space-y-1">
          {availableMethods.map((method, i) => (
            <div key={i} className="flex items-center gap-1">
              <span className="text-green-600">✓</span>
              <span>{method}</span>
            </div>
          ))}
        </div>
      ) : (
        <span>Standard card payments available</span>
      )}
    </div>
  )
}