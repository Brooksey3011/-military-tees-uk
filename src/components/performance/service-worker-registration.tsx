"use client"

import { useEffect } from 'react'
import { useServiceWorker } from '@/hooks/use-service-worker'

export function ServiceWorkerRegistration() {
  const { 
    isSupported, 
    isRegistered, 
    isUpdateAvailable, 
    updateServiceWorker,
    error 
  } = useServiceWorker()

  useEffect(() => {
    if (isSupported && isRegistered) {
      console.log('✅ Service Worker registered successfully')
    }
    
    if (error) {
      console.error('❌ Service Worker registration failed:', error)
    }
  }, [isSupported, isRegistered, error])

  // Show update notification if available
  useEffect(() => {
    if (isUpdateAvailable) {
      const shouldUpdate = window.confirm(
        'A new version of Military Tees UK is available. Would you like to update now?'
      )
      
      if (shouldUpdate) {
        updateServiceWorker()
      }
    }
  }, [isUpdateAvailable, updateServiceWorker])

  // This component doesn't render anything visible
  return null
}

// Optional: Service Worker status indicator (for development)
export function ServiceWorkerStatus() {
  const { 
    isSupported, 
    isRegistered, 
    isUpdateAvailable, 
    error 
  } = useServiceWorker()

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-background border border-border rounded-lg p-3 shadow-lg text-xs">
      <div className="font-semibold mb-1">Service Worker Status</div>
      <div className="space-y-1">
        <div className={`flex items-center space-x-2 ${isSupported ? 'text-green-600' : 'text-red-600'}`}>
          <span className="w-2 h-2 rounded-full bg-current"></span>
          <span>Supported: {isSupported ? 'Yes' : 'No'}</span>
        </div>
        <div className={`flex items-center space-x-2 ${isRegistered ? 'text-green-600' : 'text-gray-600'}`}>
          <span className="w-2 h-2 rounded-full bg-current"></span>
          <span>Registered: {isRegistered ? 'Yes' : 'No'}</span>
        </div>
        {isUpdateAvailable && (
          <div className="flex items-center space-x-2 text-blue-600">
            <span className="w-2 h-2 rounded-full bg-current"></span>
            <span>Update Available</span>
          </div>
        )}
        {error && (
          <div className="text-red-600 mt-1">
            Error: {error}
          </div>
        )}
      </div>
    </div>
  )
}