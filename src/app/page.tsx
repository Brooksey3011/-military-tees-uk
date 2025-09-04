import Link from "next/link"
import { Metadata } from "next"
import { Layout } from "@/components/layout/layout"
import { Button } from "@/components/ui/button"
import { PromoBanner } from "@/components/ui/promo-banner"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { LatestArrivals } from "@/components/homepage/latest-arrivals"
import { Truck, Award, Shield, Check } from "lucide-react"

export const metadata: Metadata = {
  title: "Military Tees UK | Premium British Army Themed Apparel & Clothing",
  description: "Premium British military-themed t-shirts, hoodies & apparel. Authentic designs inspired by the British Army. Free UK delivery over £50. Shop veterans, memorial & custom military clothing.",
  keywords: [
    "military t-shirts UK", "British Army apparel", "military clothing", "veterans clothing", 
    "army merchandise", "military themed shirts", "British military gear", "army t-shirts",
    "memorial clothing", "custom military designs", "military fashion UK", "army veterans gifts"
  ],
  openGraph: {
    title: "Military Tees UK | Premium British Army Themed Apparel & Clothing",
    description: "Premium British military-themed t-shirts, hoodies & apparel. Authentic designs inspired by the British Army. Free UK delivery over £50.",
    images: ["/og-image.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Military Tees UK | Premium British Army Themed Apparel & Clothing",
    description: "Premium British military-themed t-shirts, hoodies & apparel. Authentic designs inspired by the British Army. Free UK delivery over £50.",
    images: ["/twitter-image.jpg"],
  },
  alternates: {
    canonical: "/",
  },
}

export default function Home() {
  return (
    <Layout>
      {/* Promotional Banner */}
      <PromoBanner />
      
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-muted/20 to-background py-8 border-b-2 border-border overflow-hidden">
          {/* Background Logo */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none py-4">
            <OptimizedImage
              src="/logowhite.png" 
              alt="Military Tees UK Background Logo" 
              width={1200}
              height={800}
              priority={true}
              className="w-[600px] h-auto md:w-[800px] lg:w-[1000px] xl:w-[1200px] opacity-12 object-contain select-none"
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
            
            {/* Single Primary CTA */}
            <div className="flex justify-center">
              <Button size="lg" className="rounded-none font-display font-bold tracking-wide uppercase px-12 py-4 text-lg" asChild>
                <Link href="/categories">
                  Shop Military Apparel
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Latest Arrivals with Product Cards */}
        <LatestArrivals />

        {/* Trust Indicators - Streamlined */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-display font-bold mb-4">
                Military Quality, Guaranteed
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Founded by serving military, for the military community
              </p>
            </div>
            
            {/* Key Trust Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <Award className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="font-bold text-lg uppercase tracking-wide">Premium Quality</h3>
                <p className="text-sm text-muted-foreground">Military-grade materials and professional printing</p>
              </div>
              
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <Truck className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="font-bold text-lg uppercase tracking-wide">Fast & Free Shipping</h3>
                <p className="text-sm text-muted-foreground">Free UK delivery on orders over £50</p>
              </div>
              
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <Shield className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="font-bold text-lg uppercase tracking-wide">30-Day Returns</h3>
                <p className="text-sm text-muted-foreground">No questions asked money back guarantee</p>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Categories */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-display font-bold mb-4">
                Shop by Service
              </h2>
              <p className="text-lg text-muted-foreground">
                Authentic designs for every branch of service
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {/* British Army */}
              <Link href="/categories/british-army" className="group">
                <div className="relative bg-muted/50 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300">
                  <div className="aspect-square p-8 flex items-center justify-center">
                    <h3 className="text-xl font-display font-bold text-center group-hover:text-primary transition-colors">
                      British Army
                    </h3>
                  </div>
                </div>
              </Link>
              
              {/* Royal Navy */}
              <Link href="/categories/royal-navy" className="group">
                <div className="relative bg-muted/50 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300">
                  <div className="aspect-square p-8 flex items-center justify-center">
                    <h3 className="text-xl font-display font-bold text-center group-hover:text-primary transition-colors">
                      Royal Navy
                    </h3>
                  </div>
                </div>
              </Link>
              
              {/* Royal Air Force */}
              <Link href="/categories/royal-air-force" className="group">
                <div className="relative bg-muted/50 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300">
                  <div className="aspect-square p-8 flex items-center justify-center">
                    <h3 className="text-xl font-display font-bold text-center group-hover:text-primary transition-colors">
                      Royal Air Force
                    </h3>
                  </div>
                </div>
              </Link>
              
              {/* Royal Marines */}
              <Link href="/categories/royal-marines" className="group">
                <div className="relative bg-muted/50 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300">
                  <div className="aspect-square p-8 flex items-center justify-center">
                    <h3 className="text-xl font-display font-bold text-center group-hover:text-primary transition-colors">
                      Royal Marines
                    </h3>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-display font-bold mb-4 text-foreground">
              Ready to Serve in Style?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Browse our complete collection of premium military-themed apparel
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button 
                size="lg"
                className="font-bold uppercase tracking-wide px-8"
                asChild
              >
                <Link href="/products">
                  Shop All Products
                </Link>
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="border-2 font-bold uppercase tracking-wide px-8"
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