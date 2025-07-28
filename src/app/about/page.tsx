import { Metadata } from "next"
import Link from "next/link"
import { Shield, Target, Heart, Users, Award, Clock, Mail } from "lucide-react"
import { Layout } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "About Us - Our Military Heritage & Mission | Military Tees UK",
  description: "Learn about our story, mission, and commitment to creating authentic military-themed apparel that honours British military heritage and supports our armed forces community.",
  keywords: ["military heritage", "british army", "military clothing company", "veterans", "military community"],
  openGraph: {
    title: "About Military Tees UK - Our Story & Mission", 
    description: "Our story, mission, and commitment to British military heritage",
    type: "website",
  }
}

const values = [
  {
    icon: Shield,
    title: "Honour & Respect",
    description: "We honour military tradition and respect those who serve, have served, and made the ultimate sacrifice."
  },
  {
    icon: Target,
    title: "Authenticity",
    description: "Every design reflects genuine military culture, terminology, and heritage with accuracy and integrity."
  },
  {
    icon: Heart,
    title: "Community Support",
    description: "We actively support military charities, veterans, and serving personnel through our business and partnerships."
  },
  {
    icon: Users,
    title: "Brotherhood",
    description: "We foster connections within the military community, bringing together past and present service members."
  }
]

const timeline = [
  {
    year: "Jun 2025",
    title: "Foundation",
    description: "Military Tees UK was founded with a vision to create authentic military-themed apparel that honours British military heritage."
  },
  {
    year: "Jul 2025",
    title: "Initial Designs",
    description: "Developed our first collection of designs featuring classic British Army themes and military terminology."
  },
  {
    year: "Aug 2025", 
    title: "Platform Launch",
    description: "Launched our e-commerce platform to serve the military community with quality apparel and custom services."
  },
  {
    year: "Future",
    title: "Community Building",
    description: "Growing our community and expanding our collection while maintaining authenticity and supporting military charities."
  }
]

const team = [
  {
    name: "The Founder",
    role: "CEO & Design Lead",
    background: "Military Heritage",
    description: "Passionate about creating authentic military-themed apparel that honours British military heritage and serves the community."
  },
  {
    name: "The Partner",
    role: "Operations & Customer Service",
    background: "Business Operations",
    description: "Ensures exceptional customer service and smooth operations while maintaining our commitment to quality and authenticity."
  }
]

