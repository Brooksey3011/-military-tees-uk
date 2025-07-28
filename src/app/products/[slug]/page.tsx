import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Star } from "lucide-react"
import { Layout } from "@/components/layout"
import { ProductImageGallery } from "@/components/product/product-image-gallery"
import { ProductDetailsClient } from "@/components/product/product-details-client"
import { ProductPageSkeleton } from "@/components/ui"
import { cn } from "@/lib/utils"

// TODO: Replace with actual Supabase data fetching
interface ProductPageProps {
  params: Promise<{
    slug: string
  }>
}

// Mock product data - TODO: Replace with Supabase query
const mockProduct = {
  id: "1",
  name: "No Man Left Behind - Classic Tee",
  slug: "no-man-left-behind-classic",
  description: "A powerful tribute to the military ethos of never abandoning a comrade. This design embodies the unwavering loyalty and brotherhood that defines military service.",
  longDescription: `The "No Man Left Behind" ethos is fundamental to military culture worldwide. This design pays tribute to the sacred promise that no soldier fights alone, and none are forgotten. 

Crafted with premium materials and featuring a bold, military-inspired design, this t-shirt serves as both a statement piece and a reminder of the values that bind military communities together.

Whether you're a serving member, veteran, or simply someone who respects military values, this piece connects you to a tradition of honour, loyalty, and sacrifice.`,
  price: 24.99,
  compareAtPrice: 29.99,
  mainImageUrl: "/images/products/placeholder-tshirt.svg",
  category: {
    id: "1", 
    name: "Regimental HQ",
    slug: "regimental-hq"
  },
  variants: [
    { 
      id: "1", 
      size: "S", 
      color: "Black", 
      sku: "NMLB-BLK-S", 
      stockQuantity: 15,
      imageUrls: ["/images/products/placeholder-tshirt.svg"]
    },
    { 
      id: "2", 
      size: "M", 
      color: "Black", 
      sku: "NMLB-BLK-M", 
      stockQuantity: 20,
      imageUrls: ["/images/products/placeholder-tshirt.svg"]
    },
    { 
      id: "3", 
      size: "L", 
      color: "Black", 
      sku: "NMLB-BLK-L", 
      stockQuantity: 18,
      imageUrls: ["/images/products/placeholder-tshirt.svg"]
    },
    { 
      id: "4", 
      size: "XL", 
      color: "Black", 
      sku: "NMLB-BLK-XL", 
      stockQuantity: 12,
      imageUrls: ["/images/products/placeholder-tshirt.svg"]
    },
    // Army Green variants
    { 
      id: "5", 
      size: "S", 
      color: "Army Green", 
      sku: "NMLB-GRN-S", 
      stockQuantity: 10,
      imageUrls: ["/images/products/placeholder-tshirt.svg"]
    },
    { 
      id: "6", 
      size: "M", 
      color: "Army Green", 
      sku: "NMLB-GRN-M", 
      stockQuantity: 15,
      imageUrls: ["/images/products/placeholder-tshirt.svg"]
    },
    { 
      id: "7", 
      size: "L", 
      color: "Army Green", 
      sku: "NMLB-GRN-L", 
      stockQuantity: 12,
      imageUrls: ["/images/products/placeholder-tshirt.svg"]
    },
    { 
      id: "8", 
      size: "XL", 
      color: "Army Green", 
      sku: "NMLB-GRN-XL", 
      stockQuantity: 8,
      imageUrls: ["/images/products/placeholder-tshirt.svg"]
    },
    // Navy variants
    { 
      id: "9", 
      size: "S", 
      color: "Navy", 
      sku: "NMLB-NVY-S", 
      stockQuantity: 8,
      imageUrls: ["/images/products/placeholder-tshirt.svg"]
    },
    { 
      id: "10", 
      size: "M", 
      color: "Navy", 
      sku: "NMLB-NVY-M", 
      stockQuantity: 12,
      imageUrls: ["/images/products/placeholder-tshirt.svg"]
    },
    { 
      id: "11", 
      size: "L", 
      color: "Navy", 
      sku: "NMLB-NVY-L", 
      stockQuantity: 10,
      imageUrls: ["/images/products/placeholder-tshirt.svg"]
    },
    { 
      id: "12", 
      size: "XL", 
      color: "Navy", 
      sku: "NMLB-NVY-XL", 
      stockQuantity: 6,
      imageUrls: ["/images/products/placeholder-tshirt.svg"]
    }
  ],
  reviews: [
    {
      id: "1",
      rating: 5,
      comment: "Excellent quality and powerful message. Proud to wear this.",
      customerName: "Mark S.",
      createdAt: "2024-01-15"
    }
  ]
}

