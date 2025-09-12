import { Metadata } from "next"
import { Truck, Clock, MapPin, Package, Shield, Plane } from "lucide-react"
import { Layout } from "@/components/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Shipping Policy | Military Tees UK",
  description: "Learn about Military Tees UK shipping options, delivery times, and costs. Fast, reliable delivery across the UK and internationally.",
  robots: {
    index: true,
    follow: true,
  }
}

export default function ShippingPage() {
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
                Shipping Policy
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                Mission-critical delivery. Fast, secure, and reliable shipping to get your military gear to you with precision timing.
              </p>
              
              <p className="text-sm text-muted-foreground mt-4">
                <strong>Last updated:</strong> January 2024
              </p>
            </div>
          </div>
        </section>

        {/* Shipping Content */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* UK Shipping */}
            <Card className="border-2 border-border rounded-none">
              <CardHeader>
                <CardTitle className={cn(
                  "font-display tracking-wide uppercase flex items-center gap-2"
                )}>
                  <MapPin className="h-5 w-5 text-primary" />
                  UK Shipping Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Free Standard Shipping */}
                <div className="bg-primary/5 p-4 rounded-none border-l-4 border-primary">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-foreground">Free Standard Shipping</h3>
                    <Badge className="rounded-none bg-green-600 hover:bg-green-700">
                      FREE
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-foreground">Delivery Time</p>
                      <p className="text-muted-foreground">3-5 working days</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Minimum Order</p>
                      <p className="text-muted-foreground">£50.00</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Tracking</p>
                      <p className="text-muted-foreground">Yes, via email &amp; SMS</p>
                    </div>
                  </div>
                </div>

                {/* Standard Shipping */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border-2 border-border p-4 rounded-none">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-foreground">Standard Delivery</h3>
                      <span className="font-bold text-primary">£4.99</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Delivery Time:</span>
                        <span className="text-foreground">3-5 working days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tracking:</span>
                        <span className="text-foreground">Full tracking</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-2 border-border p-4 rounded-none">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-foreground">Express Delivery</h3>
                      <span className="font-bold text-primary">£9.99</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Delivery Time:</span>
                        <span className="text-foreground">1-2 working days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tracking:</span>
                        <span className="text-foreground">Premium tracking</span>
                      </div>
                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* International Shipping */}
            <Card className="border-2 border-border rounded-none">
              <CardHeader>
                <CardTitle className={cn(
                  "font-display tracking-wide uppercase flex items-center gap-2"
                )}>
                  <Plane className="h-5 w-5 text-primary" />
                  International Shipping
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground">
                  We proudly ship our military heritage worldwide to serve our global military community.
                </p>

                {/* Europe */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Europe</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-border p-3 rounded-none">
                      <h4 className="font-medium text-foreground mb-2">Standard International</h4>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Cost:</span>
                          <span className="text-foreground">£12.99</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Time:</span>
                          <span className="text-foreground">7-14 working days</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border border-border p-3 rounded-none">
                      <h4 className="font-medium text-foreground mb-2">Express International</h4>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Cost:</span>
                          <span className="text-foreground">£24.99</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Time:</span>
                          <span className="text-foreground">3-7 working days</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rest of World */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Rest of World</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-border p-3 rounded-none">
                      <h4 className="font-medium text-foreground mb-2">Standard Worldwide</h4>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Cost:</span>
                          <span className="text-foreground">£19.99</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Time:</span>
                          <span className="text-foreground">10-21 working days</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border border-border p-3 rounded-none">
                      <h4 className="font-medium text-foreground mb-2">Express Worldwide</h4>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Cost:</span>
                          <span className="text-foreground">£34.99</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Time:</span>
                          <span className="text-foreground">5-10 working days</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/20 p-4 rounded-none border-l-4 border-primary">
                  <p className="font-medium text-foreground">International Customers Note</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Customs duties, taxes, and fees may apply and are the responsibility of the recipient. Delivery times may vary due to customs processing.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Processing Time */}
            <Card className="border-2 border-border rounded-none">
              <CardHeader>
                <CardTitle className={cn(
                  "font-display tracking-wide uppercase flex items-center gap-2"
                )}>
                  <Package className="h-5 w-5 text-primary" />
                  Processing &amp; Handling
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Standard Orders</h3>
                    <ul className="space-y-2 text-sm list-disc list-inside">
                      <li>Processed within 1-2 business days</li>
                      <li>Packed with military precision</li>
                      <li>Quality checked before dispatch</li>
                      <li>Tracking details sent via email</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Custom Orders</h3>
                    <ul className="space-y-2 text-sm list-disc list-inside">
                      <li>Processing time: 5-10 business days</li>
                      <li>Design approval required before production</li>
                      <li>Rush orders available (additional cost)</li>
                      <li>Updates provided throughout process</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Military Addresses */}
            <Card className="border-2 border-border rounded-none bg-primary/5">
              <CardHeader>
                <CardTitle className={cn(
                  "font-display tracking-wide uppercase flex items-center gap-2"
                )}>
                  <Shield className="h-5 w-5 text-primary" />
                  Military Addresses &amp; BFPO
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  We proudly support serving personnel with special delivery options for military addresses.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground">BFPO Addresses</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Free shipping to BFPO addresses</li>
                      <li>Standard processing time: 2-3 days</li>
                      <li>Delivery time: 7-21 days (varies by location)</li>
                      <li>No customs charges on BFPO deliveries</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground">Base Addresses</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Special handling for military bases</li>
                      <li>Security clearance requirements noted</li>
                      <li>Alternative contact details requested</li>
                      <li>Flexible delivery arrangements</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-muted/30 p-3 rounded-none">
                  <p className="text-sm">
                    <strong className="text-foreground">Serving Personnel:</strong> Contact us for special delivery arrangements or if you have specific requirements for your location.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Information */}
            <Card className="border-2 border-border rounded-none">
              <CardHeader>
                <CardTitle className={cn(
                  "font-display tracking-wide uppercase"
                )}>
                  Delivery Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-muted-foreground">
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">What to Expect</h3>
                  <ul className="space-y-2 list-disc list-inside text-sm">
                    <li>Email confirmation when your order is dispatched</li>
                    <li>Tracking number provided for all shipments</li>
                    <li>SMS updates for UK deliveries (optional)</li>
                    <li>Safe place delivery options available</li>
                    <li>Re-delivery options if you&apos;re not home</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Delivery Attempts</h3>
                  <p className="text-sm">
                    Our couriers will attempt delivery up to 3 times. If unsuccessful, packages will be held at the local depot for 7-10 days before being returned to us.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Address Accuracy</h3>
                  <p className="text-sm">
                    Please ensure your delivery address is complete and accurate. We are not responsible for delays or non-delivery due to incorrect address information.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="border-2 border-border rounded-none bg-muted/10">
              <CardHeader>
                <CardTitle className={cn(
                  "font-display tracking-wide uppercase"
                )}>
                  Shipping Questions?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Our logistics team is here to help with any shipping questions or special requirements.
                </p>
                
                <div className="space-y-2 text-sm">
                  <div><strong>Email:</strong> info@militarytees.co.uk</div>
                  <div><strong>Website:</strong> militarytees.co.uk/contact</div>
                  <div><strong>Hours:</strong> Monday - Friday, 9:00 AM - 5:00 PM GMT</div>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  For order tracking, please have your order number ready. You can also track your order online using the link provided in your dispatch email.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </Layout>
  )
}