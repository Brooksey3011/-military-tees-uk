import { Metadata } from "next"
import { Cookie, Settings, BarChart3, Target, Shield } from "lucide-react"
import { Layout } from "@/components/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Cookie Policy | Military Tees UK",
  description: "Learn about how Military Tees UK uses cookies and similar technologies to improve your browsing experience and provide better service.",
  robots: {
    index: true,
    follow: true,
  }
}

export default function CookiesPage() {
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
                <Cookie className="h-12 w-12 text-primary mx-auto" />
              </div>
              
              <h1 className={cn(
                "text-4xl md:text-5xl font-display font-bold text-foreground mb-4",
                "tracking-wider uppercase"
              )}>
                Cookie Policy
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                Understanding how we use cookies and similar technologies to enhance your experience on Military Tees UK.
              </p>
              
              <p className="text-sm text-muted-foreground mt-4">
                <strong>Last updated:</strong> January 2024 | <strong>GDPR Compliant</strong>
              </p>
            </div>
          </div>
        </section>

        {/* Cookie Content */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* What Are Cookies */}
            <Card className="border-2 border-border rounded-none">
              <CardHeader>
                <CardTitle className={cn(
                  "font-display tracking-wide uppercase flex items-center gap-2"
                )}>
                  <Cookie className="h-5 w-5 text-primary" />
                  What Are Cookies?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  Cookies are small text files that are placed on your device (computer, tablet, or mobile) when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our site.
                </p>
                <div className="bg-primary/5 p-4 rounded-none border-l-4 border-primary">
                  <p className="font-medium text-foreground">Military Precision</p>
                  <p>Like military intelligence, cookies help us understand our mission - delivering the best possible service to our military community.</p>
                </div>
              </CardContent>
            </Card>

            {/* Types of Cookies */}
            <Card className="border-2 border-border rounded-none">
              <CardHeader>
                <CardTitle className={cn(
                  "font-display tracking-wide uppercase"
                )}>
                  Types of Cookies We Use
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Essential Cookies */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Badge className="rounded-none bg-red-600 hover:bg-red-700">
                      ESSENTIAL
                    </Badge>
                    <h3 className="font-semibold text-foreground">Essential Cookies</h3>
                  </div>
                  <p className="text-muted-foreground">
                    These cookies are necessary for the website to function and cannot be switched off. They enable core functionality like security, network management, and accessibility.
                  </p>
                  <div className="bg-muted/20 p-3 rounded-none">
                    <p className="text-sm"><strong>Examples:</strong> Session management, shopping cart, authentication, security preferences</p>
                    <p className="text-sm text-muted-foreground"><strong>Retention:</strong> Session or up to 30 days</p>
                  </div>
                </div>

                {/* Functional Cookies */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="rounded-none">
                      FUNCTIONAL
                    </Badge>
                    <h3 className="font-semibold text-foreground">Functional Cookies</h3>
                  </div>
                  <p className="text-muted-foreground">
                    These cookies enhance functionality and personalization, such as remembering your preferences, language settings, and region.
                  </p>
                  <div className="bg-muted/20 p-3 rounded-none">
                    <p className="text-sm"><strong>Examples:</strong> Language preferences, recent searches, account settings, size preferences</p>
                    <p className="text-sm text-muted-foreground"><strong>Retention:</strong> Up to 1 year</p>
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="rounded-none">
                      ANALYTICS
                    </Badge>
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      Analytics Cookies
                      <BarChart3 className="h-4 w-4 text-primary" />
                    </h3>
                  </div>
                  <p className="text-muted-foreground">
                    We use Plausible Analytics (privacy-focused) to understand how visitors use our website. This helps us improve our service and user experience.
                  </p>
                  <div className="bg-muted/20 p-3 rounded-none">
                    <p className="text-sm"><strong>Data collected:</strong> Pages visited, time spent, referral sources, device type</p>
                    <p className="text-sm text-muted-foreground"><strong>Retention:</strong> Up to 2 years</p>
                    <p className="text-sm text-green-600"><strong>Privacy:</strong> No personal data collected, GDPR compliant</p>
                  </div>
                </div>

                {/* Marketing Cookies */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="rounded-none">
                      MARKETING
                    </Badge>
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      Marketing Cookies
                      <Target className="h-4 w-4 text-primary" />
                    </h3>
                  </div>
                  <p className="text-muted-foreground">
                    Used to track visitors across websites to display relevant advertisements and measure campaign effectiveness. You can opt out of these.
                  </p>
                  <div className="bg-muted/20 p-3 rounded-none">
                    <p className="text-sm"><strong>Purpose:</strong> Targeted advertising, campaign tracking, social media integration</p>
                    <p className="text-sm text-muted-foreground"><strong>Retention:</strong> Up to 2 years</p>
                    <p className="text-sm text-blue-600"><strong>Control:</strong> Can be disabled in cookie preferences</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Third-Party Cookies */}
            <Card className="border-2 border-border rounded-none">
              <CardHeader>
                <CardTitle className={cn(
                  "font-display tracking-wide uppercase"
                )}>
                  Third-Party Services
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  We use trusted third-party services that may set their own cookies:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground">Stripe (Payment Processing)</h4>
                    <p className="text-sm">Secure payment processing and fraud protection</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground">Supabase (Database)</h4>
                    <p className="text-sm">User authentication and data storage</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground">Plausible Analytics</h4>
                    <p className="text-sm">Privacy-focused website analytics</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground">Email Services</h4>
                    <p className="text-sm">Newsletter and transactional emails</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Managing Cookies */}
            <Card className="border-2 border-border rounded-none bg-primary/5">
              <CardHeader>
                <CardTitle className={cn(
                  "font-display tracking-wide uppercase flex items-center gap-2"
                )}>
                  <Settings className="h-5 w-5 text-primary" />
                  Managing Your Cookie Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground">
                  You have control over how cookies are used on our website:
                </p>
                
                {/* Cookie Consent Banner */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">Cookie Consent Banner</h4>
                  <p className="text-muted-foreground text-sm">
                    When you first visit our site, you&apos;ll see a cookie consent banner where you can choose which types of cookies to accept.
                  </p>
                  <Button variant="outline" className="rounded-none border-2" disabled>
                    <Settings className="h-4 w-4 mr-2" />
                    Update Cookie Preferences
                  </Button>
                </div>

                {/* Browser Settings */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">Browser Settings</h4>
                  <p className="text-muted-foreground text-sm">
                    You can also manage cookies through your browser settings:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside ml-4">
                    <li>Chrome: Settings &gt; Advanced &gt; Privacy and Security &gt; Cookies</li>
                    <li>Firefox: Options &gt; Privacy &amp; Security &gt; Cookies and Site Data</li>
                    <li>Safari: Preferences &gt; Privacy &gt; Cookies and website data</li>
                    <li>Edge: Settings &gt; Cookies and site permissions</li>
                  </ul>
                </div>

                <div className="bg-muted/30 p-4 rounded-none border-l-4 border-primary">
                  <p className="font-medium text-foreground">Impact of Disabling Cookies</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Disabling certain cookies may affect website functionality, such as staying logged in, remembering your cart, or personalized recommendations.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Your Rights */}
            <Card className="border-2 border-border rounded-none">
              <CardHeader>
                <CardTitle className={cn(
                  "font-display tracking-wide uppercase flex items-center gap-2"
                )}>
                  <Shield className="h-5 w-5 text-primary" />
                  Your Rights & Choices
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  Under GDPR and UK privacy laws, you have the right to:
                </p>
                
                <ul className="space-y-2 list-disc list-inside">
                  <li>Know what cookies are being used</li>
                  <li>Choose which cookies to accept or decline</li>
                  <li>Change your cookie preferences at any time</li>
                  <li>Request deletion of cookies and associated data</li>
                  <li>Access information about how your data is processed</li>
                </ul>
                
                <div className="bg-muted/20 p-4 rounded-none">
                  <p className="font-medium text-foreground">Opt-Out Resources</p>
                  <div className="text-sm mt-2 space-y-1">
                    <p>• Network Advertising Initiative: <a href="http://optout.networkadvertising.org/" className="text-primary hover:underline" target="_blank" rel="noopener">optout.networkadvertising.org</a></p>
                    <p>• Digital Advertising Alliance: <a href="http://optout.aboutads.info/" className="text-primary hover:underline" target="_blank" rel="noopener">optout.aboutads.info</a></p>
                    <p>• European Interactive Digital Advertising Alliance: <a href="http://youronlinechoices.eu/" className="text-primary hover:underline" target="_blank" rel="noopener">youronlinechoices.eu</a></p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="border-2 border-border rounded-none bg-muted/10">
              <CardHeader>
                <CardTitle className={cn(
                  "font-display tracking-wide uppercase"
                )}>
                  Questions About Cookies?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  If you have questions about our use of cookies, please contact us:
                </p>
                
                <div className="space-y-2 text-sm">
                  <div><strong>Email:</strong> info@militarytees.co.uk</div>
                  <div><strong>Subject Line:</strong> Cookie Policy Inquiry</div>
                  <div><strong>Website:</strong> militarytees.co.uk/contact</div>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  This Cookie Policy may be updated periodically. We will notify you of any significant changes through our website or email.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </Layout>
  )
}