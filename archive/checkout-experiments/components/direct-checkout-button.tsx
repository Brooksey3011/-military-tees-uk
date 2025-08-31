"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Shield, CreditCard } from 'lucide-react'
import { useSimpleCart } from '@/hooks/use-simple-cart'
import { formatPrice } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface DirectCheckoutButtonProps {
  size?: 'default' | 'sm' | 'lg'
  className?: string
  fullWidth?: boolean
  customerEmail?: string
  variant?: 'default' | 'military' | 'premium'
}

export function DirectCheckoutButton({
  size = 'lg',
  className,
  fullWidth = true,
  customerEmail,
  variant = 'military'
}: DirectCheckoutButtonProps) {
  const { items, totalPrice } = useSimpleCart()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Calculate totals
  const subtotal = totalPrice
  const shipping = subtotal >= 50 ? 0 : 4.99
  const tax = Math.round((subtotal + shipping) * 0.2 * 100) / 100
  const total = subtotal + shipping + tax

  const isDisabled = items.length === 0 || totalPrice < 0.5 || isLoading

  const handleDirectCheckout = async () => {
    if (isDisabled) return

    setIsLoading(true)
    setError(null)

    try {
      // Convert cart items to API format
      const checkoutItems = items.map(item => ({
        variantId: item.variantId,
        quantity: item.quantity
      }))

      // Call direct checkout API
      const response = await fetch('/api/direct-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: checkoutItems,
          ...(customerEmail && { customerEmail })
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Checkout failed')
      }

      // Immediate redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received')
      }

    } catch (error) {
      console.error('Checkout error:', error)
      setError(error instanceof Error ? error.message : 'Checkout failed')
      setIsLoading(false)
    }
  }

  // Variant styles
  const variantStyles = {
    default: "bg-blue-600 hover:bg-blue-700 text-white",
    military: "bg-gradient-to-r from-green-700 to-green-800 hover:from-green-800 hover:to-green-900 text-white shadow-lg",
    premium: "bg-gradient-to-r from-black to-gray-900 hover:from-gray-900 hover:to-black text-white border border-gray-600"
  }

  return (
    <div className="space-y-3">
      {/* MAIN CHECKOUT BUTTON */}
      <Button
        onClick={handleDirectCheckout}
        disabled={isDisabled}
        size={size}
        className={cn(
          "font-bold tracking-wide transition-all transform hover:scale-[1.02] active:scale-[0.98]",
          variantStyles[variant],
          size === 'lg' && "h-12 text-base",
          size === 'default' && "h-10 text-sm",
          size === 'sm' && "h-8 text-xs",
          fullWidth && "w-full",
          isLoading && "cursor-not-allowed opacity-75",
          className
        )}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Redirecting to Checkout...</span>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Secure Checkout</span>
            </div>
            <span className="font-bold">
              {formatPrice(total)}
            </span>
          </div>
        )}
      </Button>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <CreditCard className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium text-red-800">Checkout Error</span>
          </div>
          <p className="text-sm text-red-700">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={handleDirectCheckout}
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Quick Info */}
      <div className="text-center space-y-1">
        {shipping === 0 && subtotal >= 50 && (
          <div className="flex items-center justify-center gap-1 text-green-700">
            <span className="text-sm">🚚</span>
            <span className="text-sm font-medium">Free shipping applied!</span>
          </div>
        )}
        
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex items-center justify-center gap-2">
            <Shield className="h-3 w-3" />
            <span>SSL Encrypted • PCI Compliant</span>
          </div>
          <p>All major cards accepted • Powered by Stripe</p>
        </div>
      </div>

      {/* Status Messages */}
      {items.length === 0 && (
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Add items to cart to checkout
          </p>
        </div>
      )}

      {totalPrice > 0 && totalPrice < 0.5 && (
        <div className="text-center p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            Minimum order value: £0.50
          </p>
        </div>
      )}
    </div>
  )
}

// Simplified version for inline use
export function SimpleCheckoutButton({ 
  className,
  children = "Checkout"
}: {
  className?: string
  children?: React.ReactNode
}) {
  return (
    <DirectCheckoutButton
      size="default"
      variant="military"
      className={className}
      fullWidth={false}
    />
  )
}