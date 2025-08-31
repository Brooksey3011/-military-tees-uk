"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import { 
  Filter, 
  X, 
  ChevronDown, 
  ChevronUp,
  Star,
  Palette,
  Shirt,
  Tag,
  Award,
  Users
} from "lucide-react"

interface FilterOptions {
  categories: string[]
  sizes: string[]
  colors: string[]
  priceRange: [number, number]
  rating: number
  inStock: boolean
  onSale: boolean
  newArrivals: boolean
  veteranDesigned: boolean
}

interface AdvancedFiltersProps {
  isOpen: boolean
  onToggle: () => void
  filters: Partial<FilterOptions>
  onFiltersChange: (filters: Partial<FilterOptions>) => void
  availableFilters: {
    categories: Array<{ id: string; name: string; count: number }>
    sizes: Array<{ id: string; name: string; count: number }>
    colors: Array<{ id: string; name: string; hex?: string; count: number }>
  }
  className?: string
}

// Individual Filter Section Component
function FilterSection({ 
  title, 
  icon: Icon, 
  children, 
  defaultExpanded = true 
}: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
  defaultExpanded?: boolean
}) {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded)
  
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between py-4 text-left hover:bg-gray-50 px-4 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-gray-600" />
          <span className="font-medium text-gray-900">{title}</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Color Swatch Component
function ColorSwatch({ 
  color, 
  isSelected, 
  onToggle 
}: {
  color: { id: string; name: string; hex?: string; count: number }
  isSelected: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors w-full text-left",
        isSelected && "bg-green-50 border border-green-200"
      )}
    >
      <div 
        className={cn(
          "w-4 h-4 rounded-full border-2",
          color.hex ? "border-gray-300" : "border-gray-400 bg-gray-200"
        )}
        style={color.hex ? { backgroundColor: color.hex } : {}}
      />
      <span className="text-sm text-gray-700 flex-1">{color.name}</span>
      <span className="text-xs text-gray-500">({color.count})</span>
    </button>
  )
}

// Size Button Component
function SizeButton({ 
  size, 
  isSelected, 
  onToggle 
}: {
  size: { id: string; name: string; count: number }
  isSelected: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "px-3 py-2 border rounded-lg text-sm font-medium transition-all",
        isSelected 
          ? "border-green-600 bg-green-50 text-green-700" 
          : "border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50"
      )}
    >
      {size.name}
      <span className="ml-1 text-xs text-gray-500">({size.count})</span>
    </button>
  )
}

// Active Filters Display
function ActiveFilters({ 
  filters, 
  onClearFilter, 
  onClearAll 
}: {
  filters: Partial<FilterOptions>
  onClearFilter: (filterType: string, value?: string) => void
  onClearAll: () => void
}) {
  const activeFiltersCount = React.useMemo(() => {
    let count = 0
    if (filters.categories?.length) count += filters.categories.length
    if (filters.sizes?.length) count += filters.sizes.length
    if (filters.colors?.length) count += filters.colors.length
    if (filters.priceRange) count += 1
    if (filters.rating) count += 1
    if (filters.inStock) count += 1
    if (filters.onSale) count += 1
    if (filters.newArrivals) count += 1
    if (filters.veteranDesigned) count += 1
    return count
  }, [
    filters.categories,
    filters.sizes, 
    filters.colors,
    filters.priceRange,
    filters.rating,
    filters.inStock,
    filters.onSale,
    filters.newArrivals,
    filters.veteranDesigned
  ])

  if (activeFiltersCount === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2 p-4 bg-gray-50 border-b border-gray-200">
      <span className="text-sm font-medium text-gray-700">Active filters:</span>
      
      {filters.categories?.map((category) => (
        <Badge
          key={category}
          variant="secondary"
          className="bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer"
          onClick={() => onClearFilter('categories', category)}
        >
          {category} <X className="ml-1 h-3 w-3" />
        </Badge>
      ))}
      
      {filters.sizes?.map((size) => (
        <Badge
          key={size}
          variant="secondary"
          className="bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer"
          onClick={() => onClearFilter('sizes', size)}
        >
          {size} <X className="ml-1 h-3 w-3" />
        </Badge>
      ))}
      
      {filters.colors?.map((color) => (
        <Badge
          key={color}
          variant="secondary"
          className="bg-purple-100 text-purple-800 hover:bg-purple-200 cursor-pointer"
          onClick={() => onClearFilter('colors', color)}
        >
          {color} <X className="ml-1 h-3 w-3" />
        </Badge>
      ))}
      
      {filters.onSale && (
        <Badge
          variant="secondary"
          className="bg-red-100 text-red-800 hover:bg-red-200 cursor-pointer"
          onClick={() => onClearFilter('onSale')}
        >
          On Sale <X className="ml-1 h-3 w-3" />
        </Badge>
      )}
      
      {filters.newArrivals && (
        <Badge
          variant="secondary"
          className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 cursor-pointer"
          onClick={() => onClearFilter('newArrivals')}
        >
          New Arrivals <X className="ml-1 h-3 w-3" />
        </Badge>
      )}
      
      {filters.veteranDesigned && (
        <Badge
          variant="secondary"
          className="bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer"
          onClick={() => onClearFilter('veteranDesigned')}
        >
          Veteran Designed <X className="ml-1 h-3 w-3" />
        </Badge>
      )}
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearAll}
        className="text-red-600 hover:text-red-800 hover:bg-red-50 ml-2"
      >
        Clear All
      </Button>
    </div>
  )
}

