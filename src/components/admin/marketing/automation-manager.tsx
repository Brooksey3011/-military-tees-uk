"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Zap, 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Pause,
  Clock,
  Mail,
  Users,
  Target,
  Activity,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface AutomationRule {
  id: string
  name: string
  trigger_type: string
  action_type: string
  delay_minutes: number
  is_active: boolean
  priority: number
  executions_today: number
  success_rate: number
  created_at: string
}

interface AutomationExecution {
  id: string
  rule_name: string
  customer_email: string
  status: 'pending' | 'executed' | 'failed' | 'skipped'
  scheduled_for: string
  executed_at?: string
  error_message?: string
}

export function AutomationManager() {
  const [rules, setRules] = useState<AutomationRule[]>([])
  const [executions, setExecutions] = useState<AutomationExecution[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    active_rules: 0,
    executions_today: 0,
    success_rate: 0,
    total_executions: 0
  })

  useEffect(() => {
    fetchAutomationData()
  }, [])

  const fetchAutomationData = async () => {
    try {
      // Mock data - in real implementation, these would be API calls
      const mockRules: AutomationRule[] = [
        {
          id: '1',
          name: 'Abandoned Cart Recovery - 1 Hour',
          trigger_type: 'cart_abandoned',
          action_type: 'send_email',
          delay_minutes: 60,
          is_active: true,
          priority: 1,
          executions_today: 18,
          success_rate: 89,
          created_at: '2024-06-01T10:00:00Z'
        },
        {
          id: '2',
          name: 'Abandoned Cart Follow-up - 24 Hours',
          trigger_type: 'cart_abandoned',
          action_type: 'send_email',
          delay_minutes: 1440,
          is_active: true,
          priority: 2,
          executions_today: 12,
          success_rate: 76,
          created_at: '2024-06-01T10:00:00Z'
        },
        {
          id: '3',
          name: 'Welcome Email for New Customers',
          trigger_type: 'first_purchase',
          action_type: 'send_email',
          delay_minutes: 0,
          is_active: true,
          priority: 1,
          executions_today: 5,
          success_rate: 95,
          created_at: '2024-06-01T10:00:00Z'
        },
        {
          id: '4',
          name: 'Repeat Customer Thank You',
          trigger_type: 'repeat_purchase',
          action_type: 'send_email',
          delay_minutes: 30,
          is_active: false,
          priority: 3,
          executions_today: 0,
          success_rate: 82,
          created_at: '2024-06-01T10:00:00Z'
        },
        {
          id: '5',
          name: 'Add High Value Customers to VIP Segment',
          trigger_type: 'first_purchase',
          action_type: 'add_to_segment',
          delay_minutes: 0,
          is_active: true,
          priority: 2,
          executions_today: 3,
          success_rate: 100,
          created_at: '2024-06-01T10:00:00Z'
        }
      ]

      const mockExecutions: AutomationExecution[] = [
        {
          id: '1',
          rule_name: 'Abandoned Cart Recovery - 1 Hour',
          customer_email: 'john.smith@email.com',
          status: 'executed',
          scheduled_for: '2024-06-19T15:30:00Z',
          executed_at: '2024-06-19T15:30:05Z'
        },
        {
          id: '2',
          rule_name: 'Welcome Email for New Customers',
          customer_email: 'sarah.jones@email.com',
          status: 'executed',
          scheduled_for: '2024-06-19T14:15:00Z',
          executed_at: '2024-06-19T14:15:02Z'
        },
        {
          id: '3',
          rule_name: 'Abandoned Cart Follow-up - 24 Hours',
          customer_email: 'mike.wilson@email.com',
          status: 'pending',
          scheduled_for: '2024-06-19T16:45:00Z'
        },
        {
          id: '4',
          rule_name: 'Abandoned Cart Recovery - 1 Hour',
          customer_email: 'emma.brown@email.com',
          status: 'failed',
          scheduled_for: '2024-06-19T15:00:00Z',
          error_message: 'Invalid email address'
        }
      ]

      const mockStats = {
        active_rules: mockRules.filter(r => r.is_active).length,
        executions_today: mockRules.reduce((sum, r) => sum + r.executions_today, 0),
        success_rate: 87,
        total_executions: 1247
      }

      setRules(mockRules)
      setExecutions(mockExecutions)
      setStats(mockStats)
    } catch (error) {
      console.error('Error fetching automation data:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleRuleStatus = async (ruleId: string, isActive: boolean) => {
    try {
      setRules(prevRules => 
        prevRules.map(rule => 
          rule.id === ruleId ? { ...rule, is_active: isActive } : rule
        )
      )
      
      // In real implementation, this would be an API call
      console.log(`Rule ${ruleId} ${isActive ? 'activated' : 'deactivated'}`)
    } catch (error) {
      console.error('Error toggling rule status:', error)
    }
  }

  const getTriggerTypeLabel = (triggerType: string) => {
    const labels = {
      cart_abandoned: 'Cart Abandoned',
      first_purchase: 'First Purchase',
      repeat_purchase: 'Repeat Purchase',
      birthday: 'Birthday',
      time_based: 'Time Based',
      behavior: 'Behavior'
    }
    return labels[triggerType as keyof typeof labels] || triggerType
  }

  const getActionTypeLabel = (actionType: string) => {
    const labels = {
      send_email: 'Send Email',
      add_to_segment: 'Add to Segment',
      send_sms: 'Send SMS',
      create_discount: 'Create Discount'
    }
    return labels[actionType as keyof typeof labels] || actionType
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, label: 'Pending', icon: Clock },
      executed: { variant: 'default' as const, label: 'Executed', icon: CheckCircle },
      failed: { variant: 'destructive' as const, label: 'Failed', icon: XCircle },
      skipped: { variant: 'outline' as const, label: 'Skipped', icon: Pause }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const IconComponent = config.icon
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <IconComponent className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const formatDelay = (minutes: number) => {
    if (minutes === 0) return 'Immediate'
    if (minutes < 60) return `${minutes} min`
    if (minutes < 1440) return `${Math.floor(minutes / 60)} hour${Math.floor(minutes / 60) > 1 ? 's' : ''}`
    return `${Math.floor(minutes / 1440)} day${Math.floor(minutes / 1440) > 1 ? 's' : ''}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
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
          <h2 className="text-2xl font-display font-bold">Marketing Automation</h2>
          <p className="text-muted-foreground">Create and manage automated marketing workflows</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Rule
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rules</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active_rules}</div>
            <p className="text-xs text-muted-foreground">
              {rules.length - stats.active_rules} inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Executions Today</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.executions_today}</div>
            <p className="text-xs text-muted-foreground">
              Automated actions triggered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.success_rate}%</div>
            <p className="text-xs text-muted-foreground">
              Actions completed successfully
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_executions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              All-time executions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Automation Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Automation Rules
          </CardTitle>
          <CardDescription>
            Manage automated marketing workflows and triggers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rule Name</TableHead>
                <TableHead>Trigger</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Delay</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{rule.name}</div>
                      <Badge variant="outline" className="mt-1 text-xs">
                        Priority {rule.priority}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {getTriggerTypeLabel(rule.trigger_type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {rule.action_type === 'send_email' && <Mail className="h-4 w-4" />}
                      {rule.action_type === 'add_to_segment' && <Users className="h-4 w-4" />}
                      <span className="text-sm">{getActionTypeLabel(rule.action_type)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{formatDelay(rule.delay_minutes)}</span>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">
                        {rule.executions_today} executions today
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {rule.success_rate}% success rate
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={rule.is_active}
                        onCheckedChange={(checked) => toggleRuleStatus(rule.id, checked)}
                      />
                      <span className="text-sm">
                        {rule.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
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

      {/* Recent Executions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Executions
          </CardTitle>
          <CardDescription>
            Latest automation executions and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rule</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Executed</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Error</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {executions.map((execution) => (
                <TableRow key={execution.id}>
                  <TableCell>
                    <div className="font-medium text-sm">{execution.rule_name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{execution.customer_email}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{formatDate(execution.scheduled_for)}</div>
                  </TableCell>
                  <TableCell>
                    {execution.executed_at ? (
                      <div className="text-sm">{formatDate(execution.executed_at)}</div>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(execution.status)}
                  </TableCell>
                  <TableCell>
                    {execution.error_message ? (
                      <div className="text-sm text-destructive max-w-xs truncate">
                        {execution.error_message}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}