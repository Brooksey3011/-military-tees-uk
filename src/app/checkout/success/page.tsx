"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'
import { Layout } from "@/components/layout/layout"
import { useAuth } from "@/hooks/use-auth"
import { useSimpleCart } from "@/hooks/use-simple-cart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  CheckCircle, 
  Package, 
  Truck, 
  Mail, 
  Download,
  ArrowRight,
  Calendar,
  MapPin
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { items, totalPrice, clearCart } = useSimpleCart()
  const [orderData, setOrderData] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Process order data from URL params and sessionStorage
  React.useEffect(() => {
    const sessionId = searchParams.get('session_id')
    const orderNumber = searchParams.get('order_number')
    const paymentIntentId = searchParams.get('payment_intent')
    
    console.log('Success page params:', { sessionId, orderNumber, paymentIntentId })
    
    if (!sessionId && !paymentIntentId && !orderNumber) {
      setError('No payment confirmation provided')
      setLoading(false)
      return
    }

    try {
      let parsedOrderData = null
      
      if (sessionId || orderNumber) {
        // Real Stripe checkout - create mock order data based on URL params
        console.log('Processing real Stripe checkout success')
        parsedOrderData = {
          orderNumber: orderNumber || `MTU-${Date.now().toString().slice(-6)}`,
          orderDate: new Date().toISOString(),
          paymentIntentId: sessionId || paymentIntentId,
          customerDetails: {
            firstName: 'Valued',
            lastName: 'Customer',
            email: 'customer@militarytees.co.uk'
          },
          shippingAddress: {
            address1: 'Shipping address will be updated',
            address2: '',
            city: 'from your Stripe checkout',
            postcode: 'information',
            country: 'GB'
          },
          items: items.length > 0 ? items : [{
            id: '1',
            name: 'Military Tees Order',
            quantity: 1,
            price: totalPrice || 25.99,
            image: '/images/products/placeholder-tshirt.svg'
          }],
          subtotal: totalPrice || 25.99,
          shipping: 0,
          tax: (totalPrice || 25.99) * 0.2,
          total: (totalPrice || 25.99) * 1.2
        }
      } else {
        // Development/session storage flow
        const storedOrderData = sessionStorage.getItem('checkout_order_data')
        if (!storedOrderData) {
          setError('Order data not found')
          setLoading(false)
          return
        }
        parsedOrderData = JSON.parse(storedOrderData)
        console.log('Retrieved order data from session:', parsedOrderData)
      }

      // Format the order data for display
      const orderData = {
        orderNumber: parsedOrderData.orderNumber || `MTU-${Date.now().toString().slice(-6)}`,
        orderDate: new Date(parsedOrderData.orderDate).toLocaleDateString('en-GB'),
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB'),
        email: parsedOrderData.customerDetails.email,
        shippingAddress: {
          name: `${parsedOrderData.customerDetails.firstName} ${parsedOrderData.customerDetails.lastName}`,
          address: parsedOrderData.shippingAddress.address1 + (parsedOrderData.shippingAddress.address2 ? `, ${parsedOrderData.shippingAddress.address2}` : ''),
          city: parsedOrderData.shippingAddress.city,
          postcode: parsedOrderData.shippingAddress.postcode,
          country: parsedOrderData.shippingAddress.country
        },
        items: parsedOrderData.items.map((item: any) => ({
          id: item.id,
          name: item.name,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          price: item.price,
          image: item.image
        })),
        subtotal: parsedOrderData.subtotal,
        shipping: parsedOrderData.shipping,
        tax: parsedOrderData.tax,
        total: parsedOrderData.total
      }

      setOrderData(orderData)
      setLoading(false)

      // Clear the stored order data and cart after successful display
      setTimeout(() => {
        if (sessionStorage.getItem('checkout_order_data')) {
          sessionStorage.removeItem('checkout_order_data')
        }
        clearCart()
      }, 2000) // Give time for user to see the data

    } catch (err) {
      console.error('Error processing order data:', err)
      setError('Failed to process order information')
      setLoading(false)
    }
  }, [searchParams, clearCart])

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg font-display tracking-wide uppercase">Confirming your order...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (error || !orderData) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-display font-bold mb-4">Order Not Found</h1>
            <p className="text-muted-foreground mb-6">{error || 'Unable to load order information'}</p>
            <Button asChild className="rounded-none">
              <Link href="/categories">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-green-50/20 to-background">
        
        {/* Success Header */}
        <section className="py-12 border-b-2 border-border bg-green-50/10">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 border-2 border-green-600 mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            
            <h1 className="text-4xl font-display font-bold tracking-wider uppercase mb-4">
              Order Confirmed!
            </h1>
            
            <p className="text-lg text-muted-foreground mb-2">
              Thank you for your order. Your mission gear is being prepared for deployment.
            </p>
            
            <div className="flex items-center justify-center gap-4 text-sm">
              <Badge variant="outline" className="rounded-none border-2">
                Order #{orderData.orderNumber}
              </Badge>
              <span className="text-muted-foreground">
                Placed on {orderData.orderDate}
              </span>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* What Happens Next */}
              <Card className="border-2 border-border rounded-none">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-display font-bold tracking-wide uppercase">
                    <Package className="h-5 w-5" />
                    What Happens Next
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-muted/20 border border-border">
                      <Mail className="h-8 w-8 mx-auto mb-3 text-primary" />
                      <h3 className="font-display font-bold text-sm uppercase tracking-wide mb-2">
                        Order Confirmation
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Confirmation email sent to {orderData.email}
                      </p>
                    </div>
                    
                    <div className="text-center p-4 bg-muted/20 border border-border">
                      <Package className="h-8 w-8 mx-auto mb-3 text-primary" />
                      <h3 className="font-display font-bold text-sm uppercase tracking-wide mb-2">
                        Processing
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Order packed and dispatched within 24 hours
                      </p>
                    </div>
                    
                    <div className="text-center p-4 bg-muted/20 border border-border">
                      <Truck className="h-8 w-8 mx-auto mb-3 text-primary" />
                      <h3 className="font-display font-bold text-sm uppercase tracking-wide mb-2">
                        Delivery
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Expected delivery: {orderData.estimatedDelivery}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border-2 border-blue-200 p-4">
                    <div className="flex items-start gap-3">
                      <Truck className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-display font-bold text-sm uppercase tracking-wide text-blue-800 mb-1">
                          Free Shipping Applied
                        </h4>
                        <p className="text-sm text-blue-700">
                          Your order qualifies for free UK delivery. We'll send tracking information once your order ships.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card className="border-2 border-border rounded-none">
                <CardHeader>
                  <CardTitle className="font-display font-bold tracking-wide uppercase">
                    Order Items ({orderData.items.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orderData.items.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-4 p-4 bg-muted/20 border border-border">
                        <div className="relative w-16 h-16 bg-muted border border-border rounded-md overflow-hidden">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs font-bold">
                              IMG
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium mb-1">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {item.size && `Size: ${item.size}`} {item.size && item.color && '|'} {item.color && `Color: ${item.color}`}
                          </p>
                          <p className="text-sm">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">£{(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card className="border-2 border-border rounded-none">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-display font-bold tracking-wide uppercase">
                    <MapPin className="h-5 w-5" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-1">
                    <p className="font-medium">{orderData.shippingAddress.name}</p>
                    <p>{orderData.shippingAddress.address}</p>
                    <p>{orderData.shippingAddress.city}, {orderData.shippingAddress.postcode}</p>
                    <p>{orderData.shippingAddress.country}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary Sidebar */}
            <div className="space-y-6">
              
              {/* Order Summary */}
              <Card className="border-2 border-border rounded-none">
                <CardHeader>
                  <CardTitle className="font-display font-bold tracking-wide uppercase">
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>£{orderData.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-green-600 font-medium">FREE</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>VAT</span>
                    <span>Not applicable</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>£{orderData.total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="border-2 border-border rounded-none">
                <CardHeader>
                  <CardTitle className="font-display font-bold tracking-wide uppercase">
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline"
                    className="w-full rounded-none border-2 font-display font-bold tracking-wide uppercase justify-between"
                    asChild
                  >
                    <Link href="#" onClick={(e) => { e.preventDefault(); window.print(); }}>
                      <span>Print Receipt</span>
                      <Download className="h-4 w-4" />
                    </Link>
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="w-full rounded-none border-2 font-display font-bold tracking-wide uppercase justify-between"
                    asChild
                  >
                    <Link href="/account/orders">
                      <span>Track Order</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  
                  <Button 
                    className="w-full rounded-none font-display font-bold tracking-wide uppercase"
                    asChild
                  >
                    <Link href="/categories">
                      Continue Shopping
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Customer Support */}
              <Card className="border-2 border-border rounded-none">
                <CardContent className="pt-6 text-center space-y-3">
                  <h3 className="font-display font-bold text-sm uppercase tracking-wide">
                    Need Help?
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Questions about your order? Our support team is standing by.
                  </p>
                  <Button 
                    variant="outline"
                    size="sm"
                    className="rounded-none border-2 font-display font-bold tracking-wide uppercase"
                    asChild
                  >
                    <Link href="/contact">
                      Contact Support
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg font-display tracking-wide uppercase">Loading order details...</p>
          </div>
        </div>
      </Layout>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  )
}