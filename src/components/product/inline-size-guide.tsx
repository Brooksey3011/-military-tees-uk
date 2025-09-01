"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Ruler, Info } from "lucide-react"
import { cn } from "@/lib/utils"

const sizeTables = {
  mens: {
    tshirts: [
      { size: "S", chest: "36-38", length: "27", shoulder: "17.5" },
      { size: "M", chest: "38-40", length: "28", shoulder: "18.5" },
      { size: "L", chest: "40-42", length: "29", shoulder: "19.5" },
      { size: "XL", chest: "42-44", length: "30", shoulder: "20.5" },
      { size: "XXL", chest: "44-46", length: "31", shoulder: "21.5" },
      { size: "3XL", chest: "46-48", length: "32", shoulder: "22.5" }
    ],
    hoodies: [
      { size: "S", chest: "38-40", length: "26", shoulder: "18" },
      { size: "M", chest: "40-42", length: "27", shoulder: "19" },
      { size: "L", chest: "42-44", length: "28", shoulder: "20" },
      { size: "XL", chest: "44-46", length: "29", shoulder: "21" },
      { size: "XXL", chest: "46-48", length: "30", shoulder: "22" },
      { size: "3XL", chest: "48-50", length: "31", shoulder: "23" }
    ]
  },
  womens: {
    tshirts: [
      { size: "S", chest: "32-34", length: "25", shoulder: "15.5" },
      { size: "M", chest: "34-36", length: "26", shoulder: "16.5" },
      { size: "L", chest: "36-38", length: "27", shoulder: "17.5" },
      { size: "XL", chest: "38-40", length: "28", shoulder: "18.5" },
      { size: "XXL", chest: "40-42", length: "29", shoulder: "19.5" }
    ],
    hoodies: [
      { size: "S", chest: "34-36", length: "24", shoulder: "16" },
      { size: "M", chest: "36-38", length: "25", shoulder: "17" },
      { size: "L", chest: "38-40", length: "26", shoulder: "18" },
      { size: "XL", chest: "40-42", length: "27", shoulder: "19" },
      { size: "XXL", chest: "42-44", length: "28", shoulder: "20" }
    ]
  },
  kids: {
    ages: [
      { size: "3-4 Years", chest: "22-23", length: "16", shoulder: "11" },
      { size: "5-6 Years", chest: "24-25", length: "17", shoulder: "11.5" },
      { size: "7-8 Years", chest: "26-27", length: "18", shoulder: "12" },
      { size: "9-11 Years", chest: "28-30", length: "19", shoulder: "12.5" },
      { size: "12-13 Years", chest: "31-32", length: "20", shoulder: "13" }
    ]
  }
}

const measurementGuide = [
  {
    title: "Chest/Bust",
    instruction: "Measure around the fullest part of your chest, keeping the measuring tape horizontal."
  },
  {
    title: "Length", 
    instruction: "Measure from the highest point of the shoulder down to the desired length."
  },
  {
    title: "Shoulder",
    instruction: "Measure from shoulder point to shoulder point across the back."
  }
]

interface InlineSizeGuideProps {
  productType?: 'tshirt' | 'hoodie' | 'polo' | 'tank' | 'jacket'
  className?: string
}

