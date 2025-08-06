"use client"

import * as React from "react"
import { Layout } from "@/components/layout/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { LoadingState, ErrorDisplay } from "@/components/ui"
import { useSimpleCart } from "@/hooks/use-simple-cart"
import { useAuth } from "@/hooks/use-auth"
import { getStripe } from "@/lib/stripe"
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
  ArrowRight
} from "lucide-react"
import Link from "next/link"

// Force dynamic rendering for this auth-dependent page
export const dynamic = 'force-dynamic'

export default function CheckoutPage() {
  const { user, loading: authLoading } = useAuth()
  const { items, totalItems, totalPrice } = useSimpleCart()

  const [step, setStep] = React.useState(1) // 1: Address, 2: Payment, 3: Review
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Form states
  const [shippingAddress, setShippingAddress] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address1: "",
    address2: "",
    city: "",
    postcode: "",
    country: "United Kingdom"
  })

  const [billingAddress, setBillingAddress] = React.useState({
    firstName: "",
    lastName: "",
    address1: "",
    address2: "",
    city: "",
    postcode: "",
    country: "United Kingdom"
  })

  const [paymentMethod, setPaymentMethod] = React.useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    nameOnCard: ""
  })

  const [sameAsBilling, setSameAsBilling] = React.useState(true)

  // Redirect if cart is empty (guest checkout is allowed)
  React.useEffect(() => {
    if (items.length === 0) {
      window.location.href = "/categories"
    }
  }, [items.length])

  const handleNextStep = () => {
    setError(null)
    if (step < 3) {
      setStep(step + 1)
    }
  }

  const handlePrevStep = () => {
    setError(null)
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handlePlaceOrder = async () => {
    setIsProcessing(true)
    setError(null)

    try {
      // Validate form data before submission
      if (!shippingAddress.firstName || !shippingAddress.lastName || !shippingAddress.email || 
          !shippingAddress.phone || !shippingAddress.address1 || !shippingAddress.city || 
          !shippingAddress.postcode || !billingAddress.firstName || !billingAddress.lastName || 
          !billingAddress.address1 || !billingAddress.city || !billingAddress.postcode) {
        throw new Error('Please fill out all required fields')
      }

      // Prepare order data (guest checkout supported)
      const orderData = {
        items: items.map(item => ({
          variantId: item.variantId,
          quantity: item.quantity
        })),
        shippingAddress: {
          firstName: shippingAddress.firstName,
          lastName: shippingAddress.lastName,
          email: shippingAddress.email,
          phone: shippingAddress.phone,
          address1: shippingAddress.address1,
          address2: shippingAddress.address2,
          city: shippingAddress.city,
          postcode: shippingAddress.postcode,
          country: "United Kingdom"
        },
        billingAddress: sameAsBilling ? {
          firstName: shippingAddress.firstName,
          lastName: shippingAddress.lastName,
          address1: shippingAddress.address1,
          address2: shippingAddress.address2,
          city: shippingAddress.city,
          postcode: shippingAddress.postcode,
          country: "United Kingdom"
        } : {
          firstName: billingAddress.firstName,
          lastName: billingAddress.lastName,
          address1: billingAddress.address1,
          address2: billingAddress.address2,
          city: billingAddress.city,
          postcode: billingAddress.postcode,
          country: "United Kingdom"
        },
        customerNotes: ""
      }

      // Get session token (optional for guest checkout)
      const { data: { session } } = await supabase.auth.getSession()
      
      // Create Stripe checkout session
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      // Add auth header only if user is logged in
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
        throw new Error(errorData.error || 'Failed to create checkout session')
      }

      const { sessionId, url } = await response.json()

      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url
      } else if (sessionId) {
        // Fallback: Construct checkout URL manually
        window.location.href = `https://checkout.stripe.com/pay/${sessionId}`
      }
      
    } catch (err) {
      console.error('Checkout error:', err)
      setError(err instanceof Error ? err.message : "Payment processing failed. Please try again.")
      setIsProcessing(false)
    }
  }

  const shippingCost = totalPrice > 50 ? 0 : 4.99
  const tax = totalPrice * 0.2 // 20% VAT
  const finalTotal = totalPrice + shippingCost + tax

  if (items.length === 0) {
    return null // Will redirect
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-muted/20 to-background">
        
        {/* Header */}
        <section className="py-8 border-b-2 border-border">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4 mb-6">
              <Link href="/cart">
                <Button variant="ghost" size="sm" className="rounded-none">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Cart
                </Button>
              </Link>
              <div className="flex-1">
                <h1 className="text-3xl font-display font-bold tracking-wider uppercase">
                  Secure Checkout
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                <span className="text-sm text-muted-foreground">256-bit SSL</span>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center space-x-8">
              {[
                { number: 1, title: "Shipping" },
                { number: 2, title: "Payment" },
                { number: 3, title: "Review" }
              ].map((stepItem) => (
                <div key={stepItem.number} className="flex items-center">
                  <div className={`
                    w-8 h-8 rounded-none border-2 flex items-center justify-center text-sm font-bold
                    ${step >= stepItem.number 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'bg-background text-muted-foreground border-border'
                    }
                  `}>
                    {stepItem.number}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    step >= stepItem.number ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {stepItem.title}
                  </span>
                  {stepItem.number < 3 && (
                    <ArrowRight className="h-4 w-4 text-muted-foreground ml-8" />
                  )}
                </div>
              ))}
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

              {/* Step 1: Shipping Address */}
              {step === 1 && (
                <Card className="border-2 border-border rounded-none">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-display font-bold tracking-wide uppercase">
                      <MapPin className="h-5 w-5" />
                      Shipping Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">First Name *</label>
                        <Input
                          value={shippingAddress.firstName}
                          onChange={(e) => setShippingAddress({...shippingAddress, firstName: e.target.value})}
                          className="rounded-none border-2"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Last Name *</label>
                        <Input
                          value={shippingAddress.lastName}
                          onChange={(e) => setShippingAddress({...shippingAddress, lastName: e.target.value})}
                          className="rounded-none border-2"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Email Address *</label>
                      <Input
                        type="email"
                        value={shippingAddress.email}
                        onChange={(e) => setShippingAddress({...shippingAddress, email: e.target.value})}
                        className="rounded-none border-2"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Phone Number *</label>
                      <Input
                        type="tel"
                        value={shippingAddress.phone}
                        onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
                        className="rounded-none border-2"
                        placeholder="+44 1234 567890"
                        required
                      />
                    </div>

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
                      <label className="block text-sm font-medium mb-2">Address Line 2</label>
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

                    <Button 
                      onClick={handleNextStep}
                      className="w-full rounded-none font-display font-bold tracking-wide uppercase"
                      disabled={!shippingAddress.firstName || !shippingAddress.lastName || !shippingAddress.email}
                    >
                      Continue to Payment
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Payment */}
              {step === 2 && (
                <Card className="border-2 border-border rounded-none">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-display font-bold tracking-wide uppercase">
                      <CreditCard className="h-5 w-5" />
                      Payment Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Lock className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-muted-foreground">Your payment information is encrypted and secure</span>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Card Number *</label>
                      <Input
                        value={paymentMethod.cardNumber}
                        onChange={(e) => setPaymentMethod({...paymentMethod, cardNumber: e.target.value})}
                        className="rounded-none border-2"
                        placeholder="1234 5678 9012 3456"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Expiry Date *</label>
                        <Input
                          value={paymentMethod.expiryDate}
                          onChange={(e) => setPaymentMethod({...paymentMethod, expiryDate: e.target.value})}
                          className="rounded-none border-2"
                          placeholder="MM/YY"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">CVV *</label>
                        <Input
                          value={paymentMethod.cvv}
                          onChange={(e) => setPaymentMethod({...paymentMethod, cvv: e.target.value})}
                          className="rounded-none border-2"
                          placeholder="123"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Name on Card *</label>
                      <Input
                        value={paymentMethod.nameOnCard}
                        onChange={(e) => setPaymentMethod({...paymentMethod, nameOnCard: e.target.value})}
                        className="rounded-none border-2"
                        required
                      />
                    </div>

                    <div className="border-t pt-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={sameAsBilling}
                          onChange={(e) => setSameAsBilling(e.target.checked)}
                          className="rounded-none"
                        />
                        <span className="text-sm">Billing address same as shipping</span>
                      </label>
                    </div>

                    <div className="flex gap-4">
                      <Button 
                        variant="outline"
                        onClick={handlePrevStep}
                        className="rounded-none border-2 font-display font-bold tracking-wide uppercase"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                      </Button>
                      <Button 
                        onClick={handleNextStep}
                        className="flex-1 rounded-none font-display font-bold tracking-wide uppercase"
                        disabled={!paymentMethod.cardNumber || !paymentMethod.cvv}
                      >
                        Review Order
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Review */}
              {step === 3 && (
                <Card className="border-2 border-border rounded-none">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-display font-bold tracking-wide uppercase">
                      <Shield className="h-5 w-5" />
                      Review Order
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    
                    {/* Order Items */}
                    <div>
                      <h3 className="font-semibold mb-4">Order Items ({totalItems})</h3>
                      <div className="space-y-3">
                        {items.map((item) => (
                          <div key={item.id} className="flex items-center gap-4 p-4 bg-muted/20 border border-border">
                            <div className="w-16 h-16 bg-muted border border-border flex items-center justify-center">
                              <span className="text-xs">IMG</span>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">{item.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {item.size && `Size: ${item.size}`} {item.size && item.color && '|'} {item.color && `Color: ${item.color}`}
                              </p>
                              <p className="text-sm">Qty: {item.quantity}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">£{(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Addresses */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-semibold mb-2">Shipping Address</h3>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>{shippingAddress.firstName} {shippingAddress.lastName}</p>
                          <p>{shippingAddress.address1}</p>
                          {shippingAddress.address2 && <p>{shippingAddress.address2}</p>}
                          <p>{shippingAddress.city}, {shippingAddress.postcode}</p>
                          <p>{shippingAddress.country}</p>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Payment Method</h3>
                        <div className="text-sm text-muted-foreground">
                          <p>**** **** **** {paymentMethod.cardNumber.slice(-4)}</p>
                          <p>{paymentMethod.nameOnCard}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button 
                        variant="outline"
                        onClick={handlePrevStep}
                        className="rounded-none border-2 font-display font-bold tracking-wide uppercase"
                        disabled={isProcessing}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                      </Button>
                      <LoadingState 
                        isLoading={isProcessing}
                        message="Processing order..."
                      >
                        <Button 
                          onClick={handlePlaceOrder}
                          className="flex-1 rounded-none font-display font-bold tracking-wide uppercase"
                        >
                          <Lock className="h-4 w-4 mr-2" />
                          Place Order - £{finalTotal.toFixed(2)}
                        </Button>
                      </LoadingState>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="space-y-6">
              <Card className="border-2 border-border rounded-none">
                <CardHeader>
                  <CardTitle className="font-display font-bold tracking-wide uppercase">
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal ({totalItems} items)</span>
                    <span>£{totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shippingCost === 0 ? 'FREE' : `£${shippingCost.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>VAT (20%)</span>
                    <span>£{tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>£{finalTotal.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  {shippingCost === 0 && (
                    <div className="bg-green-100 border border-green-300 p-3 text-green-800 text-sm">
                      <Truck className="h-4 w-4 inline mr-2" />
                      Free shipping on orders over £50!
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Security Badges */}
              <Card className="border-2 border-border rounded-none">
                <CardContent className="pt-6 text-center space-y-4">
                  <div className="flex items-center justify-center gap-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-semibold">Secure Checkout</span>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>256-bit SSL encryption</p>
                    <p>PCI DSS compliant</p>
                    <p>Your data is protected</p>
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