export default function AboutPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="border-b-2 border-border bg-muted/10">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className={cn(
                "inline-block p-4 mb-6",
                "border-2 border-primary rounded-none bg-background"
              )}>
                <Shield className="h-12 w-12 text-primary" />
              </div>
              
              <h1 className={cn(
                "text-4xl md:text-5xl font-display font-bold text-foreground mb-6",
                "tracking-wider uppercase"
              )}>
                Our Story
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed mb-6">
                A new venture founded with passion for the military community. We're creating authentic 
                military-themed apparel that honours British military heritage and 
                supports those who serve.
              </p>
              
              <p className="text-muted-foreground leading-relaxed mb-8">
                Starting our journey in 2025, we're building something special. Every design tells a story. 
                Every purchase will support a cause. Every customer becomes part of our growing military family.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/categories">
                  <Button size="lg" className="rounded-none">
                    <Award className="h-4 w-4 mr-2" />
                    Shop Collection
                  </Button>
                </Link>
                <Link href="/custom">
                  <Button variant="outline" size="lg" className="rounded-none border-2">
                    <Target className="h-4 w-4 mr-2" />
                    Custom Orders
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className={cn(
              "bg-card border-2 border-border p-8 rounded-none"
            )}>
              <h3 className={cn(
                "text-xl font-display font-semibold text-foreground mb-6",
                "tracking-wide uppercase text-center"
              )}>
                Our Impact
              </h3>
              
              <div className="grid grid-cols-2 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-primary">Fresh</div>
                  <div className="text-sm text-muted-foreground">New Business</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">100%</div>
                  <div className="text-sm text-muted-foreground">Commitment</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">20+</div>
                  <div className="text-sm text-muted-foreground">Initial Designs</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">Growing</div>
                  <div className="text-sm text-muted-foreground">Community</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className={cn(
            "text-3xl font-display font-bold text-foreground mb-4",
            "tracking-wider uppercase"
          )}>
            Our Values
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            These core values guide everything we do, from design conception 
            to customer service, ensuring we honour military tradition in all aspects.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => {
            const IconComponent = value.icon
            
            return (
              <Card 
                key={index}
                className={cn(
                  "text-center border-2 border-border rounded-none",
                  "hover:border-primary transition-colors group"
                )}
              >
                <CardContent className="p-6">
                  <div className={cn(
                    "mb-4 p-3 mx-auto w-fit",
                    "border border-muted-foreground/20 rounded-none",
                    "bg-muted/20 group-hover:bg-primary/10",
                    "group-hover:border-primary/30 transition-colors"
                  )}>
                    <IconComponent className="h-8 w-8 text-primary" />
                  </div>
                  
                  <h3 className={cn(
                    "text-lg font-display font-semibold text-foreground mb-3",
                    "tracking-wide group-hover:text-primary transition-colors"
                  )}>
                    {value.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Timeline Section */}
      <section className="border-t-2 border-border bg-muted/10">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className={cn(
              "text-3xl font-display font-bold text-foreground mb-4",
              "tracking-wider uppercase"
            )}>
              Our Journey
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We're just getting started! Here's our journey so far and our plans ahead 
              as we build something meaningful for the military community.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-border md:-ml-px"></div>
              
              {timeline.map((item, index) => (
                <div key={index} className="relative mb-12 last:mb-0">
                  <div className="flex items-center md:justify-center">
                    {/* Timeline Dot */}
                    <div className={cn(
                      "absolute left-4 md:left-1/2 w-3 h-3 bg-primary",
                      "rounded-none md:-ml-1.5 z-10"
                    )}></div>
                    
                    {/* Content */}
                    <div className={cn(
                      "ml-12 md:ml-0 md:w-5/12",
                      index % 2 === 0 ? "md:mr-auto md:pr-8 md:text-right" : "md:ml-auto md:pl-8"
                    )}>
                      <Card className={cn(
                        "border-2 border-border rounded-none",
                        "hover:border-primary transition-colors"
                      )}>
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-3">
                            <Badge variant="secondary" className="rounded-none font-mono">
                              {item.year}
                            </Badge>
                            <Clock className="h-4 w-4 text-primary" />
                          </div>
                          
                          <h3 className={cn(
                            "text-lg font-display font-semibold text-foreground mb-2",
                            "tracking-wide"
                          )}>
                            {item.title}
                          </h3>
                          
                          <p className="text-sm text-muted-foreground">
                            {item.description}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className={cn(
            "text-3xl font-display font-bold text-foreground mb-4",
            "tracking-wider uppercase"
          )}>
            Leadership Team
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our small but dedicated team is passionate about military heritage and 
            committed to creating authentic designs that honour our armed forces.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {team.map((member, index) => (
            <Card 
              key={index}
              className="border-2 border-border rounded-none hover:border-primary transition-colors"
            >
              <CardContent className="p-6 text-center">
                <div className={cn(
                  "mb-4 p-4 mx-auto w-fit",
                  "border border-primary/30 rounded-none bg-primary/10"
                )}>
                  <Shield className="h-12 w-12 text-primary" />
                </div>
                
                <h3 className={cn(
                  "text-lg font-display font-semibold text-foreground mb-1",
                  "tracking-wide"
                )}>
                  {member.name}
                </h3>
                
                <p className="text-primary font-medium mb-2">{member.role}</p>
                
                <Badge variant="secondary" className="rounded-none mb-4">
                  {member.background}
                </Badge>
                
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {member.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="border-t-2 border-border bg-muted/10">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className={cn(
            "text-2xl md:text-3xl font-display font-bold text-foreground mb-6",
            "tracking-wider uppercase"
          )}>
            Join Our Mission
          </h2>
          
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Whether you're serving, a veteran, or simply support our military, 
            we invite you to join our community and help us honour military heritage.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/categories">
              <Button size="lg" className="rounded-none px-8">
                <Shield className="h-4 w-4 mr-2" />
                Shop Now
              </Button>
            </Link>
            
            <Link href="/contact">
              <Button variant="outline" size="lg" className="rounded-none border-2 px-8">
                <Mail className="h-4 w-4 mr-2" />
                Get In Touch
              </Button>
            </Link>
          </div>
          
          <div className="mt-8 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground mb-4">
              <strong>Proudly Supporting:</strong>
            </p>
            <div className="flex justify-center items-center gap-6 text-xs text-muted-foreground">
              <span>Help for Heroes</span>
              <span>•</span>
              <span>Royal British Legion</span>
              <span>•</span>
              <span>SSAFA</span>
              <span>•</span>
              <span>Combat Stress</span>
            </div>
          </div>
        </div>
      </section>
      </div>
    </Layout>
  )
}