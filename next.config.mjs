/** @type {import('next').NextConfig} */
const nextConfig = {
  // TypeScript configuration - only skip in development for faster builds
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'development' && !!process.env.SKIP_TYPE_CHECK,
  },
  
  // Skip ESLint during build to avoid configuration warnings
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  
  // Enable gzip/brotli compression and response caching
  generateEtags: true,
  distDir: '.next',
  cleanDistDir: true,
  
  // Optimize server-side rendering
  productionBrowserSourceMaps: false,
  reactStrictMode: true,
  
  // Bundle analyzer (only in development)
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config, { isServer }) => {
      if (!isServer) {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          fs: false,
        }
      }
      return config
    },
  }),
  
  // Image optimization - PERFORMANCE CRITICAL
  images: {
    formats: ['image/avif', 'image/webp'], // AVIF first for better compression
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Optimized imageSizes for better responsive images
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 320, 384, 400, 480, 600, 800],
    minimumCacheTTL: 31536000, // 1 year cache for images
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Add loader config for better performance
    loader: 'default',
    domains: [], // Add external domains if needed
    // Unoptimized images also get long cache
    unoptimized: false,
  },

  // Bundle analyzer (only in development)
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config, { isServer }) => {
      if (!isServer) {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          fs: false,
        }
      }
      return config
    },
  }),

  // Headers for performance and security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Performance headers
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          // Security headers
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
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
          // Preload critical images for LCP optimization
          {
            key: 'Link',
            value: '</logowhite.webp>; rel=preload; as=image; fetchpriority=high, </_next/image?url=%2Flogowhite.webp&w=750&q=75>; rel=preload; as=image; fetchpriority=high'
          },
        ],
      },
      // Cache static assets - PERFORMANCE CRITICAL
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Cache Next.js optimized images - FIX FOR PAGESPEED
      {
        source: '/_next/image(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Cache logo and hero images - CRITICAL FOR LCP
      {
        source: '/(logowhite.webp|logo.webp|hero.*|placeholder.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Cache fonts for extended periods
      {
        source: '/fonts/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Cache favicons and manifest
      {
        source: '/(favicon|apple-touch-icon|manifest)(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400',
          },
        ],
      },
      // Cache HTML pages for better performance
      {
        source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, stale-while-revalidate=300',
          },
        ],
      },
      // Cache API responses for optimal performance
      {
        source: '/api/products',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, stale-while-revalidate=60',
          },
        ],
      },
      {
        source: '/api/(categories|search|featured)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=600, stale-while-revalidate=120',
          },
        ],
      },
    ]
  },

  // Modern JavaScript targeting to reduce polyfills
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
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
    // Enable static optimization where possible
    gzipSize: true,
    // Improve build performance
    cpus: 4,
    // Inline critical CSS to reduce render-blocking resources
    inlineCss: true,
  },

  // Turbopack configuration (stable)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
}

export default nextConfig