import { Metadata } from "next"
import { RotateCcw, Package, CheckCircle, XCircle, Clock, Shield } from "lucide-react"
import { Layout } from "@/components/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Returns & Refunds Policy | Military Tees UK",
  description: "Easy returns and refunds at Military Tees UK. 30-day return policy with full refunds on unused items. Simple process for our military community.",
  robots: {
    index: true,
    follow: true,
  }
}

export default function ReturnsPage() {
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
                <RotateCcw className="h-12 w-12 text-primary mx-auto" />
              </div>
              
              <h1 className={cn(
                "text-4xl md:text-5xl font-display font-bold text-foreground mb-4",
                "tracking-wider uppercase"
              )}>
                Returns &amp; Refunds
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                Mission accomplished or mission refund. We stand behind our quality with a straightforward 30-day return policy.
              </p>
              
              <div className="flex justify-center gap-6 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">30 Days</div>
                  <div className="text-sm text-muted-foreground">Return Window</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">100%</div>
                  <div className="text-sm text-muted-foreground">Money Back</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">Free</div>
                  <div className="text-sm text-muted-foreground">UK Returns</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Returns Content */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Return Policy Overview */}
            <Card className="border-2 border-border rounded-none">
              <CardHeader>
                <CardTitle className={cn(
                  "font-display tracking-wide uppercase flex items-center gap-2"
                )}>
                  <Package className="h-5 w-5 text-primary" />
                  Our Return Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  We want you to be completely satisfied with your Military Tees UK purchase. If you&apos;re not happy with your order for any reason, we offer a comprehensive 30-day return policy.
                </p>
                
                <div className="bg-primary/5 p-4 rounded-none border-l-4 border-primary">
                  <p className="font-medium text-foreground">Quality Guarantee</p>
                  <p className="text-sm">
                    Every item is quality-checked before dispatch. If you receive a defective item, we&apos;ll replace it immediately at no cost to you, regardless of when you purchased it.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* What Can Be Returned */}
            <Card className="border-2 border-border rounded-none">
              <CardHeader>
                <CardTitle className={cn(
                  "font-display tracking-wide uppercase"
                )}>
                  Return Eligibility
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Returnable Items */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold text-foreground">Items We Accept for Return</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-7">
                    <ul className="space-y-2 text-sm list-disc list-inside">
                      <li>Unused items in original condition</li>
                      <li>Items with original tags attached</li>
                      <li>Items returned within 30 days</li>
                      <li>Standard products from our catalog</li>
                    </ul>
                    <ul className="space-y-2 text-sm list-disc list-inside">
                      <li>Items in original packaging</li>
                      <li>Unworn and unwashed clothing</li>
                      <li>Accessories and merchandise</li>
                      <li>Gift purchases (with receipt)</li>
                    </ul>
                  </div>
                </div>

                {/* Non-Returnable Items */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <h3 className="font-semibold text-foreground">Items We Cannot Accept</h3>
                  </div>
                  
                  <div className="ml-7 space-y-3">
                    <div>
                      <h4 className="font-medium text-foreground">Custom &amp; Personalized Items</h4>
                      <p className="text-sm text-muted-foreground">
                        Custom designs, personalized items, and bespoke orders cannot be returned unless they arrive defective or incorrect.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-foreground">Hygiene Items</h4>
                      <p className="text-sm text-muted-foreground">
                        Items that have been worn, washed, or show signs of use for health and hygiene reasons.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-foreground">Final Sale Items</h4>
                      <p className="text-sm text-muted-foreground">
                        Items marked as final sale or clearance cannot be returned (clearly marked at checkout).
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* How to Return */}
            <Card className="border-2 border-border rounded-none">
              <CardHeader>
                <CardTitle className={cn(
                  "font-display tracking-wide uppercase flex items-center gap-2"
                )}>
                  <Clock className="h-5 w-5 text-primary" />
                  How to Return Items
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Return Steps */}
                <div className="space-y-6">
                  {[
                    {
                      step: 1,
                      title: "Request Return Authorization",
                      description: "Contact our customer service team or use our online return portal to request a Return Authorization (RA) number.",
                      details: "Email: info@militarytees.co.uk | Phone: "
                    },
                    {
                      step: 2,
                      title: "Pack Your Items",
                      description: "Carefully pack items in original packaging with tags attached. Include your RA number and original receipt.",
                      details: "Use a sturdy box or padded envelope to prevent damage during transit."
                    },
                    {
                      step: 3,
                      title: "Ship Your Return",
                      description: "Use the prepaid return label (UK only) or send via tracked service. International customers pay return shipping.",
                      details: "Keep tracking information until refund is processed."
                    },
                    {
                      step: 4,
                      title: "Receive Your Refund",
                      description: "Once we receive and inspect your return, refunds are processed within 3-5 business days to your original payment method.",
                      details: "You'll receive email confirmation when your refund is processed."
                    }
                  ].map((step) => (
                    <div key={step.step} className="flex gap-4">
                      <div className={cn(
                        "flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground",
                        "flex items-center justify-center font-bold text-sm rounded-none"
                      )}>
                        {step.step}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                        <p className="text-muted-foreground text-sm mb-2">{step.description}</p>
                        <p className="text-xs text-muted-foreground">{step.details}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Button className="w-full md:w-auto rounded-none" disabled>
                  <Package className="h-4 w-4 mr-2" />
                  Start Return Request
                </Button>
              </CardContent>
            </Card>

            {/* Refund Information */}
            <Card className="border-2 border-border rounded-none">
              <CardHeader>
                <CardTitle className={cn(
                  "font-display tracking-wide uppercase"
                )}>
                  Refund Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-muted-foreground">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Processing Time</h3>
                    <ul className="space-y-2 text-sm list-disc list-inside">
                      <li>Inspection: 1-2 business days</li>
                      <li>Refund processing: 3-5 business days</li>
                      <li>Bank processing: 2-10 business days</li>
                      <li>Total time: 5-15 business days</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Refund Method</h3>
                    <ul className="space-y-2 text-sm list-disc list-inside">
                      <li>Refunded to original payment method</li>
                      <li>Credit card refunds: 3-5 business days</li>
                      <li>PayPal refunds: 1-2 business days</li>
                      <li>Bank transfer: 5-10 business days</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-muted/20 p-4 rounded-none border-l-4 border-primary">
                  <h4 className="font-medium text-foreground">Shipping Costs</h4>
                  <div className="text-sm mt-2 space-y-1">
                    <p><strong>UK Returns:</strong> Free return shipping with prepaid label</p>
                    <p><strong>International Returns:</strong> Customer pays return shipping costs</p>
                    <p><strong>Defective Items:</strong> We cover all return costs</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Exchanges */}
            <Card className="border-2 border-border rounded-none">
              <CardHeader>
                <CardTitle className={cn(
                  "font-display tracking-wide uppercase"
                )}>
                  Exchanges
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  We offer exchanges for size or color within 30 days of purchase. The fastest way to ensure you get the item you want is to return the unwanted item and place a new order for the replacement.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-muted/20 p-3 rounded-none">
                    <h4 className="font-medium text-foreground mb-2">Size Exchanges</h4>
                    <p className="text-sm">
                      Free size exchanges within the UK. Original item must be unworn with tags attached.
                    </p>
                  </div>
                  
                  <div className="bg-muted/20 p-3 rounded-none">
                    <h4 className="font-medium text-foreground mb-2">Color/Style Exchanges</h4>
                    <p className="text-sm">
                      Subject to availability. Price differences will be charged or refunded accordingly.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Military Community */}
            <Card className="border-2 border-border rounded-none bg-primary/5">
              <CardHeader>
                <CardTitle className={cn(
                  "font-display tracking-wide uppercase flex items-center gap-2"
                )}>
                  <Shield className="h-5 w-5 text-primary" />
                  Special Considerations for Military Personnel
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  We understand the unique challenges faced by serving military personnel and offer special accommodations:
                </p>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-foreground">Extended Return Window</h4>
                    <p className="text-sm text-muted-foreground">
                      Personnel on deployment may request extended return windows. Contact us with your service details.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-foreground">BFPO Returns</h4>
                    <p className="text-sm text-muted-foreground">
                      Free return shipping for BFPO addresses. Use the special BFPO return process.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-foreground">Deployment Holds</h4>
                    <p className="text-sm text-muted-foreground">
                      We can hold orders or delay shipping for deployment dates. Contact us to arrange.
                    </p>
                  </div>
                </div>
                
                <Button variant="outline" className="rounded-none border-2">
                  <Shield className="h-4 w-4 mr-2" />
                  Military Support Contact
                </Button>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="border-2 border-border rounded-none bg-muted/10">
              <CardHeader>
                <CardTitle className={cn(
                  "font-display tracking-wide uppercase"
                )}>
                  Returns Support
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Our customer service team is here to make your return process as smooth as possible.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 text-sm">
                    <div><strong>Returns Email:</strong> info@militarytees.co.uk</div>
                    <div><strong>General Support:</strong> info@militarytees.co.uk</div>
                    <div><strong>Website:</strong> militarytees.co.uk/contact</div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div><strong>Hours:</strong> Mon-Fri, 9:00 AM - 5:00 PM GMT</div>
                    <div><strong>Response Time:</strong> Within 24 hours</div>
                    <div><strong>Weekend:</strong> Email support available</div>
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  Please have your order number ready when contacting us. You can find this in your order confirmation email.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </Layout>
  )
}