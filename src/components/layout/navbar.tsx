"use client"

import * as React from "react"
import Link from "next/link"
import { Menu, X, Search, User, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CartIcon } from "@/components/cart/cart-icon"
import { AdvancedSearchBar } from "@/components/search/advanced-search-bar"
import { cn } from "@/lib/utils"

interface NavItem {
  title: string
  href: string
  description?: string
  children?: NavItem[]
}

// Organized category groups for mega menu
interface CategoryGroup {
  title: string
  icon: string
  categories: NavItem[]
}

const categoryGroups: CategoryGroup[] = [
  {
    title: "Core Military",
    icon: "⚔️",
    categories: [
      { title: "Armoury", href: "/categories/armoury", description: "Tactical and combat gear designs" },
      { title: "Operations", href: "/categories/ops-room", description: "Strategic and tactical operations" },
      { title: "Command & Leadership", href: "/categories/regimental-hq", description: "Officer and command structure themed" },
      { title: "Ceremonial", href: "/categories/parade-square", description: "Dress uniform and parade designs" },
    ]
  },
  {
    title: "Specialist Corps",
    icon: "🔧",
    categories: [
      { title: "Corps & Specialist", href: "/categories/signals", description: "Signals, medical, transport & logistics" },
      { title: "Training & Fitness", href: "/categories/ranges", description: "PT, marksmanship and military training" },
      { title: "Barracks Life", href: "/categories/mess-hall", description: "Military community and camaraderie" },
    ]
  },
  {
    title: "Special Collections",
    icon: "🌟",
    categories: [
      { title: "Veterans", href: "/veterans", description: "Honoring those who served with pride" },
      { title: "Kids Collection", href: "/kids", description: "Military-themed apparel for young recruits" },
      { title: "Veteran Life", href: "/categories/civvy-street", description: "Post-service and civilian transition" },
    ]
  }
]

const navigation: NavItem[] = [
  {
    title: "Categories",
    href: "/categories",
    description: "Browse all military-themed apparel"
  },
  {
    title: "Sale",
    href: "/sale",
    description: "Discounted military apparel and special offers"
  },
  {
    title: "Memorial",
    href: "/memorial",
    description: "Honouring the Fallen - tribute and remembrance designs"
  },
  {
    title: "Veterans",
    href: "/veterans",
    description: "Celebrating those who served - veteran pride designs"
  },
  {
    title: "Kids",
    href: "/kids",
    description: "Military-themed apparel for young recruits"
  },
  {
    title: "Custom Orders",
    href: "/custom",
    description: "Personalized military-themed apparel"
  },
  {
    title: "About",
    href: "/about",
    description: "Our story and mission"
  }
]

