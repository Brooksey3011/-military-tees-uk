"use client"

import * as React from "react"
import Link from "next/link"
import { Mail, MapPin, Clock, MessageSquare, Users, HeadphonesIcon } from "lucide-react"
import { Layout } from "@/components/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { cn } from "@/lib/utils"

export default function ContactPage() {
  // State for form fields
  const [firstName, setFirstName] = React.useState("")
  const [lastName, setLastName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [subject, setSubject] = React.useState("")
  const [orderNumber, setOrderNumber] = React.useState("")
  const [militaryStatus, setMilitaryStatus] = React.useState("")
  const [message, setMessage] = React.useState("")
  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <section className="border-b-2 border-border bg-muted/10">
          <div className="container mx-auto px-4 py-8 md:py-16">
            <div className="max-w-4xl mx-auto text-center">
              <div className={cn(
                "inline-block p-2 md:p-4 mb-4 md:mb-6",
                "border-2 border-primary rounded-none bg-background"
              )}>
                <HeadphonesIcon className="h-8 w-8 md:h-12 md:w-12 text-primary mx-auto" />
              </div>
              
              <h1 className={cn(
                "text-2xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-3 md:mb-4",
                "tracking-wider uppercase"
              )}>
                Contact Us
              </h1>
              
              <p className="text-base md:text-xl text-muted-foreground leading-relaxed px-4">
                Standing by to assist our military community. Get in touch for orders, support, or custom design consultations.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Content */}
        <section className="container mx-auto px-4 py-8 md:py-16">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              
              {/* Contact Information */}
              <div className="lg:col-span-1 space-y-6">
                
                {/* Quick Contact */}
                <Card className="border-2 border-border rounded-none">
                  <CardHeader>
                    <CardTitle className={cn(
                      "font-display tracking-wide uppercase flex items-center gap-2"
                    )}>
                      <Mail className="h-5 w-5 text-primary" />
                      Email Contact
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-foreground">General Email</p>
                          <p className="text-sm text-muted-foreground">info@militarytees.co.uk</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-foreground">Business Hours</p>
                          <p className="text-sm text-muted-foreground">Mon-Fri, 9:00 AM - 5:00 PM GMT</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Department Contacts */}
                <Card className="border-2 border-border rounded-none">
                  <CardHeader>
                    <CardTitle className={cn(
                      "font-display tracking-wide uppercase flex items-center gap-2"
                    )}>
                      <Users className="h-5 w-5 text-primary" />
                      Department Contacts
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="font-medium text-foreground">Orders & General Support</p>
                        <p className="text-muted-foreground">info@militarytees.co.uk</p>
                      </div>
                      
                      <div>
                        <p className="font-medium text-foreground">Returns & Exchanges</p>
                        <p className="text-muted-foreground">info@militarytees.co.uk</p>
                      </div>
                      
                      <div>
                        <p className="font-medium text-foreground">Custom Design Requests</p>
                        <p className="text-muted-foreground">info@militarytees.co.uk</p>
                      </div>
                      
                      <div>
                        <p className="font-medium text-foreground">Wholesale & Bulk Orders</p>
                        <p className="text-muted-foreground">info@militarytees.co.uk</p>
                      </div>
                      
                      <div>
                        <p className="font-medium text-foreground">Press & Media</p>
                        <p className="text-muted-foreground">info@militarytees.co.uk</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Response Times */}
                <Card className="border-2 border-border rounded-none bg-primary/5">
                  <CardHeader>
                    <CardTitle className={cn(
                      "font-display tracking-wide uppercase flex items-center gap-2"
                    )}>
                      <Clock className="h-5 w-5 text-primary" />
                      Response Times
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email Support:</span>
                      <span className="text-foreground font-medium">Within 24 hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Custom Designs:</span>
                      <span className="text-foreground font-medium">2-3 business days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Returns Support:</span>
                      <span className="text-foreground font-medium">Within 12 hours</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-2">
                <Card className="border-2 border-border rounded-none">
                  <CardHeader>
                    <CardTitle className={cn(
                      "font-display tracking-wide uppercase flex items-center gap-2"
                    )}>
                      <MessageSquare className="h-5 w-5 text-primary" />
                      Send Us a Message
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-6">
                      
                      {/* Basic Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            First Name *
                          </label>
                          <Input 
                            className="rounded-none border-2"
                            placeholder="Your first name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Last Name *
                          </label>
                          <Input 
                            className="rounded-none border-2"
                            placeholder="Your last name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Email Address *
                        </label>
                        <Input 
                          type="email"
                          className="rounded-none border-2"
                          placeholder="your.email@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>

                      {/* Subject and Order */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Subject *
                          </label>
                          <Select
                            className="rounded-none border-2"
                            placeholder="Select inquiry type"
                            value={subject}
                            onValueChange={setSubject}
                            options={[
                              { value: "order", label: "Order Support" },
                              { value: "return", label: "Return/Exchange" },
                              { value: "custom", label: "Custom Design" },
                              { value: "wholesale", label: "Wholesale Inquiry" },
                              { value: "shipping", label: "Shipping Question" },
                              { value: "product", label: "Product Information" },
                              { value: "other", label: "Other" }
                            ]}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Order Number (if applicable)
                          </label>
                          <Input 
                            className="rounded-none border-2"
                            placeholder="MT-UK-XXXXX"
                            value={orderNumber}
                            onChange={(e) => setOrderNumber(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Military Status */}
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Military Status (Optional)
                        </label>
                        <Select
                          className="rounded-none border-2"
                          placeholder="Select if applicable"
                          value={militaryStatus}
                          onValueChange={setMilitaryStatus}
                          options={[
                            { value: "active", label: "Active Service" },
                            { value: "veteran", label: "Veteran" },
                            { value: "reserves", label: "Reserves/TA" },
                            { value: "family", label: "Military Family" },
                            { value: "cadet", label: "Cadet Organization" },
                            { value: "civilian", label: "Civilian" }
                          ]}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          This helps us provide relevant assistance and may qualify you for military discounts.
                        </p>
                      </div>

                      {/* Message */}
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Message *
                        </label>
                        <Textarea 
                          className="rounded-none border-2 min-h-32"
                          placeholder="Please provide details about your inquiry. For order issues, include your order number and specific concerns."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          required
                        />
                      </div>

                      {/* Submit */}
                      <div className="flex gap-4">
                        <Button className="flex-1 rounded-none" disabled>
                          <Mail className="h-4 w-4 mr-2" />
                          Send Message
                        </Button>
                        <Button type="button" variant="outline" className="rounded-none border-2">
                          Clear Form
                        </Button>
                      </div>

                      <p className="text-xs text-muted-foreground">
                        * Required fields. We typically respond within 24 hours during business days. 
                        For urgent order issues, please email us directly and we'll respond as soon as possible.
                      </p>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Additional Help */}
            <div className="mt-8 md:mt-12">
              <Card className="border-2 border-border rounded-none bg-muted/10">
                <CardHeader>
                  <CardTitle className={cn(
                    "font-display tracking-wide uppercase text-center"
                  )}>
                    Need Immediate Help?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 text-center">
                    <div>
                      <Mail className="h-6 w-6 md:h-8 md:w-8 text-primary mx-auto mb-2" />
                      <h3 className="text-sm md:text-base font-semibold text-foreground mb-1">Email Support</h3>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        For all support inquiries and assistance
                      </p>
                      <p className="text-sm md:text-base font-medium text-foreground">info@militarytees.co.uk</p>
                    </div>
                    
                    <div>
                      <Mail className="h-6 w-6 md:h-8 md:w-8 text-primary mx-auto mb-2" />
                      <h3 className="text-sm md:text-base font-semibold text-foreground mb-1">Email Response</h3>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        We respond to all emails within 24 hours
                      </p>
                      <Button variant="outline" size="sm" className="rounded-none mt-2" asChild>
                        <a href="mailto:info@militarytees.co.uk">
                          Send Email
                        </a>
                      </Button>
                    </div>
                    
                    <div>
                      <Clock className="h-6 w-6 md:h-8 md:w-8 text-primary mx-auto mb-2" />
                      <h3 className="text-sm md:text-base font-semibold text-foreground mb-1">FAQ</h3>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        Find answers to common questions instantly
                      </p>
                      <Button variant="outline" size="sm" className="rounded-none mt-2" asChild>
                        <Link href="/faq">
                          View FAQ
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
}