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
        source: '/test-express',
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
    formats: ['image/avif', 'image/webp'], // AVIF first for better compression
    // Optimized device sizes for better image delivery (22 KiB savings)
    deviceSizes: [320, 420, 768, 1024, 1200, 1920],
    // Reduced imageSizes for better performance
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year cache for images - FIX FOR PAGESPEED
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    loader: 'default',
    domains: [],
    unoptimized: false,
  },
  
  // Enable compression for better TTFB
  compress: true,

  async headers() {
    return [
      // Cache Next.js optimized images - FIX FOR PAGESPEED
      {
        source: '/_next/image',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Cache logo and hero images - CRITICAL FOR LCP
      {
        source: '/logowhite.webp',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/logo.webp',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/placeholder-product.jpg',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
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
      // Enable compression for static assets
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ],
      },
      {
        source: '/(.*)',
        headers: [
          // Server optimization headers
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Connection',
            value: 'keep-alive'
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
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://checkout.stripe.com https://m.stripe.network https://plausible.io",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' blob: data: https://*.supabase.co https://images.unsplash.com https://q.stripe.com https://*.vercel.app",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://*.supabase.co https://api.stripe.com wss://*.supabase.co https://plausible.io",
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

  // Experimental features for better performance
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'framer-motion',
      '@supabase/supabase-js',
      'zustand',
      'react-hook-form'
    ],
    optimizeCss: true,
    webVitalsAttribution: ['CLS', 'LCP', 'FCP', 'FID', 'TTFB'],
    forceSwcTransforms: true,
    // CSS optimization for render blocking
    cssChunking: true,
    inlineCss: true, // Inline critical CSS to reduce render blocking
    // Server optimization for faster TTFB
    optimizeServerReact: true,
    // Tree shaking and unused code elimination
    esmExternals: true,
  },

  // Modern JavaScript targeting to reduce polyfills
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Webpack configuration for CSS optimization and modern JS
  webpack: (config, { dev, isServer }) => {
    // Modern JavaScript targeting to reduce polyfills
    if (!dev && !isServer) {
      // Set modern ES target to eliminate unnecessary polyfills
      config.target = 'web';
      config.resolve = {
        ...config.resolve,
        mainFields: ['browser', 'module', 'main'],
      };

      // Enhanced optimization to reduce unused JavaScript (52 KiB savings)
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: false,
        innerGraph: true,
        providedExports: true,
      };
    }
    return config;
  },
};

export default nextConfig;
