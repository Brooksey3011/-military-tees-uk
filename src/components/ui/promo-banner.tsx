"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface PromoBannerProps {
  className?: string
}

export function PromoBanner({ className }: PromoBannerProps) {
  const [isVisible, setIsVisible] = useState(true)

  const promoMessages = [
    "FREE SHIPPING ON YOUR FIRST ORDER - CREATE ACCOUNT TODAY",
    "FREE UK DELIVERY ON ORDERS OVER £50",
    "10% MILITARY DISCOUNT AVAILABLE - VERIFY AT CHECKOUT", 
    "BULK PRICING AVAILABLE FOR UNIT & GROUP ORDERS",
    "PREMIUM MILITARY HERITAGE APPAREL - PROUDLY SERVING THOSE WHO SERVE"
  ]

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const shouldHide = scrollY > 100
      setIsVisible(!shouldHide)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!isVisible) return null

  return (
    <div className={cn(
      "relative overflow-hidden bg-primary text-primary-foreground py-2 z-50",
      "transition-transform duration-300 ease-in-out",
      "border-b border-primary-foreground/20",
      className
    )}>
      {/* Moving text container */}
      <div className="relative whitespace-nowrap">
        <div className="animate-marquee inline-flex items-center space-x-8">
          {/* First set of messages */}
          {promoMessages.map((message, index) => (
            <span 
              key={`first-${index}`}
              className="font-display font-bold text-xs md:text-sm tracking-wider uppercase px-8"
            >
              {message}
            </span>
          ))}
          {/* Second set for seamless loop */}
          {promoMessages.map((message, index) => (
            <span 
              key={`second-${index}`}
              className="font-display font-bold text-xs md:text-sm tracking-wider uppercase px-8"
            >
              {message}
            </span>
          ))}
        </div>
      </div>

      {/* Optional decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/5 to-transparent pointer-events-none" />
    </div>
  )
}