"use client"

import { useState } from "react"
import { Metadata } from "next"
import { Palette, Users, Award, Clock, CheckCircle, Phone, Mail, MessageCircle } from "lucide-react"
import { Layout } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Modal } from "@/components/ui/modal"
import { QuoteForm } from "@/components/custom/quote-form"
import { cn } from "@/lib/utils"

// Note: Metadata should be in a separate metadata file for client components
// export const metadata: Metadata = { ... }

// Metadata moved to layout or separate metadata file for client components

const customServices = [
  {
    icon: Users,
    title: "Unit & Regiment Designs",
    description: "Custom designs for military units, regiments, and squadrons with official badges and mottos",
    features: ["Official military badges", "Unit mottos & names", "Rank insignia", "Formation patches"],
    minOrder: 20,
    timeline: "2-3 weeks"
  },
  {
    icon: Award,
    title: "Commemorative Events", 
    description: "Special designs for military events, ceremonies, and milestone commemorations",
    features: ["Event-specific designs", "Date customization", "Multiple colour options", "Various garment types"],
    minOrder: 10,
    timeline: "10-14 days"
  },
  {
    icon: Palette,
    title: "Personal Designs",
    description: "Custom designs for military personnel, businesses, and civilian clients seeking professional apparel",
    features: ["Military rank & service details", "Corporate branding", "Personal achievements", "Civilian memorial designs"],
    minOrder: 1,
    timeline: "7-10 days"
  }
]

const processSteps = [
  {
    step: 1,
    title: "Submit Your Idea",
    description: "Tell us about your vision, requirements, and any specific details",
    icon: MessageCircle
  },
  {
    step: 2,
    title: "Design Consultation", 
    description: "Our designers work with you to create the perfect design",
    icon: Palette
  },
  {
    step: 3,
    title: "Approval & Production",
    description: "Review, approve, and we'll begin crafting your custom pieces",
    icon: CheckCircle
  },
  {
    step: 4,
    title: "Quality Delivery",
    description: "Receive your premium custom military apparel",
    icon: Award
  }
]

