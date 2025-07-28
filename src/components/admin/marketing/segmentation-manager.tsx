"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw,
  Target,
  TrendingUp,
  Filter,
  Eye,
  Settings
} from 'lucide-react'

interface CustomerSegment {
  id: string
  name: string
  description: string
  is_dynamic: boolean
  customer_count: number
  criteria: Record<string, any>
  last_updated: string
  created_at: string
}

export function SegmentationManager() {
  const [segments, setSegments] = useState<CustomerSegment[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total_segments: 0,
    dynamic_segments: 0,
    static_segments: 0,
    total_customers_segmented: 0,
    largest_segment: { name: '', count: 0 }
  })

  useEffect(() => {
    fetchSegments()
    fetchStats()
  }, [])

  const fetchSegments = async () => {
    try {
      // Mock data - in real implementation, this would be an API call
      const mockSegments: CustomerSegment[] = [
        {
          id: '1',
          name: 'High Value Customers',
          description: 'Customers who have spent over £200',
          is_dynamic: true,
          customer_count: 287,
          criteria: { min_total_spent: 200 },
          last_updated: '2024-06-19T15:30:00Z',
          created_at: '2024-06-01T10:00:00Z'
        },
        {
          id: '2',
          name: 'Frequent Buyers',
          description: 'Customers with 5+ completed orders',
          is_dynamic: true,
          customer_count: 156,
          criteria: { min_order_count: 5 },
          last_updated: '2024-06-19T14:20:00Z',
          created_at: '2024-06-01T10:00:00Z'
        },
        {
          id: '3',
          name: 'Military Veterans',
          description: 'Verified military veteran customers',
          is_dynamic: true,
          customer_count: 89,
          criteria: { tags: ['veteran'] },
          last_updated: '2024-06-19T12:45:00Z',
          created_at: '2024-06-01T10:00:00Z'
        },
        {
          id: '4',
          name: 'Recent Customers',
          description: 'Customers who joined in the last 30 days',
          is_dynamic: true,
          customer_count: 124,
          criteria: { 
            registered_after: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
          },
          last_updated: '2024-06-19T16:00:00Z',
          created_at: '2024-06-01T10:00:00Z'
        },
        {
          id: '5',
          name: 'Dormant Customers',
          description: 'Customers who haven\'t ordered in 90+ days',
          is_dynamic: true,
          customer_count: 312,
          criteria: { days_since_last_order: 90 },
          last_updated: '2024-06-19T11:15:00Z',
          created_at: '2024-06-01T10:00:00Z'
        },
        {
          id: '6',
          name: 'VIP Campaign Recipients',
          description: 'Manually selected VIP customers',
          is_dynamic: false,
          customer_count: 45,
          criteria: {},
          last_updated: '2024-06-18T09:30:00Z',
          created_at: '2024-06-01T10:00:00Z'
        },
        {
          id: '7',
          name: 'Newsletter Subscribers',
          description: 'Active newsletter subscribers',
          is_dynamic: true,
          customer_count: 892,
          criteria: { newsletter_active: true },
          last_updated: '2024-06-19T13:20:00Z',
          created_at: '2024-06-01T10:00:00Z'
        },
        {
          id: '8',
          name: 'Single Purchase Customers',
          description: 'Customers who have made exactly one purchase',
          is_dynamic: true,
          customer_count: 203,
          criteria: { min_order_count: 1, max_order_count: 1 },
          last_updated: '2024-06-19T14:50:00Z',
          created_at: '2024-06-01T10:00:00Z'
        }
      ]
      
      setSegments(mockSegments)
    } catch (error) {
      console.error('Error fetching segments:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      // Mock stats - in real implementation, this would be an API call
      const mockStats = {
        total_segments: 8,
        dynamic_segments: 7,
        static_segments: 1,
        total_customers_segmented: 1247,
        largest_segment: { name: 'Newsletter Subscribers', count: 892 }
      }
      
      setStats(mockStats)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleRefreshSegments = async () => {
    setLoading(true)
    try {
      // Mock refresh - in real implementation, this would trigger segment updates
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulate some changes in customer counts
      setSegments(prevSegments => 
        prevSegments.map(segment => ({
          ...segment,
          customer_count: segment.is_dynamic ? 
            segment.customer_count + Math.floor(Math.random() * 10 - 5) : 
            segment.customer_count,
          last_updated: new Date().toISOString()
        }))
      )
    } catch (error) {
      console.error('Error refreshing segments:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCriteria = (criteria: Record<string, any>) => {
    const conditions = []
    
    if (criteria.min_total_spent) {
      conditions.push(`Spent £${criteria.min_total_spent}+`)
    }
    if (criteria.min_order_count) {
      conditions.push(`${criteria.min_order_count}+ orders`)
    }
    if (criteria.max_order_count) {
      conditions.push(`≤${criteria.max_order_count} orders`)
    }
    if (criteria.days_since_last_order) {
      conditions.push(`${criteria.days_since_last_order}+ days since order`)
    }
    if (criteria.tags && Array.isArray(criteria.tags)) {
      conditions.push(`Tagged: ${criteria.tags.join(', ')}`)
    }
    if (criteria.newsletter_active) {
      conditions.push('Newsletter subscriber')
    }
    if (criteria.registered_after) {
      const date = new Date(criteria.registered_after)
      conditions.push(`Registered after ${date.toLocaleDateString()}`)
    }
    
    return conditions.length > 0 ? conditions.join(', ') : 'No criteria'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
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
          <h2 className="text-2xl font-display font-bold">Customer Segmentation</h2>
          <p className="text-muted-foreground">Create and manage customer segments for targeted marketing</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefreshSegments}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh All
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Segment
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Segments</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_segments}</div>
            <p className="text-xs text-muted-foreground">
              {stats.dynamic_segments} dynamic, {stats.static_segments} static
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers Segmented</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_customers_segmented.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all segments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Largest Segment</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.largest_segment.count}</div>
            <p className="text-xs text-muted-foreground">
              {stats.largest_segment.name}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Segment Size</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(stats.total_customers_segmented / stats.total_segments)}
            </div>
            <p className="text-xs text-muted-foreground">
              Customers per segment
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Segments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Customer Segments
          </CardTitle>
          <CardDescription>
            Manage your customer segments and their targeting criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Segment Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Customers</TableHead>
                <TableHead>Criteria</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {segments.map((segment) => (
                <TableRow key={segment.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{segment.name}</div>
                      <div className="text-sm text-muted-foreground max-w-xs truncate">
                        {segment.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={segment.is_dynamic ? "default" : "secondary"}>
                      {segment.is_dynamic ? 'Dynamic' : 'Static'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="font-medium">{segment.customer_count.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">
                        ({((segment.customer_count / stats.total_customers_segmented) * 100).toFixed(1)}%)
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm max-w-xs truncate">
                      {formatCriteria(segment.criteria)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatDate(segment.last_updated)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      {segment.is_dynamic && (
                        <Button size="sm" variant="outline">
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Refresh
                        </Button>
                      )}
                      <Button size="sm" variant="ghost">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Segment Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Quick Start Templates
          </CardTitle>
          <CardDescription>
            Create segments quickly using pre-built templates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer">
              <h4 className="font-medium mb-2">Big Spenders</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Customers who have spent over £500
              </p>
              <Badge variant="outline" className="text-xs">
                min_total_spent: 500
              </Badge>
            </div>
            
            <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer">
              <h4 className="font-medium mb-2">Win-Back Campaign</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Customers inactive for 6+ months
              </p>
              <Badge variant="outline" className="text-xs">
                days_since_last_order: 180
              </Badge>
            </div>
            
            <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer">
              <h4 className="font-medium mb-2">New Members</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Customers who joined in last 7 days
              </p>
              <Badge variant="outline" className="text-xs">
                registered_after: 7d
              </Badge>
            </div>
            
            <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer">
              <h4 className="font-medium mb-2">Loyalty Program</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Customers with 10+ orders
              </p>
              <Badge variant="outline" className="text-xs">
                min_order_count: 10
              </Badge>
            </div>
            
            <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer">
              <h4 className="font-medium mb-2">One-Time Buyers</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Customers with exactly 1 order
              </p>
              <Badge variant="outline" className="text-xs">
                order_count: 1
              </Badge>
            </div>
            
            <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer">
              <h4 className="font-medium mb-2">Geographic Segment</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Customers from specific regions
              </p>
              <Badge variant="outline" className="text-xs">
                location: custom
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}