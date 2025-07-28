import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface ABTestCampaign {
  id: string
  name: string
  description?: string
  test_type: 'email_subject' | 'email_content' | 'send_time' | 'sender_name'
  variant_a_config: Record<string, any>
  variant_b_config: Record<string, any>
  traffic_split: number // 0.0 to 1.0 (percentage for variant A)
  status: 'draft' | 'running' | 'completed' | 'paused'
  start_date?: string
  end_date?: string
  winner_variant?: 'A' | 'B'
  statistical_significance?: number
  created_by?: string
  created_at: string
  updated_at: string
}

export interface ABTestResult {
  id: string
  campaign_id: string
  variant: 'A' | 'B'
  recipient_email: string
  customer_id?: string
  sent_at: string
  opened_at?: string
  clicked_at?: string
  converted_at?: string
  conversion_value?: number
  created_at: string
}

export interface ABTestStatistics {
  variant_a: {
    sent: number
    opened: number
    clicked: number
    converted: number
    conversion_value: number
    open_rate: number
    click_rate: number
    conversion_rate: number
  }
  variant_b: {
    sent: number
    opened: number
    clicked: number
    converted: number
    conversion_value: number
    open_rate: number
    click_rate: number
    conversion_rate: number
  }
  winner?: 'A' | 'B'
  confidence_level?: number
  statistical_significance?: number
  sample_size_needed?: number
}

class ABTestingService {

