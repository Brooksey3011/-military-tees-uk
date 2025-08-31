"use client"

import React, { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingState } from '@/components/ui'
import { Lock, CreditCard } from 'lucide-react'

// Load Stripe - this should only happen once
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// Card element options for UK - hide postal code since we collect it in address form
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
    },
    invalid: {
      color: '#9e2146',
    },
  },
  hidePostalCode: true, // Hide postal code - we collect it separately in address form
}

interface CheckoutFormProps {
  amount: number
  onSuccess: (paymentMethod: any) => void
  onError: (error: string) => void
}

function CheckoutForm({ amount, onSuccess, onError }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [cardError, setCardError] = useState<string | null>(null)
  const [cardComplete, setCardComplete] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      onError('Stripe has not loaded yet')
      return
    }

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      onError('Card element not found')
      return
    }

    setIsProcessing(true)
    setCardError(null)

    try {
      // Create payment method
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      })

      if (error) {
        setCardError(error.message || 'An error occurred')
        onError(error.message || 'Payment failed')
      } else {
        onSuccess(paymentMethod)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment processing failed'
      setCardError(errorMessage)
      onError(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCardChange = (event: any) => {
    setCardError(event.error ? event.error.message : null)
    setCardComplete(event.complete)
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="border border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
            <Lock className="h-4 w-4 text-green-600" />
            <span>Your payment is secured with 256-bit SSL encryption</span>
          </div>

          {/* Stripe Card Element */}
          <div className="p-4 border border-border/50 rounded-md bg-background">
            <CardElement
              options={cardElementOptions}
              onChange={handleCardChange}
            />
          </div>

          {cardError && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {cardError}
            </div>
          )}

          <div className="text-xs text-muted-foreground space-y-1">
            <p>We accept Visa, Mastercard, American Express</p>
            <p>Your card will be charged £{amount.toFixed(2)}</p>
          </div>

          <LoadingState 
            isLoading={isProcessing}
            message="Processing payment..."
          >
            <Button
              type="submit"
              disabled={!stripe || !cardComplete || isProcessing}
              className="w-full h-12 text-lg font-semibold"
            >
              <Lock className="h-5 w-5 mr-2" />
              Pay £{amount.toFixed(2)}
            </Button>
          </LoadingState>
        </CardContent>
      </Card>
    </form>
  )
}

interface SimpleStripeCheckoutProps {
  amount: number
  onPaymentSuccess: (paymentMethod: any) => void
  onPaymentError: (error: string) => void
}

export function SimpleStripeCheckout({ 
  amount, 
  onPaymentSuccess, 
  onPaymentError 
}: SimpleStripeCheckoutProps) {
  const [stripeError, setStripeError] = useState<string | null>(null)

  useEffect(() => {
    // Check if Stripe key is available
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      setStripeError('Stripe configuration missing')
    }
  }, [])

  if (stripeError) {
    return (
      <Card className="border border-border/50">
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

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm
        amount={amount}
        onSuccess={onPaymentSuccess}
        onError={onPaymentError}
      />
    </Elements>
  )
}

export default SimpleStripeCheckout