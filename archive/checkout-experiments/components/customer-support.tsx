"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Mail, 
  Clock,
  Shield,
  CheckCircle2,
  HelpCircle,
  Headphones
} from "lucide-react"

export function CustomerSupport() {
  return (
    <Card className="border border-border/50 sticky top-6">
      <CardContent className="p-4">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Headphones className="h-5 w-5 text-primary" />
            <span className="font-medium">Need Help?</span>
            <Badge className="bg-green-100 text-green-800 border-green-300">
              Available
            </Badge>
          </div>

          <div className="space-y-3 text-sm">
            <div className="text-muted-foreground">
              Our military support team is here to assist you with your order.
            </div>

            {/* Support Options */}
            <div className="space-y-2">
              {/* Email Support */}
              <Button
                variant="outline"
                className="w-full justify-start h-auto p-3"
                asChild
              >
                <a href="mailto:info@militarytees.co.uk">
                  <div className="flex items-center gap-3 w-full">
                    <Mail className="h-4 w-4 text-primary" />
                    <div className="text-left flex-1">
                      <div className="font-medium">Email Support</div>
                      <div className="text-xs text-muted-foreground">
                        info@militarytees.co.uk
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Response within 24 hours
                      </div>
                    </div>
                  </div>
                </a>
              </Button>
            </div>

            {/* FAQ Link */}
            <div className="pt-2 border-t">
              <Button
                variant="ghost"
                className="w-full justify-start h-auto p-2"
                onClick={() => {
                  window.open('/faq', '_blank')
                }}
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                <span className="text-sm">View FAQ</span>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="pt-2 border-t">
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex items-center justify-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  <span>Order Support</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <Shield className="h-3 w-3 text-green-600" />
                  <span>Secure Checkout Help</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  <span>Sizing Assistance</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ValidationMessage({ 
  type, 
  message 
}: { 
  type: 'success' | 'error' | 'warning' | 'info'
  message: string 
}) {
  const icons = {
    success: <CheckCircle2 className="h-4 w-4 text-green-600" />,
    error: <HelpCircle className="h-4 w-4 text-red-600" />,
    warning: <HelpCircle className="h-4 w-4 text-yellow-600" />,
    info: <HelpCircle className="h-4 w-4 text-blue-600" />
  }

  const colors = {
    success: 'border-green-200 bg-green-50 text-green-800',
    error: 'border-red-200 bg-red-50 text-red-800',
    warning: 'border-yellow-200 bg-yellow-50 text-yellow-800',
    info: 'border-blue-200 bg-blue-50 text-blue-800'
  }

  return (
    <div className={`flex items-center gap-2 p-3 border rounded-lg text-sm ${colors[type]}`}>
      {icons[type]}
      <span>{message}</span>
    </div>
  )
}

export function RealTimeValidation({ 
  isValid, 
  message, 
  isValidating = false 
}: { 
  isValid?: boolean
  message?: string
  isValidating?: boolean 
}) {
  if (isValidating) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="w-3 h-3 border border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
        <span>Validating...</span>
      </div>
    )
  }

  if (isValid === true) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <CheckCircle2 className="h-3 w-3" />
        <span>{message || 'Valid'}</span>
      </div>
    )
  }

  if (isValid === false && message) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-600">
        <HelpCircle className="h-3 w-3" />
        <span>{message}</span>
      </div>
    )
  }

  return null
}