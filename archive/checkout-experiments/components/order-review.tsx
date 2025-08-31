"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { 
  CheckCircle2, 
  Shield, 
  Lock,
  Package,
  CreditCard,
  MapPin,
  User,
  Truck,
  Clock,
  Phone,
  Mail,
  AlertTriangle
} from "lucide-react"
import { useSimpleCart } from "@/hooks/use-simple-cart"
import Image from "next/image"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

interface OrderReviewProps {
  onSubmit: () => void
  onBack: () => void
  customerData: any
  shippingData: any
  paymentData: any
}

export function OrderReview({ 
  onSubmit, 
  onBack, 
  customerData, 
  shippingData, 
  paymentData 
}: OrderReviewProps) {
  const { items, totalItems, totalPrice, clearCart } = useSimpleCart()
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const shippingCost = totalPrice >= 50 ? 0 : 4.99
  const tax = totalPrice * 0.2
  const finalTotal = totalPrice + shippingCost + tax

  const getShippingMethodName = (methodId: string) => {
    const methods: Record<string, string> = {
      'standard': 'Standard Delivery (3-5 days)',
      'express': 'Express Delivery (1-2 days)',
      'next-day': 'Next Day Delivery'
    }
    return methods[methodId] || methodId
  }

  const getPaymentMethodName = (methodId: string) => {
    const methods: Record<string, string> = {
      'stripe-redirect': 'Credit/Debit Card',
      'apple-pay': 'Apple Pay',
      'google-pay': 'Google Pay',
      'paypal': 'PayPal'
    }
    return methods[methodId] || methodId
  }

  const handlePlaceOrder = async () => {
    if (!agreedToTerms) {
      setError('Please agree to the terms and conditions to continue.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Prepare billing address
      const billingAddress = paymentData.billingAddress.sameAsShipping 
        ? {
            firstName: shippingData.address.firstName,
            lastName: shippingData.address.lastName,
            address1: shippingData.address.address1,
            address2: shippingData.address.address2,
            city: shippingData.address.city,
            postcode: shippingData.address.postcode,
            country: shippingData.address.country
          }
        : paymentData.billingAddress

      // Prepare order data for checkout API
      const orderData = {
        items: items.map(item => ({
          variantId: item.variantId,
          quantity: item.quantity
        })),
        shippingAddress: {
          firstName: shippingData.address.firstName,
          lastName: shippingData.address.lastName,
          email: customerData.email,
          phone: customerData.phone,
          address1: shippingData.address.address1,
          address2: shippingData.address.address2 || '',
          city: shippingData.address.city,
          postcode: shippingData.address.postcode,
          country: shippingData.address.country,
          company: shippingData.address.company || ''
        },
        billingAddress,
        customerNotes: '',
        shippingMethod: shippingData.method,
        paymentMethod: paymentData.method,
        customerConsent: {
          terms: agreedToTerms,
          marketing: customerData.marketingConsent || false
        }
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
        throw new Error(errorData.error || 'Order submission failed')
      }

      const { url, sessionId } = await response.json()

      // Clear cart before redirect
      clearCart()

      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url
      } else {
        throw new Error('No checkout URL received')
      }
      
    } catch (err) {
      console.error('Order submission error:', err)
      setError(err instanceof Error ? err.message : "Order submission failed. Please try again.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Order Error</span>
            </div>
            <p className="text-sm text-destructive mt-1">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Order Summary */}
      <Card className="border border-border/50">
        <CardHeader>
          <CardTitle className="font-display font-bold tracking-wide uppercase flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Order Items */}
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4 bg-muted/20 rounded-lg">
                <div className="w-16 h-16 bg-muted border border-border/50 rounded-md overflow-hidden flex-shrink-0">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                      IMG
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{item.name}</h3>
                  {(item.size || item.color) && (
                    <p className="text-sm text-muted-foreground">
                      {item.size && `${item.size}`} 
                      {item.size && item.color && ' • '} 
                      {item.color && `${item.color}`}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">£{(item.price * item.quantity).toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">£{item.price.toFixed(2)} each</p>
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Order Totals */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Subtotal ({totalItems} items)</span>
              <span>£{totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className={shippingCost === 0 ? 'text-green-600 font-medium' : ''}>
                {shippingCost === 0 ? 'FREE' : `£${shippingCost.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span>VAT (20%)</span>
              <span>£{tax.toFixed(2)}</span>
            </div>
            
            <Separator />
            
            <div className="flex justify-between text-xl font-bold">
              <span>Total</span>
              <span>£{finalTotal.toFixed(2)}</span>
            </div>
          </div>

          {shippingCost === 0 && (
            <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-green-800 text-sm">
                <CheckCircle2 className="h-4 w-4" />
                <span className="font-medium">Free shipping included!</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer Information */}
      <Card className="border border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Contact Details</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3" />
                  <span>{customerData.firstName} {customerData.lastName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-3 w-3" />
                  <span>{customerData.email}</span>
                </div>
                {customerData.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3" />
                    <span>{customerData.phone}</span>
                  </div>
                )}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Account</h4>
              <div className="text-sm text-muted-foreground">
                {customerData.createAccount ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                    <span>Account will be created</span>
                  </div>
                ) : (
                  <span>Guest checkout</span>
                )}
              </div>
              {customerData.marketingConsent && (
                <div className="text-sm text-muted-foreground mt-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                    <span>Subscribed to updates</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shipping Information */}
      <Card className="border border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Shipping Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Delivery Address</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>{shippingData.address.firstName} {shippingData.address.lastName}</p>
                {shippingData.address.company && <p>{shippingData.address.company}</p>}
                <p>{shippingData.address.address1}</p>
                {shippingData.address.address2 && <p>{shippingData.address.address2}</p>}
                <p>{shippingData.address.city}, {shippingData.address.postcode}</p>
                <p>United Kingdom</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Delivery Method</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  <span className="text-sm font-medium">{getShippingMethodName(shippingData.method)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Estimated delivery time</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Information */}
      <Card className="border border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Payment Method</h4>
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="h-4 w-4" />
                <span>{getPaymentMethodName(paymentData.method)}</span>
                <Badge variant="secondary" className="text-xs">Secure</Badge>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Billing Address</h4>
              <div className="text-sm text-muted-foreground">
                {paymentData.billingAddress.sameAsShipping ? (
                  <span>Same as shipping address</span>
                ) : (
                  <div className="space-y-1">
                    <p>{paymentData.billingAddress.firstName} {paymentData.billingAddress.lastName}</p>
                    <p>{paymentData.billingAddress.address1}</p>
                    {paymentData.billingAddress.address2 && <p>{paymentData.billingAddress.address2}</p>}
                    <p>{paymentData.billingAddress.city}, {paymentData.billingAddress.postcode}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terms and Conditions */}
      <Card className="border border-border/50">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(!!checked)}
                className="mt-0.5"
              />
              <div className="text-sm">
                <Label htmlFor="terms" className="cursor-pointer">
                  I agree to the{' '}
                  <Link href="/terms" className="text-primary hover:underline" target="_blank">
                    Terms & Conditions
                  </Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-primary hover:underline" target="_blank">
                    Privacy Policy
                  </Link>
                </Label>
                <p className="text-muted-foreground mt-1">
                  By placing this order, you confirm that all information provided is accurate 
                  and you authorize Military Tees UK to process your payment.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isSubmitting}
          className="flex-1"
        >
          Back to Payment
        </Button>
        <Button
          onClick={handlePlaceOrder}
          disabled={!agreedToTerms || isSubmitting}
          className="flex-1 bg-green-600 hover:bg-green-700 h-12 text-lg font-semibold"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing Order...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Place Order • £{finalTotal.toFixed(2)}
            </div>
          )}
        </Button>
      </div>

      {/* Security Assurance */}
      <Card className="border border-green-200 bg-green-50/50">
        <CardContent className="p-4">
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium">Secure Order Processing</span>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>✅ Your payment will be processed securely by Stripe</p>
              <p>✅ Order confirmation will be sent to your email</p>
              <p>✅ You can track your order status online</p>
              <p>✅ 30-day money-back guarantee</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}