"use client"

import React, { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  ExpressCheckoutElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingState } from '@/components/ui'
import { Lock, CreditCard, Smartphone, Shield } from 'lucide-react'

// Load Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface CheckoutItem {
  variantId: string
  quantity: number
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

interface ExpressCheckoutFormProps {
  items: CheckoutItem[]
  shippingAddress: ShippingAddress
  billingAddress?: ShippingAddress
  customerNotes?: string
  onSuccess: (result: any) => void
  onError: (error: string) => void
}

function ExpressCheckoutForm({ 
  items,
  shippingAddress, 
  billingAddress,
  customerNotes,
  onSuccess, 
  onError 
}: ExpressCheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [expressCheckoutAvailable, setExpressCheckoutAvailable] = useState(false)

  // For Express Checkout, we'll handle payment intent creation when needed
  // The redirect flow is simpler and doesn't require client secrets upfront

  const handleExpressCheckout = async (event: any) => {
    if (!stripe) return

    setIsProcessing(true)
    setPaymentError(null)

    try {
      console.log('Express checkout event:', event)
      
      // For express checkout, we need to create a payment intent via our API
      const response = await fetch('/api/payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          shippingAddress,
          billingAddress: billingAddress || shippingAddress,
          customerNotes,
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment intent')
      }

      if (data.client_secret) {
        // Confirm the payment with Stripe
        const { error: confirmError } = await stripe.confirmPayment({
          clientSecret: data.client_secret,
          confirmParams: {
            payment_method: event.paymentMethod.id,
            return_url: `${window.location.origin}/checkout/success?payment_intent=${data.payment_intent_id}`,
          },
        })

        if (confirmError) {
          throw new Error(confirmError.message || 'Payment confirmation failed')
        }

        // If we reach here, payment was successful
        onSuccess({
          type: 'express',
          paymentMethod: event.paymentMethod,
          paymentIntent: data.payment_intent_id
        })
      } else {
        throw new Error('No client secret received')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Express payment failed'
      setPaymentError(errorMessage)
      onError(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRegularCheckout = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      onError('Stripe has not loaded yet')
      return
    }

    setIsProcessing(true)
    setPaymentError(null)

    try {
      // Since we're using redirect flow, just redirect to the checkout URL
      // The checkout session was already created in useEffect
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          shippingAddress,
          billingAddress: billingAddress || shippingAddress,
          customerNotes,
        }),
      })

      const data = await response.json()
      
      if (data.url) {
        window.location.href = data.url
      } else {
        onError(data.error || 'Failed to create checkout session')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Checkout failed'
      setPaymentError(errorMessage)
      onError(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Express Checkout Options */}
      <Card className="border border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Smartphone className="h-5 w-5 text-green-600" />
            Express Checkout
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Pay quickly with Apple Pay, Google Pay, or saved payment methods
          </p>
        </CardHeader>
        <CardContent>
          <ExpressCheckoutElement
            onConfirm={handleExpressCheckout}
            onCancel={() => setPaymentError(null)}
            onReady={(event) => {
              console.log('Express checkout ready:', event.availablePaymentMethods)
              setExpressCheckoutAvailable(true)
            }}
            options={{
              buttonType: {
                applePay: 'buy',
                googlePay: 'buy',
              },
              paymentMethods: {
                applePay: 'auto',
                googlePay: 'auto',
                link: 'never',
                amazonPay: 'never',
                paypal: 'never',
                klarna: 'never',
                afterpay_clearpay: 'never',
              },
            }}
          />
          
          {!expressCheckoutAvailable && (
            <div className="text-sm text-muted-foreground text-center py-4">
              Express checkout options will appear here when available on your device
            </div>
          )}
        </CardContent>
      </Card>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-background px-4 text-muted-foreground">or pay with card</span>
        </div>
      </div>

      {/* Regular Card Payment */}
      <Card className="border border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Card Payment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
            <Shield className="h-4 w-4 text-green-600" />
            <span>Secured by 256-bit SSL encryption and PCI compliance</span>
          </div>

          {paymentError && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {paymentError}
            </div>
          )}

          <LoadingState 
            isLoading={isProcessing}
            message="Redirecting to secure checkout..."
          >
            <Button
              onClick={handleRegularCheckout}
              disabled={isProcessing}
              className="w-full h-12 text-lg font-semibold"
              variant="default"
            >
              <Lock className="h-5 w-5 mr-2" />
              Continue to Secure Checkout
            </Button>
          </LoadingState>

          <div className="text-xs text-muted-foreground space-y-1 text-center">
            <p>We accept Visa, Mastercard, American Express</p>
            <p>Your payment details are handled securely by Stripe</p>
          </div>
        </CardContent>
      </Card>

      {/* Security Badges */}
      <div className="flex justify-center items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Shield className="h-3 w-3" />
          <span>SSL Encrypted</span>
        </div>
        <div className="flex items-center gap-1">
          <Lock className="h-3 w-3" />
          <span>PCI Compliant</span>
        </div>
        <div className="flex items-center gap-1">
          <CreditCard className="h-3 w-3" />
          <span>Stripe Secured</span>
        </div>
      </div>
    </div>
  )
}

interface ExpressStripeCheckoutProps {
  items: CheckoutItem[]
  shippingAddress: ShippingAddress
  billingAddress?: ShippingAddress
  customerNotes?: string
  onPaymentSuccess: (result: any) => void
  onPaymentError: (error: string) => void
}

export function ExpressStripeCheckout({ 
  items,
  shippingAddress,
  billingAddress,
  customerNotes,
  onPaymentSuccess, 
  onPaymentError 
}: ExpressStripeCheckoutProps) {
  const [stripeError, setStripeError] = useState<string | null>(null)

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      setStripeError('Stripe configuration missing')
    }
  }, [])

  if (stripeError) {
    return (
      <Card className="border border-destructive/50">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="text-destructive font-semibold">⚠️ Payment System Error</div>
            <p className="text-sm text-muted-foreground">
              Payment processing is currently unavailable. Please try again later.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate amount for Elements options
  const calculateAmount = () => {
    if (!items.length) return 1000 // Default £10.00 in pence if no items
    
    const itemsTotal = items.reduce((sum, item) => {
      // Get price from the item or use fallback
      const itemPrice = typeof item.price === 'number' ? item.price : 
                       typeof item.quantity === 'number' && item.quantity > 0 ? 20.99 : 20.99
      const quantity = typeof item.quantity === 'number' ? item.quantity : 1
      return sum + (itemPrice * quantity)
    }, 0)
    
    const shipping = itemsTotal >= 50 ? 0 : 4.99
    const tax = (itemsTotal + shipping) * 0.2
    const total = itemsTotal + shipping + tax
    
    // Ensure we return a valid positive amount in pence
    const amountInPence = Math.max(Math.round(total * 100), 50) // Minimum 50p
    console.log('Amount calculation:', { items, itemsTotal, shipping, tax, total, amountInPence })
    return amountInPence
  }

  const elementsOptions = {
    mode: 'payment' as const,
    amount: calculateAmount(),
    currency: 'gbp',
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#16a34a', // Military green theme
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#dc2626',
        borderRadius: '6px',
      },
    },
  }

  return (
    <Elements stripe={stripePromise} options={elementsOptions}>
      <ExpressCheckoutForm
        items={items}
        shippingAddress={shippingAddress}
        billingAddress={billingAddress}
        customerNotes={customerNotes}
        onSuccess={onPaymentSuccess}
        onError={onPaymentError}
      />
    </Elements>
  )
}

export default ExpressStripeCheckout