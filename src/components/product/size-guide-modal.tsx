"use client"

import { useState, useEffect, useRef } from 'react'
import { X, Ruler, Info, Users, Shirt, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface SizeGuideModalProps {
  triggerClassName?: string
  productType?: 'tshirt' | 'hoodie' | 'polo' | 'tank' | 'jacket'
}

// Comprehensive size data for military apparel
const sizeCharts = {
  tshirt: {
    name: 'T-Shirts & Casual Wear',
    icon: Shirt,
    measurements: [
      { size: 'XS', chest: '34-36', length: '26', shoulders: '16.5', sleeves: '8' },
      { size: 'S', chest: '36-38', length: '27', shoulders: '17.5', sleeves: '8.5' },
      { size: 'M', chest: '38-40', length: '28', shoulders: '18.5', sleeves: '9' },
      { size: 'L', chest: '40-42', length: '29', shoulders: '20', sleeves: '9.5' },
      { size: 'XL', chest: '42-44', length: '30', shoulders: '21.5', sleeves: '10' },
      { size: '2XL', chest: '44-46', length: '31', shoulders: '23', sleeves: '10.5' },
      { size: '3XL', chest: '46-48', length: '32', shoulders: '24.5', sleeves: '11' },
    ]
  },
  hoodie: {
    name: 'Hoodies & Sweatshirts',
    icon: Shirt,
    measurements: [
      { size: 'XS', chest: '36-38', length: '25', shoulders: '17', sleeves: '24' },
      { size: 'S', chest: '38-40', length: '26', shoulders: '18', sleeves: '25' },
      { size: 'M', chest: '40-42', length: '27', shoulders: '19', sleeves: '26' },
      { size: 'L', chest: '42-44', length: '28', shoulders: '20.5', sleeves: '27' },
      { size: 'XL', chest: '44-46', length: '29', shoulders: '22', sleeves: '28' },
      { size: '2XL', chest: '46-48', length: '30', shoulders: '23.5', sleeves: '29' },
      { size: '3XL', chest: '48-50', length: '31', shoulders: '25', sleeves: '30' },
    ]
  },
  polo: {
    name: 'Polo Shirts',
    icon: Shirt,
    measurements: [
      { size: 'XS', chest: '34-36', length: '25.5', shoulders: '16', sleeves: '8.5' },
      { size: 'S', chest: '36-38', length: '26.5', shoulders: '17', sleeves: '9' },
      { size: 'M', chest: '38-40', length: '27.5', shoulders: '18', sleeves: '9.5' },
      { size: 'L', chest: '40-42', length: '28.5', shoulders: '19.5', sleeves: '10' },
      { size: 'XL', chest: '42-44', length: '29.5', shoulders: '21', sleeves: '10.5' },
      { size: '2XL', chest: '44-46', length: '30.5', shoulders: '22.5', sleeves: '11' },
      { size: '3XL', chest: '46-48', length: '31.5', shoulders: '24', sleeves: '11.5' },
    ]
  }
}

const sizingTips = [
  {
    icon: Ruler,
    title: 'How to Measure',
    content: 'Use a soft measuring tape. For chest, measure around the fullest part. Keep tape parallel to the floor and snug but not tight.'
  },
  {
    icon: Users,
    title: 'Fit Guide',
    content: 'Our military-inspired apparel has a classic fit. If you prefer a looser fit, consider sizing up. For a more fitted look, stay true to size.'
  },
  {
    icon: Info,
    title: 'Between Sizes?',
    content: 'If you\'re between sizes, consider your preferred fit. Military personnel often prefer slightly roomier sizing for comfort and movement.'
  }
]

const fitTypes = [
  {
    name: 'Regular Fit',
    description: 'Classic military-inspired cut with room for movement',
    recommendation: 'True to size'
  },
  {
    name: 'Slim Fit',
    description: 'Closer to body while maintaining military aesthetic',
    recommendation: 'Size up if between sizes'
  },
  {
    name: 'Relaxed Fit',
    description: 'Comfortable, roomy fit inspired by military fatigues',
    recommendation: 'Can size down for closer fit'
  }
]

export function SizeGuideModal({ triggerClassName = "", productType = 'tshirt' }: SizeGuideModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('chart')
  const modalRef = useRef<HTMLDivElement>(null)
  
  const currentChart = sizeCharts[productType] || sizeCharts.tshirt

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Focus management
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const firstElement = focusableElements[0] as HTMLElement
      firstElement?.focus()
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`
            flex items-center gap-2 
            border-green-200 text-green-800 hover:bg-green-50 hover:text-green-900
            transition-all duration-200 font-medium
            ${triggerClassName}
          `}
          aria-label="Open size guide"
        >
          <Ruler className="h-4 w-4" />
          <span className="hidden sm:inline">Size Guide</span>
          <span className="sm:hidden">Sizes</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent 
        ref={modalRef}
        className="max-w-4xl w-[95vw] max-h-[90vh] overflow-hidden p-0 gap-0"
        aria-labelledby="size-guide-title"
        aria-describedby="size-guide-description"
      >
        {/* Header */}
        <DialogHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <currentChart.icon className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle 
                  id="size-guide-title" 
                  className="text-2xl font-bold text-white"
                >
                  Size Guide
                </DialogTitle>
                <p className="text-green-100 text-sm mt-1">
                  {currentChart.name} • Military Tees UK
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              UK Sizing
            </Badge>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-green-50 m-4 mb-0">
              <TabsTrigger value="chart" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                Size Chart
              </TabsTrigger>
              <TabsTrigger value="guide" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                Fit Guide
              </TabsTrigger>
              <TabsTrigger value="tips" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                Measuring Tips
              </TabsTrigger>
            </TabsList>

            <div className="p-6">
              {/* Size Chart Tab */}
              <TabsContent value="chart" className="mt-0 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-green-900">
                    {currentChart.name} - Measurements (inches)
                  </h3>
                  <p id="size-guide-description" className="text-sm text-muted-foreground">
                    All measurements are in inches. For the most accurate fit, compare with a similar garment you own.
                  </p>
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full border-collapse bg-white border border-green-200 rounded-lg overflow-hidden">
                    <thead className="bg-green-600 text-white">
                      <tr>
                        <th className="p-3 text-left font-semibold">Size</th>
                        <th className="p-3 text-left font-semibold">Chest</th>
                        <th className="p-3 text-left font-semibold">Length</th>
                        <th className="p-3 text-left font-semibold">Shoulders</th>
                        <th className="p-3 text-left font-semibold">Sleeves</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentChart.measurements.map((measurement, index) => (
                        <tr 
                          key={measurement.size}
                          className={`${index % 2 === 0 ? 'bg-green-50' : 'bg-white'} hover:bg-green-100 transition-colors`}
                        >
                          <td className="p-3 font-bold text-green-900">{measurement.size}</td>
                          <td className="p-3">{measurement.chest}"</td>
                          <td className="p-3">{measurement.length}"</td>
                          <td className="p-3">{measurement.shoulders}"</td>
                          <td className="p-3">{measurement.sleeves}"</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-3">
                  {currentChart.measurements.map((measurement) => (
                    <div key={measurement.size} className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-xl font-bold text-green-900">Size {measurement.size}</h4>
                        <Badge variant="outline" className="border-green-600 text-green-600">
                          UK Sizing
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Chest:</span>
                          <span className="font-medium">{measurement.chest}"</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Length:</span>
                          <span className="font-medium">{measurement.length}"</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Shoulders:</span>
                          <span className="font-medium">{measurement.shoulders}"</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Sleeves:</span>
                          <span className="font-medium">{measurement.sleeves}"</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Fit Guide Tab */}
              <TabsContent value="guide" className="mt-0 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-green-900">Fit Types</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose the fit that matches your preference and intended use.
                  </p>
                </div>

                <div className="space-y-4">
                  {fitTypes.map((fit, index) => (
                    <div key={fit.name} className="border border-green-200 rounded-lg p-4 bg-green-50/50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-green-900 mb-1">{fit.name}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{fit.description}</p>
                          <div className="flex items-center gap-2">
                            <ChevronRight className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-800">
                              Recommendation: {fit.recommendation}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Military Fit Philosophy */}
                <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg p-6">
                  <h4 className="font-bold text-lg mb-2">Military Heritage Fit</h4>
                  <p className="text-green-100 text-sm leading-relaxed">
                    Our sizing reflects military heritage where comfort, durability, and freedom of movement are paramount. 
                    Built for those who serve and those who support them, every piece is designed with authentic military proportions in mind.
                  </p>
                </div>
              </TabsContent>

              {/* Measuring Tips Tab */}
              <TabsContent value="tips" className="mt-0 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-green-900">How to Measure Correctly</h3>
                  <p className="text-sm text-muted-foreground">
                    Follow these steps for the most accurate measurements.
                  </p>
                </div>

                <div className="space-y-4">
                  {sizingTips.map((tip, index) => (
                    <div key={index} className="flex gap-4 p-4 border border-green-200 rounded-lg bg-white">
                      <div className="flex-shrink-0">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <tip.icon className="h-5 w-5 text-green-600" />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-green-900 mb-1">{tip.title}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{tip.content}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Measurement Illustration */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h4 className="font-semibold text-green-900 mb-4">Key Measurement Points</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                        <span><strong>Chest:</strong> Around fullest part of chest</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                        <span><strong>Length:</strong> From highest shoulder point to bottom hem</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                        <span><strong>Shoulders:</strong> From seam to seam across shoulders</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                        <span><strong>Sleeves:</strong> From shoulder seam to cuff</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="border-t border-green-200 bg-green-50 px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              Need help? Contact our team for personalized sizing advice.
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsOpen(false)}
                className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
              >
                Close Guide
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Trigger button for use in product pages
export function SizeGuideButton({ 
  className = "",
  productType = 'tshirt',
  variant = 'prominent'
}: {
  className?: string
  productType?: 'tshirt' | 'hoodie' | 'polo' | 'tank' | 'jacket'
  variant?: 'prominent' | 'subtle'
}) {
  if (variant === 'prominent') {
    return (
      <SizeGuideModal 
        triggerClassName={`
          bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800
          border-none shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200
          font-semibold px-4 py-2 ${className}
        `}
        productType={productType}
      />
    )
  }

  return (
    <SizeGuideModal 
      triggerClassName={className}
      productType={productType}
    />
  )
}