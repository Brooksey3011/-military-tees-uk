"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/hooks/use-cart"
import { formatPrice } from "@/lib/utils"

interface MiniCartProps {
  isOpen: boolean
  onClose: () => void
  className?: string
}

export function MiniCart({ isOpen, onClose, className }: MiniCartProps) {
  const { items, totalItems, totalPrice, openCart } = useCart()
  const cartRef = React.useRef<HTMLDivElement>(null)

  // Close on click outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  const handleViewCart = () => {
    onClose()
    openCart()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={cartRef}
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={`absolute right-0 top-full mt-2 w-80 bg-background border rounded-lg shadow-lg z-50 ${className}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              <span className="font-medium text-sm">Cart Preview</span>
              {totalItems > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {totalItems}
                </Badge>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="max-h-64 overflow-y-auto">
            {items.length === 0 ? (
              <div className="p-6 text-center">
                <div className="text-4xl mb-2">🛒</div>
                <p className="text-sm text-muted-foreground">
                  Your cart is empty
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                <AnimatePresence>
                  {items.slice(0, 3).map((item: any) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="flex items-center gap-3"
                    >
                      {/* Product Image */}
                      <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded border">
                        <Image
                          src={item.variant.image_urls?.[0] || item.product.main_image_url || "/placeholder-tshirt.jpg"}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <Link 
                          href={`/products/${item.product.slug}`}
                          className="text-sm font-medium hover:text-primary transition-colors truncate block"
                          onClick={onClose}
                        >
                          {item.product.name}
                        </Link>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-2">
                            {item.variant.size && (
                              <span>{item.variant.size}</span>
                            )}
                            {item.variant.color && (
                              <div className="flex items-center gap-1">
                                <div
                                  className="h-2 w-2 rounded-full border"
                                  style={{ backgroundColor: item.variant.color.toLowerCase() }}
                                />
                                <span>{item.variant.color}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <span>x{item.quantity}</span>
                            <span className="font-medium">
                              {formatPrice(item.product.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {items.length > 3 && (
                  <div className="text-center text-xs text-muted-foreground py-2">
                    +{items.length - 3} more items
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t p-4 space-y-3">
              {/* Total */}
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleViewCart}
                  className="text-xs"
                >
                  View Cart
                </Button>
                
                <Button 
                  variant="military" 
                  size="sm"
                  onClick={onClose}
                  className="text-xs"
                >
                  Checkout
                </Button>
              </div>

              <div className="text-center text-xs text-muted-foreground">
                Free delivery on orders over £50
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}