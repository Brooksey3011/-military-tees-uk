"use client"

import { Metadata } from "next"
import Link from "next/link"
import { Heart, ArrowLeft, ShoppingCart, Trash2, Share } from "lucide-react"
import { Layout } from "@/components/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useWishlistItems, useWishlistCount, useWishlistActions } from "@/store/wishlist"
import { useCart } from "@/hooks/use-cart"

// Note: Metadata should be in layout.tsx for client components
// export const metadata: Metadata = {
//   title: "My Wishlist | Military Tees UK",
//   description: "Your saved items at Military Tees UK. Keep track of your favorite military apparel and add them to your cart when ready.",
//   robots: {
//     index: false,
//     follow: false,
//   }
// }

export default function WishlistPage() {
  const wishlistItems = useWishlistItems()
  const wishlistCount = useWishlistCount()
  const { removeItem, clearWishlist } = useWishlistActions()
  const { addItem: addToCart } = useCart()

  const handleAddToCart = (item: any) => {
    addToCart({
      productId: item.productId,
      variantId: `${item.productId}-default`,
      name: item.name,
      price: item.price,
      image: item.image,
      size: item.sizes?.[0] || 'M',
      color: 'Default',
      maxQuantity: 10
    })
  }

  const handleRemoveFromWishlist = (productId: string) => {
    removeItem(productId)
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <section className="border-b-2 border-border bg-muted/10">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-4 mb-6">
                <Link href="/account" className="p-2 hover:bg-muted/20 rounded-none border-2 border-border">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
                <div>
                  <h1 className={cn(
                    "text-3xl md:text-4xl font-display font-bold text-foreground",
                    "tracking-wider uppercase"
                  )}>
                    My Wishlist
                  </h1>
                  <p className="text-muted-foreground">Your saved military apparel items</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-muted-foreground">{wishlistCount} items saved</span>
                </div>
                <Button size="sm" variant="outline" className="rounded-none border-2" disabled>
                  <Share className="h-4 w-4 mr-2" />
                  Share Wishlist
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Wishlist Content */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {wishlistItems.length > 0 ? (
              <>
                {/* Wishlist Actions */}
                <Card className="border-2 border-border rounded-none">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-foreground">Quick Actions</h3>
                        <p className="text-sm text-muted-foreground">Manage your saved items</p>
                      </div>
                      <div className="flex gap-3">
                        <Button 
                          className="rounded-none" 
                          onClick={() => {
                            wishlistItems.forEach(item => {
                              if (item.inStock) {
                                handleAddToCart(item)
                              }
                            })
                          }}
                          disabled={wishlistItems.length === 0 || !wishlistItems.some(item => item.inStock)}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Add All to Cart
                        </Button>
                        <Button 
                          variant="outline" 
                          className="rounded-none border-2" 
                          onClick={clearWishlist}
                          disabled={wishlistItems.length === 0}
                        >
                          Clear Wishlist
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Wishlist Items */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {wishlistItems.map((item) => (
                    <Card key={item.id} className="border-2 border-border rounded-none group">
                      <CardContent className="p-0">
                        {/* Product Image */}
                        <div className="relative">
                          <img 
                            src={item.image}
                            alt={item.name}
                            className="w-full h-64 object-cover"
                          />
                          {item.originalPrice && (
                            <Badge className="absolute top-3 left-3 rounded-none bg-red-600 hover:bg-red-700">
                              SALE
                            </Badge>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="absolute top-3 right-3 rounded-none bg-white/80 hover:bg-white text-red-600 hover:text-red-700"
                            onClick={() => handleRemoveFromWishlist(item.productId)}
                          >
                            <Heart className="h-4 w-4 fill-current" />
                          </Button>
                          {!item.inStock && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <Badge className="rounded-none bg-gray-600">
                                OUT OF STOCK
                              </Badge>
                            </div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="p-4 space-y-3">
                          <div>
                            <Badge variant="outline" className="rounded-none text-xs mb-2">
                              {item.category}
                            </Badge>
                            <h3 className="font-medium text-foreground line-clamp-2">
                              {item.name}
                            </h3>
                          </div>

                          {/* Price */}
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-foreground">
                              £{item.price}
                            </span>
                            {item.originalPrice && (
                              <span className="text-sm text-muted-foreground line-through">
                                £{item.originalPrice}
                              </span>
                            )}
                          </div>

                          {/* Sizes */}
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Available sizes:</p>
                            <div className="flex flex-wrap gap-1">
                              {[...new Set(item.sizes)].sort((a, b) => {
                                const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
                                return sizeOrder.indexOf(a) - sizeOrder.indexOf(b);
                              }).map((size) => (
                                <Badge key={size} variant="outline" className="rounded-none text-xs border-border hover:bg-muted/20 transition-colors">
                                  {size}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 pt-2">
                            <Button 
                              size="sm" 
                              className="flex-1 rounded-none" 
                              disabled={!item.inStock}
                              onClick={() => item.inStock && handleAddToCart(item)}
                            >
                              <ShoppingCart className="h-3 w-3 mr-1" />
                              {item.inStock ? "Add to Cart" : "Notify Me"}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="rounded-none text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleRemoveFromWishlist(item.productId)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>

                          {/* Added Date */}
                          <p className="text-xs text-muted-foreground">
                            Added {item.addedDate}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Move to Cart Suggestion */}
                <Card className="border-2 border-border rounded-none bg-primary/5">
                  <CardContent className="p-6 text-center">
                    <h3 className="font-semibold text-foreground mb-2">Ready to Order?</h3>
                    <p className="text-muted-foreground mb-4">
                      Move your favorite items to your cart and take advantage of our military discount.
                    </p>
                    <Button 
                      className="rounded-none"
                      onClick={() => {
                        wishlistItems.forEach(item => {
                          if (item.inStock) {
                            handleAddToCart(item)
                          }
                        })
                      }}
                      disabled={wishlistItems.length === 0 || !wishlistItems.some(item => item.inStock)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add Available Items to Cart
                    </Button>
                  </CardContent>
                </Card>
              </>
            ) : (
              /* Empty Wishlist */
              <Card className="border-2 border-border rounded-none">
                <CardContent className="p-16 text-center">
                  <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
                  <h2 className="text-2xl font-semibold text-foreground mb-4">
                    Your Wishlist is Empty
                  </h2>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                    Start building your wishlist by clicking the heart icon on products you love. 
                    We'll save them here for you to purchase later.
                  </p>
                  <Button className="rounded-none" asChild>
                    <Link href="/products">
                      Continue Shopping
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Wishlist Tips */}
            <Card className="border-2 border-border rounded-none bg-muted/10">
              <CardHeader>
                <CardTitle className={cn(
                  "font-display tracking-wide uppercase"
                )}>
                  Wishlist Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Save for Later</h4>
                    <p className="text-sm text-muted-foreground">
                      Click the heart icon on any product to save it to your wishlist for future purchase.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Price Alerts</h4>
                    <p className="text-sm text-muted-foreground">
                      We'll notify you when items in your wishlist go on sale or come back in stock.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Share Your List</h4>
                    <p className="text-sm text-muted-foreground">
                      Share your wishlist with family and friends - perfect for gift giving occasions.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </Layout>
  )
}