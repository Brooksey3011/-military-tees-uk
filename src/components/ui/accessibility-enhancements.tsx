"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface AccessibilityProps {
  children: React.ReactNode
  className?: string
}

export function AccessibilityWrapper({ children, className }: AccessibilityProps) {
  const [isKeyboardUser, setIsKeyboardUser] = useState(false)

  useEffect(() => {
    const handleFirstTab = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setIsKeyboardUser(true)
        window.removeEventListener('keydown', handleFirstTab)
      }
    }

    const handleMouseDown = () => {
      setIsKeyboardUser(false)
    }

    window.addEventListener('keydown', handleFirstTab)
    window.addEventListener('mousedown', handleMouseDown)

    return () => {
      window.removeEventListener('keydown', handleFirstTab)
      window.removeEventListener('mousedown', handleMouseDown)
    }
  }, [])

  return (
    <div className={cn(className, isKeyboardUser && 'keyboard-navigation')}>
      {children}
    </div>
  )
}

interface SkipLinkProps {
  targetId: string
  children: React.ReactNode
}

export function SkipLink({ targetId, children }: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-none font-medium z-50 focus:outline-2 focus:outline-primary"
    >
      {children}
    </a>
  )
}

interface AnnouncementProps {
  message: string
  priority?: 'polite' | 'assertive'
}

export function Announcement({ message, priority = 'polite' }: AnnouncementProps) {
  return (
    <div
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  )
}

interface FocusTrapProps {
  children: React.ReactNode
  active: boolean
}

export function FocusTrap({ children, active }: FocusTrapProps) {
  useEffect(() => {
    if (!active) return

    const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    const container = document.querySelector('[data-focus-trap]') as HTMLElement
    
    if (!container) return

    const elements = container.querySelectorAll(focusableElements) as NodeListOf<HTMLElement>
    const firstElement = elements[0]
    const lastElement = elements[elements.length - 1]

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus()
          e.preventDefault()
        }
      }
    }

    container.addEventListener('keydown', handleTabKey)
    firstElement?.focus()

    return () => {
      container.removeEventListener('keydown', handleTabKey)
    }
  }, [active])

  if (!active) return <>{children}</>

  return (
    <div data-focus-trap>
      {children}
    </div>
  )
}

export function useAnnouncement() {
  const [announcement, setAnnouncement] = useState<string>("")

  const announce = (message: string) => {
    setAnnouncement(message)
    setTimeout(() => setAnnouncement(""), 1000)
  }

  return {
    announcement,
    announce
  }
}