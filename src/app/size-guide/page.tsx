import { Metadata } from "next"
import { Ruler, User, AlertCircle, Shirt, ArrowRight } from "lucide-react"
import { Layout } from "@/components/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Size Guide | Military Tees UK",
  description: "Find your perfect fit with Military Tees UK size guide. Detailed measurements for men's and women's military apparel and sizing tips.",
  robots: {
    index: true,
    follow: true,
  }
}

export default function SizeGuidePage() {
  // Standardized size labels - no duplicates, consistent format
  const standardSizes = [
    { 
      size: "XS", 
      chestCm: "86-91", chestIn: "34-36",
      waistCm: "71-76", waistIn: "28-30", 
      lengthCm: "67", lengthIn: "26.5" 
    },
    { 
      size: "S", 
      chestCm: "91-97", chestIn: "36-38",
      waistCm: "76-81", waistIn: "30-32", 
      lengthCm: "70", lengthIn: "27.5" 
    },
    { 
      size: "M", 
      chestCm: "97-102", chestIn: "38-40",
      waistCm: "81-86", waistIn: "32-34", 
      lengthCm: "72", lengthIn: "28.5" 
    },
    { 
      size: "L", 
      chestCm: "102-107", chestIn: "40-42",
      waistCm: "86-91", waistIn: "34-36", 
      lengthCm: "75", lengthIn: "29.5" 
    },
    { 
      size: "XL", 
      chestCm: "107-112", chestIn: "42-44",
      waistCm: "91-97", waistIn: "36-38", 
      lengthCm: "78", lengthIn: "30.5" 
    },
    { 
      size: "XXL", 
      chestCm: "112-117", chestIn: "44-46",
      waistCm: "97-102", waistIn: "38-40", 
      lengthCm: "81", lengthIn: "31.5" 
    },
    { 
      size: "XXXL", 
      chestCm: "117-122", chestIn: "46-48",
      waistCm: "102-107", waistIn: "40-42", 
      lengthCm: "83", lengthIn: "32.5" 
    },
  ]

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <section className="border-b-2 border-border bg-muted/10">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <div className={cn(
                "inline-block p-4 mb-6",
                "border-2 border-primary rounded-none bg-background"
              )}>
                <Ruler className="h-12 w-12 text-primary mx-auto" />
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                Size Guide
              </h1>
              
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Find your perfect fit with our size guide. All measurements are designed for comfort and authentic military styling.
              </p>
            </div>
          </div>
        </section>

        {/* Size Guide Content */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* How to Measure */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <User className="h-5 w-5 text-green-600" />
                  How to Measure
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="font-bold text-green-700">1</span>
                    </div>
                    <h3 className="font-medium text-gray-900 mb-2">Chest</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Measure around the fullest part of your chest, keeping the tape horizontal and snug but not tight.
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="font-bold text-green-700">2</span>
                    </div>
                    <h3 className="font-medium text-gray-900 mb-2">Waist</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Measure around your natural waistline, typically the narrowest part of your torso.
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="font-bold text-green-700">3</span>
                    </div>
                    <h3 className="font-medium text-gray-900 mb-2">Length</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Measure from the highest point of your shoulder down to where you want the garment to end.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Main Size Chart - Clean Professional Table */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Shirt className="h-5 w-5 text-green-600" />
                  Size Chart
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 border-b border-gray-200">
                          Size
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 border-b border-gray-200">
                          Chest (cm/in)
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 border-b border-gray-200">
                          Waist (cm/in)
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 border-b border-gray-200">
                          Length (cm/in)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {standardSizes.map((row, index) => (
                        <tr key={row.size} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                              {row.size}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {row.chestCm} / {row.chestIn}"
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {row.waistCm} / {row.waistIn}"
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {row.lengthCm} / {row.lengthIn}"
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Sizing Tips */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-green-600" />
                  Sizing Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Between Sizes?</h4>
                      <p className="text-sm text-gray-600">We recommend sizing up for a more comfortable fit.</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Shrinkage</h4>
                      <p className="text-sm text-gray-600">Premium cotton may shrink up to 3% after first wash.</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Layering</h4>
                      <p className="text-sm text-gray-600">Consider sizing up if wearing layers underneath.</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Military Standard</h4>
                      <p className="text-sm text-gray-600">Sizing follows authentic military specifications.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact for Help */}
            <Card className="border border-gray-200 shadow-sm bg-green-50">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Still Unsure About Sizing?
                </h3>
                <p className="text-gray-600 mb-4">
                  Contact us for personalized sizing advice.
                </p>
                
                <div className="text-sm text-gray-600">
                  <p><strong>Email:</strong> info@militarytees.co.uk</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </Layout>
  )
}