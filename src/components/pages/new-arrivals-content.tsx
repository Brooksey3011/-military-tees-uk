"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ProductGrid } from "@/components/product/product-grid"
import Link from "next/link"

// Mock data for new arrivals - will be replaced with real data from backend
const newArrivals = [
  {
    id: "1",
    name: "Royal Marine Commando Tee",
    slug: "royal-marine-commando-tee",
    price: 24.99,
    main_image_url: "/images/products/placeholder-tshirt.svg",
    category_id: "royal-marines",
    description: "Elite Royal Marine Commando design celebrating amphibious warfare excellence",
    variants: [
      {
        id: "1-1",
        size: "S",
        color: "Black",
        stockQuantity: 12,
        imageUrls: ["/images/products/placeholder-tshirt.svg"]
      },
      {
        id: "1-2",
        size: "M", 
        color: "Black",
        stockQuantity: 15,
        imageUrls: ["/images/products/placeholder-tshirt.svg"]
      },
      {
        id: "1-3",
        size: "L",
        color: "Black", 
        stockQuantity: 10,
        imageUrls: ["/images/products/placeholder-tshirt.svg"]
      }
    ]
  },
  {
    id: "2", 
    name: "SAS Regiment Elite Tee",
    slug: "sas-regiment-elite-tee",
    price: 27.99,
    main_image_url: "/images/products/placeholder-tshirt.svg",
    category_id: "special-forces",
    description: "Special Air Service tribute design for the elite of the elite",
    variants: [
      {
        id: "2-1",
        size: "S",
        color: "Army Green",
        stockQuantity: 8,
        imageUrls: ["/images/products/placeholder-tshirt.svg"]
      },
      {
        id: "2-2",
        size: "M",
        color: "Army Green", 
        stockQuantity: 12,
        imageUrls: ["/images/products/placeholder-tshirt.svg"]
      },
      {
        id: "2-3",
        size: "L",
        color: "Army Green",
        stockQuantity: 9,
        imageUrls: ["/images/products/placeholder-tshirt.svg"]
      }
    ]
  },
  {
    id: "3",
    name: "Paratrooper Wings Design",
    slug: "paratrooper-wings-design",
    price: 25.99,
    main_image_url: "/images/products/placeholder-tshirt.svg",
    category_id: "parachute-regiment",
    description: "Airborne excellence with Parachute Regiment wings insignia",
    variants: [
      {
        id: "3-1",
        size: "S",
        color: "Navy",
        stockQuantity: 14,
        imageUrls: ["/images/products/placeholder-tshirt.svg"]
      },
      {
        id: "3-2",
        size: "M",
        color: "Navy",
        stockQuantity: 18,
        imageUrls: ["/images/products/placeholder-tshirt.svg"]
      },
      {
        id: "3-3",
        size: "L", 
        color: "Navy",
        stockQuantity: 11,
        imageUrls: ["/images/products/placeholder-tshirt.svg"]
      }
    ]
  },
  {
    id: "4",
    name: "Army Medic Corps Tribute",
    slug: "army-medic-corps-tribute",
    price: 23.99,
    main_image_url: "/images/products/placeholder-tshirt.svg",
    category_id: "medical-corps",
    description: "Honoring military medical professionals and battlefield medics",
    variants: [
      {
        id: "4-1",
        size: "S",
        color: "Black",
        stockQuantity: 16,
        imageUrls: ["/images/products/placeholder-tshirt.svg"]
      },
      {
        id: "4-2",
        size: "M",
        color: "Black",
        stockQuantity: 20,
        imageUrls: ["/images/products/placeholder-tshirt.svg"]
      },
      {
        id: "4-3",
        size: "L",
        color: "Black",
        stockQuantity: 13,
        imageUrls: ["/images/products/placeholder-tshirt.svg"]
      }
    ]
  },
  {
    id: "5",
    name: "RAF Fighter Pilot Heritage",
    slug: "raf-fighter-pilot-heritage", 
    price: 26.99,
    main_image_url: "/images/products/placeholder-tshirt.svg",
    category_id: "royal-air-force",
    description: "Royal Air Force fighter pilot heritage celebrating aviation excellence",
    variants: [
      {
        id: "5-1",
        size: "S",
        color: "Navy",
        stockQuantity: 9,
        imageUrls: ["/images/products/placeholder-tshirt.svg"]
      },
      {
        id: "5-2",
        size: "M",
        color: "Navy",
        stockQuantity: 14,
        imageUrls: ["/images/products/placeholder-tshirt.svg"]
      },
      {
        id: "5-3",
        size: "L",
        color: "Navy",
        stockQuantity: 7,
        imageUrls: ["/images/products/placeholder-tshirt.svg"]
      }
    ]
  },
  {
    id: "6",
    name: "Gurkha Regiment Honor",
    slug: "gurkha-regiment-honor",
    price: 28.99,
    main_image_url: "/images/products/placeholder-tshirt.svg", 
    category_id: "infantry",
    description: "Tribute to the legendary courage and loyalty of Gurkha soldiers",
    variants: [
      {
        id: "6-1",
        size: "S",
        color: "Army Green",
        stockQuantity: 6,
        imageUrls: ["/images/products/placeholder-tshirt.svg"]
      },
      {
        id: "6-2",
        size: "M",
        color: "Army Green",
        stockQuantity: 11,
        imageUrls: ["/images/products/placeholder-tshirt.svg"]
      },
      {
        id: "6-3",
        size: "L",
        color: "Army Green",
        stockQuantity: 8,
        imageUrls: ["/images/products/placeholder-tshirt.svg"]
      }
    ]
  }
]

export function NewArrivalsContent() {
  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <section className="bg-gradient-to-b from-muted/20 to-background py-16 border-b-2 border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <Badge className="rounded-none bg-green-600 text-white mb-4">
              🆕 FRESH STOCK
            </Badge>
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-wider uppercase text-foreground mb-4">
              New Arrivals
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The latest additions to our military-themed collection. Premium quality designs inspired by British Armed Forces heritage.
            </p>
          </div>
          
          {/* Filter/Sort Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-muted/30 p-4 border-2 border-border">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Showing {newArrivals.length} new products</span>
            </div>
            <div className="flex items-center gap-4">
              <select className="px-3 py-2 border-2 border-border bg-background rounded-none">
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name A-Z</option>
              </select>
              <Button variant="outline" className="rounded-none border-2">
                Filter
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <ProductGrid
            products={newArrivals}
            columns={{
              mobile: 1,
              tablet: 2,
              desktop: 3
            }}
          />
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-primary to-secondary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-display font-bold mb-4">
            More Military Gear Awaits
          </h2>
          <p className="text-xl opacity-90 mb-8">
            Explore our full collection of premium military-themed apparel
          </p>
          <Button 
            variant="secondary" 
            size="lg"
            className="bg-background text-foreground hover:bg-background/90 rounded-none"
            asChild
          >
            <Link href="/categories">
              Browse All Categories
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}