"use client"

import { Button } from '@/components/ui/button'
import { Lock } from 'lucide-react'
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

  const handleCheckout = () => {
    if (items.length === 0) return
    window.location.href = '/checkout'
  }

  const handleExpressCheckout = () => {
    if (items.length === 0) return
    window.location.href = '/checkout/express'
  }

  const isDisabled = items.length === 0 || totalPrice < 0.5

  // Calculate totals for display
  const subtotal = totalPrice
  const shipping = subtotal >= 50 ? 0 : 4.99
  const tax = Math.round((subtotal + shipping) * 0.2 * 100) / 100
  const total = subtotal + shipping + tax

  return (
    <div className="space-y-3">
      {/* EXPRESS CHECKOUT BUTTON - FEATURED */}
      <Button
        onClick={handleExpressCheckout}
        disabled={isDisabled}
        size={size}
        className={cn(
          "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold tracking-wide h-12 transition-all transform hover:scale-105",
          fullWidth && "w-full",
          className
        )}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">⚡</span>
          <span>
            EXPRESS CHECKOUT • {formatPrice(total)}
          </span>
        </div>
      </Button>

      {/* Standard Checkout Button */}
      <Button
        onClick={handleCheckout}
        disabled={isDisabled}
        size="default"
        variant="outline"
        className={cn(
          "border-green-600 text-green-600 hover:bg-green-50 font-semibold tracking-wide h-10",
          fullWidth && "w-full"
        )}
      >
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4" />
          <span>
            Standard Checkout
          </span>
        </div>
      </Button>

      {/* Quick Info */}
      <div className="text-center space-y-1">
        {shipping === 0 && subtotal >= 50 && (
          <p className="text-sm text-green-600 font-medium">
            🚚 Free shipping applied!
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          ⚡ Express: Apple Pay, Google Pay, Link • Standard: All cards accepted
        </p>
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