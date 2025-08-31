import type { Metadata } from "next";
import { Source_Sans_3, Roboto_Slab } from "next/font/google";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { SimpleErrorBoundary } from "@/components/ui/simple-error-boundary";
import { CookieConsent } from "@/components/ui/cookie-consent";
import { AuthProvider } from "@/hooks/use-auth";
import { CartProvider } from "@/hooks/use-simple-cart";
import { PlausibleProvider } from "@/components/analytics/plausible";
import "./globals.css";

const sourceSans3 = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "600", "700"],
  display: "swap",
});

const robotoSlab = Roboto_Slab({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "600", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Military Tees UK | Premium British Army Themed Apparel & Clothing",
    template: "%s | Military Tees UK"
  },
  description: "Premium British military-themed t-shirts, hoodies & apparel. Authentic designs inspired by the British Army. Free UK delivery over £50. Shop veterans, memorial & custom military clothing.",
  keywords: [
    "military t-shirts UK", "British Army apparel", "military clothing", "veterans clothing", 
    "army merchandise", "military themed shirts", "British military gear", "army t-shirts",
    "memorial clothing", "custom military designs", "military fashion UK", "army veterans gifts",
    "British forces merchandise", "military lifestyle clothing", "tactical apparel UK"
  ],
  authors: [{ name: "Military Tees UK", url: "https://militarytees.co.uk" }],
  creator: "Military Tees UK",
  publisher: "Military Tees UK",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://militarytees.co.uk'),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' }
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' }
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "/",
    siteName: "Military Tees UK",
    title: "Military Tees UK | Premium British Army Themed Apparel & Clothing",
    description: "Premium British military-themed t-shirts, hoodies & apparel. Authentic designs inspired by the British Army. Free UK delivery over £50. Shop veterans, memorial & custom military clothing.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Military Tees UK - Premium British Army Themed Apparel",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@militaryteesuk",
    creator: "@militaryteesuk",
    title: "Military Tees UK | Premium British Army Themed Apparel & Clothing",
    description: "Premium British military-themed t-shirts, hoodies & apparel. Authentic designs inspired by the British Army. Free UK delivery over £50.",
    images: ["/twitter-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
    other: {
      'msvalidate.01': process.env.BING_SITE_VERIFICATION || '',
    }
  },
  category: 'e-commerce',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": ["Organization", "OnlineStore"],
    "name": "Military Tees UK",
    "alternateName": "Military Tees UK Ltd",
    "description": "Premium British military-themed apparel and clothing. Authentic designs inspired by the British Army. Serving veterans, military families, and military enthusiasts across the UK.",
    "url": "https://militarytees.co.uk",
    "logo": {
      "@type": "ImageObject",
      "url": "https://militarytees.co.uk/logowhite.png",
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
    "paymentAccepted": ["Credit Card", "Debit Card", "PayPal"],
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
      "https://www.facebook.com/militaryteesuk",
      "https://www.instagram.com/militaryteesuk", 
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
  };

  return (
    <html lang="en" className={`${sourceSans3.variable} ${robotoSlab.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
      </head>
      <body className="antialiased">
        <PlausibleProvider domain="militarytees.co.uk">
          <SimpleErrorBoundary>
            <AuthProvider>
              <CartProvider>
                {children}
                <CookieConsent />
              </CartProvider>
            </AuthProvider>
          </SimpleErrorBoundary>
        </PlausibleProvider>
      </body>
    </html>
  );
}
