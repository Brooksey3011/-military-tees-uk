import { Metadata } from "next"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Layout } from "@/components/layout/layout"
import { Users, Shirt, Ruler, Star, Shield, Heart, Baby } from "lucide-react"

export const metadata: Metadata = {
  title: "Kids Military Collection - Military Tees UK",
  description: "Military-themed apparel for young recruits - premium kids clothing with proper sizing guide and comfortable fits.",
  keywords: [
    "kids military clothing",
    "children military tees",
    "kids army shirts",
    "military kids apparel",
    "young recruits clothing",
    "kids sizing guide",
    "children's military wear"
  ]
}

export default function KidsPage() {
  const kidsCategories = [
    {
      title: "Young Recruits",
      description: "Military-inspired designs for kids",
      icon: <Users className="h-8 w-8" />,
      href: "/products?category=kids-recruits",
      ageRange: "Ages 3-8"
    },
    {
      title: "Junior Cadets",
      description: "For the aspiring military kids",
      icon: <Shield className="h-8 w-8" />,
      href: "/products?category=kids-cadets",
      ageRange: "Ages 9-12"
    },
    {
      title: "Future Heroes",
      description: "Inspiring the next generation",
      icon: <Star className="h-8 w-8" />,
      href: "/products?category=kids-heroes",
      ageRange: "Ages 13-16"
    },
    {
      title: "Military Family",
      description: "Proud military family designs",
      icon: <Heart className="h-8 w-8" />,
      href: "/products?category=kids-family",
      ageRange: "All Ages"
    }
  ]

  const sizeGuide = [
    { age: "2-3 Years", size: "2T-3T", chest: "20-21\"", length: "14-15\"", weight: "24-34 lbs" },
    { age: "4-5 Years", size: "4T-5T", chest: "22-23\"", length: "16-17\"", weight: "35-45 lbs" },
    { age: "6-7 Years", size: "XS", chest: "24-25\"", length: "18-19\"", weight: "46-56 lbs" },
    { age: "8-10 Years", size: "S", chest: "26-28\"", length: "20-21\"", weight: "57-72 lbs" },
    { age: "10-12 Years", size: "M", chest: "29-31\"", length: "22-23\"", weight: "73-95 lbs" },
    { age: "12-14 Years", size: "L", chest: "32-34\"", length: "24-25\"", weight: "96-125 lbs" },
    { age: "14-16 Years", size: "XL", chest: "35-37\"", length: "26-27\"", weight: "126-150 lbs" }
  ]

  const features = [
    {
      icon: <Shirt className="h-6 w-6" />,
      title: "Comfortable Fits",
      description: "Soft, breathable fabrics designed for active kids"
    },
    {
      icon: <Star className="h-6 w-6" />,
      title: "Durable Quality",
      description: "Built to withstand playground adventures"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Safe Materials",
      description: "Child-safe inks and fabrics, tested for quality"
    },
    {
      icon: <Heart className="h-6 w-6" />,
      title: "Family Pride",
      description: "Designs that celebrate military family heritage"
    }
  ]

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-muted/20 to-background py-20 border-b-2 border-border">
          <div className="container mx-auto px-4 text-center">
            <div className="flex items-center justify-center mb-6">
              <img 
                src="/logowhite.png" 
                alt="Military Tees UK Logo" 
                className="h-12 w-12 object-contain mr-4"
                style={{filter: 'brightness(0) saturate(100%) invert(41%) sepia(45%) saturate(594%) hue-rotate(75deg) brightness(91%) contrast(91%)'}}
              />
              <div className="text-left">
                <h1 className="text-4xl md:text-6xl font-display font-bold tracking-wider uppercase text-foreground">
                  Kids Collection
                </h1>
                <p className="text-xl text-muted-foreground font-display tracking-wide">
                  Military-Themed Apparel for Young Recruits
                </p>
              </div>
            </div>
            
            <div className="max-w-3xl mx-auto mb-8">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Inspire the next generation with our premium kids military collection. 
                Comfortable, durable, and designed to celebrate military family pride.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="rounded-none font-display font-bold tracking-wide uppercase" asChild>
                <Link href="/products?category=kids">
                  Shop Kids Collection
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-none border-2 font-display font-bold tracking-wide uppercase" asChild>
                <Link href="#size-guide">
                  Sizing Guide
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-display font-bold mb-4">
                Why Choose Our Kids Collection?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Premium quality, comfortable fits, and designs that make military families proud.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="text-center p-6 border border-border rounded-none hover:border-primary transition-colors">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="font-display font-bold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Kids Categories */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-display font-bold mb-4">
                Kids Categories
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Age-appropriate designs that grow with your young recruit.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {kidsCategories.map((category, index) => (
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
                    <p className="text-muted-foreground text-sm">
                      {category.description}
                    </p>
                    <Badge variant="outline" className="rounded-none">
                      {category.ageRange}
                    </Badge>
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

        {/* Kids Size Guide */}
        <section id="size-guide" className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Ruler className="h-6 w-6 text-primary" />
                <h2 className="text-3xl font-display font-bold">
                  Kids Sizing Guide
                </h2>
              </div>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Find the perfect fit for your young recruit with our comprehensive sizing guide.
              </p>
            </div>
            
            <div className="max-w-5xl mx-auto">
              <Card className="border-2 border-border rounded-none">
                <CardHeader>
                  <CardTitle className="font-display tracking-wide uppercase text-center">
                    Size Chart
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left p-3 font-display font-bold uppercase">Age Range</th>
                          <th className="text-left p-3 font-display font-bold uppercase">Size</th>
                          <th className="text-left p-3 font-display font-bold uppercase">Chest</th>
                          <th className="text-left p-3 font-display font-bold uppercase">Length</th>
                          <th className="text-left p-3 font-display font-bold uppercase">Weight</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sizeGuide.map((size, index) => (
                          <tr key={index} className="border-b border-border/50 hover:bg-muted/10">
                            <td className="p-3 font-medium">{size.age}</td>
                            <td className="p-3">
                              <Badge className="rounded-none">{size.size}</Badge>
                            </td>
                            <td className="p-3">{size.chest}</td>
                            <td className="p-3">{size.length}</td>
                            <td className="p-3 text-muted-foreground">{size.weight}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="mt-6 p-4 bg-muted/10 rounded-none border-l-4 border-primary">
                    <h4 className="font-display font-bold mb-2">Sizing Tips</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Measurements are approximate and may vary by style</li>
                      <li>For growing children, consider sizing up for longer wear</li>
                      <li>Our shirts have a comfortable, relaxed fit perfect for active kids</li>
                      <li>If between sizes, we recommend choosing the larger size</li>
                      <li>Contact us if you need help choosing the right size</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Popular Designs */}
        <section className="py-16 bg-primary/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-display font-bold mb-4">
                Popular Kids Designs
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Fun, age-appropriate military-themed designs that kids love to wear.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {[
                "Future Soldier",
                "Military Kid",
                "Daddy's Little Recruit",
                "Proud Military Family", 
                "Young Hero",
                "Mini Marine"
              ].map((design, index) => (
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
                <Link href="/products?category=kids">
                  View All Kids Designs
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-gradient-to-r from-primary to-secondary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-display font-bold mb-4">
              Start Them Young, Start Them Proud
            </h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Build military family pride from an early age with our premium kids collection. 
              Comfortable, durable, and designed to last.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="secondary" 
                size="lg"
                className="bg-background text-foreground hover:bg-background/90 font-bold uppercase tracking-wide"
                asChild
              >
                <Link href="/products?category=kids">
                  Shop Kids Collection
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-white text-white hover:bg-white hover:text-black font-bold uppercase tracking-wide"
                asChild
              >
                <Link href="#size-guide">
                  View Size Guide
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
}