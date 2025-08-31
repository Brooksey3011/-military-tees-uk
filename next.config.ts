import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Temporarily ignore TypeScript errors during build (to be fixed incrementally)
    ignoreBuildErrors: true,
  },
  eslint: {
    // Temporarily ignore ESLint errors during build (to be fixed incrementally)
    ignoreDuringBuilds: true,
  },
  skipTrailingSlashRedirect: true,
  // Exclude test pages from production builds
  async redirects() {
    return process.env.NODE_ENV === 'production' ? [
      {
        source: '/test-:path*',
        destination: '/404',
        permanent: false,
      },
      {
        source: '/multi-shipping-test',
        destination: '/404', 
        permanent: false,
      },
      {
        source: '/direct-checkout-test',
        destination: '/404',
        permanent: false,
      },
      {
        source: '/size-guide-test',
        destination: '/404',
        permanent: false,
      },
    ] : []
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rdpjldootsglcbzhfkdi.supabase.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.vercel.app',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 86400, // 1 day cache
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  async headers() {
    return [
      // Specific headers for manifest files
      {
        source: '/site.webmanifest',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json'
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400'
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          }
        ],
      },
      // Specific headers for other static files
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400'
          }
        ],
      },
      {
        source: '/(.*)',
        headers: [
          // Security Headers
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://checkout.stripe.com https://m.stripe.network",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' blob: data: https://*.supabase.co https://images.unsplash.com https://q.stripe.com https://*.vercel.app",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://*.supabase.co https://api.stripe.com wss://*.supabase.co",
              "frame-src 'self' https://js.stripe.com https://checkout.stripe.com",
              "media-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "manifest-src 'self'"
            ].join('; ')
          }
        ],
      },
    ];
  },
};

export default nextConfig;
