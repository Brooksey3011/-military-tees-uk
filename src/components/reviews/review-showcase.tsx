"use client"

import * as React from "react"
import { Star, Quote, User, CheckCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Review {
  id: string
  customerName: string
  rating: number
  comment: string
  productName: string
  verified: boolean
  date: string
  location?: string
}

// Mock reviews data - Force Wear style
const mockReviews: Review[] = [
  {
    id: "1",
    customerName: "Mark S.",
    rating: 5,
    comment: "Outstanding quality! As a former Royal Marine, I appreciate the attention to detail and authentic military styling. The fabric is comfortable and the print quality is excellent.",
    productName: "Royal Marine Commando Tee",
    verified: true,
    date: "2024-01-15",
    location: "Portsmouth"
  },
  {
    id: "2", 
    customerName: "Sarah T.",
    rating: 5,
    comment: "Bought this as a gift for my husband who served in Afghanistan. He absolutely loves it! Fast delivery and perfect fit. Will definitely order again.",
    productName: "SAS Regiment Elite Tee",
    verified: true,
    date: "2024-01-10",
    location: "Edinburgh"
  },
  {
    id: "3",
    customerName: "James H.",
    rating: 5,
    comment: "Top quality military apparel. The designs are respectful and authentic. Great customer service too - had a query and they responded within hours.",
    productName: "Paratrooper Wings Design",
    verified: true,
    date: "2024-01-08",
    location: "Manchester"
  },
  {
    id: "4",
    customerName: "Lisa M.",
    rating: 5,
    comment: "Excellent quality and very comfortable to wear. The military heritage designs are tasteful and well-executed. Highly recommend!",
    productName: "Army Medic Corps Tribute",
    verified: true,
    date: "2024-01-05",
    location: "London"
  }
]

export function ReviewShowcase() {
  const [currentReview, setCurrentReview] = React.useState(0)
  
  // Auto-rotate reviews
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentReview(prev => (prev + 1) % mockReviews.length)
    }, 5000)
    
    return () => clearInterval(interval)
  }, [])

  const averageRating = 4.8
  const totalReviews = 537

  return (
    <section className="py-16 bg-gradient-to-br from-muted/50 to-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-6 w-6",
                    i < Math.floor(averageRating) 
                      ? "text-[#FFAD02] fill-current" 
                      : "text-gray-300"
                  )}
                />
              ))}
            </div>
            <span className="text-2xl font-bold">{averageRating}</span>
          </div>
          
          <h2 className="text-3xl font-display font-bold mb-2">
            What Our Customers Say
          </h2>
          
          <p className="text-muted-foreground">
            Based on <strong>{totalReviews}+ verified reviews</strong> from military personnel and enthusiasts
          </p>
        </div>

        {/* Featured Review */}
        <div className="max-w-4xl mx-auto mb-12">
          <Card className="border-2 border-border bg-background/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <Quote className="h-8 w-8 text-[#FFAD02] flex-shrink-0 mt-1" />
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-4 w-4",
                          i < mockReviews[currentReview].rating 
                            ? "text-[#FFAD02] fill-current" 
                            : "text-gray-300"
                        )}
                      />
                    ))}
                  </div>
                  
                  <blockquote className="text-lg leading-relaxed mb-4 italic">
                    "{mockReviews[currentReview].comment}"
                  </blockquote>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#FFAD02] rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-black" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            {mockReviews[currentReview].customerName}
                          </span>
                          {mockReviews[currentReview].verified && (
                            <Badge variant="outline" className="text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {mockReviews[currentReview].location} • {mockReviews[currentReview].date}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      Product: <span className="font-medium">{mockReviews[currentReview].productName}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Review Navigation Dots */}
        <div className="flex justify-center gap-2 mb-8">
          {mockReviews.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentReview(index)}
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-300",
                index === currentReview 
                  ? "bg-[#FFAD02] scale-110" 
                  : "bg-gray-300 hover:bg-gray-400"
              )}
              aria-label={`Show review ${index + 1}`}
            />
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold text-[#FFAD02] mb-2">
              {totalReviews}+
            </div>
            <div className="text-sm text-muted-foreground uppercase tracking-wide">
              Verified Reviews
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold text-[#FFAD02] mb-2">
              {averageRating}★
            </div>
            <div className="text-sm text-muted-foreground uppercase tracking-wide">
              Average Rating
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold text-[#FFAD02] mb-2">
              96%
            </div>
            <div className="text-sm text-muted-foreground uppercase tracking-wide">
              Recommend Us
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}