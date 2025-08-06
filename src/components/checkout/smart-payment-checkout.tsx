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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingState } from '@/components/ui'
import { 
  Lock, 
  CreditCard, 
  Smartphone, 
  Shield, 
  Apple,
  Chrome,
  Wallet,
  Building2
} from 'lucide-react'

// Load Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// Device and browser detection utilities
const detectDevice = () => {
  const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : ''
  const platform = typeof window !== 'undefined' ? window.navigator.platform : ''
  
  return {
    isIOS: /iPad|iPhone|iPod/.test(userAgent),
    isMac: /Mac|Macintosh/.test(platform),
    isAndroid: /Android/.test(userAgent),
    isWindows: /Win/.test(platform),
    isSafari: /^((?!chrome|android).)*safari/i.test(userAgent),
    isChrome: /Chrome/.test(userAgent) && !/Edg/.test(userAgent),
    isEdge: /Edg/.test(userAgent),
    isFirefox: /Firefox/.test(userAgent),
  }
}

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

interface SmartPaymentFormProps {
  items: CheckoutItem[]
  shippingAddress: ShippingAddress
  billingAddress?: ShippingAddress
  customerNotes?: string
  onSuccess: (result: any) => void
  onError: (error: string) => void
}

function SmartPaymentForm({ 
  items,
  shippingAddress, 
  billingAddress,
  customerNotes,
  onSuccess, 
  onError 
}: SmartPaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)
  const [showExpressCheckout, setShowExpressCheckout] = useState(false)
  const [showPaymentElement, setShowPaymentElement] = useState(false)
  const [deviceInfo, setDeviceInfo] = useState<any>(null)

  // Detect device capabilities on mount
  useEffect(() => {
    const device = detectDevice()
    setDeviceInfo(device)
    console.log('Device detection:', device)
  }, [])

  // Initialize payment intent
  useEffect(() => {
    const initializePayment = async () => {
      if (!items.length || !shippingAddress.email) return

      try {
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
        
        if (data.client_secret) {
          setClientSecret(data.client_secret)
          setPaymentIntentId(data.payment_intent_id)
          setShowExpressCheckout(true)
          setShowPaymentElement(true)
        } else {
          onError(data.error || 'Failed to initialize payment')
        }
      } catch (error) {
        console.error('Payment initialization error:', error)
        onError('Failed to initialize payment')
      }
    }

    initializePayment()
  }, [items, shippingAddress, billingAddress, customerNotes, onError])

  const handleExpressCheckout = async (event: any) => {
    if (!stripe || !clientSecret) return

    setIsProcessing(true)
    setPaymentError(null)

    try {
      console.log('Express payment event:', event)

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

  const handleRegularPayment = async (event: React.FormEvent) => {
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
          type: 'regular',
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

  const getExpressPaymentMethods = () => {
    if (!deviceInfo) return {}

    const methods: any = {}

    // Apple Pay: Available on Safari (iOS/macOS) and Chrome (macOS only)
    if ((deviceInfo.isSafari && (deviceInfo.isIOS || deviceInfo.isMac)) || 
        (deviceInfo.isChrome && deviceInfo.isMac)) {
      methods.applePay = 'auto'
    }

    // Google Pay: Available on Chrome (any platform), Edge, and Android browsers
    if (deviceInfo.isChrome || deviceInfo.isEdge || deviceInfo.isAndroid) {
      methods.googlePay = 'auto'
    }

    // Disable unwanted methods
    methods.link = 'never'
    methods.amazonPay = 'never'
    methods.paypal = 'never'
    methods.klarna = 'never'
    methods.afterpay_clearpay = 'never'

    return methods
  }

  const getRecommendedPaymentMethods = () => {
    if (!deviceInfo) return []

    const recommendations = []

    // Apple Pay for Apple devices
    if ((deviceInfo.isSafari && (deviceInfo.isIOS || deviceInfo.isMac)) || 
        (deviceInfo.isChrome && deviceInfo.isMac)) {
      recommendations.push({
        name: 'Apple Pay',
        icon: Apple,
        description: 'Pay with Touch ID or Face ID',
        available: true
      })
    }

    // Google Pay for supported browsers
    if (deviceInfo.isChrome || deviceInfo.isEdge || deviceInfo.isAndroid) {
      recommendations.push({
        name: 'Google Pay',
        icon: Chrome,
        description: 'Pay with saved Google payment methods',
        available: true
      })
    }

    return recommendations
  }

  if (!deviceInfo) {
    return <div className="text-center py-4">Loading payment options...</div>
  }

  return (
    <div className="space-y-6">
      {/* Device-specific payment recommendations */}
      <Card className="border border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-blue-600" />
            Recommended for Your Device
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {deviceInfo.isSafari && deviceInfo.isMac && "Safari on Mac - Apple Pay available"}
            {deviceInfo.isSafari && deviceInfo.isIOS && "Safari on iOS - Apple Pay available"}
            {deviceInfo.isChrome && deviceInfo.isMac && "Chrome on Mac - Apple Pay & Google Pay available"}
            {deviceInfo.isChrome && !deviceInfo.isMac && "Chrome - Google Pay available"}
            {deviceInfo.isAndroid && "Android - Google Pay available"}
            {!deviceInfo.isChrome && !deviceInfo.isSafari && "Your browser supports secure card payments"}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {getRecommendedPaymentMethods().map((method) => (
              <div key={method.name} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <method.icon className="h-5 w-5" />
                <div>
                  <p className="font-medium text-sm">{method.name}</p>
                  <p className="text-xs text-muted-foreground">{method.description}</p>
                </div>
              </div>
            ))}
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <CreditCard className="h-5 w-5" />
              <div>
                <p className="font-medium text-sm">Card Payment</p>
                <p className="text-xs text-muted-foreground">Visa, Mastercard, Amex</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Express Checkout Section */}
      {showExpressCheckout && clientSecret && (
        <Card className="border border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-green-600" />
              Express Checkout
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Quick payment with your saved methods
            </p>
          </CardHeader>
          <CardContent>
            <ExpressCheckoutElement
              onConfirm={handleExpressCheckout}
              onCancel={() => setPaymentError(null)}
              onReady={(event) => {
                console.log('Express checkout ready:', event.availablePaymentMethods)
              }}
              options={{
                buttonType: {
                  applePay: 'buy',
                  googlePay: 'buy',
                },
                paymentMethods: getExpressPaymentMethods(),
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-background px-4 text-muted-foreground">
            or pay with card
          </span>
        </div>
      </div>

      {/* Payment Element for Cards and Other Methods */}
      {showPaymentElement && clientSecret && (
        <Card className="border border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Card Payment & More
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
              <Shield className="h-4 w-4 text-green-600" />
              <span>Secured with 256-bit SSL encryption and PCI compliance</span>
            </div>

            {/* Payment Element handles cards, bank transfers, etc. */}
            <PaymentElement
              options={{
                fields: {
                  billingDetails: 'auto'
                },
                wallets: {
                  applePay: 'never', // Already handled in express checkout
                  googlePay: 'never', // Already handled in express checkout
                }
              }}
            />

            {paymentError && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {paymentError}
              </div>
            )}

            <LoadingState 
              isLoading={isProcessing}
              message="Processing payment..."
            >
              <Button
                onClick={handleRegularPayment}
                disabled={!stripe || isProcessing}
                className="w-full h-12 text-lg font-semibold"
                variant="default"
              >
                <Lock className="h-5 w-5 mr-2" />
                Pay Securely
              </Button>
            </LoadingState>

            <div className="text-xs text-muted-foreground space-y-1 text-center">
              <p>We accept Visa, Mastercard, American Express</p>
              <p>Bank transfers and local payment methods available</p>
              <p>Your payment is processed securely by Stripe</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security & Trust Indicators */}
      <div className="flex justify-center items-center gap-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Shield className="h-3 w-3 text-green-600" />
          <span>SSL Secured</span>
        </div>
        <div className="flex items-center gap-1">
          <Lock className="h-3 w-3 text-green-600" />
          <span>PCI Compliant</span>
        </div>
        <div className="flex items-center gap-1">
          <Building2 className="h-3 w-3 text-green-600" />
          <span>Bank Level Security</span>
        </div>
      </div>
    </div>
  )
}

interface SmartPaymentCheckoutProps {
  items: CheckoutItem[]
  shippingAddress: ShippingAddress
  billingAddress?: ShippingAddress
  customerNotes?: string
  onPaymentSuccess: (result: any) => void
  onPaymentError: (error: string) => void
}

export function SmartPaymentCheckout({ 
  items,
  shippingAddress,
  billingAddress,
  customerNotes,
  onPaymentSuccess, 
  onPaymentError 
}: SmartPaymentCheckoutProps) {
  const [stripeError, setStripeError] = useState<string | null>(null)

  // Calculate amount for Elements options
  const calculateAmount = () => {
    if (!items.length) return 1000 // Default £10.00 in pence if no items
    
    const itemsTotal = items.reduce((sum, item) => {
      const itemPrice = typeof item.price === 'number' ? item.price : 20.99
      const quantity = typeof item.quantity === 'number' ? item.quantity : 1
      return sum + (itemPrice * quantity)
    }, 0)
    
    const shipping = itemsTotal >= 50 ? 0 : 4.99
    const tax = (itemsTotal + shipping) * 0.2
    const total = itemsTotal + shipping + tax
    
    return Math.max(Math.round(total * 100), 50) // Minimum 50p
  }

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
        fontFamily: 'Inter, system-ui, sans-serif',
      },
    },
    paymentMethodCreation: 'manual',
  }

  return (
    <Elements stripe={stripePromise} options={elementsOptions}>
      <SmartPaymentForm
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

export default SmartPaymentCheckout