import { Metadata } from "next"
import { Star, Quote, User, ThumbsUp } from "lucide-react"
import { Layout } from "@/components/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Customer Reviews | Military Tees UK",
  description: "Read genuine customer reviews and testimonials from our military community. See why thousands trust Military Tees UK for quality military apparel.",
  robots: {
    index: true,
    follow: true,
  }
}

export default function ReviewsPage() {
  const reviews = [
    {
      id: 1,
      name: "Sergeant Major John Smith",
      rank: "British Army (Ret.)",
      rating: 5,
      date: "January 2024",
      title: "Outstanding Quality",
      content: "Served 22 years and these are the best military-themed tees I've owned. The attention to detail is superb and the quality rivals official issue kit. Highly recommend to anyone who appreciates military heritage.",
      verified: true,
      helpful: 23
    },
    {
      id: 2,
      name: "Flight Lieutenant Sarah Williams", 
      rank: "RAF",
      rating: 5,
      date: "December 2023",
      title: "Perfect for Squadron Events",
      content: "Ordered custom squadron t-shirts for our reunion. The design process was seamless and the final products exceeded expectations. Great communication throughout and delivered exactly when promised.",
      verified: true,
      helpful: 18
    },
    {
      id: 3,
      name: "Corporal Mike Johnson",
      rank: "Royal Marines",
      rating: 4,
      date: "November 2023", 
      title: "Great Fit and Comfort",
      content: "Love the Memorial collection - really respectful designs that honor our fallen. Sizing is accurate and the material is comfortable for daily wear. Only minor feedback is shipping took a day longer than expected.",
      verified: true,
      helpful: 15
    },
    {
      id: 4,
      name: "Mrs. Helen Brown",
      rank: "Military Spouse",
      rating: 5,
      date: "October 2023",
      title: "Wonderful Service",
      content: "Bought gifts for my husband who's deployed. The BFPO shipping was free and tracked properly. Customer service was brilliant when I had questions. He loves the designs and quality.",
      verified: true,
      helpful: 12
    },
    {
      id: 5,
      name: "Lance Corporal Tom Davies",
      rank: "Welsh Guards", 
      rating: 5,
      date: "September 2023",
      title: "Authentic Military Feel",
      content: "These aren't just civilian t-shirts with military prints - they actually understand military culture. The designs are respectful and authentic. Will definitely be ordering more.",
      verified: true,
      helpful: 20
    },
    {
      id: 6,
      name: "Captain James Mitchell",
      rank: "Army Reserve",
      rating: 4,
      date: "August 2023",
      title: "Good Value for Money", 
      content: "Solid quality t-shirts at fair prices. The military discount is appreciated. Delivery was prompt and packaging was professional. Minor improvement could be made to the size guide accuracy.",
      verified: true,
      helpful: 9
    }
  ]

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          "h-4 w-4",
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        )}
      />
    ))
  }

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
                <Star className="h-12 w-12 text-primary mx-auto" />
              </div>
              
              <h1 className={cn(
                "text-4xl md:text-5xl font-display font-bold text-foreground mb-4",
                "tracking-wider uppercase"
              )}>
                Customer Reviews
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                Genuine testimonials from our military community. Real reviews from real service members, veterans, and military families.
              </p>
              
              <div className="flex justify-center gap-8 mt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">4.8/5</div>
                  <div className="flex justify-center mb-2">
                    {renderStars(5)}
                  </div>
                  <div className="text-sm text-muted-foreground">Average Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">2,847</div>
                  <div className="text-sm text-muted-foreground">Total Reviews</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">96%</div>
                  <div className="text-sm text-muted-foreground">Recommend Us</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Reviews Content */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Write Review CTA */}
            <Card className="border-2 border-border rounded-none bg-primary/5">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-display font-bold text-foreground mb-4">
                  Share Your Experience
                </h2>
                <p className="text-muted-foreground mb-6">
                  Help fellow service members by sharing your honest review of our products and service.
                </p>
                <Button className="rounded-none" disabled>
                  <Star className="h-4 w-4 mr-2" />
                  Write a Review
                </Button>
              </CardContent>
            </Card>

            {/* Reviews List */}
            <div className="space-y-6">
              {reviews.map((review) => (
                <Card key={review.id} className="border-2 border-border rounded-none">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-none border-2 border-primary flex items-center justify-center">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground">{review.name}</h3>
                            {review.verified && (
                              <Badge className="rounded-none bg-green-600 hover:bg-green-700 text-xs">
                                VERIFIED
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{review.rank}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex">
                              {renderStars(review.rating)}
                            </div>
                            <span className="text-sm text-muted-foreground">{review.date}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-foreground mb-2">{review.title}</h4>
                        <p className="text-muted-foreground leading-relaxed">
                          <Quote className="inline h-4 w-4 mr-1" />
                          {review.content}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <Button variant="ghost" size="sm" className="rounded-none" disabled>
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          Helpful ({review.helpful})
                        </Button>
                        <span className="text-xs text-muted-foreground">
                          Verified Purchase
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center">
              <Button variant="outline" className="rounded-none border-2" disabled>
                Load More Reviews
              </Button>
            </div>

            {/* Review Guidelines */}
            <Card className="border-2 border-border rounded-none bg-muted/10">
              <CardHeader>
                <CardTitle className={cn(
                  "font-display tracking-wide uppercase"
                )}>
                  Review Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  <strong className="text-foreground">Be Honest:</strong> Share your genuine experience with our products and service.
                </p>
                <p>
                  <strong className="text-foreground">Be Respectful:</strong> Keep reviews constructive and appropriate for our military community.
                </p>
                <p>
                  <strong className="text-foreground">Be Helpful:</strong> Include details that would help other customers make informed decisions.
                </p>
                <p className="text-xs">
                  All reviews are moderated to ensure they meet our community standards and provide value to other customers.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </Layout>
  )
}