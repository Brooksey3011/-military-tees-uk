"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Target, 
  Plus, 
  Play, 
  Pause, 
  Trophy,
  TrendingUp,
  Eye,
  MousePointer,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react'

interface ABTest {
  id: string
  name: string
  test_type: string
  status: 'draft' | 'running' | 'completed' | 'paused'
  traffic_split: number
  start_date?: string
  end_date?: string
  winner_variant?: 'A' | 'B'
  statistical_significance?: number
  variant_a: {
    sent: number
    opened: number
    clicked: number
    converted: number
    open_rate: number
    click_rate: number
    conversion_rate: number
  }
  variant_b: {
    sent: number
    opened: number
    clicked: number
    converted: number
    open_rate: number
    click_rate: number
    conversion_rate: number
  }
  created_at: string
}

export function ABTestingDashboard() {
  const [tests, setTests] = useState<ABTest[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total_tests: 0,
    running_tests: 0,
    completed_tests: 0,
    avg_improvement: 0,
    total_participants: 0
  })

  useEffect(() => {
    fetchABTests()
    fetchStats()
  }, [])

  const fetchABTests = async () => {
    try {
      // Mock data - in real implementation, this would be an API call
      const mockTests: ABTest[] = [
        {
          id: '1',
          name: 'Summer Sale Subject Line Test',
          test_type: 'email_subject',
          status: 'completed',
          traffic_split: 0.5,
          start_date: '2024-06-15T09:00:00Z',
          end_date: '2024-06-18T17:00:00Z',
          winner_variant: 'B',
          statistical_significance: 96.7,
          variant_a: {
            sent: 623,
            opened: 167,
            clicked: 23,
            converted: 8,
            open_rate: 26.8,
            click_rate: 3.7,
            conversion_rate: 1.3
          },
          variant_b: {
            sent: 624,
            opened: 218,
            clicked: 41,
            converted: 18,
            open_rate: 34.9,
            click_rate: 6.6,
            conversion_rate: 2.9
          },
          created_at: '2024-06-14T16:30:00Z'
        },
        {
          id: '2',
          name: 'Newsletter Send Time Optimization',
          test_type: 'send_time',
          status: 'running',
          traffic_split: 0.5,
          start_date: '2024-06-19T08:00:00Z',
          variant_a: {
            sent: 234,
            opened: 56,
            clicked: 12,
            converted: 3,
            open_rate: 23.9,
            click_rate: 5.1,
            conversion_rate: 1.3
          },
          variant_b: {
            sent: 237,
            opened: 71,
            clicked: 18,
            converted: 7,
            open_rate: 30.0,
            click_rate: 7.6,
            conversion_rate: 3.0
          },
          created_at: '2024-06-18T14:20:00Z'
        },
        {
          id: '3',
          name: 'Product Announcement CTA Test',
          test_type: 'email_content',
          status: 'running',
          traffic_split: 0.6,
          start_date: '2024-06-18T10:00:00Z',
          variant_a: {
            sent: 456,
            opened: 89,
            clicked: 15,
            converted: 4,
            open_rate: 19.5,
            click_rate: 3.3,
            conversion_rate: 0.9
          },
          variant_b: {
            sent: 304,
            opened: 67,
            clicked: 19,
            converted: 8,
            open_rate: 22.0,
            click_rate: 6.3,
            conversion_rate: 2.6
          },
          created_at: '2024-06-17T11:45:00Z'
        },
        {
          id: '4',
          name: 'Abandoned Cart Sender Name Test',
          test_type: 'sender_name',
          status: 'draft',
          traffic_split: 0.5,
          variant_a: {
            sent: 0,
            opened: 0,
            clicked: 0,
            converted: 0,
            open_rate: 0,
            click_rate: 0,
            conversion_rate: 0
          },
          variant_b: {
            sent: 0,
            opened: 0,
            clicked: 0,
            converted: 0,
            open_rate: 0,
            click_rate: 0,
            conversion_rate: 0
          },
          created_at: '2024-06-19T13:15:00Z'
        }
      ]
      
      setTests(mockTests)
    } catch (error) {
      console.error('Error fetching A/B tests:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      // Mock stats - in real implementation, this would be an API call
      const mockStats = {
        total_tests: 15,
        running_tests: 2,
        completed_tests: 12,
        avg_improvement: 18.3,
        total_participants: 8945
      }
      
      setStats(mockStats)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { variant: 'secondary' as const, label: 'Draft', icon: Calendar },
      running: { variant: 'default' as const, label: 'Running', icon: Play },
      completed: { variant: 'outline' as const, label: 'Completed', icon: CheckCircle },
      paused: { variant: 'destructive' as const, label: 'Paused', icon: Pause }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    const IconComponent = config.icon
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <IconComponent className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getTestTypeLabel = (testType: string) => {
    const labels = {
      email_subject: 'Subject Line',
      email_content: 'Email Content',
      send_time: 'Send Time',
      sender_name: 'Sender Name'
    }
    return labels[testType as keyof typeof labels] || testType
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const calculateImprovement = (variantA: any, variantB: any) => {
    if (variantA.conversion_rate === 0) return 0
    return ((variantB.conversion_rate - variantA.conversion_rate) / variantA.conversion_rate * 100)
  }

  const getConfidenceColor = (significance?: number) => {
    if (!significance) return 'text-muted-foreground'
    if (significance >= 95) return 'text-green-600'
    if (significance >= 80) return 'text-yellow-600'
    return 'text-red-600'
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
          <h2 className="text-2xl font-display font-bold">A/B Testing</h2>
          <p className="text-muted-foreground">Test and optimize your email marketing campaigns</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New A/B Test
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_tests}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completed_tests} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Running Tests</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.running_tests}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Improvement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.avg_improvement}%</div>
            <p className="text-xs text-muted-foreground">
              From winning variants
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_participants.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all tests
            </p>
          </CardContent>
        </Card>
      </div>

      {/* A/B Tests Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            A/B Test Campaigns
          </CardTitle>
          <CardDescription>
            Manage and monitor your A/B testing campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Test Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Winner</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tests.map((test) => {
                const totalParticipants = test.variant_a.sent + test.variant_b.sent
                const improvement = calculateImprovement(test.variant_a, test.variant_b)
                
                return (
                  <TableRow key={test.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{test.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Split: {Math.round(test.traffic_split * 100)}% / {Math.round((1 - test.traffic_split) * 100)}%
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getTestTypeLabel(test.test_type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(test.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {totalParticipants.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      {test.status !== 'draft' ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Eye className="h-3 w-3" />
                            A: {test.variant_a.open_rate}% | B: {test.variant_b.open_rate}%
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MousePointer className="h-3 w-3" />
                            A: {test.variant_a.conversion_rate}% | B: {test.variant_b.conversion_rate}%
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">No data</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {test.status === 'completed' && test.winner_variant ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="default" className="flex items-center gap-1">
                            <Trophy className="h-3 w-3" />
                            Variant {test.winner_variant}
                          </Badge>
                          <div className="text-sm">
                            <div className={getConfidenceColor(test.statistical_significance)}>
                              {test.statistical_significance?.toFixed(1)}% confident
                            </div>
                            <div className="text-green-600">
                              +{improvement.toFixed(1)}% improvement
                            </div>
                          </div>
                        </div>
                      ) : test.status === 'running' ? (
                        <div className="flex items-center gap-2">
                          {improvement > 0 ? (
                            <Badge variant="outline" className="text-green-600">
                              B leading +{improvement.toFixed(1)}%
                            </Badge>
                          ) : improvement < 0 ? (
                            <Badge variant="outline" className="text-blue-600">
                              A leading +{Math.abs(improvement).toFixed(1)}%
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              Too close to call
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {test.status === 'draft' && (
                          <Button size="sm">
                            <Play className="h-4 w-4 mr-1" />
                            Start
                          </Button>
                        )}
                        {test.status === 'running' && (
                          <Button size="sm" variant="outline">
                            <Pause className="h-4 w-4 mr-1" />
                            Pause
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View
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

      {/* Test Performance Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Test Performance Breakdown</CardTitle>
            <CardDescription>Detailed metrics for running tests</CardDescription>
          </CardHeader>
          <CardContent>
            {tests.filter(test => test.status === 'running').map((test) => (
              <div key={test.id} className="space-y-4 mb-6 last:mb-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{test.name}</h4>
                  <Badge variant="outline">{getTestTypeLabel(test.test_type)}</Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Variant A</span>
                      <span>{test.variant_a.sent} sent</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Open Rate</span>
                        <span>{test.variant_a.open_rate}%</span>
                      </div>
                      <Progress value={test.variant_a.open_rate} className="h-2" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Conversion Rate</span>
                        <span>{test.variant_a.conversion_rate}%</span>
                      </div>
                      <Progress value={test.variant_a.conversion_rate * 10} className="h-2" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Variant B</span>
                      <span>{test.variant_b.sent} sent</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Open Rate</span>
                        <span>{test.variant_b.open_rate}%</span>
                      </div>
                      <Progress value={test.variant_b.open_rate} className="h-2" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Conversion Rate</span>
                        <span>{test.variant_b.conversion_rate}%</span>
                      </div>
                      <Progress value={test.variant_b.conversion_rate * 10} className="h-2" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Testing Best Practices</CardTitle>
            <CardDescription>Guidelines for effective A/B testing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <div className="font-medium">Minimum Sample Size</div>
                  <div className="text-sm text-muted-foreground">
                    Ensure at least 100 participants per variant for reliable results
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <div className="font-medium">Test Duration</div>
                  <div className="text-sm text-muted-foreground">
                    Run tests for at least one full business cycle (7-14 days)
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <div className="font-medium">Statistical Significance</div>
                  <div className="text-sm text-muted-foreground">
                    Wait for 95% confidence before declaring a winner
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <div className="font-medium">Single Variable</div>
                  <div className="text-sm text-muted-foreground">
                    Test only one element at a time for clear insights
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}