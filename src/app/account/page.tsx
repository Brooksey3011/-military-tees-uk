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

// Types for real data
interface OrderHistory {
  orders: Array<{
    id: string
    order_number: string
    status: string
    total_amount: number
    created_at: string
    order_items: Array<{
      product_name: string
      quantity: number
      price_at_purchase: number
    }>
  }>
  total: number
}

interface UserStats {
  totalOrders: number
  totalSpent: number
  militarySavings: number
}

// Force dynamic rendering for this auth-dependent page
export const dynamic = 'force-dynamic'

export default function AccountPage() {
  const { user, signOut, loading } = useAuth()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [orderHistory, setOrderHistory] = useState<OrderHistory | null>(null)
  const [userStats, setUserStats] = useState<UserStats>({ totalOrders: 0, totalSpent: 0, militarySavings: 0 })
  const [dataLoading, setDataLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/login'
    }
  }, [user, loading])

  // Fetch real user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return

      try {
        setDataLoading(true)
        setError(null)

        // Fetch order history
        const response = await fetch('/api/orders/history', {
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error('Failed to fetch order data')
        }

        const data: OrderHistory = await response.json()
        setOrderHistory(data)

        // Calculate user stats from real data
        const stats = calculateUserStats(data)
        setUserStats(stats)

      } catch (error) {
        console.error('Error fetching user data:', error)
        setError('Failed to load account data')
        // Keep default values for graceful degradation
      } finally {
        setDataLoading(false)
      }
    }

    fetchUserData()
  }, [user])

  // Calculate user statistics from order data
  const calculateUserStats = (data: OrderHistory): UserStats => {
    const totalOrders = data.orders.length
    const totalSpent = data.orders.reduce((sum, order) => sum + order.total_amount, 0)
    const militarySavings = totalSpent * 0.1 // Assume 10% military discount
    
    return {
      totalOrders,
      totalSpent: Math.round(totalSpent * 100) / 100, // Round to 2 decimal places
      militarySavings: Math.round(militarySavings * 100) / 100
    }
  }

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

  // Build user data from authenticated user
  const userData = {
    name: user?.customer?.first_name 
      ? `${user.customer.first_name} ${user.customer.last_name || ''}`.trim() 
      : user?.email || "User",
    email: user?.email || "",
    rank: "British Army (Ret.)", // Would be stored in customer profile
    memberSince: user?.customer?.created_at 
      ? new Date(user.customer.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) 
      : "Recently joined",
    isVerifiedMilitary: false, // Would be stored in customer profile
    totalOrders: userStats.totalOrders,
    totalSpent: userStats.totalSpent
  }

  // Get recent orders from real data (last 3 orders)
  const recentOrders = orderHistory?.orders.slice(0, 3).map(order => ({
    id: order.order_number,
    date: new Date(order.created_at).toLocaleDateString('en-GB'),
    status: order.status,
    total: order.total_amount,
    items: order.order_items.length
  })) || []

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
                      {dataLoading ? (
                        <div className="animate-pulse">
                          <div className="h-8 bg-muted rounded mb-2"></div>
                          <div className="h-4 bg-muted rounded"></div>
                        </div>
                      ) : (
                        <>
                          <div className="text-2xl font-bold text-primary">{userData.totalOrders}</div>
                          <div className="text-sm text-muted-foreground">Total Orders</div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card className="border-2 border-border rounded-none text-center">
                    <CardContent className="p-6">
                      {dataLoading ? (
                        <div className="animate-pulse">
                          <div className="h-8 bg-muted rounded mb-2"></div>
                          <div className="h-4 bg-muted rounded"></div>
                        </div>
                      ) : (
                        <>
                          <div className="text-2xl font-bold text-primary">£{userData.totalSpent.toFixed(2)}</div>
                          <div className="text-sm text-muted-foreground">Total Spent</div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card className="border-2 border-border rounded-none text-center">
                    <CardContent className="p-6">
                      {dataLoading ? (
                        <div className="animate-pulse">
                          <div className="h-8 bg-muted rounded mb-2"></div>
                          <div className="h-4 bg-muted rounded"></div>
                        </div>
                      ) : (
                        <>
                          <div className="text-2xl font-bold text-primary">£{userStats.militarySavings.toFixed(2)}</div>
                          <div className="text-sm text-muted-foreground">Military Savings</div>
                        </>
                      )}
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
                    {dataLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="animate-pulse p-4 border border-border rounded-none">
                            <div className="flex justify-between">
                              <div className="space-y-2 flex-1">
                                <div className="h-4 bg-muted rounded w-1/3"></div>
                                <div className="h-3 bg-muted rounded w-1/2"></div>
                              </div>
                              <div className="space-y-2">
                                <div className="h-4 bg-muted rounded w-16"></div>
                                <div className="h-6 bg-muted rounded w-20"></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : error ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">{error}</p>
                        <Button 
                          variant="outline" 
                          className="mt-4" 
                          onClick={() => window.location.reload()}
                        >
                          Try Again
                        </Button>
                      </div>
                    ) : recentOrders.length > 0 ? (
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
                              <div className="font-medium text-foreground">£{order.total.toFixed(2)}</div>
                              <Badge 
                                className={cn(
                                  "rounded-none text-xs",
                                  order.status === "delivered" && "bg-green-600 hover:bg-green-700",
                                  order.status === "processing" && "bg-yellow-600 hover:bg-yellow-700",
                                  order.status === "in_transit" && "bg-blue-600 hover:bg-blue-700"
                                )}
                              >
                                {order.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-2">No orders yet</p>
                        <p className="text-sm text-muted-foreground mb-4">
                          Start shopping to see your order history here
                        </p>
                        <Button asChild>
                          <Link href="/categories">
                            Start Shopping
                          </Link>
                        </Button>
                      </div>
                    )}
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
                        {dataLoading ? (
                          <div className="animate-pulse">
                            <div className="h-8 bg-muted rounded mb-2 w-20"></div>
                            <div className="h-4 bg-muted rounded w-32"></div>
                          </div>
                        ) : (
                          <>
                            <div className="text-2xl font-bold text-green-600">£{userStats.militarySavings.toFixed(2)}</div>
                            <p className="text-sm text-muted-foreground">Saved through military discount</p>
                          </>
                        )}
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