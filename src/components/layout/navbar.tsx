"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, Search, User, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CartIcon } from "@/components/cart/cart-icon"
import { SimpleSearchBar } from "@/components/search/simple-search-bar"
import { cn } from "@/lib/utils"
import { useWishlistCount } from "@/store/wishlist"

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
    title: "British Armed Forces",
    icon: "🇬🇧",
    categories: [
      { title: "British Army", href: "/categories/british-army", description: "Infantry, armoured corps, and army regiment designs" },
      { title: "Royal Marines", href: "/categories/royal-marines", description: "Commando and amphibious warfare designs" },
      { title: "Royal Air Force", href: "/categories/royal-air-force", description: "RAF squadron and aviation designs" },
      { title: "Royal Navy", href: "/categories/royal-navy", description: "Naval traditions and fleet designs" },
    ]
  }
]

const navigation: NavItem[] = [
  {
    title: "Military",
    href: "/categories",
    description: "Browse British Armed Forces collections"
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
  const wishlistCount = useWishlistCount()
  
  // Prevent hydration issues
  React.useEffect(() => {
    setIsClient(true)
  }, [])
  
  if (!isClient || wishlistCount === 0) {
    return null
  }
  
  return (
    <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center font-medium">
      {wishlistCount > 99 ? '99+' : wishlistCount}
    </span>
  )
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


  return (
    <nav className="sticky top-0 z-[60] w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" data-navbar>
      <div className="container mx-auto px-4">
        {/* Main navbar */}
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-4 hover:opacity-90 transition-opacity">
            <Image 
              src="/logowhite.webp" 
              alt="Military Tees UK Logo" 
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
              priority
            />
            <div className="hidden sm:flex flex-col">
              <div className="text-lg font-display font-bold text-foreground tracking-wider leading-tight">
                Military Tees UK
              </div>
              <div className="text-xs text-muted-foreground font-sans tracking-wide uppercase leading-none">
                Est. 2025
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navigation.map((item) => (
              <div key={item.title} className="relative">
                {item.title === "Military" ? (
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
            <div className="absolute left-0 right-0 top-full bg-background border-b-2 border-border shadow-lg z-[70]">
              <div className="container mx-auto px-4 py-6">
                <div className="max-w-2xl mx-auto">
                  {categoryGroups.map((group) => (
                    <div key={group.title} className="space-y-4">
                      <div className="flex items-center justify-center gap-2 pb-4 mb-4 border-b border-border">
                        <span className="text-2xl">{group.icon}</span>
                        <h3 className="font-display font-bold tracking-wide uppercase text-foreground text-lg">
                          {group.title}
                        </h3>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {group.categories.map((category) => (
                          <Link
                            key={category.title}
                            href={category.href}
                            className="block p-4 rounded-none border border-border hover:bg-primary/5 transition-colors group text-center"
                            onClick={() => setIsCategoriesOpen(false)}
                          >
                            <div className="text-sm font-display font-bold uppercase text-foreground group-hover:text-primary mb-1">
                              {category.title}
                            </div>
                            {category.description && (
                              <div className="text-xs text-muted-foreground">
                                {category.description}
                              </div>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <SimpleSearchBar
              placeholder="Search military tees, categories..."
              className="w-full"
            />
          </div>

          {/* Right side icons */}
          <div className="flex items-center space-x-2">
            {/* Mobile Search Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden min-h-[48px] min-w-[48px]"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="h-4 w-4" />
              <span className="sr-only">Toggle search</span>
            </Button>

            {/* Favorites */}
            <Button variant="ghost" size="icon" className="hidden sm:flex relative min-h-[48px] min-w-[48px]" asChild>
              <Link href="/account/wishlist">
                <Heart className="h-4 w-4" />
                <WishlistBadge />
                <span className="sr-only">Favorites</span>
              </Link>
            </Button>

            {/* User Profile */}
            <Button variant="ghost" size="icon" className="min-h-[48px] min-w-[48px]" asChild>
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
              className="lg:hidden min-h-[48px] min-w-[48px]"
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

        {/* Mobile Search Bar */}
        {isSearchOpen && (
          <div className="md:hidden py-4 border-t">
            <SimpleSearchBar
              placeholder="Search military tees, categories..."
              className="w-full"
            />
          </div>
        )}

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t bg-background">
            <div className="py-4 space-y-2">
              {/* Military with dropdown */}
              <div>
                <button
                  onClick={() => handleDropdownToggle("Military")}
                  className="flex items-center justify-between w-full px-4 py-3 text-sm font-display font-bold tracking-wide uppercase text-foreground hover:text-primary hover:bg-muted/20 rounded-none transition-colors"
                >
                  <span>Military</span>
                  <svg 
                    className={cn("h-3 w-3 transition-transform", activeDropdown === "Military" && "rotate-180")}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {activeDropdown === "Military" && (
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