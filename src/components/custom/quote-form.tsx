"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageCircle, Phone, Mail, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ImageUpload } from './image-upload'

interface UploadedImage {
  id: string
  file: File
  preview: string
  uploading: boolean
  uploaded: boolean
  url?: string
}

const quoteSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  orderType: z.string().min(1, 'Please select an order type'),
  quantity: z.number().min(1, 'Quantity must be at least 1').max(10000, 'Quantity too high'),
  description: z.string().min(10, 'Please provide at least 10 characters').max(2000, 'Description too long'),
  urgentDeadline: z.boolean().optional(),
  budget: z.string().optional(),
  images: z.array(z.string()).optional(),
})

type QuoteFormData = z.infer<typeof quoteSchema>

interface QuoteFormProps {
  serviceType?: string
  onClose?: () => void
}

export function QuoteForm({ serviceType, onClose }: QuoteFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      orderType: serviceType || '',
    },
  })

  const onSubmit = async (data: QuoteFormData) => {
    setIsSubmitting(true)
    setError('')

    try {
      // Include uploaded image URLs in the submission
      const imageUrls = uploadedImages
        .filter(img => img.uploaded && img.url)
        .map(img => img.url!)

      const submitData = {
        ...data,
        images: imageUrls
      }

      const response = await fetch('/api/custom-quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        throw new Error('Failed to submit quote request')
      }

      setIsSubmitted(true)
      reset()
      setUploadedImages([])
    } catch (error) {
      setError('Failed to submit your request. Please try again or contact us directly.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImagesChange = (images: UploadedImage[]) => {
    setUploadedImages(images)
  }

  if (isSubmitted) {
    return (
      <Card className="border-2 border-green-500 rounded-none bg-green-50">
        <CardContent className="p-8 text-center">
          <div className="mx-auto bg-green-600 p-3 border-2 border-green-600 mb-4 w-fit">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-display font-bold text-green-800 mb-2">
            Quote Request Submitted!
          </h3>
          <p className="text-green-700 mb-4">
            Thank you for your interest! Our team will review your requirements and get back to you within 24 hours with a detailed quote.
          </p>
          <p className="text-sm text-green-600 mb-6">
            Reference ID: #{Math.random().toString(36).substr(2, 9).toUpperCase()}
          </p>
          <div className="space-y-2">
            <Button 
              onClick={() => setIsSubmitted(false)}
              variant="outline" 
              className="rounded-none border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white mr-2"
            >
              Submit Another Quote
            </Button>
            {onClose && (
              <Button 
                onClick={onClose}
                className="rounded-none bg-green-600 hover:bg-green-700"
              >
                Close
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-border rounded-none">
      <CardHeader>
        <CardTitle className="font-display tracking-wide uppercase flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Custom Order Quote Request
        </CardTitle>
        {serviceType && (
          <Badge className="w-fit rounded-none bg-primary text-primary-foreground">
            {serviceType} Service
          </Badge>
        )}
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Full Name *
              </label>
              <Input 
                {...register('name')}
                placeholder="Your full name"
                className="rounded-none border-2"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Email Address *
              </label>
              <Input 
                {...register('email')}
                type="email"
                placeholder="your.email@example.com"
                className="rounded-none border-2"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Phone Number
              </label>
              <Input 
                {...register('phone')}
                type="tel"
                placeholder="Your phone number"
                className="rounded-none border-2"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Estimated Quantity *
              </label>
              <Input 
                {...register('quantity', { valueAsNumber: true })}
                type="number"
                placeholder="How many pieces?"
                className="rounded-none border-2"
                min="1"
              />
              {errors.quantity && (
                <p className="text-sm text-destructive">{errors.quantity.message}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Order Type *
            </label>
            <select 
              {...register('orderType')}
              className={cn(
                "w-full px-3 py-2 border-2 border-border rounded-none",
                "bg-background text-foreground",
                "focus:border-primary focus:outline-none"
              )}
            >
              <option value="">Select order type</option>
              <option value="unit">Unit & Regiment Design</option>
              <option value="event">Commemorative Event</option>
              <option value="personal">Personal Design</option>
              <option value="other">Other</option>
            </select>
            {errors.orderType && (
              <p className="text-sm text-destructive">{errors.orderType.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Budget Range (Optional)
            </label>
            <select 
              {...register('budget')}
              className={cn(
                "w-full px-3 py-2 border-2 border-border rounded-none",
                "bg-background text-foreground",
                "focus:border-primary focus:outline-none"
              )}
            >
              <option value="">Select budget range</option>
              <option value="under-500">Under £500</option>
              <option value="500-1000">£500 - £1,000</option>
              <option value="1000-2500">£1,000 - £2,500</option>
              <option value="2500-5000">£2,500 - £5,000</option>
              <option value="over-5000">Over £5,000</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Project Description *
            </label>
            <textarea 
              {...register('description')}
              rows={4}
              placeholder="Tell us about your vision, requirements, specific details, colors, text, imagery, etc..."
              className={cn(
                "w-full px-3 py-2 border-2 border-border rounded-none",
                "bg-background text-foreground resize-none",
                "focus:border-primary focus:outline-none"
              )}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Design References (Optional)
            </label>
            <ImageUpload 
              onImagesChange={handleImagesChange}
              maxImages={5}
              maxFileSize={10}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <input 
              {...register('urgentDeadline')}
              type="checkbox"
              id="urgent"
              className="rounded-none"
            />
            <label htmlFor="urgent" className="text-sm text-foreground">
              This is an urgent request (additional fees may apply)
            </label>
          </div>
          
          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm p-3 border-2 border-destructive rounded-none bg-destructive/10">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
          
          <div className="pt-4 space-y-3">
            <Button 
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-none h-12 font-display font-bold tracking-wide uppercase"
            >
              {isSubmitting ? 'Submitting...' : 'Request Quote'}
            </Button>
            
            {onClose && (
              <Button 
                type="button"
                onClick={onClose}
                variant="outline"
                className="w-full rounded-none border-2"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
        
        {/* Contact Info */}
        <div className="mt-6 pt-6 border-t-2 border-border">
          <h4 className="font-medium text-foreground mb-3">Prefer to call or email?</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" />
              <span>+44 (0) 123 456 7890</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              <span>custom@militarytees.co.uk</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span>Response within 24 hours</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}