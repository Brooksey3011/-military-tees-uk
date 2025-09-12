import { Metadata } from "next"
import Link from "next/link"
import { Shield, Anchor, Plane, Ship } from "lucide-react"
import { Layout } from "@/components/layout"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// British Armed Forces categories - matches navbar structure
const militaryBranches = [
  { 
    slug: "british-army", 
    name: "British Army", 
    description: "Infantry, armoured corps, and army regiment designs",
    longDescription: "Discover our collection celebrating the British Army's rich heritage. From the disciplined ranks of the infantry to the armoured might of tank regiments, these designs honor the traditions, courage, and brotherhood that define Britain's land forces.",
    icon: Shield,
    color: "text-green-600"
  },
  { 
    slug: "royal-marines", 
    name: "Royal Marines", 
    description: "Commando and amphibious warfare designs",
    longDescription: "Honor the Royal Marines' legendary legacy with our elite collection. From the beaches of D-Day to modern amphibious operations, these designs celebrate the courage, skill, and brotherhood of Britain's premier amphibious force.",
    icon: Anchor,
    color: "text-blue-600"
  },
  { 
    slug: "royal-air-force", 
    name: "Royal Air Force", 
    description: "RAF squadron and aviation designs",
    longDescription: "Soar with the Royal Air Force collection, celebrating the bravery and skill of Britain's airmen and women. From the Battle of Britain to modern air operations, these designs honor the RAF's proud heritage of defending the skies.",
    icon: Plane,
    color: "text-sky-600"
  },
  { 
    slug: "royal-navy", 
    name: "Royal Navy", 
    description: "Naval traditions and fleet designs",
    longDescription: "Navigate the Royal Navy collection, celebrating Britain's Senior Service and its proud maritime heritage. From Nelson's victories to modern fleet operations, these designs honor the sailors who have defended Britain's shores for centuries.",
    icon: Ship,
    color: "text-navy-600"
  }
]

export const metadata: Metadata = {
  title: "British Armed Forces Collections | Military Tees UK",
  description: "Explore our complete range of British Armed Forces themed apparel. From the British Army to Royal Navy, find designs that honor British military tradition and heritage.",
  keywords: ["military t-shirts", "british army", "royal navy", "royal air force", "royal marines", "military clothing", "british armed forces"],
  openGraph: {
    title: "British Armed Forces Collections | Military Tees UK",
    description: "Browse our British Armed Forces themed categories - Army, Navy, Air Force, and Marines",
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
            <span className="text-4xl">🇬🇧</span>
          </div>
          
          <h1 className={cn(
            "text-4xl md:text-6xl font-display font-bold text-foreground mb-4",
            "tracking-wider uppercase", // Military stencil feel
            "text-shadow-sm"
          )}>
            British Armed Forces
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6 leading-relaxed">
            Explore our military collections celebrating the courage, tradition, and heritage of Britain's Armed Forces. 
            Each collection honors the unique culture and proud service of our military branches.
          </p>
          
          <div className="flex justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="rounded-none">
                {militaryBranches.length}
              </Badge>
              <span>Military Branches</span>
            </div>
          </div>
        </div>
      </section>

      {/* Military Branches Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-2 gap-4 md:gap-8 max-w-4xl mx-auto">
          {militaryBranches.map((branch) => {
            const IconComponent = branch.icon
            
            return (
              <Link 
                key={branch.slug}
                href={`/categories/${branch.slug}`}
                className="group"
              >
                <Card className={cn(
                  "h-full transition-all duration-200",
                  "border-2 border-border hover:border-primary",
                  "rounded-none", // Sharp military styling
                  "group-hover:shadow-lg group-hover:-translate-y-1"
                )}>
                  <CardContent className="p-4 md:p-8">
                    {/* Icon */}
                    <div className={cn(
                      "mb-3 md:mb-6 p-2 md:p-4",
                      "border border-muted-foreground/20",
                      "rounded-none",
                      "bg-muted/20 group-hover:bg-primary/10 transition-colors"
                    )}>
                      <IconComponent className={cn(
                        "h-6 w-6 md:h-10 md:w-10 group-hover:text-primary transition-colors",
                        branch.color
                      )} />
                    </div>
                    
                    {/* Branch Info */}
                    <h3 className={cn(
                      "text-sm md:text-xl font-display font-bold text-foreground mb-2 md:mb-3",
                      "tracking-wide", // Military stencil feel
                      "group-hover:text-primary transition-colors"
                    )}>
                      {branch.name}
                    </h3>
                    
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed mb-2 md:mb-4">
                      {branch.description}
                    </p>
                    
                    <p className="hidden md:block text-xs text-muted-foreground leading-relaxed mb-6">
                      {branch.longDescription}
                    </p>
                    
                    {/* Branch Action */}
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          "rounded-none text-xs",
                          "group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                        )}
                      >
                        Browse Collection
                      </Badge>
                      
                      <div className="text-primary group-hover:translate-x-1 transition-transform text-lg">
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
            Proudly Serving Those Who Serve
          </h2>
          
          <p className="text-muted-foreground max-w-lg mx-auto mb-8">
            Can't find what you're looking for? Explore our custom orders service or browse our 
            memorial and veterans collections for specialized military designs.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/custom"
              className={cn(
                "inline-flex items-center justify-center gap-2",
                "px-8 py-3 bg-primary text-primary-foreground",
                "border-2 border-primary rounded-none",
                "font-display font-bold tracking-wide uppercase",
                "hover:bg-primary/90 transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-primary/20"
              )}
            >
              Custom Orders
            </Link>
            
            <Link 
              href="/memorial"
              className={cn(
                "inline-flex items-center justify-center gap-2",
                "px-8 py-3 bg-background text-foreground",
                "border-2 border-border rounded-none",
                "font-display font-bold tracking-wide uppercase",
                "hover:border-primary hover:text-primary transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-primary/20"
              )}
            >
              Memorial Collection
            </Link>
          </div>
        </div>
      </section>
      </div>
    </Layout>
  )
}