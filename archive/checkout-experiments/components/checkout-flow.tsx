"use client"

import { useState } from "react"
import { Layout } from "@/components/layout/layout"
import { ProgressIndicator } from "@/components/checkout/progress-indicator"
import { OrderSummary } from "@/components/checkout/order-summary"
import { CustomerInformation } from "@/components/checkout/customer-information"
import { ShippingInformation } from "@/components/checkout/shipping-information"
import { PaymentInformation } from "@/components/checkout/payment-information"
import { OrderReview } from "@/components/checkout/order-review"
import { CustomerSupport } from "@/components/checkout/customer-support"
import { useSimpleCart } from "@/hooks/use-simple-cart"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingCart, ArrowLeft, Edit3 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface CustomerData {
  email: string
  firstName: string
  lastName: string
  phone: string
  createAccount: boolean
  password: string
  marketingConsent: boolean
}

interface ShippingData {
  address: {
    firstName: string
    lastName: string
    address1: string
    address2: string
    city: string
    postcode: string
    country: string
    company: string
  }
  method: string
}

interface PaymentData {
  method: string
  cardDetails?: {
    number: string
    expiry: string
    cvc: string
    name: string
  }
  billingAddress: {
    sameAsShipping: boolean
    firstName: string
    lastName: string
    address1: string
    address2: string
    city: string
    postcode: string
    country: string
  }
}

export function CheckoutFlow() {
  const { items, totalItems, totalPrice, updateQuantity, removeItem } = useSimpleCart()
  const [currentStep, setCurrentStep] = useState(1)
  const [customerData, setCustomerData] = useState<CustomerData | null>(null)
  const [shippingData, setShippingData] = useState<ShippingData | null>(null)
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null)

  const shippingCost = totalPrice > 50 ? 0 : 4.99
  const tax = totalPrice * 0.2 // 20% VAT
  const finalTotal = totalPrice + shippingCost + tax

  // Redirect to cart if empty
  if (items.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-muted/10 to-background">
          <div className="container mx-auto px-4 py-16">
            <div className="text-center">
              <ShoppingCart className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
              <h1 className="text-2xl font-semibold mb-4">Your cart is empty</h1>
              <p className="text-muted-foreground mb-8">
                Add some items to your cart before proceeding to checkout.
              </p>
              <Link href="/categories">
                <Button>Continue Shopping</Button>
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  const handleCustomerSubmit = (data: CustomerData) => {
    setCustomerData(data)
    setCurrentStep(3) // Skip to shipping for now
  }

  const handleShippingSubmit = (data: ShippingData) => {
    setShippingData(data)
    setCurrentStep(4)
  }

  const handlePaymentSubmit = (data: PaymentData) => {
    setPaymentData(data)
    setCurrentStep(5)
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="border border-border/50">
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Review Your Cart</h2>
                  <Link href="/cart">
                    <Button variant="outline" size="sm">
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Cart
                    </Button>
                  </Link>
                </div>

                {/* Cart Items */}
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
                      </div>
                    </div>
                  ))}
                </div>

                {/* Continue Button */}
                <div className="flex justify-between items-center pt-4">
                  <Link href="/cart">
                    <Button variant="outline">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Cart
                    </Button>
                  </Link>
                  <Button onClick={() => setCurrentStep(2)}>
                    Continue to Customer Information
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case 2:
        return (
          <CustomerInformation
            onSubmit={handleCustomerSubmit}
            onBack={handleBack}
            initialData={customerData || {}}
          />
        )

      case 3:
        return (
          <ShippingInformation
            onSubmit={handleShippingSubmit}
            onBack={handleBack}
            initialData={shippingData || {}}
          />
        )

      case 4:
        return (
          <PaymentInformation
            onSubmit={handlePaymentSubmit}
            onBack={handleBack}
            initialData={paymentData || {}}
            shippingAddress={shippingData?.address}
            customerData={customerData}
          />
        )

      case 5:
        return (
          <OrderReview
            onSubmit={() => {
              // Order submission is handled within OrderReview component
              // This redirects to Stripe checkout
            }}
            onBack={handleBack}
            customerData={customerData}
            shippingData={shippingData}
            paymentData={paymentData}
          />
        )

      default:
        return null
    }
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-muted/10 to-background">
        
        {/* Header */}
        <section className="py-6 border-b border-border/50">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h1 className="text-2xl font-display font-bold tracking-wider uppercase">
                Secure Checkout
              </h1>
              <p className="text-muted-foreground mt-1">
                Complete your order securely and safely
              </p>
            </div>
          </div>
        </section>

        {/* Progress Indicator */}
        <section className="py-6">
          <div className="container mx-auto px-4">
            <ProgressIndicator currentStep={currentStep} />
          </div>
        </section>

        {/* Main Content */}
        <div className="container mx-auto px-4 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Checkout Steps */}
            <div className="lg:col-span-2">
              {renderCurrentStep()}
            </div>

            {/* Order Summary Sidebar */}
            <div className="space-y-6">
              <OrderSummary 
                showItems={true} 
                showExpressCheckout={currentStep >= 3} // Show express checkout after shipping info is collected
                shippingAddress={shippingData?.address}
                customerData={customerData}
              />
              
              {/* Customer Information Summary */}
              {customerData && (
                <Card className="border border-border/50">
                  <CardContent className="p-4">
                    <div className="text-sm">
                      <div className="font-medium mb-2">Customer Information</div>
                      <div className="text-muted-foreground space-y-1">
                        <p>{customerData.firstName} {customerData.lastName}</p>
                        <p>{customerData.email}</p>
                        {customerData.phone && <p>{customerData.phone}</p>}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentStep(2)}
                        className="mt-2 h-auto p-0 text-primary"
                      >
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Shipping Information Summary */}
              {shippingData && (
                <Card className="border border-border/50">
                  <CardContent className="p-4">
                    <div className="text-sm">
                      <div className="font-medium mb-2">Shipping Address</div>
                      <div className="text-muted-foreground space-y-1">
                        <p>{shippingData.address.firstName} {shippingData.address.lastName}</p>
                        <p>{shippingData.address.address1}</p>
                        {shippingData.address.address2 && <p>{shippingData.address.address2}</p>}
                        <p>{shippingData.address.city}, {shippingData.address.postcode}</p>
                      </div>
                      <div className="mt-2 pt-2 border-t">
                        <div className="font-medium mb-1">Delivery Method</div>
                        <p className="text-muted-foreground">{shippingData.method}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentStep(3)}
                        className="mt-2 h-auto p-0 text-primary"
                      >
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Payment Information Summary */}
              {paymentData && (
                <Card className="border border-border/50">
                  <CardContent className="p-4">
                    <div className="text-sm">
                      <div className="font-medium mb-2">Payment Method</div>
                      <div className="text-muted-foreground space-y-1">
                        <p>{paymentData.method === 'stripe-redirect' ? 'Credit/Debit Card' : paymentData.method}</p>
                        <p>Secure payment by Stripe</p>
                      </div>
                      <div className="mt-2 pt-2 border-t">
                        <div className="font-medium mb-1">Billing Address</div>
                        <p className="text-muted-foreground">
                          {paymentData.billingAddress?.sameAsShipping 
                            ? 'Same as shipping address' 
                            : 'Different billing address'
                          }
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentStep(4)}
                        className="mt-2 h-auto p-0 text-primary"
                      >
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Customer Support */}
              <CustomerSupport />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}