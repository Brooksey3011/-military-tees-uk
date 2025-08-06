"use client"

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Layout } from '@/components/layout/layout'
import { clearInvalidCartItems } from '@/hooks/use-cart-cleanup'
import { ShoppingCart, Trash2, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function ClearCartPage() {
  useEffect(() => {
    // Automatically clear cart on page load
    clearInvalidCartItems()
  }, [])

  const handleClearCart = () => {
    clearInvalidCartItems()
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <CardTitle className="text-xl">Cart Cleared Successfully</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              Your cart has been cleared of any invalid items. You can now start fresh with our current products.
            </p>
            
            <div className="space-y-2">
              <Link href="/categories">
                <Button className="w-full">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Start Shopping
                </Button>
              </Link>
              
              <Button 
                onClick={handleClearCart}
                variant="outline"
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Cart Again
              </Button>
              
              <Link href="/">
                <Button variant="ghost" className="w-full">
                  Go to Homepage
                </Button>
              </Link>
            </div>

            <div className="text-xs text-muted-foreground mt-4 p-3 bg-muted rounded">
              <p><strong>Note:</strong> Since this is a test environment, the product database may be empty. This tool helps clear any cached cart items that reference non-existent products.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}