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
    window.location.href = '/checkout/professional'
  }

  const isDisabled = items.length === 0 || totalPrice < 0.5

  // Calculate totals for display
  const subtotal = totalPrice
  const shipping = subtotal >= 50 ? 0 : 4.99
  const tax = Math.round((subtotal + shipping) * 0.2 * 100) / 100
  const total = subtotal + shipping + tax

  return (
    <div className="space-y-4">
      {/* Single Checkout Button */}
      <Button
        onClick={handleCheckout}
        disabled={isDisabled}
        size={size}
        className={cn(
          "bg-green-600 hover:bg-green-700 text-white font-semibold tracking-wide uppercase h-12",
          fullWidth && "w-full",
          className
        )}
      >
        <div className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          <span>
            Secure Checkout • {formatPrice(total)}
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
          Secure payment by Stripe • All payment methods accepted
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