/** @type {import('next').NextConfig} */
const nextConfig = {
  // Skip TypeScript checking during build if environment variable is set
  typescript: {
    ignoreBuildErrors: !!process.env.SKIP_TYPE_CHECK,
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
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'], // AVIF first for better compression
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
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
          // Server push for critical resources
          {
            key: 'Link',
            value: '</logowhite.webp>; rel=preload; as=image'
          },
        ],
      },
      // Cache static assets
      {
        source: '/images/(.*)',
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

  // SWC configuration for modern browsers (swcMinify is enabled by default in Next.js 15)
  
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