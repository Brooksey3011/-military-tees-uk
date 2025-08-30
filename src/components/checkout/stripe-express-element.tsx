"use client"

import React, { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, ExpressCheckoutElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Smartphone, Zap, CreditCard, Apple, Chrome } from 'lucide-react'

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
  const [availablePaymentTypes, setAvailablePaymentTypes] = useState<string[]>([])

  const handleExpressPayment = async (event: any) => {
    console.log('🚀 Express payment initiated:', event.expressPaymentType)
    
    if (!stripe || !elements) {
      onError?.('Payment system not ready')
      return
    }

    setIsLoading(true)

    try {
      // Create checkout session for express payment
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map(item => ({
            variantId: item.variantId,
            quantity: item.quantity
          })),
          shippingAddress: shippingAddress || {
            firstName: event.shippingAddress?.recipient?.split(' ')[0] || 'Customer',
            lastName: event.shippingAddress?.recipient?.split(' ').slice(1).join(' ') || '',
            email: event.billingDetails?.email || 'customer@militarytees.co.uk',
            phone: event.billingDetails?.phone || '',
            address1: event.shippingAddress?.addressLine?.[0] || '',
            address2: event.shippingAddress?.addressLine?.[1] || '',
            city: event.shippingAddress?.city || '',
            postcode: event.shippingAddress?.postalCode || '',
            country: event.shippingAddress?.country || 'GB'
          },
          billingAddress: {
            firstName: event.billingDetails?.name?.split(' ')[0] || 'Customer',
            lastName: event.billingDetails?.name?.split(' ').slice(1).join(' ') || '',
            address1: event.billingDetails?.address?.line1 || '',
            address2: event.billingDetails?.address?.line2 || '',
            city: event.billingDetails?.address?.city || '',
            postcode: event.billingDetails?.address?.postal_code || '',
            country: event.billingDetails?.address?.country || 'GB'
          },
          paymentMethod: 'express',
          expressPaymentType: event.expressPaymentType
        })
      })

      const data = await response.json()
      
      if (data.url) {
        console.log('✅ Redirecting to Stripe Checkout:', data.url)
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Failed to create checkout session')
      }
      
    } catch (error) {
      console.error('❌ Express checkout error:', error)
      onError?.(error instanceof Error ? error.message : 'Express checkout failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCanMakePayment = (event: any) => {
    console.log('🔍 Can make payment check:', event)
    setCanMakePayment(event.canMakePayment)
    
    if (event.applePay) setAvailablePaymentTypes(prev => [...prev, 'Apple Pay'])
    if (event.googlePay) setAvailablePaymentTypes(prev => [...prev, 'Google Pay'])
    if (event.link) setAvailablePaymentTypes(prev => [...prev, 'Link'])
  }

  const handleReady = (event: any) => {
    console.log('✅ ExpressCheckoutElement ready:', event)
  }

  const options = {
    // Set up express payment options
    paymentMethods: {
      applePay: 'always',
      googlePay: 'always', 
      link: 'auto'
    },
    // Customize button appearance
    buttonTheme: {
      applePay: 'black',
      googlePay: 'black'
    },
    // Set the layout
    layout: {
      maxColumns: 1,
      maxRows: 4
    }
  }

  if (!canMakePayment && availablePaymentTypes.length === 0) {
    return (
      <div className="text-center p-4 text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-2 mb-2">
          <CreditCard className="h-4 w-4" />
          <span>Express checkout not available</span>
        </div>
        <p className="text-xs">Use the standard checkout form below</p>
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
            <div className="text-sm text-muted-foreground">Processing...</div>
          </div>
        )}
        
        <ExpressCheckoutElement
          options={options}
          onConfirm={handleExpressPayment}
          onCanMakePayment={handleCanMakePayment}
          onReady={handleReady}
        />
      </div>

      <div className="text-center">
        <div className="text-xs text-muted-foreground">
          Secure payment powered by Stripe
        </div>
      </div>
    </div>
  )
}

export function StripeExpressCheckout(props: ExpressCheckoutProps) {
  if (!props.items || props.items.length === 0) {
    return null
  }

  const elementsOptions = {
    mode: 'payment' as const,
    amount: Math.round(props.totalAmount * 100), // Convert to pence
    currency: 'gbp',
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#16a34a', // Green theme
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

export function PaymentMethodDetector() {
  const [deviceInfo, setDeviceInfo] = useState<{
    userAgent: string
    isAppleDevice: boolean
    isAndroid: boolean
    browser: string
  } | null>(null)

  useEffect(() => {
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
  }, [])

  if (!deviceInfo) return <div className="animate-pulse">Detecting device...</div>

  return (
    <div className="space-y-3 text-sm">
      <div className="grid grid-cols-2 gap-3">
        <div className={`p-3 rounded-lg border ${deviceInfo.isAppleDevice ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-center gap-2">
            <Apple className="h-4 w-4" />
            <span className="font-medium">Apple Pay</span>
          </div>
          <p className="text-xs mt-1">
            {deviceInfo.isAppleDevice ? '✅ Available' : '❌ Not available'}
          </p>
        </div>
        
        <div className={`p-3 rounded-lg border ${deviceInfo.browser === 'Chrome' || deviceInfo.isAndroid ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-center gap-2">
            <Chrome className="h-4 w-4" />
            <span className="font-medium">Google Pay</span>
          </div>
          <p className="text-xs mt-1">
            {deviceInfo.browser === 'Chrome' || deviceInfo.isAndroid ? '✅ Available' : '❌ Not available'}
          </p>
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground">
        <p><strong>Device:</strong> {deviceInfo.isAppleDevice ? 'Apple' : deviceInfo.isAndroid ? 'Android' : 'Other'}</p>
        <p><strong>Browser:</strong> {deviceInfo.browser}</p>
      </div>
    </div>
  )
}