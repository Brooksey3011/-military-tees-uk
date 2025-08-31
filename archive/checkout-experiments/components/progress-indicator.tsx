"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const steps = [
  { id: 1, name: "Cart", description: "Review items" },
  { id: 2, name: "Information", description: "Contact details" },
  { id: 3, name: "Shipping", description: "Delivery options" },
  { id: 4, name: "Payment", description: "Secure payment" },
  { id: 5, name: "Review", description: "Confirm order" },
]

interface ProgressIndicatorProps {
  currentStep: number
  className?: string
}

export function ProgressIndicator({ currentStep, className }: ProgressIndicatorProps) {
  return (
    <nav className={cn("w-full", className)} aria-label="Progress">
      <ol className="flex items-center justify-center space-x-2 md:space-x-8">
        {steps.map((step, stepIdx) => (
          <li key={step.name} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                  currentStep > step.id
                    ? "bg-green-600 border-green-600 text-white" // Completed
                    : currentStep === step.id
                    ? "bg-primary border-primary text-primary-foreground" // Current
                    : "bg-background border-muted-foreground text-muted-foreground" // Upcoming
                )}
              >
                {currentStep > step.id ? (
                  <Check className="h-4 w-4" />
                ) : (
                  step.id
                )}
              </div>
              <div className="mt-2 text-center">
                <div
                  className={cn(
                    "text-sm font-medium",
                    currentStep >= step.id
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {step.name}
                </div>
                <div className="text-xs text-muted-foreground hidden sm:block">
                  {step.description}
                </div>
              </div>
            </div>
            {stepIdx !== steps.length - 1 && (
              <div
                className={cn(
                  "ml-4 h-px w-8 md:w-16",
                  currentStep > step.id
                    ? "bg-green-600"
                    : "bg-muted-foreground"
                )}
              />
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}