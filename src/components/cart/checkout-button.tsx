"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Shield, Loader2 } from 'lucide-react'
import { useSimpleCart } from '@/hooks/use-simple-cart'
import { formatPrice } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface CheckoutButtonProps {
  variant?: 'default' | 'military' | 'outline'
  size?: 'default' | 'sm' | 'lg'
  className?: string
  fullWidth?: boolean
  customerEmail?: string
}

export function CheckoutButton({
  variant = 'military',
  size = 'lg',
  className,
  fullWidth = true,
  customerEmail
}: CheckoutButtonProps) {
  const { items, totalPrice } = useSimpleCart()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Calculate totals for display (NO VAT - not VAT registered)
  const subtotal = totalPrice
  const shipping = subtotal >= 50 ? 0 : 4.99
  const total = subtotal + shipping

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

  return (
    <div className="space-y-3">
      {/* SINGLE DIRECT CHECKOUT BUTTON */}
      <Button
        onClick={handleDirectCheckout}
        disabled={isDisabled}
        size={size}
        className={cn(
          "bg-gradient-to-r from-green-700 to-green-800 hover:from-green-800 hover:to-green-900 text-white font-bold tracking-wide transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg",
          size === 'lg' && "h-12",
          size === 'default' && "h-10",
          size === 'sm' && "h-8",
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

      {/* Error states */}
      {items.length === 0 && (
        <p className="text-xs text-muted-foreground text-center">
          Add items to cart to checkout
        </p>
      )}

      {totalPrice > 0 && totalPrice < 0.5 && (
        <p className="text-xs text-muted-foreground text-center">
          Minimum order value: £0.50
        </p>
      )}
    </div>
  )
}