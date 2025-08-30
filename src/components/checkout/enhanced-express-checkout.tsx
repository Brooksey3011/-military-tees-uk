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
import { Input } from '@/components/ui/input'
import { LoadingState, ErrorDisplay } from '@/components/ui'
import { useSimpleCart } from '@/hooks/use-simple-cart'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase'
import { 
  CreditCard, 
  Truck, 
  Shield, 
  Lock, 
  MapPin, 
  User, 
  Mail, 
  Phone,
  ArrowLeft,
  CheckCircle,
  ArrowRight,
  CreditCard as CardIcon,
  Smartphone,
  Star,
  Globe,
  Package,
  Clock,
  AlertTriangle,
  Zap
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

// Load Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface CheckoutFormData {
  email: string
  firstName: string
  lastName: string
  phone: string
  address1: string
  address2: string
  city: string
  postcode: string
  country: string
  newsletter: boolean
  customerNotes: string
}

// Express Checkout Component
function ExpressCheckoutSection({ 
  onExpressSuccess, 
  total, 
  items, 
  isVisible = true 
}: { 
  onExpressSuccess: (result: any) => void
  total: number
  items: any[]
  isVisible?: boolean
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)

  // Create payment intent for express checkout
  useEffect(() => {
    if (items.length === 0) return

    const createPaymentIntent = async () => {
      try {
        const response = await fetch('/api/payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            items: items.map(item => ({
              variantId: item.variantId || item.id,
              quantity: item.quantity,
              price: item.price || 29.99
            })),
            shippingAddress: {
              firstName: '',
              lastName: '',
              email: '',
              phone: '',
              address1: '',
              city: '',
              postcode: '',
              country: 'GB'
            },
            billingAddress: {
              firstName: '',
              lastName: '',
              address1: '',
              city: '',
              postcode: '',
              country: 'GB'
            },
            total
          }),
        })
        
        const data = await response.json()
        if (data.client_secret || data.clientSecret) {
          setClientSecret(data.client_secret || data.clientSecret)
          setPaymentIntentId(data.payment_intent_id || data.paymentIntentId)
        }
      } catch (error) {
        console.error('Payment intent creation failed:', error)
      }
    }

    createPaymentIntent()
  }, [items, total])

  const handleExpressCheckout = async (event: any) => {
    if (!stripe || !elements || !clientSecret) {
      return
    }

    setIsProcessing(true)

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
        console.error('Express payment failed:', confirmError)
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onExpressSuccess({
          type: 'express',
          paymentIntent: paymentIntent.id,
          paymentMethod: event.paymentMethod
        })
      }
    } catch (error) {
      console.error('Express checkout error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isVisible || !clientSecret) return null

  return (
    <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm">
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-lg text-blue-900">Express Checkout</h3>
          </div>
          <p className="text-sm text-blue-700 font-medium">
            Skip the forms and pay instantly with one tap
          </p>
          
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <ExpressCheckoutElement
              onConfirm={handleExpressCheckout}
              onCancel={() => setIsProcessing(false)}
              options={{
                buttonType: {
                  applePay: 'buy',
                  googlePay: 'buy',
                },
                buttonTheme: {
                  applePay: 'black',
                  googlePay: 'black',
                },
                buttonHeight: 48,
                paymentMethods: {
                  applePay: 'always',
                  googlePay: 'always',
                  link: 'always',
                }
              }}
            />
          </div>
          
          <div className="flex items-center justify-center gap-4 text-xs text-blue-600">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span>Instant processing</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3 text-green-600" />
              <span>Bank-level security</span>
            </div>
            <div className="flex items-center gap-1">
              <Lock className="h-3 w-3 text-green-600" />
              <span>No forms needed</span>
            </div>
          </div>

          {isProcessing && (
            <div className="flex items-center justify-center gap-2 text-blue-600">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">Processing payment...</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Enhanced Checkout Form with Express Checkout Integration
function CheckoutForm({
  items,
  onSuccess,
  onError
}: {
  items: any[]
  onSuccess: (result: any) => void
  onError: (error: string) => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const { user } = useAuth()
  
  const [currentStep, setCurrentStep] = useState(0) // Start at 0 for express checkout
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [selectedShipping, setSelectedShipping] = useState(4.99)
  const [showTraditionalForm, setShowTraditionalForm] = useState(false)

  const [formData, setFormData] = useState<CheckoutFormData>({
    email: user?.email || "",
    firstName: "",
    lastName: "",
    phone: "",
    address1: "",
    address2: "",
    city: "",
    postcode: "",
    country: "GB",
    newsletter: false,
    customerNotes: ""
  })

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const shipping = subtotal >= 50 ? 0 : selectedShipping
  const tax = Math.round((subtotal + shipping) * 0.2 * 100) / 100 // 20% VAT
  const total = subtotal + shipping + tax

  const handleExpressSuccess = (result: any) => {
    console.log('Express checkout successful:', result)
    onSuccess(result)
    window.location.href = '/checkout/success'
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleTraditionalCheckout = async () => {
    if (!isFormValid()) {
      setError('Please fill out all required fields')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const orderData = {
        items: items.map(item => ({
          variantId: item.variantId || item.id,
          quantity: item.quantity
        })),
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address1: formData.address1,
          address2: formData.address2 || '',
          city: formData.city,
          postcode: formData.postcode,
          country: formData.country
        },
        billingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          address1: formData.address1,
          address2: formData.address2 || '',
          city: formData.city,
          postcode: formData.postcode,
          country: formData.country
        },
        customerNotes: formData.customerNotes || ''
      }

      const { data: { session } } = await supabase.auth.getSession()
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers,
        body: JSON.stringify(orderData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Checkout failed')
      }

      const { url, sessionId } = await response.json()

      if (url) {
        window.location.href = url
      } else {
        throw new Error('No checkout URL received')
      }
      
    } catch (err) {
      console.error('Checkout error:', err)
      setError(err instanceof Error ? err.message : "Checkout failed. Please try again.")
      setIsProcessing(false)
    }
  }

  const isFormValid = () => {
    const required = ['email', 'firstName', 'lastName', 'phone', 'address1', 'city', 'postcode']
    return required.every(field => formData[field as keyof typeof formData])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50/30">
      {/* Header */}
      <section className="py-6 border-b border-border bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/cart">
                <Button variant="ghost" size="sm" className="rounded-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Cart
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-display font-bold tracking-wider uppercase text-green-800">
                  Secure Checkout
                </h1>
                <p className="text-sm text-muted-foreground">Fast, secure, and professional</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-green-600" />
              <div className="text-right">
                <div className="text-sm font-medium">Order Total</div>
                <div className="text-lg font-bold text-green-800">£{total.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {error && (
              <ErrorDisplay 
                error={error} 
                variant="banner" 
                onRetry={() => setError(null)}
                showRetry={false}
              />
            )}

            {/* Express Checkout Section */}
            {!showTraditionalForm && (
              <div className="space-y-6">
                <ExpressCheckoutSection
                  onExpressSuccess={handleExpressSuccess}
                  total={total}
                  items={items}
                  isVisible={true}
                />
                
                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-6 text-slate-500 font-medium">
                      Or fill out your details below
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => setShowTraditionalForm(true)}
                  variant="outline"
                  className="w-full h-12 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400"
                >
                  <User className="h-4 w-4 mr-2" />
                  Continue with Traditional Checkout
                </Button>
              </div>
            )}

            {/* Traditional Form */}
            {showTraditionalForm && (
              <div className="space-y-6">
                {/* Back to Express */}
                <Button
                  onClick={() => setShowTraditionalForm(false)}
                  variant="ghost"
                  size="sm"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Express Checkout
                </Button>

                {/* Contact Information */}
                <Card className="border border-border rounded-xl shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Email Address *</label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="your.email@example.com"
                        className="rounded-lg"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">First Name *</label>
                        <Input
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          className="rounded-lg"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Last Name *</label>
                        <Input
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          className="rounded-lg"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Phone Number *</label>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="+44 1234 567890"
                        className="rounded-lg"
                        required
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Shipping Address */}
                <Card className="border border-border rounded-xl shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Shipping Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Address Line 1 *</label>
                      <Input
                        value={formData.address1}
                        onChange={(e) => handleInputChange('address1', e.target.value)}
                        placeholder="123 Main Street"
                        className="rounded-lg"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Address Line 2</label>
                      <Input
                        value={formData.address2}
                        onChange={(e) => handleInputChange('address2', e.target.value)}
                        placeholder="Apartment, suite, etc."
                        className="rounded-lg"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">City *</label>
                        <Input
                          value={formData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          className="rounded-lg"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Postcode *</label>
                        <Input
                          value={formData.postcode}
                          onChange={(e) => handleInputChange('postcode', e.target.value)}
                          placeholder="SW1A 1AA"
                          className="rounded-lg"
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Checkout Button */}
                <LoadingState 
                  isLoading={isProcessing}
                  message="Processing checkout..."
                >
                  <Button
                    onClick={handleTraditionalCheckout}
                    disabled={!isFormValid() || isProcessing}
                    className="w-full h-12 text-lg font-semibold bg-green-600 hover:bg-green-700 rounded-lg"
                  >
                    <Lock className="h-5 w-5 mr-2" />
                    Complete Order • £{total.toFixed(2)}
                  </Button>
                </LoadingState>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="space-y-6">
            
            {/* Order Summary */}
            <Card className="border border-border rounded-xl shadow-sm sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Items */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className="relative w-12 h-12 bg-white border border-border rounded-lg flex items-center justify-center">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={48}
                            height={48}
                            className="object-cover rounded-lg"
                          />
                        ) : (
                          <span className="text-xs">IMG</span>
                        )}
                        {item.quantity > 1 && (
                          <div className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {item.quantity}
                          </div>
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

                {/* Totals */}
                <div className="border-t pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                    <span>£{subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>
                      {shipping === 0 ? (
                        <span className="text-green-600 font-medium">FREE</span>
                      ) : (
                        `£${shipping.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>VAT (20%)</span>
                    <span>£{tax.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-lg font-bold pt-3 border-t">
                    <span>Total</span>
                    <span>£{total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Free Shipping Banner */}
                {shipping === 0 && subtotal >= 50 && (
                  <div className="bg-green-100 border border-green-300 p-3 text-green-800 text-sm rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span className="font-medium">Free delivery unlocked!</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Security Info */}
            <Card className="border border-green-200 bg-green-50/50 rounded-xl">
              <CardContent className="p-4">
                <h3 className="font-semibold text-center mb-4 text-green-800">Secure & Fast Checkout</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Zap className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <span className="text-sm">Express checkout with Apple Pay & Google Pay</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm">SSL encrypted & PCI compliant</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm">30-day returns & exchanges</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Star className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm">Supporting military community</span>
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

export default function EnhancedExpressCheckout() {
  const { items, totalItems, totalPrice, clearCart } = useSimpleCart()

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      const timer = setTimeout(() => {
        if (items.length === 0) {
          window.location.href = "/categories"
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [items.length])

  const handleSuccess = (result: any) => {
    console.log('Payment successful:', result)
    clearCart()
  }

  const handleError = (error: string) => {
    console.error('Payment error:', error)
  }

  if (items.length === 0) {
    return null // Will redirect
  }

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm
        items={items}
        onSuccess={handleSuccess}
        onError={handleError}
      />
    </Elements>
  )
}