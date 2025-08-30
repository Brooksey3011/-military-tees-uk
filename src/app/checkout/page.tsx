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

  // Show loading state instead of hiding completely
  if (items.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-green-50/30 to-background">
          <section className="py-8 border-b border-border bg-white">
            <div className="container mx-auto px-4">
              <div className="text-center">
                <h1 className="text-3xl font-display font-bold tracking-wider uppercase text-green-800 mb-4">
                  Checkout
                </h1>
                <div className="max-w-md mx-auto">
                  <Card className="border-2 border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-100 rounded-xl shadow-lg">
                    <CardContent className="pt-6 pb-6">
                      <h2 className="text-xl font-bold text-yellow-800 mb-4">Your cart appears to be empty</h2>
                      <p className="text-yellow-700 mb-6">Add some items to your cart to proceed with checkout.</p>
                      <Link href="/categories">
                        <Button className="bg-green-600 hover:bg-green-700 text-white font-bold">
                          Shop Now
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </section>
        </div>
      </Layout>
    )
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

              {/* FEATURED EXPRESS CHECKOUT - Available Immediately */}
              <Card className="border-4 border-blue-500 bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 rounded-2xl shadow-2xl mb-8">
                <CardContent className="pt-10 pb-10 space-y-8">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <div className="p-3 bg-blue-600 rounded-full">
                        <CreditCard className="h-6 w-6 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-blue-900">⚡ Express Checkout</h2>
                      <span className="bg-blue-600 text-white text-sm px-3 py-1 rounded-full font-bold animate-pulse">
                        FASTEST
                      </span>
                    </div>
                    
                    <p className="text-lg text-blue-800 font-semibold mb-6">
                      Pay instantly with Apple Pay, Google Pay, or Link - no forms needed!
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-blue-700 mb-6">
                      <div className="flex items-center justify-center gap-2 bg-white/80 rounded-lg p-3">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="font-medium">One-tap pay</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 bg-white/80 rounded-lg p-3">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="font-medium">Auto-fill details</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 bg-white/80 rounded-lg p-3">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="font-medium">Secure payment</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 bg-white/80 rounded-lg p-3">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="font-medium">No registration</span>
                      </div>
                    </div>
                    
                    <Link href="/checkout/express">
                      <Button 
                        size="lg" 
                        className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-black text-xl px-16 py-6 rounded-2xl shadow-xl transform hover:scale-110 transition-all duration-300 animate-pulse"
                      >
                        <CreditCard className="h-6 w-6 mr-4" />
                        🚀 USE EXPRESS CHECKOUT ⚡
                        <ArrowRight className="h-6 w-6 ml-4" />
                      </Button>
                    </Link>
                    
                    <p className="text-xs text-blue-600 mt-4 font-medium">
                      ✨ Skip all forms • Complete in under 30 seconds • Works on all devices
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-6 text-gray-500 font-medium">
                    Or continue with standard checkout
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

              {/* Express Checkout - FEATURED */}
              <Card className="border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-100 rounded-xl shadow-lg">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center justify-center gap-2">
                    <div className="p-2 bg-blue-600 rounded-full">
                      <CreditCard className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-blue-900">⚡ Express Checkout</h3>
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">RECOMMENDED</span>
                  </div>
                  <p className="text-sm text-blue-800 font-medium text-center">
                    Pay instantly with Apple Pay, Google Pay, or Link - no forms needed!
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span>One-tap payments</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span>Auto-fill details</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span>Fastest checkout</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span>Maximum security</span>
                    </div>
                  </div>
                  <Link href="/checkout/express">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold h-12">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Use Express Checkout ⚡
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* ThruDark-Inspired Professional Checkout */}
              <Card className="border border-green-200 bg-gradient-to-r from-green-50 to-green-100/50 rounded-lg">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    <h3 className="text-sm font-semibold text-green-800">Multi-Step Professional Checkout</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Experience our enhanced professional checkout with multi-step progress tracking, express payment options (Apple Pay, Google Pay), advanced shipping options, and ThruDark-inspired design for maximum security and convenience.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span>Step-by-step progress</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span>Express payments</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span>Enhanced security</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span>Professional design</span>
                    </div>
                  </div>
                  <Link href="/checkout/thrudark">
                    <Button variant="outline" className="w-full border-green-600 text-green-700 hover:bg-green-50">
                      <Shield className="h-4 w-4 mr-2" />
                      Use Multi-Step Checkout
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Express Checkout Available */}
              <Card className="border border-blue-200 rounded-lg">
                <CardContent className="pt-6 space-y-3">
                  <h3 className="text-sm font-semibold text-blue-800">Quick Checkout (Current)</h3>
                  <p className="text-xs text-muted-foreground">
                    Continue with our standard checkout flow - reliable and secure.
                  </p>
                  <div className="text-xs text-muted-foreground">
                    ✓ Secure Stripe integration • ✓ Apple Pay & Google Pay • ✓ All major cards accepted
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}