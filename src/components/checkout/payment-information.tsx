"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { 
  CreditCard, 
  Shield, 
  Lock,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Wallet,
  Building
} from "lucide-react"
import { useSimpleCart } from "@/hooks/use-simple-cart"

interface PaymentMethod {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  popular?: boolean
  comingSoon?: boolean
}

interface PaymentData {
  method: string
  cardDetails?: {
    number: string
    expiry: string
    cvc: string
    name: string
  }
  billingAddress: {
    sameAsShipping: boolean
    firstName: string
    lastName: string
    address1: string
    address2: string
    city: string
    postcode: string
    country: string
  }
}

interface PaymentInformationProps {
  onSubmit: (data: PaymentData) => void
  onBack: () => void
  initialData?: Partial<PaymentData>
  shippingAddress?: any
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'stripe-redirect',
    name: 'Secure Card Payment',
    description: 'Visa, Mastercard, Amex - Powered by Stripe',
    icon: <CreditCard className="h-4 w-4" />,
    popular: true
  },
  {
    id: 'apple-pay',
    name: 'Apple Pay',
    description: 'Touch ID or Face ID',
    icon: <Smartphone className="h-4 w-4" />,
    comingSoon: true
  },
  {
    id: 'google-pay',
    name: 'Google Pay',
    description: 'One-touch payments',
    icon: <Wallet className="h-4 w-4" />,
    comingSoon: true
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'Pay with your PayPal account',
    icon: <Building className="h-4 w-4" />,
    comingSoon: true
  }
]

