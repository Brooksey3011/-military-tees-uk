"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

interface DialogContextValue {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const DialogContext = React.createContext<DialogContextValue | null>(null)

interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

export function Dialog({ open = false, onOpenChange, children }: DialogProps) {
  return (
    <DialogContext.Provider value={{ open, onOpenChange: onOpenChange || (() => {}) }}>
      {children}
    </DialogContext.Provider>
  )
}

interface DialogTriggerProps {
  asChild?: boolean
  children: React.ReactNode
  className?: string
}

export function DialogTrigger({ asChild = false, children, className }: DialogTriggerProps) {
  const context = React.useContext(DialogContext)
  
  if (!context) {
    throw new Error("DialogTrigger must be used within Dialog")
  }

  const handleClick = () => {
    context.onOpenChange(true)
  }

  if (asChild) {
    return React.cloneElement(children as React.ReactElement, {
      onClick: handleClick,
      className: cn(className, (children as React.ReactElement).props.className)
    } as any)
  }

  return (
    <button onClick={handleClick} className={className}>
      {children}
    </button>
  )
}

interface DialogContentProps {
  children: React.ReactNode
  className?: string
  onEscapeKeyDown?: (event: KeyboardEvent) => void
  onPointerDownOutside?: (event: PointerEvent) => void
}

export function DialogContent({ 
  children, 
  className, 
  onEscapeKeyDown,
  onPointerDownOutside 
}: DialogContentProps) {
  const context = React.useContext(DialogContext)
  
  if (!context) {
    throw new Error("DialogContent must be used within Dialog")
  }

  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onEscapeKeyDown?.(event)
        if (!event.defaultPrevented) {
          context.onOpenChange(false)
        }
      }
    }

    if (context.open) {
      document.addEventListener("keydown", handleEscape)
      return () => document.removeEventListener("keydown", handleEscape)
    }
  }, [context.open, onEscapeKeyDown, context])

  if (!context.open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50"
        onClick={(e) => {
          const event = e.nativeEvent as unknown as PointerEvent
          onPointerDownOutside?.(event)
          if (!e.defaultPrevented) {
            context.onOpenChange(false)
          }
        }}
      />
      
      {/* Content */}
      <div className={cn(
        "relative bg-background border-2 border-border rounded-none shadow-lg w-full max-w-lg mx-4 max-h-[90vh] overflow-auto",
        className
      )}>
        {children}
      </div>
    </div>
  )
}

interface DialogHeaderProps {
  children: React.ReactNode
  className?: string
}

export function DialogHeader({ children, className }: DialogHeaderProps) {
  return (
    <div className={cn("flex flex-col space-y-1.5 p-6 border-b border-border", className)}>
      {children}
    </div>
  )
}

interface DialogFooterProps {
  children: React.ReactNode
  className?: string
}

export function DialogFooter({ children, className }: DialogFooterProps) {
  return (
    <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 border-t border-border", className)}>
      {children}
    </div>
  )
}

interface DialogTitleProps {
  children: React.ReactNode
  className?: string
}

export function DialogTitle({ children, className }: DialogTitleProps) {
  return (
    <h2 className={cn("text-lg font-semibold leading-none tracking-tight", className)}>
      {children}
    </h2>
  )
}

interface DialogDescriptionProps {
  children: React.ReactNode
  className?: string
}

export function DialogDescription({ children, className }: DialogDescriptionProps) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)}>
      {children}
    </p>
  )
}

interface DialogCloseProps {
  asChild?: boolean
  children?: React.ReactNode
  className?: string
}

export function DialogClose({ asChild = false, children, className }: DialogCloseProps) {
  const context = React.useContext(DialogContext)
  
  if (!context) {
    throw new Error("DialogClose must be used within Dialog")
  }

  const handleClick = () => {
    context.onOpenChange(false)
  }

  if (asChild && children) {
    return React.cloneElement(children as React.ReactElement, {
      onClick: handleClick,
      className: cn(className, (children as React.ReactElement).props.className)
    })
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      className={cn("absolute right-2 top-2 rounded-none", className)}
    >
      <X className="h-4 w-4" />
      <span className="sr-only">Close</span>
    </Button>
  )
}