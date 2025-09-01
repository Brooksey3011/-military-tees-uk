"use client"

import * as React from "react"
import { Layout } from "@/components/layout/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSimpleCart } from "@/hooks/use-simple-cart"
import { CheckoutButton } from "@/components/cart/checkout-button"
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag,
  ArrowRight,
  Truck
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

// Force dynamic rendering for this cart-dependent page
export const dynamic = 'force-dynamic'

export default function CartPage() {
  const { items, totalItems, totalPrice, updateQuantity, removeItem } = useSimpleCart()

  // No shipping or VAT calculations in cart - handled by Stripe at checkout

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-muted/10 to-background">
        
        {/* Header */}
        <section className="py-8 border-b border-border/50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-display font-bold tracking-wider uppercase">
                  Shopping Cart
                </h1>
                <p className="text-muted-foreground mt-1">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
                </p>
              </div>
              <Link href="/categories">
                <Button variant="outline" className="rounded-none">
                  Continue Shopping
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          {items.length === 0 ? (
            // Empty cart
            <div className="text-center py-16">
              <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
              <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
              <p className="text-muted-foreground mb-8">
                Looks like you haven't added any items to your cart yet.
              </p>
              <Link href="/categories">
                <Button className="rounded-none">
                  Start Shopping
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          ) : (
            // Cart with items
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <Card key={item.id} className="border border-border/50">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        {/* Product Image */}
                        <div className="w-20 h-20 bg-muted border border-border/50 rounded-md overflow-hidden flex-shrink-0">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              width={80}
                              height={80}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                              IMG
                            </div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{item.name}</h3>
                          {(item.size || item.color) && (
                            <p className="text-sm text-muted-foreground">
                              {item.size && `Size: ${item.size}`} 
                              {item.size && item.color && ' | '} 
                              {item.color && `Color: ${item.color}`}
                            </p>
                          )}
                          <p className="text-lg font-bold mt-2">
                            £{item.price.toFixed(2)}
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                            className="rounded-none w-8 h-8 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-12 text-center font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, Math.min(item.maxQuantity, item.quantity + 1))}
                            className="rounded-none w-8 h-8 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Item Total */}
                        <div className="text-right">
                          <p className="font-bold text-lg">
                            £{(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>

                        {/* Remove Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="rounded-none text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Order Summary */}
              <div className="space-y-6">
                <Card className="border border-border/50 sticky top-6">
                  <CardHeader>
                    <CardTitle className="font-display font-bold tracking-wide uppercase">
                      Order Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Subtotal ({totalItems} items)</span>
                      <span>£{totalPrice.toFixed(2)}</span>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded-md">
                      <div className="text-blue-800 text-sm">
                        <p className="font-medium mb-1">Shipping & taxes calculated at checkout</p>
                        <p className="text-xs">🚛 Free UK shipping on orders over £50</p>
                      </div>
                    </div>

                    <div className="pt-4">
                      <CheckoutButton fullWidth />
                    </div>
                  </CardContent>
                </Card>

                {/* Security Info */}
                <Card className="border border-border/50">
                  <CardContent className="p-4 text-center">
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>🔒 Secure SSL Checkout</p>
                      <p>💳 PCI Compliant Payments</p>
                      <p>🚛 Free UK Shipping Over £50</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}