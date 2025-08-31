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
  const mensSizes = [
    { size: "XS", chest: "34-36", waist: "28-30", length: "26.5" },
    { size: "S", chest: "36-38", waist: "30-32", length: "27.5" },
    { size: "M", chest: "38-40", waist: "32-34", length: "28.5" },
    { size: "L", chest: "40-42", waist: "34-36", length: "29.5" },
    { size: "XL", chest: "42-44", waist: "36-38", length: "30.5" },
    { size: "XXL", chest: "44-46", waist: "38-40", length: "31.5" },
    { size: "3XL", chest: "46-48", waist: "40-42", length: "32.5" },
  ]

  const womensSizes = [
    { size: "XS", chest: "30-32", waist: "24-26", hips: "32-34", length: "24.5" },
    { size: "S", chest: "32-34", waist: "26-28", hips: "34-36", length: "25.5" },
    { size: "M", chest: "34-36", waist: "28-30", hips: "36-38", length: "26.5" },
    { size: "L", chest: "36-38", waist: "30-32", hips: "38-40", length: "27.5" },
    { size: "XL", chest: "38-40", waist: "32-34", hips: "40-42", length: "28.5" },
    { size: "XXL", chest: "40-42", waist: "34-36", hips: "42-44", length: "29.5" },
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
              
              <h1 className={cn(
                "text-4xl md:text-5xl font-display font-bold text-foreground mb-4",
                "tracking-wider uppercase"
              )}>
                Size Guide
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                Find your perfect military fit. Precision sizing for comfort and professional appearance.
              </p>
            </div>
          </div>
        </section>

        {/* Size Guide Content */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* How to Measure */}
            <Card className="border-2 border-border rounded-none bg-primary/5">
              <CardHeader>
                <CardTitle className={cn(
                  "font-display tracking-wide uppercase flex items-center gap-2"
                )}>
                  <User className="h-5 w-5 text-primary" />
                  How to Measure
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 bg-primary/10 rounded-none border-2 border-primary flex items-center justify-center">
                    <span className="font-bold text-primary">1</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Chest/Bust</h3>
                  <p className="text-sm text-muted-foreground">
                    Measure around the fullest part of your chest, keeping the tape horizontal and snug but not tight.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 bg-primary/10 rounded-none border-2 border-primary flex items-center justify-center">
                    <span className="font-bold text-primary">2</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Waist</h3>
                  <p className="text-sm text-muted-foreground">
                    Measure around your natural waistline, typically the narrowest part of your torso.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 bg-primary/10 rounded-none border-2 border-primary flex items-center justify-center">
                    <span className="font-bold text-primary">3</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Length</h3>
                  <p className="text-sm text-muted-foreground">
                    Measure from the highest point of your shoulder down to where you want the garment to end.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Men's Sizing */}
            <Card className="border-2 border-border rounded-none">
              <CardHeader>
                <CardTitle className={cn(
                  "font-display tracking-wide uppercase flex items-center gap-2"
                )}>
                  <Shirt className="h-5 w-5 text-primary" />
                  Men&apos;s Sizing Chart
                  <Badge className="rounded-none">UK Sizes</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-2 border-border">
                    <thead>
                      <tr className="bg-muted/20">
                        <th className="border-r-2 border-border p-3 text-left font-semibold">Size</th>
                        <th className="border-r-2 border-border p-3 text-left font-semibold">Chest (inches)</th>
                        <th className="border-r-2 border-border p-3 text-left font-semibold">Waist (inches)</th>
                        <th className="p-3 text-left font-semibold">Length (inches)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mensSizes.map((row, index) => (
                        <tr key={row.size} className={index % 2 === 0 ? "bg-background" : "bg-muted/5"}>
                          <td className="border-r-2 border-border p-3 font-medium">{row.size}</td>
                          <td className="border-r-2 border-border p-3">{row.chest}</td>
                          <td className="border-r-2 border-border p-3">{row.waist}</td>
                          <td className="p-3">{row.length}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Women's Sizing */}
            <Card className="border-2 border-border rounded-none">
              <CardHeader>
                <CardTitle className={cn(
                  "font-display tracking-wide uppercase flex items-center gap-2"
                )}>
                  <Shirt className="h-5 w-5 text-primary" />
                  Women&apos;s Sizing Chart
                  <Badge className="rounded-none">UK Sizes</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-2 border-border">
                    <thead>
                      <tr className="bg-muted/20">
                        <th className="border-r-2 border-border p-3 text-left font-semibold">Size</th>
                        <th className="border-r-2 border-border p-3 text-left font-semibold">Bust (inches)</th>
                        <th className="border-r-2 border-border p-3 text-left font-semibold">Waist (inches)</th>
                        <th className="border-r-2 border-border p-3 text-left font-semibold">Hips (inches)</th>
                        <th className="p-3 text-left font-semibold">Length (inches)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {womensSizes.map((row, index) => (
                        <tr key={row.size} className={index % 2 === 0 ? "bg-background" : "bg-muted/5"}>
                          <td className="border-r-2 border-border p-3 font-medium">{row.size}</td>
                          <td className="border-r-2 border-border p-3">{row.chest}</td>
                          <td className="border-r-2 border-border p-3">{row.waist}</td>
                          <td className="border-r-2 border-border p-3">{row.hips}</td>
                          <td className="p-3">{row.length}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Fit Guide */}
            <Card className="border-2 border-border rounded-none">
              <CardHeader>
                <CardTitle className={cn(
                  "font-display tracking-wide uppercase"
                )}>
                  Fit & Style Guide
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Military Fit</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                    <li>Tailored, professional appearance</li>
                    <li>Closer to body than civilian casual wear</li>
                    <li>Allows for movement without being loose</li>
                    <li>Suitable for tucking into trousers</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Casual Fit</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                    <li>More relaxed, comfortable fit</li>
                    <li>Slightly roomier through the body</li>
                    <li>Great for everyday wear</li>
                    <li>Available on selected styles</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Sizing Tips */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <Card className="border-2 border-border rounded-none">
                <CardHeader>
                  <CardTitle className={cn(
                    "font-display tracking-wide uppercase flex items-center gap-2"
                  )}>
                    <AlertCircle className="h-5 w-5 text-primary" />
                    Sizing Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <div>
                    <strong className="text-foreground">Between Sizes?</strong>
                    <p>We recommend sizing up for a more comfortable fit, especially for military-style garments.</p>
                  </div>
                  
                  <div>
                    <strong className="text-foreground">Shrinkage:</strong>
                    <p>Our premium cotton may shrink up to 5% after first wash. Pre-shrunk options available on select items.</p>
                  </div>
                  
                  <div>
                    <strong className="text-foreground">Layering:</strong>
                    <p>Consider sizing up if you plan to wear thermals or layers underneath.</p>
                  </div>
                  
                  <div>
                    <strong className="text-foreground">Military Standard:</strong>
                    <p>Our sizing follows military clothing specifications for authentic fit and appearance.</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-border rounded-none bg-muted/10">
                <CardHeader>
                  <CardTitle className={cn(
                    "font-display tracking-wide uppercase"
                  )}>
                    Size Exchange Policy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Not sure about your size? We offer free size exchanges within the UK for unworn items with tags attached.
                  </p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <ArrowRight className="h-3 w-3 text-primary" />
                      <span>Free UK returns and exchanges</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ArrowRight className="h-3 w-3 text-primary" />
                      <span>30-day return window</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ArrowRight className="h-3 w-3 text-primary" />
                      <span>Items must be unworn with tags</span>
                    </div>
                  </div>
                  
                  <Button className="w-full rounded-none" disabled>
                    Start Size Exchange
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Contact for Help */}
            <Card className="border-2 border-border rounded-none bg-primary/5">
              <CardHeader>
                <CardTitle className={cn(
                  "font-display tracking-wide uppercase text-center"
                )}>
                  Still Unsure About Sizing?
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Our team has extensive experience with military sizing and can help you find the perfect fit.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button className="rounded-none" disabled>
                    Chat with Sizing Expert
                  </Button>
                  <Button variant="outline" className="rounded-none border-2" disabled>
                    Email Size Question
                  </Button>
                </div>
                
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><strong>Email:</strong> info@militarytees.co.uk</p>
                  <p><strong>Phone:</strong> +44 1234 567890</p>
                  <p>Include your measurements and intended use for personalized recommendations</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </Layout>
  )
}