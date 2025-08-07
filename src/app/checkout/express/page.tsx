"use client"

import * as React from "react"
import { Layout } from "@/components/layout/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
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
  ArrowLeft
} from "lucide-react"
import StripeExpressCheckout from "@/components/checkout/stripe-express-checkout"
import Link from "next/link"
import Image from "next/image"

// Force dynamic rendering for this auth-dependent page
export const dynamic = 'force-dynamic'

export default function ExpressCheckoutPage() {
  const { user, loading: authLoading } = useAuth()
  const { items, totalItems, totalPrice } = useSimpleCart()

  const [isProcessing, setIsProcessing] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [selectedPayment, setSelectedPayment] = React.useState<'card' | 'paypal' | 'googlepay' | 'applepay'>('card')

  // Form states
  const [customerDetails, setCustomerDetails] = React.useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: ""
  })

  const [shippingAddress, setShippingAddress] = React.useState({
    address1: "",
    address2: "",
    city: "",
    postcode: "",
    country: "United Kingdom"
  })

  const [billingAddress, setBillingAddress] = React.useState({
    address1: "",
    address2: "",
    city: "",
    postcode: "",
    country: "United Kingdom"
  })

  const [sameAsBilling, setSameAsBilling] = React.useState(true)

  // Redirect if cart is empty (guest checkout is allowed) - but wait for hydration
  React.useEffect(() => {
    if (items.length === 0 && !authLoading) {
      const timer = setTimeout(() => {
        if (items.length === 0) {
          window.location.href = "/categories"
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [items.length, authLoading])

  // Express payment is now handled by the ExpressStripeCheckout component

  const handlePaymentSuccess = async (paymentMethod: any) => {
    setIsProcessing(true)
    setError(null)

    try {
      // Validate form data
      if (!customerDetails.email || !customerDetails.firstName || !customerDetails.lastName || 
          !customerDetails.phone || !shippingAddress.address1 || !shippingAddress.city || 
          !shippingAddress.postcode) {
        throw new Error('Please fill out all required fields')
      }

      const finalBillingAddress = sameAsBilling ? {
        firstName: customerDetails.firstName,
        lastName: customerDetails.lastName,
        address1: shippingAddress.address1,
        address2: shippingAddress.address2,
        city: shippingAddress.city,
        postcode: shippingAddress.postcode,
        country: shippingAddress.country
      } : {
        firstName: customerDetails.firstName,
        lastName: customerDetails.lastName,
        ...billingAddress
      }

      // Create order in database
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerDetails: customerDetails,
          shippingAddress: shippingAddress,
          billingAddress: finalBillingAddress,
          items: items,
          paymentMethodId: paymentMethod.id,
          subtotal: totalPrice,
          shipping: shippingCost,
          tax: tax,
          total: finalTotal
        })
      })

      const orderResult = await orderResponse.json()
      
      if (!orderResponse.ok) {
        throw new Error(orderResult.error || 'Failed to create order')
      }

      // Store order data in sessionStorage for the success page
      const orderData = {
        orderId: orderResult.orderId,
        orderNumber: orderResult.orderNumber,
        paymentMethod: paymentMethod,
        customerDetails: customerDetails,
        shippingAddress: shippingAddress,
        billingAddress: finalBillingAddress,
        items: items,
        subtotal: totalPrice,
        shipping: shippingCost,
        tax: tax,
        total: finalTotal,
        orderDate: new Date().toISOString()
      }
      
      // Store in sessionStorage so success page can access it
      sessionStorage.setItem('checkout_order_data', JSON.stringify(orderData))
      
      console.log('Order created successfully:', orderResult)
      console.log('Order data stored:', orderData)
      
      // Redirect to success page with the real order
      window.location.href = `/checkout/success?session_id=order_${orderResult.orderId}`
      
    } catch (err) {
      console.error('Checkout error:', err)
      setError(err instanceof Error ? err.message : "Payment processing failed. Please try again.")
      setIsProcessing(false)
    }
  }

  const handlePaymentError = (error: string) => {
    setError(error)
  }

  const shippingCost = totalPrice > 50 ? 0 : 4.99
  const tax = totalPrice * 0.2 // 20% VAT
  const finalTotal = totalPrice + shippingCost + tax

  if (items.length === 0) {
    return null // Will redirect
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-muted/10 to-background">
        
        {/* Header */}
        <section className="py-6 border-b border-border/50">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4">
              <Link href="/cart">
                <Button variant="ghost" size="sm" className="rounded-none">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Cart
                </Button>
              </Link>
              <div className="flex-1">
                <h1 className="text-2xl font-display font-bold tracking-wider uppercase">
                  Express Checkout
                </h1>
                <p className="text-sm text-muted-foreground">
                  Fast, secure, and easy payment
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                <span className="text-sm text-muted-foreground">256-bit SSL</span>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
            
            {/* Left Column - Payment */}
            <div className="space-y-6">
              
              {error && (
                <ErrorDisplay 
                  error={error} 
                  variant="banner" 
                  onRetry={() => setError(null)}
                  showRetry={false}
                />
              )}

              {/* Official Stripe Express Checkout */}
              <StripeExpressCheckout
                items={items.map(item => ({
                  variantId: item.variantId || item.id,
                  quantity: item.quantity,
                  price: item.price,
                  name: item.name || 'Military Tee'
                }))}
                shippingAddress={{
                  firstName: customerDetails.firstName,
                  lastName: customerDetails.lastName,
                  email: customerDetails.email,
                  phone: customerDetails.phone,
                  address1: shippingAddress.address1,
                  address2: shippingAddress.address2,
                  city: shippingAddress.city,
                  postcode: shippingAddress.postcode,
                  country: 'GB'
                }}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
              />

              {/* Customer Information */}
              <Card className="border border-border/50">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Contact Information
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Email Address *</label>
                      <Input
                        type="email"
                        value={customerDetails.email}
                        onChange={(e) => setCustomerDetails({...customerDetails, email: e.target.value})}
                        className="rounded-md border border-border/50 focus:border-primary"
                        placeholder="you@example.com"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">First Name *</label>
                        <Input
                          value={customerDetails.firstName}
                          onChange={(e) => setCustomerDetails({...customerDetails, firstName: e.target.value})}
                          className="rounded-md border border-border/50 focus:border-primary"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Last Name *</label>
                        <Input
                          value={customerDetails.lastName}
                          onChange={(e) => setCustomerDetails({...customerDetails, lastName: e.target.value})}
                          className="rounded-md border border-border/50 focus:border-primary"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Phone Number *</label>
                      <Input
                        type="tel"
                        value={customerDetails.phone}
                        onChange={(e) => setCustomerDetails({...customerDetails, phone: e.target.value})}
                        className="rounded-md border border-border/50 focus:border-primary"
                        placeholder="+44 1234 567890"
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card className="border border-border/50">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Shipping Address
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Address Line 1 *</label>
                      <Input
                        value={shippingAddress.address1}
                        onChange={(e) => setShippingAddress({...shippingAddress, address1: e.target.value})}
                        className="rounded-md border border-border/50 focus:border-primary"
                        placeholder="123 Main Street"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Address Line 2</label>
                      <Input
                        value={shippingAddress.address2}
                        onChange={(e) => setShippingAddress({...shippingAddress, address2: e.target.value})}
                        className="rounded-md border border-border/50 focus:border-primary"
                        placeholder="Apartment, suite, etc."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">City *</label>
                        <Input
                          value={shippingAddress.city}
                          onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                          className="rounded-md border border-border/50 focus:border-primary"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Postcode *</label>
                        <Input
                          value={shippingAddress.postcode}
                          onChange={(e) => setShippingAddress({...shippingAddress, postcode: e.target.value})}
                          className="rounded-md border border-border/50 focus:border-primary"
                          placeholder="SW1A 1AA"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sameAsBilling}
                          onChange={(e) => setSameAsBilling(e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm">Billing address same as shipping</span>
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Express checkout component above already handles all payment methods */}

              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    SSL Encrypted
                  </div>
                  <div className="flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    PCI Compliant
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your payment information is processed securely
                </p>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="space-y-6">
              
              {/* Order Summary */}
              <Card className="border border-border/50 sticky top-6">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                  
                  {/* Order Items */}
                  <div className="space-y-4 mb-6">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <div className="relative w-16 h-16 bg-muted border border-border/50 rounded-md overflow-hidden">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                              IMG
                            </div>
                          )}
                          <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
                            {item.quantity}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            {item.size && `Size: ${item.size}`} {item.size && item.color && '|'} {item.color && `Color: ${item.color}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm">£{(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  {/* Totals */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal ({totalItems} items)</span>
                      <span>£{totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span className={shippingCost === 0 ? 'text-green-600 font-medium' : ''}>
                        {shippingCost === 0 ? 'FREE' : `£${shippingCost.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>VAT (20%)</span>
                      <span>£{tax.toFixed(2)}</span>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>£{finalTotal.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  {shippingCost === 0 && (
                    <div className="bg-green-50 border border-green-200 p-3 rounded-md mt-4">
                      <div className="flex items-center gap-2 text-green-800 text-sm">
                        <Truck className="h-4 w-4" />
                        <span className="font-medium">Free shipping included!</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Security Information */}
              <Card className="border border-border/50">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3">Secure Checkout</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span>256-bit SSL encryption</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-green-600" />
                      <span>PCI DSS compliant</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-green-600" />
                      <span>Secure card processing</span>
                    </div>
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