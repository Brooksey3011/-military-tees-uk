"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { 
  MapPin, 
  Truck, 
  Package, 
  Clock,
  CheckCircle2,
  AlertCircle,
  Search
} from "lucide-react"
import { useSimpleCart } from "@/hooks/use-simple-cart"

interface ShippingAddress {
  firstName: string
  lastName: string
  address1: string
  address2: string
  city: string
  postcode: string
  country: string
  company: string
}

interface ShippingMethod {
  id: string
  name: string
  description: string
  price: number
  estimatedDays: string
  icon: React.ReactNode
  popular?: boolean
}

interface ShippingInformationProps {
  onSubmit: (data: { address: ShippingAddress; method: string }) => void
  onBack: () => void
  initialData?: { address?: Partial<ShippingAddress>; method?: string }
}

const shippingMethods: ShippingMethod[] = [
  {
    id: 'standard',
    name: 'Standard Delivery',
    description: 'Royal Mail 2nd Class',
    price: 4.99,
    estimatedDays: '3-5 business days',
    icon: <Package className="h-4 w-4" />
  },
  {
    id: 'express',
    name: 'Express Delivery',
    description: 'Royal Mail 1st Class',
    price: 6.99,
    estimatedDays: '1-2 business days',
    icon: <Truck className="h-4 w-4" />,
    popular: true
  },
  {
    id: 'next-day',
    name: 'Next Day Delivery',
    description: 'Royal Mail Special Delivery',
    price: 12.99,
    estimatedDays: 'Next business day',
    icon: <Clock className="h-4 w-4" />
  }
]

