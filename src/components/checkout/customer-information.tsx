"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { 
  User, 
  Mail, 
  Phone, 
  LogIn, 
  UserPlus, 
  Shield,
  CheckCircle2
} from "lucide-react"
import Link from "next/link"

interface CustomerData {
  email: string
  firstName: string
  lastName: string
  phone: string
  createAccount: boolean
  password: string
  marketingConsent: boolean
}

interface CustomerInformationProps {
  onSubmit: (data: CustomerData) => void
  onBack: () => void
  initialData?: Partial<CustomerData>
}

export function CustomerInformation({ 
  onSubmit, 
  onBack, 
  initialData = {} 
}: CustomerInformationProps) {
  const [checkoutType, setCheckoutType] = useState<'guest' | 'login' | 'register'>('guest')
  const [formData, setFormData] = useState<CustomerData>({
    email: initialData.email || '',
    firstName: initialData.firstName || '',
    lastName: initialData.lastName || '',
    phone: initialData.phone || '',
    createAccount: initialData.createAccount || false,
    password: '',
    marketingConsent: initialData.marketingConsent || false
  })
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState<Partial<CustomerData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = () => {
    const newErrors: Partial<CustomerData> = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.firstName) {
      newErrors.firstName = 'First name is required'
    }

    if (!formData.lastName) {
      newErrors.lastName = 'Last name is required'
    }

    if (formData.phone && !/^[\+]?[0-9\s\-\(\)]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    if ((checkoutType === 'register' || formData.createAccount) && !formData.password) {
      newErrors.password = 'Password is required'
    } else if ((checkoutType === 'register' || formData.createAccount) && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      onSubmit(formData)
    } catch (error) {
      console.error('Submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof CustomerData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <div className="space-y-6">
      {/* Checkout Type Selection */}
      <Card className="border border-border/50">
        <CardHeader>
          <CardTitle className="font-display font-bold tracking-wide uppercase flex items-center gap-2">
            <User className="h-5 w-5" />
            Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Checkout Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Guest Checkout */}
            <Button
              type="button"
              variant={checkoutType === 'guest' ? 'default' : 'outline'}
              className="h-auto p-4 justify-start"
              onClick={() => setCheckoutType('guest')}
            >
              <div className="text-left">
                <div className="font-semibold flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Continue as Guest
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Quick and secure checkout
                </div>
              </div>
            </Button>

            {/* Returning Customer */}
            <Button
              type="button"
              variant={checkoutType === 'login' ? 'default' : 'outline'}
              className="h-auto p-4 justify-start"
              onClick={() => setCheckoutType('login')}
            >
              <div className="text-left">
                <div className="font-semibold flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Returning Customer
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Sign in to your account
                </div>
              </div>
            </Button>

            {/* Create Account */}
            <Button
              type="button"
              variant={checkoutType === 'register' ? 'default' : 'outline'}
              className="h-auto p-4 justify-start"
              onClick={() => setCheckoutType('register')}
            >
              <div className="text-left">
                <div className="font-semibold flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Create Account
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Save details for future orders
                </div>
              </div>
            </Button>
          </div>

          <Separator />

          {/* Login Form */}
          {checkoutType === 'login' && (
            <div className="space-y-4 p-4 bg-muted/20 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="Enter your email"
                    value={loginData.email}
                    onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="Enter your password"
                  value={loginData.password}
                  onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <Link href="/forgot-password" className="text-primary hover:underline">
                  Forgot your password?
                </Link>
              </div>
              <Button type="button" className="w-full">
                Sign In
              </Button>
            </div>
          )}

          {/* Customer Information Form */}
          {(checkoutType === 'guest' || checkoutType === 'register') && (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email Address <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
                    required
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    First Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={errors.firstName ? 'border-destructive' : ''}
                    required
                  />
                  {errors.firstName && (
                    <p className="text-sm text-destructive">{errors.firstName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    Last Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={errors.lastName ? 'border-destructive' : ''}
                    required
                  />
                  {errors.lastName && (
                    <p className="text-sm text-destructive">{errors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone Number <span className="text-muted-foreground text-sm">(Optional)</span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`pl-10 ${errors.phone ? 'border-destructive' : ''}`}
                  />
                </div>
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  We'll only contact you about your order
                </p>
              </div>

              {/* Account Creation for Guest */}
              {checkoutType === 'guest' && (
                <div className="space-y-4 p-4 bg-muted/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="createAccount"
                      checked={formData.createAccount}
                      onCheckedChange={(checked) => handleInputChange('createAccount', !!checked)}
                    />
                    <Label htmlFor="createAccount" className="text-sm">
                      Create an account for faster checkout next time
                    </Label>
                  </div>
                  
                  {formData.createAccount && (
                    <div className="space-y-2">
                      <Label htmlFor="password">
                        Create Password <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Create a secure password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className={errors.password ? 'border-destructive' : ''}
                      />
                      {errors.password && (
                        <p className="text-sm text-destructive">{errors.password}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Minimum 6 characters required
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Password for Register */}
              {checkoutType === 'register' && (
                <div className="space-y-2">
                  <Label htmlFor="register-password">
                    Create Password <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="Create a secure password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={errors.password ? 'border-destructive' : ''}
                    required
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Minimum 6 characters required
                  </p>
                </div>
              )}

              {/* Marketing Consent */}
              <div className="space-y-4 p-4 bg-muted/20 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="marketing"
                    checked={formData.marketingConsent}
                    onCheckedChange={(checked) => handleInputChange('marketingConsent', !!checked)}
                  />
                  <div className="text-sm">
                    <Label htmlFor="marketing">
                      Keep me updated on new products and exclusive offers
                    </Label>
                    <p className="text-muted-foreground mt-1">
                      You can unsubscribe at any time. See our{' '}
                      <Link href="/privacy" className="text-primary hover:underline">
                        Privacy Policy
                      </Link>
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  className="flex-1"
                >
                  Back to Cart
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      Continue to Shipping
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Trust Indicators */}
      <Card className="border border-border/50">
        <CardContent className="p-4">
          <div className="text-center space-y-2">
            <div className="text-sm font-medium">Your information is secure</div>
            <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                <span>256-bit SSL Encrypted</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                <span>GDPR Compliant</span>
              </div>
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>Privacy Protected</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}