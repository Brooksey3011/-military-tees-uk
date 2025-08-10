"use client"

import { useEffect, useState } from "react"

export default function DebugProductsPage() {
  const [apiStatus, setApiStatus] = useState<string>("Loading...")
  const [error, setError] = useState<string | null>(null)
  const [products, setProducts] = useState<any[]>([])

  useEffect(() => {
    async function testAPI() {
      try {
        console.log("🔍 Starting API test...")
        setApiStatus("Making API call...")
        
        const response = await fetch('/api/products?limit=3')
        console.log("📡 Response status:", response.status)
        console.log("📡 Response ok:", response.ok)
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error("❌ API Error:", errorText)
          setError(`HTTP ${response.status}: ${errorText}`)
          setApiStatus("API call failed")
          return
        }
        
        const data = await response.json()
        console.log("✅ API Success:", data)
        
        setProducts(data.products || [])
        setApiStatus("API call successful")
      } catch (err) {
        console.error("💥 Fetch error:", err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        setApiStatus("Fetch failed")
      }
    }
    
    testAPI()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">API Debug Page</h1>
      
      <div className="space-y-4">
        <div>
          <strong>Status:</strong> {apiStatus}
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        <div>
          <strong>Products loaded:</strong> {products.length}
        </div>
        
        {products.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">First Product:</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(products[0], null, 2)}
            </pre>
          </div>
        )}
        
        <div className="mt-6">
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Reload Test
          </button>
        </div>
      </div>
    </div>
  )
}