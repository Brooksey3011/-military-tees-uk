"use client"

import * as React from "react"
import Link from "next/link"
import { HelpCircle, Plus, Minus, Package, Truck, CreditCard, RefreshCw, Users, Shield } from "lucide-react"
import { Layout } from "@/components/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// Using simple div structure instead of Collapsible component
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export default function FAQPage() {
  // State to track which FAQ items are expanded
  const [expandedItems, setExpandedItems] = React.useState<string[]>([])

  // Function to toggle FAQ item expansion
  const toggleItem = (sectionId: string, questionIndex: number) => {
    const itemId = `${sectionId}-${questionIndex}`
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  // Function to check if item is expanded
  const isExpanded = (sectionId: string, questionIndex: number) => {
    const itemId = `${sectionId}-${questionIndex}`
    return expandedItems.includes(itemId)
  }
  const faqSections = [
    {
      id: "orders",
      title: "Orders & Payment",
      icon: Package,
      color: "text-blue-600",
      questions: [
        {
          question: "How do I place an order?",
          answer: "Browse our products, select your size and quantity, add to cart, and proceed to checkout. You can checkout as a guest or create an account for faster future orders."
        },
        {
          question: "What payment methods do you accept?",
          answer: "We accept all major credit and debit cards (Visa, Mastercard, American Express), PayPal, and Apple Pay through our secure Stripe payment system."
        },
        {
          question: "Can I modify or cancel my order?",
          answer: "Orders can be modified or cancelled within 2 hours of placement. After this, orders enter our fulfillment process. Contact us immediately if you need changes."
        },
        {
          question: "Do you offer military discounts?",
          answer: "Yes! We offer a 10% discount for active military, veterans, and their families. Verify your military status during checkout or contact us for assistance."
        }
      ]
    },
    {
      id: "shipping",
      title: "Shipping & Delivery",
      icon: Truck,
      color: "text-green-600",
      questions: [
        {
          question: "How long does shipping take?",
          answer: "UK Standard: 3-5 working days (free over £50). Express: 1-2 days. Next Day: Before 1PM next day. International shipping varies by location."
        },
        {
          question: "Do you ship internationally?",
          answer: "Yes! We ship worldwide. Europe: 7-14 days, Rest of World: 10-21 days. Express options available. Customs duties may apply to international orders."
        },
        {
          question: "Do you ship to BFPO addresses?",
          answer: "Absolutely! We proudly offer free shipping to BFPO addresses for our serving personnel. Processing time is 2-3 days, delivery varies by location."
        },
        {
          question: "How can I track my order?",
          answer: "You'll receive tracking information via email once your order ships. Use the tracking number on the carrier's website or our order tracking page."
        }
      ]
    },
    {
      id: "returns",
      title: "Returns & Exchanges",
      icon: RefreshCw,
      color: "text-orange-600",
      questions: [
        {
          question: "What is your return policy?",
          answer: "30-day return policy for unused items in original condition with tags. Free return shipping within the UK. Custom items cannot be returned unless defective."
        },
        {
          question: "How do I return an item?",
          answer: "Contact our returns team for a Return Authorization number, pack items with tags attached, and use our prepaid return label (UK only)."
        },
        {
          question: "Can I exchange for a different size?",
          answer: "Yes! We offer free size exchanges within the UK for unworn items with tags. The fastest way is to return and reorder your preferred size."
        },
        {
          question: "How long do refunds take?",
          answer: "Refunds are processed within 3-5 business days after we receive your return. Bank processing can take an additional 2-10 business days."
        }
      ]
    },
    {
      id: "products",
      title: "Products & Sizing",
      icon: Shield,
      color: "text-purple-600",
      questions: [
        {
          question: "How do your sizes run?",
          answer: "Our sizes follow UK standards. Check our size guide for detailed measurements. When in doubt, size up - military fit tends to be more fitted than civilian clothing."
        },
        {
          question: "What materials do you use?",
          answer: "We use premium cotton blends, moisture-wicking fabrics, and durable materials designed for military durability. All materials are chosen for comfort and longevity."
        },
        {
          question: "Are your designs officially licensed?",
          answer: "Our designs honor military heritage respectfully. We work with military organizations where required and ensure all designs meet appropriate standards and respect."
        },
        {
          question: "Do you offer custom designs?",
          answer: "Yes! We offer custom unit designs, personalization, and bespoke orders. Contact our design team to discuss your requirements and pricing."
        }
      ]
    },
    {
      id: "account",
      title: "Accounts & Support",
      icon: Users,
      color: "text-red-600",
      questions: [
        {
          question: "Do I need an account to order?",
          answer: "No, you can checkout as a guest. However, creating an account allows you to track orders, save addresses, and access exclusive military member benefits."
        },
        {
          question: "How do I reset my password?",
          answer: "Click 'Forgot Password' on the login page and enter your email. You'll receive a reset link within minutes. Contact support if you don't receive the email."
        },
        {
          question: "How can I contact customer support?",
          answer: "Email: support@militarytees.co.uk | Phone: +44 1234 567890 | Hours: Mon-Fri 9AM-5PM GMT. We aim to respond to all inquiries within 24 hours."
        },
        {
          question: "Do you have a physical store?",
          answer: "We're currently online-only, allowing us to offer better prices and wider selection. We occasionally attend military events and shows - follow our social media for updates."
        }
      ]
    }
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
                <HelpCircle className="h-12 w-12 text-primary mx-auto" />
              </div>
              
              <h1 className={cn(
                "text-4xl md:text-5xl font-display font-bold text-foreground mb-4",
                "tracking-wider uppercase"
              )}>
                FAQ
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                Quick answers to your questions about Military Tees UK. Can't find what you're looking for? Contact our support team.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {faqSections.map((section) => {
              const IconComponent = section.icon
              
              return (
                <Card key={section.id} className="border-2 border-border rounded-none">
                  <CardHeader>
                    <CardTitle className={cn(
                      "font-display tracking-wide uppercase flex items-center gap-2"
                    )}>
                      <IconComponent className={cn("h-5 w-5", section.color)} />
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {section.questions.map((faq, index) => {
                      const expanded = isExpanded(section.id, index)
                      return (
                        <div key={index} className="border-b border-border last:border-b-0 pb-4 last:pb-0">
                          <button 
                            className="flex items-center justify-between w-full text-left hover:bg-muted/20 p-2 rounded-none transition-colors"
                            onClick={() => toggleItem(section.id, index)}
                          >
                            <span className="font-medium text-foreground">{faq.question}</span>
                            {expanded ? (
                              <Minus className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Plus className="h-4 w-4 text-muted-foreground" />
                            )}
                          </button>
                          {expanded && (
                            <div className="px-2 pt-2 animate-in slide-in-from-top-1 duration-200">
                              <p className="text-muted-foreground text-sm leading-relaxed">
                                {faq.answer}
                              </p>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              )
            })}

            {/* Still Have Questions */}
            <Card className="border-2 border-border rounded-none bg-primary/5">
              <CardHeader>
                <CardTitle className={cn(
                  "font-display tracking-wide uppercase text-center"
                )}>
                  Still Have Questions?
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Our support team is standing by to help with any questions not covered here.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button className="rounded-none" asChild>
                    <Link href="/contact">
                      <HelpCircle className="h-4 w-4 mr-2" />
                      Contact Support
                    </Link>
                  </Button>
                  <Button variant="outline" className="rounded-none border-2" asChild>
                    <Link href="/track-order">
                      <Package className="h-4 w-4 mr-2" />
                      Track Order
                    </Link>
                  </Button>
                </div>
                
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><strong>Email:</strong> support@militarytees.co.uk</p>
                  <p><strong>Phone:</strong> +44 1234 567890</p>
                  <p><strong>Hours:</strong> Monday - Friday, 9:00 AM - 5:00 PM GMT</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </Layout>
  )
}