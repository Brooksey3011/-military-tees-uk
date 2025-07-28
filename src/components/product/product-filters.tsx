"use client"

import * as React from "react"
import { Filter, X, ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import { cn, formatPrice } from "@/lib/utils"
import type { FilterOptions, Category } from "@/types"

interface ProductFiltersProps {
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
  categories: Category[]
  availableColors: string[]
  availableSizes: string[]
  priceRange: [number, number]
  className?: string
  compact?: boolean
}

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "name", label: "Name A-Z" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
]

export function ProductFilters({
  filters,
  onFiltersChange,
  categories,
  availableColors,
  availableSizes,
  priceRange,
  className,
  compact = false
}: ProductFiltersProps) {
  const [isOpen, setIsOpen] = React.useState(!compact)
  const [priceMin, setPriceMin] = React.useState(filters.priceRange[0])
  const [priceMax, setPriceMax] = React.useState(filters.priceRange[1])

  const handleCategoryToggle = (categorySlug: string) => {
    const newCategories = filters.categories.includes(categorySlug)
      ? filters.categories.filter(c => c !== categorySlug)
      : [...filters.categories, categorySlug]
    
    onFiltersChange({ ...filters, categories: newCategories })
  }

  const handleColorToggle = (color: string) => {
    const newColors = filters.colors.includes(color)
      ? filters.colors.filter(c => c !== color)
      : [...filters.colors, color]
    
    onFiltersChange({ ...filters, colors: newColors })
  }

  const handleSizeToggle = (size: string) => {
    const newSizes = filters.sizes.includes(size)
      ? filters.sizes.filter(s => s !== size)
      : [...filters.sizes, size]
    
    onFiltersChange({ ...filters, sizes: newSizes })
  }

  const handleSortChange = (sortBy: FilterOptions['sortBy']) => {
    onFiltersChange({ ...filters, sortBy })
  }

  const handlePriceRangeChange = () => {
    onFiltersChange({ 
      ...filters, 
      priceRange: [priceMin, priceMax === priceRange[1] ? Infinity : priceMax]
    })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      categories: [],
      colors: [],
      sizes: [],
      priceRange: [0, Infinity],
      sortBy: "newest"
    })
    setPriceMin(0)
    setPriceMax(priceRange[1])
  }

  const hasActiveFilters = 
    filters.categories.length > 0 ||
    filters.colors.length > 0 ||
    filters.sizes.length > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < Infinity

  const activeFilterCount = 
    filters.categories.length + 
    filters.colors.length + 
    filters.sizes.length +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < Infinity ? 1 : 0)

  return (
    <div className={cn("bg-card border rounded-lg", className)}>
      {/* Filter Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <h3 className="font-medium">Filters</h3>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={clearAllFilters}
              className="text-xs"
            >
              Clear all
            </Button>
          )}
          {compact && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
            >
              <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
            </Button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-6">
              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium mb-2">Sort By</label>
                <Select
                  options={sortOptions}
                  value={filters.sortBy}
                  onValueChange={(value) => handleSortChange(value as FilterOptions['sortBy'])}
                />
              </div>

              {/* Categories */}
              {categories.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2">Categories</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {categories.map((category) => (
                      <label 
                        key={category.id}
                        className="flex items-center space-x-2 cursor-pointer hover:bg-muted/50 p-1 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={filters.categories.includes(category.slug)}
                          onChange={() => handleCategoryToggle(category.slug)}
                          className="rounded border-border"
                        />
                        <span className="text-sm">{category.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Colors */}
              {availableColors.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2">Colors</label>
                  <div className="flex flex-wrap gap-2">
                    {availableColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => handleColorToggle(color)}
                        className={cn(
                          "w-8 h-8 rounded-full border-2 transition-all hover:scale-110",
                          filters.colors.includes(color)
                            ? "border-primary ring-2 ring-primary/20"
                            : "border-gray-300"
                        )}
                        style={{ backgroundColor: color.toLowerCase() }}
                        aria-label={`Toggle ${color}`}
                        title={color}
                      />
                    ))}
                  </div>
                  {filters.colors.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {filters.colors.map((color) => (
                        <Badge 
                          key={color}
                          variant="secondary"
                          className="text-xs"
                        >
                          {color}
                          <button
                            onClick={() => handleColorToggle(color)}
                            className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                          >
                            <X className="h-2 w-2" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Sizes */}
              {availableSizes.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2">Sizes</label>
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => handleSizeToggle(size)}
                        className={cn(
                          "px-3 py-1 text-sm border rounded transition-colors",
                          filters.sizes.includes(size)
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border hover:border-primary"
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium mb-2">Price Range</label>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={priceMin}
                      onChange={(e) => setPriceMin(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-20 px-2 py-1 text-sm border rounded"
                      placeholder="Min"
                      min="0"
                    />
                    <span className="text-sm text-muted-foreground">to</span>
                    <input
                      type="number"
                      value={priceMax}
                      onChange={(e) => setPriceMax(Math.max(priceMin, parseFloat(e.target.value) || priceRange[1]))}
                      className="w-20 px-2 py-1 text-sm border rounded"
                      placeholder="Max"
                      min={priceMin}
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handlePriceRangeChange}
                    className="w-full"
                  >
                    Apply Price Filter
                  </Button>
                  {(filters.priceRange[0] > 0 || filters.priceRange[1] < Infinity) && (
                    <div className="text-xs text-muted-foreground">
                      Showing: {formatPrice(filters.priceRange[0])} - {
                        filters.priceRange[1] === Infinity 
                          ? "No limit" 
                          : formatPrice(filters.priceRange[1])
                      }
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}