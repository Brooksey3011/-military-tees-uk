"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Layout } from '@/components/layout/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useUserProfile, type Address } from '@/hooks/use-user-profile'
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  Settings,
  Shield,
  Plus,
  Edit,
  Trash2,
  Home,
  Building,
  MapIcon
} from 'lucide-react'
import { cn, formatPrice } from '@/lib/utils'

// Order History Component
function OrderHistoryTab() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrderHistory = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/orders/history', {
        method: 'GET',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch order history')
      }

      const data = await response.json()

      if (data.success) {
        setOrders(data.orders || [])
      } else {
        setError(data.error || 'Failed to fetch orders')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrderHistory()
  }, [])

  const getStatusBadge = (status: string, paymentStatus: string) => {
    if (paymentStatus === 'completed' && status === 'paid') {
      return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>
    }
    if (status === 'pending') {
      return <Badge variant="secondary">Processing</Badge>
    }
    if (status === 'failed') {
      return <Badge variant="destructive">Failed</Badge>
    }
    return <Badge variant="outline">{status}</Badge>
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your orders...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-destructive text-2xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold mb-2">Unable to Load Orders</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchOrderHistory} variant="outline" className="rounded-none">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>
            View your past orders and track their status
          </CardDescription>
        </CardHeader>
      </Card>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
            <p className="text-muted-foreground mb-4">
              Your order history will appear here after you make your first purchase
            </p>
            <Button asChild className="rounded-none bg-gradient-to-r from-primary to-primary/90">
              <Link href="/categories">Start Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">Order #{order.order_number}</h3>
                    <p className="text-sm text-muted-foreground">
                      Placed on {new Date(order.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(order.status, order.payment_status)}
                    <p className="text-lg font-bold mt-2">{formatPrice(order.total_amount)}</p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground">Items ordered:</h4>
                  {order.order_items?.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-b-0">
                      <div className="flex-1">
                        <p className="font-medium">{item.product_name}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {item.size && <span>Size: {item.size}</span>}
                          {item.color && <span>Color: {item.color}</span>}
                          <span>Qty: {item.quantity}</span>
                          {item.sku && <span>SKU: {item.sku}</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatPrice(item.price_at_purchase)}</p>
                        <p className="text-sm text-muted-foreground">
                          Total: {formatPrice(item.price_at_purchase * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Customer Notes */}
                {order.customer_notes && (
                  <div className="mt-4 p-3 bg-muted/20 rounded-md">
                    <h5 className="font-medium text-sm mb-1">Order Notes:</h5>
                    <p className="text-sm text-muted-foreground">{order.customer_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// Force dynamic rendering for authenticated page
export const dynamic = 'force-dynamic'

export default function ProfilePage() {
  const { user, profile, loading, error, updateProfile } = useUserProfile()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editingAddress, setEditingAddress] = useState<string | null>(null)
  const [showAddAddress, setShowAddAddress] = useState(false)

  // Form states
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    date_of_birth: '',
    marketing_consent: false
  })

  const [newAddress, setNewAddress] = useState<Partial<Address>>({
    address_line_1: '',
    address_line_2: '',
    city: '',
    county: '',
    postcode: '',
    country: 'GB',
    address_type: 'home',
    is_default_shipping: false,
    is_default_billing: false
  })

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
        date_of_birth: profile.date_of_birth || '',
        marketing_consent: profile.marketing_consent || false
      })
    }
  }, [profile])

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      const result = await updateProfile({
        profile: formData
      })

      if (result?.success) {
        setIsEditing(false)
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddAddress = async () => {
    if (!newAddress.address_line_1 || !newAddress.city || !newAddress.postcode) {
      return
    }

    setIsSaving(true)
    try {
      const result = await updateProfile({
        addresses: [newAddress as Address]
      })

      if (result?.success) {
        setShowAddAddress(false)
        setNewAddress({
          address_line_1: '',
          address_line_2: '',
          city: '',
          county: '',
          postcode: '',
          country: 'GB',
          address_type: 'home',
          is_default_shipping: false,
          is_default_billing: false
        })
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return

    setIsSaving(true)
    try {
      await updateProfile({
        delete_addresses: [addressId]
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-muted/10">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading your profile...</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (error || !user || !profile) {
    return (
      <Layout>
        <div className="min-h-screen bg-muted/10">
          <div className="container mx-auto px-4 py-8">
            <Card className="max-w-md mx-auto">
              <CardContent className="p-6 text-center">
                <div className="text-destructive text-2xl mb-4">⚠️</div>
                <h2 className="text-lg font-semibold mb-2">Unable to Load Profile</h2>
                <p className="text-muted-foreground mb-4">
                  {error || 'Please try refreshing the page or logging in again.'}
                </p>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-muted/10">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold tracking-wide uppercase mb-2">
              My Profile
            </h1>
            <p className="text-muted-foreground">
              Manage your personal information and preferences
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Overview Card */}
            <Card className="lg:col-span-1 h-fit">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {profile.first_name?.[0] || user.email[0].toUpperCase()}
                  </div>
                  <div>
                    <CardTitle className="text-xl">
                      {profile.first_name || profile.last_name 
                        ? `${profile.first_name} ${profile.last_name}`.trim()
                        : 'Welcome!'
                      }
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {user.email}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="text-sm">
                    {user.email_confirmed ? 'Email Verified' : 'Email Pending'}
                  </span>
                  <Badge variant={user.email_confirmed ? 'default' : 'secondary'} className="ml-auto">
                    {user.email_confirmed ? 'Verified' : 'Pending'}
                  </Badge>
                </div>
                
                {profile.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{profile.phone}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {profile.addresses?.length || 0} saved address{profile.addresses?.length !== 1 ? 'es' : ''}
                  </span>
                </div>

                <Separator />
                
                <div className="text-xs text-muted-foreground">
                  <p>Member since {new Date(user.created_at).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Tabs value="personal" onValueChange={() => {}} className="w-full">
                <TabsList className="grid w-full grid-cols-4 rounded-none">
                  <TabsTrigger value="personal" className="rounded-none">
                    <User className="h-4 w-4 mr-2" />
                    Personal
                  </TabsTrigger>
                  <TabsTrigger value="addresses" className="rounded-none">
                    <MapPin className="h-4 w-4 mr-2" />
                    Addresses
                  </TabsTrigger>
                  <TabsTrigger value="orders" className="rounded-none">
                    <Calendar className="h-4 w-4 mr-2" />
                    Orders
                  </TabsTrigger>
                  <TabsTrigger value="preferences" className="rounded-none">
                    <Settings className="h-4 w-4 mr-2" />
                    Preferences
                  </TabsTrigger>
                </TabsList>

                {/* Personal Information Tab */}
                <TabsContent value="personal">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Personal Information</CardTitle>
                          <CardDescription>
                            Update your personal details and contact information
                          </CardDescription>
                        </div>
                        {!isEditing ? (
                          <Button 
                            variant="outline" 
                            onClick={() => setIsEditing(true)}
                            className="rounded-none"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              onClick={() => setIsEditing(false)}
                              disabled={isSaving}
                              className="rounded-none"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleSaveProfile}
                              disabled={isSaving}
                              className="rounded-none bg-gradient-to-r from-primary to-primary/90"
                            >
                              {isSaving ? 'Saving...' : 'Save Changes'}
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="first_name">First Name</Label>
                          <Input
                            id="first_name"
                            value={formData.first_name}
                            onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                            disabled={!isEditing}
                            className="rounded-none"
                          />
                        </div>
                        <div>
                          <Label htmlFor="last_name">Last Name</Label>
                          <Input
                            id="last_name"
                            value={formData.last_name}
                            onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                            disabled={!isEditing}
                            className="rounded-none"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          disabled={!isEditing}
                          className="rounded-none"
                          placeholder="e.g., +44 7123 456789"
                        />
                      </div>

                      <div>
                        <Label htmlFor="date_of_birth">Date of Birth</Label>
                        <Input
                          id="date_of_birth"
                          type="date"
                          value={formData.date_of_birth}
                          onChange={(e) => setFormData(prev => ({ ...prev, date_of_birth: e.target.value }))}
                          disabled={!isEditing}
                          className="rounded-none"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="marketing_consent">Marketing Communications</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive updates about new products and special offers
                          </p>
                        </div>
                        <Switch
                          id="marketing_consent"
                          checked={formData.marketing_consent}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, marketing_consent: checked }))}
                          disabled={!isEditing}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Addresses Tab */}
                <TabsContent value="addresses">
                  <div className="space-y-4">
                    {/* Header */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>Saved Addresses</CardTitle>
                            <CardDescription>
                              Manage your shipping and billing addresses
                            </CardDescription>
                          </div>
                          <Button
                            onClick={() => setShowAddAddress(true)}
                            className="rounded-none bg-gradient-to-r from-primary to-primary/90"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Address
                          </Button>
                        </div>
                      </CardHeader>
                    </Card>

                    {/* Add New Address Form */}
                    {showAddAddress && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Add New Address</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                              <Label htmlFor="address_line_1">Address Line 1 *</Label>
                              <Input
                                id="address_line_1"
                                value={newAddress.address_line_1 || ''}
                                onChange={(e) => setNewAddress(prev => ({ ...prev, address_line_1: e.target.value }))}
                                className="rounded-none"
                                placeholder="House number and street name"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <Label htmlFor="address_line_2">Address Line 2</Label>
                              <Input
                                id="address_line_2"
                                value={newAddress.address_line_2 || ''}
                                onChange={(e) => setNewAddress(prev => ({ ...prev, address_line_2: e.target.value }))}
                                className="rounded-none"
                                placeholder="Apartment, suite, etc."
                              />
                            </div>
                            <div>
                              <Label htmlFor="city">City *</Label>
                              <Input
                                id="city"
                                value={newAddress.city || ''}
                                onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                                className="rounded-none"
                              />
                            </div>
                            <div>
                              <Label htmlFor="county">County</Label>
                              <Input
                                id="county"
                                value={newAddress.county || ''}
                                onChange={(e) => setNewAddress(prev => ({ ...prev, county: e.target.value }))}
                                className="rounded-none"
                              />
                            </div>
                            <div>
                              <Label htmlFor="postcode">Postcode *</Label>
                              <Input
                                id="postcode"
                                value={newAddress.postcode || ''}
                                onChange={(e) => setNewAddress(prev => ({ ...prev, postcode: e.target.value.toUpperCase() }))}
                                className="rounded-none"
                                placeholder="SW1A 1AA"
                              />
                            </div>
                            <div>
                              <Label htmlFor="address_type">Address Type</Label>
                              <select
                                id="address_type"
                                value={newAddress.address_type || 'home'}
                                onChange={(e) => setNewAddress(prev => ({ ...prev, address_type: e.target.value as 'home' | 'work' | 'other' }))}
                                className="flex h-10 w-full rounded-none border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <option value="home">Home</option>
                                <option value="work">Work</option>
                                <option value="other">Other</option>
                              </select>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="is_default_shipping"
                                checked={newAddress.is_default_shipping || false}
                                onCheckedChange={(checked) => setNewAddress(prev => ({ ...prev, is_default_shipping: checked }))}
                              />
                              <Label htmlFor="is_default_shipping">Default shipping address</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="is_default_billing"
                                checked={newAddress.is_default_billing || false}
                                onCheckedChange={(checked) => setNewAddress(prev => ({ ...prev, is_default_billing: checked }))}
                              />
                              <Label htmlFor="is_default_billing">Default billing address</Label>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              onClick={() => setShowAddAddress(false)}
                              disabled={isSaving}
                              className="rounded-none"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleAddAddress}
                              disabled={isSaving || !newAddress.address_line_1 || !newAddress.city || !newAddress.postcode}
                              className="rounded-none bg-gradient-to-r from-primary to-primary/90"
                            >
                              {isSaving ? 'Adding...' : 'Add Address'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Existing Addresses */}
                    {profile.addresses && profile.addresses.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {profile.addresses.map((address) => (
                          <Card key={address.id}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    {address.address_type === 'home' && <Home className="h-4 w-4 text-muted-foreground" />}
                                    {address.address_type === 'work' && <Building className="h-4 w-4 text-muted-foreground" />}
                                    {address.address_type === 'other' && <MapIcon className="h-4 w-4 text-muted-foreground" />}
                                    <span className="font-medium capitalize">{address.address_type}</span>
                                    <div className="flex gap-1 ml-auto">
                                      {address.is_default_shipping && <Badge variant="secondary" className="text-xs">Default Shipping</Badge>}
                                      {address.is_default_billing && <Badge variant="secondary" className="text-xs">Default Billing</Badge>}
                                    </div>
                                  </div>
                                  <div className="text-sm text-muted-foreground space-y-1">
                                    <p>{address.address_line_1}</p>
                                    {address.address_line_2 && <p>{address.address_line_2}</p>}
                                    <p>{address.city}{address.county && `, ${address.county}`}</p>
                                    <p>{address.postcode}</p>
                                  </div>
                                </div>
                                <div className="flex gap-1 ml-4">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setEditingAddress(address.id || null)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => address.id && handleDeleteAddress(address.id)}
                                    className="h-8 w-8 p-0 text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">No addresses saved</h3>
                          <p className="text-muted-foreground mb-4">
                            Add your shipping and billing addresses for faster checkout
                          </p>
                          <Button
                            onClick={() => setShowAddAddress(true)}
                            className="rounded-none bg-gradient-to-r from-primary to-primary/90"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Your First Address
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                {/* Orders Tab */}
                <TabsContent value="orders">
                  <OrderHistoryTab />
                </TabsContent>

                {/* Preferences Tab */}
                <TabsContent value="preferences">
                  <Card>
                    <CardHeader>
                      <CardTitle>Account Preferences</CardTitle>
                      <CardDescription>
                        Customize your shopping experience and privacy settings
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Email Marketing</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive updates about new products, sales, and military events
                          </p>
                        </div>
                        <Switch
                          checked={profile.marketing_consent}
                          onCheckedChange={(checked) => updateProfile({
                            profile: { marketing_consent: checked }
                          })}
                        />
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h4 className="font-medium">Privacy & Data</h4>
                        <div className="text-sm text-muted-foreground space-y-2">
                          <p>• Your personal information is encrypted and secure</p>
                          <p>• We never share your data with third parties</p>
                          <p>• You can request data deletion at any time</p>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h4 className="font-medium">Account Actions</h4>
                        <div className="space-y-2">
                          <Button variant="outline" className="rounded-none w-full justify-start">
                            <Mail className="h-4 w-4 mr-2" />
                            Request Data Export
                          </Button>
                          <Button variant="outline" className="rounded-none w-full justify-start text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Account
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}