// Generate static params for products - will use database in production
export async function generateStaticParams() {
  // In production, this would fetch from Supabase
  // For now, return empty array to generate on-demand
  return [];
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  // TODO: Fetch actual product from Supabase
  const product = mockProduct // This should be actual data
  
  if (!product) {
    return {
      title: "Product Not Found | Military Tees UK"
    }
  }

  return {
    title: `${product.name} | Military Tees UK`,
    description: product.description,
    keywords: [product.name, "military t-shirt", "british army", product.category.name],
    openGraph: {
      title: product.name,
      description: product.description,
      images: [{ url: product.mainImageUrl }],
      type: "website",
    }
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  // TODO: Replace with actual Supabase data fetching
  const { slug } = await params
  const isLoading = false
  const product = mockProduct // This should come from database
  
  if (isLoading) {
    return <ProductPageSkeleton />
  }
  
  if (!product) {
    notFound()
  }

  const averageRating = product.reviews?.length 
    ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length 
    : 0

  const images = [product.mainImageUrl] // TODO: Add more product images

  return (
    <Layout>
      <div className="min-h-screen bg-background">
      {/* Breadcrumb Navigation */}
      <div className="border-b border-border/50 bg-muted/10">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/products" className="hover:text-foreground transition-colors">
              Products
            </Link>
            <span>/</span>
            <Link 
              href={`/categories/${product.category.slug}`}
              className="hover:text-foreground transition-colors"
            >
              {product.category.name}
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium truncate">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Link 
          href={`/categories/${product.category.slug}`}
          className={cn(
            "inline-flex items-center gap-2 text-sm text-muted-foreground",
            "hover:text-foreground transition-colors mb-8"
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {product.category.name}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <ProductImageGallery
              images={images}
              productName={product.name}
            />
          </div>

          {/* Product Details */}
          <div>
            <ProductDetailsClient product={product} />
          </div>
        </div>

        {/* Product Description & Details */}
        <div className="mt-16 space-y-8">
          <div className={cn(
            "border-t-2 border-border pt-8"
          )}>
            <h2 className={cn(
              "text-2xl font-display font-bold text-foreground mb-6",
              "tracking-wider uppercase"
            )}>
              Description
            </h2>
            
            <div className="prose prose-gray max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                {product.longDescription}
              </p>
            </div>
          </div>

          {/* Reviews Section - TODO: Implement reviews functionality */}
          <div className={cn(
            "border-t-2 border-border pt-8"
          )}>
            <h2 className={cn(
              "text-2xl font-display font-bold text-foreground mb-6",
              "tracking-wider uppercase"
            )}>
              Customer Reviews
            </h2>
            
            {product.reviews && product.reviews.length > 0 ? (
              <div className="space-y-4">
                {product.reviews.map((review) => (
                  <div key={review.id} className={cn(
                    "border-2 border-border p-4 rounded-none"
                  )}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-4 w-4",
                              i < review.rating 
                                ? "text-yellow-500 fill-current" 
                                : "text-muted-foreground/30"
                            )}
                          />
                        ))}
                      </div>
                      <span className="font-medium">{review.customerName}</span>
                    </div>
                    <p className="text-muted-foreground">{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
            )}
          </div>
        </div>
      </div>
      </div>
    </Layout>
  )
}