export function PaymentInformation({ 
  onSubmit, 
  onBack, 
  initialData = {},
  shippingAddress 
}: PaymentInformationProps) {
  const { totalPrice } = useSimpleCart()
  const [selectedMethod, setSelectedMethod] = useState(initialData.method || 'stripe-redirect')
  const [paymentData, setPaymentData] = useState<PaymentData>({
    method: selectedMethod,
    billingAddress: {
      sameAsShipping: initialData.billingAddress?.sameAsShipping ?? true,
      firstName: initialData.billingAddress?.firstName || '',
      lastName: initialData.billingAddress?.lastName || '',
      address1: initialData.billingAddress?.address1 || '',
      address2: initialData.billingAddress?.address2 || '',
      city: initialData.billingAddress?.city || '',
      postcode: initialData.billingAddress?.postcode || '',
      country: initialData.billingAddress?.country || 'GB'
    }
  })
  const [errors, setErrors] = useState<any>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const shippingCost = totalPrice >= 50 ? 0 : 4.99
  const tax = totalPrice * 0.2
  const finalTotal = totalPrice + shippingCost + tax

  const validateForm = () => {
    const newErrors: any = {}

    if (selectedMethod === 'card' && paymentData.cardDetails) {
      if (!paymentData.cardDetails.number || paymentData.cardDetails.number.length < 15) {
        newErrors.cardNumber = 'Please enter a valid card number'
      }
      if (!paymentData.cardDetails.expiry) {
        newErrors.expiry = 'Expiry date is required'
      }
      if (!paymentData.cardDetails.cvc || paymentData.cardDetails.cvc.length < 3) {
        newErrors.cvc = 'Please enter a valid CVC'
      }
      if (!paymentData.cardDetails.name) {
        newErrors.cardName = 'Cardholder name is required'
      }
    }

    if (!paymentData.billingAddress.sameAsShipping) {
      if (!paymentData.billingAddress.firstName) {
        newErrors.billingFirstName = 'First name is required'
      }
      if (!paymentData.billingAddress.lastName) {
        newErrors.billingLastName = 'Last name is required'
      }
      if (!paymentData.billingAddress.address1) {
        newErrors.billingAddress1 = 'Address is required'
      }
      if (!paymentData.billingAddress.city) {
        newErrors.billingCity = 'City is required'
      }
      if (!paymentData.billingAddress.postcode) {
        newErrors.billingPostcode = 'Postcode is required'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    
    try {
      // For Stripe redirect, we don't need card details
      const finalData = {
        ...paymentData,
        method: selectedMethod
      }
      
      // If using shipping address for billing, copy it over
      if (paymentData.billingAddress.sameAsShipping && shippingAddress) {
        finalData.billingAddress = {
          ...finalData.billingAddress,
          firstName: shippingAddress.firstName,
          lastName: shippingAddress.lastName,
          address1: shippingAddress.address1,
          address2: shippingAddress.address2,
          city: shippingAddress.city,
          postcode: shippingAddress.postcode,
          country: shippingAddress.country
        }
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      onSubmit(finalData)
    } catch (error) {
      console.error('Payment submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBillingAddressChange = (field: string, value: string | boolean) => {
    setPaymentData(prev => ({
      ...prev,
      billingAddress: { ...prev.billingAddress, [field]: value }
    }))
    if (errors[`billing${field.charAt(0).toUpperCase() + field.slice(1)}`]) {
      setErrors((prev: any) => ({ 
        ...prev, 
        [`billing${field.charAt(0).toUpperCase() + field.slice(1)}`]: undefined 
      }))
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Payment Methods */}
        <Card className="border border-border/50">
          <CardHeader>
            <CardTitle className="font-display font-bold tracking-wide uppercase flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod}>
              {paymentMethods.map((method) => (
                <div key={method.id} className="relative">
                  <Label 
                    htmlFor={method.id}
                    className={`flex items-center p-4 border border-border rounded-lg cursor-pointer transition-colors ${
                      method.comingSoon 
                        ? 'opacity-60 cursor-not-allowed bg-muted/20' 
                        : 'hover:bg-muted/20'
                    }`}
                  >
                    <RadioGroupItem 
                      value={method.id} 
                      id={method.id} 
                      className="mr-4"
                      disabled={method.comingSoon}
                    />
                    
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {method.icon}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="font-medium">{method.name}</div>
                          {method.popular && !method.comingSoon && (
                            <Badge variant="secondary" className="text-xs">
                              Recommended
                            </Badge>
                          )}
                          {method.comingSoon && (
                            <Badge variant="outline" className="text-xs">
                              Coming Soon
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {method.description}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Shield className="h-4 w-4 text-green-600" />
                        <span className="text-xs text-muted-foreground">Secure</span>
                      </div>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>

            {/* Payment Method Info */}
            {selectedMethod === 'stripe-redirect' && (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium text-blue-900 mb-1">
                      Secure Payment Processing
                    </div>
                    <div className="text-blue-700">
                      You'll be redirected to Stripe's secure payment page to complete your order. 
                      Your payment information is encrypted and never stored on our servers.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Billing Address */}
        <Card className="border border-border/50">
          <CardHeader>
            <CardTitle className="font-display font-bold tracking-wide uppercase">
              Billing Address
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sameAsShipping"
                checked={paymentData.billingAddress.sameAsShipping}
                onCheckedChange={(checked) => 
                  handleBillingAddressChange('sameAsShipping', !!checked)
                }
              />
              <Label htmlFor="sameAsShipping" className="text-sm">
                Billing address is the same as shipping address
              </Label>
            </div>

            {!paymentData.billingAddress.sameAsShipping && (
              <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/20">
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="billingFirstName">
                      First Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="billingFirstName"
                      type="text"
                      placeholder="First name"
                      value={paymentData.billingAddress.firstName}
                      onChange={(e) => handleBillingAddressChange('firstName', e.target.value)}
                      className={errors.billingFirstName ? 'border-destructive' : ''}
                      required
                    />
                    {errors.billingFirstName && (
                      <p className="text-sm text-destructive">{errors.billingFirstName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="billingLastName">
                      Last Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="billingLastName"
                      type="text"
                      placeholder="Last name"
                      value={paymentData.billingAddress.lastName}
                      onChange={(e) => handleBillingAddressChange('lastName', e.target.value)}
                      className={errors.billingLastName ? 'border-destructive' : ''}
                      required
                    />
                    {errors.billingLastName && (
                      <p className="text-sm text-destructive">{errors.billingLastName}</p>
                    )}
                  </div>
                </div>

                {/* Address Fields */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="billingAddress1">
                      Address Line 1 <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="billingAddress1"
                      type="text"
                      placeholder="House number and street name"
                      value={paymentData.billingAddress.address1}
                      onChange={(e) => handleBillingAddressChange('address1', e.target.value)}
                      className={errors.billingAddress1 ? 'border-destructive' : ''}
                      required
                    />
                    {errors.billingAddress1 && (
                      <p className="text-sm text-destructive">{errors.billingAddress1}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="billingAddress2">
                      Address Line 2 <span className="text-muted-foreground text-sm">(Optional)</span>
                    </Label>
                    <Input
                      id="billingAddress2"
                      type="text"
                      placeholder="Apartment, suite, building, etc."
                      value={paymentData.billingAddress.address2}
                      onChange={(e) => handleBillingAddressChange('address2', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="billingCity">
                        Town/City <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="billingCity"
                        type="text"
                        placeholder="Town or city"
                        value={paymentData.billingAddress.city}
                        onChange={(e) => handleBillingAddressChange('city', e.target.value)}
                        className={errors.billingCity ? 'border-destructive' : ''}
                        required
                      />
                      {errors.billingCity && (
                        <p className="text-sm text-destructive">{errors.billingCity}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="billingPostcode">
                        Postcode <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="billingPostcode"
                        type="text"
                        placeholder="SW1A 1AA"
                        value={paymentData.billingAddress.postcode}
                        onChange={(e) => handleBillingAddressChange('postcode', e.target.value.toUpperCase())}
                        className={errors.billingPostcode ? 'border-destructive' : ''}
                        required
                      />
                      {errors.billingPostcode && (
                        <p className="text-sm text-destructive">{errors.billingPostcode}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Total */}
        <Card className="border border-border/50 bg-green-50/50">
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total Amount</span>
                <span>£{finalTotal.toFixed(2)}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Including £{tax.toFixed(2)} VAT and £{shippingCost === 0 ? '0.00' : shippingCost.toFixed(2)} shipping
              </div>
            </div>
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
            Back to Shipping
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || (selectedMethod !== 'stripe-redirect')}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Review Order
              </div>
            )}
          </Button>
        </div>
      </form>

      {/* Security Information */}
      <Card className="border border-border/50">
        <CardContent className="p-4">
          <div className="text-center space-y-3">
            <div className="text-sm font-medium">Your Payment is Secure</div>
            <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Shield className="h-3 w-3 text-green-600" />
                <span>SSL Encrypted</span>
              </div>
              <div className="flex items-center gap-1">
                <Lock className="h-3 w-3 text-green-600" />
                <span>PCI Compliant</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-green-600" />
                <span>Fraud Protected</span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Powered by Stripe - World's most trusted payment processor
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}