"use client"

import React, { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, ExpressCheckoutElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Loader2, Shield, CreditCard, Zap } from 'lucide-react'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface ExpressCheckoutProps {
  items: Array<{
    variantId: string
    quantity: number
  }>
  onSuccess?: (result: any) => void
  onError?: (error: string) => void
  className?: string
}

function ExpressCheckoutForm({ items, onSuccess, onError, className }: ExpressCheckoutProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  const [canMakePayment, setCanMakePayment] = useState(false)
  const [availablePaymentTypes, setAvailablePaymentTypes] = useState<string[]>([])
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSecure, setIsSecure] = useState(false)

  // Check HTTPS
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsSecure(
        window.isSecureContext || 
        window.location.protocol === 'https:' || 
        window.location.hostname === 'localhost'
      )
    }
  }, [])

  // Create PaymentIntent on mount
  useEffect(() => {
    if (stripe && items.length > 0 && isSecure && !clientSecret) {
      createPaymentIntent()
    }
  }, [stripe, items, isSecure, clientSecret])

  const createPaymentIntent = async () => {
    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, currency: 'gbp' })
      })

      if (!response.ok) {
        throw new Error('Failed to create payment')
      }

      const data = await response.json()
      setClientSecret(data.clientSecret)
      setError(null)
    } catch (error) {
      setError('Unable to initialize payment')
      onError?.(error instanceof Error ? error.message : 'Payment setup failed')
    }
  }

  const handleExpressPayment = async (event: any) => {
    if (!stripe || !clientSecret) {
      onError?.('Payment not ready')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
          ...(event.shippingAddress && {
            shipping: {
              name: event.shippingAddress.recipient,
              phone: event.shippingAddress.phone,
              address: {
                line1: event.shippingAddress.addressLine[0],
                line2: event.shippingAddress.addressLine[1] || undefined,
                city: event.shippingAddress.city,
                postal_code: event.shippingAddress.postalCode,
                country: event.shippingAddress.country,
              },
            },
          }),
        },
        redirect: 'if_required'
      })

      if (confirmError) {
        setError(confirmError.message || 'Payment failed')
        onError?.(confirmError.message || 'Payment failed')
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess?.(paymentIntent)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment processing failed'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCanMakePayment = (event: any) => {
    setCanMakePayment(event.canMakePayment)
    
    const types: string[] = []
    if (event.applePay) types.push('Apple Pay')
    if (event.googlePay) types.push('Google Pay')
    if (event.link) types.push('Link')
    
    setAvailablePaymentTypes(types)
  }

  // HTTPS required message
  if (!isSecure) {
    return (
      <div className="text-center p-6 border border-red-200 bg-red-50 rounded-lg">
        <div className="flex items-center justify-center gap-2 mb-2 text-red-600">
          <Shield className="h-4 w-4" />
          <span className="font-medium">Secure Connection Required</span>
        </div>
        <p className="text-sm text-red-600">
          Express Checkout requires HTTPS for security
        </p>
      </div>
    )
  }

  // Loading state
  if (!clientSecret) {
    return (
      <div className="text-center p-6">
        <div className="flex items-center justify-center gap-2 text-green-700">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm font-medium">Initializing Express Checkout...</span>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !clientSecret) {
    return (
      <div className="text-center p-6 border border-red-200 bg-red-50 rounded-lg">
        <div className="flex items-center justify-center gap-2 mb-2 text-red-600">
          <CreditCard className="h-4 w-4" />
          <span className="font-medium">Payment Setup Failed</span>
        </div>
        <p className="text-sm text-red-600 mb-3">{error}</p>
        <Button variant="outline" size="sm" onClick={createPaymentIntent}>
          Try Again
        </Button>
      </div>
    )
  }

  // No payment methods available
  if (!canMakePayment && availablePaymentTypes.length === 0) {
    return (
      <div className="text-center p-6 text-muted-foreground">
        <div className="flex items-center justify-center gap-2 mb-2">
          <CreditCard className="h-4 w-4" />
          <span>Express checkout not available</span>
        </div>
        <p className="text-sm">Use secure checkout below</p>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className || ''}`}>
      {/* Express Checkout Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Zap className="h-5 w-5 text-green-600" />
          <span className="font-semibold text-green-800">Express Checkout</span>
        </div>
        {availablePaymentTypes.length > 0 && (
          <p className="text-sm text-green-700">
            Available: {availablePaymentTypes.join(' • ')}
          </p>
        )}
      </div>

      {/* Express Checkout Button */}
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-10 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm font-medium">Processing payment...</span>
            </div>
          </div>
        )}
        
        <ExpressCheckoutElement
          options={{
            paymentMethods: {
              applePay: 'always',
              googlePay: 'always',
              link: 'auto'
            },
            buttonTheme: {
              applePay: 'black',
              googlePay: 'black'
            },
            layout: {
              maxColumns: 1,
              maxRows: 4
            }
          }}
          onConfirm={handleExpressPayment}
          onCanMakePayment={handleCanMakePayment}
          onReady={() => console.log('Express Checkout ready')}
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="text-center bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-700">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={createPaymentIntent}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Trust Signals */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-3 w-3 text-green-600" />
          <span>Secured by Stripe • SSL Encrypted</span>
        </div>
      </div>
    </div>
  )
}

export function ExpressCheckoutSimple(props: ExpressCheckoutProps) {
  if (!props.items?.length) return null

  // Calculate total for Elements options
  const totalAmount = 25.98 // Approximate for demo

  const elementsOptions = {
    mode: 'payment' as const,
    amount: Math.round(totalAmount * 100),
    currency: 'gbp',
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#16a34a',
        colorBackground: '#ffffff',
        colorText: '#374151',
        colorDanger: '#dc2626',
        fontFamily: 'Inter, system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px'
      }
    }
  }

  return (
    <div className="bg-gradient-to-r from-green-50 to-green-50/50 border border-green-200 rounded-xl p-6">
      <Elements stripe={stripePromise} options={elementsOptions}>
        <ExpressCheckoutForm {...props} />
      </Elements>
    </div>
  )
}