export default function AdvancedFilters({
  isOpen,
  onToggle,
  filters,
  onFiltersChange,
  availableFilters,
  className
}: AdvancedFiltersProps) {
  const handleFilterChange = (filterType: keyof FilterOptions, value: any) => {
    onFiltersChange({
      ...filters,
      [filterType]: value
    })
  }

  const handleArrayFilterToggle = (filterType: 'categories' | 'sizes' | 'colors', value: string) => {
    const currentArray = filters[filterType] || []
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value]
    
    handleFilterChange(filterType, newArray)
  }

  const handleClearFilter = (filterType: string, value?: string) => {
    if (value && (filterType === 'categories' || filterType === 'sizes' || filterType === 'colors')) {
      const currentArray = filters[filterType as keyof FilterOptions] as string[] || []
      const newArray = currentArray.filter(item => item !== value)
      handleFilterChange(filterType as keyof FilterOptions, newArray.length ? newArray : undefined)
    } else {
      handleFilterChange(filterType as keyof FilterOptions, undefined)
    }
  }

  const handleClearAll = () => {
    onFiltersChange({})
  }

  return (
    <div className={cn("relative", className)}>
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden">
        <Button
          onClick={onToggle}
          variant="outline"
          className="w-full mb-4 justify-center"
        >
          <Filter className="mr-2 h-4 w-4" />
          Filters
          {Object.keys(filters).length > 0 && (
            <Badge className="ml-2 bg-green-600">
              {Object.keys(filters).length}
            </Badge>
          )}
        </Button>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {(isOpen || window.innerWidth >= 1024) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:block"
          >
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-0">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filter Products
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggle}
                    className="lg:hidden"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="p-0">
                <ActiveFilters
                  filters={filters}
                  onClearFilter={handleClearFilter}
                  onClearAll={handleClearAll}
                />
                
                {/* Categories Filter */}
                <FilterSection title="Categories" icon={Tag}>
                  <div className="space-y-2">
                    {availableFilters.categories.map((category) => (
                      <label
                        key={category.id}
                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                      >
                        <Checkbox
                          checked={(filters.categories || []).includes(category.id)}
                          onCheckedChange={() => handleArrayFilterToggle('categories', category.id)}
                        />
                        <span className="text-sm text-gray-700 flex-1">{category.name}</span>
                        <span className="text-xs text-gray-500">({category.count})</span>
                      </label>
                    ))}
                  </div>
                </FilterSection>

                {/* Price Range Filter */}
                <FilterSection title="Price Range" icon={Tag}>
                  <div className="space-y-4">
                    <Slider
                      value={filters.priceRange || [0, 100]}
                      onValueChange={(value) => handleFilterChange('priceRange', value as [number, number])}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>£{filters.priceRange?.[0] || 0}</span>
                      <span>£{filters.priceRange?.[1] || 100}+</span>
                    </div>
                  </div>
                </FilterSection>

                {/* Sizes Filter */}
                <FilterSection title="Sizes" icon={Shirt}>
                  <div className="flex flex-wrap gap-2">
                    {availableFilters.sizes.map((size) => (
                      <SizeButton
                        key={size.id}
                        size={size}
                        isSelected={(filters.sizes || []).includes(size.id)}
                        onToggle={() => handleArrayFilterToggle('sizes', size.id)}
                      />
                    ))}
                  </div>
                </FilterSection>

                {/* Colors Filter */}
                <FilterSection title="Colors" icon={Palette}>
                  <div className="space-y-1">
                    {availableFilters.colors.map((color) => (
                      <ColorSwatch
                        key={color.id}
                        color={color}
                        isSelected={(filters.colors || []).includes(color.id)}
                        onToggle={() => handleArrayFilterToggle('colors', color.id)}
                      />
                    ))}
                  </div>
                </FilterSection>

                {/* Rating Filter */}
                <FilterSection title="Customer Rating" icon={Star}>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <label
                        key={rating}
                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                      >
                        <Checkbox
                          checked={(filters.rating || 0) === rating}
                          onCheckedChange={() => handleFilterChange('rating', rating)}
                        />
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "h-3 w-3",
                                i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                              )}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-700">& Up</span>
                      </label>
                    ))}
                  </div>
                </FilterSection>

                {/* Special Categories */}
                <FilterSection title="Special Categories" icon={Award}>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                      <Checkbox
                        checked={filters.newArrivals || false}
                        onCheckedChange={(checked) => handleFilterChange('newArrivals', checked)}
                      />
                      <span className="text-sm text-gray-700">New Arrivals</span>
                    </label>
                    
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                      <Checkbox
                        checked={filters.onSale || false}
                        onCheckedChange={(checked) => handleFilterChange('onSale', checked)}
                      />
                      <span className="text-sm text-gray-700">On Sale</span>
                    </label>
                    
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                      <Checkbox
                        checked={filters.veteranDesigned || false}
                        onCheckedChange={(checked) => handleFilterChange('veteranDesigned', checked)}
                      />
                      <div className="flex items-center gap-2">
                        <Users className="h-3 w-3" />
                        <span className="text-sm text-gray-700">Veteran Designed</span>
                      </div>
                    </label>
                    
                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                      <Checkbox
                        checked={filters.inStock || false}
                        onCheckedChange={(checked) => handleFilterChange('inStock', checked)}
                      />
                      <span className="text-sm text-gray-700">In Stock Only</span>
                    </label>
                  </div>
                </FilterSection>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}