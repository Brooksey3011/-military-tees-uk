import * as React from "react"
import { LoadingSpinner } from "./loading-spinner"
import { cn } from "@/lib/utils"

interface LoadingStateProps {
  isLoading: boolean
  children: React.ReactNode
  fallback?: React.ReactNode
  className?: string
  spinnerSize?: "sm" | "md" | "lg"
  message?: string
}

export function LoadingState({
  isLoading,
  children,
  fallback,
  className,
  spinnerSize = "md",
  message = "Loading..."
}: LoadingStateProps) {
  if (isLoading) {
    return (
      <div className={cn("flex flex-col items-center justify-center p-8", className)}>
        {fallback || (
          <>
            <LoadingSpinner size={spinnerSize} className="mb-4" />
            <p className="text-sm text-muted-foreground font-display tracking-wide uppercase">
              {message}
            </p>
          </>
        )}
      </div>
    )
  }

  return <>{children}</>
}

// Military-themed loading messages
export const militaryLoadingMessages = [
  "Deploying resources...",
  "Establishing connection...",
  "Securing perimeter...",
  "Loading ammunition...",
  "Briefing in progress...",
  "Mobilizing forces...",
  "Tactical preparation...",
  "Mission planning...",
  "System reconnaissance...",
  "Preparing for deployment..."
]

// Hook for military loading message (using static message to prevent hydration issues)
export function useMilitaryLoadingMessage() {
  const [message] = React.useState("Loading military gear...")
  
  return message
}

// Full page loading overlay
interface LoadingOverlayProps {
  isVisible: boolean
  message?: string
  className?: string
}

export function LoadingOverlay({ 
  isVisible, 
  message = "Operation in progress...",
  className 
}: LoadingOverlayProps) {
  if (!isVisible) return null

  return (
    <div className={cn(
      "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center",
      className
    )}>
      <div className="bg-background border-2 border-border p-8 text-center">
        <LoadingSpinner size="lg" className="mb-4 mx-auto" />
        <p className="text-sm text-muted-foreground font-display tracking-wide uppercase">
          {message}
        </p>
      </div>
    </div>
  )
}