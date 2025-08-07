"use client"

import React, { useState, useEffect } from 'react'
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  ExpressCheckoutElement,
  useStripe,
  useElements,
  AddressElement
} from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { LoadingState, ErrorDisplay } from '@/components/ui'
import { 
  Shield, 
  CreditCard, 
  Smartphone,
  CheckCircle,
  Lock,
  Truck,
  Gift,
  MapPin,
  Clock,
  Star,
  User,
  Mail,
  Phone,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Percent,
  PackageCheck
} from 'lucide-react'

// Load Stripe with your publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface CheckoutItem {
  id: string
  variantId: string
  quantity: number
  price: number
  name: string
  size?: string
  color?: string
  image?: string
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

interface DeliveryOption {
  id: string
  name: string
  description: string
  price: number
  estimatedDays: string
  icon: React.ReactNode
}

interface PromoCode {
  code: string
  discount: number
  type: 'percentage' | 'fixed'
  description: string
}

interface EnhancedCheckoutProps {
  items: CheckoutItem[]
  onPaymentSuccess: (result: any) => void
  onPaymentError: (error: string) => void
  onBack?: () => void
}

// Delivery options
const deliveryOptions: DeliveryOption[] = [
  {
    id: 'standard',
    name: 'Standard Delivery',
    description: 'Free on orders over £50',
    price: 4.99,
    estimatedDays: '3-5 business days',
    icon: <Truck className="h-5 w-5" />
  },
  {
    id: 'express',
    name: 'Express Delivery',
    description: 'Next working day',
    price: 8.99,
    estimatedDays: '1 business day',
    icon: <Clock className="h-5 w-5" />
  },
  {
    id: 'premium',
    name: 'Premium Delivery',
    description: 'Tracked & insured',
    price: 12.99,
    estimatedDays: '1-2 business days',
    icon: <PackageCheck className="h-5 w-5" />
  }
]

// Sample promo codes
const validPromoCodes: PromoCode[] = [
  {
    code: 'MILITARY10',
    discount: 10,
    type: 'percentage',
    description: '10% off for military personnel'
  },
  {
    code: 'FIRSTORDER',
    discount: 15,
    type: 'percentage',
    description: '15% off your first order'
  },
  {
    code: 'SAVE5',
    discount: 5,
    type: 'fixed',
    description: '£5 off your order'
  }
]

