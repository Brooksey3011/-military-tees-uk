"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ReviewForm } from "./review-form"
import { useAuth } from "@/hooks/use-auth"
import { Star, ShoppingBag, LogIn } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface AuthenticatedReviewSectionProps {
  productId: string
  productName: string
  className?: string
}

export function AuthenticatedReviewSection({
  productId,
  productName,
  className
}: AuthenticatedReviewSectionProps) {
  const { user, isLoading } = useAuth()
  const [showReviewForm, setShowReviewForm] = React.useState(false)
  const [hasPurchased, setHasPurchased] = React.useState(false)
  const [purchaseData, setPurchaseData] = React.useState<{ orderId: string; customerId: string } | null>(null)
  const [isCheckingPurchase, setIsCheckingPurchase] = React.useState(false)

  // Check if user has purchased this product
  React.useEffect(() => {
    const checkPurchaseHistory = async () => {
      if (!user || !productId) return

      setIsCheckingPurchase(true)
      try {
        const response = await fetch(`/api/orders/check-purchase?product_id=${productId}&customer_id=${user.id}`)
        const result = await response.json()
        
        if (result.success && result.hasPurchased) {
          setHasPurchased(true)
          setPurchaseData({
            orderId: result.orderId,
            customerId: user.id
          })
        }
      } catch (error) {
        console.error('Error checking purchase history:', error)
      } finally {
        setIsCheckingPurchase(false)
      }
    }

    checkPurchaseHistory()
  }, [user, productId])

  if (isLoading || isCheckingPurchase) {
    return (
      <Card className={cn("", className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (showReviewForm && user && hasPurchased && purchaseData) {
    return (
      <div className={className}>
        <ReviewForm
          productId={productId}
          customerId={purchaseData.customerId}
          productName={productName}
          orderId={purchaseData.orderId}
          onSubmit={() => {
            setShowReviewForm(false)
            // Optionally refresh reviews or show success message
          }}
          onCancel={() => setShowReviewForm(false)}
        />
      </div>
    )
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="font-display tracking-wide uppercase flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" />
          Customer Reviews
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!user ? (
          // Not logged in
          <div className="text-center p-6 border border-border/50 rounded-none">
            <LogIn className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-medium mb-2">Sign In to Leave a Review</h3>
            <p className="text-sm text-muted-foreground mb-4">
              You need to be logged in to share your experience with this product.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button asChild className="rounded-none">
                <Link href="/auth/login">
                  Sign In
                </Link>
              </Button>
              <Button variant="outline" asChild className="rounded-none border-2">
                <Link href="/auth/signup">
                  Create Account
                </Link>
              </Button>
            </div>
          </div>
        ) : !hasPurchased ? (
          // Logged in but hasn't purchased
          <div className="text-center p-6 border border-border/50 rounded-none">
            <ShoppingBag className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-medium mb-2">Purchase Required to Review</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Only verified purchasers can leave reviews for this product. This helps ensure authentic feedback.
            </p>
            <Button asChild className="rounded-none">
              <Link href={`/products/${productId}`}>
                Purchase This Product
              </Link>
            </Button>
          </div>
        ) : (
          // Logged in and has purchased - can leave review
          <div className="text-center p-6 border border-border/50 rounded-none bg-primary/5">
            <Star className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-medium mb-2">Share Your Experience</h3>
            <p className="text-sm text-muted-foreground mb-4">
              You've purchased this product. Help other customers by sharing your experience.
            </p>
            <Button 
              onClick={() => setShowReviewForm(true)}
              className="rounded-none font-display font-bold tracking-wide uppercase"
            >
              Leave Review
            </Button>
          </div>
        )}

        {/* Placeholder for existing reviews display */}
        <div className="border-t border-border/50 pt-4">
          <p className="text-sm text-muted-foreground text-center">
            No reviews yet. Be the first to review this product!
          </p>
        </div>
      </CardContent>
    </Card>
  )
}