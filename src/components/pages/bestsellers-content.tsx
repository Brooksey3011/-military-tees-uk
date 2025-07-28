"use client"

import { Layout } from "@/components/layout/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

// Generate variants for bestseller products
function generateBestsellerVariants(productId: string) {
  const sizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"]
  const colors = ["black", "olive green", "white", "navy", "maroon", "brown", "sand", "green"]
  const variants = []
  
  for (const size of sizes) {
    for (const color of colors) {
      variants.push({
        id: `bestseller-${productId}-${size}-${color}`,
        size,
        color,
        stock_quantity: Math.floor(Math.random() * 15) + 3 // Random stock 3-17
      })
    }
  }
  
  return variants
}

// Mock data for bestsellers - will be replaced with real data from backend  
const bestsellers = [
  {
    id: "1",
    name: "Classic British Army Logo Tee",
    price: 22.99,
    compareAtPrice: 27.99,
    image: "/products/royal-marine-commando-tee.jpg",
    category: "British Army",
    slug: "classic-british-army-logo-tee",
    salesRank: 1,
    badge: "#1 BESTSELLER",
    variants: generateBestsellerVariants("1")
  },
  {
    id: "2",
    name: "Royal Navy Anchor Heritage",
    price: 24.99,
    image: "/products/raf-fighter-pilot-heritage.jpg", 
    category: "Royal Navy",
    slug: "royal-navy-anchor-heritage",
    rating: 4.7,
    reviewCount: 89,
    salesRank: 2,
    badge: "TOP SELLER",
    variants: generateBestsellerVariants("2")
  },
  {
    id: "3",
    name: "RAF Wings of Victory Design",
    price: 23.99,
    compareAtPrice: 28.99,
    image: "/products/raf-fighter-pilot-heritage.jpg",
    category: "Royal Air Force", 
    slug: "raf-wings-victory-design",
    rating: 4.9,
    reviewCount: 156,
    salesRank: 3,
    badge: "CUSTOMER FAVORITE",
    variants: generateBestsellerVariants("3")
  },
  {
    id: "4",
    name: "SAS Who Dares Wins Tribute",
    price: 26.99,
    image: "/products/sas-regiment-elite-tee.jpg",
    category: "Special Forces",
    slug: "sas-who-dares-wins-tribute", 
    rating: 4.6,
    reviewCount: 73,
    salesRank: 4,
    badge: "HIGHLY RATED",
    variants: generateBestsellerVariants("4")
  },
  {
    id: "5",
    name: "Remembrance Poppy Military",
    price: 21.99,
    compareAtPrice: 25.99,
    image: "/products/army-medic-corps-tribute.jpg",
    category: "Remembrance",
    slug: "remembrance-poppy-military",
    rating: 4.8,
    reviewCount: 201,
    salesRank: 5,
    badge: "MOST REVIEWED",
    variants: generateBestsellerVariants("5")
  },
  {
    id: "6",
    name: "Parachute Regiment Pride",
    price: 25.99,
    image: "/products/paratrooper-wings-design.jpg",
    category: "Parachute Regiment",
    slug: "parachute-regiment-pride",
    rating: 4.7,
    reviewCount: 94,
    salesRank: 6,
    badge: "TRENDING",
    variants: generateBestsellerVariants("6")
  }
]

export default function BestsellersContent() {
  return (
    <Layout>
      <div className="min-h-screen">
        {/* Header Section */}
        <section className="bg-gradient-to-b from-muted/20 to-background py-16 border-b-2 border-border">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <Badge className="rounded-none bg-gold-600 text-white mb-4">
                🏆 TOP PERFORMERS
              </Badge>
              <h1 className="text-4xl md:text-5xl font-display font-bold tracking-wider uppercase text-foreground mb-4">
                Bestsellers
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Our most popular military-themed designs. Proven favorites that have earned their stripes with customers across the UK.
              </p>
            </div>
            
            {/* Featured Collection Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-muted/30 p-6 border-2 border-border">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">Premium</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wide">Quality Materials</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">UK Made</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wide">British Crafted</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">Military</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wide">Heritage Inspired</div>
              </div>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {bestsellers.map((product) => (
                <Card key={product.id} className="hover:shadow-lg transition-shadow group border-2 border-border rounded-none relative">
                  {/* Sales Rank Badge */}
                  <div className="absolute -top-2 -left-2 bg-primary text-primary-foreground w-8 h-8 flex items-center justify-center text-sm font-bold z-10">
                    #{product.salesRank}
                  </div>
                  
                  <div className="relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-64 object-cover"
                    />
                    <Badge 
                      className={`absolute top-2 right-2 rounded-none font-bold ${
                        product.badge.includes('#1') ? 'bg-yellow-600' :
                        product.badge.includes('TOP') ? 'bg-blue-600' :
                        product.badge.includes('FAVORITE') ? 'bg-purple-600' :
                        product.badge.includes('RATED') ? 'bg-green-600' :
                        product.badge.includes('REVIEWED') ? 'bg-orange-600' :
                        'bg-red-600'
                      } text-white text-xs`}
                    >
                      {product.badge}
                    </Badge>
                  </div>
                  
                  <CardHeader className="p-4">
                    <CardTitle className="text-lg font-display font-bold mb-2">
                      {product.name}
                    </CardTitle>
                    
                    {/* Category Badge */}
                    <Badge variant="outline" className="rounded-none w-fit">
                      {product.category}
                    </Badge>
                  </CardHeader>
                  
                  <CardContent className="p-4 pt-0">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold">£{product.price}</span>
                        {product.compareAtPrice && (
                          <span className="text-sm text-muted-foreground line-through">
                            £{product.compareAtPrice}
                          </span>
                        )}
                      </div>
                      {product.compareAtPrice && (
                        <Badge variant="secondary" className="rounded-none">
                          SAVE £{(product.compareAtPrice - product.price).toFixed(2)}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        asChild 
                        className="flex-1 rounded-none font-display font-bold tracking-wide uppercase"
                      >
                        <Link href={`/products/${product.slug}`}>
                          View Details
                        </Link>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="px-4 rounded-none border-2"
                        onClick={() => {
                          // Add to cart functionality - will be implemented with backend
                          console.log('Add to cart:', product.id)
                        }}
                      >
                        🛒
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Collection Benefits */}
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-display font-bold text-center mb-12">
              Our Featured Collection
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl mb-4">🎨</div>
                <h3 className="text-xl font-display font-bold mb-2">Authentic Designs</h3>
                <p className="text-muted-foreground">
                  Military heritage-inspired designs created with respect for service and tradition.
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">🏭</div>
                <h3 className="text-xl font-display font-bold mb-2">UK Crafted</h3>
                <p className="text-muted-foreground">
                  Designed and crafted in Britain with premium materials and attention to detail.
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">💪</div>
                <h3 className="text-xl font-display font-bold mb-2">Premium Quality</h3>
                <p className="text-muted-foreground">
                  High-quality materials and printing that honor military standards of excellence.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-gradient-to-r from-primary to-secondary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-display font-bold mb-4">
              Start Your Military Heritage Collection
            </h2>
            <p className="text-xl opacity-90 mb-8">
              Discover premium military-inspired apparel crafted with pride and tradition
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="secondary" 
                size="lg"
                className="bg-background text-foreground hover:bg-background/90 rounded-none"
                asChild
              >
                <Link href="/categories">
                  Explore All Products
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="bg-transparent border-2 border-background text-background hover:bg-background hover:text-foreground rounded-none"
                asChild
              >
                <Link href="/new-arrivals">
                  See New Arrivals
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
}