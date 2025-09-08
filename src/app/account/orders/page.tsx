"use client"

import Link from "next/link"
import { Package, Search, Eye, Download, ArrowLeft } from "lucide-react"
import { Layout } from "@/components/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { useState, useEffect } from "react"

// Types for real order data
interface OrderItem {
  id: string
  product_variant_id: string
  quantity: number
  price_at_purchase: number
  product_name: string
  sku: string
  size: string | null
  color: string | null
}

interface Order {
  id: string
  order_number: string
  status: string
  payment_status: string
  total_amount: number
  customer_notes: string | null
  created_at: string
  updated_at: string
  order_items: OrderItem[]
}

interface OrderHistory {
  orders: Order[]
  total: number
  has_more: boolean
}

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = '/login'
    }
  }, [user, authLoading])

  // Fetch real order data
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return

      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/orders/history', {
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error('Failed to fetch orders')
        }

        const data: OrderHistory = await response.json()
        setOrders(data.orders)

      } catch (error) {
        console.error('Error fetching orders:', error)
        setError('Failed to load your orders. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [user])

  // Filter orders based on search query
  const filteredOrders = orders.filter(order => 
    order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.order_items.some(item => 
      item.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.sku && item.sku.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  )

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-600 hover:bg-green-700"
      case "in_transit":
        return "bg-blue-600 hover:bg-blue-700"
      case "processing":
        return "bg-yellow-600 hover:bg-yellow-700"
      case "cancelled":
        return "bg-red-600 hover:bg-red-700"
      default:
        return "bg-gray-600 hover:bg-gray-700"
    }
  }

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ')
  }

  // Show loading state
  if (authLoading || loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-background">
          <section className="border-b-2 border-border bg-muted/10">
            <div className="container mx-auto px-4 py-16">
              <div className="max-w-6xl mx-auto">
                <div className="animate-pulse">
                  <div className="h-8 bg-muted rounded w-48 mb-4"></div>
                  <div className="h-4 bg-muted rounded w-64"></div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </Layout>
    )
  }

  // Redirect if not authenticated
  if (!user) {
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
                    My Orders
                  </h1>
                  <p className="text-muted-foreground">View and manage your order history</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Orders Content */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* Search and Filter */}
            <Card className="border-2 border-border rounded-none">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        className="pl-10 rounded-none border-2"
                        placeholder="Search orders by order number, product name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button variant="outline" className="rounded-none border-2" disabled>
                    Filter Orders
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Orders List */}
            <div className="space-y-6">
              {error ? (
                <Card className="border-2 border-border rounded-none">
                  <CardContent className="p-8 text-center">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">{error}</p>
                    <Button onClick={() => window.location.reload()}>
                      Try Again
                    </Button>
                  </CardContent>
                </Card>
              ) : filteredOrders.length === 0 ? (
                <Card className="border-2 border-border rounded-none">
                  <CardContent className="p-8 text-center">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-foreground mb-2">
                      {searchQuery ? 'No orders found' : 'No orders yet'}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery 
                        ? `No orders match "${searchQuery}". Try a different search term.`
                        : 'Start shopping to see your order history here.'
                      }
                    </p>
                    {!searchQuery && (
                      <Button asChild>
                        <Link href="/categories">Start Shopping</Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                filteredOrders.map((order) => (
                  <Card key={order.id} className="border-2 border-border rounded-none">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl text-foreground mb-2">
                            Order #{order.order_number}
                          </CardTitle>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Placed: {new Date(order.created_at).toLocaleDateString('en-GB')}</span>
                            <Badge className={cn("rounded-none", getStatusColor(order.status))}>
                              {formatStatus(order.status)}
                            </Badge>
                            <span>Payment: {formatStatus(order.payment_status)}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-foreground">£{order.total_amount.toFixed(2)}</div>
                          <div className="text-sm text-muted-foreground">{order.order_items.length} item{order.order_items.length > 1 ? 's' : ''}</div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      {/* Order Items */}
                      <div className="space-y-3 mb-6">
                        {order.order_items.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted/10 rounded-none">
                            <div className="flex-1">
                              <div className="font-medium text-foreground">{item.product_name}</div>
                              <div className="text-sm text-muted-foreground">
                                {item.sku && `SKU: ${item.sku} • `}
                                {item.size && `Size: ${item.size} • `}
                                {item.color && `Color: ${item.color} • `}
                                Qty: {item.quantity}
                              </div>
                            </div>
                            <div className="font-medium text-foreground">£{item.price_at_purchase.toFixed(2)}</div>
                          </div>
                        ))}
                      </div>

                      {/* Customer Notes */}
                      {order.customer_notes && (
                        <div className="bg-muted/10 p-4 rounded-none border-l-4 border-muted mb-6">
                          <h4 className="font-medium text-foreground mb-1">Order Notes</h4>
                          <p className="text-sm text-muted-foreground">{order.customer_notes}</p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-3">
                        <Button size="sm" variant="outline" className="rounded-none border-2" disabled>
                          <Eye className="h-3 w-3 mr-2" />
                          View Details
                        </Button>
                        <Button size="sm" variant="outline" className="rounded-none border-2" disabled>
                          <Download className="h-3 w-3 mr-2" />
                          Download Invoice
                        </Button>
                        <Button size="sm" variant="outline" className="rounded-none border-2" disabled>
                          <Package className="h-3 w-3 mr-2" />
                          Reorder Items
                        </Button>
                        {order.status === "delivered" && (
                          <Button size="sm" variant="outline" className="rounded-none border-2" disabled>
                            Leave Review
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Load More */}
            <div className="text-center">
              <Button variant="outline" className="rounded-none border-2" disabled>
                Load More Orders
              </Button>
            </div>

            {/* Help Section */}
            <Card className="border-2 border-border rounded-none bg-muted/10">
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold text-foreground mb-2">Need Help with an Order?</h3>
                <p className="text-muted-foreground mb-4">
                  Our customer service team is here to help with any questions about your orders.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button className="rounded-none" disabled>
                    Contact Support
                  </Button>
                  <Button variant="outline" className="rounded-none border-2" disabled>
                    Order FAQ
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