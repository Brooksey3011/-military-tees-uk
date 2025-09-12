import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Layout } from "@/components/layout/layout"
import { Tag, Clock, TrendingDown, Percent, Gift } from "lucide-react"

export const metadata: Metadata = {
  title: "Launch Deals - Military Tees UK",
  description: "Startup launch deals and special offers - premium military-themed clothing with exclusive pricing for early customers.",
  keywords: [
    "military launch deals",
    "startup offers",
    "military apparel deals",
    "launch pricing",
    "early bird discount",
    "military tees deals"
  ]
}

export default function SalePage() {
  const dealCategories = [
    {
      title: "Launch Special",
      description: "Exclusive pricing for early supporters",
      icon: <Tag className="h-6 w-6 md:h-8 md:w-8" />,
      href: "/products?category=launch-special",
      discount: "15% off"
    },
    {
      title: "First Order Discount",
      description: "Welcome offer for new customers",
      icon: <Gift className="h-6 w-6 md:h-8 md:w-8" />,
      href: "/products?category=first-order",
      discount: "10% off + Free Shipping"
    },
    {
      title: "Bulk Orders",
      description: "Perfect for units and groups",
      icon: <TrendingDown className="h-6 w-6 md:h-8 md:w-8" />,
      href: "/custom",
      discount: "Volume Pricing Available"
    },
    {
      title: "Early Bird Deals",
      description: "Limited time startup pricing",
      icon: <Clock className="h-6 w-6 md:h-8 md:w-8" />,
      href: "/products?category=early-bird",
      discount: "Special Pricing"
    }
  ]

  const dealHighlights = [
    "15% off launch special pricing",
    "Free shipping on first orders",
    "Free UK delivery over £50",
    "10% military discount available",
    "Volume pricing for bulk orders"
  ]

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-red-600/10 to-background py-12 md:py-24 border-b-2 border-border">
          <div className="container mx-auto px-4 text-center">
            <div className="flex flex-col sm:flex-row items-center justify-center mb-6 md:mb-8">
              <Image 
                src="/logowhite.webp" 
                alt="Military Tees UK Logo" 
                width={96}
                height={96}
                className="h-16 w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 object-contain mb-4 sm:mb-0 sm:mr-6"
                style={{filter: 'brightness(0) saturate(100%) invert(20%) sepia(94%) saturate(2756%) hue-rotate(348deg) brightness(93%) contrast(93%)'}}
              />
              <div className="text-center sm:text-left">
                <h1 className="text-2xl md:text-4xl lg:text-6xl font-display font-bold tracking-wider uppercase text-foreground">
                  Launch Deals
                </h1>
                <p className="text-base md:text-xl text-muted-foreground font-display tracking-wide">
                  Exclusive Startup Pricing
                </p>
              </div>
            </div>
            
            <div className="max-w-3xl mx-auto mb-8 md:mb-10">
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed px-4">
                Exclusive deals for our early supporters. 
                Premium military-themed apparel at special launch pricing.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center">
              <Button size="lg" className="rounded-none font-display font-bold tracking-wide uppercase" asChild>
                <Link href="/products">
                  Shop Launch Deals
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-none border-2 font-display font-bold tracking-wide uppercase" asChild>
                <Link href="#deal-categories">
                  View All Offers
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Deal Highlights */}
        <section className="py-8 md:py-16 bg-red-600/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8 md:mb-12">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Percent className="h-5 w-5 md:h-6 md:w-6 text-red-600" />
                <h2 className="text-xl md:text-3xl font-display font-bold">
                  Current Offers
                </h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 max-w-5xl mx-auto">
                {dealHighlights.map((highlight, index) => (
                  <div key={index} className="bg-background p-3 md:p-4 border-2 border-red-600/20 rounded-none text-center">
                    <p className="text-xs md:text-sm font-medium">{highlight}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Deal Categories */}
        <section id="deal-categories" className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-display font-bold mb-4">
                Launch Offers
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Exclusive deals for our early customers. Supporting those who serve with startup pricing.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {dealCategories.map((category, index) => (
                <Card key={index} className="border-2 border-border rounded-none hover:border-red-600 transition-colors group">
                  <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 bg-red-600/10 border-2 border-red-600 flex items-center justify-center group-hover:bg-red-600/20 transition-colors">
                        {category.icon}
                      </div>
                    </div>
                    <CardTitle className="font-display tracking-wide uppercase">
                      {category.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center space-y-4">
                    <p className="text-muted-foreground text-sm">
                      {category.description}
                    </p>
                    <Badge className="rounded-none bg-red-600 hover:bg-red-700">
                      {category.discount}
                    </Badge>
                    <Button 
                      className="w-full rounded-none font-display font-bold tracking-wide uppercase bg-red-600 hover:bg-red-700"
                      asChild
                    >
                      <Link href={category.href}>
                        Learn More
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Launch Special Banner */}
        <section className="py-8 bg-red-600 text-white">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="font-display font-bold uppercase tracking-wide text-sm">
                  Launch Special
                </span>
              </div>
              <h3 className="text-2xl font-display font-bold mb-2">
                Welcome to Military Tees UK
              </h3>
              <p className="text-white/90 mb-4">
                Celebrating our launch with special pricing on selected items
              </p>
              <Button 
                variant="secondary"
                className="bg-background text-foreground hover:bg-background/90 font-bold uppercase tracking-wide"
                asChild
              >
                <Link href="/products?category=sale">
                  Explore Our Collection
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-display font-bold mb-4">
                Stay Updated on New Deals
              </h2>
              <p className="text-muted-foreground mb-8">
                Be the first to know about our latest launches, exclusive offers, and military community updates.
              </p>
              
              <Card className="border-2 border-border rounded-none">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <input 
                      type="email" 
                      placeholder="Enter your email address"
                      className="flex-1 px-4 py-3 border-2 border-border rounded-none focus:outline-none focus:border-red-600"
                    />
                    <Button 
                      className="rounded-none font-display font-bold tracking-wide uppercase bg-red-600 hover:bg-red-700"
                    >
                      Subscribe
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    By subscribing, you agree to receive updates about new products and offers. Unsubscribe anytime.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-gradient-to-r from-red-600 to-red-700 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-display font-bold mb-4">
              Join Our Military Community
            </h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Premium military apparel from a startup founded by veterans. 
              Support our journey while getting quality gear at launch pricing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="secondary" 
                size="lg"
                className="bg-background text-foreground hover:bg-background/90 font-bold uppercase tracking-wide"
                asChild
              >
                <Link href="/products">
                  Shop Our Collection
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-white text-white hover:bg-white hover:text-black font-bold uppercase tracking-wide"
                asChild
              >
                <Link href="/about">
                  Our Story
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
}