"use client"

import { useState, useEffect } from 'react'
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingState } from '@/components/ui'
import { CreditCard, Lock } from 'lucide-react'

let stripePromise: Promise<Stripe | null>

const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')
  }
  return stripePromise
}

interface StripeCardElementProps {
  onPaymentSuccess: (paymentMethod: any) => void
  onError: (error: string) => void
  isProcessing: boolean
  amount: number
}

export function StripeCardElement({ 
  onPaymentSuccess, 
  onError, 
  isProcessing,
  amount 
}: StripeCardElementProps) {
  const [stripe, setStripe] = useState<Stripe | null>(null)
  const [elements, setElements] = useState<StripeElements | null>(null)
  const [cardError, setCardError] = useState<string | null>(null)
  const [isCardComplete, setIsCardComplete] = useState(false)

  useEffect(() => {
    const initStripe = async () => {
      const stripeInstance = await getStripe()
      if (stripeInstance) {
        setStripe(stripeInstance)
        
        const elementsInstance = stripeInstance.elements({
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
        })
        
        setElements(elementsInstance)
      }
    }
    
    initStripe()
  }, [])

  const handleSubmit = async () => {
    if (!stripe || !elements || isProcessing) return

    try {
      const cardElement = elements.getElement('card')
      
      if (!cardElement) {
        onError('Card element not found')
        return
      }

      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
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

  const handleCardChange = (event: any) => {
    setCardError(event.error ? event.error.message : null)
    setIsCardComplete(event.complete)
  }

  if (!stripe || !elements) {
    return (
      <Card className="border border-border/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <LoadingState isLoading={true} message="Loading payment form..." />
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
          <div id="card-element">
            {/* Stripe will inject the card element here */}
            {elements && (
              <StripeCardInput 
                elements={elements} 
                onChange={handleCardChange}
              />
            )}
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

// Simple card input component using Stripe Elements
function StripeCardInput({ 
  elements, 
  onChange 
}: { 
  elements: StripeElements
  onChange: (event: any) => void 
}) {
  useEffect(() => {
    const cardElement = elements.create('card', {
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
    })

    cardElement.mount('#stripe-card-element')
    cardElement.on('change', onChange)

    return () => {
      cardElement.unmount()
    }
  }, [elements, onChange])

  return <div id="stripe-card-element" />
}

export default StripeCardElement