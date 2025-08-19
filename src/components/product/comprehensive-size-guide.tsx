"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Ruler, Info, Users } from "lucide-react"

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

interface SizeGuideProps {
  trigger?: React.ReactNode
}

export function ComprehensiveSizeGuide({ trigger }: SizeGuideProps) {
  const [selectedGender, setSelectedGender] = useState("mens")

  const defaultTrigger = (
    <Button variant="outline" size="sm" className="gap-2">
      <Ruler className="h-4 w-4" />
      Size Guide
    </Button>
  )

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5" />
            Comprehensive Size Guide
          </DialogTitle>
        </DialogHeader>

        <Tabs value={selectedGender} onValueChange={setSelectedGender}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="mens">Men's</TabsTrigger>
            <TabsTrigger value="womens">Women's</TabsTrigger>
            <TabsTrigger value="kids">Kids</TabsTrigger>
          </TabsList>

          <TabsContent value="mens" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Men's T-Shirts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Size</th>
                          <th className="text-left py-2">Chest (inches)</th>
                          <th className="text-left py-2">Length (inches)</th>
                          <th className="text-left py-2">Shoulder (inches)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sizeTables.mens.tshirts.map((row, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-2 font-medium">{row.size}</td>
                            <td className="py-2">{row.chest}</td>
                            <td className="py-2">{row.length}</td>
                            <td className="py-2">{row.shoulder}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Men's Hoodies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Size</th>
                          <th className="text-left py-2">Chest (inches)</th>
                          <th className="text-left py-2">Length (inches)</th>
                          <th className="text-left py-2">Shoulder (inches)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sizeTables.mens.hoodies.map((row, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-2 font-medium">{row.size}</td>
                            <td className="py-2">{row.chest}</td>
                            <td className="py-2">{row.length}</td>
                            <td className="py-2">{row.shoulder}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="womens" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Women's T-Shirts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Size</th>
                          <th className="text-left py-2">Bust (inches)</th>
                          <th className="text-left py-2">Length (inches)</th>
                          <th className="text-left py-2">Shoulder (inches)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sizeTables.womens.tshirts.map((row, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-2 font-medium">{row.size}</td>
                            <td className="py-2">{row.chest}</td>
                            <td className="py-2">{row.length}</td>
                            <td className="py-2">{row.shoulder}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Women's Hoodies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Size</th>
                          <th className="text-left py-2">Bust (inches)</th>
                          <th className="text-left py-2">Length (inches)</th>
                          <th className="text-left py-2">Shoulder (inches)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sizeTables.womens.hoodies.map((row, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-2 font-medium">{row.size}</td>
                            <td className="py-2">{row.chest}</td>
                            <td className="py-2">{row.length}</td>
                            <td className="py-2">{row.shoulder}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="kids" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Children's Sizes (By Age)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Age</th>
                        <th className="text-left py-2">Chest (inches)</th>
                        <th className="text-left py-2">Length (inches)</th>
                        <th className="text-left py-2">Shoulder (inches)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sizeTables.kids.ages.map((row, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2 font-medium">{row.size}</td>
                          <td className="py-2">{row.chest}</td>
                          <td className="py-2">{row.length}</td>
                          <td className="py-2">{row.shoulder}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Measurement Guide */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              How to Measure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {measurementGuide.map((guide, index) => (
                <div key={index} className="space-y-2">
                  <h4 className="font-semibold">{guide.title}</h4>
                  <p className="text-sm text-muted-foreground">{guide.instruction}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Fit Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Fit Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Badge variant="secondary" className="mb-2">Regular Fit</Badge>
                <p className="text-sm text-muted-foreground">
                  Our t-shirts and hoodies are cut for a comfortable, regular fit. Not too tight, not too loose - perfect for everyday wear.
                </p>
              </div>
              <div>
                <Badge variant="secondary" className="mb-2">Premium Materials</Badge>
                <p className="text-sm text-muted-foreground">
                  Made from 100% combed cotton (t-shirts) and cotton-polyester blend (hoodies) for comfort and durability.
                </p>
              </div>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                <strong>Still unsure?</strong> Our customer service team is here to help. Contact us with your measurements and preferred fit, and we'll recommend the perfect size.
              </p>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}