  /**
   * Create a new A/B test campaign
   */
  async createABTest(
    testData: Omit<ABTestCampaign, 'id' | 'created_at' | 'updated_at'>
  ): Promise<{ success: boolean; campaign?: ABTestCampaign; error?: string }> {
    try {
      // Validate traffic split
      if (testData.traffic_split < 0.1 || testData.traffic_split > 0.9) {
        return { success: false, error: 'Traffic split must be between 0.1 (10%) and 0.9 (90%)' }
      }

      const { data, error } = await supabase
        .from('ab_test_campaigns')
        .insert(testData)
        .select()
        .single()

      if (error) throw error

      return { success: true, campaign: data as ABTestCampaign }
    } catch (error) {
      console.error('Error creating A/B test:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Get all A/B test campaigns
   */
  async getABTests(): Promise<ABTestCampaign[]> {
    try {
      const { data, error } = await supabase
        .from('ab_test_campaigns')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as ABTestCampaign[]
    } catch (error) {
      console.error('Error getting A/B tests:', error)
      return []
    }
  }

  /**
   * Get A/B test by ID
   */
  async getABTest(campaignId: string): Promise<ABTestCampaign | null> {
    try {
      const { data, error } = await supabase
        .from('ab_test_campaigns')
        .select('*')
        .eq('id', campaignId)
        .single()

      if (error) throw error
      return data as ABTestCampaign
    } catch (error) {
      console.error('Error getting A/B test:', error)
      return null
    }
  }

  /**
   * Update A/B test campaign
   */
  async updateABTest(
    campaignId: string,
    updates: Partial<ABTestCampaign>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('ab_test_campaigns')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', campaignId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error updating A/B test:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Start A/B test
   */
  async startABTest(campaignId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('ab_test_campaigns')
        .update({
          status: 'running',
          start_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', campaignId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error starting A/B test:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Pause A/B test
   */
  async pauseABTest(campaignId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('ab_test_campaigns')
        .update({
          status: 'paused',
          updated_at: new Date().toISOString()
        })
        .eq('id', campaignId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error pausing A/B test:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Complete A/B test and declare winner
   */
  async completeABTest(
    campaignId: string,
    winnerVariant?: 'A' | 'B'
  ): Promise<{ success: boolean; winner?: 'A' | 'B'; error?: string }> {
    try {
      // If no winner specified, calculate based on statistics
      let winner = winnerVariant
      let statisticalSignificance: number | undefined

      if (!winner) {
        const stats = await this.getABTestStatistics(campaignId)
        const analysis = this.analyzeStatisticalSignificance(stats)
        
        winner = analysis.winner
        statisticalSignificance = analysis.statistical_significance
      }

      const { error } = await supabase
        .from('ab_test_campaigns')
        .update({
          status: 'completed',
          end_date: new Date().toISOString(),
          winner_variant: winner,
          statistical_significance: statisticalSignificance,
          updated_at: new Date().toISOString()
        })
        .eq('id', campaignId)

      if (error) throw error

      return { success: true, winner }
    } catch (error) {
      console.error('Error completing A/B test:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Assign recipient to A/B test variant
   */
  assignVariant(
    campaignId: string,
    recipientEmail: string,
    trafficSplit: number
  ): 'A' | 'B' {
    // Use a hash of campaign ID + email for consistent assignment
    const hashInput = `${campaignId}-${recipientEmail}`
    const hash = this.simpleHash(hashInput)
    const randomValue = (hash % 1000) / 1000 // 0-1 range

    return randomValue < trafficSplit ? 'A' : 'B'
  }

  /**
   * Record A/B test result
   */
  async recordABTestResult(
    resultData: Omit<ABTestResult, 'id' | 'created_at'>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('ab_test_results')
        .insert(resultData)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error recording A/B test result:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Record email open for A/B test
   */
  async recordABTestOpen(
    campaignId: string,
    recipientEmail: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('ab_test_results')
        .update({ opened_at: new Date().toISOString() })
        .eq('campaign_id', campaignId)
        .eq('recipient_email', recipientEmail)
        .is('opened_at', null)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error recording A/B test open:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Record email click for A/B test
   */
  async recordABTestClick(
    campaignId: string,
    recipientEmail: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('ab_test_results')
        .update({ clicked_at: new Date().toISOString() })
        .eq('campaign_id', campaignId)
        .eq('recipient_email', recipientEmail)
        .is('clicked_at', null)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error recording A/B test click:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Record conversion for A/B test
   */
  async recordABTestConversion(
    campaignId: string,
    recipientEmail: string,
    conversionValue?: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('ab_test_results')
        .update({ 
          converted_at: new Date().toISOString(),
          conversion_value: conversionValue || 0
        })
        .eq('campaign_id', campaignId)
        .eq('recipient_email', recipientEmail)
        .is('converted_at', null)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error recording A/B test conversion:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Get A/B test statistics
   */
  async getABTestStatistics(campaignId: string): Promise<ABTestStatistics> {
    try {
      const { data: results, error } = await supabase
        .from('ab_test_results')
        .select('*')
        .eq('campaign_id', campaignId)

      if (error) throw error

      const variantAResults = results?.filter(r => r.variant === 'A') || []
      const variantBResults = results?.filter(r => r.variant === 'B') || []

      const calculateVariantStats = (results: ABTestResult[]) => ({
        sent: results.length,
        opened: results.filter(r => r.opened_at).length,
        clicked: results.filter(r => r.clicked_at).length,
        converted: results.filter(r => r.converted_at).length,
        conversion_value: results.reduce((sum, r) => sum + (r.conversion_value || 0), 0),
        open_rate: results.length > 0 ? (results.filter(r => r.opened_at).length / results.length) * 100 : 0,
        click_rate: results.length > 0 ? (results.filter(r => r.clicked_at).length / results.length) * 100 : 0,
        conversion_rate: results.length > 0 ? (results.filter(r => r.converted_at).length / results.length) * 100 : 0
      })

      const variant_a = calculateVariantStats(variantAResults)
      const variant_b = calculateVariantStats(variantBResults)

      // Calculate statistical significance
      const analysis = this.analyzeStatisticalSignificance({ variant_a, variant_b })

      return {
        variant_a,
        variant_b,
        winner: analysis.winner,
        confidence_level: analysis.confidence_level,
        statistical_significance: analysis.statistical_significance,
        sample_size_needed: this.calculateSampleSizeNeeded(variant_a, variant_b)
      }
    } catch (error) {
      console.error('Error getting A/B test statistics:', error)
      return {
        variant_a: { sent: 0, opened: 0, clicked: 0, converted: 0, conversion_value: 0, open_rate: 0, click_rate: 0, conversion_rate: 0 },
        variant_b: { sent: 0, opened: 0, clicked: 0, converted: 0, conversion_value: 0, open_rate: 0, click_rate: 0, conversion_rate: 0 }
      }
    }
  }

  /**
   * Analyze statistical significance between variants
   */
  private analyzeStatisticalSignificance(stats: Pick<ABTestStatistics, 'variant_a' | 'variant_b'>): {
    winner?: 'A' | 'B'
    confidence_level?: number
    statistical_significance?: number
  } {
    const { variant_a, variant_b } = stats

    // Need minimum sample size for statistical validity
    if (variant_a.sent < 100 || variant_b.sent < 100) {
      return { confidence_level: 0 }
    }

    // Use conversion rate as primary metric
    const rateA = variant_a.conversion_rate / 100
    const rateB = variant_b.conversion_rate / 100

    // Calculate standard error
    const seA = Math.sqrt((rateA * (1 - rateA)) / variant_a.sent)
    const seB = Math.sqrt((rateB * (1 - rateB)) / variant_b.sent)
    const seDiff = Math.sqrt(seA * seA + seB * seB)

    // Calculate z-score
    const rateDiff = Math.abs(rateA - rateB)
    const zScore = rateDiff / seDiff

    // Convert z-score to confidence level (simplified)
    let confidenceLevel = 0
    if (zScore >= 1.96) confidenceLevel = 95
    else if (zScore >= 1.645) confidenceLevel = 90
    else if (zScore >= 1.28) confidenceLevel = 80

    // Determine winner
    let winner: 'A' | 'B' | undefined
    if (confidenceLevel >= 95) {
      winner = rateA > rateB ? 'A' : 'B'
    }

    return {
      winner,
      confidence_level: confidenceLevel,
      statistical_significance: Math.min(99.9, Math.max(0, confidenceLevel))
    }
  }

  /**
   * Calculate recommended sample size
   */
  private calculateSampleSizeNeeded(
    variantA: any,
    variantB: any,
    power: number = 0.8,
    alpha: number = 0.05
  ): number {
    // Simplified sample size calculation for A/B testing
    // This is a basic implementation - more sophisticated calculations would be needed for production
    
    const baselineRate = Math.max(variantA.conversion_rate, variantB.conversion_rate) / 100
    const minimumDetectableEffect = 0.1 // 10% relative improvement
    
    if (baselineRate === 0) return 1000 // Default minimum

    // Simplified formula for sample size per variant
    const zAlpha = 1.96 // 95% confidence
    const zBeta = 0.84 // 80% power
    
    const p1 = baselineRate
    const p2 = baselineRate * (1 + minimumDetectableEffect)
    const pBar = (p1 + p2) / 2
    
    const numerator = Math.pow(zAlpha + zBeta, 2) * 2 * pBar * (1 - pBar)
    const denominator = Math.pow(p2 - p1, 2)
    
    return Math.ceil(numerator / denominator)
  }

  /**
   * Simple hash function for consistent variant assignment
   */
  private simpleHash(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  /**
   * Get A/B test recommendations
   */
  async getABTestRecommendations(campaignId: string): Promise<{
    should_continue: boolean
    recommendation: string
    confidence_level: number
    sample_size_status: 'insufficient' | 'adequate' | 'excellent'
    winner?: 'A' | 'B'
  }> {
    try {
      const stats = await this.getABTestStatistics(campaignId)
      const totalSent = stats.variant_a.sent + stats.variant_b.sent
      
      let sampleSizeStatus: 'insufficient' | 'adequate' | 'excellent' = 'insufficient'
      if (totalSent >= 1000) sampleSizeStatus = 'excellent'
      else if (totalSent >= 400) sampleSizeStatus = 'adequate'

      const confidenceLevel = stats.confidence_level || 0
      const shouldContinue = confidenceLevel < 95 && totalSent < 5000

      let recommendation = ''
      if (confidenceLevel >= 95) {
        recommendation = `Clear winner detected: Variant ${stats.winner} with ${confidenceLevel}% confidence. Recommended to end test and implement winning variant.`
      } else if (totalSent < 100) {
        recommendation = 'Insufficient sample size. Continue test to gather more data.'
      } else if (confidenceLevel >= 80) {
        recommendation = `Promising results for Variant ${stats.winner}, but need more data for statistical significance.`
      } else {
        recommendation = 'No clear winner yet. Continue test or consider revising test variants.'
      }

      return {
        should_continue: shouldContinue,
        recommendation,
        confidence_level: confidenceLevel,
        sample_size_status: sampleSizeStatus,
        winner: stats.winner
      }
    } catch (error) {
      console.error('Error getting A/B test recommendations:', error)
      return {
        should_continue: false,
        recommendation: 'Error analyzing test results',
        confidence_level: 0,
        sample_size_status: 'insufficient'
      }
    }
  }

  /**
   * Delete A/B test campaign
   */
  async deleteABTest(campaignId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('ab_test_campaigns')
        .delete()
        .eq('id', campaignId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error deleting A/B test:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Get A/B testing overview stats
   */
  async getABTestingOverview(): Promise<{
    total_tests: number
    running_tests: number
    completed_tests: number
    avg_improvement: number
    total_participants: number
  }> {
    try {
      const [testsResult, resultsResult] = await Promise.all([
        supabase.from('ab_test_campaigns').select('status'),
        supabase.from('ab_test_results').select('campaign_id')
      ])

      const tests = testsResult.data || []
      const results = resultsResult.data || []

      const totalTests = tests.length
      const runningTests = tests.filter(t => t.status === 'running').length
      const completedTests = tests.filter(t => t.status === 'completed').length
      const totalParticipants = results.length

      // Calculate average improvement from completed tests
      // This would require more complex analysis in a real implementation
      const avgImprovement = 15 // Placeholder percentage

      return {
        total_tests: totalTests,
        running_tests: runningTests,
        completed_tests: completedTests,
        avg_improvement: avgImprovement,
        total_participants: totalParticipants
      }
    } catch (error) {
      console.error('Error getting A/B testing overview:', error)
      return {
        total_tests: 0,
        running_tests: 0,
        completed_tests: 0,
        avg_improvement: 0,
        total_participants: 0
      }
    }
  }
}

// Export singleton instance
export const abTestingService = new ABTestingService()

// Convenience functions
export const createABTest = (testData: Omit<ABTestCampaign, 'id' | 'created_at' | 'updated_at'>) =>
  abTestingService.createABTest(testData)

export const getABTests = () => abTestingService.getABTests()

export const getABTestStatistics = (campaignId: string) => abTestingService.getABTestStatistics(campaignId)

export const assignABTestVariant = (campaignId: string, recipientEmail: string, trafficSplit: number) =>
  abTestingService.assignVariant(campaignId, recipientEmail, trafficSplit)

export const recordABTestResult = (resultData: Omit<ABTestResult, 'id' | 'created_at'>) =>
  abTestingService.recordABTestResult(resultData)