"use client"

import { useState, useEffect } from "react"
import { Mail, Gift, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface NewsletterSignupProps {
  variant?: "modal" | "inline" | "footer" | "exit-intent"
  showDiscount?: boolean
  className?: string
  trigger?: React.ReactNode
}

export function NewsletterSignup({ 
  variant = "inline", 
  showDiscount = true, 
  className,
  trigger 
}: NewsletterSignupProps) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [error, setError] = useState("")
  const [showModal, setShowModal] = useState(false)

  // Exit intent detection for exit-intent variant
  useEffect(() => {
    if (variant !== "exit-intent") return

    let hasShown = sessionStorage.getItem('newsletter-exit-intent-shown')
    if (hasShown) return

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        setShowModal(true)
        sessionStorage.setItem('newsletter-exit-intent-shown', 'true')
      }
    }

    document.addEventListener('mouseleave', handleMouseLeave)
    return () => document.removeEventListener('mouseleave', handleMouseLeave)
  }, [variant])

  // Timer-based popup (after 30 seconds)
  useEffect(() => {
    if (variant !== "modal") return

    let hasShown = sessionStorage.getItem('newsletter-modal-shown')
    if (hasShown) return

    const timer = setTimeout(() => {
      setShowModal(true)
      sessionStorage.setItem('newsletter-modal-shown', 'true')
    }, 30000) // 30 seconds

    return () => clearTimeout(timer)
  }, [variant])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          source: variant,
          discount: showDiscount 
        }),
      })

      if (response.ok) {
        setIsSubscribed(true)
        setEmail("")
        // Auto-close modal after success
        if (variant === "modal" || variant === "exit-intent") {
          setTimeout(() => setShowModal(false), 2000)
        }
      } else {
        const data = await response.json()
        setError(data.message || 'Something went wrong. Please try again.')
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const SignupForm = () => (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="p-2 bg-primary/10 rounded-full">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          {showDiscount && (
            <Badge variant="secondary" className="bg-primary text-primary-foreground">
              <Gift className="h-3 w-3 mr-1" />
              10% OFF
            </Badge>
          )}
        </div>
        
        <h3 className="text-lg font-display font-bold tracking-wide uppercase">
          Join the Ranks
        </h3>
        
        <p className="text-sm text-muted-foreground">
          Get exclusive access to new designs, military discounts, and special offers.
          {showDiscount && " Plus get 10% off your first order!"}
        </p>
      </div>

      {isSubscribed ? (
        <div className="text-center py-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="p-2 bg-green-100 rounded-full">
              <Check className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <p className="font-medium text-green-600">Welcome aboard!</p>
          <p className="text-sm text-muted-foreground">
            {showDiscount 
              ? "Check your email for your discount code."
              : "You'll receive our latest updates soon."
            }
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 rounded-none border-2"
              required
            />
          </div>
          
          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}
          
          <Button
            type="submit"
            disabled={isLoading || !email}
            className="w-full rounded-none font-bold uppercase tracking-wide"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
                Signing Up...
              </div>
            ) : showDiscount ? (
              "Get 10% Off & Join"
            ) : (
              "Join Newsletter"
            )}
          </Button>
        </form>
      )}

      <div className="text-xs text-muted-foreground text-center space-y-1">
        <p>✅ Military discounts & exclusive offers</p>
        <p>✅ New design previews & early access</p>
        <p>✅ Unsubscribe anytime</p>
      </div>
    </div>
  )

  // Inline variant (for homepage, product pages)
  if (variant === "inline") {
    return (
      <Card className={cn("border-2 border-border rounded-none", className)}>
        <CardContent className="p-6">
          <SignupForm />
        </CardContent>
      </Card>
    )
  }

  // Footer variant (compact)
  if (variant === "footer") {
    return (
      <div className={cn("space-y-4", className)}>
        <div>
          <h3 className="text-lg font-display font-bold tracking-wide uppercase mb-2">
            Stay Connected
          </h3>
          <p className="text-sm text-muted-foreground">
            Military discounts, new designs, and exclusive offers.
          </p>
        </div>

        {isSubscribed ? (
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-600">Subscribed!</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-2">
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 rounded-none"
                required
              />
              <Button
                type="submit"
                disabled={isLoading || !email}
                className="rounded-none px-4"
              >
                {isLoading ? "..." : "Join"}
              </Button>
            </div>
            {error && (
              <p className="text-xs text-destructive">{error}</p>
            )}
          </form>
        )}
      </div>
    )
  }

  // Modal variants (popup, exit-intent)
  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="sr-only">Newsletter Signup</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowModal(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        <SignupForm />
      </DialogContent>
    </Dialog>
  )
}

interface ExitIntentPopupProps {
  enabled?: boolean
}

export function ExitIntentPopup({ enabled = true }: ExitIntentPopupProps) {
  if (!enabled) return null
  
  return <NewsletterSignup variant="exit-intent" showDiscount={true} />
}

interface TimedPopupProps {
  delay?: number
  enabled?: boolean
}

export function TimedPopup({ delay = 30000, enabled = true }: TimedPopupProps) {
  if (!enabled) return null
  
  return <NewsletterSignup variant="modal" showDiscount={true} />
}