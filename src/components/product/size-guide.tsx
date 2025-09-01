"use client"

import * as React from "react"
import { Ruler, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Modal } from "@/components/ui/modal"
import { cn } from "@/lib/utils"

interface SizeGuideProps {
  isOpen: boolean
  onClose: () => void
  category?: "adult" | "kids" | "unisex"
}

export function SizeGuide({ isOpen, onClose, category = "adult" }: SizeGuideProps) {
  // Standardized adult sizes with both cm and inches
  const adultSizes = [
    { 
      size: "XS", 
      chestCm: "86-91", chestIn: "34-36",
      waistCm: "71-76", waistIn: "28-30", 
      lengthCm: "69", lengthIn: "27"
    },
    { 
      size: "S", 
      chestCm: "91-97", chestIn: "36-38",
      waistCm: "76-81", waistIn: "30-32", 
      lengthCm: "71", lengthIn: "28"
    },
    { 
      size: "M", 
      chestCm: "97-102", chestIn: "38-40",
      waistCm: "81-86", waistIn: "32-34", 
      lengthCm: "74", lengthIn: "29"
    },
    { 
      size: "L", 
      chestCm: "102-107", chestIn: "40-42",
      waistCm: "86-91", waistIn: "34-36", 
      lengthCm: "76", lengthIn: "30"
    },
    { 
      size: "XL", 
      chestCm: "107-112", chestIn: "42-44",
      waistCm: "91-97", waistIn: "36-38", 
      lengthCm: "79", lengthIn: "31"
    },
    { 
      size: "XXL", 
      chestCm: "112-117", chestIn: "44-46",
      waistCm: "97-102", waistIn: "38-40", 
      lengthCm: "81", lengthIn: "32"
    },
    { 
      size: "XXXL", 
      chestCm: "117-122", chestIn: "46-48",
      waistCm: "102-107", waistIn: "40-42", 
      lengthCm: "84", lengthIn: "33"
    }
  ]

  const kidsSizes = [
    { size: "2-3Y", chestCm: "51-53", chestIn: "20-21", lengthCm: "36-38", lengthIn: "14-15", age: "2-3 Years" },
    { size: "4-5Y", chestCm: "56-58", chestIn: "22-23", lengthCm: "41-43", lengthIn: "16-17", age: "4-5 Years" },
    { size: "6-7Y", chestCm: "61-64", chestIn: "24-25", lengthCm: "46-48", lengthIn: "18-19", age: "6-7 Years" },
    { size: "8-9Y", chestCm: "66-71", chestIn: "26-28", lengthCm: "51-53", lengthIn: "20-21", age: "8-9 Years" },
    { size: "10-11Y", chestCm: "74-79", chestIn: "29-31", lengthCm: "56-58", lengthIn: "22-23", age: "10-11 Years" },
    { size: "12-13Y", chestCm: "81-86", chestIn: "32-34", lengthCm: "61-64", lengthIn: "24-25", age: "12-13 Years" },
    { size: "14-15Y", chestCm: "89-94", chestIn: "35-37", lengthCm: "66-69", lengthIn: "26-27", age: "14-15 Years" }
  ]

  const sizes = category === "kids" ? kidsSizes : adultSizes

  const sizeDescriptions = {
    adult: {
      XS: "Extra Small - Fitted cut, ideal for slim builds",
      S: "Small - Regular fit with comfortable room",
      M: "Medium - Standard fit for most body types",
      L: "Large - Relaxed fit with extra room",
      XL: "Extra Large - Comfortable loose fit",
      XXL: "2X Large - Generous fit for larger builds",
      XXXL: "3X Large - Maximum comfort fit"
    },
    kids: {
      "2-3Y": "Perfect for toddlers - comfortable and roomy",
      "4-5Y": "Pre-school age - active kids fit",
      "6-7Y": "School age - durable everyday wear",
      "8-9Y": "Growing kids - room for growth",
      "10-11Y": "Pre-teen - comfortable casual fit",
      "12-13Y": "Teen - stylish comfortable fit",
      "14-15Y": "Older teen - adult-style fit"
    }
  }

  const measurementTips = [
    "Measure around the fullest part of your chest",
    "Keep the tape measure level and snug but not tight",
    "For length, measure from shoulder to desired hem",
    "If between sizes, we recommend sizing up for comfort",
    "All measurements are approximate and may vary by style"
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            {category === "kids" ? "Kids" : ""} Size Guide
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Intro text */}
        <p className="text-gray-600 mb-6 text-center">
          Find your perfect fit with our size guide.
        </p>

        <div className="space-y-6">
          {/* Size Chart */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <CardTitle className="text-lg font-semibold text-gray-900">
                Size Chart
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-200">
                        Size
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-200">
                        Chest (cm/in)
                      </th>
                      {category === "adult" ? (
                        <>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-200">
                            Waist (cm/in)
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-200">
                            Length (cm/in)
                          </th>
                        </>
                      ) : (
                        <>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-200">
                            Length (cm/in)
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-200">
                            Age
                          </th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sizes.map((size, index) => (
                      <tr key={size.size} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            {size.size}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                          {(size as any).chestCm} / {(size as any).chestIn}"
                        </td>
                        {category === "adult" ? (
                          <>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                              {(size as any).waistCm} / {(size as any).waistIn}"
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                              {(size as any).lengthCm} / {(size as any).lengthIn}"
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                              {(size as any).lengthCm} / {(size as any).lengthIn}"
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                              {(size as any).age}
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Measurement Tips */}
          <Card className="border border-gray-200 shadow-sm bg-gray-50">
            <CardContent className="p-4">
              <h3 className="font-medium text-gray-900 mb-3">Sizing Tips</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <p><strong>Between sizes?</strong> We recommend sizing up.</p>
                </div>
                <div>
                  <p><strong>Questions?</strong> Contact us at info@militarytees.co.uk</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Modal>
  )
}

interface SizeGuideButtonProps {
  category?: "adult" | "kids" | "unisex"
  className?: string
}

export function SizeGuideButton({ category = "adult", className }: SizeGuideButtonProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <>
      <Button
        variant="link"
        size="sm"
        onClick={() => setIsOpen(true)}
        className={cn("text-primary hover:text-primary/80 p-0 h-auto underline", className)}
      >
        <Ruler className="h-3 w-3 mr-1" />
        Size Guide
      </Button>
      
      <SizeGuide
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        category={category}
      />
    </>
  )
}