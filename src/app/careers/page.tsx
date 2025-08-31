import { Metadata } from "next"
import { Users, MapPin, Clock, Award, ArrowRight, Mail } from "lucide-react"
import { Layout } from "@/components/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Careers - Join Our Mission | Military Tees UK",
  description: "Join the Military Tees UK team. Explore career opportunities with a company that values military heritage, quality, and community service.",
  robots: {
    index: true,
    follow: true,
  }
}

export default function CareersPage() {
  const openPositions = [
    {
      id: 1,
      title: "Senior Graphic Designer",
      department: "Creative",
      location: "Remote/UK",
      type: "Full-time",
      description: "Lead the design of authentic military-themed graphics and manage our visual brand identity. Military background preferred.",
      requirements: [
        "5+ years graphic design experience",
        "Military service background preferred",
        "Proficiency in Adobe Creative Suite",
        "Understanding of military insignia and protocol"
      ]
    },
    {
      id: 2,
      title: "Customer Service Representative",
      department: "Support",
      location: "Remote",
      type: "Full-time",
      description: "Provide exceptional support to our military community. Veterans strongly encouraged to apply.",
      requirements: [
        "Previous customer service experience",
        "Military service background preferred",
        "Excellent communication skills",
        "Passion for helping the military community"
      ]
    },
    {
      id: 3,
      title: "E-commerce Manager",
      department: "Digital",
      location: "Hybrid",
      type: "Full-time", 
      description: "Manage our online store operations, optimization, and growth initiatives. Drive digital strategy.",
      requirements: [
        "3+ years e-commerce experience",
        "Shopify/Next.js experience preferred",
        "Data-driven mindset",
        "Understanding of military market"
      ]
    },
    {
      id: 4,
      title: "Warehouse Associate",
      department: "Operations",
      location: "UK Warehouse",
      type: "Part-time",
      description: "Handle order fulfillment, inventory management, and shipping operations with military precision.",
      requirements: [
        "Physical ability to lift packages",
        "Attention to detail",
        "Military service background welcomed",
        "Flexible scheduling availability"
      ]
    }
  ]

  const benefits = [
    {
      icon: Award,
      title: "Military Appreciation",
      description: "Special recognition and advancement opportunities for veterans and military families."
    },
    {
      icon: Clock,
      title: "Flexible Working",
      description: "Remote-first culture with flexible hours to support work-life balance and military commitments."
    },
    {
      icon: Users,
      title: "Team Culture",
      description: "Join a team that understands military values: honor, integrity, commitment, and service."
    },
    {
      icon: MapPin,
      title: "Growth Opportunities",
      description: "Career development programs and training to help you advance within our growing company."
    }
  ]

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
                <Users className="h-12 w-12 text-primary mx-auto" />
              </div>
              
              <h1 className={cn(
                "text-4xl md:text-5xl font-display font-bold text-foreground mb-4",
                "tracking-wider uppercase"
              )}>
                Join Our Mission
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                Build your career with a company that values military heritage, quality craftsmanship, and service to our community.
              </p>
            </div>
          </div>
        </section>

        {/* Company Culture */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto space-y-12">
            
            {/* Why Join Us */}
            <Card className="border-2 border-border rounded-none bg-primary/5">
              <CardHeader>
                <CardTitle className={cn(
                  "font-display tracking-wide uppercase text-center"
                )}>
                  Why Join Military Tees UK?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {benefits.map((benefit, index) => {
                    const IconComponent = benefit.icon
                    return (
                      <div key={index} className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-none border-2 border-primary flex items-center justify-center">
                          <IconComponent className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-2">{benefit.title}</h3>
                        <p className="text-sm text-muted-foreground">{benefit.description}</p>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Our Values */}
            <div className="text-center">
              <h2 className="text-3xl font-display font-bold text-foreground mb-6">Our Core Values</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="border-2 border-border rounded-none">
                  <CardContent className="p-6 text-center">
                    <h3 className="font-bold text-foreground mb-2">HONOR</h3>
                    <p className="text-sm text-muted-foreground">We conduct business with integrity and respect for military traditions.</p>
                  </CardContent>
                </Card>
                <Card className="border-2 border-border rounded-none">
                  <CardContent className="p-6 text-center">
                    <h3 className="font-bold text-foreground mb-2">QUALITY</h3>
                    <p className="text-sm text-muted-foreground">Excellence in everything we create, from designs to customer service.</p>
                  </CardContent>
                </Card>
                <Card className="border-2 border-border rounded-none">
                  <CardContent className="p-6 text-center">
                    <h3 className="font-bold text-foreground mb-2">SERVICE</h3>
                    <p className="text-sm text-muted-foreground">Dedicated to serving those who serve and their families.</p>
                  </CardContent>
                </Card>
                <Card className="border-2 border-border rounded-none">
                  <CardContent className="p-6 text-center">
                    <h3 className="font-bold text-foreground mb-2">COMMUNITY</h3>
                    <p className="text-sm text-muted-foreground">Building bonds within the military community and beyond.</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Open Positions */}
            <div>
              <h2 className="text-3xl font-display font-bold text-foreground mb-8">Open Positions</h2>
              <div className="space-y-6">
                {openPositions.map((position) => (
                  <Card key={position.id} className="border-2 border-border rounded-none">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl text-foreground mb-2">
                            {position.title}
                          </CardTitle>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <Badge variant="outline" className="rounded-none">
                              {position.department}
                            </Badge>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {position.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {position.type}
                            </span>
                          </div>
                        </div>
                        <Button className="rounded-none" disabled>
                          Apply Now
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-muted-foreground">{position.description}</p>
                        
                        <div>
                          <h4 className="font-medium text-foreground mb-2">Key Requirements:</h4>
                          <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
                            {position.requirements.map((req, index) => (
                              <li key={index}>{req}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* No Open Positions */}
            <Card className="border-2 border-border rounded-none bg-muted/10">
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  Don't See the Right Position?
                </h3>
                <p className="text-muted-foreground mb-6">
                  We're always looking for talented individuals who share our passion for military heritage and excellence. 
                  Send us your CV and let us know how you'd like to contribute to our mission.
                </p>
                <Button variant="outline" className="rounded-none border-2" disabled>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Your CV
                </Button>
              </CardContent>
            </Card>

            {/* Equal Opportunity */}
            <Card className="border-2 border-border rounded-none">
              <CardHeader>
                <CardTitle className={cn(
                  "font-display tracking-wide uppercase"
                )}>
                  Equal Opportunity Employer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  Military Tees UK is an equal opportunity employer committed to diversity and inclusion. We welcome applications from all qualified candidates regardless of race, gender, age, religion, sexual orientation, or any other protected characteristic.
                </p>
                <p>
                  We particularly encourage applications from veterans, serving military personnel, and military families who understand and share our commitment to military values and community.
                </p>
                <p>
                  All employment decisions are made based on qualifications, merit, and business needs. We are committed to providing a workplace free from discrimination and harassment.
                </p>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="border-2 border-border rounded-none bg-primary/5">
              <CardHeader>
                <CardTitle className={cn(
                  "font-display tracking-wide uppercase text-center"
                )}>
                  Ready to Join Our Team?
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Questions about careers at Military Tees UK? Our HR team is here to help.
                </p>
                
                <div className="space-y-2 text-sm">
                  <div><strong>Email:</strong> info@militarytees.co.uk</div>
                  <div><strong>Website:</strong> militarytees.co.uk/contact</div>
                  <div><strong>Hours:</strong> Monday - Friday, 9:00 AM - 5:00 PM GMT</div>
                </div>
                
                <Button className="rounded-none" disabled>
                  Contact HR Team
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </Layout>
  )
}