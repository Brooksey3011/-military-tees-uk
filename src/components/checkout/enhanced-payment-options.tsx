'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CreditCard, Smartphone, Shield, Zap, CheckCircle } from 'lucide-react'

interface PaymentMethod {
  id: string
  name: string
  icon: React.ReactNode
  description: string
  badge?: string
  available: boolean
}

interface EnhancedPaymentOptionsProps {
  onPaymentMethodSelect: (method: string) => void
  selectedMethod?: string
  showExpressOptions?: boolean
}

export function EnhancedPaymentOptions({ 
  onPaymentMethodSelect, 
  selectedMethod,
  showExpressOptions = true 
}: EnhancedPaymentOptionsProps) {
  const [hoveredMethod, setHoveredMethod] = useState<string | null>(null)

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'stripe',
      name: 'Credit/Debit Card',
      icon: <CreditCard className="h-6 w-6" />,
      description: 'Visa, Mastercard, American Express',
      badge: 'Most Popular',
      available: true
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.429v.001c-.644 3.249-2.201 5.158-4.656 5.158h-2.218a.641.641 0 0 0-.633.74l-.529 3.35-.01.048-.239 1.514z"/>
        </svg>
      ),
      description: 'Pay with your PayPal account',
      badge: 'Secure',
      available: true
    },
    {
      id: 'apple_pay',
      name: 'Apple Pay',
      icon: <Smartphone className="h-6 w-6" />,
      description: 'Touch ID or Face ID',
      badge: 'Express',
      available: true
    },
    {
      id: 'google_pay',
      name: 'Google Pay',
      icon: (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574S8.145 4.426 12.24 4.426c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12.24 5.605-12.24 12.24S5.605 24.48 12.24 24.48c7.074 0 11.766-4.97 11.766-11.976 0-.804-.087-1.415-.195-2.026z"/>
        </svg>
      ),
      description: 'Pay with Google',
      badge: 'Fast',
      available: true
    }
  ]

  const expressPaymentMethods = paymentMethods.filter(method => 
    ['apple_pay', 'google_pay', 'paypal'].includes(method.id)
  )

  return (
    <div className="space-y-6">
      {/* Express Payment Options */}
      {showExpressOptions && (
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Express Checkout
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {expressPaymentMethods.map((method) => (
                <Button
                  key={method.id}
                  variant={selectedMethod === method.id ? "default" : "outline"}
                  className="h-16 flex flex-col items-center gap-1 p-3 relative group"
                  onClick={() => onPaymentMethodSelect(method.id)}
                  onMouseEnter={() => setHoveredMethod(method.id)}
                  onMouseLeave={() => setHoveredMethod(null)}
                  disabled={!method.available}
                >
                  <div className="flex items-center gap-2">
                    {method.icon}
                    <span className="font-semibold text-sm">{method.name}</span>
                  </div>
                  {method.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {method.badge}
                    </Badge>
                  )}
                  
                  {selectedMethod === method.id && (
                    <CheckCircle className="absolute -top-2 -right-2 h-5 w-5 text-primary bg-white rounded-full" />
                  )}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">or pay with</span>
        </div>
      </div>

      {/* Standard Payment Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Secure Payment Methods
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {paymentMethods.filter(method => method.id === 'stripe').map((method) => (
              <div
                key={method.id}
                className={`
                  border rounded-lg p-4 cursor-pointer transition-all duration-200
                  ${selectedMethod === method.id 
                    ? 'border-primary bg-primary/5 shadow-md' 
                    : 'border-border hover:border-primary/50 hover:bg-muted/30'
                  }
                  ${hoveredMethod === method.id ? 'scale-[1.02]' : ''}
                `}
                onClick={() => onPaymentMethodSelect(method.id)}
                onMouseEnter={() => setHoveredMethod(method.id)}
                onMouseLeave={() => setHoveredMethod(null)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`
                      p-2 rounded-full 
                      ${selectedMethod === method.id ? 'bg-primary text-white' : 'bg-muted'}
                    `}>
                      {method.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold">{method.name}</h3>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {method.badge && (
                      <Badge variant={selectedMethod === method.id ? "default" : "outline"}>
                        {method.badge}
                      </Badge>
                    )}
                    {selectedMethod === method.id && (
                      <CheckCircle className="h-6 w-6 text-primary" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Badges */}
      <div className="flex items-center justify-center gap-6 py-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4" />
          SSL Encrypted
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle className="h-4 w-4" />
          PCI Compliant
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4" />
          Secure Checkout
        </div>
      </div>
    </div>
  )
}

// Express Payment Button Component
interface ExpressPaymentButtonProps {
  method: 'apple_pay' | 'google_pay' | 'paypal'
  onClick: () => void
  disabled?: boolean
  loading?: boolean
}

export function ExpressPaymentButton({ method, onClick, disabled, loading }: ExpressPaymentButtonProps) {
  const buttonConfig = {
    apple_pay: {
      text: 'Buy with Apple Pay',
      icon: <Smartphone className="h-5 w-5" />,
      className: 'bg-black hover:bg-gray-800 text-white'
    },
    google_pay: {
      text: 'Buy with Google Pay',
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574S8.145 4.426 12.24 4.426c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12.24 5.605-12.24 12.24S5.605 24.48 12.24 24.48c7.074 0 11.766-4.97 11.766-11.976 0-.804-.087-1.415-.195-2.026z"/>
        </svg>
      ),
      className: 'bg-blue-600 hover:bg-blue-700 text-white'
    },
    paypal: {
      text: 'Buy with PayPal',
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.429v.001c-.644 3.249-2.201 5.158-4.656 5.158h-2.218a.641.641 0 0 0-.633.74l-.529 3.35-.01.048-.239 1.514z"/>
        </svg>
      ),
      className: 'bg-blue-500 hover:bg-blue-600 text-white'
    }
  }

  const config = buttonConfig[method]

  return (
    <Button
      className={`w-full h-12 ${config.className}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
      ) : (
        <>
          {config.icon}
          <span className="ml-2 font-semibold">{config.text}</span>
        </>
      )}
    </Button>
  )
}