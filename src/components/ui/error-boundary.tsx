"use client"

import * as React from "react"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import { Button } from "./button"
import { Card, CardContent, CardHeader, CardTitle } from "./card"

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
}

interface ErrorFallbackProps {
  error: Error
  resetError: () => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundaryClass extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error Boundary caught an error:", error, errorInfo)
    
    // In production, you might want to log this to an error reporting service
    if (process.env.NODE_ENV === "production") {
      // Example: logErrorToService(error, errorInfo)
    }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const resetError = () => {
        this.setState({ hasError: false, error: null })
      }

      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      
      return <FallbackComponent error={this.state.error} resetError={resetError} />
    }

    return this.props.children
  }
}

function DefaultErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
      <Card className="max-w-md w-full border-2 border-border rounded-none">
        <CardHeader className="text-center">
          <div className="mx-auto bg-red-100 p-3 border-2 border-red-600 mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="font-display font-bold tracking-wider uppercase">
            System Malfunction
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Our military-grade systems have encountered an unexpected error. 
            The technical team has been notified.
          </p>
          
          {process.env.NODE_ENV === "development" && (
            <details className="text-left bg-muted p-4 border-2 border-border">
              <summary className="cursor-pointer font-semibold text-sm uppercase tracking-wide">
                Technical Details
              </summary>
              <pre className="mt-2 text-xs overflow-auto">
                {error.message}
                {error.stack && `\n${error.stack}`}
              </pre>
            </details>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={resetError}
              className="flex-1 rounded-none font-display font-bold tracking-wide uppercase"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Operation
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.href = "/"}
              className="flex-1 rounded-none border-2 font-display font-bold tracking-wide uppercase"
            >
              <Home className="h-4 w-4 mr-2" />
              Return to Base
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground mt-4">
            Error ID: {Date.now().toString(36)}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// Hook version for easier usage in functional components
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null)

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  const captureError = React.useCallback((error: Error) => {
    setError(error)
  }, [])

  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return { captureError, resetError }
}

export { ErrorBoundaryClass as ErrorBoundary }
export type { ErrorFallbackProps }