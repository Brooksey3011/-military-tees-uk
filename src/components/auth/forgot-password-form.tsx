"use client"

import * as React from "react"
import { useState } from "react"
import { Mail, ArrowLeft, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface ForgotPasswordFormProps {
  onSubmit?: (email: string) => Promise<void>
  onBackToLogin?: () => void
  className?: string
  isLoading?: boolean
}

export function ForgotPasswordForm({
  onSubmit,
  onBackToLogin,
  className,
  isLoading = false
}: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errors, setErrors] = useState<{email?: string}>({})

  const validateForm = () => {
    const newErrors: {email?: string} = {}
    
    if (!email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    try {
      await onSubmit?.(email)
      setIsSubmitted(true)
    } catch (error) {
      console.error("Password reset failed:", error)
      setErrors({ email: "Failed to send reset email. Please try again." })
    }
  }

  if (isSubmitted) {
    return (
      <div className={cn("w-full max-w-md space-y-6", className)}>
        {/* Success State */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-green-100 p-3 border-2 border-green-600">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <h1 className="text-2xl font-display font-bold tracking-wider uppercase">
            Mission Dispatched
          </h1>
          
          <div className="space-y-3">
            <p className="text-muted-foreground">
              Recovery codes have been deployed to:
            </p>
            <p className="font-semibold bg-muted/50 p-3 border-2 border-border">
              {email}
            </p>
            <p className="text-sm text-muted-foreground">
              Check your inbox and follow the instructions to reset your password. 
              Don't forget to check your spam folder if you don't see it within a few minutes.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            type="button"
            onClick={onBackToLogin}
            className="w-full rounded-none font-display font-bold tracking-wide uppercase"
          >
            Return to Login Base
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsSubmitted(false)
              setEmail("")
              setErrors({})
            }}
            className="w-full rounded-none border-2 font-display font-bold tracking-wide uppercase"
          >
            Send to Different Email
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("w-full max-w-md space-y-6", className)}>
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-primary/10 p-3 border-2 border-primary">
            <Shield className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-2xl font-display font-bold tracking-wider uppercase">
          Password Recovery
        </h1>
        <p className="text-muted-foreground">
          Lost your access codes? No problem, soldier.
        </p>
      </div>

      {/* Recovery Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Email Field */}
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-display font-bold tracking-wide uppercase">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={cn(
                "pl-10 rounded-none border-2",
                errors.email && "border-red-500"
              )}
              disabled={isLoading}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email}</p>
          )}
          <p className="text-xs text-muted-foreground">
            We'll send password reset instructions to this email address.
          </p>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full rounded-none font-display font-bold tracking-wide uppercase"
          disabled={isLoading}
        >
          {isLoading ? "Deploying Recovery..." : "Send Recovery Codes"}
        </Button>
      </form>

      {/* Back to Login */}
      <div className="space-y-4">
        
        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground font-display font-bold tracking-wide">
              Remember Your Codes?
            </span>
          </div>
        </div>

        {/* Back to Login Button */}
        <Button
          type="button"
          variant="outline"
          className="w-full rounded-none border-2 font-display font-bold tracking-wide uppercase"
          onClick={onBackToLogin}
          disabled={isLoading}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Return to Login
        </Button>
      </div>

      {/* Security Note */}
      <div className="bg-muted/30 p-4 border-2 border-border">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-display font-bold text-sm uppercase tracking-wide mb-1">
              Security Protocol
            </h3>
            <p className="text-xs text-muted-foreground">
              For security reasons, password reset links expire after 1 hour. 
              If you don't receive an email, check your spam folder or contact our support team.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}