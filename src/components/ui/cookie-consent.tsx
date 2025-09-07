"use client"

import * as React from "react"
import { Cookie, Settings, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface CookiePreferences {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  preferences: boolean
}

export function CookieConsent() {
  const [isVisible, setIsVisible] = React.useState(false)
  const [showPreferences, setShowPreferences] = React.useState(false)
  const [isMounted, setIsMounted] = React.useState(false)
  const [preferences, setPreferences] = React.useState<CookiePreferences>({
    necessary: true, // Always required
    analytics: false,
    marketing: false,
    preferences: false
  })

  React.useEffect(() => {
    setIsMounted(true)
    
    // Check if user has already made a choice
    if (typeof window !== 'undefined') {
      const consent = localStorage.getItem('cookie-consent')
      if (!consent) {
        // Show banner after a short delay
        const timer = setTimeout(() => setIsVisible(true), 1000)
        return () => clearTimeout(timer)
      }
    }
  }, [])

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true
    }
    setPreferences(allAccepted)
    saveCookieConsent(allAccepted)
    setIsVisible(false)
  }

  const handleAcceptSelected = () => {
    saveCookieConsent(preferences)
    setIsVisible(false)
  }

  const handleRejectAll = () => {
    const rejected = {
      necessary: true, // Always required
      analytics: false,
      marketing: false,
      preferences: false
    }
    setPreferences(rejected)
    saveCookieConsent(rejected)
    setIsVisible(false)
  }

  const saveCookieConsent = (consent: CookiePreferences) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cookie-consent', JSON.stringify(consent))
      localStorage.setItem('cookie-consent-date', Date.now().toString())
    }
    
    // Trigger analytics configuration based on consent
    if (consent.analytics) {
      // Initialize analytics here (Google Analytics, etc.)
      console.log('Analytics cookies enabled')
    }
    
    if (consent.marketing) {
      // Initialize marketing cookies here
      console.log('Marketing cookies enabled')
    }
    
    if (consent.preferences) {
      // Initialize preference cookies here
      console.log('Preference cookies enabled')
    }
  }

  const handlePreferenceChange = (type: keyof CookiePreferences) => {
    if (type === 'necessary') return // Cannot be disabled
    
    setPreferences(prev => ({
      ...prev,
      [type]: !prev[type]
    }))
  }

  // Don't render anything until mounted to prevent hydration mismatch
  if (!isMounted || !isVisible) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center p-4">
      <Card className="w-full max-w-4xl rounded-none border-2 border-border shadow-2xl">
        <CardContent className="p-6">
          {!showPreferences ? (
            // Main consent banner
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-none">
                  <Cookie className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-display font-bold text-foreground mb-2">
                    We Value Your Privacy
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    Military Tees UK uses cookies to enhance your browsing experience, provide personalized content, 
                    and analyze our traffic. We respect your privacy and follow GDPR guidelines for UK users.
                  </p>
                  <p className="text-muted-foreground text-xs">
                    By clicking "Accept All", you consent to our use of cookies. You can manage your preferences or learn more in our{" "}
                    <Link href="/cookies" className="text-primary hover:underline">
                      Cookie Policy
                    </Link>
                    {" "}and{" "}
                    <Link href="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsVisible(false)}
                  className="p-2 h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
                <Button
                  onClick={handleAcceptAll}
                  className="rounded-none font-display font-bold tracking-wide uppercase"
                >
                  Accept All Cookies
                </Button>
                <Button
                  onClick={handleRejectAll}
                  variant="outline"
                  className="rounded-none border-2 font-display font-bold tracking-wide uppercase"
                >
                  Reject All
                </Button>
                <Button
                  onClick={() => setShowPreferences(true)}
                  variant="outline"
                  className="rounded-none border-2 font-display font-bold tracking-wide uppercase"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Customize
                </Button>
              </div>
            </div>
          ) : (
            // Preferences panel
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-display font-bold text-foreground">
                  Cookie Preferences
                </h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowPreferences(false)}
                  className="p-2 h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                {/* Necessary Cookies */}
                <div className="flex items-start justify-between p-4 border-2 border-border rounded-none">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-1">
                      Necessary Cookies
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Essential for website functionality, security, and basic features. These cannot be disabled.
                    </p>
                  </div>
                  <div className="ml-4">
                    <div className="w-12 h-6 bg-primary rounded-full flex items-center justify-end p-1">
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-start justify-between p-4 border-2 border-border rounded-none">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-1">
                      Analytics Cookies
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Help us understand how visitors interact with our website to improve performance and user experience.
                    </p>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() => handlePreferenceChange('analytics')}
                      className={cn(
                        "w-12 h-6 rounded-full flex items-center p-1 transition-colors",
                        preferences.analytics 
                          ? "bg-primary justify-end" 
                          : "bg-muted justify-start"
                      )}
                    >
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </button>
                  </div>
                </div>

                {/* Marketing Cookies */}
                <div className="flex items-start justify-between p-4 border-2 border-border rounded-none">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-1">
                      Marketing Cookies
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Used to track visitors for personalized advertising and to measure campaign effectiveness.
                    </p>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() => handlePreferenceChange('marketing')}
                      className={cn(
                        "w-12 h-6 rounded-full flex items-center p-1 transition-colors",
                        preferences.marketing 
                          ? "bg-primary justify-end" 
                          : "bg-muted justify-start"
                      )}
                    >
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </button>
                  </div>
                </div>

                {/* Preference Cookies */}
                <div className="flex items-start justify-between p-4 border-2 border-border rounded-none">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-1">
                      Preference Cookies
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Remember your choices and settings to provide a more personalized experience.
                    </p>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() => handlePreferenceChange('preferences')}
                      className={cn(
                        "w-12 h-6 rounded-full flex items-center p-1 transition-colors",
                        preferences.preferences 
                          ? "bg-primary justify-end" 
                          : "bg-muted justify-start"
                      )}
                    >
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
                <Button
                  onClick={handleAcceptSelected}
                  className="rounded-none font-display font-bold tracking-wide uppercase"
                >
                  Accept Selected
                </Button>
                <Button
                  onClick={handleAcceptAll}
                  variant="outline"
                  className="rounded-none border-2 font-display font-bold tracking-wide uppercase"
                >
                  Accept All
                </Button>
                <Button
                  onClick={() => setShowPreferences(false)}
                  variant="ghost"
                  className="rounded-none font-display font-bold tracking-wide uppercase"
                >
                  Back
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}