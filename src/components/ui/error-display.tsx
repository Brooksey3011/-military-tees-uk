"use client"

import * as React from "react"
import { AlertTriangle, RefreshCw, AlertCircle, XCircle } from "lucide-react"
import { Button } from "./button"
import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { cn } from "@/lib/utils"

interface ErrorDisplayProps {
  error: Error | string | null
  title?: string
  description?: string
  showRetry?: boolean
  onRetry?: () => void
  variant?: "card" | "inline" | "banner"
  className?: string
}

export function ErrorDisplay({
  error,
  title = "Operation Failed",
  description,
  showRetry = true,
  onRetry,
  variant = "card",
  className
}: ErrorDisplayProps) {
  if (!error) return null

  const errorMessage = typeof error === "string" ? error : error.message
  const finalDescription = description || "An unexpected error occurred during the operation."

  if (variant === "inline") {
    return (
      <div className={cn("flex items-center gap-2 text-destructive text-sm", className)}>
        <AlertCircle className="h-4 w-4 flex-shrink-0" />
        <span>{errorMessage}</span>
        {showRetry && onRetry && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onRetry}
            className="h-auto p-1 text-xs hover:text-destructive"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        )}
      </div>
    )
  }

  if (variant === "banner") {
    return (
      <div className={cn(
        "border-2 border-destructive bg-destructive/10 p-4",
        className
      )}>
        <div className="flex items-center gap-3">
          <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-display font-bold text-sm uppercase tracking-wide text-destructive">
              {title}
            </h4>
            <p className="text-sm text-muted-foreground mt-1">
              {errorMessage}
            </p>
          </div>
          {showRetry && onRetry && (
            <Button
              size="sm"
              variant="outline"
              onClick={onRetry}
              className="rounded-none border-2"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          )}
        </div>
      </div>
    )
  }

  // Card variant (default)
  return (
    <Card className={cn("border-2 border-destructive rounded-none", className)}>
      <CardHeader className="text-center">
        <div className="mx-auto bg-destructive/10 p-3 border-2 border-destructive mb-4 w-fit">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <CardTitle className="font-display font-bold tracking-wider uppercase text-destructive">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-muted-foreground">
          {finalDescription}
        </p>
        
        {process.env.NODE_ENV === "development" && (
          <details className="text-left bg-muted p-4 border-2 border-border">
            <summary className="cursor-pointer font-semibold text-sm uppercase tracking-wide">
              Error Details
            </summary>
            <pre className="mt-2 text-xs overflow-auto text-destructive">
              {errorMessage}
            </pre>
          </details>
        )}
        
        {showRetry && onRetry && (
          <Button 
            onClick={onRetry}
            className="rounded-none font-display font-bold tracking-wide uppercase"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Operation
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

// Hook for handling async operations with loading and error states
export function useAsyncOperation<T = unknown>() {
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)
  const [data, setData] = React.useState<T | null>(null)

  const execute = React.useCallback(async (asyncFn: () => Promise<T>) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await asyncFn()
      setData(result)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred')
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const reset = React.useCallback(() => {
    setIsLoading(false)
    setError(null)
    setData(null)
  }, [])

  return {
    isLoading,
    error,
    data,
    execute,
    reset
  }
}