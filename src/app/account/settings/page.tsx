"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeft, Shield, Bell, User, Mail } from "lucide-react"
import { Layout } from "@/components/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"

// Force dynamic rendering for this auth-dependent page
export const dynamic = 'force-dynamic'

export default function SettingsPage() {
  const { user, signOut, loading } = useAuth()
  const [isSigningOut, setIsSigningOut] = React.useState(false)

  // Redirect unauthenticated users to login
  React.useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/login'
    }
  }, [user, loading])

  // State for form fields
  const [militaryBranch, setMilitaryBranch] = React.useState("army")
  const [preferredSize, setPreferredSize] = React.useState("L")
  const [preferredFit, setPreferredFit] = React.useState("regular")
  const [firstName, setFirstName] = React.useState("John")
  const [lastName, setLastName] = React.useState("Smith")
  const [email, setEmail] = React.useState("john.smith@email.com")
  const [phone, setPhone] = React.useState("+44 7700 900123")

  const handleSignOut = async () => {
    if (isSigningOut) return
    
    setIsSigningOut(true)
    try {
      await signOut()
      // Redirect to home page after successful sign-out
      window.location.href = '/'
    } catch (error) {
      console.error('Error signing out:', error)
      alert('Something went wrong while signing out. Please try again.')
      setIsSigningOut(false)
    }
  }

  // Show loading or redirect if not authenticated
  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">Loading...</div>
        </div>
      </Layout>
    )
  }

  if (!user) {
    // Will redirect via useEffect, but return null to prevent flash
    return null
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <section className="border-b-2 border-border bg-muted/10">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-4 mb-6">
                <Link href="/account" className="p-2 hover:bg-muted/20 rounded-none border-2 border-border">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
                <div>
                  <h1 className={cn(
                    "text-3xl md:text-4xl font-display font-bold text-foreground",
                    "tracking-wider uppercase"
                  )}>
                    Account Settings
                  </h1>
                  <p className="text-muted-foreground">Manage your account preferences and information</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Settings Content */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Personal Information */}
            <Card className="border-2 border-border rounded-none">
              <CardHeader>
                <CardTitle className={cn(
                  "font-display tracking-wide uppercase flex items-center gap-2"
                )}>
                  <User className="h-5 w-5 text-primary" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      First Name *
                    </label>
                    <Input 
                      className="rounded-none border-2"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Last Name *
                    </label>
                    <Input 
                      className="rounded-none border-2"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Phone Number
                  </label>
                  <Input 
                    type="tel"
                    className="rounded-none border-2"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <Button className="rounded-none" disabled>
                  Update Personal Information
                </Button>
              </CardContent>
            </Card>

            {/* Military Status */}
            <Card className="border-2 border-border rounded-none bg-green-600/5">
              <CardHeader>
                <CardTitle className={cn(
                  "font-display tracking-wide uppercase flex items-center gap-2"
                )}>
                  <Shield className="h-5 w-5 text-green-600" />
                  Military Status
                  <Badge className="rounded-none bg-green-600 hover:bg-green-700">
                    VERIFIED
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Service Branch
                    </label>
                    <Select 
                      options={[
                        { value: "army", label: "British Army" },
                        { value: "navy", label: "Royal Navy" },
                        { value: "raf", label: "Royal Air Force" },
                        { value: "marines", label: "Royal Marines" },
                        { value: "reserves", label: "Reserves/TA" },
                        { value: "veteran", label: "Veteran" },
                        { value: "cadet", label: "Cadet Organization" },
                        { value: "family", label: "Military Family" },
                        { value: "civilian", label: "Civilian" }
                      ]}
                      value={militaryBranch}
                      onValueChange={setMilitaryBranch}
                      className="rounded-none border-2"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Rank/Position
                    </label>
                    <Input 
                      className="rounded-none border-2"
                      defaultValue="Sergeant"
                      placeholder="e.g., Sergeant, Lieutenant, etc."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Unit/Regiment (Optional)
                  </label>
                  <Input 
                    className="rounded-none border-2"
                    defaultValue="1st Battalion, Royal Regiment"
                    placeholder="Your unit or regiment"
                  />
                </div>

                <div className="bg-green-600/10 p-4 rounded-none border-l-4 border-green-600">
                  <h4 className="font-medium text-foreground mb-2">Military Discount Active</h4>
                  <p className="text-sm text-muted-foreground">
                    You're receiving 10% off all orders. Thank you for your service! 
                    If your status changes, please update your information.
                  </p>
                </div>

                <Button variant="outline" className="rounded-none border-2" disabled>
                  Update Military Information
                </Button>
              </CardContent>
            </Card>

            {/* Notification Preferences */}
            <Card className="border-2 border-border rounded-none">
              <CardHeader>
                <CardTitle className={cn(
                  "font-display tracking-wide uppercase flex items-center gap-2"
                )}>
                  <Bell className="h-5 w-5 text-primary" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">Email Notifications</h4>
                      <p className="text-sm text-muted-foreground">Receive updates about orders and promotions</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border border-input" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">SMS Order Updates</h4>
                      <p className="text-sm text-muted-foreground">Get text messages about order status</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border border-input" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">Marketing Emails</h4>
                      <p className="text-sm text-muted-foreground">New products, sales, and special offers</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border border-input" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">Military Community Updates</h4>
                      <p className="text-sm text-muted-foreground">News and events for military personnel</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border border-input" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">Back in Stock Alerts</h4>
                      <p className="text-sm text-muted-foreground">Notify when wishlist items are available</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border border-input" />
                  </div>
                </div>

                <Button className="rounded-none" disabled>
                  Save Notification Preferences
                </Button>
              </CardContent>
            </Card>

            {/* Shopping Preferences */}
            <Card className="border-2 border-border rounded-none">
              <CardHeader>
                <CardTitle className={cn(
                  "font-display tracking-wide uppercase"
                )}>
                  Shopping Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Preferred Size
                    </label>
                    <Select 
                      options={[
                        { value: "XS", label: "Extra Small" },
                        { value: "S", label: "Small" },
                        { value: "M", label: "Medium" },
                        { value: "L", label: "Large" },
                        { value: "XL", label: "Extra Large" },
                        { value: "XXL", label: "2X Large" },
                        { value: "3XL", label: "3X Large" }
                      ]}
                      value={preferredSize}
                      onValueChange={setPreferredSize}
                      className="rounded-none border-2"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Preferred Fit
                    </label>
                    <Select 
                      options={[
                        { value: "military", label: "Military Fit" },
                        { value: "regular", label: "Regular Fit" },
                        { value: "relaxed", label: "Relaxed Fit" }
                      ]}
                      value={preferredFit}
                      onValueChange={setPreferredFit}
                      className="rounded-none border-2"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">Save Payment Methods</h4>
                      <p className="text-sm text-muted-foreground">Securely store cards for faster checkout</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border border-input" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">One-Click Ordering</h4>
                      <p className="text-sm text-muted-foreground">Skip cart for instant purchases</p>
                    </div>
                    <input type="checkbox" className="w-4 h-4 rounded border border-input" />
                  </div>
                </div>

                <Button className="rounded-none" disabled>
                  Save Shopping Preferences
                </Button>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card className="border-2 border-border rounded-none">
              <CardHeader>
                <CardTitle className={cn(
                  "font-display tracking-wide uppercase"
                )}>
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium text-foreground mb-4">Password</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Last updated: 3 months ago
                  </p>
                  <Button variant="outline" className="rounded-none border-2" disabled>
                    Change Password
                  </Button>
                </div>

                <div>
                  <h4 className="font-medium text-foreground mb-4">Two-Factor Authentication</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add an extra layer of security to your account
                  </p>
                  <Button variant="outline" className="rounded-none border-2" disabled>
                    Enable 2FA
                  </Button>
                </div>

                <div>
                  <h4 className="font-medium text-foreground mb-4">Active Sessions</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center p-3 bg-muted/10 rounded-none">
                      <div>
                        <div className="font-medium">Current Session</div>
                        <div className="text-muted-foreground">Chrome on Windows • London, UK</div>
                      </div>
                      <Badge className="rounded-none bg-green-600">ACTIVE</Badge>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-none border-2 mt-3" disabled>
                    View All Sessions
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card className="border-2 border-border rounded-none bg-muted/10">
              <CardHeader>
                <CardTitle className={cn(
                  "font-display tracking-wide uppercase"
                )}>
                  Account Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button variant="outline" className="rounded-none border-2" disabled>
                    <Mail className="h-4 w-4 mr-2" />
                    Download My Data
                  </Button>
                  <Button variant="outline" className="rounded-none border-2" disabled>
                    Export Order History
                  </Button>
                  <Button 
                    variant="secondary" 
                    className="rounded-none" 
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    {isSigningOut ? 'Signing out...' : 'Logout'}
                  </Button>
                </div>

                <div className="pt-4 border-t border-border">
                  <h4 className="font-medium text-foreground mb-2">Delete Account</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <Button variant="destructive" className="rounded-none" disabled>
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </Layout>
  )
}