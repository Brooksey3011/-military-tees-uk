"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle, XCircle, Eye, Loader2 } from 'lucide-react'
import { AuthService } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

interface TestResult {
  test: string
  status: 'success' | 'error' | 'pending'
  message: string
  details?: any
}

export default function RegistrationTestPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [testEmail, setTestEmail] = useState('test@militarytees.co.uk')
  const [testPassword, setTestPassword] = useState('TestPassword123!')
  const [testFirstName, setTestFirstName] = useState('John')
  const [testLastName, setTestLastName] = useState('Doe')
  const [isRunningTests, setIsRunningTests] = useState(false)
  const [registrationTest, setRegistrationTest] = useState({
    email: 'registration@test.com',
    password: 'RegTest123!',
    firstName: 'Registration',
    lastName: 'Test'
  })

  const addTestResult = (test: string, status: 'success' | 'error' | 'pending', message: string, details?: any) => {
    setTestResults(prev => {
      const filtered = prev.filter(r => r.test !== test)
      return [...filtered, { test, status, message, details }]
    })
  }

  // Test 1: Environment Variables
  const testEnvironmentVariables = async () => {
    addTestResult('Environment Variables', 'pending', 'Checking environment variables...')
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl) {
      addTestResult('Environment Variables', 'error', 'NEXT_PUBLIC_SUPABASE_URL is missing')
      return false
    }
    
    if (!supabaseAnonKey) {
      addTestResult('Environment Variables', 'error', 'NEXT_PUBLIC_SUPABASE_ANON_KEY is missing')
      return false
    }

    if (supabaseUrl.includes('your-project') || supabaseAnonKey.includes('anon-key')) {
      addTestResult('Environment Variables', 'error', 'Environment variables contain placeholder values')
      return false
    }

    addTestResult('Environment Variables', 'success', 'All environment variables are set')
    return true
  }

  // Test 2: Supabase Connection
  const testSupabaseConnection = async () => {
    addTestResult('Supabase Connection', 'pending', 'Testing Supabase connection...')
    
    try {
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        addTestResult('Supabase Connection', 'error', `Connection failed: ${error.message}`)
        return false
      }

      addTestResult('Supabase Connection', 'success', 'Supabase connection established')
      return true
    } catch (error) {
      addTestResult('Supabase Connection', 'error', `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return false
    }
  }

  // Test 3: Database Schema
  const testDatabaseSchema = async () => {
    addTestResult('Database Schema', 'pending', 'Checking database schema...')
    
    try {
      // Test customers table exists
      const { data, error } = await supabase
        .from('customers')
        .select('id')
        .limit(1)

      if (error) {
        addTestResult('Database Schema', 'error', `Database schema issue: ${error.message}`, error)
        return false
      }

      addTestResult('Database Schema', 'success', 'Database schema is accessible')
      return true
    } catch (error) {
      addTestResult('Database Schema', 'error', `Schema error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return false
    }
  }

  // Test 4: Registration with AuthService
  const testRegistration = async () => {
    addTestResult('Registration Flow', 'pending', 'Testing user registration...')
    
    try {
      const result = await AuthService.signUp(
        registrationTest.email,
        registrationTest.password,
        {
          first_name: registrationTest.firstName,
          last_name: registrationTest.lastName
        }
      )

      if (result.user) {
        addTestResult('Registration Flow', 'success', 'User registration successful', {
          userId: result.user.id,
          email: result.user.email
        })
        return true
      } else {
        addTestResult('Registration Flow', 'error', 'Registration returned no user')
        return false
      }
    } catch (error) {
      addTestResult('Registration Flow', 'error', `Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`, error)
      return false
    }
  }

  // Test 5: Customer Profile Creation
  const testCustomerProfile = async () => {
    addTestResult('Customer Profile', 'pending', 'Checking customer profile creation...')
    
    try {
      // Get the test user from auth
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        addTestResult('Customer Profile', 'error', 'No authenticated user found')
        return false
      }

      // Check if customer profile was created
      const { data: customer, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) {
        addTestResult('Customer Profile', 'error', `Customer profile error: ${error.message}`, error)
        return false
      }

      if (customer) {
        addTestResult('Customer Profile', 'success', 'Customer profile created successfully', customer)
        return true
      } else {
        addTestResult('Customer Profile', 'error', 'Customer profile was not created')
        return false
      }
    } catch (error) {
      addTestResult('Customer Profile', 'error', `Profile check error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return false
    }
  }

  // Run all tests
  const runAllTests = async () => {
    setIsRunningTests(true)
    setTestResults([])

    const envTest = await testEnvironmentVariables()
    if (!envTest) {
      setIsRunningTests(false)
      return
    }

    const connectionTest = await testSupabaseConnection()
    if (!connectionTest) {
      setIsRunningTests(false)
      return
    }

    const schemaTest = await testDatabaseSchema()
    if (!schemaTest) {
      setIsRunningTests(false)
      return
    }

    const registrationSuccessful = await testRegistration()
    if (registrationSuccessful) {
      await testCustomerProfile()
    }

    setIsRunningTests(false)
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'pending':
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
    }
  }

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50'
      case 'error':
        return 'border-red-200 bg-red-50'
      case 'pending':
        return 'border-blue-200 bg-blue-50'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/30 to-white p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-3xl font-bold text-green-900 mb-2">
            🔧 Registration System Diagnostic
          </h1>
          <p className="text-green-700">
            Comprehensive testing of user registration flow and database connectivity
          </p>
        </div>

        {/* Test Controls */}
        <Card className="border-2 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-green-600" />
              Test Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Test Email:</label>
                <Input
                  value={registrationTest.email}
                  onChange={(e) => setRegistrationTest(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="test@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Test Password:</label>
                <Input
                  type="password"
                  value={registrationTest.password}
                  onChange={(e) => setRegistrationTest(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Password123!"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">First Name:</label>
                <Input
                  value={registrationTest.firstName}
                  onChange={(e) => setRegistrationTest(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Last Name:</label>
                <Input
                  value={registrationTest.lastName}
                  onChange={(e) => setRegistrationTest(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Doe"
                />
              </div>
            </div>
            
            <Button
              onClick={runAllTests}
              disabled={isRunningTests}
              className="w-full bg-green-600 hover:bg-green-700"
              size="lg"
            >
              {isRunningTests ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Running Diagnostic Tests...
                </>
              ) : (
                'Run Complete Registration Diagnostic'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Test Results */}
        {testResults.length > 0 && (
          <Card className="border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-600" />
                Diagnostic Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 ${getStatusColor(result.status)}`}
                >
                  <div className="flex items-start gap-3">
                    {getStatusIcon(result.status)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900">{result.test}</h3>
                        <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
                          {result.status.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{result.message}</p>
                      
                      {result.details && (
                        <details className="mt-2">
                          <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-800">
                            View Technical Details
                          </summary>
                          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Quick Fixes */}
        <Card className="border-2 border-yellow-200 bg-yellow-50/50">
          <CardHeader>
            <CardTitle className="text-yellow-800">
              🔧 Common Registration Issues & Quick Fixes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="space-y-1">
              <h4 className="font-semibold text-yellow-900">Environment Variables Missing:</h4>
              <p className="text-yellow-800">Check that .env.local contains valid Supabase URL and keys</p>
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-yellow-900">Supabase Connection Issues:</h4>
              <p className="text-yellow-800">Verify Supabase project is active and keys are correct</p>
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-yellow-900">Database Schema Issues:</h4>
              <p className="text-yellow-800">Ensure 'customers' table exists with correct permissions</p>
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-yellow-900">Email Already Exists:</h4>
              <p className="text-yellow-800">Try a different email address for testing</p>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}