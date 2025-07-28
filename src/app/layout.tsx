import type { Metadata } from "next";
import { Source_Sans_3, Roboto_Slab } from "next/font/google";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { SimpleErrorBoundary } from "@/components/ui/simple-error-boundary";
import { CookieConsent } from "@/components/ui/cookie-consent";
import { AuthProvider } from "@/hooks/use-auth";
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
  title: "Military Tees UK | British Army Themed Apparel",
  description: "Premium British military-themed t-shirts and apparel. Inspired by the barracks, built for quality.",
  keywords: ["military t-shirts", "British Army", "military apparel", "UK", "army gear"],
  authors: [{ name: "Military Tees UK" }],
  creator: "Military Tees UK",
  publisher: "Military Tees UK",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "/",
    siteName: "Military Tees UK",
    title: "Military Tees UK | British Army Themed Apparel",
    description: "Premium British military-themed t-shirts and apparel. Inspired by the barracks, built for quality.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Military Tees UK | British Army Themed Apparel",
    description: "Premium British military-themed t-shirts and apparel. Inspired by the barracks, built for quality.",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Military Tees UK",
    "description": "Premium British military-themed apparel. We serve those that serve.",
    "url": "https://militarytees.co.uk",
    "logo": "https://militarytees.co.uk/logowhite.png",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "GB"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "url": "https://militarytees.co.uk/contact"
    },
    "sameAs": [
      "https://www.facebook.com/militaryteesuk",
      "https://www.instagram.com/militaryteesuk",
      "https://www.tiktok.com/@militaryteesuk"
    ]
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
        <SimpleErrorBoundary>
          <AuthProvider>
            {children}
            <CookieConsent />
          </AuthProvider>
        </SimpleErrorBoundary>
      </body>
    </html>
  );
}
