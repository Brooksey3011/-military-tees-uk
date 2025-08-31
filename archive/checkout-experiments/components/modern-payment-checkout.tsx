"use client"

import React, { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  ExpressCheckoutElement,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { LoadingState } from '@/components/ui'
import { 
  Lock, 
  CreditCard, 
  Smartphone, 
  Shield,
  CheckCircle,
  ArrowRight
} from 'lucide-react'

// Load Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface CheckoutItem {
  variantId: string
  quantity: number
  price?: number
}

interface ShippingAddress {
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

interface ModernPaymentCheckoutProps {
  items: CheckoutItem[]
  shippingAddress: ShippingAddress
  onPaymentSuccess: (result: any) => void
  onPaymentError: (error: string) => void
}

// Main checkout form component
function CheckoutForm({
  items,
  shippingAddress,
  onSuccess,
  onError
}: {
  items: CheckoutItem[]
  shippingAddress: ShippingAddress
  onSuccess: (result: any) => void
  onError: (error: string) => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)
  const [showExpressCheckout, setShowExpressCheckout] = useState(true)

  // Calculate total
  const calculateTotal = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.price || 29.99) * item.quantity, 0)
    const shipping = subtotal >= 50 ? 0 : 4.99
    const tax = subtotal * 0.2 // 20% VAT
    return subtotal + shipping + tax
  }

  const total = calculateTotal()

  useEffect(() => {
    if (items.length === 0) return

    // Create payment intent
    fetch('/api/payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: items.map(item => ({
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.price || 29.99
        })),
        shippingAddress,
        billingAddress: {
          firstName: shippingAddress.firstName,
          lastName: shippingAddress.lastName,
          address1: shippingAddress.address1,
          address2: shippingAddress.address2,
          city: shippingAddress.city,
          postcode: shippingAddress.postcode,
          country: shippingAddress.country
        },
        total
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret)
          setPaymentIntentId(data.paymentIntentId)
        } else {
          onError('Failed to initialize payment')
        }
      })
      .catch(error => {
        console.error('Payment setup error:', error)
        onError('Payment setup failed')
      })
  }, [items, shippingAddress, total])

  // Handle Express Checkout (Apple Pay, Google Pay, etc.)
  const handleExpressCheckout = async (event: any) => {
    if (!stripe || !elements || !clientSecret) {
      onError('Payment system not ready')
      return
    }

    setIsProcessing(true)
    setPaymentError(null)

    try {
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success?payment_intent=${paymentIntentId}`,
        },
        redirect: 'if_required'
      })

      if (confirmError) {
        setPaymentError(confirmError.message || 'Payment failed')
        onError(confirmError.message || 'Payment failed')
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess({
          type: 'express',
          paymentIntent: paymentIntent.id,
          paymentMethod: event.paymentMethod
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment failed'
      setPaymentError(errorMessage)
      onError(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle regular card payment
  const handleCardPayment = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements || !clientSecret) {
      onError('Payment system not ready')
      return
    }

    setIsProcessing(true)
    setPaymentError(null)

    try {
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success?payment_intent=${paymentIntentId}`,
        },
        redirect: 'if_required'
      })

      if (confirmError) {
        setPaymentError(confirmError.message || 'Payment failed')
        onError(confirmError.message || 'Payment failed')
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess({
          type: 'card',
          paymentIntent: paymentIntent.id
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment failed'
      setPaymentError(errorMessage)
      onError(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  if (!clientSecret) {
    return (
      <div className="flex justify-center items-center p-8">
        <LoadingState message="Initializing secure payment..." />
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Security Badge */}
      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
        <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
          <Shield className="h-4 w-4 text-green-600" />
          <span>Secured by Stripe • SSL Encrypted</span>
          <Lock className="h-4 w-4" />
        </div>
      </div>

      {/* Express Checkout */}
      {showExpressCheckout && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="font-semibold text-lg mb-2">Express Checkout</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Pay with one tap using your saved payment methods
                </p>
              </div>
              
              <ExpressCheckoutElement
                onConfirm={handleExpressCheckout}
                onCancel={() => setPaymentError(null)}
                options={{
                  buttonType: {
                    applePay: 'buy',
                    googlePay: 'buy',
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-4 text-slate-500 font-medium">
            Or pay with card
          </span>
        </div>
      </div>

      {/* Card Payment Form */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <form onSubmit={handleCardPayment} className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-slate-600" />
                Payment Details
              </h3>
              
              <div className="p-4 border border-slate-200 rounded-lg bg-white">
                <PaymentElement 
                  options={{
                    layout: 'tabs',
                    fields: {
                      billingDetails: 'never'
                    }
                  }}
                />
              </div>
            </div>

            {/* Payment Error */}
            {paymentError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                  <p className="text-sm text-red-700">{paymentError}</p>
                </div>
              </div>
            )}

            {/* Payment Button */}
            <Button
              type="submit"
              disabled={!stripe || isProcessing}
              className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Complete Order • £{total.toFixed(2)}</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </Button>

            {/* Trust Badges */}
            <div className="flex justify-center items-center gap-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>30-day returns</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Shield className="h-4 w-4 text-green-600" />
                <span>Secure checkout</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Free UK shipping £50+</span>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

// Main component wrapper
export default function ModernPaymentCheckout({
  items,
  shippingAddress,
  onPaymentSuccess,
  onPaymentError
}: ModernPaymentCheckoutProps) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm
        items={items}
        shippingAddress={shippingAddress}
        onSuccess={onPaymentSuccess}
        onError={onPaymentError}
      />
    </Elements>
  )
}