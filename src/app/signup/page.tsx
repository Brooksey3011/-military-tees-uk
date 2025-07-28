"use client"

import { Layout } from "@/components/layout/layout"
import { SignupForm } from "@/components/auth/signup-form"
import { Badge } from "@/components/ui/badge"
import { Shield } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useEffect } from "react"
import Link from "next/link"

// Force dynamic rendering for this auth-dependent page
export const dynamic = 'force-dynamic'

export default function SignupPage() {
  const { signUp, user, loading } = useAuth()

  // Redirect if already logged in
  useEffect(() => {
    if (typeof window !== 'undefined' && !loading && user) {
      window.location.href = "/account"
    }
  }, [user, loading])

  const handleSignup = async (email: string, password: string, firstName: string, lastName: string) => {
    if (!signUp) return
    try {
      await signUp(email, password, { first_name: firstName, last_name: lastName })
      window.location.href = "/account"
    } catch (error) {
      throw error // Let the form handle the error display
    }
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-muted/20 to-background">
        
        {/* Header Section */}
        <section className="py-16 border-b-2 border-border">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-wider uppercase text-foreground mb-4">
              Join the Regiment
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Enlist with Military Tees UK and gain access to premium military-themed apparel
            </p>
          </div>
        </section>

        {/* Signup Form Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 flex justify-center">
            <div className="w-full max-w-md">
              <SignupForm
                onSubmit={handleSignup}
                onSwitchToLogin={() => {
                  window.location.href = "/login"
                }}
                isLoading={loading}
              />
            </div>
          </div>
        </section>

        {/* Military Discount Notice */}
        <section className="py-8 bg-primary/5">
          <div className="container mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-primary" />
              <Badge className="rounded-none bg-primary">
                MILITARY DISCOUNT
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Military personnel receive 10% off all orders - verify status after signup
            </p>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl mb-4">🎖️</div>
                <h3 className="text-lg font-display font-bold mb-2">Exclusive Access</h3>
                <p className="text-sm text-muted-foreground">
                  Get first access to new military-themed designs and limited editions.
                </p>
              </div>
              <div>
                <div className="text-3xl mb-4">📦</div>
                <h3 className="text-lg font-display font-bold mb-2">Order Tracking</h3>
                <p className="text-sm text-muted-foreground">
                  Full visibility of your orders from base to your doorstep.
                </p>
              </div>
              <div>
                <div className="text-3xl mb-4">💂</div>
                <h3 className="text-lg font-display font-bold mb-2">Community</h3>
                <p className="text-sm text-muted-foreground">
                  Join thousands of military personnel and enthusiasts.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer Links */}
        <section className="py-8 border-t-2 border-border">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Questions about joining?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/contact"
                className="text-primary hover:text-primary/80 underline"
              >
                Contact Recruitment
              </Link>
              <Link 
                href="/privacy"
                className="text-primary hover:text-primary/80 underline"
              >
                Privacy Policy
              </Link>
              <Link 
                href="/terms"
                className="text-primary hover:text-primary/80 underline"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </section>

      </div>
    </Layout>
  )
}