export function InlineSizeGuide({ 
  productType = 'tshirt',
  className 
}: InlineSizeGuideProps) {
  const [selectedGender, setSelectedGender] = useState("mens")

  const getSizeTable = (gender: string, type: string) => {
    const genderKey = gender as keyof typeof sizeTables
    if (gender === 'kids') {
      return sizeTables.kids.ages
    }
    
    const typeKey = type === 'hoodie' ? 'hoodies' : 'tshirts'
    return sizeTables[genderKey]?.[typeKey as keyof typeof sizeTables[typeof genderKey]] || []
  }

  return (
    <Card className={cn("border-border/50", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-display font-bold tracking-wide uppercase">
          <Ruler className="h-5 w-5 text-primary" />
          Size Guide
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={selectedGender} onValueChange={setSelectedGender}>
          <TabsList className="grid w-full grid-cols-3 rounded-none">
            <TabsTrigger value="mens" className="rounded-none">Men's</TabsTrigger>
            <TabsTrigger value="womens" className="rounded-none">Women's</TabsTrigger>
            <TabsTrigger value="kids" className="rounded-none">Kids</TabsTrigger>
          </TabsList>

          <TabsContent value="mens" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Badge variant="secondary" className="rounded-none">
                  {productType === 'hoodie' ? 'Hoodie' : 'T-Shirt'} Measurements
                </Badge>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b-2 border-border">
                      <th className="text-left py-3 px-2 font-display font-bold tracking-wide uppercase">Size</th>
                      <th className="text-left py-3 px-2 font-display font-bold tracking-wide uppercase">Chest (in)</th>
                      <th className="text-left py-3 px-2 font-display font-bold tracking-wide uppercase">Length (in)</th>
                      <th className="text-left py-3 px-2 font-display font-bold tracking-wide uppercase">Shoulder (in)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getSizeTable('mens', productType).map((row, index) => (
                      <tr key={index} className="border-b border-border/50 hover:bg-muted/50">
                        <td className="py-3 px-2 font-bold text-primary">{row.size}</td>
                        <td className="py-3 px-2">{row.chest}</td>
                        <td className="py-3 px-2">{row.length}</td>
                        <td className="py-3 px-2">{row.shoulder}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="womens" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Badge variant="secondary" className="rounded-none">
                  {productType === 'hoodie' ? 'Hoodie' : 'T-Shirt'} Measurements
                </Badge>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b-2 border-border">
                      <th className="text-left py-3 px-2 font-display font-bold tracking-wide uppercase">Size</th>
                      <th className="text-left py-3 px-2 font-display font-bold tracking-wide uppercase">Bust (in)</th>
                      <th className="text-left py-3 px-2 font-display font-bold tracking-wide uppercase">Length (in)</th>
                      <th className="text-left py-3 px-2 font-display font-bold tracking-wide uppercase">Shoulder (in)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getSizeTable('womens', productType).map((row, index) => (
                      <tr key={index} className="border-b border-border/50 hover:bg-muted/50">
                        <td className="py-3 px-2 font-bold text-primary">{row.size}</td>
                        <td className="py-3 px-2">{row.chest}</td>
                        <td className="py-3 px-2">{row.length}</td>
                        <td className="py-3 px-2">{row.shoulder}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="kids" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Badge variant="secondary" className="rounded-none">
                  Children's Sizes (By Age)
                </Badge>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b-2 border-border">
                      <th className="text-left py-3 px-2 font-display font-bold tracking-wide uppercase">Age</th>
                      <th className="text-left py-3 px-2 font-display font-bold tracking-wide uppercase">Chest (in)</th>
                      <th className="text-left py-3 px-2 font-display font-bold tracking-wide uppercase">Length (in)</th>
                      <th className="text-left py-3 px-2 font-display font-bold tracking-wide uppercase">Shoulder (in)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getSizeTable('kids', productType).map((row, index) => (
                      <tr key={index} className="border-b border-border/50 hover:bg-muted/50">
                        <td className="py-3 px-2 font-bold text-primary">{row.size}</td>
                        <td className="py-3 px-2">{row.chest}</td>
                        <td className="py-3 px-2">{row.length}</td>
                        <td className="py-3 px-2">{row.shoulder}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* How to Measure Section */}
        <div className="pt-6 border-t border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <Info className="h-4 w-4 text-primary" />
            <h3 className="font-display font-bold tracking-wide uppercase text-sm">How to Measure</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {measurementGuide.map((guide, index) => (
              <div key={index} className="space-y-2">
                <h4 className="font-semibold text-sm text-primary">{guide.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{guide.instruction}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Fit Information */}
        <div className="pt-4 border-t border-border/50">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Badge variant="outline" className="mb-2 rounded-none">Regular Fit</Badge>
              <p className="text-xs text-muted-foreground">
                Our garments are cut for a comfortable, regular fit. Perfect for everyday wear.
              </p>
            </div>
            <div>
              <Badge variant="outline" className="mb-2 rounded-none">Premium Materials</Badge>
              <p className="text-xs text-muted-foreground">
                Made from premium materials for comfort and durability.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}