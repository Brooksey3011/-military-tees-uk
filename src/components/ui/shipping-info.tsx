"use client"

import * as React from "react"
import { Truck, RotateCcw, Shield, Clock, Package, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ShippingInfoProps {
  variant?: "full" | "compact" | "minimal"
  className?: string
}

export function ShippingInfo({ variant = "full", className }: ShippingInfoProps) {
  
  if (variant === "minimal") {
    return (
      <div className={cn("flex items-center justify-center gap-4 text-xs text-muted-foreground", className)}>
        <span className="flex items-center gap-1">
          <Truck className="h-3 w-3" />
          Free UK shipping over £50
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <RotateCcw className="h-3 w-3" />
          30-day returns
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <Shield className="h-3 w-3" />
          Secure checkout
        </span>
      </div>
    )
  }

  if (variant === "compact") {
    return (
      <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4", className)}>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-[#FFAD02] rounded-full flex items-center justify-center">
            <Truck className="h-4 w-4 text-black" />
          </div>
          <div>
            <div className="text-sm font-medium">Free Shipping</div>
            <div className="text-xs text-muted-foreground">Orders over £50</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <Clock className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <div className="text-sm font-medium">Fast Delivery</div>
            <div className="text-xs text-muted-foreground">1-3 working days</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <RotateCcw className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="text-sm font-medium">Easy Returns</div>
            <div className="text-xs text-muted-foreground">30-day policy</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <Shield className="h-4 w-4 text-purple-600" />
          </div>
          <div>
            <div className="text-sm font-medium">Secure</div>
            <div className="text-xs text-muted-foreground">SSL protected</div>
          </div>
        </div>
      </div>
    )
  }

  // Full variant
  return (
    <div className={cn("space-y-6", className)}>
      <div className="text-center">
        <h3 className="text-lg font-bold text-foreground mb-2">
          Shipping & Returns
        </h3>
        <p className="text-sm text-muted-foreground">
          Fast, reliable delivery with hassle-free returns
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shipping Information */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#FFAD02] rounded-full flex items-center justify-center">
              <Truck className="h-5 w-5 text-black" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Free UK Shipping</h4>
              <p className="text-sm text-muted-foreground">On all orders over £50</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Clock className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Fast Delivery</h4>
              <p className="text-sm text-muted-foreground">1-3 working days within UK</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Order Tracking</h4>
              <p className="text-sm text-muted-foreground">Track your package every step</p>
            </div>
          </div>
        </div>
        
        {/* Returns Information */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <RotateCcw className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">30-Day Returns</h4>
              <p className="text-sm text-muted-foreground">Money back guarantee</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Shield className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Quality Guarantee</h4>
              <p className="text-sm text-muted-foreground">Premium materials only</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <MapPin className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Easy Returns</h4>
              <p className="text-sm text-muted-foreground">Simple online process</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Shipping Rates */}
      <div className="border-t border-border pt-6">
        <h4 className="font-semibold text-foreground mb-4">Shipping Rates</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">UK Standard (1-3 days):</span>
            <span className="font-medium">£4.99 (Free over £50)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">UK Express (Next Day):</span>
            <span className="font-medium">£9.99</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">International:</span>
            <span className="font-medium">From £12.99</span>
          </div>
        </div>
      </div>
      
      {/* Additional Info */}
      <div className="bg-muted/30 p-4 rounded-sm border border-border">
        <div className="flex items-start space-x-3">
          <Badge className="bg-[#FFAD02] text-black">
            💂 MILITARY DISCOUNT
          </Badge>
          <div>
            <p className="text-sm text-foreground font-medium">
              10% discount for serving military personnel and veterans
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Verify your service status at checkout
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}