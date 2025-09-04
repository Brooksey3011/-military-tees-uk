"use client"

import { useState } from "react"
import { Layout } from "@/components/layout"
import { ProductsServer } from "@/components/pages/products-server"
import { cn } from "@/lib/utils"

export default function ProductsPage() {
  const [productCount, setProductCount] = useState<number>(0)
  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Header Section */}
        <section className="bg-muted/10 border-b-2 border-border">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
              <div className="text-center">
                <h1 className={cn(
                  "text-3xl md:text-5xl font-display font-bold text-foreground mb-2",
                  "tracking-wider uppercase"
                )}>
                  All Products
                </h1>
                <p className="text-sm text-muted-foreground uppercase tracking-wide">
                  ({productCount} PRODUCTS)
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <div className="container mx-auto px-4 py-8">
          <ProductsServer onProductCountChange={setProductCount} />
        </div>
      </div>
    </Layout>
  )
}