"use client"

import { Layout } from "@/components/layout"
import { AddToCartButton } from "@/components/cart/add-to-cart-button"
import { CartIcon } from "@/components/cart/cart-icon"
import { useCart } from "@/hooks/use-cart"
import { Button } from "@/components/ui/button"
import type { Product, ProductVariant } from "@/types"

export default function CartDebugPage() {
  const { items, totalItems, isOpen, openCart } = useCart()

  // Mock product that matches the TypeScript interface exactly
  const mockProduct: Product = {
    id: "test-1",
    name: "Test Military Tee",
    slug: "test-military-tee",
    description: "A test product for cart debugging",
    price: 24.99,
    category_id: "test-category",
    main_image_url: "/api/placeholder/300/400",
    is_featured: false,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  const mockVariant: ProductVariant = {
    id: "test-variant-1",
    product_id: "test-1",
    size: "M",
    color: "Black",
    sku: "TEST-BLK-M",
    stock_quantity: 10,
    price_adjustment: 0,
    image_urls: ["/api/placeholder/300/400"],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto space-y-8">
          <h1 className="text-3xl font-bold">Cart Debug Page</h1>
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Cart Status</h2>
            <p>Total Items: {totalItems}</p>
            <p>Cart Open: {isOpen ? 'Yes' : 'No'}</p>
            <p>Items in Cart: {items.length}</p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Test Controls</h2>
            
            <div className="flex gap-4">
              <CartIcon />
              <Button onClick={openCart}>Open Cart</Button>
            </div>
            
            <div className="border p-4 rounded">
              <h3 className="font-semibold mb-2">Test Product</h3>
              <p>Name: {mockProduct.name}</p>
              <p>Price: £{mockProduct.price}</p>
              <p>Variant: {mockVariant.size} - {mockVariant.color}</p>
              <p>Stock: {mockVariant.stock_quantity}</p>
              
              <div className="mt-4">
                <AddToCartButton 
                  productId={mockProduct.id}
                  variantId={mockVariant.id}
                  name={mockProduct.name}
                  price={mockProduct.price}
                  image={mockProduct.main_image_url || "/api/placeholder/300/400"}
                  size={mockVariant.size}
                  color={mockVariant.color}
                  maxQuantity={mockVariant.stock_quantity}
                  onSuccess={() => console.log('Successfully added to cart')}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Current Cart Items</h2>
            {items.length === 0 ? (
              <p>No items in cart</p>
            ) : (
              <ul className="space-y-2">
                {items.map(item => (
                  <li key={item.id} className="border p-2 rounded">
                    <p>Product: {item.name}</p>
                    <p>Variant: {item.size} - {item.color}</p>
                    <p>Quantity: {item.quantity}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}