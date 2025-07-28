import { Metadata } from "next"
import Link from "next/link"
import { Shield, MapPin, Users, Truck, Radio, Target, Building, Dumbbell, Lock, Award, Package, GraduationCap, Home, Crosshair, Heart, Store } from "lucide-react"
import { Layout } from "@/components/layout"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Categories data from navbar - following military camp theme
const categories = [
  { 
    slug: "armoury", 
    name: "Armoury", 
    description: "Tactical and combat gear themed tees",
    icon: Shield
  },
  { 
    slug: "regimental-hq", 
    name: "Regimental HQ", 
    description: "Command and leadership designs",
    icon: MapPin
  },
  { 
    slug: "mess-hall", 
    name: "Mess Hall", 
    description: "Military dining and camaraderie",
    icon: Users
  },
  { 
    slug: "parade-square", 
    name: "Parade Square", 
    description: "Ceremonial and dress uniform styles",
    icon: Award
  },
  { 
    slug: "med-centre", 
    name: "Med Centre", 
    description: "Military medical corps designs",
    icon: Heart
  },
  { 
    slug: "mt", 
    name: "Motor Transport", 
    description: "Vehicle and logistics themed",
    icon: Truck
  },
  { 
    slug: "signals", 
    name: "Signals", 
    description: "Communications corps gear",
    icon: Radio
  },
  { 
    slug: "ops-room", 
    name: "Operations Room", 
    description: "Strategic operations themed",
    icon: Target
  },
  { 
    slug: "naafi", 
    name: "NAAFI", 
    description: "Navy, Army and Air Force Institutes",
    icon: Store
  },
  { 
    slug: "gym", 
    name: "Gym", 
    description: "Physical training and fitness",
    icon: Dumbbell
  },
  { 
    slug: "guard-room", 
    name: "Guard Room", 
    description: "Security and duty themed",
    icon: Lock
  },
  { 
    slug: "sgts-mess", 
    name: "Sergeants' Mess", 
    description: "NCO and leadership designs",
    icon: Award
  },
  { 
    slug: "stores", 
    name: "The Stores", 
    description: "Supply and logistics gear",
    icon: Package
  },
  { 
    slug: "training-wing", 
    name: "Training Wing", 
    description: "Military education and training",
    icon: GraduationCap
  },
  { 
    slug: "block", 
    name: "The Block", 
    description: "Barracks and accommodation themed",
    icon: Building
  },
  { 
    slug: "ranges", 
    name: "The Ranges", 
    description: "Shooting and marksmanship designs",
    icon: Crosshair
  },
  { 
    slug: "civvy-street", 
    name: "Civvy Street", 
    description: "Civilian life transition gear",
    icon: Home
  },
  { 
    slug: "g10-stores", 
    name: "G10 Stores", 
    description: "General stores and supplies",
    icon: Package
  }
]

export const metadata: Metadata = {
  title: "Camp Map - Browse All Categories | Military Tees UK",
  description: "Explore our complete range of military-themed t-shirt categories. From the Armoury to Civvy Street, find designs that honor British military tradition.",
  keywords: ["military t-shirts", "british army", "military clothing", "tactical gear", "military categories"],
  openGraph: {
    title: "Military T-Shirt Categories - Camp Map",
    description: "Browse our military-themed categories inspired by British Army bases and units",
    type: "website",
  }
}

export default function CategoriesPage() {
  
  return (
    <Layout>
      <div className="min-h-screen bg-background">
      {/* Hero Section - Military styled */}
      <section className="border-b-2 border-border bg-muted/10">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className={cn(
            "inline-block p-4 mb-6",
            "border-2 border-primary",
            "rounded-none", // Sharp military edges
            "bg-background"
          )}>
            <MapPin className="h-12 w-12 text-primary mx-auto" />
          </div>
          
          <h1 className={cn(
            "text-4xl md:text-6xl font-display font-bold text-foreground mb-4",
            "tracking-wider uppercase", // Military stencil feel
            "text-shadow-sm"
          )}>
            Camp Map
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6 leading-relaxed">
            Navigate through our military-inspired collection. Each category represents a different area 
            of camp life, from tactical operations to everyday military culture.
          </p>
          
          <div className="flex justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="rounded-none">
                {categories.length}
              </Badge>
              <span>Categories Available</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category) => {
            const IconComponent = category.icon
            
            return (
              <Link 
                key={category.slug}
                href={`/categories/${category.slug}`}
                className="group"
              >
                <Card className={cn(
                  "h-full transition-all duration-200",
                  "border-2 border-border hover:border-primary",
                  "rounded-none", // Sharp military styling
                  "group-hover:shadow-lg group-hover:-translate-y-1"
                )}>
                  <CardContent className="p-6">
                    {/* Icon */}
                    <div className={cn(
                      "mb-4 p-3",
                      "border border-muted-foreground/20",
                      "rounded-none",
                      "bg-muted/20 group-hover:bg-primary/10 transition-colors"
                    )}>
                      <IconComponent className="h-8 w-8 text-primary group-hover:text-primary" />
                    </div>
                    
                    {/* Category Info */}
                    <h3 className={cn(
                      "text-lg font-display font-semibold text-foreground mb-2",
                      "tracking-wide", // Military stencil feel
                      "group-hover:text-primary transition-colors"
                    )}>
                      {category.name}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      {category.description}
                    </p>
                    
                    {/* Category Action */}
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          "rounded-none text-xs",
                          "group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                        )}
                      >
                        View Category
                      </Badge>
                      
                      <div className="text-primary group-hover:translate-x-1 transition-transform">
                        →
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t-2 border-border bg-muted/10">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className={cn(
            "text-2xl md:text-3xl font-display font-bold text-foreground mb-4",
            "tracking-wider uppercase"
          )}>
            Can't Find What You're Looking For?
          </h2>
          
          <p className="text-muted-foreground max-w-lg mx-auto mb-8">
            Browse all our products or use our advanced search to find specific designs, 
            sizes, or themes across our entire collection.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/products"
              className={cn(
                "inline-flex items-center justify-center gap-2",
                "px-8 py-3 bg-primary text-primary-foreground",
                "border-2 border-primary rounded-none",
                "font-medium tracking-wide",
                "hover:bg-primary/90 transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-primary/20"
              )}
            >
              <Package className="h-4 w-4" />
              Browse All Products
            </Link>
            
            <Link 
              href="/custom"
              className={cn(
                "inline-flex items-center justify-center gap-2",
                "px-8 py-3 bg-background text-foreground",
                "border-2 border-border rounded-none",
                "font-medium tracking-wide",
                "hover:border-primary hover:text-primary transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-primary/20"
              )}
            >
              <Award className="h-4 w-4" />
              Custom Orders
            </Link>
          </div>
        </div>
      </section>
      </div>
    </Layout>
  )
}