"use client"

import * as React from "react"
import { Layout } from "@/components/layout/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { LoadingState, ErrorDisplay } from "@/components/ui"
import { useSimpleCart } from "@/hooks/use-simple-cart"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabase"
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
  CheckCircle
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { StripeExpressCheckout, PaymentMethodDetector } from "@/components/checkout/stripe-express-element"

// Force dynamic rendering for this auth-dependent page
export const dynamic = 'force-dynamic'

export default function CheckoutPage() {
  const { user } = useAuth()
  const { items, totalItems, totalPrice, clearCart } = useSimpleCart()

  const [isProcessing, setIsProcessing] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Simple form state - just what's needed
  const [formData, setFormData] = React.useState({
    // Contact
    email: user?.email || "",
    firstName: "",
    lastName: "",
    phone: "",
    
    // Shipping
    address1: "",
    address2: "",
    city: "",
    postcode: "",
    country: "GB",
    
    // Marketing
    newsletter: false,
    
    // Notes
    customerNotes: ""
  })

  const [billingDifferent, setBillingDifferent] = React.useState(false)
  const [billingData, setBillingData] = React.useState({
    firstName: "",
    lastName: "",
    address1: "",
    address2: "",
    city: "",
    postcode: "",
    country: "GB"
  })

  // Redirect if cart is empty
  React.useEffect(() => {
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

  const isFormValid = () => {
    const required = ['email', 'firstName', 'lastName', 'phone', 'address1', 'city', 'postcode']
    const hasRequired = required.every(field => formData[field as keyof typeof formData])
    
    if (billingDifferent) {
      const billingRequired = ['firstName', 'lastName', 'address1', 'city', 'postcode']
      const hasBillingRequired = billingRequired.every(field => billingData[field as keyof typeof billingData])
      return hasRequired && hasBillingRequired
    }
    
    return hasRequired
  }

  const handleCheckout = async () => {
    if (!isFormValid()) {
      setError('Please fill out all required fields')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Prepare billing address
      const finalBillingData = billingDifferent ? billingData : {
        firstName: formData.firstName,
        lastName: formData.lastName,
        address1: formData.address1,
        address2: formData.address2,
        city: formData.city,
        postcode: formData.postcode,
        country: formData.country
      }

      // Prepare checkout data
      const orderData = {
        items: items.map(item => ({
          variantId: item.variantId,
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
        billingAddress: finalBillingData,
        customerNotes: formData.customerNotes || ''
      }

      // Get session for authentication (optional for guest checkout)
      const { data: { session } } = await supabase.auth.getSession()
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }

      // Call checkout API
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

      // Redirect to Stripe Checkout
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

  // Calculate pricing
  const subtotal = totalPrice
  const shipping = subtotal >= 50 ? 0 : 4.99
  const tax = Math.round((subtotal + shipping) * 0.2 * 100) / 100 // 20% VAT
  const total = subtotal + shipping + tax

  if (items.length === 0) {
    return null // Will redirect
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-green-50/30 to-background">
        
        {/* Header */}
        <section className="py-8 border-b border-border bg-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Link href="/cart">
                  <Button variant="ghost" size="sm" className="rounded-none">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Cart
                  </Button>
                </Link>
                <div>
                  <h1 className="text-3xl font-display font-bold tracking-wider uppercase text-green-800">
                    Checkout
                  </h1>
                  <p className="text-muted-foreground">Complete your order securely</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                <span className="text-sm text-muted-foreground">Secure Checkout</span>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
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

              {/* Express Checkout */}
              <StripeExpressCheckout
                items={items.map(item => ({
                  variantId: item.variantId,
                  quantity: item.quantity
                }))}
                shippingAddress={formData.firstName && formData.address1 ? {
                  firstName: formData.firstName,
                  lastName: formData.lastName,
                  email: formData.email,
                  phone: formData.phone,
                  address1: formData.address1,
                  address2: formData.address2,
                  city: formData.city,
                  postcode: formData.postcode,
                  country: formData.country
                } : undefined}
                totalAmount={total * 100} // Convert to pence
                onSuccess={(result) => {
                  console.log('Express checkout success:', result)
                  // The component handles the redirect to Stripe
                }}
                onError={(error) => {
                  console.error('Express checkout error:', error)
                  setError(`Express checkout failed: ${error}`)
                }}
              />

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-4 text-muted-foreground font-medium">
                    Or fill in your details below
                  </span>
                </div>
              </div>

              {/* Contact Information */}
              <Card className="border border-border rounded-lg">
                <CardHeader>
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
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">First Name *</label>
                      <Input
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Last Name *</label>
                      <Input
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
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
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card className="border border-border rounded-lg">
                <CardHeader>
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
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Address Line 2</label>
                    <Input
                      value={formData.address2}
                      onChange={(e) => handleInputChange('address2', e.target.value)}
                      placeholder="Apartment, suite, etc."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">City *</label>
                      <Input
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Postcode *</label>
                      <Input
                        value={formData.postcode}
                        onChange={(e) => handleInputChange('postcode', e.target.value)}
                        placeholder="SW1A 1AA"
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Billing Address */}
              <Card className="border border-border rounded-lg">
                <CardHeader>
                  <CardTitle>Billing Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="billing-different"
                      checked={billingDifferent}
                      onChange={(e) => setBillingDifferent(e.target.checked)}
                    />
                    <label htmlFor="billing-different" className="text-sm">
                      My billing address is different from my shipping address
                    </label>
                  </div>

                  {billingDifferent && (
                    <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/20">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">First Name *</label>
                          <Input
                            value={billingData.firstName}
                            onChange={(e) => handleBillingChange('firstName', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Last Name *</label>
                          <Input
                            value={billingData.lastName}
                            onChange={(e) => handleBillingChange('lastName', e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Address Line 1 *</label>
                        <Input
                          value={billingData.address1}
                          onChange={(e) => handleBillingChange('address1', e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Address Line 2</label>
                        <Input
                          value={billingData.address2}
                          onChange={(e) => handleBillingChange('address2', e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">City *</label>
                          <Input
                            value={billingData.city}
                            onChange={(e) => handleBillingChange('city', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Postcode *</label>
                          <Input
                            value={billingData.postcode}
                            onChange={(e) => handleBillingChange('postcode', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Order Notes */}
              <Card className="border border-border rounded-lg">
                <CardHeader>
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

              {/* Newsletter Signup */}
              <Card className="border border-border rounded-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="newsletter"
                      checked={formData.newsletter}
                      onChange={(e) => handleInputChange('newsletter', e.target.checked)}
                    />
                    <label htmlFor="newsletter" className="text-sm">
                      Keep me updated with new products and exclusive military offers
                    </label>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary Sidebar */}
            <div className="space-y-6">
              
              {/* Order Summary */}
              <Card className="border border-border rounded-lg sticky top-4">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  
                  {/* Items */}
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="relative w-12 h-12 bg-muted border border-border rounded-lg flex items-center justify-center">
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
                  <div className="border-t pt-4 space-y-2">
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
                    
                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                      <span>Total</span>
                      <span>£{total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Free Shipping Banner */}
                  {shipping === 0 && subtotal >= 50 && (
                    <div className="bg-green-100 border border-green-300 p-3 text-green-800 text-sm rounded-lg">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        <span className="font-medium">Free delivery unlocked!</span>
                      </div>
                    </div>
                  )}

                  {/* Checkout Button */}
                  <LoadingState 
                    isLoading={isProcessing}
                    message="Processing checkout..."
                  >
                    <Button
                      onClick={handleCheckout}
                      disabled={!isFormValid() || isProcessing}
                      className="w-full h-12 text-lg font-semibold bg-green-600 hover:bg-green-700"
                    >
                      <Lock className="h-5 w-5 mr-2" />
                      Secure Checkout • £{total.toFixed(2)}
                    </Button>
                  </LoadingState>

                  <p className="text-xs text-center text-muted-foreground">
                    You'll be redirected to our secure payment processor
                  </p>
                </CardContent>
              </Card>

              {/* Security Info */}
              <Card className="border border-border rounded-lg">
                <CardContent className="pt-6 text-center space-y-4">
                  <div className="flex items-center justify-center gap-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-semibold">Your order is secure</span>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex items-center justify-center gap-1">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span>SSL Encrypted (256-bit)</span>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span>PCI Compliant</span>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span>Fraud Protected</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Methods */}
              <Card className="border border-border rounded-lg">
                <CardContent className="pt-6 text-center space-y-3">
                  <h3 className="text-sm font-semibold">Accepted Payment Methods</h3>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>✓ Visa & Mastercard</p>
                    <p>✓ American Express</p>
                    <p>✓ Apple Pay & Google Pay</p>
                    <p>✓ Link & Digital Wallets</p>
                  </div>
                </CardContent>
              </Card>

              {/* Device Detection Info */}
              <Card className="border border-green-200 rounded-lg">
                <CardContent className="pt-6 space-y-3">
                  <h3 className="text-sm font-semibold text-green-800">Your Device Payment Options</h3>
                  <PaymentMethodDetector />
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}