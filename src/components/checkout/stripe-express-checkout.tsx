"use client"

import React, { useState, useEffect } from 'react'
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js'
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
import { 
  Shield, 
  CreditCard, 
  Smartphone,
  CheckCircle,
  Lock
} from 'lucide-react'

// Load Stripe with your publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface CheckoutItem {
  variantId: string
  quantity: number
  price: number
  name: string
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

interface StripeExpressCheckoutProps {
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
  const [expressCheckoutSupported, setExpressCheckoutSupported] = useState(false)

  // Calculate total
  const calculateTotal = () => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const shipping = subtotal >= 50 ? 0 : 4.99
    const tax = subtotal * 0.2 // 20% VAT
    return subtotal + shipping + tax
  }

  const total = calculateTotal()

  // Create Payment Intent on mount with minimal data
  useEffect(() => {
    if (items.length === 0) return

    const createPaymentIntent = async () => {
      try {
        // Create with minimal required data so payment elements can load immediately
        const minimalShippingAddress = {
          firstName: shippingAddress.firstName || 'Customer',
          lastName: shippingAddress.lastName || 'Name',
          email: shippingAddress.email || 'customer@example.com',
          phone: shippingAddress.phone || '+44 1234 567890',
          address1: shippingAddress.address1 || 'TBC',
          address2: shippingAddress.address2 || '',
          city: shippingAddress.city || 'TBC',
          postcode: shippingAddress.postcode || 'SW1A 1AA',
          country: shippingAddress.country || 'GB'
        }

        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            items,
            shippingAddress: minimalShippingAddress,
            amount: Math.round(total * 100), // Convert to pence
            currency: 'gbp',
            automatic_payment_methods: {
              enabled: true,
              allow_redirects: 'never'
            }
          }),
        })

        const data = await response.json()
        
        if (data.clientSecret) {
          setClientSecret(data.clientSecret)
        } else {
          onError(data.error || 'Failed to initialize payment')
        }
      } catch (error) {
        console.error('Error creating payment intent:', error)
        onError('Failed to initialize payment')
      }
    }

    createPaymentIntent()
  }, [items, total]) // Remove shippingAddress dependency so it only runs once

  // Handle express checkout (Apple Pay, Google Pay)
  const handleExpressPayment = async (event: any) => {
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
          return_url: `${window.location.origin}/checkout/success`,
          payment_method_data: {
            billing_details: {
              name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
              email: shippingAddress.email,
              phone: shippingAddress.phone,
              address: {
                line1: shippingAddress.address1,
                line2: shippingAddress.address2 || undefined,
                city: shippingAddress.city,
                postal_code: shippingAddress.postcode,
                country: shippingAddress.country || 'GB',
              }
            }
          }
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
          paymentMethod: event.paymentMethod?.type || 'unknown'
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
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements || !clientSecret) {
      onError('Payment system not ready')
      return
    }

    setIsProcessing(true)
    setPaymentError(null)

    try {
      const { error: submitError } = await elements.submit()
      if (submitError) {
        setPaymentError(submitError.message || 'Payment submission failed')
        onError(submitError.message || 'Payment submission failed')
        return
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
          payment_method_data: {
            billing_details: {
              name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
              email: shippingAddress.email,
              phone: shippingAddress.phone,
              address: {
                line1: shippingAddress.address1,
                line2: shippingAddress.address2 || undefined,
                city: shippingAddress.city,
                postal_code: shippingAddress.postcode,
                country: shippingAddress.country || 'GB',
              }
            }
          }
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
      <div className="flex justify-center items-center py-8">
        <LoadingState message="Initializing secure payment..." />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Security Banner */}
      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
        <div className="flex items-center justify-center gap-3 text-sm">
          <Shield className="h-5 w-5 text-green-600" />
          <span className="font-medium">Secured by Stripe</span>
          <div className="h-4 border-l border-slate-300"></div>
          <Lock className="h-4 w-4 text-slate-600" />
          <span className="text-slate-600">256-bit SSL Encrypted</span>
        </div>
      </div>

      {/* Express Checkout Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-blue-600" />
            Express Checkout
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Pay instantly with Apple Pay, Google Pay, or saved payment methods
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <ExpressCheckoutElement
              onConfirm={handleExpressPayment}
              onReady={(event) => {
                console.log('Express checkout ready:', event)
                setExpressCheckoutSupported(event.availablePaymentMethods ? 
                  Object.keys(event.availablePaymentMethods).length > 0 : false
                )
              }}
              options={{
                buttonType: {
                  applePay: 'buy',
                  googlePay: 'buy',
                },
                layout: 'horizontal',
                height: 48,
              }}
            />
            
            {!expressCheckoutSupported && (
              <div className="text-center py-4 text-sm text-slate-500">
                <CreditCard className="h-5 w-5 mx-auto mb-2" />
                No express payment methods available on this device
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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

      {/* Payment Element Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-slate-600" />
            Payment Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="p-4 border border-slate-200 rounded-lg bg-white">
              <PaymentElement
                options={{
                  layout: 'tabs',
                  paymentMethodOrder: ['card', 'klarna', 'clearpay', 'link'],
                  fields: {
                    billingDetails: {
                      name: 'never',
                      email: 'never',
                      phone: 'never',
                      address: 'never'
                    }
                  },
                  terms: {
                    card: 'never',
                    applePay: 'never',
                    googlePay: 'never'
                  }
                }}
              />
            </div>

            {paymentError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-red-700">
                  <div className="h-2 w-2 bg-red-500 rounded-full flex-shrink-0"></div>
                  <p className="text-sm">{paymentError}</p>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={!stripe || isProcessing}
              className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-lg"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing Payment...
                </div>
              ) : (
                <span>Complete Order • £{total.toFixed(2)}</span>
              )}
            </Button>

            {/* Trust Signals */}
            <div className="flex justify-center items-center gap-6 pt-4 border-t border-slate-100">
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

// Main component wrapper with Elements provider
export default function StripeExpressCheckout(props: StripeExpressCheckoutProps) {
  // Calculate total properly
  const calculateTotal = () => {
    const subtotal = props.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const shipping = subtotal >= 50 ? 0 : 4.99
    const tax = subtotal * 0.2
    return subtotal + shipping + tax
  }

  const options: StripeElementsOptions = {
    mode: 'payment',
    amount: Math.round(calculateTotal() * 100), // Convert to pence
    currency: 'gbp',
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#1e293b',
        colorBackground: '#ffffff',
        colorText: '#1e293b',
        colorDanger: '#dc2626',
        fontFamily: 'Inter, system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px'
      },
      rules: {
        '.Tab': {
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          boxShadow: 'none',
          padding: '12px 16px',
          backgroundColor: '#f8fafc'
        },
        '.Tab:hover': {
          backgroundColor: '#f1f5f9'
        },
        '.Tab--selected': {
          backgroundColor: '#1e293b',
          color: '#ffffff'
        }
      }
    },
    // Remove paymentMethodTypes - let automatic_payment_methods handle this
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm {...props} />
    </Elements>
  )
}