'use client'

import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

export interface BreadcrumbItem {
  name: string
  href: string
  current?: boolean
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
  showHome?: boolean
  separator?: React.ReactNode
}

export function Breadcrumb({
  items,
  className,
  showHome = true,
  separator
}: BreadcrumbProps) {
  const allItems = showHome
    ? [{ name: 'Home', href: '/', current: false }, ...items]
    : items

  // Generate structured data for Google
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": allItems.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.current ? undefined : `https://militarytees.co.uk${item.href}`
    }))
  }

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />

      {/* Breadcrumb Navigation */}
      <nav
        className={cn("flex items-center space-x-1 text-sm text-muted-foreground", className)}
        aria-label="Breadcrumb"
      >
        <ol className="flex items-center space-x-1">
          {allItems.map((item, index) => {
            const isLast = index === allItems.length - 1
            const isHome = showHome && index === 0

            return (
              <li key={item.href} className="flex items-center">
                {index > 0 && (
                  <span className="mx-2 text-muted-foreground/60">
                    {separator || <ChevronRight className="h-3 w-3" />}
                  </span>
                )}

                {isLast ? (
                  <span
                    className="font-medium text-foreground"
                    aria-current="page"
                  >
                    {item.name}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      "hover:text-foreground transition-colors",
                      "focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-sm px-1 -mx-1",
                      isHome && "flex items-center gap-1"
                    )}
                  >
                    {isHome && <Home className="h-3 w-3" />}
                    <span>{item.name}</span>
                  </Link>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    </>
  )
}

// Utility function to generate breadcrumbs from URL path
export function generateBreadcrumbs(pathname: string, customLabels?: Record<string, string>): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs: BreadcrumbItem[] = []

  // Default labels for common paths
  const defaultLabels: Record<string, string> = {
    'products': 'Products',
    'categories': 'Categories',
    'british-army': 'British Army',
    'royal-navy': 'Royal Navy',
    'royal-air-force': 'Royal Air Force',
    'royal-marines': 'Royal Marines',
    'account': 'Account',
    'orders': 'Orders',
    'settings': 'Settings',
    'addresses': 'Addresses',
    'wishlist': 'Wishlist',
    'cart': 'Shopping Cart',
    'checkout': 'Checkout',
    'success': 'Order Complete',
    'veterans': 'Veterans',
    'memorial': 'Memorial',
    'kids': 'Kids Collection',
    'custom': 'Custom Orders',
    'contact': 'Contact Us',
    'about': 'About Us',
    'faq': 'FAQ',
    'shipping': 'Shipping Info',
    'returns': 'Returns',
    'size-guide': 'Size Guide',
    'terms': 'Terms & Conditions',
    'privacy': 'Privacy Policy',
    ...customLabels
  }

  let currentPath = ''

  segments.forEach((segment, index) => {
    currentPath += `/${segment}`
    const isLast = index === segments.length - 1

    // Convert slug to readable name
    const name = defaultLabels[segment] || segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')

    breadcrumbs.push({
      name,
      href: currentPath,
      current: isLast
    })
  })

  return breadcrumbs
}

// Specific breadcrumb generators for common page types
export const breadcrumbGenerators = {
  product: (productName: string, categoryName?: string, categorySlug?: string): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [
      { name: 'Products', href: '/products' }
    ]

    if (categoryName && categorySlug) {
      items.push({
        name: categoryName,
        href: `/categories/${categorySlug}`
      })
    }

    items.push({
      name: productName,
      href: '#',
      current: true
    })

    return items
  },

  category: (categoryName: string): BreadcrumbItem[] => [
    { name: 'Products', href: '/products' },
    { name: categoryName, href: '#', current: true }
  ],

  account: (pageName?: string): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [
      { name: 'Account', href: '/account' }
    ]

    if (pageName) {
      items.push({
        name: pageName,
        href: '#',
        current: true
      })
    }

    return items
  },

  search: (query?: string): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [
      { name: 'Products', href: '/products' }
    ]

    if (query) {
      items.push({
        name: `Search: "${query}"`,
        href: '#',
        current: true
      })
    } else {
      items.push({
        name: 'Search',
        href: '#',
        current: true
      })
    }

    return items
  }
}