import { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Plane, Cloud } from "lucide-react"
import { Layout } from "@/components/layout"
import { ClientOnly } from "@/components/ui/client-only"
import { cn } from "@/lib/utils"
import { RoyalAirForceProducts } from "@/components/pages/royal-air-force-products"

export const metadata: Metadata = {
  title: "Royal Air Force Collection | Military Tees UK",
  description: "Discover our premium Royal Air Force themed apparel collection. RAF squadron and aviation designs celebrating air force traditions.",
  keywords: [
    "Royal Air Force t-shirts", "RAF clothing", "aviation apparel", "air force designs", 
    "squadron clothing", "pilot apparel", "RAF merchandise", "aviation themed clothing"
  ],
  openGraph: {
    title: "Royal Air Force Collection | Military Tees UK",
    description: "Premium Royal Air Force themed apparel - RAF squadron and aviation designs",
    type: "website",
  },
}

export default function RoyalAirForcePage() {
  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Breadcrumb Navigation */}
        <div className="border-b border-border/50 bg-muted/10">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link 
                href="/" 
                className="hover:text-foreground transition-colors"
              >
                Home
              </Link>
              <span>/</span>
              <Link 
                href="/categories" 
                className="hover:text-foreground transition-colors"
              >
                British Armed Forces
              </Link>
              <span>/</span>
              <span className="text-foreground font-medium">Royal Air Force</span>
            </nav>
          </div>
        </div>

        {/* Category Header */}
        <section className="border-b-2 border-border bg-muted/10">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl">
              <Link 
                href="/categories"
                className={cn(
                  "inline-flex items-center gap-2 text-sm text-muted-foreground",
                  "hover:text-foreground transition-colors mb-6"
                )}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to British Armed Forces
              </Link>
              
              <div className="flex items-center gap-4 mb-6">
                <div className={cn(
                  "inline-block p-4",
                  "border-2 border-primary",
                  "rounded-none bg-background"
                )}>
                  <Plane className="h-12 w-12 text-primary" />
                </div>
                <div>
                  <h1 className={cn(
                    "text-3xl md:text-5xl font-display font-bold text-foreground mb-2",
                    "tracking-wider uppercase"
                  )}>
                    Royal Air Force
                  </h1>
                  <p className="text-xl text-muted-foreground">
                    RAF squadron and aviation designs
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="flex items-center gap-3 p-4 border border-border rounded-none bg-background">
                  <Plane className="h-6 w-6 text-primary" />
                  <div>
                    <div className="font-semibold text-foreground">Fighter Squadrons</div>
                    <div className="text-sm text-muted-foreground">Fast jets & air superiority</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 border border-border rounded-none bg-background">
                  <Cloud className="h-6 w-6 text-primary" />
                  <div>
                    <div className="font-semibold text-foreground">Transport Command</div>
                    <div className="text-sm text-muted-foreground">Strategic & tactical airlift</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 border border-border rounded-none bg-background">
                  <Plane className="h-6 w-6 text-primary" />
                  <div>
                    <div className="font-semibold text-foreground">Ground Crew</div>
                    <div className="text-sm text-muted-foreground">Engineering & support</div>
                  </div>
                </div>
              </div>
              
              <p className="text-muted-foreground leading-relaxed">
                Soar with the Royal Air Force collection, celebrating the bravery and skill of Britain's airmen and women. 
                From the Battle of Britain to modern air operations, these designs honor the RAF's proud heritage of defending 
                the skies. Whether you're celebrating fighter pilots, transport crews, or ground support, each piece reflects 
                the motto "Per Ardua ad Astra" - Through Adversity to the Stars.
              </p>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <div className="container mx-auto px-4 py-8">
          <ClientOnly fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="bg-gray-100 h-96 rounded animate-pulse"></div>
              ))}
            </div>
          }>
            <RoyalAirForceProducts />
          </ClientOnly>
        </div>
      </div>
    </Layout>
  )
}