// Main checkout form component
function CheckoutForm({
  items,
  onSuccess,
  onError,
  onBack
}: {
  items: CheckoutItem[]
  onSuccess: (result: any) => void
  onError: (error: string) => void
  onBack?: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [expressCheckoutSupported, setExpressCheckoutSupported] = useState(false)
  
  // Form states
  const [step, setStep] = useState(1) // 1: Contact, 2: Delivery, 3: Payment
  const [contactInfo, setContactInfo] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: ''
  })
  
  const [shippingAddress, setShippingAddress] = useState({
    address1: '',
    address2: '',
    city: '',
    postcode: '',
    country: 'GB'
  })
  
  const [selectedDelivery, setSelectedDelivery] = useState<string>('standard')
  const [promoCode, setPromoCode] = useState('')
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null)
  const [promoError, setPromoError] = useState<string | null>(null)
  const [billingDifferent, setBillingDifferent] = useState(false)
  const [marketingConsent, setMarketingConsent] = useState(false)

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const delivery = deliveryOptions.find(d => d.id === selectedDelivery)
    const deliveryCost = subtotal >= 50 && selectedDelivery === 'standard' ? 0 : (delivery?.price || 0)
    
    let discount = 0
    if (appliedPromo) {
      if (appliedPromo.type === 'percentage') {
        discount = subtotal * (appliedPromo.discount / 100)
      } else {
        discount = appliedPromo.discount
      }
    }
    
    const taxableAmount = subtotal - discount + deliveryCost
    const tax = taxableAmount * 0.2 // 20% VAT
    const total = taxableAmount + tax
    
    return {
      subtotal,
      deliveryCost,
      discount,
      tax,
      total
    }
  }

  const { subtotal, deliveryCost, discount, tax, total } = calculateTotals()

  // Create Payment Intent on mount with minimal data
  useEffect(() => {
    if (items.length === 0 || step !== 3) return

    const createPaymentIntent = async () => {
      try {
        const fullAddress = {
          firstName: contactInfo.firstName || 'Customer',
          lastName: contactInfo.lastName || 'Name',
          email: contactInfo.email || 'customer@example.com',
          phone: contactInfo.phone || '+44 1234 567890',
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
            shippingAddress: fullAddress,
            amount: Math.round(total * 100), // Convert to pence
            currency: 'gbp',
            deliveryOption: selectedDelivery,
            promoCode: appliedPromo?.code,
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
  }, [items, total, step, contactInfo, shippingAddress, selectedDelivery, appliedPromo])

  // Handle express checkout
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
              name: `${contactInfo.firstName} ${contactInfo.lastName}`,
              email: contactInfo.email,
              phone: contactInfo.phone,
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
              name: `${contactInfo.firstName} ${contactInfo.lastName}`,
              email: contactInfo.email,
              phone: contactInfo.phone,
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

  // Apply promo code
  const handleApplyPromo = () => {
    const code = validPromoCodes.find(p => p.code.toLowerCase() === promoCode.toLowerCase())
    if (code) {
      setAppliedPromo(code)
      setPromoError(null)
    } else {
      setPromoError('Invalid promo code')
      setAppliedPromo(null)
    }
  }

  // Remove promo code
  const handleRemovePromo = () => {
    setAppliedPromo(null)
    setPromoCode('')
    setPromoError(null)
  }

  // Next step validation
  const canProceedToNextStep = () => {
    if (step === 1) {
      return contactInfo.email && contactInfo.firstName && contactInfo.lastName
    }
    if (step === 2) {
      return shippingAddress.address1 && shippingAddress.city && shippingAddress.postcode
    }
    return true
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/30 to-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            {onBack && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onBack}
                className="rounded-none border border-border"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            <div>
              <h1 className="text-3xl font-display font-bold tracking-wider uppercase text-green-800">
                Secure Checkout
              </h1>
              <p className="text-muted-foreground mt-1">Complete your order securely</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            <span className="text-sm text-muted-foreground">SSL Secure</span>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-8 mb-8">
          {[
            { number: 1, title: "Contact", icon: <User className="h-4 w-4" /> },
            { number: 2, title: "Delivery", icon: <Truck className="h-4 w-4" /> },
            { number: 3, title: "Payment", icon: <CreditCard className="h-4 w-4" /> }
          ].map((stepItem) => (
            <div key={stepItem.number} className="flex items-center">
              <div className={`
                w-12 h-12 rounded-none border-2 flex items-center justify-center
                ${step >= stepItem.number 
                  ? 'bg-green-700 text-white border-green-700' 
                  : 'bg-background text-muted-foreground border-border'
                }
              `}>
                {step > stepItem.number ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  stepItem.icon
                )}
              </div>
              <div className="ml-3">
                <span className={`text-sm font-medium ${
                  step >= stepItem.number ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {stepItem.title}
                </span>
              </div>
              {stepItem.number < 3 && (
                <ArrowRight className="h-4 w-4 text-muted-foreground ml-8" />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Step 1: Contact Information */}
            {step === 1 && (
              <Card className="border-2 border-green-200 rounded-none">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-display font-bold tracking-wide uppercase text-green-800">
                    <User className="h-5 w-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Express Checkout */}
                  <div className="p-4 bg-green-50/50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-4">
                      <Smartphone className="h-5 w-5 text-green-600" />
                      <h3 className="font-semibold">Express Checkout</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Skip the forms - pay instantly with Apple Pay, Google Pay, or saved methods
                    </p>
                    
                    {step === 3 && clientSecret && (
                      <ExpressCheckoutElement
                        onConfirm={handleExpressPayment}
                        onReady={(event) => {
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
                    )}
                    
                    {!expressCheckoutSupported && step === 3 && (
                      <div className="text-center py-4 text-sm text-muted-foreground">
                        Express payment methods not available on this device
                      </div>
                    )}
                  </div>

                  {/* Contact Form */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Email Address *</label>
                      <Input
                        type="email"
                        value={contactInfo.email}
                        onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
                        className="rounded-none border-2"
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">First Name *</label>
                        <Input
                          value={contactInfo.firstName}
                          onChange={(e) => setContactInfo({...contactInfo, firstName: e.target.value})}
                          className="rounded-none border-2"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Last Name *</label>
                        <Input
                          value={contactInfo.lastName}
                          onChange={(e) => setContactInfo({...contactInfo, lastName: e.target.value})}
                          className="rounded-none border-2"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Phone Number (optional)</label>
                      <Input
                        type="tel"
                        value={contactInfo.phone}
                        onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
                        className="rounded-none border-2"
                        placeholder="+44 1234 567890"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="marketing"
                        checked={marketingConsent}
                        onChange={(e) => setMarketingConsent(e.target.checked)}
                        className="rounded-none"
                      />
                      <label htmlFor="marketing" className="text-sm text-muted-foreground">
                        I'd like to receive emails about new products and exclusive offers
                      </label>
                    </div>
                  </div>

                  <Button 
                    onClick={() => setStep(2)}
                    disabled={!canProceedToNextStep()}
                    className="w-full rounded-none font-display font-bold tracking-wide uppercase bg-green-700 hover:bg-green-800"
                  >
                    Continue to Delivery
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Delivery */}
            {step === 2 && (
              <Card className="border-2 border-green-200 rounded-none">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-display font-bold tracking-wide uppercase text-green-800">
                    <MapPin className="h-5 w-5" />
                    Delivery Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Shipping Address */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Shipping Address</h3>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Address Line 1 *</label>
                      <Input
                        value={shippingAddress.address1}
                        onChange={(e) => setShippingAddress({...shippingAddress, address1: e.target.value})}
                        className="rounded-none border-2"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Address Line 2 (optional)</label>
                      <Input
                        value={shippingAddress.address2}
                        onChange={(e) => setShippingAddress({...shippingAddress, address2: e.target.value})}
                        className="rounded-none border-2"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">City *</label>
                        <Input
                          value={shippingAddress.city}
                          onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                          className="rounded-none border-2"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Postcode *</label>
                        <Input
                          value={shippingAddress.postcode}
                          onChange={(e) => setShippingAddress({...shippingAddress, postcode: e.target.value})}
                          className="rounded-none border-2"
                          placeholder="SW1A 1AA"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Delivery Options */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Delivery Method</h3>
                    <div className="space-y-3">
                      {deliveryOptions.map((option) => (
                        <div
                          key={option.id}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                            selectedDelivery === option.id 
                              ? 'border-green-600 bg-green-50/50' 
                              : 'border-border hover:border-green-300'
                          }`}
                          onClick={() => setSelectedDelivery(option.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <input
                                type="radio"
                                name="delivery"
                                checked={selectedDelivery === option.id}
                                onChange={() => setSelectedDelivery(option.id)}
                                className="text-green-600"
                              />
                              {option.icon}
                              <div>
                                <h4 className="font-medium">{option.name}</h4>
                                <p className="text-sm text-muted-foreground">{option.description}</p>
                                <p className="text-sm text-muted-foreground">{option.estimatedDays}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">
                                {option.price === 0 || (option.id === 'standard' && subtotal >= 50) 
                                  ? 'FREE' 
                                  : `£${option.price.toFixed(2)}`
                                }
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button 
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="rounded-none border-2 font-display font-bold tracking-wide uppercase"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                    <Button 
                      onClick={() => setStep(3)}
                      disabled={!canProceedToNextStep()}
                      className="flex-1 rounded-none font-display font-bold tracking-wide uppercase bg-green-700 hover:bg-green-800"
                    >
                      Continue to Payment
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <Card className="border-2 border-green-200 rounded-none">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-display font-bold tracking-wide uppercase text-green-800">
                    <CreditCard className="h-5 w-5" />
                    Payment Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Security Banner */}
                  <div className="bg-green-50/50 border border-green-200 p-4 rounded-lg">
                    <div className="flex items-center justify-center gap-3 text-sm">
                      <Shield className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Secured by Stripe</span>
                      <div className="h-4 border-l border-green-300"></div>
                      <Lock className="h-4 w-4 text-green-600" />
                      <span>256-bit SSL Encrypted</span>
                    </div>
                  </div>

                  {clientSecret ? (
                    <>
                      {/* Express Checkout */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-5 w-5 text-green-600" />
                          <h3 className="font-semibold">Express Checkout</h3>
                        </div>
                        <ExpressCheckoutElement
                          onConfirm={handleExpressPayment}
                          onReady={(event) => {
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
                      </div>

                      {/* Divider */}
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-border"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="bg-white px-4 text-muted-foreground font-medium">
                            Or pay with card
                          </span>
                        </div>
                      </div>

                      {/* Payment Form */}
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="p-4 border-2 border-border rounded-lg bg-white">
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
                              }
                            }}
                          />
                        </div>

                        {paymentError && (
                          <ErrorDisplay 
                            error={paymentError} 
                            variant="banner"
                            onRetry={() => setPaymentError(null)}
                            showRetry={false}
                          />
                        )}

                        <div className="flex gap-4">
                          <Button 
                            type="button"
                            variant="outline"
                            onClick={() => setStep(2)}
                            disabled={isProcessing}
                            className="rounded-none border-2 font-display font-bold tracking-wide uppercase"
                          >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                          </Button>
                          
                          {isProcessing ? (
                            <div className="flex-1">
                              <LoadingState message="Processing your payment..." />
                            </div>
                          ) : (
                            <Button
                              type="submit"
                              disabled={!stripe}
                              className="flex-1 rounded-none font-display font-bold tracking-wide uppercase bg-green-700 hover:bg-green-800 h-12"
                            >
                              <Lock className="h-4 w-4 mr-2" />
                              Complete Order • £{total.toFixed(2)}
                            </Button>
                          )}
                        </div>

                        {/* Trust Signals */}
                        <div className="flex justify-center items-center gap-6 pt-4 border-t border-border">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span>30-day returns</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Shield className="h-4 w-4 text-green-600" />
                            <span>Secure checkout</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Star className="h-4 w-4 text-green-600" />
                            <span>5-star service</span>
                          </div>
                        </div>
                      </form>
                    </>
                  ) : (
                    <LoadingState message="Initializing secure payment..." />
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="space-y-6">
            
            {/* Order Summary */}
            <Card className="border-2 border-green-200 rounded-none sticky top-4">
              <CardHeader>
                <CardTitle className="font-display font-bold tracking-wide uppercase text-green-800">
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Items */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="relative w-12 h-12 bg-muted border border-border rounded-lg flex items-center justify-center">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <span className="text-xs">IMG</span>
                        )}
                        {item.quantity > 1 && (
                          <Badge 
                            variant="secondary" 
                            className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                          >
                            {item.quantity}
                          </Badge>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{item.name}</h4>
                        {(item.size || item.color) && (
                          <p className="text-xs text-muted-foreground">
                            {item.size && `Size: ${item.size}`} 
                            {item.size && item.color && ' • '} 
                            {item.color && `Color: ${item.color}`}
                          </p>
                        )}
                      </div>
                      <div className="text-sm font-semibold">
                        £{(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Promo Code */}
                <div className="border-t pt-4">
                  {!appliedPromo ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          placeholder="Promo code"
                          className="rounded-none border-2 text-sm"
                        />
                        <Button
                          onClick={handleApplyPromo}
                          variant="outline"
                          size="sm"
                          className="rounded-none border-2 whitespace-nowrap"
                        >
                          Apply
                        </Button>
                      </div>
                      {promoError && (
                        <p className="text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {promoError}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Gift className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">{appliedPromo.code}</span>
                      </div>
                      <Button
                        onClick={handleRemovePromo}
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
                      >
                        ×
                      </Button>
                    </div>
                  )}
                </div>

                {/* Totals */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>£{subtotal.toFixed(2)}</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span className="flex items-center gap-1">
                        <Percent className="h-3 w-3" />
                        Discount ({appliedPromo?.code})
                      </span>
                      <span>-£{discount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span>Delivery</span>
                    <span>
                      {deliveryCost === 0 ? (
                        <span className="text-green-600 font-medium">FREE</span>
                      ) : (
                        `£${deliveryCost.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>VAT (20%)</span>
                    <span>£{tax.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total</span>
                    <span>£{total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Free Shipping Banner */}
                {deliveryCost === 0 && subtotal >= 50 && selectedDelivery === 'standard' && (
                  <div className="bg-green-100 border border-green-300 p-3 text-green-800 text-sm rounded-lg">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      <span className="font-medium">Free delivery unlocked!</span>
                    </div>
                  </div>
                )}

              </CardContent>
            </Card>

            {/* Security Badges */}
            <Card className="border-2 border-green-200 rounded-none">
              <CardContent className="pt-6 text-center space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-semibold">Military-Grade Security</span>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>✓ 256-bit SSL encryption</p>
                  <p>✓ PCI DSS Level 1 compliant</p>
                  <p>✓ Fraud protection enabled</p>
                  <p>✓ Your data is protected</p>
                </div>
              </CardContent>
            </Card>

            {/* Help */}
            <Card className="border-2 border-green-200 rounded-none">
              <CardContent className="pt-6 text-center space-y-4">
                <h3 className="font-semibold text-green-800">Need Help?</h3>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>Contact our support team</p>
                  <div className="flex items-center justify-center gap-1">
                    <Mail className="h-4 w-4" />
                    <span>support@militarytees.co.uk</span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <Phone className="h-4 w-4" />
                    <span>+44 (0) 800 123 4567</span>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  )
}

// Main component wrapper with Elements provider
export default function EnhancedCheckout(props: EnhancedCheckoutProps) {
  const calculateTotal = () => {
    const subtotal = props.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const delivery = 4.99 // Default delivery cost for Stripe setup
    const tax = (subtotal + delivery) * 0.2
    return subtotal + delivery + tax
  }

  const options: StripeElementsOptions = {
    mode: 'payment',
    amount: Math.round(calculateTotal() * 100), // Convert to pence
    currency: 'gbp',
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#15803d', // green-700
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#dc2626',
        fontFamily: 'Inter, system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '0px', // Sharp military-style borders
      },
      rules: {
        '.Tab': {
          border: '2px solid #e5e7eb',
          borderRadius: '0px',
          boxShadow: 'none',
          padding: '12px 16px',
          backgroundColor: '#f9fafb'
        },
        '.Tab:hover': {
          backgroundColor: '#f3f4f6',
          borderColor: '#86efac'
        },
        '.Tab--selected': {
          backgroundColor: '#15803d',
          color: '#ffffff',
          borderColor: '#15803d'
        },
        '.Input': {
          borderRadius: '0px',
          border: '2px solid #e5e7eb'
        },
        '.Input:focus': {
          borderColor: '#15803d',
          boxShadow: '0 0 0 1px #15803d'
        }
      }
    }
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm {...props} />
    </Elements>
  )
}