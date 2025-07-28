import { Metadata } from "next"
import { Search, Package, Truck, CheckCircle, MapPin, Clock } from "lucide-react"
import { Layout } from "@/components/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Track Your Order | Military Tees UK",
  description: "Track your Military Tees UK order. Enter your order number to get real-time updates on your military apparel delivery status.",
  robots: {
    index: true,
    follow: true,
  }
}

export default function TrackOrderPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <section className="border-b-2 border-border bg-muted/10">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <div className={cn(
                "inline-block p-4 mb-6",
                "border-2 border-primary rounded-none bg-background"
              )}>
                <Package className="h-12 w-12 text-primary mx-auto" />
              </div>
              
              <h1 className={cn(
                "text-4xl md:text-5xl font-display font-bold text-foreground mb-4",
                "tracking-wider uppercase"
              )}>
                Track Your Order
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                Monitor your mission-critical delivery. Real-time tracking updates for your Military Tees UK order.
              </p>
            </div>
          </div>
        </section>

        {/* Track Order Content */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Order Tracking Form */}
            <Card className="border-2 border-border rounded-none">
              <CardHeader>
                <CardTitle className={cn(
                  "font-display tracking-wide uppercase flex items-center gap-2"
                )}>
                  <Search className="h-5 w-5 text-primary" />
                  Enter Your Order Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Order Number *
                    </label>
                    <Input 
                      className="rounded-none border-2"
                      placeholder="MT-UK-XXXXX"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Found in your order confirmation email
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email Address *
                    </label>
                    <Input 
                      type="email"
                      className="rounded-none border-2"
                      placeholder="your.email@example.com"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Email used when placing the order
                    </p>
                  </div>
                </div>
                
                <Button className="w-full md:w-auto rounded-none" disabled>
                  <Search className="h-4 w-4 mr-2" />
                  Track Order
                </Button>
              </CardContent>
            </Card>

            {/* Sample Tracking Result */}
            <Card className="border-2 border-border rounded-none bg-muted/5">
              <CardHeader>
                <CardTitle className={cn(
                  "font-display tracking-wide uppercase"
                )}>
                  Order Status Example
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  This is how your tracking information will appear once you enter your details above.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Order Summary */}
                <div className="bg-background p-4 rounded-none border-2 border-border">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-foreground">Order #MT-UK-12345</h3>
                      <p className="text-sm text-muted-foreground">Placed on January 15, 2024</p>
                    </div>
                    <Badge className="rounded-none bg-green-600 hover:bg-green-700">
                      IN TRANSIT
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-foreground">Estimated Delivery</p>
                      <p className="text-muted-foreground">January 18, 2024</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Carrier</p>
                      <p className="text-muted-foreground">Royal Mail Tracked 48</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Tracking Number</p>
                      <p className="text-muted-foreground">RM123456789GB</p>
                    </div>
                  </div>
                </div>

                {/* Tracking Timeline */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Delivery Progress</h3>
                  
                  <div className="space-y-4">
                    {[
                      {
                        status: "delivered",
                        title: "Out for Delivery",
                        description: "Your order is on the delivery vehicle",
                        time: "January 18, 2024 - 08:30 AM",
                        location: "Local Delivery Office"
                      },
                      {
                        status: "current",
                        title: "In Transit",
                        description: "Package is on its way to your delivery address",
                        time: "January 17, 2024 - 06:45 PM",
                        location: "Regional Sorting Facility"
                      },
                      {
                        status: "completed",
                        title: "Dispatched",
                        description: "Order has been shipped from our warehouse",
                        time: "January 16, 2024 - 02:15 PM",
                        location: "Military Tees UK Warehouse"
                      },
                      {
                        status: "completed",
                        title: "Order Processed",
                        description: "Your order has been picked, packed and quality checked",
                        time: "January 16, 2024 - 10:30 AM",
                        location: "Military Tees UK Warehouse"
                      },
                      {
                        status: "completed",
                        title: "Order Confirmed",
                        description: "Payment received and order confirmed",
                        time: "January 15, 2024 - 03:22 PM",
                        location: "Order Management System"
                      }
                    ].map((item, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={cn(
                            "w-8 h-8 rounded-none border-2 flex items-center justify-center",
                            item.status === "completed" && "bg-green-600 border-green-600",
                            item.status === "current" && "bg-blue-600 border-blue-600",
                            item.status === "delivered" && "bg-primary border-primary"
                          )}>
                            {item.status === "completed" && <CheckCircle className="h-4 w-4 text-white" />}
                            {item.status === "current" && <Truck className="h-4 w-4 text-white" />}
                            {item.status === "delivered" && <Package className="h-4 w-4 text-white" />}
                          </div>
                          {index !== 4 && <div className="w-px h-12 bg-border" />}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-foreground">{item.title}</h4>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {item.time}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">{item.description}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {item.location}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-background p-4 rounded-none border-2 border-border">
                  <h3 className="font-semibold text-foreground mb-3">Items in This Order</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-foreground">Royal Marines Commando T-Shirt</p>
                        <p className="text-sm text-muted-foreground">Size: L | Color: Olive | Qty: 1</p>
                      </div>
                      <p className="font-medium text-foreground">£24.99</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-foreground">Parachute Regiment Cap Badge</p>
                        <p className="text-sm text-muted-foreground">Color: Silver | Qty: 1</p>
                      </div>
                      <p className="font-medium text-foreground">£15.99</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Help Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <Card className="border-2 border-border rounded-none">
                <CardHeader>
                  <CardTitle className={cn(
                    "font-display tracking-wide uppercase"
                  )}>
                    Can&apos;t Find Your Order?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 text-sm">
                    <div>
                      <strong className="text-foreground">Check Your Email:</strong>
                      <p className="text-muted-foreground">Look for your order confirmation email with the order number.</p>
                    </div>
                    
                    <div>
                      <strong className="text-foreground">Spelling Matters:</strong>
                      <p className="text-muted-foreground">Ensure your email address is spelled exactly as entered during checkout.</p>
                    </div>
                    
                    <div>
                      <strong className="text-foreground">Guest Orders:</strong>
                      <p className="text-muted-foreground">If you checked out as a guest, use the same email address.</p>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full rounded-none border-2" disabled>
                    Contact Support
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 border-border rounded-none bg-primary/5">
                <CardHeader>
                  <CardTitle className={cn(
                    "font-display tracking-wide uppercase"
                  )}>
                    Delivery Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 text-sm">
                    <div>
                      <strong className="text-foreground">UK Standard Delivery:</strong>
                      <p className="text-muted-foreground">3-5 working days (free over £50)</p>
                    </div>
                    
                    <div>
                      <strong className="text-foreground">Express Delivery:</strong>
                      <p className="text-muted-foreground">1-2 working days</p>
                    </div>
                    
                    <div>
                      <strong className="text-foreground">BFPO Addresses:</strong>
                      <p className="text-muted-foreground">7-21 days (free shipping)</p>
                    </div>
                    
                    <div>
                      <strong className="text-foreground">International:</strong>
                      <p className="text-muted-foreground">7-21 days depending on destination</p>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full rounded-none border-2" disabled>
                    View Shipping Policy
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Contact Support */}
            <Card className="border-2 border-border rounded-none bg-muted/10">
              <CardHeader>
                <CardTitle className={cn(
                  "font-display tracking-wide uppercase text-center"
                )}>
                  Need Help with Your Order?
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Our customer service team is here to help with any delivery questions or concerns.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Email Support</h4>
                    <p className="text-sm text-muted-foreground">orders@militarytees.co.uk</p>
                    <p className="text-xs text-muted-foreground">Response within 24 hours</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Phone Support</h4>
                    <p className="text-sm text-muted-foreground">+44 1234 567890</p>
                    <p className="text-xs text-muted-foreground">Mon-Fri, 9AM-5PM GMT</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Live Chat</h4>
                    <p className="text-sm text-muted-foreground">Available on website</p>
                    <p className="text-xs text-muted-foreground">Business hours only</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </Layout>
  )
}