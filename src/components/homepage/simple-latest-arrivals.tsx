import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Star } from "lucide-react"

export function SimpleLatestArrivals() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-display font-bold mb-4 flex items-center justify-center gap-2">
            <Star className="text-primary" />
            Latest Arrivals
            <Star className="text-primary" />
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover our newest military-themed apparel and accessories
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
          {/* Featured Product Cards */}
          <div className="bg-muted/30 rounded-lg p-8 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="h-8 w-8 text-primary-foreground" />
            </div>
            <h3 className="font-bold text-lg mb-2">New Military Collection</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Fresh designs inspired by British military heritage
            </p>
            <div className="text-primary font-semibold">From £19.99</div>
          </div>
          
          <div className="bg-muted/30 rounded-lg p-8 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="h-8 w-8 text-primary-foreground" />
            </div>
            <h3 className="font-bold text-lg mb-2">Premium T-Shirts</h3>
            <p className="text-sm text-muted-foreground mb-4">
              High-quality cotton with authentic military designs
            </p>
            <div className="text-primary font-semibold">From £24.99</div>
          </div>
          
          <div className="bg-muted/30 rounded-lg p-8 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="h-8 w-8 text-primary-foreground" />
            </div>
            <h3 className="font-bold text-lg mb-2">Tactical Accessories</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Complete your look with military-grade accessories
            </p>
            <div className="text-primary font-semibold">From £14.99</div>
          </div>
        </div>
        
        <div className="text-center">
          <Button size="lg" className="font-display font-bold uppercase tracking-wide" asChild>
            <Link href="/products">
              View All Products
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}