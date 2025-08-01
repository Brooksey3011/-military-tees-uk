import Link from "next/link"
import { Layout } from "@/components/layout/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PromotionalBanner } from "@/components/ui/promotional-banner"
import { ReviewShowcase } from "@/components/reviews/review-showcase"
import { PaymentOptions } from "@/components/ui/payment-options"
import { Shield, Star, Truck, Award, Users, Check } from "lucide-react"

export default function Home() {
  return (
    <Layout>
      <div className="min-h-screen">

        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-muted/20 to-background py-8 border-b-2 border-border overflow-hidden">
          {/* Background Logo */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none py-4">
            <img 
              src="/logowhite.png" 
              alt="Military Tees UK Background Logo" 
              className="w-[500px] h-auto md:w-[700px] lg:w-[800px] opacity-15 object-contain select-none"
            />
          </div>
          
          {/* Hero Content */}
          <div className="container mx-auto px-4 text-center relative z-10 flex flex-col justify-center" style={{minHeight: '500px'}}>
            {/* Centered H1 in logo area */}
            <div className="flex flex-col items-center justify-center mb-8">
              <h1 className="text-4xl md:text-6xl font-display font-bold tracking-wider uppercase text-foreground mb-6">
                Military Tees UK
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto font-display tracking-wide">
                Proudly serving those who serve
              </p>
            </div>
            
            {/* Buttons positioned below logo */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="rounded-none font-display font-bold tracking-wide uppercase" asChild>
                <Link href="/categories">
                  Browse Categories
                </Link>
              </Button>
              <Button size="lg" className="rounded-none font-display font-bold tracking-wide uppercase" asChild>
                <Link href="/custom">
                  Custom Orders
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* New Arrivals Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge className="bg-primary text-primary-foreground font-bold mb-4">
                🆕 FRESH STOCK
              </Badge>
              <h2 className="text-3xl font-display font-bold mb-4">
                Latest Arrivals
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                The newest additions to our military heritage collection. Premium quality designs inspired by British Armed Forces tradition.
              </p>
            </div>
            
            <div className="text-center">
              <Button 
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-wide"
                asChild
              >
                <Link href="/new-arrivals">
                  View New Arrivals
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Why Choose Us - Complementing About Page */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-display font-bold mb-6">
              Why Choose Military Tees UK?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
              <strong className="text-foreground">FOUNDED BY SERVING MILITARY, FOR THE MILITARY COMMUNITY:</strong> Authentic 
              military-themed gear with outstanding service. Every design honours military heritage.
            </p>
            
            {/* Enhanced Guarantees & Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex flex-col items-center space-y-3 p-6 border border-border rounded-sm hover:border-primary transition-colors">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <Check className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="font-bold text-sm uppercase tracking-wide">30-Day Returns</span>
                <span className="text-xs text-muted-foreground text-center">No questions asked money back guarantee</span>
              </div>
              <div className="flex flex-col items-center space-y-3 p-6 border border-border rounded-sm hover:border-primary transition-colors">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <Award className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="font-bold text-sm uppercase tracking-wide">Premium Quality</span>
                <span className="text-xs text-muted-foreground text-center">Military-grade materials and printing</span>
              </div>
              <div className="flex flex-col items-center space-y-3 p-6 border border-border rounded-sm hover:border-primary transition-colors">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <Truck className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="font-bold text-sm uppercase tracking-wide">Fast Shipping</span>
                <span className="text-xs text-muted-foreground text-center">Free UK delivery on orders over £50</span>
              </div>
              <div className="flex flex-col items-center space-y-3 p-6 border border-border rounded-sm hover:border-primary transition-colors">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="font-bold text-sm uppercase tracking-wide">Community</span>
                <span className="text-xs text-muted-foreground text-center">Supporting military personnel and families</span>
              </div>
            </div>
            
            {/* Link to About page */}
            <div className="mt-8">
              <Button variant="outline" size="lg" className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-bold uppercase tracking-wide" asChild>
                <Link href="/about">
                  Learn Our Story
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Payment Options & Trust */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <PaymentOptions variant="grid" showSecurity={true} />
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-gradient-to-r from-primary to-secondary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-display font-bold mb-4">
              Ready to Join the Ranks?
            </h2>
            <p className="text-xl opacity-90 mb-8">
              Browse our collection of premium military-themed apparel
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="secondary" 
                size="lg"
                className="bg-background text-foreground hover:bg-background/90 font-bold uppercase tracking-wide"
                asChild
              >
                <Link href="/categories">
                  Shop All Categories
                </Link>
              </Button>
              <Button 
                variant="secondary" 
                size="lg"
                className="bg-background text-foreground hover:bg-background/90 font-bold uppercase tracking-wide"
                asChild
              >
                <Link href="/custom">
                  Custom Orders
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
}