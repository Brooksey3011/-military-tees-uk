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
    <div className="space-y-2">
      <Button
        onClick={handleCheckout}
        disabled={isDisabled}
        variant={variant}
        size={size}
        className={cn(
          "relative transition-all duration-200",
          fullWidth && "w-full",
          className
        )}
      >
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          <span className="font-medium">
            Checkout - {formatPrice(totalPrice)}
          </span>
        </div>
      </Button>

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