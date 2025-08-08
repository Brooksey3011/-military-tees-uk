"use client"

import React, { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { ExpressCheckoutElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Smartphone, Zap } from 'lucide-react'

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

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
  const [canMakePayment, setCanMakePayment] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState<string[]>([])

  useEffect(() => {
    if (!stripe) return

    // Check what payment methods are available on this device
    const checkPaymentMethods = async () => {
      try {
        // Check for Apple Pay
        if (window.ApplePaySession && window.ApplePaySession.canMakePayments) {
          const canMakeApplePay = await window.ApplePaySession.canMakePaymentsWithActiveCard()
          if (canMakeApplePay) {
            setPaymentMethods(prev => [...prev, 'apple_pay'])
          }
        }

        // Check for Google Pay (basic check)
        if ('google' in window && 'payments' in (window as any).google) {
          setPaymentMethods(prev => [...prev, 'google_pay'])
        }

        // Always available - card payments
        setPaymentMethods(prev => [...prev, 'card'])
        setCanMakePayment(true)
      } catch (error) {
        console.log('Payment method detection:', error)
        // Fallback - always show express checkout
        setCanMakePayment(true)
      }
    }

    checkPaymentMethods()
  }, [stripe])

  const handleExpressPayment = async (event: any) => {
    if (!stripe || !elements) {
      onError?.('Payment system not ready')
      return
    }

    setIsLoading(true)

    try {
      // Prepare the shipping address data
      const finalShippingAddress = shippingAddress || {
        firstName: event.shippingAddress?.recipient || '',
        lastName: '',
        email: event.billingDetails?.email || '',
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

      // Complete the express payment
      if (url) {
        // For express checkout, we redirect to Stripe
        window.location.href = url
      }

      onSuccess?.(event)
    } catch (error) {
      console.error('Express checkout error:', error)
      onError?.(error instanceof Error ? error.message : 'Express checkout failed')
    } finally {
      setIsLoading(false)
    }
  }

  if (!stripe || !canMakePayment) {
    return null
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

  return (
    <div className="w-full">
      <ExpressCheckoutElement 
        options={options}
        onConfirm={handleExpressPayment}
        onReady={() => setCanMakePayment(true)}
        onLoadError={(error) => {
          console.log('Express checkout load error:', error)
          setCanMakePayment(false)
        }}
      />
      {isLoading && (
        <div className="mt-2 text-center text-sm text-muted-foreground">
          Processing your payment...
        </div>
      )}
    </div>
  )
}

export function StripeExpressCheckout({ items, shippingAddress, onSuccess, onError, totalAmount }: ExpressCheckoutProps) {
  const [showExpressCheckout, setShowExpressCheckout] = useState(true)

  // Don't show if we don't have the required data
  if (!items || items.length === 0 || !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    return null
  }

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
          Pay instantly with Apple Pay, Google Pay, or Link - automatically detects your device's best options
        </p>
        
        {showExpressCheckout ? (
          <Elements stripe={stripePromise}>
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
            <span>🍎 Apple Pay</span>
            <span>📱 Google Pay</span>
            <span>🔗 Link</span>
            <span>💳 All Cards</span>
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