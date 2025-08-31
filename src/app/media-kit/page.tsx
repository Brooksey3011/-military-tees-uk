import { Layout } from "@/components/layout/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, Image, FileText, Users, Award, Briefcase } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Media Kit - Military Tees UK",
  description: "Download official Military Tees UK media assets, logos, and brand guidelines for press and partnership use.",
  openGraph: {
    title: "Media Kit - Military Tees UK",
    description: "Download official Military Tees UK media assets, logos, and brand guidelines for press and partnership use.",
    type: "website",
  },
}

const mediaAssets = [
  {
    title: "Logo Package",
    description: "Official logos in various formats and colors",
    icon: Image,
    items: ["PNG (High-res)", "SVG (Vector)", "Black & White versions", "Transparent backgrounds"],
    size: "2.4 MB"
  },
  {
    title: "Brand Guidelines",
    description: "Complete brand identity and usage guidelines",
    icon: FileText,
    items: ["Color palette", "Typography guide", "Logo usage rules", "Military design principles"],
    size: "1.8 MB"
  },
  {
    title: "Product Images",
    description: "High-resolution product photography",
    icon: Image,
    items: ["Lifestyle shots", "Product mockups", "Model photography", "Studio shots"],
    size: "15.2 MB"
  },
  {
    title: "Company Info",
    description: "Official company information and stats",
    icon: Briefcase,
    items: ["Company history", "Mission statement", "Key statistics", "Leadership bios"],
    size: "0.5 MB"
  }
]

const pressContacts = [
  {
    title: "General Press Inquiries",
    email: "info@militarytees.co.uk"
  },
  {
    title: "Partnership Opportunities", 
    email: "info@militarytees.co.uk"
  },
  {
    title: "Influencer Collaborations",
    email: "info@militarytees.co.uk"
  }
]

export default function MediaKitPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-muted/20 to-background">
        
        {/* Header Section */}
        <section className="py-16 border-b-2 border-border">
          <div className="container mx-auto px-4 text-center">
            <Badge className="rounded-none bg-purple-600 text-white mb-4">
              📰 PRESS & MEDIA
            </Badge>
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-wider uppercase text-foreground mb-4">
              Media Kit
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Official Military Tees UK media assets, brand guidelines, and company information for press and partnership use.
            </p>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              <div className="text-center p-6 bg-primary/5 border-2 border-primary/20">
                <div className="text-3xl font-bold text-primary">2025</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wide">Est. Year</div>
              </div>
              <div className="text-center p-6 bg-primary/5 border-2 border-primary/20">
                <div className="text-3xl font-bold text-primary">10K+</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wide">Customers</div>
              </div>
              <div className="text-center p-6 bg-primary/5 border-2 border-primary/20">
                <div className="text-3xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wide">Products</div>
              </div>
              <div className="text-center p-6 bg-primary/5 border-2 border-primary/20">
                <div className="text-3xl font-bold text-primary">98%</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wide">Satisfaction</div>
              </div>
            </div>
          </div>
        </section>

        {/* Media Assets */}
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-display font-bold text-center mb-12">
              Download Media Assets
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {mediaAssets.map((asset) => (
                <Card key={asset.title} className="border-2 border-border rounded-none">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 p-3 border-2 border-primary">
                        <asset.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="font-display font-bold">{asset.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{asset.description}</p>
                      </div>
                      <Badge variant="outline" className="rounded-none">
                        {asset.size}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-6">
                      {asset.items.map((item) => (
                        <li key={item} className="text-sm text-muted-foreground flex items-center gap-2">
                          <div className="w-1 h-1 bg-primary rounded-full" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className="w-full rounded-none font-display font-bold tracking-wide uppercase"
                      disabled
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Package
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      Contact press team for access
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Press Contacts */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-display font-bold text-center mb-12">
              Press Contacts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {pressContacts.map((contact) => (
                <Card key={contact.title} className="border-2 border-border rounded-none text-center">
                  <CardHeader>
                    <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                    <CardTitle className="font-display font-bold text-lg">
                      {contact.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Email Contact</p>
                      <a 
                        href={`mailto:${contact.email}`}
                        className="text-primary hover:text-primary/80 font-medium text-sm"
                      >
                        {contact.email}
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Brand Values */}
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-display font-bold text-center mb-12">
              Our Brand Values
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <Award className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-display font-bold mb-4">Quality</h3>
                <p className="text-muted-foreground">
                  Premium materials and attention to detail in every product we create.
                </p>
              </div>
              <div className="text-center">
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-display font-bold mb-4">Heritage</h3>
                <p className="text-muted-foreground">
                  Honoring British military tradition with authentic designs and respect.
                </p>
              </div>
              <div className="text-center">
                <Briefcase className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-display font-bold mb-4">Service</h3>
                <p className="text-muted-foreground">
                  Exceptional customer service inspired by military values of duty and honor.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-gradient-to-r from-primary to-secondary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-display font-bold mb-4">
              Ready to Work Together?
            </h2>
            <p className="text-xl opacity-90 mb-8">
              Contact our press team for media assets, interviews, or partnership opportunities
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="secondary"
                className="bg-background text-foreground hover:bg-background/90 rounded-none font-display font-bold tracking-wide uppercase"
                asChild
              >
                <Link href="mailto:info@militarytees.co.uk">
                  Contact Press Team
                </Link>
              </Button>
              <Button 
                variant="outline"
                className="bg-transparent border-2 border-background text-background hover:bg-background hover:text-foreground rounded-none font-display font-bold tracking-wide uppercase"
                asChild
              >
                <Link href="/contact">
                  General Contact
                </Link>
              </Button>
            </div>
          </div>
        </section>

      </div>
    </Layout>
  )
}