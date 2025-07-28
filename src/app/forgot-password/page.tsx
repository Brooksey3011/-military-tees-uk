"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeft, Shield, Mail, CheckCircle } from "lucide-react"
import { Layout } from "@/components/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [isSubmitted, setIsSubmitted] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate email sending process
    setTimeout(() => {
      setIsLoading(false)
      setIsSubmitted(true)
    }, 2000)
  }

  if (isSubmitted) {
    return (
      <Layout>
        <div className="min-h-screen bg-background flex items-center justify-center py-16">
          <div className="w-full max-w-md space-y-8">
            
            {/* Success Header */}
            <div className="text-center">
              <div className={cn(
                "inline-block p-4 mb-6",
                "border-2 border-green-600 rounded-none bg-background"
              )}>
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
              </div>
              
              <h1 className={cn(
                "text-3xl font-display font-bold text-foreground mb-2",
                "tracking-wider uppercase"
              )}>
                Email Sent
              </h1>
              
              <p className="text-muted-foreground">
                Check your inbox for password reset instructions
              </p>
            </div>

            {/* Success Card */}
            <Card className="border-2 border-border rounded-none">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <p className="text-sm text-foreground">
                    We've sent password reset instructions to:
                  </p>
                  <p className="font-medium text-primary">{email}</p>
                  <p className="text-xs text-muted-foreground">
                    If you don't see the email within a few minutes, check your spam folder.
                    The reset link will expire in 1 hour for security.
                  </p>
                  
                  <div className="pt-4 space-y-2">
                    <Button
                      variant="military"
                      size="lg"
                      className="w-full rounded-none"
                      asChild
                    >
                      <Link href="/login">
                        Back to Login
                      </Link>
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full rounded-none border-2"
                      onClick={() => {
                        setIsSubmitted(false)
                        setEmail("")
                      }}
                    >
                      Send Another Email
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background flex items-center justify-center py-16">
        <div className="w-full max-w-md space-y-8">
          
          {/* Header */}
          <div className="text-center">
            <div className={cn(
              "inline-block p-4 mb-6",
              "border-2 border-primary rounded-none bg-background"
            )}>
              <Shield className="h-12 w-12 text-primary mx-auto" />
            </div>
            
            <h1 className={cn(
              "text-3xl font-display font-bold text-foreground mb-2",
              "tracking-wider uppercase"
            )}>
              Password Recovery
            </h1>
            
            <p className="text-muted-foreground">
              Enter your email address and we'll send you a link to reset your password
            </p>
          </div>

          {/* Recovery Form */}
          <Card className="border-2 border-border rounded-none">
            <CardHeader>
              <CardTitle className={cn(
                "font-display tracking-wide uppercase text-center"
              )}>
                Reset Password
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      required
                      className="rounded-none border-2 pl-10"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    We'll send password reset instructions to this email address
                  </p>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="military"
                  size="lg"
                  className="w-full rounded-none"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
                      Sending Email...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>

                {/* Back to Login */}
                <div className="text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-none"
                    asChild
                  >
                    <Link href="/login" className="flex items-center gap-2">
                      <ArrowLeft className="h-4 w-4" />
                      Back to Login
                    </Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Additional Help */}
          <Card className="border-2 border-border rounded-none bg-muted/10">
            <CardContent className="pt-6">
              <div className="text-center text-sm space-y-2">
                <h3 className="font-semibold text-foreground">Need Help?</h3>
                <p className="text-muted-foreground">
                  If you're still having trouble accessing your account, contact our support team.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-none border-2 mt-2"
                  asChild
                >
                  <Link href="/contact">
                    Contact Support
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <div className="text-center text-xs text-muted-foreground space-y-1">
            <p>🔒 Password reset links expire after 1 hour for security</p>
            <p>📧 Always check your spam folder if you don't receive the email</p>
          </div>
        </div>
      </div>
    </Layout>
  )
}