"use client"

import React, { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentRequestButtonElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Loader2, Shield, CreditCard } from 'lucide-react'

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

interface PaymentRequest {
  canMakePayment: () => Promise<{ applePay?: boolean; googlePay?: boolean } | null>
  show: () => void
  on: (event: string, callback: (event: any) => void) => void
}

function ExpressCheckoutButton({ items, onSuccess, onError, className }: ExpressCheckoutProps) {
  const stripe = useStripe()
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null)
  const [canMakePayment, setCanMakePayment] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentMethods, setPaymentMethods] = useState<string[]>([])

  useEffect(() => {
    if (!stripe || !items.length) return

    initializePaymentRequest()
  }, [stripe, items])

  const initializePaymentRequest = async () => {
    if (!stripe) return

    try {
      // Create PaymentIntent first
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, currency: 'gbp' })
      })

      if (!response.ok) {
        throw new Error('Failed to initialize payment')
      }

      const { total, breakdown } = await response.json()

      // Create Payment Request
      const pr = stripe.paymentRequest({
        country: 'GB',
        currency: 'gbp',
        total: {
          label: 'Military Tees UK',
          amount: Math.round(total * 100)
        },
        displayItems: [
          { label: 'Subtotal', amount: Math.round(breakdown.subtotal * 100) },
          { label: 'Shipping', amount: Math.round(breakdown.shipping * 100) },
          { label: 'VAT', amount: Math.round(breakdown.tax * 100) }
        ],
        requestPayerName: true,
        requestPayerEmail: true,
        requestShipping: true,
        shippingOptions: [{
          id: 'standard',
          label: breakdown.shipping === 0 ? 'Free UK Shipping' : 'Standard UK Shipping',
          amount: Math.round(breakdown.shipping * 100)
        }]
      })

      // Check if payment methods are available
      const result = await pr.canMakePayment()
      if (result) {
        setCanMakePayment(true)
        const methods: string[] = []
        if (result.applePay) methods.push('Apple Pay')
        if (result.googlePay) methods.push('Google Pay')
        setPaymentMethods(methods)

        // Handle payment confirmation
        pr.on('paymentmethod', async (ev) => {
          setIsLoading(true)
          setError(null)

          try {
            // Get fresh client secret
            const intentResponse = await fetch('/api/create-payment-intent', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                items, 
                customerEmail: ev.payerEmail,
                currency: 'gbp' 
              })
            })

            const { clientSecret } = await intentResponse.json()

            // Confirm payment
            const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
              clientSecret,
              { payment_method: ev.paymentMethod.id },
              { handleActions: false }
            )

            if (confirmError) {
              ev.complete('fail')
              setError('Payment failed. Please try again.')
              onError?.(confirmError.message || 'Payment failed')
            } else {
              ev.complete('success')
              onSuccess?.(paymentIntent)
            }
          } catch (error) {
            ev.complete('fail')
            setError('Payment processing failed')
            onError?.(error instanceof Error ? error.message : 'Payment failed')
          } finally {
            setIsLoading(false)
          }
        })

        setPaymentRequest(pr)
      }
    } catch (error) {
      setError('Unable to load express checkout')
      onError?.(error instanceof Error ? error.message : 'Failed to initialize')
    }
  }

  if (!canMakePayment) {
    return (
      <div className={`text-center p-6 ${className || ''}`}>
        <div className="inline-flex items-center gap-3 text-sm text-muted-foreground">
          <CreditCard className="h-4 w-4" />
          <span>Express checkout not available on this device</span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Use secure checkout below
        </p>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className || ''}`}>
      {/* Express Checkout Button */}
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-10 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm font-medium">Processing...</span>
            </div>
          </div>
        )}
        
        {paymentRequest && (
          <PaymentRequestButtonElement
            options={{
              paymentRequest,
              style: {
                paymentRequestButton: {
                  type: 'default',
                  theme: 'dark',
                  height: '48px'
                }
              }
            }}
          />
        )}
      </div>

      {/* Available Methods */}
      {paymentMethods.length > 0 && (
        <div className="text-center">
          <p className="text-xs text-green-700 font-medium">
            Available: {paymentMethods.join(' • ')}
          </p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
          <p className="text-sm text-red-700">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 text-xs"
            onClick={initializePaymentRequest}
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Trust Signals */}
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Shield className="h-3 w-3 text-green-600" />
        <span>Secured by Stripe • SSL Encrypted</span>
      </div>
    </div>
  )
}

export function ExpressCheckoutPro(props: ExpressCheckoutProps) {
  if (!props.items?.length) return null

  return (
    <div className="bg-gradient-to-r from-green-50 to-green-50/50 border border-green-200 rounded-lg p-6">
      <div className="text-center mb-4">
        <h3 className="font-semibold text-green-900 mb-1">Express Checkout</h3>
        <p className="text-sm text-green-700">Fast, secure payment in one tap</p>
      </div>
      
      <Elements stripe={stripePromise}>
        <ExpressCheckoutButton {...props} />
      </Elements>
    </div>
  )
}