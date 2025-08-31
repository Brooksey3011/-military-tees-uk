"use client"

import React, { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { 
  Elements, 
  ExpressCheckoutElement, 
  useStripe, 
  useElements 
} from '@stripe/react-stripe-js'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Zap, CreditCard, Apple, Chrome, AlertCircle } from 'lucide-react'

// Initialize Stripe (loads once)
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
  onSuccess?: (paymentIntent: any) => void
  onError?: (error: string) => void
  totalAmount: number
}

// HTTPS Detection Hook - Fixed for SSR
function useHTTPSDetection() {
  const [isSecureContext, setIsSecureContext] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Check if we're in a secure context
    const checkSecureContext = () => {
      if (typeof window !== 'undefined') {
        const isSecure = window.isSecureContext || 
                        window.location.protocol === 'https:' ||
                        window.location.hostname === 'localhost' ||
                        window.location.hostname === '127.0.0.1'
        
        setIsSecureContext(isSecure)
        setIsLoading(false)
        
        console.log('🔒 HTTPS Detection:', {
          isSecureContext: window.isSecureContext,
          protocol: window.location.protocol,
          hostname: window.location.hostname,
          finalDecision: isSecure
        })
      }
    }

    if (mounted) {
      checkSecureContext()
    }
  }, [mounted])

  return { isSecureContext, isLoading: isLoading || !mounted }
}