export default function CustomOrdersPage() {
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false)
  const [selectedServiceType, setSelectedServiceType] = useState<string>('')

  const handleGetQuote = (serviceType: string) => {
    setSelectedServiceType(serviceType)
    setIsQuoteModalOpen(true)
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="border-b-2 border-border bg-gradient-to-b from-muted/20 to-background py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-primary/10 p-4 border-2 border-primary mr-4">
              <img 
                src="/logowhite.svg" 
                alt="Military Tees UK Logo" 
                className="h-12 w-12 object-contain"
                style={{filter: 'brightness(0) saturate(100%) invert(41%) sepia(45%) saturate(594%) hue-rotate(75deg) brightness(91%) contrast(91%)'}}
              />
            </div>
            <div className="text-left">
              <h1 className="text-4xl md:text-6xl font-display font-bold tracking-wider uppercase text-foreground">
                Custom Orders
              </h1>
              <p className="text-xl text-muted-foreground font-display tracking-wide">
                Personalized Military-Themed Apparel
              </p>
            </div>
          </div>
          
          <div className="max-w-3xl mx-auto mb-8">
            <p className="text-lg text-muted-foreground leading-relaxed">
              Create something truly unique with our custom military apparel service. 
              From unit designs to personal commemoratives, we bring your military-themed 
              vision to life with precision and pride.
            </p>
          </div>
          
          <div className="flex justify-center items-center gap-8 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">500+</div>
              <div className="text-sm text-muted-foreground">Custom Designs</div>
            </div>
            <div className="h-8 w-px bg-border"></div>
            <div>
              <div className="text-2xl font-bold text-primary">48hrs</div>
              <div className="text-sm text-muted-foreground">Design Response</div>
            </div>
            <div className="h-8 w-px bg-border"></div>
            <div>
              <div className="text-2xl font-bold text-primary">100%</div>
              <div className="text-sm text-muted-foreground">Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Custom Services */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className={cn(
            "text-3xl font-display font-bold text-foreground mb-4",
            "tracking-wider uppercase"
          )}>
            Custom Services
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Whether you need one piece or hundreds, we have the expertise to deliver 
            exceptional custom military apparel tailored to your exact requirements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {customServices.map((service, index) => {
            const IconComponent = service.icon
            
            return (
              <Card 
                key={index}
                className={cn(
                  "h-full border-2 border-border rounded-none",
                  "hover:border-primary transition-colors group"
                )}
              >
                <CardHeader className="text-center">
                  <div className={cn(
                    "mb-4 p-4 mx-auto w-fit",
                    "border border-muted-foreground/20 rounded-none",
                    "bg-muted/20 group-hover:bg-primary/10",
                    "group-hover:border-primary/30 transition-colors"
                  )}>
                    <IconComponent className="h-10 w-10 text-primary" />
                  </div>
                  
                  <CardTitle className={cn(
                    "text-xl font-display tracking-wide",
                    "group-hover:text-primary transition-colors"
                  )}>
                    {service.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <p className="text-muted-foreground text-center">
                    {service.description}
                  </p>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-foreground uppercase tracking-wide">
                      Features:
                    </h4>
                    <ul className="space-y-1">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-primary flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="space-y-3 pt-4 border-t border-border">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Pricing:</span>
                      <Badge variant="secondary" className="rounded-none">
                        Bulk discount available
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Timeline:</span>
                      <span className="font-medium text-foreground">{service.timeline}</span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => handleGetQuote(service.title)}
                    variant="outline" 
                    className={cn(
                      "w-full rounded-none border-2",
                      "group-hover:border-primary group-hover:text-primary"
                    )}
                  >
                    Get Quote
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Process Steps */}
      <section className="border-t-2 border-border bg-muted/10">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className={cn(
              "text-3xl font-display font-bold text-foreground mb-4",
              "tracking-wider uppercase"
            )}>
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our streamlined process ensures your custom military apparel meets 
              the highest standards while keeping you involved every step of the way.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step, index) => {
              const IconComponent = step.icon
              const isLast = index === processSteps.length - 1
              
              return (
                <div key={step.step} className="text-center relative">
                  {!isLast && (
                    <div className="hidden lg:block absolute top-8 left-1/2 w-full h-0.5 bg-border -translate-y-1/2 z-0">
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary rotate-45"></div>
                    </div>
                  )}
                  
                  <div className={cn(
                    "relative z-10 mb-6 p-4 mx-auto w-fit",
                    "border-2 border-primary rounded-none bg-background",
                    "shadow-sm"
                  )}>
                    <div className={cn(
                      "absolute -top-2 -left-2 w-6 h-6",
                      "bg-primary text-primary-foreground rounded-none",
                      "flex items-center justify-center text-sm font-bold"
                    )}>
                      {step.step}
                    </div>
                    <IconComponent className="h-8 w-8 text-primary" />
                  </div>
                  
                  <h3 className={cn(
                    "text-lg font-display font-semibold text-foreground mb-2",
                    "tracking-wide"
                  )}>
                    {step.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className={cn(
              "text-3xl font-display font-bold text-foreground mb-4",
              "tracking-wider uppercase"
            )}>
              Start Your Custom Order
            </h2>
            <p className="text-muted-foreground">
              Ready to create something special? Get in touch with our design team 
              to discuss your requirements and receive a personalised quote.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className="border-2 border-border rounded-none">
              <CardHeader>
                <CardTitle className={cn(
                  "font-display tracking-wide uppercase"
                )}>
                  Custom Order Enquiry
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* TODO: Make this form functional with proper form handling */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Full Name *
                  </label>
                  <Input 
                    placeholder="Your full name"
                    className="rounded-none border-2"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Email Address *
                  </label>
                  <Input 
                    type="email"
                    placeholder="your.email@example.com"
                    className="rounded-none border-2"
                  />
                </div>
                
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Order Type
                  </label>
                  <select className={cn(
                    "w-full px-3 py-2 border-2 border-border rounded-none",
                    "bg-background text-foreground",
                    "focus:border-primary focus:outline-none"
                  )}>
                    <option value="">Select order type</option>
                    <option value="unit">Unit & Regiment Design</option>
                    <option value="event">Commemorative Event</option>
                    <option value="personal">Personal Design</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Estimated Quantity
                  </label>
                  <Input 
                    type="number"
                    placeholder="How many pieces?"
                    className="rounded-none border-2"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Project Description *
                  </label>
                  <textarea 
                    rows={4}
                    placeholder="Tell us about your vision, requirements, and any specific details..."
                    className={cn(
                      "w-full px-3 py-2 border-2 border-border rounded-none",
                      "bg-background text-foreground resize-none",
                      "focus:border-primary focus:outline-none"
                    )}
                  />
                </div>
                
                <Button 
                  onClick={() => handleGetQuote('General Enquiry')}
                  className="w-full rounded-none h-12"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Submit Enquiry
                </Button>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-8">
              <Card className="border-2 border-border rounded-none">
                <CardHeader>
                  <CardTitle className="font-display tracking-wide uppercase">
                    Get In Touch
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium text-foreground">Email</p>
                      <p className="text-muted-foreground">custom@militarytees.co.uk</p>
                      <p className="text-xs text-muted-foreground">Response within 24 hours</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium text-foreground">Turnaround</p>
                      <p className="text-muted-foreground">7-21 days depending on complexity</p>
                      <p className="text-xs text-muted-foreground">Rush orders available</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-2 border-border rounded-none bg-primary/5">
                <CardContent className="p-6">
                  <h3 className={cn(
                    "font-display font-semibold text-foreground mb-3",
                    "tracking-wide uppercase"
                  )}>
                    Why Choose Us?
                  </h3>
                  
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Military heritage & understanding</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Premium quality materials</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Authentic military designs</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>100% satisfaction guarantee</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
      </div>

      {/* Quote Request Modal */}
      <Modal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        title="Request Custom Quote"
        size="lg"
      >
        <QuoteForm 
          serviceType={selectedServiceType}
          onClose={() => setIsQuoteModalOpen(false)}
        />
      </Modal>
    </Layout>
  )
}