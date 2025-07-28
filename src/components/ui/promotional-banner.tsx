"use client"

import * as React from "react"
import { X, Tag, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PromotionalBannerProps {
  title: string
  description?: string
  ctaText?: string
  ctaLink?: string
  variant?: "default" | "urgent" | "success"
  dismissible?: boolean
  countdown?: boolean
  className?: string
}

export function PromotionalBanner({
  title,
  description,
  ctaText,
  ctaLink,
  variant = "default",
  dismissible = true,
  countdown = false,
  className
}: PromotionalBannerProps) {
  const [dismissed, setDismissed] = React.useState(false)
  const [timeLeft, setTimeLeft] = React.useState({
    days: 2,
    hours: 14,
    minutes: 32,
    seconds: 45
  })

  // Countdown timer effect
  React.useEffect(() => {
    if (!countdown) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const newSeconds = prev.seconds - 1
        if (newSeconds >= 0) {
          return { ...prev, seconds: newSeconds }
        }
        
        const newMinutes = prev.minutes - 1
        if (newMinutes >= 0) {
          return { ...prev, minutes: newMinutes, seconds: 59 }
        }
        
        const newHours = prev.hours - 1
        if (newHours >= 0) {
          return { ...prev, hours: newHours, minutes: 59, seconds: 59 }
        }
        
        const newDays = prev.days - 1
        if (newDays >= 0) {
          return { days: newDays, hours: 23, minutes: 59, seconds: 59 }
        }
        
        return prev
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [countdown])

  if (dismissed) return null

  const variantStyles = {
    default: "bg-gradient-to-r from-green-700 to-green-800 text-white",
    urgent: "bg-gradient-to-r from-red-600 to-red-700 text-white animate-pulse",
    success: "bg-gradient-to-r from-[#FFAD02] to-yellow-500 text-black"
  }

  return (
    <div className={cn(
      "relative py-3 px-4 border-b-2 border-black",
      variantStyles[variant],
      className
    )}>
      <div className="container mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
          {/* Main Content */}
          <div className="flex items-center gap-3">
            <Tag className="h-5 w-5" />
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <span className="text-lg font-bold uppercase tracking-wide">
                {title}
              </span>
              {description && (
                <span className="text-sm opacity-90">
                  {description}
                </span>
              )}
            </div>
          </div>

          {/* Countdown Timer */}
          {countdown && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <div className="flex items-center gap-1 text-sm font-mono">
                <span className="bg-black/20 px-2 py-1 rounded">
                  {String(timeLeft.days).padStart(2, '0')}d
                </span>
                <span>:</span>
                <span className="bg-black/20 px-2 py-1 rounded">
                  {String(timeLeft.hours).padStart(2, '0')}h
                </span>
                <span>:</span>
                <span className="bg-black/20 px-2 py-1 rounded">
                  {String(timeLeft.minutes).padStart(2, '0')}m
                </span>
                <span>:</span>
                <span className="bg-black/20 px-2 py-1 rounded">
                  {String(timeLeft.seconds).padStart(2, '0')}s
                </span>
              </div>
            </div>
          )}

          {/* CTA Button */}
          {ctaText && ctaLink && (
            <Button
              size="sm"
              className={cn(
                "font-bold uppercase tracking-wide",
                variant === "success" 
                  ? "bg-black text-white hover:bg-black/90" 
                  : "bg-white text-black hover:bg-white/90"
              )}
              asChild
            >
              <a href={ctaLink}>
                {ctaText}
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Dismiss Button */}
      {dismissible && (
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/10 transition-colors"
          aria-label="Dismiss banner"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}