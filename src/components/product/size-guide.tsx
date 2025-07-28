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
  const adultSizes = [
    { size: "XS", chest: "34-36\"", waist: "28-30\"", length: "27\"", uk: "6-8", eu: "34-36" },
    { size: "S", chest: "36-38\"", waist: "30-32\"", length: "28\"", uk: "8-10", eu: "36-38" },
    { size: "M", chest: "38-40\"", waist: "32-34\"", length: "29\"", uk: "10-12", eu: "38-40" },
    { size: "L", chest: "40-42\"", waist: "34-36\"", length: "30\"", uk: "12-14", eu: "40-42" },
    { size: "XL", chest: "42-44\"", waist: "36-38\"", length: "31\"", uk: "14-16", eu: "42-44" },
    { size: "XXL", chest: "44-46\"", waist: "38-40\"", length: "32\"", uk: "16-18", eu: "44-46" },
    { size: "XXXL", chest: "46-48\"", waist: "40-42\"", length: "33\"", uk: "18-20", eu: "46-48" }
  ]

  const kidsSizes = [
    { size: "2-3Y", chest: "20-21\"", length: "14-15\"", age: "2-3 Years", weight: "24-34 lbs" },
    { size: "4-5Y", chest: "22-23\"", length: "16-17\"", age: "4-5 Years", weight: "35-45 lbs" },
    { size: "6-7Y", chest: "24-25\"", length: "18-19\"", age: "6-7 Years", weight: "46-56 lbs" },
    { size: "8-9Y", chest: "26-28\"", length: "20-21\"", age: "8-9 Years", weight: "57-72 lbs" },
    { size: "10-11Y", chest: "29-31\"", length: "22-23\"", age: "10-11 Years", weight: "73-95 lbs" },
    { size: "12-13Y", chest: "32-34\"", length: "24-25\"", age: "12-13 Years", weight: "96-125 lbs" },
    { size: "14-15Y", chest: "35-37\"", length: "26-27\"", age: "14-15 Years", weight: "126-150 lbs" }
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
          <div className="flex items-center gap-2">
            <Ruler className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-display font-bold">
              {category === "kids" ? "Kids" : "Adult"} Size Guide
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-none"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-6">
          {/* Size Chart */}
          <Card className="border-2 border-border rounded-none">
            <CardHeader>
              <CardTitle className="font-display tracking-wide uppercase">
                Size Chart
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 font-display font-bold uppercase">Size</th>
                      <th className="text-left p-3 font-display font-bold uppercase">Chest</th>
                      {category === "adult" ? (
                        <>
                          <th className="text-left p-3 font-display font-bold uppercase">Waist</th>
                          <th className="text-left p-3 font-display font-bold uppercase">Length</th>
                          <th className="text-left p-3 font-display font-bold uppercase">UK Size</th>
                          <th className="text-left p-3 font-display font-bold uppercase">EU Size</th>
                        </>
                      ) : (
                        <>
                          <th className="text-left p-3 font-display font-bold uppercase">Length</th>
                          <th className="text-left p-3 font-display font-bold uppercase">Age</th>
                          <th className="text-left p-3 font-display font-bold uppercase">Weight</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {sizes.map((size, index) => (
                      <tr key={size.size} className="border-b border-border/50 hover:bg-muted/10">
                        <td className="p-3">
                          <Badge className="rounded-none font-bold">
                            {size.size}
                          </Badge>
                        </td>
                        <td className="p-3 font-medium">{size.chest}</td>
                        {category === "adult" ? (
                          <>
                            <td className="p-3">{(size as any).waist}</td>
                            <td className="p-3">{size.length}</td>
                            <td className="p-3">{(size as any).uk}</td>
                            <td className="p-3">{(size as any).eu}</td>
                          </>
                        ) : (
                          <>
                            <td className="p-3">{size.length}</td>
                            <td className="p-3">{(size as any).age}</td>
                            <td className="p-3 text-muted-foreground">{(size as any).weight}</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Size Descriptions */}
          <Card className="border-2 border-border rounded-none">
            <CardHeader>
              <CardTitle className="font-display tracking-wide uppercase">
                Size Descriptions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(sizeDescriptions[category] as any).map(([size, description]) => (
                  <div key={size} className="border border-border/30 p-3 rounded-none">
                    <div className="font-bold text-primary mb-1">{size}</div>
                    <div className="text-sm text-muted-foreground">{description}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Measurement Tips */}
          <Card className="border-2 border-border rounded-none bg-primary/5">
            <CardHeader>
              <CardTitle className="font-display tracking-wide uppercase flex items-center gap-2">
                <Ruler className="h-4 w-4" />
                How to Measure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {measurementTips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-4 p-3 bg-muted/20 rounded-none border-l-4 border-primary">
                <h4 className="font-display font-bold mb-1">Need Help?</h4>
                <p className="text-sm text-muted-foreground">
                  Still unsure about sizing? Contact our customer service team for personalized sizing advice.
                </p>
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