"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressProps {
  value?: number
  max?: number
  className?: string
  indicatorClassName?: string
}

export function Progress({ value = 0, max = 100, className, indicatorClassName }: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-none bg-muted border border-border",
        className
      )}
    >
      <div
        className={cn(
          "h-full w-full flex-1 bg-primary transition-all duration-300 ease-in-out",
          indicatorClassName
        )}
        style={{ transform: `translateX(-${100 - percentage}%)` }}
      />
    </div>
  )
}