"use client"

import { Button } from '@/components/ui/button'
import { CreditCard } from 'lucide-react'
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
  size = 'default',
  className,
  fullWidth = false,
  customerEmail
}: CheckoutButtonProps) {
  const { items, totalPrice } = useSimpleCart()

  const handleCheckout = () => {
    if (items.length === 0) return

    // Redirect to express checkout page for better UX
    window.location.href = '/checkout/express'
  }

  const isDisabled = items.length === 0 || totalPrice < 0.5

  return (
    <div className="space-y-3">
      {/* Enhanced Checkout Button */}
      <Button
        onClick={() => window.location.href = '/checkout/enhanced'}
        disabled={isDisabled}
        variant={variant}
        size="lg"
        className={cn(
          "relative transition-all duration-200 bg-green-700 hover:bg-green-800 border-0",
          fullWidth && "w-full",
          className
        )}
      >
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          <span className="font-semibold font-display tracking-wide uppercase">
            ✨ Enhanced Checkout - {formatPrice(totalPrice)}
          </span>
        </div>
      </Button>

      {/* Alternative Checkout Options */}
      <div className="flex gap-2">
        <Button
          onClick={handleCheckout}
          disabled={isDisabled}
          variant="outline"
          size="sm"
          className={cn(
            "flex-1 rounded-none border-2",
            "text-xs font-medium"
          )}
        >
          Express Checkout
        </Button>
        <Button
          onClick={() => window.location.href = '/checkout'}
          disabled={isDisabled}
          variant="outline"
          size="sm"
          className={cn(
            "flex-1 rounded-none border-2",
            "text-xs font-medium"
          )}
        >
          Standard Checkout
        </Button>
      </div>

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