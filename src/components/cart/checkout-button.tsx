"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ShoppingCart, CreditCard, Loader2 } from 'lucide-react'
import { useCartItems, useCartTotal, useCartActions } from '@/store/cart-minimal'
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
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const items = useCartItems()
  const { totalPrice } = useCartTotal()
  const { clearCart } = useCartActions()

  const handleCheckout = async () => {
    if (items.length === 0) return

    setIsLoading(true)
    setError('')

    try {
      // Prepare checkout data
      const checkoutData = {
        items: items.map(item => ({
          id: item.id,
          productId: item.productId,
          variantId: item.variantId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          size: item.size,
          color: item.color
        })),
        customerEmail,
        successUrl: `${window.location.origin}/checkout/success`,
        cancelUrl: `${window.location.origin}/cart`
      }

      // Create checkout session
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(checkoutData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        // Clear cart before redirecting (optional - could wait for success)
        // clearCart()
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received')
      }

    } catch (err) {
      console.error('Checkout error:', err)
      setError(err instanceof Error ? err.message : 'Failed to start checkout')
    } finally {
      setIsLoading(false)
    }
  }

  const isDisabled = items.length === 0 || isLoading || totalPrice < 0.5

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
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Processing...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="font-medium">
              Checkout - {formatPrice(totalPrice)}
            </span>
          </div>
        )}
      </Button>

      {error && (
        <p className="text-sm text-destructive text-center">
          {error}
        </p>
      )}

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