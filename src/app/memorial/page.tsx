import { Metadata } from "next"
import Link from "next/link"
import { Heart, Star, Flag, Crown, Shield, Edit } from "lucide-react"
import { Layout } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Honouring the Fallen - Memorial Collection | Military Tees UK",
  description: "Pay tribute to those who made the ultimate sacrifice with our memorial collection. Designs that honour fallen heroes and preserve their memory with dignity and respect.",
  keywords: ["military memorial", "remembrance", "fallen heroes", "military tribute", "poppy collection"],
  openGraph: {
    title: "Honouring the Fallen - Memorial Collection",
    description: "Tribute and remembrance designs honouring military heroes",
    type: "website",
  }
}

const memorialCollections = [
  {
    id: "remembrance",
    name: "Remembrance Collection",
    description: "Poppy designs and remembrance tributes",
    icon: Heart,
    isCustom: false
  },
  {
    id: "fallen-heroes",
    name: "Fallen Heroes",
    description: "Honouring those who gave their all",
    icon: Star,
    isCustom: false
  },
  {
    id: "regimental-honours",
    name: "Regimental Honours",
    description: "Celebrating decorated units and medals",
    icon: Crown,
    isCustom: false
  },
  {
    id: "battlefield-memorials",
    name: "Battlefield Memorials", 
    description: "Historic battlefields and monuments",
    icon: Flag,
    isCustom: false
  },
  {
    id: "service-tributes",
    name: "Service Tributes",
    description: "Honouring all branches of service",
    icon: Shield,
    isCustom: false
  },
  {
    id: "custom-memorial",
    name: "Custom Memorial Design",
    description: "Personalized tributes for your fallen heroes",
    icon: Edit,
    isCustom: true
  }
]

export default function MemorialPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className={cn(
        "relative border-b-2 border-border",
        "bg-gradient-to-b from-muted/20 to-background"
      )}>
        {/* Poppy Background Pattern - Subtle */}
        <div className="absolute inset-0 opacity-5">
          <div className="h-full w-full bg-[url('/icons/poppy-pattern.svg')] bg-repeat bg-center"></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-20 text-center">
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
                Honouring the Fallen
              </h1>
              <p className="text-xl text-muted-foreground font-display tracking-wide">
                Memorial Collection
              </p>
            </div>
          </div>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
            We remember those who made the ultimate sacrifice in service to their country. 
            These designs serve as lasting tributes to fallen heroes, ensuring their memory 
            and sacrifice are never forgotten.
          </p>
          
          <div className="flex justify-center items-center gap-8 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">Memorial</div>
              <div className="text-sm text-muted-foreground">Designs</div>
            </div>
            <div className="h-8 w-px bg-border"></div>
            <div>
              <div className="text-2xl font-bold text-primary">Forever</div>
              <div className="text-sm text-muted-foreground">Remembered</div>
            </div>
          </div>
          
        </div>
      </section>

      {/* Memorial Collections */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className={cn(
            "text-3xl font-display font-bold text-foreground mb-4",
            "tracking-wider uppercase"
          )}>
            Memorial Collections
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Each collection tells a story of sacrifice, honour, and remembrance. 
            Choose designs that resonate with your heart and help preserve the memory of heroes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {memorialCollections.map((collection) => {
            const IconComponent = collection.icon
            
            return (
              <Card 
                key={collection.id}
                className={cn(
                  "group h-full transition-all duration-300",
                  "border-2 border-border hover:border-primary",
                  "rounded-none shadow-sm hover:shadow-lg"
                )}
              >
                <CardContent className="p-8 text-center">
                  <div className={cn(
                    "mb-6 p-4 mx-auto w-fit",
                    "border border-muted-foreground/20",
                    "rounded-none bg-muted/20",
                    "group-hover:bg-primary/10 group-hover:border-primary/30",
                    "transition-colors"
                  )}>
                    <IconComponent className="h-12 w-12 text-primary" />
                  </div>
                  
                  <h3 className={cn(
                    "text-xl font-display font-semibold text-foreground mb-3",
                    "tracking-wide group-hover:text-primary transition-colors"
                  )}>
                    {collection.name}
                  </h3>
                  
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {collection.description}
                  </p>
                  
                  <Link href={collection.isCustom ? "/custom" : `/products?category=memorial&collection=${collection.id}`}>
                    <Button 
                      variant="outline" 
                      className={cn(
                        "w-full rounded-none border-2",
                        "group-hover:border-primary group-hover:text-primary",
                        "transition-colors"
                      )}
                    >
                      {collection.isCustom ? "Start Custom Design" : "View Collection"}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Remembrance Information */}
      <section className="border-t-2 border-border bg-muted/10">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className={cn(
                "text-3xl font-display font-bold text-foreground mb-6",
                "tracking-wider uppercase"
              )}>
                They Shall Not Be Forgotten
              </h2>
              
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  At the going down of the sun and in the morning, we will remember them. 
                  Our memorial collection serves as a permanent tribute to those who gave 
                  their lives in service to their country and fellow comrades.
                </p>
                
                <p>
                  Each design is crafted with the utmost respect and dignity, ensuring 
                  that the memory of our fallen heroes lives on through thoughtful 
                  tributes that honour their sacrifice.
                </p>
                
                <p>
                  Whether worn during remembrance ceremonies, military gatherings, or 
                  as everyday reminders of their legacy, these pieces connect us to 
                  the values of duty, honour, and sacrifice that they embodied.
                </p>
              </div>
              
              <div className="mt-8 p-6 border-l-4 border-primary bg-primary/5 rounded-none">
                <p className="text-sm text-muted-foreground italic">
                  &ldquo;Greater love has no one than this: to lay down one's life for one's friends.&rdquo;
                  <br />
                  <span className="font-medium">— John 15:13</span>
                </p>
              </div>
            </div>
            
            <div className={cn(
              "bg-card border-2 border-border p-8 rounded-none"
            )}>
              <h3 className={cn(
                "text-xl font-display font-semibold text-foreground mb-6",
                "tracking-wide uppercase text-center"
              )}>
                Supporting Our Heroes
              </h3>
              
              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <Heart className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Memorial Respect</p>
                    <p className="text-muted-foreground">
                      Each design created with dignity and respect for fallen heroes
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Flag className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Remembrance Events</p>
                    <p className="text-muted-foreground">
                      Special designs for Remembrance Day and memorial services
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Quality Promise</p>
                    <p className="text-muted-foreground">
                      Premium materials ensuring lasting tributes worthy of their memory
                    </p>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className={cn(
          "text-2xl md:text-3xl font-display font-bold text-foreground mb-6",
          "tracking-wider uppercase"
        )}>
          Honour Their Memory
        </h2>
        
        <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
          Choose from our respectful collection of memorial designs, each created 
          to honour the fallen and support their families and fellow veterans.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/products?category=memorial">
            <Button size="lg" className="rounded-none px-8">
              <Heart className="h-4 w-4 mr-2" />
              Shop Memorial Collection
            </Button>
          </Link>
          
          <Link href="/custom">
            <Button variant="outline" size="lg" className="rounded-none border-2 px-8">
              <Star className="h-4 w-4 mr-2" />
              Custom Memorial Design
            </Button>
          </Link>
        </div>
      </section>
      </div>
    </Layout>
  )
}