"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Mail, 
  Plus, 
  Send, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  Eye,
  Calendar,
  Users,
  TrendingUp,
  MousePointer
} from 'lucide-react'

interface EmailCampaign {
  id: string
  name: string
  type: string
  subject: string
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused'
  recipient_count: number
  delivered_count: number
  opened_count: number
  clicked_count: number
  scheduled_for?: string
  sent_at?: string
  created_at: string
}

export function CampaignManager() {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    type: 'newsletter',
    subject: '',
    template_name: 'newsletter_weekly',
    sender_email: 'info@militarytees.co.uk',
    sender_name: 'Military Tees UK'
  })

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    try {
      // Mock data - in real implementation, this would be an API call
      const mockCampaigns: EmailCampaign[] = [
        {
          id: '1',
          name: 'Summer Sale 2024',
          type: 'promotional',
          subject: '🎖️ 25% OFF Everything - Summer Military Sale!',
          status: 'sent',
          recipient_count: 1247,
          delivered_count: 1198,
          opened_count: 287,
          clicked_count: 42,
          sent_at: '2024-06-15T10:00:00Z',
          created_at: '2024-06-14T14:30:00Z'
        },
        {
          id: '2',
          name: 'Weekly Newsletter #24',
          type: 'newsletter',
          subject: 'Weekly Military Heritage Update 🛡️',
          status: 'scheduled',
          recipient_count: 892,
          delivered_count: 0,
          opened_count: 0,
          clicked_count: 0,
          scheduled_for: '2024-06-20T09:00:00Z',
          created_at: '2024-06-18T16:45:00Z'
        },
        {
          id: '3',
          name: 'New Product Launch',
          type: 'product_announcement',
          subject: '🚀 New Arrival: Elite Forces Collection',
          status: 'draft',
          recipient_count: 0,
          delivered_count: 0,
          opened_count: 0,
          clicked_count: 0,
          created_at: '2024-06-19T11:20:00Z'
        }
      ]
      
      setCampaigns(mockCampaigns)
    } catch (error) {
      console.error('Error fetching campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCampaign = async () => {
    try {
      // Mock creation - in real implementation, this would be an API call
      const mockNewCampaign: EmailCampaign = {
        id: Date.now().toString(),
        ...newCampaign,
        status: 'draft',
        recipient_count: 0,
        delivered_count: 0,
        opened_count: 0,
        clicked_count: 0,
        created_at: new Date().toISOString()
      }
      
      setCampaigns([mockNewCampaign, ...campaigns])
      setShowCreateDialog(false)
      setNewCampaign({
        name: '',
        type: 'newsletter',
        subject: '',
        template_name: 'newsletter_weekly',
        sender_email: 'info@militarytees.co.uk',
        sender_name: 'Military Tees UK'
      })
    } catch (error) {
      console.error('Error creating campaign:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { variant: 'secondary' as const, label: 'Draft' },
      scheduled: { variant: 'outline' as const, label: 'Scheduled' },
      sending: { variant: 'default' as const, label: 'Sending' },
      sent: { variant: 'default' as const, label: 'Sent' },
      paused: { variant: 'destructive' as const, label: 'Paused' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const calculateMetrics = (campaign: EmailCampaign) => {
    const openRate = campaign.delivered_count > 0 ? 
      ((campaign.opened_count / campaign.delivered_count) * 100).toFixed(1) : '0.0'
    const clickRate = campaign.delivered_count > 0 ? 
      ((campaign.clicked_count / campaign.delivered_count) * 100).toFixed(1) : '0.0'
    
    return { openRate, clickRate }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold">Email Campaigns</h2>
          <p className="text-muted-foreground">Create and manage email marketing campaigns</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Campaign</DialogTitle>
              <DialogDescription>
                Set up a new email marketing campaign
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Campaign Name</label>
                  <Input
                    placeholder="e.g., Summer Sale 2024"
                    value={newCampaign.name}
                    onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Campaign Type</label>
                  <Select value={newCampaign.type} onValueChange={(value) => setNewCampaign({ ...newCampaign, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newsletter">Newsletter</SelectItem>
                      <SelectItem value="promotional">Promotional</SelectItem>
                      <SelectItem value="product_announcement">Product Announcement</SelectItem>
                      <SelectItem value="welcome">Welcome Series</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Subject</label>
                <Input
                  placeholder="Enter email subject line"
                  value={newCampaign.subject}
                  onChange={(e) => setNewCampaign({ ...newCampaign, subject: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Template</label>
                  <Select value={newCampaign.template_name} onValueChange={(value) => setNewCampaign({ ...newCampaign, template_name: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newsletter_weekly">Weekly Newsletter</SelectItem>
                      <SelectItem value="promotional_sale">Promotional Sale</SelectItem>
                      <SelectItem value="product_announcement">Product Announcement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sender Name</label>
                  <Input
                    value={newCampaign.sender_name}
                    onChange={(e) => setNewCampaign({ ...newCampaign, sender_name: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateCampaign} disabled={!newCampaign.name || !newCampaign.subject}>
                  Create Campaign
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Campaign Overview
          </CardTitle>
          <CardDescription>
            Manage your email marketing campaigns and track performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => {
                const { openRate, clickRate } = calculateMetrics(campaign)
                return (
                  <TableRow key={campaign.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{campaign.name}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-xs">
                          {campaign.subject}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {campaign.type.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(campaign.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {campaign.recipient_count.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      {campaign.status === 'sent' ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Eye className="h-3 w-3" />
                            {openRate}% opened
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MousePointer className="h-3 w-3" />
                            {clickRate}% clicked
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {campaign.sent_at ? (
                          <>Sent {formatDate(campaign.sent_at)}</>
                        ) : campaign.scheduled_for ? (
                          <>Scheduled {formatDate(campaign.scheduled_for)}</>
                        ) : (
                          <>Created {formatDate(campaign.created_at)}</>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {campaign.status === 'draft' && (
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        )}
                        {campaign.status === 'scheduled' && (
                          <Button size="sm" variant="outline">
                            <Pause className="h-4 w-4 mr-1" />
                            Pause
                          </Button>
                        )}
                        {campaign.status === 'sent' && (
                          <Button size="sm" variant="outline">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            Report
                          </Button>
                        )}
                        <Button size="sm" variant="ghost">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}