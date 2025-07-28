"use client"

import { Metadata } from "next"
import Link from "next/link"
import { User, Package, MapPin, Heart, Settings, LogOut, Shield } from "lucide-react"
import { Layout } from "@/components/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { useState, useEffect } from "react"

// Force dynamic rendering for this auth-dependent page
export const dynamic = 'force-dynamic'

export default function AccountPage() {
  const { user, signOut, loading } = useAuth()
  const [isSigningOut, setIsSigningOut] = useState(false)

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/login'
    }
  }, [user, loading])

  const handleSignOut = async () => {
    if (isSigningOut || !signOut) return
    
    setIsSigningOut(true)
    try {
      await signOut()
      // Redirect to home page after successful sign-out
      window.location.href = '/'
    } catch (error) {
      console.error('Error signing out:', error)
      // Show error to user or handle gracefully
      alert('Something went wrong while signing out. Please try again.')
      setIsSigningOut(false)
    }
  }

  // Use authenticated user data or fallback to mock for demonstration
  const userData = user ? {
    name: user.customer?.first_name ? `${user.customer.first_name} ${user.customer.last_name || ''}`.trim() : user.email || "User",
    email: user.email || "",
    rank: "British Army (Ret.)", // Military branch would be stored in customer profile
    memberSince: user.customer?.created_at ? new Date(user.customer.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : "March 2023",
    isVerifiedMilitary: false, // Military verification status would be stored in customer profile
    totalOrders: 8, // Would come from orders table
    totalSpent: 189.92 // Would come from orders calculation
  } : {
    name: "Sergeant John Smith",
    email: "j.smith@example.com",
    rank: "British Army (Ret.)",
    memberSince: "March 2023",
    isVerifiedMilitary: true,
    totalOrders: 8,
    totalSpent: 189.92
  }

  const recentOrders = [
    {
      id: "MT-UK-12345",
      date: "2024-01-15",
      status: "Delivered",
      total: 47.98,
      items: 2
    },
    {
      id: "MT-UK-12344", 
      date: "2024-01-08",
      status: "Delivered",
      total: 24.99,
      items: 1
    },
    {
      id: "MT-UK-12343",
      date: "2023-12-20",
      status: "Delivered", 
      total: 69.97,
      items: 3
    }
  ]

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
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-none border-2 border-primary flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h1 className={cn(
                    "text-3xl md:text-4xl font-display font-bold text-foreground",
                    "tracking-wider uppercase"
                  )}>
                    My Account
                  </h1>
                  <p className="text-muted-foreground">Welcome back, {userData.name}</p>
                </div>
              </div>
              
              {userData.isVerifiedMilitary && (
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <Badge className="rounded-none bg-green-600 hover:bg-green-700">
                    VERIFIED MILITARY
                  </Badge>
                  <span className="text-sm text-muted-foreground">10% Discount Applied</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Account Content */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              
              {/* Sidebar Navigation */}
              <div className="lg:col-span-1">
                <Card className="border-2 border-border rounded-none">
                  <CardHeader>
                    <CardTitle className={cn(
                      "font-display tracking-wide uppercase"
                    )}>
                      Account Menu
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <nav className="space-y-2">
                      <Link href="/account" className="flex items-center gap-2 p-3 bg-primary/5 border-l-4 border-primary">
                        <User className="h-4 w-4" />
                        <span className="font-medium">Dashboard</span>
                      </Link>
                      <Link href="/account/orders" className="flex items-center gap-2 p-3 hover:bg-muted/20 transition-colors">
                        <Package className="h-4 w-4" />
                        <span>Orders</span>
                      </Link>
                      <Link href="/account/addresses" className="flex items-center gap-2 p-3 hover:bg-muted/20 transition-colors">
                        <MapPin className="h-4 w-4" />
                        <span>Addresses</span>
                      </Link>
                      <Link href="/account/wishlist" className="flex items-center gap-2 p-3 hover:bg-muted/20 transition-colors">
                        <Heart className="h-4 w-4" />
                        <span>Wishlist</span>
                      </Link>
                      <Link href="/account/settings" className="flex items-center gap-2 p-3 hover:bg-muted/20 transition-colors">
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                      <button 
                        onClick={handleSignOut}
                        disabled={isSigningOut}
                        className="flex items-center gap-2 p-3 hover:bg-muted/20 transition-colors w-full text-left disabled:opacity-50"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>{isSigningOut ? 'Signing out...' : 'Sign Out'}</span>
                      </button>
                    </nav>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-3 space-y-8">
                
                {/* Account Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="border-2 border-border rounded-none text-center">
                    <CardContent className="p-6">
                      <div className="text-2xl font-bold text-primary">{userData.totalOrders}</div>
                      <div className="text-sm text-muted-foreground">Total Orders</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-2 border-border rounded-none text-center">
                    <CardContent className="p-6">
                      <div className="text-2xl font-bold text-primary">£{userData.totalSpent}</div>
                      <div className="text-sm text-muted-foreground">Total Spent</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-2 border-border rounded-none text-center">
                    <CardContent className="p-6">
                      <div className="text-2xl font-bold text-primary">£19.00</div>
                      <div className="text-sm text-muted-foreground">Military Savings</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Account Information */}
                <Card className="border-2 border-border rounded-none">
                  <CardHeader>
                    <CardTitle className={cn(
                      "font-display tracking-wide uppercase"
                    )}>
                      Account Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-foreground mb-3">Personal Details</h4>
                        <div className="space-y-2 text-sm">
                          <div><strong>Name:</strong> {userData.name}</div>
                          <div><strong>Email:</strong> {userData.email}</div>
                          <div><strong>Military Status:</strong> {userData.rank}</div>
                          <div><strong>Member Since:</strong> {userData.memberSince}</div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-foreground mb-3">Preferences</h4>
                        <div className="space-y-2 text-sm">
                          <div><strong>Newsletter:</strong> Subscribed</div>
                          <div><strong>SMS Updates:</strong> Enabled</div>
                          <div><strong>Military Discount:</strong> Active</div>
                          <div><strong>Preferred Size:</strong> Large</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <Button variant="outline" className="rounded-none border-2" asChild>
                        <Link href="/account/settings">
                          <Settings className="h-4 w-4 mr-2" />
                          Edit Profile
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Orders */}
                <Card className="border-2 border-border rounded-none">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className={cn(
                        "font-display tracking-wide uppercase"
                      )}>
                        Recent Orders
                      </CardTitle>
                      <Link href="/account/orders">
                        <Button variant="outline" size="sm" className="rounded-none border-2">
                          View All Orders
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentOrders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-4 border border-border rounded-none">
                          <div>
                            <div className="font-medium text-foreground">Order #{order.id}</div>
                            <div className="text-sm text-muted-foreground">
                              {order.date} • {order.items} item{order.items > 1 ? 's' : ''}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-foreground">£{order.total}</div>
                            <Badge 
                              className={cn(
                                "rounded-none text-xs",
                                order.status === "Delivered" && "bg-green-600 hover:bg-green-700"
                              )}
                            >
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="border-2 border-border rounded-none bg-primary/5">
                  <CardHeader>
                    <CardTitle className={cn(
                      "font-display tracking-wide uppercase"
                    )}>
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Button className="rounded-none h-auto p-4 flex flex-col" asChild>
                        <Link href="/track-order">
                          <Package className="h-6 w-6 mb-2" />
                          <span className="text-sm">Track Order</span>
                        </Link>
                      </Button>
                      
                      <Button variant="outline" className="rounded-none h-auto p-4 flex flex-col border-2" asChild>
                        <Link href="/account/wishlist">
                          <Heart className="h-6 w-6 mb-2" />
                          <span className="text-sm">Wishlist</span>
                        </Link>
                      </Button>
                      
                      <Button variant="outline" className="rounded-none h-auto p-4 flex flex-col border-2" asChild>
                        <Link href="/account/addresses">
                          <MapPin className="h-6 w-6 mb-2" />
                          <span className="text-sm">Addresses</span>
                        </Link>
                      </Button>
                      
                      <Button variant="outline" className="rounded-none h-auto p-4 flex flex-col border-2" asChild>
                        <Link href="/account/settings">
                          <Settings className="h-6 w-6 mb-2" />
                          <span className="text-sm">Settings</span>
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Military Benefits */}
                <Card className="border-2 border-border rounded-none bg-green-600/5">
                  <CardHeader>
                    <CardTitle className={cn(
                      "font-display tracking-wide uppercase flex items-center gap-2"
                    )}>
                      <Shield className="h-5 w-5 text-green-600" />
                      Military Benefits
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium text-foreground">Active Benefits</h4>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                          <li>10% Military Discount on all orders</li>
                          <li>Free shipping to BFPO addresses</li>
                          <li>Priority customer support</li>
                          <li>Early access to new releases</li>
                        </ul>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium text-foreground">Total Savings</h4>
                        <div className="text-2xl font-bold text-green-600">£19.00</div>
                        <p className="text-sm text-muted-foreground">Saved through military discount</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
}