import { Metadata } from "next"
import Link from "next/link"
import { Truck, Clock, MapPin, Package, Shield, CheckCircle, AlertCircle } from "lucide-react"
import { Layout } from "@/components/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Delivery Information | Military Tees UK",
  description: "Everything you need to know about Military Tees UK deliveries. Delivery options, times, costs, and special services for military personnel.",
  robots: {
    index: true,
    follow: true,
  }
}

export default function DeliveryPage() {
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
                <Truck className="h-12 w-12 text-primary mx-auto" />
              </div>
              
              <h1 className={cn(
                "text-4xl md:text-5xl font-display font-bold text-foreground mb-4",
                "tracking-wider uppercase"
              )}>
                Delivery Information
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                Mission-critical delivery services. Fast, reliable, and secure delivery for our military community worldwide.
              </p>
            </div>
          </div>
        </section>

        {/* Delivery Content */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* Quick Delivery Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <Card className="border-2 border-border rounded-none">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-600/10 rounded-none border-2 border-green-600 flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <CardTitle className={cn("font-display tracking-wide uppercase text-green-600")}>
                    Standard Free
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-3">
                  <div>
                    <p className="text-2xl font-bold text-foreground">3-5 Days</p>
                    <p className="text-sm text-muted-foreground">Working Days</p>
                  </div>
                  <Badge className="rounded-none bg-green-600 hover:bg-green-700">
                    FREE OVER £50
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Perfect for regular orders with no rush
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-border rounded-none">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-blue-600/10 rounded-none border-2 border-blue-600 flex items-center justify-center">
                    <Clock className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className={cn("font-display tracking-wide uppercase text-blue-600")}>
                    Express
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-3">
                  <div>
                    <p className="text-2xl font-bold text-foreground">1-2 Days</p>
                    <p className="text-sm text-muted-foreground">Working Days</p>
                  </div>
                  <Badge variant="outline" className="rounded-none border-blue-600 text-blue-600">
                    £9.99
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    When you need it quickly
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-border rounded-none">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-none border-2 border-primary flex items-center justify-center">
                    <Package className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className={cn("font-display tracking-wide uppercase text-primary")}>
                    Next Day
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-3">
                  <div>
                    <p className="text-2xl font-bold text-foreground">Before 1PM</p>
                    <p className="text-sm text-muted-foreground">Next Working Day</p>
                  </div>
                  <Badge variant="outline" className="rounded-none border-primary text-primary">
                    £14.99
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    For urgent requirements
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Delivery Areas */}
            <Card className="border-2 border-border rounded-none">
              <CardHeader>
                <CardTitle className={cn(
                  "font-display tracking-wide uppercase flex items-center gap-2"
                )}>
                  <MapPin className="h-5 w-5 text-primary" />
                  Delivery Coverage
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div>
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    UK Mainland
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                    <li>England, Scotland, Wales</li>
                    <li>All delivery options available</li>
                    <li>Free standard delivery over £50</li>
                    <li>Same-day available in select areas</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Northern Ireland
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                    <li>Standard and express delivery</li>
                    <li>2-7 working days</li>
                    <li>No additional charges</li>
                    <li>Tracking included</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Offshore Islands
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                    <li>Isle of Man, Channel Islands</li>
                    <li>Scottish Highlands & Islands</li>
                    <li>Extended delivery times</li>
                    <li>Special arrangements available</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Military Specific */}
            <Card className="border-2 border-border rounded-none bg-primary/5">
              <CardHeader>
                <CardTitle className={cn(
                  "font-display tracking-wide uppercase flex items-center gap-2"
                )}>
                  <Shield className="h-5 w-5 text-primary" />
                  Military & BFPO Delivery
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">BFPO Addresses</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                    <li>Free shipping to all BFPO addresses</li>
                    <li>7-21 working days delivery time</li>
                    <li>No customs charges on BFPO deliveries</li>
                    <li>Special handling for operational security</li>
                  </ul>
                  
                  <div className="bg-muted/30 p-3 rounded-none">
                    <p className="text-sm font-medium text-foreground">Example BFPO Format:</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      Rank FirstName LastName<br />
                      Unit Name<br />
                      Operation/Base Name<br />
                      BFPO XXX
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Military Base Delivery</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                    <li>Special security clearance procedures</li>
                    <li>Alternative contact details required</li>
                    <li>Flexible delivery time windows</li>
                    <li>Coordination with base mail rooms</li>
                  </ul>
                  
                  <Button className="rounded-none" disabled>
                    <Shield className="h-4 w-4 mr-2" />
                    Military Delivery Support
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* What to Expect */}
            <Card className="border-2 border-border rounded-none">
              <CardHeader>
                <CardTitle className={cn(
                  "font-display tracking-wide uppercase"
                )}>
                  What to Expect on Delivery Day
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Before Delivery
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                      <li>Email notification when dispatched</li>
                      <li>Tracking number provided</li>
                      <li>SMS updates for UK deliveries (optional)</li>
                      <li>Estimated delivery window</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <Truck className="h-4 w-4 text-blue-600" />
                      On Delivery Day
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                      <li>Morning of delivery notification</li>
                      <li>1-2 hour delivery window (express/next day)</li>
                      <li>Safe place delivery option</li>
                      <li>Signature required for high-value items</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-muted/20 p-4 rounded-none border-l-4 border-primary">
                  <h4 className="font-medium text-foreground flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-primary" />
                    Delivery Attempts
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Our carriers will attempt delivery up to 3 times. If unsuccessful, packages are held at the local depot for 7-10 days before being returned to us. You'll receive notifications for each attempt and collection instructions.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Special Circumstances */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <Card className="border-2 border-border rounded-none">
                <CardHeader>
                  <CardTitle className={cn(
                    "font-display tracking-wide uppercase"
                  )}>
                    Special Delivery Requests
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 text-sm">
                    <div>
                      <strong className="text-foreground">Deployment Coordination:</strong>
                      <p className="text-muted-foreground">We can hold orders or coordinate delivery timing for deployment dates.</p>
                    </div>
                    
                    <div>
                      <strong className="text-foreground">Safe Place Delivery:</strong>
                      <p className="text-muted-foreground">Specify a secure location for packages when you're not available.</p>
                    </div>
                    
                    <div>
                      <strong className="text-foreground">Neighbour Delivery:</strong>
                      <p className="text-muted-foreground">Authorize delivery to a trusted neighbour in your absence.</p>
                    </div>
                    
                    <div>
                      <strong className="text-foreground">Collection Points:</strong>
                      <p className="text-muted-foreground">Deliver to local pickup points for convenience.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-border rounded-none bg-muted/10">
                <CardHeader>
                  <CardTitle className={cn(
                    "font-display tracking-wide uppercase"
                  )}>
                    Delivery Issues?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground text-sm">
                    If you experience any delivery issues, we're here to help resolve them quickly.
                  </p>
                  
                  <div className="space-y-2 text-sm">
                    <div><strong className="text-foreground">Delivery Support:</strong> info@militarytees.co.uk</div>
                    <div><strong className="text-foreground">Phone Support:</strong> +44 1234 567890</div>
                    <div><strong className="text-foreground">Track Order:</strong> <Link href="/track-order" className="text-primary hover:underline">Online Tracking</Link></div>
                  </div>
                  
                  <Button className="w-full rounded-none" disabled>
                    Report Delivery Issue
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Related Links */}
            <Card className="border-2 border-border rounded-none">
              <CardHeader>
                <CardTitle className={cn(
                  "font-display tracking-wide uppercase text-center"
                )}>
                  Related Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="rounded-none border-2 h-auto p-4 flex flex-col" disabled>
                    <Package className="h-8 w-8 mb-2" />
                    <span className="text-sm">Track Order</span>
                  </Button>
                  
                  <Button variant="outline" className="rounded-none border-2 h-auto p-4 flex flex-col" disabled>
                    <Truck className="h-8 w-8 mb-2" />
                    <span className="text-sm">Shipping Policy</span>
                  </Button>
                  
                  <Button variant="outline" className="rounded-none border-2 h-auto p-4 flex flex-col" disabled>
                    <MapPin className="h-8 w-8 mb-2" />
                    <span className="text-sm">International</span>
                  </Button>
                  
                  <Button variant="outline" className="rounded-none border-2 h-auto p-4 flex flex-col" disabled>
                    <Shield className="h-8 w-8 mb-2" />
                    <span className="text-sm">Military Support</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </Layout>
  )
}