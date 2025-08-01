import { Metadata } from "next"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Layout } from "@/components/layout/layout"
import { Tag, Clock, Star, TrendingDown, Percent, Gift } from "lucide-react"

export const metadata: Metadata = {
  title: "Sale - Military Tees UK",
  description: "Discounted military apparel and special offers - premium military-themed clothing at reduced prices.",
  keywords: [
    "military sale",
    "military apparel discount",
    "army tees sale",
    "military clothing offers",
    "discounted military gear",
    "sale military shirts"
  ]
}

export default function SalePage() {
  const saleCategories = [
    {
      title: "Clearance Items",
      description: "Up to 50% off selected designs",
      icon: <TrendingDown className="h-8 w-8" />,
      href: "/products?category=clearance",
      discount: "Up to 50% off"
    },
    {
      title: "Seasonal Sale",
      description: "Limited time seasonal offers",
      icon: <Clock className="h-8 w-8" />,
      href: "/products?category=seasonal-sale",
      discount: "30% off"
    },
    {
      title: "Bundle Deals",
      description: "Buy more, save more offers",
      icon: <Gift className="h-8 w-8" />,
      href: "/products?category=bundles",
      discount: "Buy 2 Get 1 Free"
    },
    {
      title: "Last Chance",
      description: "Final reductions before they're gone",
      icon: <Star className="h-8 w-8" />,
      href: "/products?category=last-chance",
      discount: "Up to 60% off"
    }
  ]

  const saleHighlights = [
    "Up to 60% off selected military tees",
    "Buy 2 Get 1 Free on featured designs",
    "Free UK shipping on orders over £30",
    "Military discount still applies",
    "Limited time offers - while stocks last"
  ]

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-red-600/10 to-background py-20 border-b-2 border-border">
          <div className="container mx-auto px-4 text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-red-600/10 p-4 border-2 border-red-600 mr-4">
                <img 
                  src="/logowhite.svg" 
                  alt="Military Tees UK Logo" 
                  className="h-12 w-12 object-contain"
                  style={{filter: 'brightness(0) saturate(100%) invert(20%) sepia(94%) saturate(2756%) hue-rotate(348deg) brightness(93%) contrast(93%)'}}
                />
              </div>
              <div className="text-left">
                <h1 className="text-4xl md:text-6xl font-display font-bold tracking-wider uppercase text-foreground">
                  Sale
                </h1>
                <p className="text-xl text-muted-foreground font-display tracking-wide">
                  Military Apparel at Reduced Prices
                </p>
              </div>
            </div>
            
            <div className="max-w-3xl mx-auto mb-8">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Discover premium military-themed apparel at unbeatable prices. 
                Limited time offers on our most popular designs.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="rounded-none font-display font-bold tracking-wide uppercase bg-red-600 hover:bg-red-700" asChild>
                <Link href="/products?category=sale">
                  Shop Sale Items
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-none border-2 font-display font-bold tracking-wide uppercase border-red-600 text-red-600 hover:bg-red-600 hover:text-white" asChild>
                <Link href="#sale-categories">
                  Browse Offers
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Sale Highlights */}
        <section className="py-16 bg-red-600/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Percent className="h-6 w-6 text-red-600" />
                <h2 className="text-3xl font-display font-bold">
                  Current Offers
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
                {saleHighlights.map((highlight, index) => (
                  <div key={index} className="bg-background p-4 border-2 border-red-600/20 rounded-none text-center">
                    <p className="text-sm font-medium">{highlight}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Sale Categories */}
        <section id="sale-categories" className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-display font-bold mb-4">
                Sale Categories
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Browse our current sale offerings and find great deals on military-themed apparel.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {saleCategories.map((category, index) => (
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
                        Shop Now
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Launch Special Banner */}
        <section className="py-8 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="h-5 w-5" />
                <span className="font-display font-bold uppercase tracking-wide text-sm">
                  Launch Special
                </span>
              </div>
              <h3 className="text-2xl font-display font-bold mb-2">
                Welcome to Military Tees UK
              </h3>
              <p className="text-primary-foreground/90 mb-4">
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
                Never Miss a Sale
              </h2>
              <p className="text-muted-foreground mb-8">
                Be the first to know about our exclusive offers, flash sales, and military discounts.
              </p>
              
              <Card className="border-2 border-border rounded-none">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <input 
                      type="email" 
                      placeholder="Enter your email address"
                      className="flex-1 px-4 py-3 border-2 border-border rounded-none focus:outline-none focus:border-primary"
                    />
                    <Button 
                      className="rounded-none font-display font-bold tracking-wide uppercase bg-red-600 hover:bg-red-700"
                    >
                      Subscribe
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    By subscribing, you agree to receive sale notifications and can unsubscribe at any time.
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
              Don't Miss Out - Sale Ends Soon!
            </h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Premium military apparel at incredible prices. Stock is limited and these offers won't last long.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="secondary" 
                size="lg"
                className="bg-white text-red-600 hover:bg-red-50 font-bold uppercase tracking-wide"
                asChild
              >
                <Link href="/products?category=sale">
                  Shop All Sale Items
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-white text-white hover:bg-white hover:text-red-600 font-bold uppercase tracking-wide"
                asChild
              >
                <Link href="/categories">
                  Browse All Categories
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
}