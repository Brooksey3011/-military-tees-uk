"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Wifi, WifiOff, RefreshCw, Home, ShoppingBag } from 'lucide-react'

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Offline Icon */}
        <div className="relative">
          <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center">
            <WifiOff className="w-12 h-12 text-muted-foreground" />
          </div>
          <Badge variant="destructive" className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            Offline
          </Badge>
        </div>

        {/* Title and Description */}
        <div className="space-y-3">
          <h1 className="text-3xl font-display font-bold text-foreground">
            You're Offline
          </h1>
          <p className="text-muted-foreground">
            No internet connection detected. Check your connection and try again to continue shopping for military-themed apparel.
          </p>
        </div>

        {/* Connection Status */}
        <div className="bg-muted/30 p-4 rounded-lg border">
          <div className="flex items-center justify-center space-x-2 text-sm">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-destructive rounded-full animate-pulse"></div>
              <span className="text-muted-foreground">Disconnected</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button 
            onClick={() => window.location.reload()} 
            className="w-full"
            size="lg"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          
          <div className="flex space-x-3">
            <Button variant="outline" asChild className="flex-1">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Link>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href="/products">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Products
              </Link>
            </Button>
          </div>
        </div>

        {/* Tips */}
        <div className="text-left bg-muted/20 p-4 rounded-lg border">
          <h3 className="font-semibold text-foreground mb-2 flex items-center">
            <Wifi className="w-4 h-4 mr-2" />
            Connection Tips
          </h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Check your WiFi or mobile data</li>
            <li>• Try moving to a better signal area</li>
            <li>• Restart your router if using WiFi</li>
            <li>• Contact your provider if issues persist</li>
          </ul>
        </div>

        {/* Cached Content Notice */}
        <div className="text-xs text-muted-foreground bg-primary/5 p-3 rounded border border-primary/20">
          <p>
            <strong>Note:</strong> Some previously visited pages may still be available offline thanks to our caching system.
          </p>
        </div>
      </div>

      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10 opacity-5">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_35%,rgba(255,255,255,.1)_50%,transparent_65%)]"></div>
      </div>

      {/* Auto-refresh Script */}
      <script 
        dangerouslySetInnerHTML={{
          __html: `
            // Auto-refresh when connection is restored
            function checkConnection() {
              if (navigator.onLine) {
                window.location.reload();
              }
            }
            
            // Check connection every 5 seconds
            setInterval(checkConnection, 5000);
            
            // Also listen for online event
            window.addEventListener('online', checkConnection);
          `
        }}
      />
    </div>
  )
}