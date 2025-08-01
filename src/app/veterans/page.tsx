import { Metadata } from "next"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Layout } from "@/components/layout/layout"
import { Medal, Shield, Users, Heart, Award, Star } from "lucide-react"

export const metadata: Metadata = {
  title: "Veterans Collection - Military Tees UK",
  description: "Celebrating those who served - premium veteran pride designs and military-themed apparel for UK veterans and their families.",
  keywords: [
    "veterans",
    "veteran apparel",
    "military veterans",
    "UK veterans",
    "veteran pride",
    "military heritage",
    "served",
    "british veterans"
  ]
}

export default function VeteransPage() {
  const veteranCategories = [
    {
      title: "Veteran Pride",
      description: "Show your service with pride",
      icon: <Medal className="h-8 w-8" />,
      href: "/products?category=veteran-pride"
    },
    {
      title: "Service Branches",
      description: "Army, Navy, RAF, Marines",
      icon: <Shield className="h-8 w-8" />,
      href: "/products?category=service-branches"
    },
    {
      title: "Years of Service",
      description: "Celebrating service milestones",
      icon: <Award className="h-8 w-8" />,
      href: "/products?category=years-service"
    },
    {
      title: "Veteran Family",
      description: "For spouses and families",
      icon: <Heart className="h-8 w-8" />,
      href: "/products?category=veteran-family"
    }
  ]

  const featuredDesigns = [
    "Proud British Veteran",
    "Once a Soldier, Always a Soldier",
    "Served with Honour",
    "Veteran - Earned Not Given",
    "British Forces Veteran",
    "Service Before Self"
  ]

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-muted/20 to-background py-20 border-b-2 border-border">
          <div className="container mx-auto px-4 text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-primary/10 p-4 border-2 border-primary mr-4">
                <img 
                  src="/logowhite.png" 
                  alt="Military Tees UK Logo" 
                  className="h-12 w-12 object-contain"
                />
              </div>
              <div className="text-left">
                <h1 className="text-4xl md:text-6xl font-display font-bold tracking-wider uppercase text-foreground">
                  Veterans Collection
                </h1>
                <p className="text-xl text-muted-foreground font-display tracking-wide">
                  Celebrating Those Who Served
                </p>
              </div>
            </div>
            
            <div className="max-w-3xl mx-auto mb-8">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Honour your service with our premium veteran collection. Designed by veterans, for veterans - 
                celebrating the courage, dedication, and sacrifice of those who served our nation.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="rounded-none font-display font-bold tracking-wide uppercase" asChild>
                <Link href="/products?category=veterans">
                  Shop Veterans Collection
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-none border-2 font-display font-bold tracking-wide uppercase" asChild>
                <Link href="#veteran-categories">
                  Browse Categories
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Veteran Benefits */}
        <section className="py-16 bg-green-600/5">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-2 mb-6">
                <Shield className="h-6 w-6 text-green-600" />
                <h2 className="text-3xl font-display font-bold">
                  Veteran Benefits
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-background p-6 border-2 border-green-600/20 rounded-none">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Medal className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-display font-bold mb-2">10% Military Discount</h3>
                  <p className="text-sm text-muted-foreground">Automatic discount for verified veterans on all orders</p>
                </div>
                
                <div className="bg-background p-6 border-2 border-green-600/20 rounded-none">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-display font-bold mb-2">Veteran Community</h3>
                  <p className="text-sm text-muted-foreground">Connect with fellow veterans and share your stories</p>
                </div>
                
                <div className="bg-background p-6 border-2 border-green-600/20 rounded-none">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-display font-bold mb-2">Priority Service</h3>
                  <p className="text-sm text-muted-foreground">Dedicated customer support for our veteran customers</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Veteran Categories */}
        <section id="veteran-categories" className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-display font-bold mb-4">
                Veteran Categories
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Explore our specialized collections designed to honour different aspects of military service and veteran life.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {veteranCategories.map((category, index) => (
                <Card key={index} className="border-2 border-border rounded-none hover:border-primary transition-colors group">
                  <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 bg-primary/10 border-2 border-primary flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        {category.icon}
                      </div>
                    </div>
                    <CardTitle className="font-display tracking-wide uppercase">
                      {category.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center space-y-4">
                    <p className="text-muted-foreground text-sm mb-6">
                      {category.description}
                    </p>
                    <Button 
                      className="w-full rounded-none font-display font-bold tracking-wide uppercase" 
                      variant="outline"
                      asChild
                    >
                      <Link href={category.href}>
                        View Collection
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Designs */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-display font-bold mb-4">
                Featured Veteran Designs
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our most popular veteran-themed designs, created to honour service and celebrate military heritage.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {featuredDesigns.map((design, index) => (
                <div 
                  key={index}
                  className="bg-background p-4 border border-border rounded-none hover:border-primary transition-colors text-center"
                >
                  <h3 className="font-display font-bold text-sm uppercase tracking-wide">
                    "{design}"
                  </h3>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-8">
              <Button 
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-wide"
                asChild
              >
                <Link href="/products?category=veterans">
                  View All Veteran Designs
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-gradient-to-r from-primary to-secondary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-display font-bold mb-4">
              Proud to Serve, Proud to Wear
            </h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Join thousands of veterans who wear their service with pride. 
              Every purchase supports veteran causes and the military community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="secondary" 
                size="lg"
                className="bg-background text-foreground hover:bg-background/90 font-bold uppercase tracking-wide"
                asChild
              >
                <Link href="/products?category=veterans">
                  Shop Veterans Collection
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-white text-white hover:bg-white hover:text-black font-bold uppercase tracking-wide"
                asChild
              >
                <Link href="/about">
                  Our Veteran Story
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
}