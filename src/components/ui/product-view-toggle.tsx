"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface ProductViewToggleProps {
  onViewChange?: (view: 'grid' | 'list') => void
  defaultView?: 'grid' | 'list'
  className?: string
  showLabels?: boolean
}

export function ProductViewToggle({ 
  onViewChange, 
  defaultView = 'grid',
  className,
  showLabels = false 
}: ProductViewToggleProps) {
  const [currentView, setCurrentView] = useState<'grid' | 'list'>(defaultView)
  const [mounted, setMounted] = useState(false)

  // Initialize view from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedView = localStorage.getItem('product-view-preference')
      if (savedView === 'grid' || savedView === 'list') {
        setCurrentView(savedView)
      }
      setMounted(true)
    }
  }, [])

  // Save view preference and notify parent
  const handleViewChange = (view: 'grid' | 'list') => {
    if (view === currentView) return

    setCurrentView(view)
    
    // Persist preference
    if (typeof window !== 'undefined') {
      localStorage.setItem('product-view-preference', view)
    }

    // Notify parent component
    onViewChange?.(view)

    // Add body class for global styling
    if (typeof document !== 'undefined') {
      document.body.classList.remove('product-view-grid', 'product-view-list')
      document.body.classList.add(`product-view-${view}`)
    }

    // Log for analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'product_view_toggle', {
        event_category: 'engagement',
        event_label: view,
        value: 1
      })
    }
  }

  // Set initial body class
  useEffect(() => {
    if (mounted && typeof document !== 'undefined') {
      document.body.classList.remove('product-view-grid', 'product-view-list')
      document.body.classList.add(`product-view-${currentView}`)
    }
  }, [mounted, currentView])

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <div className={cn("product-view-toggle-container", className)}>
        <button className="product-view-toggle-btn active" disabled>
          <GridIcon />
          {showLabels && <span className="sr-only">Grid</span>}
        </button>
        <button className="product-view-toggle-btn" disabled>
          <ListIcon />
          {showLabels && <span className="sr-only">List</span>}
        </button>
      </div>
    )
  }

  return (
    <div className={cn("product-view-toggle-container", className)} role="tablist" aria-label="Product view options">
      <button
        className={cn("product-view-toggle-btn", {
          "active": currentView === 'grid'
        })}
        onClick={() => handleViewChange('grid')}
        role="tab"
        aria-selected={currentView === 'grid'}
        aria-label="Grid view - 2 columns on mobile, 4 on desktop"
        title="Grid View"
        type="button"
      >
        <GridIcon />
        {showLabels && <span className="text-xs mt-1">Grid</span>}
      </button>
      
      <button
        className={cn("product-view-toggle-btn", {
          "active": currentView === 'list'
        })}
        onClick={() => handleViewChange('list')}
        role="tab"
        aria-selected={currentView === 'list'}
        aria-label="List view - 1 column"
        title="List View"
        type="button"
      >
        <ListIcon />
        {showLabels && <span className="text-xs mt-1">List</span>}
      </button>
    </div>
  )
}

// Grid icon component
function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M4 4h7v7H4V4zm0 9h7v7H4v-7zm9-9h7v7h-7V4zm0 9h7v7h-7v-7z"/>
    </svg>
  )
}

// List icon component
function ListIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M4 6h2v2H4V6zm0 5h2v2H4v-2zm0 5h2v2H4v-2zm4-10h12v2H8V6zm0 5h12v2H8v-2zm0 5h12v2H8v-2z"/>
    </svg>
  )
}

// Hook to get the current view preference
export function useProductViewPreference() {
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedView = localStorage.getItem('product-view-preference')
      if (savedView === 'grid' || savedView === 'list') {
        setView(savedView)
      }
      setLoaded(true)
    }
  }, [])

  return { view, loaded }
}

// Utility component to apply view classes to product grids
interface ProductGridProps {
  children: React.ReactNode
  className?: string
}

export function ProductGrid({ children, className }: ProductGridProps) {
  const { view, loaded } = useProductViewPreference()

  if (!loaded) {
    // Default to grid view during SSR
    return (
      <div className={cn("product-grid-view", className)}>
        {children}
      </div>
    )
  }

  return (
    <div className={cn(
      view === 'grid' ? "product-grid-view" : "product-list-view",
      className
    )}>
      {children}
    </div>
  )
}