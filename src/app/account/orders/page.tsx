import { Metadata } from "next"
import Link from "next/link"
import { Package, Search, Eye, Download, ArrowLeft } from "lucide-react"
import { Layout } from "@/components/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "My Orders | Military Tees UK",
  description: "View and manage your Military Tees UK orders. Track deliveries, download invoices, and reorder your favorite items.",
  robots: {
    index: false,
    follow: false,
  }
}

export default function OrdersPage() {
  const orders = [
    {
      id: "MT-UK-12345",
      date: "2024-01-15",
      status: "Delivered",
      total: 47.98,
      items: [
        { name: "Royal Marines Commando T-Shirt", size: "L", qty: 1, price: 24.99 },
        { name: "Parachute Regiment Cap Badge", qty: 1, price: 15.99 }
      ],
      tracking: "RM123456789GB",
      deliveredDate: "2024-01-18"
    },
    {
      id: "MT-UK-12344", 
      date: "2024-01-08",
      status: "Delivered",
      total: 24.99,
      items: [
        { name: "SAS Special Forces T-Shirt", size: "L", qty: 1, price: 24.99 }
      ],
      tracking: "RM987654321GB",
      deliveredDate: "2024-01-11"
    },
    {
      id: "MT-UK-12343",
      date: "2023-12-20",
      status: "Delivered", 
      total: 69.97,
      items: [
        { name: "Royal Navy Fleet T-Shirt", size: "L", qty: 2, price: 22.99 },
        { name: "Military Beanie Hat", qty: 1, price: 16.99 }
      ],
      tracking: "RM456789123GB",
      deliveredDate: "2023-12-23"
    },
    {
      id: "MT-UK-12342",
      date: "2023-11-15",
      status: "Delivered",
      total: 32.98,
      items: [
        { name: "Army Infantry Badge T-Shirt", size: "L", qty: 1, price: 23.99 },
        { name: "Military Keyring", qty: 1, price: 8.99 }
      ],
      tracking: "RM321654987GB",
      deliveredDate: "2023-11-18"
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-green-600 hover:bg-green-700"
      case "In Transit":
        return "bg-blue-600 hover:bg-blue-700"
      case "Processing":
        return "bg-yellow-600 hover:bg-yellow-700"
      default:
        return "bg-gray-600 hover:bg-gray-700"
    }
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
              {orders.map((order) => (
                <Card key={order.id} className="border-2 border-border rounded-none">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl text-foreground mb-2">
                          Order #{order.id}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Placed: {order.date}</span>
                          <Badge className={cn("rounded-none", getStatusColor(order.status))}>
                            {order.status}
                          </Badge>
                          {order.deliveredDate && (
                            <span>Delivered: {order.deliveredDate}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-foreground">£{order.total}</div>
                        <div className="text-sm text-muted-foreground">{order.items.length} item{order.items.length > 1 ? 's' : ''}</div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    {/* Order Items */}
                    <div className="space-y-3 mb-6">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted/10 rounded-none">
                          <div className="flex-1">
                            <div className="font-medium text-foreground">{item.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {item.size && `Size: ${item.size} • `}Qty: {item.qty}
                            </div>
                          </div>
                          <div className="font-medium text-foreground">£{item.price}</div>
                        </div>
                      ))}
                    </div>

                    {/* Tracking Info */}
                    {order.tracking && (
                      <div className="bg-primary/5 p-4 rounded-none border-l-4 border-primary mb-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-foreground">Tracking Information</h4>
                            <p className="text-sm text-muted-foreground">Tracking: {order.tracking}</p>
                          </div>
                          <Button size="sm" variant="outline" className="rounded-none border-2" disabled>
                            Track Package
                          </Button>
                        </div>
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
                      {order.status === "Delivered" && (
                        <Button size="sm" variant="outline" className="rounded-none border-2" disabled>
                          Leave Review
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
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