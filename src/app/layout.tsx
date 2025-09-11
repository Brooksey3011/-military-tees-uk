import type { Metadata } from "next";
import { Inter, Roboto_Slab } from "next/font/google";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { SimpleErrorBoundary } from "@/components/ui/simple-error-boundary";
import { CookieConsent } from "@/components/ui/cookie-consent";
import { AuthProvider } from "@/hooks/use-auth";
import { CartProvider } from "@/hooks/use-simple-cart";
import { PlausibleProvider } from "@/components/analytics/plausible";
import { WebVitals } from "@/components/performance/web-vitals";
import { cn } from "@/lib/utils";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
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
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
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
      "https://www.facebook.com/militaryteesukltd",
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
  };

  return (
    <html lang="en" className={`${inter.variable} ${robotoSlab.variable}`}>
      <head>
        {/* Preload critical fonts for better performance */}
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          as="style"
          onLoad="this.onload=null;this.rel='stylesheet'"
        />
        <noscript>
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
            rel="stylesheet"
          />
        </noscript>
        
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@400;600;700;900&display=swap"
          as="style"
          onLoad="this.onload=null;this.rel='stylesheet'"
        />
        <noscript>
          <link
            href="https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@400;600;700;900&display=swap"
            rel="stylesheet"
          />
        </noscript>

        {/* Preload LCP image for immediate discovery */}
        <link
          rel="preload"
          href="/logowhite.webp"
          as="image"
          fetchPriority="high"
        />

        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />

        {/* Critical CSS for above-the-fold content */}
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Critical CSS for immediate rendering */
            html { 
              scroll-behavior: smooth; 
              font-family: ${inter.style.fontFamily}, system-ui, sans-serif;
            }
            body { 
              margin: 0; 
              padding: 0; 
              background: var(--background, #000000); 
              color: var(--foreground, #ffffff);
              font-family: inherit;
              line-height: 1.6;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }
            * { 
              box-sizing: border-box; 
              font-family: inherit;
            }
            .font-display { 
              font-family: ${robotoSlab.style.fontFamily}, ui-serif, Georgia, serif; 
            }
            /* Hide content until styles load */
            .animate-fade-in { 
              opacity: 0; 
              animation: fadeIn 0.3s ease-out forwards; 
            }
            @keyframes fadeIn { 
              to { opacity: 1; } 
            }
          `
        }} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
      </head>
      <body className={cn(
        "antialiased min-h-screen bg-background text-foreground",
        inter.variable,
        robotoSlab.variable,
        inter.className
      )}>
        <PlausibleProvider domain="militarytees.co.uk">
          <WebVitals />
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
