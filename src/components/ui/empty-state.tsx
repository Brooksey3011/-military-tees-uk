"use client"

import * as React from "react"
import { ShoppingCart, Search, Package, AlertTriangle, FileX, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface EmptyStateProps {
  variant: "cart" | "search" | "products" | "orders" | "customers" | "general"
  title?: string
  description?: string
  actionText?: string
  onAction?: () => void
  className?: string
  children?: React.ReactNode
}

const emptyStateConfigs = {
  cart: {
    icon: ShoppingCart,
    title: "Your Cart is Empty",
    description: "Add some products to your cart to get started. Browse our military-themed collection.",
    actionText: "Continue Shopping"
  },
  search: {
    icon: Search,
    title: "No Results Found",
    description: "We couldn't find any products matching your search. Try different keywords or check the spelling.",
    actionText: "Clear Search"
  },
  products: {
    icon: Package,
    title: "No Products Available",
    description: "There are currently no products in this category. Check back later or browse other sections.",
    actionText: "Browse All Products"
  },
  orders: {
    icon: FileX,
    title: "No Orders Found",
    description: "You haven't placed any orders yet. Start shopping to see your order history here.",
    actionText: "Start Shopping"
  },
  customers: {
    icon: Users,
    title: "No Customers Found",
    description: "No customers match the current filter criteria. Try adjusting your search or filters.",
    actionText: "Reset Filters"
  },
  general: {
    icon: AlertTriangle,
    title: "Nothing to Show",
    description: "There's nothing here right now.",
    actionText: "Go Back"
  }
}

export function EmptyState({
  variant,
  title,
  description,
  actionText,
  onAction,
  className,
  children
}: EmptyStateProps) {
  const config = emptyStateConfigs[variant]
  const IconComponent = config.icon

  const finalTitle = title || config.title
  const finalDescription = description || config.description
  const finalActionText = actionText || config.actionText

  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center p-8 min-h-[400px]",
      "border-2 border-dashed border-muted-foreground/30",
      "bg-muted/10", // Very subtle background
      className
    )}>
      {/* Military-style icon with sharp styling */}
      <div className={cn(
        "mb-6 p-4",
        "border-2 border-muted-foreground/20",
        "bg-background",
        "rounded-none", // Sharp edges per design mandate
      )}>
        <IconComponent className="h-12 w-12 text-muted-foreground" />
      </div>

      {/* Content */}
      <div className="max-w-md space-y-4">
        <h3 className={cn(
          "text-xl font-display font-bold text-foreground",
          "tracking-wide uppercase" // Military stencil feel
        )}>
          {finalTitle}
        </h3>
        
        <p className="text-muted-foreground leading-relaxed text-sm">
          {finalDescription}
        </p>

        {/* Custom children content */}
        {children}

        {/* Action button */}
        {onAction && (
          <div className="pt-4">
            <Button
              variant="military"
              size="lg"
              onClick={onAction}
              className={cn(
                "font-medium tracking-wide",
                "rounded-none", // Sharp military styling
                "border-2"
              )}
            >
              {finalActionText}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// Specialized empty state components for common use cases

export function EmptyCart({ onContinueShopping }: { onContinueShopping?: () => void }) {
  return (
    <EmptyState
      variant="cart"
      onAction={onContinueShopping}
    >
      <div className="text-xs text-muted-foreground mt-2 space-y-1">
        <p>• Browse our military-themed collection</p>
        <p>• Free UK delivery on orders over £50</p>
        <p>• Secure checkout with Stripe</p>
      </div>
    </EmptyState>
  )
}

export function EmptySearchResults({ 
  query, 
  onClearSearch 
}: { 
  query?: string
  onClearSearch?: () => void 
}) {
  return (
    <EmptyState
      variant="search"
      title={query ? `No results for "${query}"` : "No Results Found"}
      onAction={onClearSearch}
    >
      <div className="text-xs text-muted-foreground mt-2 space-y-1">
        <p>• Try different keywords</p>
        <p>• Check your spelling</p>
        <p>• Use more general terms</p>
        <p>• Browse categories instead</p>
      </div>
    </EmptyState>
  )
}

export function EmptyProductGrid({ 
  category,
  onBrowseAll 
}: { 
  category?: string
  onBrowseAll?: () => void 
}) {
  return (
    <EmptyState
      variant="products"
      title={category ? `No Products in ${category}` : "No Products Available"}
      description={category 
        ? `There are currently no products in the ${category} category. Check back later or browse other sections.`
        : "There are currently no products available. Check back later."
      }
      onAction={onBrowseAll}
    >
      <div className="text-xs text-muted-foreground mt-2 space-y-1">
        <p>• Products are added regularly</p>
        <p>• Check other categories</p>
        <p>• Sign up for notifications</p>
      </div>
      
      {/* Add static link fallback when no onAction provided */}
      {!onBrowseAll && (
        <div className="pt-4">
          <Button
            variant="outline"
            size="lg"
            asChild
            className={cn(
              "font-medium tracking-wide",
              "rounded-none border-2"
            )}
          >
            <Link href="/categories">Browse All Categories</Link>
          </Button>
        </div>
      )}
    </EmptyState>
  )
}

export function EmptyOrderHistory({ onStartShopping }: { onStartShopping?: () => void }) {
  return (
    <EmptyState
      variant="orders"
      onAction={onStartShopping}
    >
      <div className="text-xs text-muted-foreground mt-2 space-y-1">
        <p>• Secure checkout process</p>
        <p>• Order tracking available</p>
        <p>• Easy returns policy</p>
      </div>
    </EmptyState>
  )
}

// Admin-specific empty states
export function EmptyCustomerList({ onResetFilters }: { onResetFilters?: () => void }) {
  return (
    <EmptyState
      variant="customers"
      onAction={onResetFilters}
      className="min-h-[300px]" // Smaller for admin panels
    />
  )
}

export function EmptyAdminOrders({ 
  onViewAllOrders 
}: { 
  onViewAllOrders?: () => void 
}) {
  return (
    <EmptyState
      variant="general"
      title="No Orders to Display"
      description="No orders match the current filters. Try adjusting your search criteria or date range."
      actionText="View All Orders"
      onAction={onViewAllOrders}
      className="min-h-[300px]"
    />
  )
}