export function ShippingInformation({ 
  onSubmit, 
  onBack, 
  initialData = {} 
}: ShippingInformationProps) {
  const { totalPrice } = useSimpleCart()
  const [selectedMethod, setSelectedMethod] = useState(initialData.method || 'standard')
  const [address, setAddress] = useState<ShippingAddress>({
    firstName: initialData.address?.firstName || '',
    lastName: initialData.address?.lastName || '',
    address1: initialData.address?.address1 || '',
    address2: initialData.address?.address2 || '',
    city: initialData.address?.city || '',
    postcode: initialData.address?.postcode || '',
    country: initialData.address?.country || 'GB',
    company: initialData.address?.company || ''
  })
  const [errors, setErrors] = useState<Partial<ShippingAddress>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [postcodeValid, setPostcodeValid] = useState<boolean | null>(null)
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([])

  const isFreeShipping = totalPrice >= 50
  const adjustedMethods = shippingMethods.map(method => ({
    ...method,
    price: isFreeShipping ? 0 : method.price
  }))

  useEffect(() => {
    if (address.postcode && address.postcode.length >= 5) {
      validatePostcode(address.postcode)
    } else {
      setPostcodeValid(null)
      setAddressSuggestions([])
    }
  }, [address.postcode])

  const validatePostcode = async (postcode: string) => {
    try {
      // UK postcode validation regex
      const ukPostcodeRegex = /^[A-Z]{1,2}[0-9R][0-9A-Z]? [0-9][ABD-HJLNP-UW-Z]{2}$/i
      const isValid = ukPostcodeRegex.test(postcode.trim())
      setPostcodeValid(isValid)
      
      if (isValid) {
        // In a real application, you would call a postcode API here
        // For demo purposes, we'll simulate address suggestions
        setAddressSuggestions([
          {
            line1: `${Math.floor(Math.random() * 999) + 1} High Street`,
            line2: '',
            city: 'London',
            postcode: postcode.toUpperCase()
          },
          {
            line1: `${Math.floor(Math.random() * 99) + 1} Station Road`,
            line2: '',
            city: 'London',
            postcode: postcode.toUpperCase()
          }
        ])
      }
    } catch (error) {
      console.error('Postcode validation error:', error)
      setPostcodeValid(false)
    }
  }

  const validateForm = () => {
    const newErrors: Partial<ShippingAddress> = {}

    if (!address.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (!address.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    if (!address.address1.trim()) {
      newErrors.address1 = 'Address is required'
    }

    if (!address.city.trim()) {
      newErrors.city = 'City is required'
    }

    if (!address.postcode.trim()) {
      newErrors.postcode = 'Postcode is required'
    } else if (postcodeValid === false) {
      newErrors.postcode = 'Please enter a valid UK postcode'
    }

    if (!address.country) {
      newErrors.country = 'Country is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof ShippingAddress, value: string) => {
    setAddress(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleAddressSuggestion = (suggestion: any) => {
    setAddress(prev => ({
      ...prev,
      address1: suggestion.line1,
      address2: suggestion.line2 || '',
      city: suggestion.city,
      postcode: suggestion.postcode
    }))
    setAddressSuggestions([])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      onSubmit({ address, method: selectedMethod })
    } catch (error) {
      console.error('Submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Shipping Address */}
        <Card className="border border-border/50">
          <CardHeader>
            <CardTitle className="font-display font-bold tracking-wide uppercase flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Shipping Address
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
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
                  value={address.firstName}
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
                  value={address.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={errors.lastName ? 'border-destructive' : ''}
                  required
                />
                {errors.lastName && (
                  <p className="text-sm text-destructive">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Company (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="company">
                Company <span className="text-muted-foreground text-sm">(Optional)</span>
              </Label>
              <Input
                id="company"
                type="text"
                placeholder="Company name"
                value={address.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
              />
            </div>

            {/* Postcode with Validation */}
            <div className="space-y-2">
              <Label htmlFor="postcode">
                Postcode <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="postcode"
                  type="text"
                  placeholder="SW1A 1AA"
                  value={address.postcode}
                  onChange={(e) => handleInputChange('postcode', e.target.value.toUpperCase())}
                  className={`${errors.postcode ? 'border-destructive' : ''} ${
                    postcodeValid === true ? 'border-green-500' : ''
                  } ${postcodeValid === false ? 'border-destructive' : ''}`}
                  required
                />
                <div className="absolute right-3 top-3">
                  {postcodeValid === true && (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                  {postcodeValid === false && (
                    <AlertCircle className="h-4 w-4 text-destructive" />
                  )}
                </div>
              </div>
              {errors.postcode && (
                <p className="text-sm text-destructive">{errors.postcode}</p>
              )}
              {postcodeValid === true && (
                <p className="text-sm text-green-600">Valid UK postcode</p>
              )}
            </div>

            {/* Address Suggestions */}
            {addressSuggestions.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Suggested Addresses</Label>
                <div className="space-y-2">
                  {addressSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleAddressSuggestion(suggestion)}
                      className="w-full text-left p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="text-sm">
                        <div className="font-medium">{suggestion.line1}</div>
                        <div className="text-muted-foreground">
                          {suggestion.city}, {suggestion.postcode}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Address Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address1">
                  Address Line 1 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="address1"
                  type="text"
                  placeholder="House number and street name"
                  value={address.address1}
                  onChange={(e) => handleInputChange('address1', e.target.value)}
                  className={errors.address1 ? 'border-destructive' : ''}
                  required
                />
                {errors.address1 && (
                  <p className="text-sm text-destructive">{errors.address1}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address2">
                  Address Line 2 <span className="text-muted-foreground text-sm">(Optional)</span>
                </Label>
                <Input
                  id="address2"
                  type="text"
                  placeholder="Apartment, suite, building, etc."
                  value={address.address2}
                  onChange={(e) => handleInputChange('address2', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">
                  Town/City <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="city"
                  type="text"
                  placeholder="Town or city"
                  value={address.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className={errors.city ? 'border-destructive' : ''}
                  required
                />
                {errors.city && (
                  <p className="text-sm text-destructive">{errors.city}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Methods */}
        <Card className="border border-border/50">
          <CardHeader>
            <CardTitle className="font-display font-bold tracking-wide uppercase flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Delivery Options
              {isFreeShipping && (
                <Badge className="bg-green-100 text-green-800 border-green-300">
                  FREE SHIPPING
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {isFreeShipping && (
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle2 className="h-5 w-5" />
                  <div>
                    <div className="font-medium">Free shipping unlocked!</div>
                    <div className="text-sm text-green-600">
                      Your order qualifies for free delivery on all shipping methods
                    </div>
                  </div>
                </div>
              </div>
            )}

            <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod}>
              {adjustedMethods.map((method) => (
                <div key={method.id} className="relative">
                  <Label 
                    htmlFor={method.id}
                    className="flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/20 transition-colors"
                  >
                    <RadioGroupItem value={method.id} id={method.id} className="mr-4" />
                    
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {method.icon}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="font-medium">{method.name}</div>
                          {method.popular && (
                            <Badge variant="secondary" className="text-xs">
                              Most Popular
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {method.description} • {method.estimatedDays}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-medium">
                          {method.price === 0 ? (
                            <span className="text-green-600">FREE</span>
                          ) : (
                            <>
                              {isFreeShipping && (
                                <span className="text-sm text-muted-foreground line-through mr-2">
                                  £{method.price.toFixed(2)}
                                </span>
                              )}
                              <span className={isFreeShipping ? 'text-green-600' : ''}>
                                £{(isFreeShipping ? 0 : method.price).toFixed(2)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex-1"
          >
            Back to Information
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
                Continue to Payment
                <CheckCircle2 className="h-4 w-4" />
              </div>
            )}
          </Button>
        </div>
      </form>

      {/* Delivery Information */}
      <Card className="border border-border/50">
        <CardContent className="p-4">
          <div className="text-center space-y-2">
            <div className="text-sm font-medium">Delivery Information</div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• All orders are dispatched within 1-2 business days</p>
              <p>• Free shipping on orders over £50</p>
              <p>• Tracking information provided for all orders</p>
              <p>• Secure packaging with military precision</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}