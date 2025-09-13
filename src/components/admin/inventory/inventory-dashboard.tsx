"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Package, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  Search,
  Filter,
  RefreshCw,
  Download,
  Bell,
  Eye,
  Edit,
  MoreVertical
} from 'lucide-react'
import { InventoryItem, InventoryStats, LowStockAlert } from '@/lib/inventory/inventory-service'

interface InventoryDashboardProps {
  initialStats?: InventoryStats
  initialItems?: InventoryItem[]
  initialAlerts?: LowStockAlert[]
}

export function InventoryDashboard({ 
  initialStats, 
  initialItems = [], 
  initialAlerts = [] 
}: InventoryDashboardProps) {
  const [stats, setStats] = useState<InventoryStats | null>(initialStats || null)
  const [items, setItems] = useState<InventoryItem[]>(initialItems)
  const [alerts, setAlerts] = useState<LowStockAlert[]>(initialAlerts)
  const [loading, setLoading] = useState(!initialStats)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [showLowStock, setShowLowStock] = useState(false)
  const [showOutOfStock, setShowOutOfStock] = useState(false)
  const [page, setPage] = useState(0)
  const [totalItems, setTotalItems] = useState(0)

  // Load initial data
  useEffect(() => {
    if (!initialStats) {
      loadDashboardData()
    }
  }, [initialStats])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      // Load stats, items, and alerts in parallel
      const [statsResponse, itemsResponse, alertsResponse] = await Promise.all([
        fetch('/api/admin/inventory/stats'),
        fetch('/api/admin/inventory'),
        fetch('/api/admin/inventory/alerts?acknowledged=false')
      ])

      const [statsData, itemsData, alertsData] = await Promise.all([
        statsResponse.json(),
        itemsResponse.json(),
        alertsResponse.json()
      ])

      if (statsData.success) setStats(statsData.data)
      if (itemsData.success) {
        setItems(itemsData.data.items)
        setTotalItems(itemsData.data.total)
      }
      if (alertsData.success) setAlerts(alertsData.data.alerts)

    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...(searchTerm && { search: searchTerm }),
        ...(filterCategory !== 'all' && { category: filterCategory }),
        ...(showLowStock && { lowStock: 'true' }),
        ...(showOutOfStock && { outOfStock: 'true' })
      })

      const response = await fetch(`/api/admin/inventory?${params}`)
      const data = await response.json()

      if (data.success) {
        setItems(data.data.items)
        setTotalItems(data.data.total)
      }
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStockStatusColor = (item: InventoryItem) => {
    if (item.available_stock === 0) return 'bg-red-500'
    if (item.available_stock <= item.reorder_point) return 'bg-amber-500'
    return 'bg-green-500'
  }

  const getStockStatusText = (item: InventoryItem) => {
    if (item.available_stock === 0) return 'Out of Stock'
    if (item.available_stock <= item.reorder_point) return 'Low Stock'
    return 'In Stock'
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Inventory Management
          </h1>
          <p className="text-muted-foreground">
            Monitor stock levels and manage inventory operations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadDashboardData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_variants}</div>
              <p className="text-xs text-muted-foreground">
                {stats.total_products} product lines
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{stats.low_stock_items}</div>
              <p className="text-xs text-muted-foreground">
                Require attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.out_of_stock_items}</div>
              <p className="text-xs text-muted-foreground">
                Immediate action needed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">£{stats.total_inventory_value.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Total stock value
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Low Stock Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-amber-500" />
              Low Stock Alerts
            </CardTitle>
            <CardDescription>
              Items requiring immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge className={getPriorityColor(alert.priority)}>
                      {alert.priority.toUpperCase()}
                    </Badge>
                    <div>
                      <p className="font-medium">{alert.product_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {alert.variant_details.size && `Size: ${alert.variant_details.size}`}
                        {alert.variant_details.color && ` • Color: ${alert.variant_details.color}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{alert.current_stock} units</p>
                    <p className="text-sm text-muted-foreground">
                      Reorder: {alert.suggested_reorder_quantity}
                    </p>
                  </div>
                </div>
              ))}
              
              {alerts.length > 5 && (
                <Button variant="outline" className="w-full">
                  View All {alerts.length} Alerts
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
          <CardDescription>
            Manage stock levels and monitor inventory status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products, SKUs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>
            
            {/* @ts-ignore */}
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="t-shirts">T-Shirts</SelectItem>
                <SelectItem value="hoodies">Hoodies</SelectItem>
                <SelectItem value="accessories">Accessories</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                variant={showLowStock ? "default" : "outline"}
                size="sm"
                onClick={() => setShowLowStock(!showLowStock)}
              >
                <Filter className="h-4 w-4 mr-1" />
                Low Stock
              </Button>
              <Button
                variant={showOutOfStock ? "default" : "outline"}
                size="sm"
                onClick={() => setShowOutOfStock(!showOutOfStock)}
              >
                <Filter className="h-4 w-4 mr-1" />
                Out of Stock
              </Button>
            </div>

            <Button onClick={handleSearch} disabled={loading}>
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {/* Inventory Table */}
          <div className="border rounded-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium">Product</th>
                    <th className="text-left p-4 font-medium">SKU</th>
                    <th className="text-left p-4 font-medium">Stock Level</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Reorder Point</th>
                    <th className="text-left p-4 font-medium">Last Updated</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-t hover:bg-muted/30">
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{item.product_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.variant_details.size && `Size: ${item.variant_details.size}`}
                            {item.variant_details.color && ` • Color: ${item.variant_details.color}`}
                          </p>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-sm">{item.sku}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div 
                            className={`w-2 h-2 rounded-full ${getStockStatusColor(item)}`}
                          />
                          <span className="font-medium">{item.available_stock}</span>
                          {item.reserved_stock > 0 && (
                            <span className="text-sm text-muted-foreground">
                              ({item.reserved_stock} reserved)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge 
                          variant="secondary"
                          className={getStockStatusColor(item).replace('bg-', 'text-') + ' bg-opacity-10'}
                        >
                          {getStockStatusText(item)}
                        </Badge>
                      </td>
                      <td className="p-4">{item.reorder_point}</td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {new Date(item.updated_at).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {items.length === 0 && !loading && (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No inventory items found</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalItems > 50 && (
            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {page * 50 + 1} to {Math.min((page + 1) * 50, totalItems)} of {totalItems} items
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                >
                  Previous
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={(page + 1) * 50 >= totalItems}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}