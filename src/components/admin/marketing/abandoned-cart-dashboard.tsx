"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  ShoppingCart, 
  Mail, 
  TrendingUp, 
  Clock,
  DollarSign,
  Send,
  RefreshCw,
  Eye,
  Calendar
} from 'lucide-react'

interface AbandonedCart {
  id: string
  customer_email: string
  cart_value: number
  items_count: number
  abandoned_at: string
  last_email_sent?: string
  email_count: number
  status: 'abandoned' | 'recovered' | 'expired'
}

interface AbandonedCartStats {
  total_abandoned: number
  total_recovered: number
  recovery_rate: number
  total_value_abandoned: number
  total_value_recovered: number
  average_cart_value: number
}

export function AbandonedCartDashboard() {
  const [carts, setCarts] = useState<AbandonedCart[]>([])
  const [stats, setStats] = useState<AbandonedCartStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [processingRecovery, setProcessingRecovery] = useState(false)

  useEffect(() => {
    fetchAbandonedCarts()
    fetchStats()
  }, [])

  const fetchAbandonedCarts = async () => {
    try {
      // Mock data - in real implementation, this would be an API call
      const mockCarts: AbandonedCart[] = [
        {
          id: '1',
          customer_email: 'john.smith@email.com',
          cart_value: 89.99,
          items_count: 3,
          abandoned_at: '2024-06-19T14:30:00Z',
          email_count: 0,
          status: 'abandoned'
        },
        {
          id: '2',
          customer_email: 'sarah.jones@email.com',
          cart_value: 156.50,
          items_count: 2,
          abandoned_at: '2024-06-19T11:15:00Z',
          last_email_sent: '2024-06-19T15:15:00Z',
          email_count: 1,
          status: 'abandoned'
        },
        {
          id: '3',
          customer_email: 'mike.wilson@email.com',
          cart_value: 234.99,
          items_count: 4,
          abandoned_at: '2024-06-18T16:45:00Z',
          last_email_sent: '2024-06-19T10:45:00Z',
          email_count: 2,
          status: 'abandoned'
        },
        {
          id: '4',
          customer_email: 'emma.brown@email.com',
          cart_value: 67.99,
          items_count: 1,
          abandoned_at: '2024-06-19T09:20:00Z',
          status: 'recovered'
        }
      ]
      
      setCarts(mockCarts)
    } catch (error) {
      console.error('Error fetching abandoned carts:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      // Mock stats - in real implementation, this would be an API call
      const mockStats: AbandonedCartStats = {
        total_abandoned: 156,
        total_recovered: 37,
        recovery_rate: 23.7,
        total_value_abandoned: 12450.67,
        total_value_recovered: 2890.34,
        average_cart_value: 79.81
      }
      
      setStats(mockStats)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleProcessRecovery = async () => {
    setProcessingRecovery(true)
    try {
      // Mock processing - in real implementation, this would trigger recovery emails
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Update some carts to show emails were sent
      setCarts(prevCarts => 
        prevCarts.map(cart => {
          if (cart.status === 'abandoned' && cart.email_count < 2) {
            return {
              ...cart,
              last_email_sent: new Date().toISOString(),
              email_count: cart.email_count + 1
            }
          }
          return cart
        })
      )
    } catch (error) {
      console.error('Error processing recovery:', error)
    } finally {
      setProcessingRecovery(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      abandoned: { variant: 'destructive' as const, label: 'Abandoned' },
      recovered: { variant: 'default' as const, label: 'Recovered' },
      expired: { variant: 'secondary' as const, label: 'Expired' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.abandoned
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Less than 1 hour ago'
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold">Abandoned Cart Recovery</h2>
          <p className="text-muted-foreground">Track and recover abandoned shopping carts</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchAbandonedCarts}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            onClick={handleProcessRecovery}
            disabled={processingRecovery}
          >
            {processingRecovery ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Process Recovery
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recovery Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.recovery_rate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats?.total_recovered} of {stats?.total_abandoned} recovered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Value at Risk</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{stats?.total_value_abandoned.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              £{stats?.total_value_recovered.toLocaleString()} recovered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Cart Value</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{stats?.average_cart_value}</div>
            <p className="text-xs text-muted-foreground">
              Per abandoned cart
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Abandoned Carts Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Abandoned Carts
          </CardTitle>
          <CardDescription>
            Monitor and manage abandoned shopping carts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Cart Value</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Abandoned</TableHead>
                <TableHead>Recovery Status</TableHead>
                <TableHead>Last Email</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {carts.map((cart) => (
                <TableRow key={cart.id}>
                  <TableCell>
                    <div className="font-medium">{cart.customer_email}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">£{cart.cart_value}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {cart.items_count} item{cart.items_count > 1 ? 's' : ''}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{formatDate(cart.abandoned_at)}</div>
                      <div className="text-muted-foreground">
                        {getTimeAgo(cart.abandoned_at)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(cart.status)}
                      {cart.email_count > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {cart.email_count} email{cart.email_count > 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {cart.last_email_sent ? (
                      <div className="text-sm">
                        {formatDate(cart.last_email_sent)}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">None</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      {cart.status === 'abandoned' && cart.email_count < 2 && (
                        <Button size="sm">
                          <Mail className="h-4 w-4 mr-1" />
                          Send Email
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recovery Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recovery Timeline</CardTitle>
            <CardDescription>When customers typically recover their carts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Within 1 hour</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-muted rounded-full">
                    <div className="w-8 h-2 bg-primary rounded-full"></div>
                  </div>
                  <span className="text-sm font-medium">12%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">1-24 hours</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-muted rounded-full">
                    <div className="w-16 h-2 bg-primary rounded-full"></div>
                  </div>
                  <span className="text-sm font-medium">34%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">1-3 days</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-muted rounded-full">
                    <div className="w-12 h-2 bg-primary rounded-full"></div>
                  </div>
                  <span className="text-sm font-medium">28%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">After 3 days</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-muted rounded-full">
                    <div className="w-6 h-2 bg-primary rounded-full"></div>
                  </div>
                  <span className="text-sm font-medium">8%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email Performance</CardTitle>
            <CardDescription>Recovery email effectiveness</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">First Recovery Email</div>
                  <div className="text-sm text-muted-foreground">Sent 1 hour after abandonment</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">18.5%</div>
                  <div className="text-sm text-muted-foreground">recovery rate</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Follow-up Email</div>
                  <div className="text-sm text-muted-foreground">Sent 24 hours later</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">8.2%</div>
                  <div className="text-sm text-muted-foreground">recovery rate</div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <div>
                  <div className="font-medium">Overall Recovery Rate</div>
                  <div className="text-sm text-muted-foreground">Combined effectiveness</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-primary">23.7%</div>
                  <div className="text-sm text-muted-foreground">total recovery</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}