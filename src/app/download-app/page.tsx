import { Layout } from "@/components/layout/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Smartphone, Download, Star, Zap, Shield, Bell } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Download App - Military Tees UK",
  description: "Download the Military Tees UK mobile app for exclusive offers, faster checkout, and early access to new products.",
  openGraph: {
    title: "Download App - Military Tees UK",
    description: "Download the Military Tees UK mobile app for exclusive offers, faster checkout, and early access to new products.",
    type: "website",
  },
}

export default function DownloadAppPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-muted/20 to-background">
        
        {/* Header Section */}
        <section className="py-16 border-b-2 border-border">
          <div className="container mx-auto px-4 text-center">
            <Badge className="rounded-none bg-blue-600 text-white mb-4">
              📱 MOBILE COMMAND CENTER
            </Badge>
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-wider uppercase text-foreground mb-4">
              Military Tees UK App
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Take Military Tees UK with you wherever you deploy. Exclusive mobile features for the dedicated soldier.
            </p>
          </div>
        </section>

        {/* App Coming Soon */}
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-2xl mx-auto">
              <div className="bg-primary/10 p-8 border-2 border-primary mb-8">
                <Smartphone className="h-16 w-16 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-display font-bold mb-4">
                  Mobile App Coming Soon
                </h2>
                <p className="text-muted-foreground mb-6">
                  We're currently developing our mobile command center. Join the waiting list to be notified when it's ready for deployment.
                </p>
                <Button 
                  className="rounded-none font-display font-bold tracking-wide uppercase"
                  size="lg"
                >
                  Join Waiting List
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* App Features */}
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-display font-bold text-center mb-12">
              Planned Mobile Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              
              <Card className="border-2 border-border rounded-none">
                <CardHeader className="text-center">
                  <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle className="font-display font-bold">Quick Checkout</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center">
                    One-tap ordering with saved payment methods and addresses. Deploy your order in seconds.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-border rounded-none">
                <CardHeader className="text-center">
                  <Bell className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle className="font-display font-bold">Push Notifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center">
                    First alert on new arrivals, exclusive sales, and order updates. Stay mission-ready.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-border rounded-none">
                <CardHeader className="text-center">
                  <Star className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle className="font-display font-bold">Exclusive Offers</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center">
                    Mobile-only discounts and early access to limited edition military designs.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-border rounded-none">
                <CardHeader className="text-center">
                  <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle className="font-display font-bold">Secure Payments</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center">
                    Military-grade security with biometric authentication and encrypted transactions.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-border rounded-none">
                <CardHeader className="text-center">
                  <Download className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle className="font-display font-bold">Offline Mode</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center">
                    Browse catalog offline and sync orders when connection is restored. Always prepared.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-border rounded-none">
                <CardHeader className="text-center">
                  <Smartphone className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle className="font-display font-bold">Size Scanner</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center">
                    AI-powered size recommendation using your phone's camera. Perfect fit guaranteed.
                  </p>
                </CardContent>
              </Card>

            </div>
          </div>
        </section>

        {/* Current Mobile Experience */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-display font-bold mb-6">
                Meanwhile, Use Our Mobile-Optimized Site
              </h2>
              <p className="text-muted-foreground mb-8">
                Our website is fully optimized for mobile devices. You can shop, track orders, and manage your account on any device.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  asChild
                  className="rounded-none font-display font-bold tracking-wide uppercase"
                  size="lg"
                >
                  <Link href="/categories">
                    Browse Products
                  </Link>
                </Button>
                <Button 
                  variant="outline"
                  asChild
                  className="rounded-none border-2 font-display font-bold tracking-wide uppercase"
                  size="lg"
                >
                  <Link href="/account">
                    Manage Account
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="py-16 bg-gradient-to-r from-primary to-secondary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-display font-bold mb-4">
              Ready for Mobile Deployment?
            </h2>
            <p className="text-xl opacity-90 mb-8">
              Be the first to know when our mobile app launches
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 text-foreground bg-background border-2 border-transparent rounded-none"
              />
              <Button 
                variant="secondary"
                className="bg-background text-foreground hover:bg-background/90 rounded-none font-display font-bold tracking-wide uppercase"
              >
                Notify Me
              </Button>
            </div>
          </div>
        </section>

      </div>
    </Layout>
  )
}