// Express Checkout Form Component
function ExpressCheckoutForm({ items, shippingAddress, onSuccess, onError, totalAmount }: ExpressCheckoutProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  const [canMakePayment, setCanMakePayment] = useState(false)
  const [availablePaymentTypes, setAvailablePaymentTypes] = useState<string[]>([])
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const { isSecureContext, isLoading: httpsLoading } = useHTTPSDetection()

  // Create PaymentIntent on component mount
  useEffect(() => {
    if (stripe && items.length > 0 && isSecureContext && !clientSecret) {
      createPaymentIntent()
    }
  }, [stripe, items, isSecureContext, clientSecret])

  const createPaymentIntent = async () => {
    try {
      console.log('🔄 Creating PaymentIntent for Express Checkout...')
      
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          shippingAddress,
          currency: 'gbp'
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create PaymentIntent')
      }

      setClientSecret(data.clientSecret)
      console.log('✅ PaymentIntent created:', data.paymentIntentId)
      
    } catch (error) {
      console.error('❌ PaymentIntent creation failed:', error)
      setError(error instanceof Error ? error.message : 'Failed to initialize payment')
      onError?.(error instanceof Error ? error.message : 'Payment initialization failed')
    }
  }

  const handleExpressPayment = async (event: any) => {
    console.log('🚀 Express payment initiated:', event.expressPaymentType)
    
    if (!stripe || !clientSecret) {
      onError?.('Payment system not ready')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Confirm payment with Express Checkout details
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
          // Add shipping info from Express Checkout
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
        console.error('❌ Payment confirmation failed:', confirmError)
        setError(confirmError.message || 'Payment failed')
        onError?.(confirmError.message || 'Payment failed')
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('✅ Express payment succeeded:', paymentIntent.id)
        onSuccess?.(paymentIntent)
      }
    } catch (error) {
      console.error('❌ Express payment error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Payment processing failed'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCanMakePayment = (event: any) => {
    console.log('🔍 Can make payment check:', event)
    setCanMakePayment(event.canMakePayment)
    
    const types: string[] = []
    if (event.applePay) types.push('Apple Pay')
    if (event.googlePay) types.push('Google Pay')
    if (event.link) types.push('Link')
    
    setAvailablePaymentTypes(types)
    
    console.log('💳 Available payment methods:', types)
  }

  const handleReady = (event: any) => {
    console.log('✅ ExpressCheckoutElement ready:', event)
  }

  // Show loading state while checking HTTPS
  if (httpsLoading) {
    return (
      <div className="text-center p-4">
        <div className="animate-pulse text-sm text-muted-foreground">
          Checking secure connection...
        </div>
      </div>
    )
  }

  // Show error if not HTTPS
  if (!isSecureContext) {
    return (
      <div className="text-center p-4 border border-red-200 bg-red-50 rounded-lg">
        <div className="flex items-center justify-center gap-2 mb-2 text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span className="font-medium">Secure Connection Required</span>
        </div>
        <p className="text-xs text-red-600">
          Express Checkout requires HTTPS. Deploy to Vercel or use ngrok for local testing.
        </p>
      </div>
    )
  }

  // Show error if PaymentIntent creation failed
  if (error && !clientSecret) {
    return (
      <div className="text-center p-4 border border-red-200 bg-red-50 rounded-lg">
        <div className="flex items-center justify-center gap-2 mb-2 text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span className="font-medium">Payment Setup Failed</span>
        </div>
        <p className="text-xs text-red-600">{error}</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2"
          onClick={createPaymentIntent}
        >
          Retry
        </Button>
      </div>
    )
  }

  // Show loading while creating PaymentIntent
  if (!clientSecret) {
    return (
      <div className="text-center p-4">
        <div className="animate-pulse text-sm text-muted-foreground">
          Initializing Express Checkout...
        </div>
      </div>
    )
  }

  // Show message if no express methods available
  if (!canMakePayment && availablePaymentTypes.length === 0) {
    return (
      <div className="text-center p-4 text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-2 mb-2">
          <CreditCard className="h-4 w-4" />
          <span>Express checkout not available</span>
        </div>
        <p className="text-xs">Your device doesn't support express payment methods</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Zap className="h-5 w-5 text-green-600" />
          <span className="font-medium text-green-800">Express Checkout</span>
        </div>
        {availablePaymentTypes.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Available: {availablePaymentTypes.join(', ')}
          </p>
        )}
      </div>

      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
            <div className="text-sm text-muted-foreground">Processing payment...</div>
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
          onReady={handleReady}
        />
      </div>

      {error && (
        <div className="text-center text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      <div className="text-center">
        <div className="text-xs text-muted-foreground">
          Secure payment powered by Stripe
        </div>
      </div>
    </div>
  )
}

// Main Component with Elements Provider
export function VercelExpressCheckout(props: ExpressCheckoutProps) {
  if (!props.items || props.items.length === 0) {
    return null
  }

  // Elements options for Express Checkout
  const elementsOptions = {
    mode: 'payment' as const,
    amount: Math.round(props.totalAmount * 100),
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
    <Elements stripe={stripePromise} options={elementsOptions}>
      <Card className="border border-green-200">
        <CardContent className="p-4">
          <ExpressCheckoutForm {...props} />
        </CardContent>
      </Card>
    </Elements>
  )
}

// Device Detection Component for Testing - Fixed for SSR
export function ExpressCheckoutDeviceTest() {
  const { isSecureContext, isLoading } = useHTTPSDetection()
  const [mounted, setMounted] = useState(false)
  const [deviceInfo, setDeviceInfo] = useState<{
    userAgent: string
    isAppleDevice: boolean
    isAndroid: boolean
    browser: string
  } | null>(null)

  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined') {
      const userAgent = navigator.userAgent
      const isAppleDevice = /Mac|iPhone|iPad|iPod/.test(userAgent)
      const isAndroid = /Android/.test(userAgent)
      const browser = /Safari/.test(userAgent) && !/Chrome/.test(userAgent) ? 'Safari' :
                     /Chrome/.test(userAgent) ? 'Chrome' :
                     /Firefox/.test(userAgent) ? 'Firefox' : 'Other'

      setDeviceInfo({
        userAgent,
        isAppleDevice,
        isAndroid,
        browser
      })
    }
  }, [])

  if (!mounted || isLoading) return <div className="animate-pulse">Detecting device...</div>

  return (
    <div className="space-y-3 text-sm">
      <div className={`p-3 rounded-lg border ${isSecureContext ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
        <div className="flex items-center gap-2">
          {isSecureContext ? (
            <>
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span className="font-medium text-green-800">Secure Context (HTTPS)</span>
            </>
          ) : (
            <>
              <div className="h-2 w-2 bg-red-500 rounded-full"></div>
              <span className="font-medium text-red-800">Insecure Context (HTTP)</span>
            </>
          )}
        </div>
      </div>
      
      {deviceInfo && (
        <div className="grid grid-cols-2 gap-3">
          <div className={`p-3 rounded-lg border ${deviceInfo.isAppleDevice && isSecureContext ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center gap-2">
              <Apple className="h-4 w-4" />
              <span className="font-medium">Apple Pay</span>
            </div>
            <p className="text-xs mt-1">
              {deviceInfo.isAppleDevice && isSecureContext ? '✅ Available' : '❌ Not available'}
            </p>
          </div>
          
          <div className={`p-3 rounded-lg border ${(deviceInfo.browser === 'Chrome' || deviceInfo.isAndroid) && isSecureContext ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center gap-2">
              <Chrome className="h-4 w-4" />
              <span className="font-medium">Google Pay</span>
            </div>
            <p className="text-xs mt-1">
              {(deviceInfo.browser === 'Chrome' || deviceInfo.isAndroid) && isSecureContext ? '✅ Available' : '❌ Not available'}
            </p>
          </div>
        </div>
      )}
      
      {deviceInfo && (
        <div className="text-xs text-muted-foreground">
          <p><strong>Device:</strong> {deviceInfo.isAppleDevice ? 'Apple' : deviceInfo.isAndroid ? 'Android' : 'Other'}</p>
          <p><strong>Browser:</strong> {deviceInfo.browser}</p>
          <p><strong>Protocol:</strong> {typeof window !== 'undefined' ? window.location.protocol : 'N/A'}</p>
        </div>
      )}
    </div>
  )
}