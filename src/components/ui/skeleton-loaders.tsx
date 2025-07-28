"use client"

import * as React from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface SkeletonLoaderProps {
  className?: string
}

// Product Card Skeleton - matches ProductCard layout
export function ProductCardSkeleton({ className }: SkeletonLoaderProps) {
  return (
    <div className={cn(
      "bg-card border-2 border-border p-0", // Sharp military styling
      "rounded-none", // No rounded corners per design mandate
      className
    )}>
      {/* Product Image */}
      <div className="relative aspect-square">
        <Skeleton className="absolute inset-0 rounded-none" />
        {/* Quick View Button */}
        <div className="absolute bottom-2 right-2">
          <Skeleton className="h-8 w-20 rounded-none" />
        </div>
      </div>
      
      {/* Product Info */}
      <div className="p-4 space-y-3">
        {/* Product Name */}
        <Skeleton className="h-5 w-3/4 rounded-none" />
        
        {/* Price */}
        <Skeleton className="h-6 w-1/3 rounded-none" />
        
        {/* Category Badge */}
        <Skeleton className="h-4 w-1/2 rounded-none" />
        
        {/* Add to Cart Button */}
        <div className="pt-2">
          <Skeleton className="h-10 w-full rounded-none" />
        </div>
      </div>
    </div>
  )
}

// Product Grid Skeleton - shows multiple product cards
export function ProductGridSkeleton({ 
  count = 8,
  className 
}: SkeletonLoaderProps & { count?: number }) {
  return (
    <div className={cn(
      "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
      className
    )}>
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  )
}

// Product Page Skeleton - for individual product pages
export function ProductPageSkeleton({ className }: SkeletonLoaderProps) {
  return (
    <div className={cn("container mx-auto px-4 py-8", className)}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <Skeleton className="aspect-square w-full rounded-none" />
          
          {/* Thumbnail Images */}
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="aspect-square rounded-none" />
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          {/* Title and Price */}
          <div className="space-y-3">
            <Skeleton className="h-8 w-3/4 rounded-none" />
            <Skeleton className="h-6 w-1/3 rounded-none" />
            <Skeleton className="h-4 w-1/2 rounded-none" />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full rounded-none" />
            <Skeleton className="h-4 w-5/6 rounded-none" />
            <Skeleton className="h-4 w-4/5 rounded-none" />
          </div>

          {/* Variants */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16 rounded-none" />
              <div className="flex gap-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-10 w-16 rounded-none" />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16 rounded-none" />
              <div className="flex gap-2">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-8 w-8 rounded-full" />
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Skeleton className="h-12 w-full rounded-none" />
            <Skeleton className="h-10 w-full rounded-none" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Cart Item Skeleton - for cart drawer
export function CartItemSkeleton({ className }: SkeletonLoaderProps) {
  return (
    <div className={cn(
      "flex items-center gap-3 p-4 border-b border-border/50",
      className
    )}>
      {/* Product Image */}
      <Skeleton className="h-16 w-16 rounded-none" />
      
      {/* Product Details */}
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4 rounded-none" />
        <Skeleton className="h-3 w-1/2 rounded-none" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-16 rounded-none" />
          <Skeleton className="h-6 w-20 rounded-none" />
        </div>
      </div>
    </div>
  )
}

// Cart Summary Skeleton
export function CartSummarySkeleton({ className }: SkeletonLoaderProps) {
  return (
    <div className={cn(
      "bg-card border-2 border-border p-4", // Military styling
      "rounded-none",
      className
    )}>
      <div className="space-y-4">
        {/* Title */}
        <Skeleton className="h-5 w-24 rounded-none" />
        
        {/* Items */}
        <div className="space-y-3">
          <CartItemSkeleton />
          <CartItemSkeleton />
          <CartItemSkeleton />
        </div>
        
        {/* Total */}
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-16 rounded-none" />
            <Skeleton className="h-4 w-20 rounded-none" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-5 w-20 rounded-none" />
            <Skeleton className="h-5 w-24 rounded-none" />
          </div>
        </div>
        
        {/* Checkout Button */}
        <Skeleton className="h-12 w-full rounded-none" />
      </div>
    </div>
  )
}

// Search Results Skeleton
export function SearchResultsSkeleton({ 
  count = 5,
  className 
}: SkeletonLoaderProps & { count?: number }) {
  return (
    <div className={cn("space-y-3 p-2", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div 
          key={index}
          className="flex items-center gap-3 p-3 border-b border-border/50 last:border-b-0"
        >
          <Skeleton className="h-10 w-10 rounded-none" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4 rounded-none" />
            <Skeleton className="h-3 w-1/2 rounded-none" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Admin Table Skeleton - for admin dashboard tables
export function AdminTableSkeleton({ 
  rows = 5,
  columns = 4,
  className 
}: SkeletonLoaderProps & { rows?: number; columns?: number }) {
  return (
    <div className={cn(
      "border-2 border-border rounded-none", // Military sharp styling
      className
    )}>
      {/* Table Header */}
      <div className="flex border-b border-border p-4">
        {Array.from({ length: columns }).map((_, index) => (
          <div key={index} className="flex-1 px-2">
            <Skeleton className="h-4 w-3/4 rounded-none" />
          </div>
        ))}
      </div>
      
      {/* Table Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex border-b border-border/50 p-4 last:border-b-0">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={colIndex} className="flex-1 px-2">
              <Skeleton className="h-4 w-5/6 rounded-none" />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

// Navigation Skeleton - for loading navigation items
export function NavigationSkeleton({ className }: SkeletonLoaderProps) {
  return (
    <div className={cn("flex items-center space-x-8", className)}>
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-4 w-20 rounded-none" />
      ))}
    </div>
  )
}

// Category Filter Skeleton
export function FilterSkeleton({ className }: SkeletonLoaderProps) {
  return (
    <div className={cn(
      "bg-card border-2 border-border p-4 space-y-4", // Military styling
      "rounded-none",
      className
    )}>
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-16 rounded-none" />
        <Skeleton className="h-4 w-12 rounded-none" />
      </div>
      
      {/* Sort */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-16 rounded-none" />
        <Skeleton className="h-10 w-full rounded-none" />
      </div>
      
      {/* Categories */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-20 rounded-none" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Skeleton className="h-4 w-4 rounded-none" />
              <Skeleton className="h-4 w-24 rounded-none" />
            </div>
          ))}
        </div>
      </div>
      
      {/* Colors */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-16 rounded-none" />
        <div className="flex gap-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-8 w-8 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  )
}