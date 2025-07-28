"use client"

import * as React from "react"
import { CreditCard, Shield, Lock, Truck, Award, Users } from "lucide-react"
import { cn } from "@/lib/utils"

interface PaymentOptionsProps {
  variant?: "horizontal" | "grid" | "compact"
  showSecurity?: boolean
  className?: string
}

export function PaymentOptions({ 
  variant = "horizontal", 
  showSecurity = true,
  className 
}: PaymentOptionsProps) {

  return (
    <div className={cn("space-y-6", className)}>
      {/* Trust & Quality Section */}
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-bold text-foreground mb-2">
            Quality & Trust
          </h3>
          <p className="text-sm text-muted-foreground">
            Your satisfaction and security are our priorities
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col items-center justify-center p-4 border border-border rounded-sm hover:border-primary transition-colors">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
              <Award className="h-6 w-6 text-primary" />
            </div>
            <div className="text-sm font-medium text-center mb-1">Premium Quality</div>
            <div className="text-xs text-muted-foreground text-center">Military-grade materials and printing</div>
          </div>
          
          <div className="flex flex-col items-center justify-center p-4 border border-border rounded-sm hover:border-primary transition-colors">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div className="text-sm font-medium text-center mb-1">Community Focus</div>
            <div className="text-xs text-muted-foreground text-center">Serving the military community</div>
          </div>
          
          <div className="flex flex-col items-center justify-center p-4 border border-border rounded-sm hover:border-primary transition-colors">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div className="text-sm font-medium text-center mb-1">Trusted Service</div>
            <div className="text-xs text-muted-foreground text-center">Reliable and authentic</div>
          </div>
        </div>
      </div>

      {/* Security Features */}
      {showSecurity && (
        <div className="pt-4 border-t border-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <div className="flex items-center space-x-3 justify-center">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-center">
                <div className="text-sm font-medium">SSL Encrypted</div>
                <div className="text-xs text-muted-foreground">256-bit security</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 justify-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Lock className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-center">
                <div className="text-sm font-medium">PCI Compliant</div>
                <div className="text-xs text-muted-foreground">Industry standard</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 justify-center">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div className="text-center">
                <div className="text-sm font-medium">Secure Checkout</div>
                <div className="text-xs text-muted-foreground">Protected payments</div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Additional Trust Signals */}
      <div className="pt-4 border-t border-border">
        <div className="flex justify-center items-center gap-4 text-xs text-muted-foreground max-w-2xl mx-auto text-center">
          <span className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Money Back Guarantee
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Truck className="h-3 w-3" />
            Free UK Shipping Over £50
          </span>
          <span>•</span>
        </div>
      </div>
    </div>
  )
}