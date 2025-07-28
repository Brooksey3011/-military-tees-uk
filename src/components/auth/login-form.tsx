"use client"

import * as React from "react"
import { useState } from "react"
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface LoginFormProps {
  onSubmit?: (email: string, password: string) => Promise<void>
  onSwitchToSignup?: () => void
  onForgotPassword?: () => void
  className?: string
  isLoading?: boolean
}

export function LoginForm({
  onSubmit,
  onSwitchToSignup,
  onForgotPassword,
  className,
  isLoading = false
}: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{email?: string, password?: string}>({})

  const validateForm = () => {
    const newErrors: {email?: string, password?: string} = {}
    
    if (!email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address"
    }
    
    if (!password) {
      newErrors.password = "Password is required"
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    try {
      if (onSubmit) {
        await onSubmit(email, password)
      }
    } catch (error) {
      console.error('Login error:', error)
      setErrors({ 
        email: error instanceof Error ? error.message : 'Login failed' 
      })
    }
  }

  return (
    <div className={cn("w-full max-w-md space-y-6", className)}>
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-primary/10 p-3 border-2 border-primary">
            <User className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-2xl font-display font-bold tracking-wider uppercase">
          Mission Login
        </h1>
        <p className="text-muted-foreground">
          Access your Military Tees UK account
        </p>
      </div>

      {/* Login Form */}
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
              placeholder="soldier@example.com"
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
              placeholder="Enter your password"
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
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full rounded-none font-display font-bold tracking-wide uppercase"
          disabled={isLoading}
        >
          {isLoading ? "Deploying..." : "Deploy Login"}
        </Button>
      </form>

      {/* Additional Options */}
      <div className="space-y-4">
        
        {/* Forgot Password */}
        <div className="text-center">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm text-primary hover:text-primary/80 underline"
            disabled={isLoading}
          >
            Lost your access codes? Reset password
          </button>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground font-display font-bold tracking-wide">
              New Recruit?
            </span>
          </div>
        </div>

        {/* Switch to Signup */}
        <Button
          type="button"
          variant="outline"
          className="w-full rounded-none border-2 font-display font-bold tracking-wide uppercase"
          onClick={onSwitchToSignup}
          disabled={isLoading}
        >
          Join the Ranks - Sign Up
        </Button>
      </div>

      {/* Footer Note */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          By logging in, you confirm your continued service to premium military apparel.
        </p>
      </div>
    </div>
  )
}