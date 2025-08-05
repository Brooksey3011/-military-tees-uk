import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Star } from "lucide-react"
import { Layout } from "@/components/layout"
import { ProductImageGallery } from "@/components/product/product-image-gallery"
import { ProductDetailsClient } from "@/components/product/product-details-client"
import { ProductPageSkeleton } from "@/components/ui"
import { cn } from "@/lib/utils"

interface ProductPageProps {
  params: Promise<{
    slug: string
  }>
}

// Fetch product from API
async function getProduct(slug: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/products/${slug}`, {
      cache: 'no-store' // Always fetch fresh data
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch product');
    }
    
    const data = await response.json();
    return data.product;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}


// Generate static params for products - will use database in production
export async function generateStaticParams() {
  // In production, this would fetch from Supabase
  // For now, return empty array to generate on-demand
  return [];
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  
  if (!product) {
    return {
      title: "Product Not Found | Military Tees UK"
    }
  }

  return {
    title: `${product.name} | Military Tees UK`,
    description: product.description,
    keywords: [product.name, "military t-shirt", "british army", product.category?.name || "military"],
    openGraph: {
      title: product.name,
      description: product.description,
      images: [{ url: product.main_image_url }],
      type: "website",
    }
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);
  
  if (!product) {
    notFound();
  }

  // Mock reviews for now - TODO: Implement reviews system
  const mockReviews = [
    {
      id: "1",
      rating: 5,
      comment: "Excellent quality and design. Very happy with my purchase!",
      customerName: "John D.",
      createdAt: "2024-12-01"
    }
  ];

  const averageRating = mockReviews.length 
    ? mockReviews.reduce((sum, review) => sum + review.rating, 0) / mockReviews.length 
    : 0;

  const images = [product.main_image_url];

  // Transform product data to match expected format
  const transformedProduct = {
    ...product,
    mainImageUrl: product.main_image_url,
    compareAtPrice: product.sale_price,
    longDescription: product.description + "\n\nCrafted with premium materials and designed with military precision, this piece celebrates military heritage and values. Perfect for veterans, serving personnel, and supporters of military traditions.",
    reviews: mockReviews
  };

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
              href={`/categories/${product.category?.slug || 'products'}`}
              className="hover:text-foreground transition-colors"
            >
              {product.category?.name || 'Products'}
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
          href={`/categories/${product.category?.slug || 'products'}`}
          className={cn(
            "inline-flex items-center gap-2 text-sm text-muted-foreground",
            "hover:text-foreground transition-colors mb-8"
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {product.category?.name || 'Products'}
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
            <ProductDetailsClient product={transformedProduct} />
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
                {transformedProduct.longDescription}
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
            
            {transformedProduct.reviews && transformedProduct.reviews.length > 0 ? (
              <div className="space-y-4">
                {transformedProduct.reviews.map((review) => (
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