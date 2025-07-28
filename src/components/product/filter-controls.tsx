"use client"

import * as React from "react"
import { Filter, X, ChevronDown, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface FilterOption {
  id: string
  label: string
  value: string
  count?: number
}

interface FilterGroup {
  id: string
  label: string
  type: 'checkbox' | 'radio' | 'range' | 'select'
  options?: FilterOption[]
  min?: number
  max?: number
  step?: number
}

interface ActiveFilter {
  groupId: string
  groupLabel: string
  optionId: string
  optionLabel: string
  value: string
}

interface FilterControlsProps {
  filterGroups: FilterGroup[]
  activeFilters: ActiveFilter[]
  onFilterChange: (groupId: string, optionId: string, value: string, action: 'add' | 'remove') => void
  onClearAll: () => void
  className?: string
  layout?: 'horizontal' | 'vertical'
  showFilterCount?: boolean
}

export function FilterControls({
  filterGroups,
  activeFilters,
  onFilterChange,
  onClearAll,
  className,
  layout = 'vertical',
  showFilterCount = true
}: FilterControlsProps) {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const [expandedGroups, setExpandedGroups] = React.useState<string[]>([])

  // Toggle expanded state for filter groups
  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    )
  }

  // Check if a filter option is active
  const isFilterActive = (groupId: string, optionId: string) => {
    return activeFilters.some(filter => 
      filter.groupId === groupId && filter.optionId === optionId
    )
  }

  // Handle filter selection
  const handleFilterSelect = (groupId: string, optionId: string, value: string, checked: boolean) => {
    const group = filterGroups.find(g => g.id === groupId)
    const option = group?.options?.find(o => o.id === optionId)
    
    if (!group || !option) return

    onFilterChange(groupId, optionId, value, checked ? 'add' : 'remove')
  }

  // Handle range filter change
  const handleRangeChange = (groupId: string, minValue: string, maxValue: string) => {
    const rangeValue = `${minValue}-${maxValue}`
    onFilterChange(groupId, 'range', rangeValue, 'add')
  }

  // Remove specific filter
  const removeFilter = (filter: ActiveFilter) => {
    onFilterChange(filter.groupId, filter.optionId, filter.value, 'remove')
  }

  const totalActiveFilters = activeFilters.length

  return (
    <div className={cn("space-y-4", className)}>
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <h3 className="font-display font-bold tracking-wide uppercase text-foreground">
            Filters
          </h3>
          {showFilterCount && totalActiveFilters > 0 && (
            <Badge className="rounded-none bg-primary text-primary-foreground">
              {totalActiveFilters}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {totalActiveFilters > 0 && (
            <Button
              size="sm"
              variant="ghost"
              className="rounded-none text-xs"
              onClick={onClearAll}
            >
              Clear All
            </Button>
          )}
          
          {layout === 'horizontal' && (
            <Button
              size="sm"
              variant="outline"
              className="rounded-none border-2"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Filter className="h-3 w-3 mr-1" />
              {isExpanded ? 'Hide' : 'Show'} Filters
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters */}
      {totalActiveFilters > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
            Active Filters
          </p>
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter) => (
              <Badge
                key={`${filter.groupId}-${filter.optionId}`}
                variant="secondary"
                className="rounded-none bg-primary/10 text-primary border border-primary/20"
              >
                <span className="text-xs">
                  {filter.groupLabel}: {filter.optionLabel}
                </span>
                <button
                  className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                  onClick={() => removeFilter(filter)}
                >
                  <X className="h-2 w-2" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Filter Groups */}
      <div className={cn(
        "space-y-4",
        layout === 'horizontal' && !isExpanded && "hidden"
      )}>
        {filterGroups.map((group) => {
          const isGroupExpanded = expandedGroups.includes(group.id) || layout === 'horizontal'
          
          return (
            <div key={group.id} className="border border-border rounded-none">
              {/* Group Header */}
              <button
                className="w-full flex items-center justify-between p-3 text-left hover:bg-muted/20 transition-colors"
                onClick={() => toggleGroup(group.id)}
              >
                <span className="font-medium text-foreground text-sm tracking-wide uppercase">
                  {group.label}
                </span>
                <ChevronDown className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform",
                  isGroupExpanded && "rotate-180"
                )} />
              </button>

              {/* Group Content */}
              {isGroupExpanded && (
                <div className="p-3 border-t border-border bg-muted/5">
                  {/* Checkbox/Radio Options */}
                  {(group.type === 'checkbox' || group.type === 'radio') && group.options && (
                    <div className="space-y-2">
                      {group.options.map((option) => {
                        const isActive = isFilterActive(group.id, option.id)
                        
                        return (
                          <label
                            key={option.id}
                            className="flex items-center gap-2 cursor-pointer hover:bg-muted/10 p-1 rounded-none"
                          >
                            <input
                              type={group.type}
                              name={group.type === 'radio' ? group.id : undefined}
                              checked={isActive}
                              onChange={(e) => handleFilterSelect(group.id, option.id, option.value, e.target.checked)}
                              className="w-3 h-3 border border-input rounded-none"
                            />
                            <span className="text-sm text-foreground flex-1">
                              {option.label}
                            </span>
                            {option.count !== undefined && (
                              <span className="text-xs text-muted-foreground">
                                ({option.count})
                              </span>
                            )}
                          </label>
                        )
                      })}
                    </div>
                  )}

                  {/* Select Dropdown */}
                  {group.type === 'select' && group.options && (
                    <Select
                      options={group.options.map(opt => ({ value: opt.value, label: opt.label }))}
                      placeholder={`Select ${group.label.toLowerCase()}`}
                      className="rounded-none border-2"
                      onValueChange={(value) => {
                        const option = group.options?.find(opt => opt.value === value)
                        if (option) {
                          handleFilterSelect(group.id, option.id, value, true)
                        }
                      }}
                    />
                  )}

                  {/* Range Input */}
                  {group.type === 'range' && group.min !== undefined && group.max !== undefined && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-muted-foreground block mb-1">
                            Min
                          </label>
                          <Input
                            type="number"
                            min={group.min}
                            max={group.max}
                            step={group.step || 1}
                            placeholder={group.min.toString()}
                            className="rounded-none border-2 text-xs"
                            onChange={(e) => {
                              // Handle range change - would need to track both min and max
                              console.log('Min value:', e.target.value)
                            }}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground block mb-1">
                            Max
                          </label>
                          <Input
                            type="number"
                            min={group.min}
                            max={group.max}
                            step={group.step || 1}
                            placeholder={group.max.toString()}
                            className="rounded-none border-2 text-xs"
                            onChange={(e) => {
                              // Handle range change
                              console.log('Max value:', e.target.value)
                            }}
                          />
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground text-center">
                        Range: £{group.min} - £{group.max}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Results Count */}
      <div className="text-xs text-muted-foreground text-center py-2 border-t border-border">
        {totalActiveFilters > 0 ? (
          <span>Showing filtered results</span>
        ) : (
          <span>Showing all products</span>
        )}
      </div>
    </div>
  )
}