/**
 * JSON-LD Schema Markup for SEO and Rich Results
 *
 * This utility generates structured data for Google and other search engines
 * to enhance e-commerce visibility with rich snippets, pricing, and availability
 */

// Base types for schema.org structured data
interface BaseSchema {
  '@context': 'https://schema.org'
  '@type': string
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  main_image_url: string
  category_id: string
  created_at: string
  updated_at: string
  categories: {
    name: string
    slug: string
  }
  product_variants: Array<{
    id: string
    size: string
    color: string
    price: number
    stock_quantity: number
    sku: string
    image_urls?: string[]
  }>
}

/**
 * Generate Product Schema Markup for individual product pages
 * Creates rich snippets with price, availability, and review data
 */
export function generateProductSchema(product: Product, baseUrl: string): BaseSchema & {
  name: string
  description: string
  image: string[]
  brand: object
  offers: object[]
  aggregateRating?: object
  category: string
  productID: string
  sku: string
  url: string
  manufacturer: object
} {
  // Generate image array (main image + variant images)
  const images = [product.main_image_url]
  product.product_variants.forEach(variant => {
    if (variant.image_urls) {
      images.push(...variant.image_urls)
    }
  })

  // Generate offers for each variant
  const offers = product.product_variants.map(variant => ({
    '@type': 'Offer',
    price: variant.price.toString(),
    priceCurrency: 'GBP',
    availability: variant.stock_quantity > 0
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock',
    url: `${baseUrl}/products/${product.id}?variant=${variant.id}`,
    seller: {
      '@type': 'Organization',
      name: 'Military Tees UK'
    },
    validFrom: product.created_at,
    sku: variant.sku,
    itemCondition: 'https://schema.org/NewCondition',
    shippingDetails: {
      '@type': 'OfferShippingDetails',
      shippingRate: {
        '@type': 'MonetaryAmount',
        value: '4.99',
        currency: 'GBP'
      },
      shippingDestination: {
        '@type': 'DefinedRegion',
        addressCountry: 'GB'
      },
      deliveryTime: {
        '@type': 'ShippingDeliveryTime',
        handlingTime: {
          '@type': 'QuantitativeValue',
          minValue: 1,
          maxValue: 2,
          unitCode: 'd'
        },
        transitTime: {
          '@type': 'QuantitativeValue',
          minValue: 2,
          maxValue: 5,
          unitCode: 'd'
        }
      }
    }
  }))

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: images,
    brand: {
      '@type': 'Brand',
      name: 'Military Tees UK'
    },
    category: product.categories?.name || 'Military Apparel',
    productID: product.id,
    sku: product.product_variants[0]?.sku || product.id,
    url: `${baseUrl}/products/${product.id}`,
    offers: offers,
    manufacturer: {
      '@type': 'Organization',
      name: 'Military Tees UK'
    }
  }
}

/**
 * Generate Organization Schema for the business
 * Helps with local SEO and brand recognition
 */
export function generateOrganizationSchema(baseUrl: string): BaseSchema & {
  name: string
  url: string
  logo: string
  contactPoint: object[]
  sameAs: string[]
  address: object
} {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Military Tees UK',
    url: baseUrl,
    logo: `${baseUrl}/logowhite.webp`,
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+44-800-000-0000',
        contactType: 'customer service',
        availableLanguage: 'English'
      }
    ],
    sameAs: [
      // Add social media URLs when available
    ],
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'GB'
    }
  }
}

/**
 * Generate WebSite Schema with search functionality
 * Enables sitelinks search box in Google results
 */
export function generateWebsiteSchema(baseUrl: string): BaseSchema & {
  name: string
  url: string
  potentialAction: object
} {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Military Tees UK',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  }
}

/**
 * Generate BreadcrumbList Schema for navigation
 * Improves search result appearance and navigation
 */
export function generateBreadcrumbSchema(
  breadcrumbs: Array<{ name: string; url: string }>,
  baseUrl: string
): BaseSchema & {
  itemListElement: object[]
} {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `${baseUrl}${crumb.url}`
    }))
  }
}

/**
 * Generate Review Schema for products with reviews
 * Enhances rich snippets with star ratings
 */
export function generateAggregateRatingSchema(
  averageRating: number,
  reviewCount: number
): object {
  return {
    '@type': 'AggregateRating',
    ratingValue: averageRating.toString(),
    ratingCount: reviewCount.toString(),
    bestRating: '5',
    worstRating: '1'
  }
}

/**
 * Generate Store Schema for e-commerce business
 * Helps with local business SEO
 */
export function generateStoreSchema(baseUrl: string): BaseSchema & {
  name: string
  image: string
  url: string
  telephone: string
  address: object
  openingHoursSpecification: object[]
  paymentAccepted: string[]
  currenciesAccepted: string
} {
  return {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: 'Military Tees UK',
    image: `${baseUrl}/logowhite.webp`,
    url: baseUrl,
    telephone: '+44-800-000-0000',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'GB'
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday'
        ],
        opens: '00:00',
        closes: '23:59'
      }
    ],
    paymentAccepted: [
      'Credit Card',
      'Debit Card',
      'PayPal',
      'Apple Pay',
      'Google Pay'
    ],
    currenciesAccepted: 'GBP'
  }
}

/**
 * Utility to inject JSON-LD script into page head
 * Usage: <Script dangerouslySetInnerHTML={{ __html: createJsonLdScript(schema) }} />
 */
export function createJsonLdScript(schema: object): string {
  return JSON.stringify(schema, null, 2)
}

/**
 * Generate complete schema package for product pages
 * Combines multiple schema types for maximum SEO benefit
 */
export function generateCompleteProductPageSchema(
  product: Product,
  baseUrl: string,
  breadcrumbs?: Array<{ name: string; url: string }>,
  aggregateRating?: { average: number; count: number }
): object[] {
  const schemas = []

  // Core product schema
  const productSchema = generateProductSchema(product, baseUrl)

  // Add aggregate rating if available
  if (aggregateRating && aggregateRating.count > 0) {
    productSchema.aggregateRating = generateAggregateRatingSchema(
      aggregateRating.average,
      aggregateRating.count
    )
  }

  schemas.push(productSchema)

  // Add breadcrumb schema if provided
  if (breadcrumbs && breadcrumbs.length > 0) {
    schemas.push(generateBreadcrumbSchema(breadcrumbs, baseUrl))
  }

  // Add organization schema
  schemas.push(generateOrganizationSchema(baseUrl))

  return schemas
}

/**
 * Generate schema for category/collection pages
 * Helps with category page SEO
 */
export function generateCollectionPageSchema(
  categoryName: string,
  categoryDescription: string,
  products: Product[],
  baseUrl: string
): BaseSchema & {
  name: string
  description: string
  url: string
  mainEntity: object
} {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${categoryName} - Military Tees UK`,
    description: categoryDescription,
    url: `${baseUrl}/categories/${categoryName.toLowerCase().replace(/\s+/g, '-')}`,
    mainEntity: {
      '@type': 'ItemList',
      name: categoryName,
      numberOfItems: products.length,
      itemListElement: products.slice(0, 10).map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name: product.name,
          url: `${baseUrl}/products/${product.id}`,
          image: product.main_image_url,
          offers: {
            '@type': 'Offer',
            price: product.price.toString(),
            priceCurrency: 'GBP'
          }
        }
      }))
    }
  }
}