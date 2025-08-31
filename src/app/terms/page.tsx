import { Metadata } from "next"
import Link from "next/link"
import { FileText, Shield, CheckCircle } from "lucide-react"
import { Layout } from "@/components/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Terms & Conditions | Military Tees UK",
  description: "Read our terms and conditions for purchasing from Military Tees UK. Clear guidelines for using our service and purchasing our military-themed apparel.",
  robots: {
    index: true,
    follow: true,
  }
}

export default function TermsPage() {
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
                <FileText className="h-12 w-12 text-primary mx-auto" />
              </div>
              
              <h1 className={cn(
                "text-4xl md:text-5xl font-display font-bold text-foreground mb-4",
                "tracking-wider uppercase"
              )}>
                Terms & Conditions
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                Clear, fair terms for our military community. These terms govern your use of Military Tees UK services and purchases.
              </p>
              
              <p className="text-sm text-muted-foreground mt-4">
                <strong>Last updated:</strong> January 2024
              </p>
            </div>
          </div>
        </section>

        {/* Terms Content */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Acceptance */}
            <Card className="border-2 border-border rounded-none">
              <CardHeader>
                <CardTitle className={cn(
                  "font-display tracking-wide uppercase flex items-center gap-2"
                )}>
                  <Shield className="h-5 w-5 text-primary" />
                  1. Acceptance of Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  By accessing and using Military Tees UK website and services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
                <p>
                  These terms apply to all visitors, users, customers, and others who access or use our service.
                </p>
              </CardContent>
            </Card>

            {/* Products and Services */}
            <Card className="border-2 border-border rounded-none">
              <CardHeader>
                <CardTitle className={cn(
                  "font-display tracking-wide uppercase flex items-center gap-2"
                )}>
                  <CheckCircle className="h-5 w-5 text-primary" />
                  2. Products and Services
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  Military Tees UK provides military-themed apparel and related merchandise. All products are subject to availability and we reserve the right to discontinue any product at any time.
                </p>
                <p>
                  Product descriptions, images, and specifications are provided for information purposes. While we strive for accuracy, we do not warrant that product descriptions or other content is accurate, complete, reliable, current, or error-free.
                </p>
                <div className="bg-muted/20 p-4 rounded-none border-l-4 border-primary">
                  <p className="font-medium text-foreground">Quality Guarantee</p>
                  <p>All products are subject to our quality standards and are designed to honor military heritage with authentic designs and premium materials.</p>
                </div>
              </CardContent>
            </Card>

            {/* Orders and Payment */}
            <Card className="border-2 border-border rounded-none">
              <CardHeader>
                <CardTitle className={cn(
                  "font-display tracking-wide uppercase"
                )}>
                  3. Orders and Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <h4 className="font-semibold text-foreground">Order Acceptance</h4>
                <p>
                  Your receipt of an electronic or other form of order confirmation does not signify our acceptance of your order, nor does it constitute confirmation of our offer to sell. We reserve the right to refuse or cancel orders for any reason.
                </p>
                
                <h4 className="font-semibold text-foreground">Pricing and Payment</h4>
                <p>
                  All prices are in British Pounds (GBP) and include VAT where applicable. Prices are subject to change without notice. Payment is due at the time of order and processed securely through Stripe.
                </p>
                
                <h4 className="font-semibold text-foreground">Order Modifications</h4>
                <p>
                  Once an order is placed, modifications or cancellations may not be possible if the order has already entered our fulfillment process.
                </p>
              </CardContent>
            </Card>

            {/* Shipping and Delivery */}
            <Card className="border-2 border-border rounded-none">
              <CardHeader>
                <CardTitle className={cn(
                  "font-display tracking-wide uppercase"
                )}>
                  4. Shipping and Delivery
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  Delivery times are estimates and not guaranteed. We are not responsible for delays caused by shipping carriers or customs processes.
                </p>
                <p>
                  Risk of loss and title for products pass to you upon delivery to the shipping carrier. See our <Link href="/shipping" className="text-primary hover:underline">Shipping Policy</Link> for detailed information.
                </p>
              </CardContent>
            </Card>

            {/* Returns and Refunds */}
            <Card className="border-2 border-border rounded-none">
              <CardHeader>
                <CardTitle className={cn(
                  "font-display tracking-wide uppercase"
                )}>
                  5. Returns and Refunds
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  We offer a 30-day return policy for unused items in original condition. Custom or personalized items may not be returnable unless defective.
                </p>
                <p>
                  For complete return information, please see our <Link href="/returns" className="text-primary hover:underline">Returns & Refunds Policy</Link>.
                </p>
              </CardContent>
            </Card>

            {/* Intellectual Property */}
            <Card className="border-2 border-border rounded-none">
              <CardHeader>
                <CardTitle className={cn(
                  "font-display tracking-wide uppercase"
                )}>
                  6. Intellectual Property
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  All content, designs, graphics, logos, and trademarks on this website are the property of Military Tees UK or used with permission. Military insignia and official badges are used respectfully to honor military heritage.
                </p>
                <p>
                  You may not reproduce, distribute, or create derivative works from our content without express written permission.
                </p>
              </CardContent>
            </Card>

            {/* Limitation of Liability */}
            <Card className="border-2 border-border rounded-none">
              <CardHeader>
                <CardTitle className={cn(
                  "font-display tracking-wide uppercase"
                )}>
                  7. Limitation of Liability
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  Military Tees UK shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
                </p>
                <p>
                  Our total liability shall not exceed the amount paid by you for the product or service in question.
                </p>
              </CardContent>
            </Card>

            {/* Governing Law */}
            <Card className="border-2 border-border rounded-none">
              <CardHeader>
                <CardTitle className={cn(
                  "font-display tracking-wide uppercase"
                )}>
                  8. Governing Law
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  These terms shall be interpreted and governed in accordance with the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the English courts.
                </p>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="border-2 border-border rounded-none bg-muted/10">
              <CardHeader>
                <CardTitle className={cn(
                  "font-display tracking-wide uppercase"
                )}>
                  Questions About These Terms?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  If you have any questions about these Terms & Conditions, please contact us:
                </p>
                
                <div className="space-y-2 text-sm">
                  <div><strong>Email:</strong> info@militarytees.co.uk</div>
                  <div><strong>Website:</strong> militarytees.co.uk/contact</div>
                  <div><strong>Address:</strong> Military Tees UK, United Kingdom</div>
                </div>
                
                <p className="text-xs text-muted-foreground mt-4">
                  We reserve the right to update these terms at any time. Changes will be posted on this page with an updated revision date.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </Layout>
  )
}