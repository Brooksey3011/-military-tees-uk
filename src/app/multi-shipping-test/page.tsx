"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Truck, Clock, Globe, Plus, Minus, ShoppingCart, Loader2 } from 'lucide-react'

interface TestItem {
  variantId: string
  quantity: number
  name: string
  price: number
  size: string
  color: string
}

export default function MultiShippingTest() {
  const [cartItems, setCartItems] = useState<TestItem[]>([])
  const [selectedCountry, setSelectedCountry] = useState('GB')
  const [isLoading, setIsLoading] = useState(false)
  const [shippingPreview, setShippingPreview] = useState<any>(null)

  // Test product
  const testProduct = {
    variantId: 'd9c1525c-7dfe-4fe8-a377-d290d08a9c48',
    name: 'Mess Hall Brotherhood',
    price: 20.99,
    size: 'XS',
    color: 'Black'
  }

  // Country options for testing
  const countries = [
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'US', name: 'United States', flag: '🇺🇸' },
    { code: 'DE', name: 'Germany', flag: '🇩🇪' },
    { code: 'FR', name: 'France', flag: '🇫🇷' },
    { code: 'AU', name: 'Australia', flag: '🇦🇺' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦' },
    { code: 'JP', name: 'Japan', flag: '🇯🇵' }
  ]

  const addToCart = () => {
    const existingItem = cartItems.find(item => item.variantId === testProduct.variantId)
    if (existingItem) {
      setCartItems(items => 
        items.map(item => 
          item.variantId === testProduct.variantId 
            ? { ...item, quantity: Math.min(item.quantity + 1, 5) }
            : item
        )
      )
    } else {
      setCartItems([...cartItems, { ...testProduct, quantity: 1 }])
    }
  }

  const updateQuantity = (variantId: string, change: number) => {
    setCartItems(items => 
      items.map(item => {
        if (item.variantId !== variantId) return item
        const newQuantity = item.quantity + change
        return newQuantity <= 0 ? null : { ...item, quantity: Math.min(newQuantity, 5) }
      }).filter(Boolean) as TestItem[]
    )
  }

  const clearCart = () => setCartItems([])

  // Calculate subtotal
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  // Preview shipping rates
  const previewShipping = async () => {
    if (!cartItems.length) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/shipping-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems.map(item => ({
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price
          })),
          countryCode: selectedCountry,
          subtotal
        })
      })

      const data = await response.json()
      setShippingPreview(data)
    } catch (error) {
      console.error('Shipping preview error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Test checkout with selected country
  const testCheckoutWithShipping = async () => {
    if (!cartItems.length) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/direct-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems.map(item => ({
            variantId: item.variantId,
            quantity: item.quantity
          })),
          preferredCountry: selectedCountry
        })
      })

      const data = await response.json()

      if (data.url) {
        // Show shipping options before redirect
        console.log('🚚 Available shipping options:', data.shipping)
        window.location.href = data.url
      } else {
        console.error('Checkout failed:', data.error)
      }
    } catch (error) {
      console.error('Checkout error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/30 to-white p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-3xl font-bold text-green-900 mb-2">
            Multi-Shipping Checkout Test
          </h1>
          <p className="text-green-700">
            Dynamic shipping rates based on location • Standard & Express options
          </p>
        </div>

        {/* Shipping Features */}
        <Card className="border-2 border-green-200 bg-green-50/50">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div className="flex flex-col items-center gap-2">
                <Truck className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-semibold text-green-900">Multiple Rates</p>
                  <p className="text-sm text-green-700">Standard & Express</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Globe className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="font-semibold text-blue-900">Global Zones</p>
                  <p className="text-sm text-blue-700">Location-based</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Clock className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="font-semibold text-purple-900">Delivery Times</p>
                  <p className="text-sm text-purple-700">Accurate estimates</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <ShoppingCart className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="font-semibold text-orange-900">Free Shipping</p>
                  <p className="text-sm text-orange-700">Threshold-based</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left: Cart & Country Selection */}
          <div className="space-y-6">
            
            {/* Country Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-600" />
                  Shipping Destination
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map(country => (
                      <SelectItem key={country.code} value={country.code}>
                        <div className="flex items-center gap-2">
                          <span>{country.flag}</span>
                          <span>{country.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button 
                  onClick={previewShipping}
                  disabled={!cartItems.length || isLoading}
                  variant="outline" 
                  className="w-full"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Truck className="h-4 w-4 mr-2" />
                  )}
                  Preview Shipping Rates
                </Button>
              </CardContent>
            </Card>

            {/* Test Product */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-green-600" />
                  Test Product
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="font-bold text-green-900 text-lg">{testProduct.name}</h3>
                  <p className="text-green-700">
                    Size: <Badge variant="outline">{testProduct.size}</Badge> • 
                    Color: <Badge variant="outline">{testProduct.color}</Badge>
                  </p>
                  <p className="text-2xl font-bold text-green-900 mt-2">
                    £{testProduct.price.toFixed(2)}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={addToCart} className="flex-1 bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                  <Button variant="outline" onClick={clearCart}>
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Cart Items */}
            {cartItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-800">Cart Contents</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.variantId} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium text-green-900">{item.name}</p>
                        <p className="text-sm text-green-700">{item.size} • {item.color}</p>
                        <p className="text-sm font-medium">£{item.price.toFixed(2)} each</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.variantId, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-bold">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.variantId, 1)}
                          disabled={item.quantity >= 5}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-bold text-green-900">
                      <span>Subtotal:</span>
                      <span>£{subtotal.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: Shipping Preview & Checkout */}
          <div className="space-y-6">
            
            {/* Shipping Preview */}
            {shippingPreview && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-blue-600" />
                    Shipping Options Preview
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Destination: {countries.find(c => c.code === selectedCountry)?.flag} {countries.find(c => c.code === selectedCountry)?.name}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {shippingPreview.rates?.map((rate: any, index: number) => (
                    <div key={rate.id} className={`p-4 rounded-lg border-2 ${
                      rate.type === 'free' ? 'bg-green-50 border-green-200' :
                      rate.type === 'express' ? 'bg-blue-50 border-blue-200' :
                      'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">{rate.name}</h4>
                          <p className="text-sm text-muted-foreground">{rate.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">
                            {rate.amount === 0 ? 'FREE' : `£${rate.amount.toFixed(2)}`}
                          </p>
                          <Badge variant={rate.type === 'express' ? 'default' : 'outline'}>
                            {rate.type}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{rate.estimatedDays.min}–{rate.estimatedDays.max} business days</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Checkout Button */}
            <Card>
              <CardHeader>
                <CardTitle className="text-green-800 text-center">
                  🚀 Multi-Shipping Checkout
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {cartItems.length > 0 ? (
                  <div className="space-y-4">
                    <Button
                      size="lg"
                      className="w-full bg-gradient-to-r from-green-700 to-green-800 hover:from-green-800 hover:to-green-900 text-white font-bold h-12"
                      onClick={testCheckoutWithShipping}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Truck className="h-4 w-4 mr-2" />
                      )}
                      Checkout with Shipping Options
                    </Button>
                    
                    <div className="text-center text-sm text-muted-foreground">
                      Will show Standard & Express shipping on Stripe checkout
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-8">
                    <Truck className="h-12 w-12 mx-auto mb-4 text-green-600 opacity-50" />
                    <h3 className="font-semibold text-green-900 mb-2">Multi-Shipping Checkout</h3>
                    <p className="text-sm text-muted-foreground">
                      Add a product to test dynamic shipping rates
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Shipping Zones Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Shipping Zones & Rates</CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>🇬🇧 UK:</span>
                    <span>£4.99 / £9.99 (Free over £50)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>🇪🇺 EU:</span>
                    <span>£12.99 / £24.99 (Free over £75)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>🇺🇸 🇨🇦 North America:</span>
                    <span>£15.99 / £29.99 (Free over £100)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>🇦🇺 🇳🇿 Oceania:</span>
                    <span>£18.99 / £34.99 (Free over £100)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>🌍 Rest of World:</span>
                    <span>£19.99 / £39.99 (Free over £150)</span>
                  </div>
                </div>
                
                <div className="text-center pt-2 border-t">
                  <Badge variant="outline" className="text-xs">
                    Standard: 3-21 days • Express: 1-14 days
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}