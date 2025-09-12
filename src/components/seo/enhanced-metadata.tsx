import { Metadata } from 'next'

interface EnhancedMetadataProps {
  title?: string
  description?: string
  keywords?: string[]
  ogImage?: string
  canonicalUrl?: string
  productInfo?: {
    name: string
    price?: number
    currency?: string
    availability?: 'InStock' | 'OutOfStock'
    brand?: string
  }
}

export function generateEnhancedMetadata({
  title = "Military Tees UK | Premium British Army Themed Apparel & Clothing",
  description = "Premium British military-themed t-shirts, hoodies & apparel. Authentic designs inspired by the British Army. Free UK delivery over £50. Shop veterans, memorial & custom military clothing.",
  keywords = [
    "military t-shirts UK", "British Army apparel", "military clothing", "veterans clothing",
    "army merchandise", "military themed shirts", "British military gear", "army t-shirts",
    "memorial clothing", "custom military designs", "military fashion UK", "army veterans gifts",
    "British forces merchandise", "military lifestyle clothing", "tactical apparel UK",
    "BFPO shipping", "military family", "service personnel", "armed forces clothing"
  ],
  ogImage = "/og-image.jpg",
  canonicalUrl = "/",
  productInfo
}: EnhancedMetadataProps = {}): Metadata {
  
  const baseUrl = "https://militarytees.co.uk"
  const fullCanonicalUrl = canonicalUrl.startsWith('http') ? canonicalUrl : `${baseUrl}${canonicalUrl}`
  
  return {
    title,
    description,
    keywords,
    authors: [{ name: "Military Tees UK Team" }],
    creator: "Military Tees UK",
    publisher: "Military Tees UK Ltd",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: fullCanonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: fullCanonicalUrl,
      siteName: "Military Tees UK",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${title} - Military Tees UK`,
        }
      ],
      locale: 'en_GB',
      type: productInfo ? 'website' : 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      site: '@militaryteesuk',
      creator: '@militaryteesuk',
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: 'your-google-verification-code', // Add your Google Search Console verification
    },
    category: 'e-commerce',
  }
}

export function generateStructuredData(pageType: 'homepage' | 'product' | 'category', data?: any) {
  const baseOrganization = {
    "@context": "https://schema.org",
    "@type": ["Organization", "OnlineStore"],
    "name": "Military Tees UK",
    "alternateName": "Military Tees UK Ltd",
    "description": "Premium British military-themed apparel and clothing. Authentic designs inspired by the British Army. Serving veterans, military families, and military enthusiasts across the UK.",
    "url": "https://militarytees.co.uk",
    "logo": {
      "@type": "ImageObject",
      "url": "https://militarytees.co.uk/logowhite.webp",
      "width": 500,
      "height": 200
    },
    "image": "https://militarytees.co.uk/og-image.jpg",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "GB",
      "addressRegion": "United Kingdom"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "url": "https://militarytees.co.uk/contact",
      "email": "info@militarytees.co.uk",
      "availableLanguage": ["English"]
    },
    "foundingDate": "2025",
    "founder": {
      "@type": "Person",
      "name": "Military Tees UK Team"
    },
    "areaServed": {
      "@type": "Country",
      "name": "United Kingdom"
    },
    "currenciesAccepted": "GBP",
    "paymentAccepted": ["Credit Card", "Debit Card", "PayPal", "Apple Pay"],
    "priceRange": "£15-£50",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Military Themed Apparel",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Military T-Shirts",
            "category": "Clothing"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product", 
            "name": "Veterans Apparel",
            "category": "Clothing"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Memorial Clothing", 
            "category": "Clothing"
          }
        }
      ]
    },
    "sameAs": [
      "https://www.facebook.com/people/Military-Tees-UK-Ltd/61577312099036/",
      "https://www.instagram.com/militaryteesukltd/",
      "https://www.tiktok.com/@militaryteesuk"
    ],
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://militarytees.co.uk/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  }

  switch (pageType) {
    case 'homepage':
      return {
        ...baseOrganization,
        "mainEntity": {
          "@type": "WebSite",
          "name": "Military Tees UK",
          "url": "https://militarytees.co.uk"
        }
      }
    
    case 'product':
      return {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": data?.name || "Military T-Shirt",
        "description": data?.description || "Premium military-themed apparel",
        "brand": {
          "@type": "Brand",
          "name": "Military Tees UK"
        },
        "offers": {
          "@type": "Offer",
          "price": data?.price || "25.99",
          "priceCurrency": "GBP",
          "availability": data?.availability || "https://schema.org/InStock",
          "seller": baseOrganization
        }
      }
    
    default:
      return baseOrganization
  }
}