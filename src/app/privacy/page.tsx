import { Metadata } from "next"
import Link from "next/link"
import { Shield, Eye, Lock, Database, UserCheck } from "lucide-react"
import { Layout } from "@/components/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Privacy Policy | Military Tees UK",
  description: "Learn how Military Tees UK protects your privacy and handles your personal data. GDPR compliant privacy policy for our military community.",
  robots: {
    index: true,
    follow: true,
  }
}

export default function PrivacyPage() {
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
                <Shield className="h-12 w-12 text-primary mx-auto" />
              </div>
              
              <h1 className={cn(
                "text-4xl md:text-5xl font-display font-bold text-foreground mb-4",
                "tracking-wider uppercase"
              )}>
                Privacy Policy
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                Your privacy is our mission. We protect your personal information with military-grade security and transparency.
              </p>
              
              <p className="text-sm text-muted-foreground mt-4">
                <strong>Last updated:</strong> January 2024 | <strong>GDPR Compliant</strong>
              </p>
            </div>
          </div>
        </section>

        {/* Privacy Content */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Introduction */}
            <Card className="border-2 border-border rounded-none">
              <CardHeader>
                <CardTitle className={cn(
                  "font-display tracking-wide uppercase flex items-center gap-2"
                )}>
                  <UserCheck className="h-5 w-5 text-primary" />
                  Your Privacy Rights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  Military Tees UK (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
                </p>
                <div className="bg-primary/5 p-4 rounded-none border-l-4 border-primary">
                  <p className="font-medium text-foreground">GDPR Compliance</p>
                  <p>We comply with the General Data Protection Regulation (GDPR) and UK Data Protection Act 2018, ensuring your rights are respected and protected.</p>
                </div>
              </CardContent>
            </Card>

            {/* Information We Collect */}
            <Card className="border-2 border-border rounded-none">
              <CardHeader>
                <CardTitle className={cn(
                  "font-display tracking-wide uppercase flex items-center gap-2"
                )}>
                  <Database className="h-5 w-5 text-primary" />
                  Information We Collect
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-muted-foreground">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Personal Information You Provide</h4>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Name, email address, phone number</li>
                    <li>Billing and shipping addresses</li>
                    <li>Payment information (processed securely by Stripe)</li>
                    <li>Account preferences and order history</li>
                    <li>Custom design requests and communications</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Information Automatically Collected</h4>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Device information (browser type, operating system)</li>
                    <li>Usage data (pages visited, time spent, interactions)</li>
                    <li>IP address and location data</li>
                    <li>Cookies and similar tracking technologies</li>
                  </ul>
                </div>
                
                <div className="bg-muted/20 p-4 rounded-none">
                  <p className="font-medium text-foreground">Military Community Data</p>
                  <p>If you identify as current or former military personnel, this information is used solely to provide relevant content and offers. We respect and honor your service.</p>
                </div>
              </CardContent>
            </Card>

            {/* How We Use Information */}
            <Card className="border-2 border-border rounded-none">
              <CardHeader>
                <CardTitle className={cn(
                  "font-display tracking-wide uppercase"
                )}>
                  How We Use Your Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground">Service Provision</h4>
                    <ul className="space-y-1 text-sm list-disc list-inside">
                      <li>Process and fulfill orders</li>
                      <li>Manage your account</li>
                      <li>Provide customer support</li>
                      <li>Send order confirmations and updates</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground">Communication</h4>
                    <ul className="space-y-1 text-sm list-disc list-inside">
                      <li>Newsletter and promotional emails</li>
                      <li>Important service announcements</li>
                      <li>Custom design consultations</li>
                      <li>Military community updates</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground">Improvement</h4>
                    <ul className="space-y-1 text-sm list-disc list-inside">
                      <li>Analyze usage patterns</li>
                      <li>Improve our products and services</li>
                      <li>Enhance user experience</li>
                      <li>Develop new features</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground">Legal Compliance</h4>
                    <ul className="space-y-1 text-sm list-disc list-inside">
                      <li>Comply with legal obligations</li>
                      <li>Prevent fraud and abuse</li>
                      <li>Protect our rights and users</li>
                      <li>Respond to legal requests</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Sharing */}
            <Card className="border-2 border-border rounded-none">
              <CardHeader>
                <CardTitle className={cn(
                  "font-display tracking-wide uppercase flex items-center gap-2"
                )}>
                  <Eye className="h-5 w-5 text-primary" />
                  Information Sharing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  We do not sell, trade, or otherwise transfer your personal information to third parties except as described below:
                </p>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-foreground">Service Providers</h4>
                    <p className="text-sm">
                      Trusted partners who help us operate our business (payment processing, shipping, analytics) under strict confidentiality agreements.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-foreground">Legal Requirements</h4>
                    <p className="text-sm">
                      When required by law, court order, or to protect our rights and the safety of others.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-foreground">Business Transfers</h4>
                    <p className="text-sm">
                      In connection with any merger, acquisition, or sale of assets, with appropriate protections in place.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Your Rights (GDPR) */}
            <Card className="border-2 border-border rounded-none bg-primary/5">
              <CardHeader>
                <CardTitle className={cn(
                  "font-display tracking-wide uppercase flex items-center gap-2"
                )}>
                  <Lock className="h-5 w-5 text-primary" />
                  Your Data Rights (GDPR)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Under GDPR, you have the following rights regarding your personal data:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm">
                      <strong className="text-foreground">Right to Access:</strong>
                      <span className="text-muted-foreground"> Request a copy of your data</span>
                    </div>
                    <div className="text-sm">
                      <strong className="text-foreground">Right to Rectification:</strong>
                      <span className="text-muted-foreground"> Correct inaccurate data</span>
                    </div>
                    <div className="text-sm">
                      <strong className="text-foreground">Right to Erasure:</strong>
                      <span className="text-muted-foreground"> Request deletion of your data</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm">
                      <strong className="text-foreground">Right to Portability:</strong>
                      <span className="text-muted-foreground"> Transfer your data</span>
                    </div>
                    <div className="text-sm">
                      <strong className="text-foreground">Right to Object:</strong>
                      <span className="text-muted-foreground"> Stop certain processing</span>
                    </div>
                    <div className="text-sm">
                      <strong className="text-foreground">Right to Restrict:</strong>
                      <span className="text-muted-foreground"> Limit processing of your data</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  To exercise these rights, contact us at <strong className="text-foreground">info@militarytees.co.uk</strong>
                </p>
              </CardContent>
            </Card>

            {/* Data Security */}
            <Card className="border-2 border-border rounded-none">
              <CardHeader>
                <CardTitle className={cn(
                  "font-display tracking-wide uppercase"
                )}>
                  Data Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  We implement appropriate technical and organizational security measures to protect your personal information, including:
                </p>
                
                <ul className="space-y-2 list-disc list-inside">
                  <li>SSL encryption for all data transmissions</li>
                  <li>Secure payment processing through Stripe</li>
                  <li>Regular security audits and updates</li>
                  <li>Limited access to personal data on a need-to-know basis</li>
                  <li>Staff training on data protection</li>
                </ul>
                
                <div className="bg-muted/20 p-4 rounded-none border-l-4 border-primary">
                  <p className="font-medium text-foreground">Military-Grade Security</p>
                  <p>We apply the same discipline and attention to security that defines military operations - your data is protected with honor and integrity.</p>
                </div>
              </CardContent>
            </Card>

            {/* Cookies */}
            <Card className="border-2 border-border rounded-none">
              <CardHeader>
                <CardTitle className={cn(
                  "font-display tracking-wide uppercase"
                )}>
                  Cookies and Tracking
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  We use cookies and similar technologies to enhance your experience. For detailed information, please see our <Link href="/cookies" className="text-primary hover:underline">Cookie Policy</Link>.
                </p>
                
                <p className="text-sm">
                  You can control cookies through your browser settings, but some features may not function properly if disabled.
                </p>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="border-2 border-border rounded-none bg-muted/10">
              <CardHeader>
                <CardTitle className={cn(
                  "font-display tracking-wide uppercase"
                )}>
                  Contact Our Data Protection Officer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  For any privacy-related questions or concerns, contact our Data Protection Officer:
                </p>
                
                <div className="space-y-2 text-sm">
                  <div><strong>Email:</strong> info@militarytees.co.uk</div>
                  <div><strong>Website:</strong> militarytees.co.uk/contact</div>
                  <div><strong>Address:</strong> Data Protection Officer, Military Tees UK, United Kingdom</div>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  You also have the right to lodge a complaint with the Information Commissioner&apos;s Office (ICO) if you believe we have not handled your data properly.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </Layout>
  )
}