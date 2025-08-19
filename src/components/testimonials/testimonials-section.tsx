"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Quote } from "lucide-react"

interface TestimonialProps {
  name: string
  rank?: string
  regiment?: string
  location: string
  rating: number
  text: string
  verified: boolean
}

const testimonials: TestimonialProps[] = [
  {
    name: "James M.",
    rank: "Former Corporal",
    regiment: "Royal Engineers",
    location: "Manchester",
    rating: 5,
    text: "Outstanding quality and authentic designs. The attention to detail really shows respect for military heritage.",
    verified: true
  },
  {
    name: "Sarah K.",
    location: "Edinburgh",
    rating: 5,
    text: "Bought the memorial design for my father. Beautiful quality and arrived quickly. Highly recommend.",
    verified: true
  },
  {
    name: "Mike P.",
    rank: "WO2",
    regiment: "Parachute Regiment",
    location: "Cardiff",
    rating: 5,
    text: "Finally, military gear that understands what we're about. Quality materials and proper designs.",
    verified: true
  },
  {
    name: "Lisa R.",
    location: "London",
    rating: 5,
    text: "Custom order process was excellent. They worked with me to create the perfect design for our unit reunion.",
    verified: true
  }
]

export function TestimonialsSection() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-display font-bold mb-4">
            What Our Community Says
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Trusted by military personnel, veterans, and their families across the UK
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-2 hover:border-primary transition-colors">
              <CardContent className="p-6">
                {/* Rating */}
                <div className="flex items-center mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < testimonial.rating
                          ? "fill-primary text-primary"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                  {testimonial.verified && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      Verified
                    </Badge>
                  )}
                </div>

                {/* Quote */}
                <div className="relative mb-4">
                  <Quote className="absolute -top-2 -left-1 h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground italic pl-4">
                    "{testimonial.text}"
                  </p>
                </div>

                {/* Customer Info */}
                <div className="border-t pt-4">
                  <p className="font-semibold text-sm">{testimonial.name}</p>
                  {testimonial.rank && testimonial.regiment && (
                    <p className="text-xs text-muted-foreground">
                      {testimonial.rank}, {testimonial.regiment}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Overall Statistics */}
        <div className="text-center mt-12 pt-8 border-t">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div>
              <div className="flex items-center justify-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-2xl font-bold">4.9/5</p>
              <p className="text-sm text-muted-foreground">Average Rating</p>
            </div>
            <div>
              <p className="text-2xl font-bold">500+</p>
              <p className="text-sm text-muted-foreground">Happy Customers</p>
            </div>
            <div>
              <p className="text-2xl font-bold">98%</p>
              <p className="text-sm text-muted-foreground">Would Recommend</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}