"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  MessageCircle, 
  Phone, 
  Mail, 
  Clock,
  Shield,
  CheckCircle2,
  HelpCircle,
  Headphones
} from "lucide-react"

export function CustomerSupport() {
  const [isSupported] = useState(true) // Check if customer support is available

  return (
    <Card className="border border-border/50 sticky top-6">
      <CardContent className="p-4">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Headphones className="h-5 w-5 text-primary" />
            <span className="font-medium">Need Help?</span>
            {isSupported && (
              <Badge className="bg-green-100 text-green-800 border-green-300">
                Online
              </Badge>
            )}
          </div>

          <div className="space-y-3 text-sm">
            <div className="text-muted-foreground">
              Our military support team is here to assist you with your order.
            </div>

            {/* Support Options */}
            <div className="space-y-2">
              
              {/* Live Chat */}
              <Button
                variant="outline"
                className="w-full justify-start h-auto p-3"
                onClick={() => {
                  // In a real implementation, this would open a chat widget
                  alert('Live chat would open here')
                }}
              >
                <div className="flex items-center gap-3 w-full">
                  <MessageCircle className="h-4 w-4 text-green-600" />
                  <div className="text-left flex-1">
                    <div className="font-medium">Live Chat</div>
                    <div className="text-xs text-muted-foreground">
                      Average response: 2 minutes
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-600">Online</span>
                  </div>
                </div>
              </Button>

              {/* Phone Support */}
              <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                <Phone className="h-4 w-4 text-primary" />
                <div className="text-left flex-1">
                  <div className="font-medium">Phone Support</div>
                  <div className="text-xs text-muted-foreground">
                    0800 123 4567
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Clock className="h-3 w-3" />
                    <span>Mon-Fri 9AM-6PM</span>
                  </div>
                </div>
              </div>

              {/* Email Support */}
              <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                <Mail className="h-4 w-4 text-primary" />
                <div className="text-left flex-1">
                  <div className="font-medium">Email Support</div>
                  <div className="text-xs text-muted-foreground">
                    help@militarytees.co.uk
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Response within 2 hours
                  </div>
                </div>
              </div>
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