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
  AlertTriangle
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

// Load Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// Progress Steps
const CHECKOUT_STEPS = [
  { id: 1, name: 'Information', icon: User },
  { id: 2, name: 'Shipping', icon: Truck },
  { id: 3, name: 'Payment', icon: CreditCard }
]

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

interface BillingData {
  firstName: string
  lastName: string
  address1: string
  address2: string
  city: string
  postcode: string
  country: string
}

// Progress Indicator Component
function ProgressIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {CHECKOUT_STEPS.map((step, index) => {
          const Icon = step.icon
          const isCompleted = index + 1 < currentStep
          const isCurrent = index + 1 === currentStep
          
          return (
            <React.Fragment key={step.id}>
              <div className="flex items-center">
                <div className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all
                  ${isCompleted 
                    ? 'bg-green-600 border-green-600 text-white' 
                    : isCurrent 
                      ? 'bg-green-100 border-green-600 text-green-600' 
                      : 'bg-gray-100 border-gray-300 text-gray-400'
                  }
                `}>
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <span className={`ml-3 font-medium ${isCurrent ? 'text-green-600' : 'text-gray-500'}`}>
                  {step.name}
                </span>
              </div>
              {index < CHECKOUT_STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${isCompleted ? 'bg-green-600' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

// Trust Badges Component
function TrustBadges() {
  return (
    <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
      <h3 className="text-sm font-semibold text-center mb-4">Your order is secure</h3>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="flex flex-col items-center">
          <Shield className="h-6 w-6 text-green-600 mb-2" />
          <span className="text-xs font-medium">SSL Secured</span>
          <span className="text-xs text-slate-500">256-bit encryption</span>
        </div>
        <div className="flex flex-col items-center">
          <CheckCircle className="h-6 w-6 text-green-600 mb-2" />
          <span className="text-xs font-medium">PCI Compliant</span>
          <span className="text-xs text-slate-500">Secure payments</span>
        </div>
        <div className="flex flex-col items-center">
          <Globe className="h-6 w-6 text-green-600 mb-2" />
          <span className="text-xs font-medium">Fraud Protected</span>
          <span className="text-xs text-slate-500">AI monitoring</span>
        </div>
      </div>
    </div>
  )
}

// Express Checkout Component
function ExpressCheckoutSection({ onExpressCheckout }: { onExpressCheckout: () => void }) {
  return (
    <Card className="border-green-200 bg-green-50/50">
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Smartphone className="h-5 w-5 text-green-600" />
            <h3 className="font-semibold text-lg">Express Checkout</h3>
          </div>
          <p className="text-sm text-slate-600">
            Skip the forms and pay instantly with your saved payment methods
          </p>
          <div className="bg-white rounded-lg p-4 border border-green-200">
            <ExpressCheckoutElement
              onConfirm={onExpressCheckout}
              options={{
                buttonType: {
                  applePay: 'buy',
                  googlePay: 'buy',
                },
                buttonTheme: {
                  applePay: 'black',
                  googlePay: 'black',
                }
              }}
            />
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span>Instant processing</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3 text-green-600" />
              <span>Bank-level security</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Payment Methods Display
function PaymentMethods() {
  const methods = [
    { name: 'Visa', icon: '💳' },
    { name: 'Mastercard', icon: '💳' },
    { name: 'American Express', icon: '💳' },
    { name: 'Apple Pay', icon: '📱' },
    { name: 'Google Pay', icon: '📱' },
    { name: 'Link', icon: '🔗' }
  ]

  return (
    <Card className="border border-slate-200">
      <CardContent className="p-4">
        <h3 className="text-sm font-semibold text-center mb-3">Accepted Payment Methods</h3>
        <div className="grid grid-cols-3 gap-2">
          {methods.map((method) => (
            <div key={method.name} className="flex items-center justify-center gap-1 p-2 bg-slate-50 rounded text-xs">
              <span>{method.icon}</span>
              <span className="font-medium">{method.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Shipping Options Component
function ShippingOptions({ onShippingChange }: { onShippingChange: (shipping: number) => void }) {
  const [selectedShipping, setSelectedShipping] = useState('standard')
  
  const options = [
    {
      id: 'standard',
      name: 'Standard Delivery',
      price: 4.99,
      description: '3-5 working days',
      icon: Package
    },
    {
      id: 'express',
      name: 'Express Delivery',
      price: 9.99,
      description: '1-2 working days',
      icon: Clock
    },
    {
      id: 'next-day',
      name: 'Next Day Delivery',
      price: 14.99,
      description: 'Order by 2PM',
      icon: ArrowRight
    }
  ]

  const handleShippingSelect = (optionId: string, price: number) => {
    setSelectedShipping(optionId)
    onShippingChange(price)
  }

  return (
    <Card className="border border-border rounded-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Shipping Options
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {options.map((option) => {
          const Icon = option.icon
          return (
            <div
              key={option.id}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedShipping === option.id
                  ? 'border-green-600 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleShippingSelect(option.id, option.price)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-gray-600" />
                  <div>
                    <h4 className="font-medium">{option.name}</h4>
                    <p className="text-sm text-gray-600">{option.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-semibold">£{option.price.toFixed(2)}</span>
                  {selectedShipping === option.id && (
                    <CheckCircle className="h-4 w-4 text-green-600 ml-2 inline" />
                  )}
                </div>
              </div>
            </div>
          )
        })}
        <div className="bg-green-100 border border-green-300 p-3 text-green-800 text-sm rounded-lg">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            <span className="font-medium">Free delivery on orders over £50!</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ThruDarkInspiredCheckout() {
  const { user } = useAuth()
  const { items, totalItems, totalPrice, clearCart } = useSimpleCart()

  const [currentStep, setCurrentStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [selectedShipping, setSelectedShipping] = useState(4.99)

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

  const [billingDifferent, setBillingDifferent] = useState(false)
  const [billingData, setBillingData] = useState<BillingData>({
    firstName: "",
    lastName: "",
    address1: "",
    address2: "",
    city: "",
    postcode: "",
    country: "GB"
  })

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

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleBillingChange = (field: string, value: string) => {
    setBillingData(prev => ({ ...prev, [field]: value }))
  }

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.email && formData.firstName && formData.lastName && formData.phone
      case 2:
        return formData.address1 && formData.city && formData.postcode
      case 3:
        return true // Payment validation handled by Stripe
      default:
        return false
    }
  }

  const handleNextStep = () => {
    if (isStepValid(currentStep) && currentStep < 3) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  // Calculate totals
  const subtotal = totalPrice
  const shipping = subtotal >= 50 ? 0 : selectedShipping
  const tax = Math.round((subtotal + shipping) * 0.2 * 100) / 100 // 20% VAT
  const total = subtotal + shipping + tax

  if (items.length === 0) {
    return null // Will redirect
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
                <p className="text-sm text-muted-foreground">Complete your order safely and securely</p>
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
        {/* Progress Indicator */}
        <ProgressIndicator currentStep={currentStep} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            
            {error && (
              <ErrorDisplay 
                error={error} 
                variant="banner" 
                onRetry={() => setError(null)}
                showRetry={false}
              />
            )}

            {/* Step 1: Contact Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
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

                    <div className="flex items-center gap-2 pt-4">
                      <input
                        type="checkbox"
                        id="newsletter"
                        checked={formData.newsletter}
                        onChange={(e) => handleInputChange('newsletter', e.target.checked)}
                        className="rounded"
                      />
                      <label htmlFor="newsletter" className="text-sm">
                        Keep me updated with new products and exclusive military offers
                      </label>
                    </div>
                  </CardContent>
                </Card>

                <TrustBadges />
              </div>
            )}

            {/* Step 2: Shipping Information */}
            {currentStep === 2 && (
              <div className="space-y-6">
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

                <ShippingOptions onShippingChange={setSelectedShipping} />

                {/* Order Notes */}
                <Card className="border border-border rounded-xl shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle>Order Notes (Optional)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <textarea
                      value={formData.customerNotes}
                      onChange={(e) => handleInputChange('customerNotes', e.target.value)}
                      placeholder="Special instructions for your order..."
                      className="w-full p-3 border border-border rounded-lg resize-none"
                      rows={3}
                    />
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 3: Payment */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <Elements stripe={stripePromise}>
                  <ExpressCheckoutSection onExpressCheckout={() => {}} />
                  
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

                  <Card className="border border-border rounded-xl shadow-sm">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Payment Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="p-4 border border-slate-200 rounded-lg bg-white">
                        <PaymentElement 
                          options={{
                            layout: 'tabs',
                            fields: {
                              billingDetails: 'never'
                            }
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </Elements>
                
                <PaymentMethods />
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              {currentStep > 1 && (
                <Button 
                  variant="outline" 
                  onClick={handlePreviousStep}
                  className="rounded-lg"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
              )}
              
              <div className="ml-auto">
                {currentStep < 3 ? (
                  <Button 
                    onClick={handleNextStep}
                    disabled={!isStepValid(currentStep)}
                    className="bg-green-600 hover:bg-green-700 rounded-lg"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <LoadingState 
                    isLoading={isProcessing}
                    message="Processing payment..."
                  >
                    <Button
                      onClick={() => {}} // Handle payment completion
                      disabled={isProcessing}
                      className="bg-green-600 hover:bg-green-700 rounded-lg h-12 px-8"
                    >
                      <Lock className="h-5 w-5 mr-2" />
                      Complete Order • £{total.toFixed(2)}
                    </Button>
                  </LoadingState>
                )}
              </div>
            </div>
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
                    <span>Subtotal ({totalItems} items)</span>
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

            {/* Why Choose Us */}
            <Card className="border border-green-200 bg-green-50/50 rounded-xl">
              <CardContent className="p-4">
                <h3 className="font-semibold text-center mb-4 text-green-800">Why Choose Military Tees UK</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm">Premium military-grade quality</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm">30-day returns & exchanges</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm">Supporting military community</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm">Fast & secure checkout</span>
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