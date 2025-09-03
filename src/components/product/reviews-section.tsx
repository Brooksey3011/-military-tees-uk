"use client"

import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ReviewDisplay } from './review-display'
import { ReviewForm } from './review-form'
import { MessageSquarePlus, Star } from 'lucide-react'

interface ReviewsSectionProps {
  productId: string
  productName: string
  className?: string
}

export function ReviewsSection({ productId, productName, className }: ReviewsSectionProps) {
  const [activeTab, setActiveTab] = useState("reviews")

  const handleReviewSubmitted = () => {
    // Switch back to reviews tab after successful submission
    setActiveTab("reviews")
    // Trigger a refresh of the reviews display
    window.location.reload() // Simple approach - could be improved with state management
  }

  return (
    <div className={className}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 rounded-none h-12">
          <TabsTrigger 
            value="reviews" 
            className="rounded-none font-display font-bold tracking-wide uppercase data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Star className="h-4 w-4 mr-2" />
            Reviews
          </TabsTrigger>
          <TabsTrigger 
            value="write-review" 
            className="rounded-none font-display font-bold tracking-wide uppercase data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <MessageSquarePlus className="h-4 w-4 mr-2" />
            Write Review
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reviews" className="mt-6">
          <ReviewDisplay 
            productId={productId}
            className="border-0 shadow-none p-0"
          />
        </TabsContent>

        <TabsContent value="write-review" className="mt-6">
          <ReviewForm
            productId={productId}
            productName={productName}
            onSubmit={handleReviewSubmitted}
            className="border-0 shadow-none"
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}