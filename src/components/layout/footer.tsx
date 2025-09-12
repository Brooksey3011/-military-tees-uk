"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Mail, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const footerLinks = {
  "Support": [
    { title: "FAQ", href: "/faq" },
    { title: "Delivery Options", href: "/delivery" },
    { title: "Track Order", href: "/track-order" },
    { title: "Size Guide", href: "/size-guide" },
    { title: "Contact Us", href: "/contact" },
  ],
  "Policies": [
    { title: "Terms & Conditions", href: "/terms" },
    { title: "Returns & Refunds", href: "/returns" },
    { title: "Privacy Policy", href: "/privacy" },
    { title: "Shipping Policy", href: "/shipping" },
    { title: "Cookie Policy", href: "/cookies" },
  ],
  "Navigation": [
    { title: "Categories", href: "/categories" },
    { title: "Sale", href: "/sale" },
    { title: "Memorial", href: "/memorial" },
    { title: "Veterans", href: "/veterans" },
    { title: "Kids", href: "/kids" },
    { title: "Custom Orders", href: "/custom" },
    { title: "About", href: "/about" },
  ]
}

const socialLinks = [
  { icon: Facebook, href: "https://www.facebook.com/people/Military-Tees-UK-Ltd/61577312099036/", label: "Facebook" },
  { icon: Instagram, href: "https://www.instagram.com/militaryteesukltd/", label: "Instagram" },
]

export function Footer() {
  const [email, setEmail] = React.useState("")
  const [isSubscribing, setIsSubscribing] = React.useState(false)
  const [subscriptionStatus, setSubscriptionStatus] = React.useState<"idle" | "success" | "error">("idle")

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsSubscribing(true)
    
    try {
      // Simulate API call - this will be replaced with actual newsletter service integration
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log("Newsletter subscription:", email)
      setSubscriptionStatus("success")
      setEmail("")
      
      // Reset success message after 3 seconds
      setTimeout(() => setSubscriptionStatus("idle"), 3000)
    } catch (error) {
      console.error("Newsletter subscription failed:", error)
      setSubscriptionStatus("error")
      setTimeout(() => setSubscriptionStatus("idle"), 3000)
    } finally {
      setIsSubscribing(false)
    }
  }

  return (
    <footer className="bg-muted mt-auto">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-3 mb-4">
              <Image 
                src="/logowhite.webp" 
                alt="Military Tees UK Logo" 
                width={48}
                height={48}
                className="h-12 w-12 object-contain" 
              />
              <div>
                <div className="text-xl font-display font-semibold tracking-wider">Military Tees UK</div>
                <div className="text-xs text-muted-foreground font-display tracking-wide uppercase">Est. 2025</div>
              </div>
            </Link>
            <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6 max-w-md">
              <strong>MISSION:</strong> Provide high quality military-themed apparel with outstanding customer service. 
              Inspired by the barracks, built for quality.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2 text-xs md:text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Mail className="h-3 w-3 md:h-4 md:w-4" />
                <a href="mailto:info@militarytees.co.uk" className="hover:text-foreground transition-colors">
                  info@militarytees.co.uk
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-3 w-3 md:h-4 md:w-4" />
                <span>United Kingdom</span>
              </div>
            </div>
          </div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <div className="font-semibold text-foreground mb-3 md:mb-4 text-sm md:text-base">{category}</div>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.title}>
                    <Link 
                      href={link.href}
                      className="text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Section */}
        <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-border">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex-1 max-w-md">
              <div className="font-semibold text-foreground mb-2 text-sm md:text-base">Join Our Newsletter</div>
              <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">
                Get updates on new products, exclusive offers, and military gear insights.
              </p>
              
              {subscriptionStatus === "success" && (
                <div className="mb-3 md:mb-4 p-2 md:p-3 bg-green-100 border border-green-300 rounded text-green-800 text-xs md:text-sm">
                  ✅ Successfully subscribed! Welcome to the ranks.
                </div>
              )}
              
              {subscriptionStatus === "error" && (
                <div className="mb-3 md:mb-4 p-2 md:p-3 bg-red-100 border border-red-300 rounded text-red-800 text-xs md:text-sm">
                  ❌ Subscription failed. Please try again.
                </div>
              )}
              
              <form onSubmit={handleNewsletterSubmit} className="flex space-x-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 rounded-none border-2"
                  disabled={isSubscribing}
                  required
                />
                <Button 
                  type="submit"
                  className="rounded-none font-display font-bold tracking-wide uppercase"
                  disabled={isSubscribing}
                >
                  {isSubscribing ? "Subscribing..." : "Subscribe"}
                </Button>
              </form>
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-3 md:space-x-4">
              <span className="text-xs md:text-sm font-medium text-foreground">Follow Us:</span>
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 md:p-2 rounded-md bg-background hover:bg-accent transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-3 w-3 md:h-4 md:w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 md:gap-4">
          <div className="text-xs md:text-sm text-muted-foreground">
            © 2025 Military Tees UK. All rights reserved.
          </div>
          
          <div className="flex items-center space-x-2 md:space-x-4 text-xs md:text-sm text-muted-foreground">
            <span>Proudly British</span>
            <div className="w-px h-3 md:h-4 bg-border" />
            <span>Quality Guaranteed</span>
            <div className="w-px h-3 md:h-4 bg-border" />
            <span>Fast Delivery</span>
          </div>
        </div>

      </div>
    </footer>
  )
}