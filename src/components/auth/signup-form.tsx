"use client"

import * as React from "react"
import { useState } from "react"
import { Eye, EyeOff, Mail, Lock, User, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface SignupFormProps {
  onSubmit?: (email: string, password: string, firstName: string, lastName: string) => Promise<void>
  onSwitchToLogin?: () => void
  className?: string
  isLoading?: boolean
  useBackendAPI?: boolean // New prop to use backend API instead of client-side auth
}

export function SignupForm({
  onSubmit,
  onSwitchToLogin,
  className,
  isLoading = false,
  useBackendAPI = true // Default to using backend API
}: SignupFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [errors, setErrors] = useState<{
    email?: string
    password?: string
    confirmPassword?: string
    firstName?: string
    lastName?: string
    terms?: string
    general?: string // For general API errors
  }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = () => {
    const newErrors: {
      email?: string
      password?: string
      confirmPassword?: string
      firstName?: string
      lastName?: string
      terms?: string
    } = {}
    
    if (!firstName.trim()) {
      newErrors.firstName = "First name is required"
    } else if (firstName.trim().length < 2) {
      newErrors.firstName = "First name must be at least 2 characters"
    }
    
    if (!lastName.trim()) {
      newErrors.lastName = "Last name is required"
    } else if (lastName.trim().length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters"
    }
    
    if (!email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address"
    }
    
    if (!password) {
      newErrors.password = "Password is required"
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      newErrors.password = "Password must contain uppercase, lowercase, and number"
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }
    
    if (!acceptTerms) {
      newErrors.terms = "You must accept the terms and conditions"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Backend API registration
  const handleBackendRegistration = async () => {
    setIsSubmitting(true)
    setErrors({}) // Clear previous errors

    try {
      const response = await fetch('/api/auth/register-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          marketingConsent: false
        })
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle specific error codes from backend
        switch (data.code) {
          case 'EMAIL_ALREADY_EXISTS':
            setErrors({ email: data.error })
            break
          case 'VALIDATION_ERROR':
            setErrors({ [data.field]: data.error })
            break
          case 'WEAK_PASSWORD':
            setErrors({ password: data.error })
            break
          case 'INVALID_EMAIL':
            setErrors({ email: data.error })
            break
          default:
            setErrors({ general: data.error || 'Registration failed. Please try again.' })
        }
        return
      }

      // Registration successful
      console.log('✅ Registration successful:', data)
      
      // Redirect to login or account page
      if (typeof window !== 'undefined') {
        window.location.href = '/login?message=registration-success'
      }

    } catch (error) {
      console.error('❌ Registration request failed:', error)
      setErrors({ 
        general: 'Network error. Please check your connection and try again.' 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    if (useBackendAPI) {
      await handleBackendRegistration()
    } else {
      // Use the original onSubmit prop (client-side auth)
      try {
        setIsSubmitting(true)
        await onSubmit?.(email, password, firstName.trim(), lastName.trim())
      } catch (error) {
        console.error("Signup failed:", error)
        
        // Try to extract meaningful error message
        let errorMessage = "Registration failed. Please try again."
        if (error instanceof Error) {
          if (error.message.includes('email')) {
            setErrors({ email: error.message })
          } else if (error.message.includes('password')) {
            setErrors({ password: error.message })
          } else {
            setErrors({ general: error.message })
          }
        } else {
          setErrors({ general: errorMessage })
        }
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <div className={cn("w-full max-w-md space-y-6", className)}>
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-primary/10 p-3 border-2 border-primary">
            <UserPlus className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-2xl font-display font-bold tracking-wider uppercase">
          Enlist Today
        </h1>
        <p className="text-muted-foreground">
          Join the Military Tees UK battalion
        </p>
      </div>

      {/* Signup Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* General Error Message */}
        {errors.general && (
          <div className="p-3 bg-red-50 border-2 border-red-200 rounded text-red-800 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Registration Failed:</span>
              <span>{errors.general}</span>
            </div>
          </div>
        )}
        
        {/* First Name Field */}
        <div className="space-y-2">
          <label htmlFor="firstName" className="text-sm font-display font-bold tracking-wide uppercase">
            First Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="firstName"
              type="text"
              placeholder="Enter your first name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={cn(
                "pl-10 rounded-none border-2",
                errors.firstName && "border-red-500"
              )}
              disabled={isLoading}
            />
          </div>
          {errors.firstName && (
            <p className="text-sm text-red-600">{errors.firstName}</p>
          )}
        </div>

        {/* Last Name Field */}
        <div className="space-y-2">
          <label htmlFor="lastName" className="text-sm font-display font-bold tracking-wide uppercase">
            Last Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="lastName"
              type="text"
              placeholder="Enter your last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={cn(
                "pl-10 rounded-none border-2",
                errors.lastName && "border-red-500"
              )}
              disabled={isLoading}
            />
          </div>
          {errors.lastName && (
            <p className="text-sm text-red-600">{errors.lastName}</p>
          )}
        </div>

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
              placeholder="recruit@example.com"
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
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-display font-bold tracking-wide uppercase">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create secure password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={cn(
                "pl-10 pr-10 rounded-none border-2",
                errors.password && "border-red-500"
              )}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Must contain uppercase, lowercase, and number. Minimum 8 characters.
          </p>
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-display font-bold tracking-wide uppercase">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={cn(
                "pl-10 pr-10 rounded-none border-2",
                errors.confirmPassword && "border-red-500"
              )}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              disabled={isLoading}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-red-600">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Terms and Conditions */}
        <div className="space-y-2">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-0.5 w-4 h-4 border-2 border-border rounded-none"
              disabled={isLoading}
            />
            <span className="text-sm text-muted-foreground leading-relaxed">
              I accept the{" "}
              <a href="/terms" className="text-primary underline hover:text-primary/80">
                Terms & Conditions
              </a>{" "}
              and{" "}
              <a href="/privacy" className="text-primary underline hover:text-primary/80">
                Privacy Policy
              </a>
            </span>
          </label>
          {errors.terms && (
            <p className="text-sm text-red-600">{errors.terms}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full rounded-none font-display font-bold tracking-wide uppercase"
          disabled={isLoading || isSubmitting}
        >
          {(isLoading || isSubmitting) ? "Enlisting..." : "Complete Enlistment"}
        </Button>
      </form>

      {/* Additional Options */}
      <div className="space-y-4">
        
        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground font-display font-bold tracking-wide">
              Already Enlisted?
            </span>
          </div>
        </div>

        {/* Switch to Login */}
        <Button
          type="button"
          variant="outline"
          className="w-full rounded-none border-2 font-display font-bold tracking-wide uppercase"
          onClick={onSwitchToLogin}
          disabled={isLoading}
        >
          Return to Base - Login
        </Button>
      </div>

      {/* Footer Note */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          Welcome to the finest military apparel collection in the UK. 
          Your service to style begins here.
        </p>
      </div>
    </div>
  )
}