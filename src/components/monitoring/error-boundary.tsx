"use client"

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { errorTracker } from '@/lib/monitoring/error-tracking'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
  errorId?: string
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to our tracking service
    errorTracker.captureReactError(error, errorInfo)

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    console.error('Error caught by boundary:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorId: undefined })
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  handleReportError = () => {
    if (this.state.error && this.state.errorId) {
      // In a real implementation, you might open a feedback form
      const subject = encodeURIComponent(`Error Report: ${this.state.errorId}`)
      const body = encodeURIComponent(`
Error Details:
- Error ID: ${this.state.errorId}
- Message: ${this.state.error.message}
- URL: ${window.location.href}
- Time: ${new Date().toISOString()}

Please describe what you were doing when this error occurred:

`)
      window.open(`mailto:info@militarytees.co.uk?subject=${subject}&body=${body}`)
    }
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default fallback UI with military theme
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full space-y-6 text-center">
            {/* Error Icon */}
            <div className="flex justify-center">
              <div className="bg-red-100 p-4 rounded-full border-2 border-red-200">
                <AlertTriangle className="h-12 w-12 text-red-600" />
              </div>
            </div>

            {/* Error Title */}
            <div className="space-y-2">
              <h1 className="text-2xl font-display font-bold text-foreground uppercase tracking-wider">
                Mission Interrupted
              </h1>
              <p className="text-muted-foreground">
                Our systems encountered an unexpected situation. The operation has been halted for safety.
              </p>
            </div>

            {/* Error Details */}
            <div className="bg-muted/50 p-4 rounded border border-border space-y-2">
              <p className="text-sm font-display font-bold text-muted-foreground uppercase tracking-wide">
                Error Details
              </p>
              <p className="text-sm text-muted-foreground font-mono">
                Error ID: {this.state.errorId}
              </p>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left">
                  <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
                    Technical Details (Development Only)
                  </summary>
                  <pre className="mt-2 text-xs bg-background p-2 rounded border overflow-auto max-h-32">
                    {this.state.error.message}
                    {this.state.error.stack && '\n\n' + this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={this.handleRetry}
                className="w-full rounded-none font-display font-bold tracking-wide uppercase"
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Retry Operation
              </Button>
              
              <Button
                onClick={this.handleGoHome}
                variant="outline"
                className="w-full rounded-none border-2 font-display font-bold tracking-wide uppercase"
              >
                <Home className="mr-2 h-4 w-4" />
                Return to Base
              </Button>
              
              <Button
                onClick={this.handleReportError}
                variant="ghost"
                className="w-full text-sm font-display font-bold tracking-wide uppercase"
              >
                Report This Error
              </Button>
            </div>

            {/* Support Information */}
            <div className="text-xs text-muted-foreground space-y-1">
              <p>This error has been automatically reported to our technical team.</p>
              <p>
                For immediate assistance: <br />
                <a 
                  href="mailto:info@militarytees.co.uk" 
                  className="text-primary hover:underline"
                >
                  info@militarytees.co.uk
                </a>
              </p>
            </div>

            {/* Military Heritage Footer */}
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground font-display tracking-wide">
                MILITARY TEES UK - OPERATIONAL EXCELLENCE
              </p>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Wrapper component for easier usage
interface ErrorBoundaryWrapperProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

export function ErrorBoundaryWrapper({ children, fallback, onError }: ErrorBoundaryWrapperProps) {
  return (
    <ErrorBoundary fallback={fallback} onError={onError}>
      {children}
    </ErrorBoundary>
  )
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

export default ErrorBoundary