"use client"

import { useEffect, useState } from 'react'

interface ServiceWorkerState {
  isSupported: boolean
  isRegistered: boolean
  isUpdateAvailable: boolean
  registration: ServiceWorkerRegistration | null
  error: string | null
}

export function useServiceWorker(): ServiceWorkerState & {
  updateServiceWorker: () => void
  clearCache: () => void
} {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: false,
    isRegistered: false,
    isUpdateAvailable: false,
    registration: null,
    error: null
  })

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      setState(prev => ({ ...prev, isSupported: false }))
      return
    }

    setState(prev => ({ ...prev, isSupported: true }))

    const registerServiceWorker = async () => {
      try {
        console.log('[SW] Registering service worker...')
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        })

        setState(prev => ({ 
          ...prev, 
          isRegistered: true, 
          registration 
        }))

        // Check for service worker updates
        registration.addEventListener('updatefound', () => {
          console.log('[SW] Update found')
          const newWorker = registration.installing

          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[SW] Update available')
                setState(prev => ({ ...prev, isUpdateAvailable: true }))
              }
            })
          }
        })

        // Handle service worker messages
        navigator.serviceWorker.addEventListener('message', (event) => {
          console.log('[SW] Message received:', event.data)
        })

        // Check if service worker is already controlling the page
        if (navigator.serviceWorker.controller) {
          console.log('[SW] Service worker is already controlling the page')
        }

        // Listen for service worker becoming ready
        const swReady = await navigator.serviceWorker.ready
        console.log('[SW] Service worker is ready')
        
        // Preload critical resources
        if (swReady.active) {
          swReady.active.postMessage({
            type: 'CACHE_URLS',
            urls: [
              '/',
              '/products',
              '/categories',
              '/search'
            ]
          })
        }

      } catch (error) {
        console.error('[SW] Registration failed:', error)
        setState(prev => ({ 
          ...prev, 
          error: error instanceof Error ? error.message : 'Registration failed' 
        }))
      }
    }

    registerServiceWorker()

    // Handle page visibility changes to check for updates
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && state.registration) {
        state.registration.update()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [state.registration])

  const updateServiceWorker = () => {
    if (state.registration && state.registration.waiting) {
      state.registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      
      state.registration.waiting.addEventListener('statechange', (event) => {
        const target = event.target as ServiceWorker
        if (target.state === 'activated') {
          window.location.reload()
        }
      })
    }
  }

  const clearCache = async () => {
    if (state.registration && state.registration.active) {
      state.registration.active.postMessage({ type: 'CLEAR_CACHE' })
      console.log('[SW] Cache clear requested')
    }
  }

  return {
    ...state,
    updateServiceWorker,
    clearCache
  }
}