"use client"

import * as React from "react"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

export type ToastType = "success" | "error" | "warning" | "info"

export interface Toast {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: number
}

interface ToastProps extends Toast {
  onRemove: (id: string) => void
}

const toastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const toastStyles = {
  success: "border-success/50 bg-success/10 text-success-foreground",
  error: "border-destructive/50 bg-destructive/10 text-destructive-foreground",
  warning: "border-warning/50 bg-warning/10 text-warning-foreground", 
  info: "border-primary/50 bg-primary/10 text-primary",
}

export function ToastComponent({ id, type, title, description, duration = 5000, onRemove }: ToastProps) {
  const Icon = toastIcons[type]

  React.useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(id)
    }, duration)

    return () => clearTimeout(timer)
  }, [id, duration, onRemove])

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className={cn(
        "flex w-full max-w-sm items-start gap-3 rounded-md border p-4 shadow-md",
        toastStyles[type]
      )}
    >
      <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium">{title}</p>
        {description && (
          <p className="text-sm opacity-90">{description}</p>
        )}
      </div>
      <button
        onClick={() => onRemove(id)}
        className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </button>
    </motion.div>
  )
}

interface ToastContainerProps {
  toasts: Toast[]
  onRemove: (id: string) => void
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastComponent key={toast.id} {...toast} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  )
}