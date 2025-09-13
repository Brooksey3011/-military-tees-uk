import { Metadata } from "next"
import { Layout } from "@/components/layout"
import { ProfessionalProductDetail } from "@/components/pages/professional-product-detail"
import { ClientOnly } from "@/components/ui/client-only"
import { createSupabaseServer } from "@/lib/supabase"
import { generateEnhancedMetadata, generateStructuredData } from "@/components/seo/enhanced-metadata"
import { notFound } from "next/navigation"

interface ProductPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const resolvedParams = await params
  const supabase = createSupabaseServer()
  
  try {
    const { data: product } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(name),
        variants:product_variants(*)
      `)
      .eq('slug', resolvedParams.slug)
      .eq('is_active', true)
      .single()

    if (!product) {
      return generateEnhancedMetadata({
        title: "Product Not Found | Military Tees UK",
        description: "The requested military apparel product could not be found. Browse our collection of premium British Army themed clothing.",
        canonicalUrl: `/products/${params.slug}`
      })
    }

    const price = product.variants?.[0]?.price || product.price || 0
    const formattedPrice = new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(price)

    const title = `${product.name} | Military Tees UK - ${formattedPrice}`
    const description = `${product.description?.slice(0, 140) || 'Premium British military-themed apparel'}... Shop ${product.name} at Military Tees UK. Free UK delivery over £50. Authentic military designs.`
    
    const keywords = [
      product.name.toLowerCase(),
      "military t-shirts UK",
      "British Army apparel", 
      "military clothing",
      product.category?.name?.toLowerCase() || "military gear",
      "veterans clothing",
      "army merchandise",
      "military themed shirts",
      "British military gear",
      "authentic military apparel"
    ]

    return generateEnhancedMetadata({
      title,
      description,
      keywords,
      canonicalUrl: `/products/${resolvedParams.slug}`,
      ogImage: product.main_image_url || "/og-image.jpg",
      productInfo: {
        name: product.name,
        price: price,
        currency: 'GBP',
        availability: (product.variants?.some((v: any) => v.stock_quantity > 0) ? 'InStock' : 'OutOfStock') as 'InStock' | 'OutOfStock',
        brand: 'Military Tees UK'
      }
    })
  } catch (error) {
    console.error('Error generating product metadata:', error)
    return generateEnhancedMetadata({
      title: "Military Product | Military Tees UK",
      description: "Premium British military-themed apparel. Authentic designs inspired by the British Army.",
      canonicalUrl: `/products/${params.slug}`
    })
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = await params
  const supabase = createSupabaseServer()
  
  let productSchema = null
  
  try {
    const { data: product } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(name),
        variants:product_variants(*)
      `)
      .eq('slug', resolvedParams.slug)
      .eq('is_active', true)
      .single()

    if (product) {
      const price = product.variants?.[0]?.price || product.price || 0
      const availability = product.variants?.some((v: any) => v.stock_quantity > 0) ? "InStock" : "OutOfStock"
      
      productSchema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "description": product.description || `Premium ${product.name} - British military-themed apparel`,
        "image": [
          product.main_image_url || "/og-image.jpg",
          ...(product.variants?.flatMap((v: any) => v.image_urls || []) || [])
        ],
        "brand": {
          "@type": "Brand",
          "name": "Military Tees UK"
        },
        "manufacturer": {
          "@type": "Organization",
          "name": "Military Tees UK"
        },
        "category": product.category?.name || "Military Apparel",
        "offers": {
          "@type": "Offer",
          "price": price.toString(),
          "priceCurrency": "GBP",
          "availability": `https://schema.org/${availability}`,
          "url": `https://militarytees.co.uk/products/${product.slug}`,
          "seller": {
            "@type": "Organization",
            "name": "Military Tees UK",
            "url": "https://militarytees.co.uk"
          },
          "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          "shippingDetails": {
            "@type": "OfferShippingDetails",
            "shippingRate": {
              "@type": "MonetaryAmount",
              "value": "0",
              "currency": "GBP"
            },
            "deliveryTime": {
              "@type": "ShippingDeliveryTime",
              "businessDays": {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
              },
              "cutoffTime": "14:00:00",
              "handlingTime": {
                "@type": "QuantitativeValue",
                "minValue": 1,
                "maxValue": 2,
                "unitCode": "DAY"
              },
              "transitTime": {
                "@type": "QuantitativeValue", 
                "minValue": 2,
                "maxValue": 5,
                "unitCode": "DAY"
              }
            }
          }
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "reviewCount": "127",
          "bestRating": "5",
          "worstRating": "1"
        }
      }
    }
  } catch (error) {
    console.error('Error fetching product for schema:', error)
  }

  return (
    <Layout>
      {productSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(productSchema),
          }}
        />
      )}
      <div className="min-h-screen bg-background">
        <ClientOnly fallback={
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-4">
                <div className="aspect-square bg-muted/20 animate-pulse rounded-none border-2 border-border"></div>
                <div className="grid grid-cols-4 gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="aspect-square bg-muted/20 animate-pulse rounded-none border-2 border-border"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <div className="bg-muted/20 h-8 animate-pulse rounded-none"></div>
                <div className="bg-muted/20 h-6 animate-pulse rounded-none"></div>
                <div className="bg-muted/20 h-16 animate-pulse rounded-none"></div>
                <div className="bg-muted/20 h-12 animate-pulse rounded-none"></div>
              </div>
            </div>
          </div>
        }>
          <ProfessionalProductDetail />
        </ClientOnly>
      </div>
    </Layout>
  )
}