function WishlistBadge() {
  const [isClient, setIsClient] = React.useState(false)
  
  // Prevent hydration issues
  React.useEffect(() => {
    setIsClient(true)
  }, [])
  
  // Temporarily disabled to fix hydration issues
  return null
}

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const [isSearchOpen, setIsSearchOpen] = React.useState(false)
  const [isCategoriesOpen, setIsCategoriesOpen] = React.useState(false)
  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null)

  // Close menus when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('[data-navbar]')) {
        setIsMobileMenuOpen(false)
        setIsCategoriesOpen(false)
        setActiveDropdown(null)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false)
        setIsCategoriesOpen(false)
        setActiveDropdown(null)
        setIsSearchOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
    setIsCategoriesOpen(false)
    setActiveDropdown(null)
  }

  const toggleCategories = () => {
    setIsCategoriesOpen(!isCategoriesOpen)
  }

  const handleDropdownToggle = (title: string) => {
    setActiveDropdown(activeDropdown === title ? null : title)
  }

  const handleSearch = (query: string) => {
    // Navigate to search page with query
    if (typeof window !== 'undefined') {
      window.location.href = `/search?q=${encodeURIComponent(query)}`
    }
  }

  const handleResultSelect = (result: any) => {
    // Navigate to selected result
    if (typeof window !== 'undefined') {
      window.location.href = `/products/${result.slug || result.id}`
    }
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" data-navbar>
      <div className="container mx-auto px-4">
        {/* Main navbar */}
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <img 
              src="/logowhite.png" 
              alt="Military Tees UK Logo" 
              className="h-12 w-auto" 
            />
            <div className="hidden sm:block">
              <div className="text-xl font-display font-semibold text-foreground tracking-wider">Military Tees UK</div>
              <div className="text-xs text-muted-foreground hidden lg:block font-display tracking-wide uppercase">Proudly serving those who serve</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navigation.map((item) => (
              <div key={item.title} className="relative">
                {item.title === "Categories" ? (
                  <button
                    className="flex items-center space-x-1 text-sm font-display font-bold tracking-wide uppercase text-foreground hover:text-primary transition-colors"
                    onClick={toggleCategories}
                  >
                    <span>{item.title}</span>
                    <svg 
                      className={cn("h-3 w-3 transition-transform", isCategoriesOpen && "rotate-180")}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                ) : (
                  <Link 
                    href={item.href}
                    className="text-sm font-display font-bold tracking-wide uppercase text-foreground hover:text-primary transition-colors"
                  >
                    {item.title}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Desktop Mega Menu */}
          {isCategoriesOpen && (
            <div className="absolute left-0 right-0 top-full bg-background border-b-2 border-border shadow-lg z-40">
              <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-3 gap-8">
                  {categoryGroups.map((group) => (
                    <div key={group.title} className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-border">
                        <span className="text-lg">{group.icon}</span>
                        <h3 className="font-display font-bold tracking-wide uppercase text-foreground">
                          {group.title}
                        </h3>
                      </div>
                      <div className="space-y-2">
                        {group.categories.map((category) => (
                          <Link
                            key={category.title}
                            href={category.href}
                            className="block p-2 rounded-none hover:bg-muted/20 transition-colors group"
                            onClick={() => setIsCategoriesOpen(false)}
                          >
                            <div className="text-sm font-medium text-foreground group-hover:text-primary">
                              {category.title}
                            </div>
                            {category.description && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {category.description}
                              </div>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Featured Section */}
                <div className="mt-8 pt-6 border-t border-border">
                  <div className="grid grid-cols-3 gap-4">
                    <Link href="/bestsellers" className="text-center p-4 rounded-none border border-border hover:bg-primary/5 transition-colors">
                      <div className="text-2xl mb-2">⭐</div>
                      <div className="text-sm font-display font-bold uppercase">Bestsellers</div>
                    </Link>
                    <Link href="/memorial" className="text-center p-4 rounded-none border border-border hover:bg-primary/5 transition-colors">
                      <div className="text-2xl mb-2">🕊️</div>
                      <div className="text-sm font-display font-bold uppercase">Memorial</div>
                    </Link>
                    <Link href="/custom" className="text-center p-4 rounded-none border border-border hover:bg-primary/5 transition-colors">
                      <div className="text-2xl mb-2">✏️</div>
                      <div className="text-sm font-display font-bold uppercase">Custom Orders</div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Advanced Search Bar - Desktop */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <AdvancedSearchBar
              onSearch={handleSearch}
              onResultSelect={handleResultSelect}
              placeholder="Search military tees, categories..."
              className="w-full"
              showHistory={true}
            />
          </div>

          {/* Right side icons */}
          <div className="flex items-center space-x-2">
            {/* Mobile Search Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="h-4 w-4" />
              <span className="sr-only">Toggle search</span>
            </Button>

            {/* Favorites */}
            <Button variant="ghost" size="icon" className="hidden sm:flex relative" asChild>
              <Link href="/account/wishlist">
                <Heart className="h-4 w-4" />
                <WishlistBadge />
                <span className="sr-only">Favorites</span>
              </Link>
            </Button>

            {/* User Profile */}
            <Button variant="ghost" size="icon" asChild>
              <Link href="/profile">
                <User className="h-4 w-4" />
                <span className="sr-only">Profile</span>
              </Link>
            </Button>

            {/* Shopping Cart */}
            <CartIcon />

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>

        {/* Mobile Advanced Search Bar */}
        {isSearchOpen && (
          <div className="md:hidden py-4 border-t">
            <AdvancedSearchBar
              onSearch={handleSearch}
              onResultSelect={handleResultSelect}
              placeholder="Search military tees, categories..."
              className="w-full"
              showHistory={true}
            />
          </div>
        )}

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t bg-background">
            <div className="py-4 space-y-2">
              {/* Categories with organized dropdown */}
              <div>
                <button
                  onClick={() => handleDropdownToggle("Categories")}
                  className="flex items-center justify-between w-full px-4 py-3 text-sm font-display font-bold tracking-wide uppercase text-foreground hover:text-primary hover:bg-muted/20 rounded-none transition-colors"
                >
                  <span>Categories</span>
                  <svg 
                    className={cn("h-3 w-3 transition-transform", activeDropdown === "Categories" && "rotate-180")}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {activeDropdown === "Categories" && (
                  <div className="mt-2 bg-muted/10">
                    {categoryGroups.map((group) => (
                      <div key={group.title} className="border-b border-border/50 last:border-b-0">
                        <div className="px-4 py-2 flex items-center gap-2 bg-muted/20">
                          <span className="text-sm">{group.icon}</span>
                          <span className="text-xs font-display font-bold tracking-wide uppercase text-muted-foreground">
                            {group.title}
                          </span>
                        </div>
                        <div className="pb-2">
                          {group.categories.map((category) => (
                            <Link
                              key={category.title}
                              href={category.href}
                              className="block px-6 py-2 text-sm text-foreground hover:text-primary hover:bg-muted/20 transition-colors"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              {category.title}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Other navigation items */}
              {navigation.slice(1).map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="block px-4 py-3 text-sm font-display font-bold tracking-wide uppercase text-foreground hover:text-primary hover:bg-muted/20 rounded-none transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.title}
                </Link>
              ))}

              {/* Mobile Quick Links */}
              <div className="mt-6 pt-4 border-t border-border">
                <div className="px-4 text-xs font-display font-bold tracking-wide uppercase text-muted-foreground mb-3">
                  Quick Links
                </div>
                <div className="space-y-1">
                  <Link href="/profile" className="block px-4 py-2 text-sm text-foreground hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                    My Profile
                  </Link>
                  <Link href="/account/wishlist" className="block px-4 py-2 text-sm text-foreground hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                    Wishlist
                  </Link>
                  <Link href="/contact" className="block px-4 py-2 text-sm text-foreground hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                    Contact Us
                  </Link>
                  <Link href="/faq" className="block px-4 py-2 text-sm text-foreground hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                    FAQ
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}