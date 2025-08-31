"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SizeSelector } from '@/components/product/size-selector'
import { SizeGuideButton, SizeGuideModal } from '@/components/product/size-guide-modal'
import { Ruler, Smartphone, Monitor, Tablet, Info } from 'lucide-react'

// Mock size data for testing
const mockSizes = [
  { size: 'XS', label: 'Extra Small', stock: 15, isAvailable: true },
  { size: 'S', label: 'Small', stock: 8, isAvailable: true },
  { size: 'M', label: 'Medium', stock: 3, isAvailable: true },
  { size: 'L', label: 'Large', stock: 12, isAvailable: true },
  { size: 'XL', label: 'Extra Large', stock: 0, isAvailable: false },
  { size: '2XL', label: '2X Large', stock: 6, isAvailable: true },
  { size: '3XL', label: '3X Large', stock: 2, isAvailable: true }
]

const productTypes = [
  { id: 'tshirt', name: 'T-Shirts & Casual Wear', description: 'Standard fit military tees' },
  { id: 'hoodie', name: 'Hoodies & Sweatshirts', description: 'Warm and comfortable hoodies' },
  { id: 'polo', name: 'Polo Shirts', description: 'Smart-casual military polos' }
] as const

export default function SizeGuideTest() {
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [currentProductType, setCurrentProductType] = useState<'tshirt' | 'hoodie' | 'polo'>('tshirt')

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/30 to-white p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-3xl font-bold text-green-900 mb-2">
            Size Guide System Test
          </h1>
          <p className="text-green-700">
            Testing responsive size guide modal across all device sizes
          </p>
        </div>

        {/* Device Preview Info */}
        <Card className="border-2 border-blue-200 bg-blue-50/50">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div className="flex flex-col items-center gap-2">
                <Smartphone className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="font-semibold text-blue-900">Mobile</p>
                  <p className="text-sm text-blue-700">320px - 768px</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Tablet className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-semibold text-green-900">Tablet</p>
                  <p className="text-sm text-green-700">768px - 1024px</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Monitor className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="font-semibold text-purple-900">Desktop</p>
                  <p className="text-sm text-purple-700">1024px+</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Ruler className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="font-semibold text-orange-900">Modal</p>
                  <p className="text-sm text-orange-700">95vw max</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left: Size Selector Integration Test */}
          <div className="space-y-6">
            
            {/* Product Type Selector */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ruler className="h-5 w-5 text-green-600" />
                  Product Type Selection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {productTypes.map((type) => (
                  <div
                    key={type.id}
                    onClick={() => setCurrentProductType(type.id as any)}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      currentProductType === type.id
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 hover:border-green-300 hover:bg-green-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">{type.name}</h4>
                        <p className="text-sm text-gray-600">{type.description}</p>
                      </div>
                      {currentProductType === type.id && (
                        <Badge className="bg-green-600 text-white">Active</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Integrated Size Selector */}
            <Card>
              <CardHeader>
                <CardTitle className="text-green-800">
                  Size Selector with Integrated Guide
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  This shows how the size guide appears in actual product pages
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <SizeSelector
                  sizes={mockSizes}
                  selectedSize={selectedSize}
                  onSizeChange={setSelectedSize}
                  productType={currentProductType}
                />
              </CardContent>
            </Card>

            {/* Accessibility Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">♿ Accessibility Features</CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-2">
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Keyboard navigation (Tab, Enter, Escape)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Screen reader ARIA labels and descriptions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Focus management and trapping</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>High contrast colors for visibility</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Touch-friendly button sizes (44px minimum)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Standalone Components Test */}
          <div className="space-y-6">
            
            {/* Standalone Modal Triggers */}
            <Card>
              <CardHeader>
                <CardTitle className="text-green-800">Standalone Size Guide Buttons</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Different button variants for various use cases
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Prominent Button */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Prominent Button (Primary CTA)</h4>
                  <SizeGuideButton 
                    productType={currentProductType}
                    variant="prominent"
                    className="w-full sm:w-auto"
                  />
                  <p className="text-xs text-muted-foreground">
                    Use this for main product pages where size selection is critical
                  </p>
                </div>

                {/* Subtle Button */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Subtle Button (Secondary)</h4>
                  <SizeGuideButton 
                    productType={currentProductType}
                    variant="subtle"
                  />
                  <p className="text-xs text-muted-foreground">
                    Use this near size selectors or in product listings
                  </p>
                </div>

                {/* Direct Modal */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Custom Trigger</h4>
                  <SizeGuideModal productType={currentProductType}>
                    <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded text-sm font-medium transition-colors">
                      Custom Size Guide Trigger
                    </button>
                  </SizeGuideModal>
                  <p className="text-xs text-muted-foreground">
                    Use SizeGuideModal wrapper for custom button designs
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Responsive Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">📱 Responsive Design Features</CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-3">
                <div className="space-y-2">
                  <h5 className="font-semibold text-green-800">Mobile (&lt; 768px)</h5>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Modal takes 95% viewport width</li>
                    <li>• Size charts become stacked cards</li>
                    <li>• Touch-optimized button sizes</li>
                    <li>• Simplified tab navigation</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h5 className="font-semibold text-green-800">Desktop (&gt; 768px)</h5>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Modal max-width of 4xl (896px)</li>
                    <li>• Full data table with hover effects</li>
                    <li>• Side-by-side content layout</li>
                    <li>• Enhanced visual hierarchy</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* UX Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">🎯 UX Optimization Features</CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-3">
                <div className="space-y-2">
                  <h5 className="font-semibold text-green-800">Conversion Optimization</h5>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Prominent placement near size selectors</li>
                    <li>• Military heritage theme consistency</li>
                    <li>• Clear sizing recommendations</li>
                    <li>• Measurement visualization</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h5 className="font-semibold text-green-800">Return Reduction</h5>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Comprehensive measurement guides</li>
                    <li>• Fit type explanations</li>
                    <li>• Between-sizes recommendations</li>
                    <li>• Military-specific fit guidance</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Testing Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">🧪 Testing Checklist</CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" className="w-3 h-3" />
                    <span>Test on mobile device (&lt; 768px width)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" className="w-3 h-3" />
                    <span>Test on tablet device (768px - 1024px width)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" className="w-3 h-3" />
                    <span>Test on desktop (&gt; 1024px width)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" className="w-3 h-3" />
                    <span>Test keyboard navigation (Tab, Enter, Escape)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" className="w-3 h-3" />
                    <span>Test screen reader accessibility</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" className="w-3 h-3" />
                    <span>Test different product types (T-shirt, Hoodie, Polo)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" className="w-3 h-3" />
                    <span>Verify military theme consistency</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Selected Size Display */}
        {selectedSize && (
          <Card className="border-2 border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-4">
                <Info className="h-5 w-5 text-green-600" />
                <span className="text-green-900 font-medium">
                  You selected size: <Badge className="ml-2 bg-green-600">{selectedSize}</Badge>
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}