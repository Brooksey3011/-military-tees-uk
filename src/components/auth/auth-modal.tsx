"use client"

import * as React from "react"
import { useState } from "react"
import { X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { LoginForm } from "./login-form"
import { SignupForm } from "./signup-form"
import { ForgotPasswordForm } from "./forgot-password-form"
import { cn } from "@/lib/utils"

type AuthView = "login" | "signup" | "forgot-password"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialView?: AuthView
  onLogin?: (email: string, password: string) => Promise<void>
  onSignup?: (email: string, password: string, fullName: string) => Promise<void>
  onForgotPassword?: (email: string) => Promise<void>
  className?: string
}

export function AuthModal({
  isOpen,
  onClose,
  initialView = "login",
  onLogin,
  onSignup,
  onForgotPassword,
  className
}: AuthModalProps) {
  const [currentView, setCurrentView] = useState<AuthView>(initialView)
  const [isLoading, setIsLoading] = useState(false)

  // Reset view when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setCurrentView(initialView)
      setIsLoading(false)
    }
  }, [isOpen, initialView])

  // Close modal with Escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      await onLogin?.(email, password)
      onClose()
    } catch (error) {
      throw error // Let the form handle the error
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (email: string, password: string, fullName: string) => {
    setIsLoading(true)
    try {
      await onSignup?.(email, password, fullName)
      onClose()
    } catch (error) {
      throw error // Let the form handle the error
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async (email: string) => {
    setIsLoading(true)
    try {
      await onForgotPassword?.(email)
      // Form will show success state
    } catch (error) {
      throw error // Let the form handle the error
    } finally {
      setIsLoading(false)
    }
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case "login":
        return (
          <LoginForm
            onSubmit={handleLogin}
            onSwitchToSignup={() => setCurrentView("signup")}
            onForgotPassword={() => setCurrentView("forgot-password")}
            isLoading={isLoading}
          />
        )
      
      case "signup":
        return (
          <SignupForm
            onSubmit={handleSignup}
            onSwitchToLogin={() => setCurrentView("login")}
            isLoading={isLoading}
          />
        )
      
      case "forgot-password":
        return (
          <ForgotPasswordForm
            onSubmit={handleForgotPassword}
            onBackToLogin={() => setCurrentView("login")}
            isLoading={isLoading}
          />
        )
      
      default:
        return null
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className={cn(
              "bg-background border-2 border-border rounded-none max-w-lg w-full max-h-[90vh] overflow-hidden",
              className
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="border-b-2 border-border p-4 flex items-center justify-between bg-muted/10">
              <div className="flex items-center gap-3">
                <h2 className="font-display font-bold tracking-wide uppercase text-foreground">
                  {currentView === "login" && "Mission Login"}
                  {currentView === "signup" && "Recruit Enlistment"}
                  {currentView === "forgot-password" && "Password Recovery"}
                </h2>
              </div>
              
              <Button
                size="sm"
                variant="ghost"
                className="rounded-none p-2"
                onClick={onClose}
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[calc(90vh-80px)] overflow-y-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentView}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderCurrentView()}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}