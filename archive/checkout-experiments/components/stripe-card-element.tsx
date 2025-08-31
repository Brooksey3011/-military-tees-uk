"use client"

import { useState, useEffect, useRef } from 'react'
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingState } from '@/components/ui'
import { CreditCard, Lock } from 'lucide-react'

// Global stripe instance to prevent multiple loads
let stripeInstance: Stripe | null = null
let stripePromise: Promise<Stripe | null> | null = null

const getStripe = async (): Promise<Stripe | null> => {
  if (stripeInstance) {
    return stripeInstance
  }
  
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    
    if (!publishableKey) {
      console.error('❌ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is missing!')
      return null
    }
    
    console.log('🔑 Loading Stripe with key:', publishableKey.substring(0, 20) + '...')
    stripePromise = loadStripe(publishableKey)
  }
  
  if (!stripeInstance) {
    stripeInstance = await stripePromise
  }
  
  return stripeInstance
}

interface StripeCardElementProps {
  onPaymentSuccess: (paymentMethod: any) => void
  onError: (error: string) => void
  isProcessing: boolean
  amount: number
}

// Global elements instance to prevent duplicates
let globalElements: StripeElements | null = null
let globalCardElement: any = null

export function StripeCardElement({ 
  onPaymentSuccess, 
  onError, 
  isProcessing,
  amount 
}: StripeCardElementProps) {
  const [stripe, setStripe] = useState<Stripe | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [cardError, setCardError] = useState<string | null>(null)
  const [isCardComplete, setIsCardComplete] = useState(false)
  const cardElementRef = useRef<HTMLDivElement>(null)
  const isInitializedRef = useRef(false)

  useEffect(() => {
    if (isInitializedRef.current) return
    
    const initStripe = async () => {
      try {
        const stripeInstance = await getStripe()
        if (!stripeInstance) {
          onError('Failed to load Stripe')
          return
        }

        setStripe(stripeInstance)

        // Only create elements if they don't exist
        if (!globalElements) {
          globalElements = stripeInstance.elements({
            appearance: {
              theme: 'stripe',
              variables: {
                colorPrimary: '#4a5d23',
                colorBackground: '#ffffff',
                colorText: '#1a1a1a',
                colorDanger: '#df1b41',
                fontFamily: 'Inter, system-ui, sans-serif',
                spacingUnit: '4px',
                borderRadius: '6px',
              },
            },
            locale: 'en-GB',
          })
        }

        // Only create card element if it doesn't exist
        if (!globalCardElement) {
          globalCardElement = globalElements.create('card', {
            style: {
              base: {
                fontSize: '16px',
                color: '#1a1a1a',
                '::placeholder': {
                  color: '#6b7280',
                },
              },
              invalid: {
                color: '#df1b41',
                iconColor: '#df1b41',
              },
            },
            hidePostalCode: false,
            disableLink: true,
          })

          globalCardElement.on('change', (event: any) => {
            setCardError(event.error ? event.error.message : null)
            setIsCardComplete(event.complete)
          })
        }

        // Mount the card element
        if (cardElementRef.current && globalCardElement) {
          globalCardElement.mount(cardElementRef.current)
        }

        setIsReady(true)
        isInitializedRef.current = true
      } catch (err) {
        console.error('Stripe initialization error:', err)
        onError('Failed to initialize payment form')
      }
    }
    
    initStripe()

    return () => {
      // Don't unmount on cleanup to prevent re-mounting issues
    }
  }, [])

  const handleSubmit = async () => {
    if (!stripe || !globalCardElement || isProcessing) return

    try {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: globalCardElement,
      })

      if (error) {
        onError(error.message || 'Payment method creation failed')
      } else if (paymentMethod) {
        onPaymentSuccess(paymentMethod)
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Payment processing failed')
    }
  }

  if (!stripe || !isReady) {
    return (
      <Card className="border border-border/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? (
              <LoadingState isLoading={true} message="Loading payment form..." />
            ) : (
              <div className="text-center space-y-4">
                <div className="text-destructive font-semibold">⚠️ Payment Configuration Error</div>
                <p className="text-sm text-muted-foreground">
                  Stripe publishable key is missing. Please add it to your environment variables.
                </p>
                <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
                  <p><strong>For testing:</strong></p>
                  <p>Add <code>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> to your Vercel environment variables</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
          <Lock className="h-4 w-4 text-green-600" />
          <span>Your payment information is encrypted and secure</span>
        </div>

        {/* Stripe Elements Card Input */}
        <div className="p-3 border border-border/50 rounded-md">
          <div ref={cardElementRef} id="stripe-card-element">
            {/* Stripe will inject the card element here */}
          </div>
        </div>

        {cardError && (
          <div className="text-sm text-destructive">
            {cardError}
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p>We accept Visa, Mastercard, American Express, and Discover</p>
          <p>Your card will be charged £{amount.toFixed(2)}</p>
        </div>

        <LoadingState 
          isLoading={isProcessing}
          message="Processing payment..."
        >
          <Button 
            onClick={handleSubmit}
            disabled={!isCardComplete || isProcessing}
            className="w-full h-12 text-lg font-semibold"
          >
            <Lock className="h-5 w-5 mr-2" />
            Complete Payment - £{amount.toFixed(2)}
          </Button>
        </LoadingState>
      </CardContent>
    </Card>
  )
}

export default StripeCardElement