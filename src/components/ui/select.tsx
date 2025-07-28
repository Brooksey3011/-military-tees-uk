import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps {
  options: SelectOption[]
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, value, onValueChange, placeholder, className, disabled, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          value={value}
          onChange={(e) => onValueChange?.(e.target.value)}
          disabled={disabled}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none pr-8",
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none" />
      </div>
    )
  }
)
Select.displayName = "Select"

// Additional components for compatibility
export const SelectTrigger = ({ children, className, ...props }: any) => (
  <div className={cn("flex h-10 w-full items-center justify-between border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", className)} {...props}>
    {children}
    <ChevronDown className="h-4 w-4 opacity-50" />
  </div>
)

export const SelectValue = ({ placeholder, className, ...props }: any) => (
  <span className={className} {...props}>{placeholder}</span>
)

export const SelectContent = ({ children, className, ...props }: any) => (
  <div className={cn("relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md", className)} {...props}>
    {children}
  </div>
)

export const SelectItem = ({ children, className, value, ...props }: any) => (
  <div className={cn("relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className)} {...props}>
    {children}
  </div>
)

export { Select }