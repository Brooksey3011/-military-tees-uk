"use client"

import { useState } from "react"
import { Layout } from "@/components/layout"
import { ProductGrid, ProductFilters, QuickViewModal } from "@/components/product"
import { useCart } from "@/hooks/use-cart"
import type { Product, ProductVariant, FilterOptions, Category } from "@/types"

// Mock data that works without Supabase
const mockCategories: Category[] = [
  { id: "1", name: "Armoury", slug: "armoury", description: "Tactical gear", image_url: "", sort_order: 1, is_active: true, created_at: "2024-01-01", updated_at: "2024-01-01" },
  { id: "2", name: "Mess Hall", slug: "mess-hall", description: "Military dining", image_url: "", sort_order: 2, is_active: true, created_at: "2024-01-01", updated_at: "2024-01-01" },
  { id: "3", name: "NAAFI", slug: "naafi", description: "Navy, Army and Air Force Institutes", image_url: "", sort_order: 3, is_active: true, created_at: "2024-01-01", updated_at: "2024-01-01" },
  { id: "4", name: "The Ranges", slug: "ranges", description: "Shooting and marksmanship", image_url: "", sort_order: 4, is_active: true, created_at: "2024-01-01", updated_at: "2024-01-01" },
]

const mockProducts: Product[] = [
  {
    id: "1",
    name: "Regiment Pride T-Shirt",
    slug: "regiment-pride-tshirt",
    description: "Premium cotton t-shirt featuring classic regimental insignia and military heritage design.",
    price: 24.99,
    compare_at_price: 29.99,
    category_id: "1",
    main_image_url: "",
    is_featured: true,
    is_active: true,
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
    category: mockCategories[0],
    variants: [
      {
        id: "1-s-olive",
        product_id: "1",
        size: "S",
        color: "Olive",
        sku: "REG-PRIDE-S-OLIVE",
        stock_quantity: 15,
        price_adjustment: 0,
        is_active: true,
        created_at: "2024-01-01",
        updated_at: "2024-01-01"
      },
      {
        id: "1-m-olive",
        product_id: "1",
        size: "M", 
        color: "Olive",
        sku: "REG-PRIDE-M-OLIVE",
        stock_quantity: 25,
        price_adjustment: 0,
        is_active: true,
        created_at: "2024-01-01",
        updated_at: "2024-01-01"
      },
      {
        id: "1-l-olive",
        product_id: "1",
        size: "L",
        color: "Olive", 
        sku: "REG-PRIDE-L-OLIVE",
        stock_quantity: 3,
        price_adjustment: 0,
        is_active: true,
        created_at: "2024-01-01",
        updated_at: "2024-01-01"
      }
    ],
    reviews: [
      {
        id: "1",
        product_id: "1",
        customer_id: "1",
        rating: 5,
        comment: "Excellent quality and fit!",
        created_at: "2024-01-01",
        updated_at: "2024-01-01"
      },
      {
        id: "2", 
        product_id: "1",
        customer_id: "2",
        rating: 4,
        comment: "Great design, fast delivery.",
        created_at: "2024-01-01",
        updated_at: "2024-01-01"
      }
    ]
  },
  {
    id: "2",
    name: "Tactical Operations Tee",
    slug: "tactical-operations-tee",
    description: "Rugged design inspired by special operations units. Built for comfort and durability.",
    price: 29.99,
    category_id: "1",
    main_image_url: "",
    is_featured: false,
    is_active: true,
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
    category: mockCategories[0],
    variants: [
      {
        id: "2-m-black",
        product_id: "2", 
        size: "M",
        color: "Black",
        sku: "TAC-OPS-M-BLACK",
        stock_quantity: 0,
        price_adjustment: 0,
        is_active: true,
        created_at: "2024-01-01",
        updated_at: "2024-01-01"
      }
    ]
  },
  {
    id: "3",
    name: "NAAFI Heritage Shirt",
    slug: "naafi-heritage-shirt",
    description: "Celebrating the Navy, Army and Air Force Institutes with vintage-inspired designs.",
    price: 26.99,
    category_id: "3",
    main_image_url: "",
    is_featured: true,
    is_active: true,
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
    category: mockCategories[2],
    variants: [
      {
        id: "3-l-navy",
        product_id: "3",
        size: "L",
        color: "Navy",
        sku: "NAAFI-L-NAVY",
        stock_quantity: 12,
        price_adjustment: 0,
        is_active: true,
        created_at: "2024-01-01",
        updated_at: "2024-01-01"
      }
    ]
  },
  {
    id: "4",
    name: "Mess Hall Classics",
    slug: "mess-hall-classics",
    description: "Celebrating military dining traditions with vintage-inspired designs.",
    price: 22.99,
    category_id: "2",
    main_image_url: "",
    is_featured: false,
    is_active: true,
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
    category: mockCategories[1],
    variants: [
      {
        id: "4-s-khaki",
        product_id: "4",
        size: "S",
        color: "Khaki",
        sku: "MESS-S-KHAKI",
        stock_quantity: 8,
        price_adjustment: 0,
        is_active: true,
        created_at: "2024-01-01",
        updated_at: "2024-01-01"
      }
    ]
  }
]

export default function ProductsOffline() {
  const { addItem } = useCart()
  const [filters, setFilters] = useState<FilterOptions>({
    categories: [],
    colors: [],
    sizes: [],
    priceRange: [0, Infinity],
    sortBy: "newest"
  })
  const [favorites, setFavorites] = useState<string[]>([])
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)

  const availableColors = ["Olive", "Black", "Navy", "Khaki"]
  const availableSizes = ["S", "M", "L", "XL"]

  const handleQuickView = (product: Product) => {
    setQuickViewProduct(product)
  }

  const handleAddToCart = (product: Product, variant: ProductVariant) => {
    addItem(product, variant, 1)
  }

  const handleToggleFavorite = (productId: string) => {
    setFavorites(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Status Banner */}
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-warning rounded-full"></div>
            <span className="text-sm font-medium">Demo Mode</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Using mock data. Connect Supabase to see real products from database.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <ProductFilters
              filters={filters}
              onFiltersChange={setFilters}
              categories={mockCategories}
              availableColors={availableColors}
              availableSizes={availableSizes}
              priceRange={[0, 50]}
              compact={true}
            />
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="mb-6">
              <h1 className="text-3xl font-display font-bold mb-2">
                Products (Demo Mode)
              </h1>
              <p className="text-muted-foreground">
                Testing product display and cart functionality with mock data
              </p>
            </div>

            <ProductGrid
              products={mockProducts}
              onQuickView={handleQuickView}
              onAddToCart={handleAddToCart}
              onToggleFavorite={handleToggleFavorite}
              favoriteProducts={favorites}
              filters={filters}
              columns={{
                mobile: 1,
                tablet: 2,
                desktop: 3
              }}
            />
          </div>
        </div>

        {/* Quick View Modal */}
        <QuickViewModal
          product={quickViewProduct}
          isOpen={!!quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onAddToCart={(product, variant, quantity) => {
            handleAddToCart(product, variant)
            setQuickViewProduct(null)
          }}
          onToggleFavorite={handleToggleFavorite}
          isFavorite={quickViewProduct ? favorites.includes(quickViewProduct.id) : false}
        />
      </div>
    </Layout>
  )
}