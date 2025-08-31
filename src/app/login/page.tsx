"use client"

import { Layout } from "@/components/layout/layout"
import { LoginForm } from "@/components/auth/login-form"
import { Badge } from "@/components/ui/badge"
import { Shield, CheckCircle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

// Component that uses useSearchParams
function LoginSuccessMessage() {
  const searchParams = useSearchParams()
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    if (searchParams?.get('message') === 'registration-success') {
      setShowSuccess(true)
    }
  }, [searchParams])

  if (!showSuccess) return null

  return (
    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
      <div className="flex items-center gap-2 text-green-800">
        <CheckCircle className="h-5 w-5" />
        <div>
          <p className="font-medium">Registration Successful!</p>
          <p className="text-sm">Please sign in with your new account.</p>
        </div>
      </div>
    </div>
  )
}

function LoginPageContent() {
  const { signIn, user, loading } = useAuth()

  // Redirect if already logged in
  useEffect(() => {
    if (typeof window !== 'undefined' && !loading && user) {
      window.location.href = "/account"
    }
  }, [user, loading])

  const handleLogin = async (email: string, password: string) => {
    if (!signIn) return
    try {
      await signIn(email, password)
      window.location.href = "/account"
    } catch (error) {
      throw error // Let the form handle the error display
    }
  }

  const handleForgotPassword = () => {
    window.location.href = "/forgot-password"
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-muted/20 to-background">
        
        {/* Header Section */}
        <section className="py-16 border-b-2 border-border">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-wider uppercase text-foreground mb-4">
              Base Access Control
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Secure login to your Military Tees UK command center
            </p>
          </div>
        </section>

        {/* Login Form Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 flex justify-center">
            <div className="w-full max-w-md space-y-6">
              
              {/* Registration Success Message with Suspense */}
              <Suspense fallback={null}>
                <LoginSuccessMessage />
              </Suspense>

              <LoginForm
                onSubmit={handleLogin}
                onSwitchToSignup={() => {
                  window.location.href = "/signup"
                }}
                onForgotPassword={handleForgotPassword}
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
              Active and veteran military personnel receive 10% off all orders
            </p>
          </div>
        </section>

        {/* Additional Info */}
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl mb-4">🔒</div>
                <h3 className="text-lg font-display font-bold mb-2">Secure Access</h3>
                <p className="text-sm text-muted-foreground">
                  Your account is protected with military-grade security protocols.
                </p>
              </div>
              <div>
                <div className="text-3xl mb-4">📦</div>
                <h3 className="text-lg font-display font-bold mb-2">Order History</h3>
                <p className="text-sm text-muted-foreground">
                  Track all your missions and gear acquisitions from your account.
                </p>
              </div>
              <div>
                <div className="text-3xl mb-4">⚡</div>
                <h3 className="text-lg font-display font-bold mb-2">Quick Checkout</h3>
                <p className="text-sm text-muted-foreground">
                  Saved addresses and preferences for rapid deployment of orders.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer Links */}
        <section className="py-8 border-t-2 border-border">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Need assistance with your account?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/contact"
                className="text-primary hover:text-primary/80 underline"
              >
                Contact Support Command
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

export default function LoginPage() {
  return <LoginPageContent />
}