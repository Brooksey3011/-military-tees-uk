import { Metadata } from "next"
import Link from "next/link"
import { MapPin, Plus, Edit, Trash2, ArrowLeft, Star } from "lucide-react"
import { Layout } from "@/components/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "My Addresses | Military Tees UK",
  description: "Manage your delivery addresses for Military Tees UK. Add, edit, and set default shipping and billing addresses.",
  robots: {
    index: false,
    follow: false,
  }
}

export default function AddressesPage() {
  const addresses = [
    {
      id: 1,
      type: "shipping",
      isDefault: true,
      name: "John Smith",
      company: "",
      street: "123 Military Base Road",
      street2: "Block A, Room 15",
      city: "Aldershot",
      county: "Hampshire",
      postcode: "GU11 2DP",
      country: "United Kingdom",
      phone: "+44 1234 567890"
    },
    {
      id: 2,
      type: "billing",
      isDefault: true,
      name: "John Smith",
      company: "",
      street: "456 Civilian Street",
      street2: "",
      city: "London",
      county: "Greater London",
      postcode: "SW1A 1AA",
      country: "United Kingdom",
      phone: "+44 1234 567891"
    },
    {
      id: 3,
      type: "shipping",
      isDefault: false,
      name: "John Smith",
      company: "Royal Marines Base",
      street: "BFPO 234",
      street2: "",
      city: "",
      county: "",
      postcode: "",
      country: "BFPO",
      phone: "+44 1234 567892"
    }
  ]

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
                    My Addresses
                  </h1>
                  <p className="text-muted-foreground">Manage your shipping and billing addresses</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Addresses Content */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* Add New Address */}
            <Card className="border-2 border-border rounded-none bg-primary/5">
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold text-foreground mb-2">Add New Address</h3>
                <p className="text-muted-foreground mb-4">
                  Add a new shipping or billing address to your account for faster checkout.
                </p>
                <Button className="rounded-none" disabled>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Address
                </Button>
              </CardContent>
            </Card>

            {/* Addresses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {addresses.map((address) => (
                <Card key={address.id} className="border-2 border-border rounded-none">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <CardTitle className="text-base capitalize">
                          {address.type} Address
                        </CardTitle>
                      </div>
                      {address.isDefault && (
                        <Badge className="rounded-none bg-green-600 hover:bg-green-700 flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          DEFAULT
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-2 text-sm mb-6">
                      <div className="font-medium text-foreground">{address.name}</div>
                      {address.company && (
                        <div className="text-muted-foreground">{address.company}</div>
                      )}
                      <div className="text-muted-foreground">
                        <div>{address.street}</div>
                        {address.street2 && <div>{address.street2}</div>}
                        {address.city && (
                          <div>
                            {address.city}
                            {address.county && `, ${address.county}`}
                          </div>
                        )}
                        {address.postcode && <div>{address.postcode}</div>}
                        <div>{address.country}</div>
                      </div>
                      {address.phone && (
                        <div className="text-muted-foreground">{address.phone}</div>
                      )}
                    </div>

                    {/* Special BFPO Notice */}
                    {address.country === "BFPO" && (
                      <div className="bg-green-600/10 p-3 rounded-none border-l-4 border-green-600 mb-4">
                        <div className="text-sm text-green-800 dark:text-green-200">
                          <strong>BFPO Address</strong>
                          <p className="text-xs mt-1">Free shipping to BFPO addresses</p>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 rounded-none border-2" disabled>
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      {!address.isDefault && (
                        <Button size="sm" variant="ghost" className="rounded-none text-red-600 hover:text-red-700 hover:bg-red-50" disabled>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>

                    {/* Set Default Button */}
                    {!address.isDefault && (
                      <Button size="sm" variant="ghost" className="w-full mt-2 rounded-none text-xs" disabled>
                        Set as Default {address.type}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Address Management Tips */}
            <Card className="border-2 border-border rounded-none">
              <CardHeader>
                <CardTitle className={cn(
                  "font-display tracking-wide uppercase"
                )}>
                  Address Management Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Military Addresses</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>BFPO addresses qualify for free shipping</li>
                      <li>Include unit and building details for base addresses</li>
                      <li>Contact us for special delivery arrangements</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Address Accuracy</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Ensure postcode is correct for UK addresses</li>
                      <li>Include phone number for delivery coordination</li>
                      <li>Update addresses before each order</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-muted/20 p-4 rounded-none border-l-4 border-primary">
                  <p className="text-sm">
                    <strong className="text-foreground">Security Note:</strong> We never store full payment card details. 
                    Billing addresses are used for verification purposes only during checkout.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Help Section */}
            <Card className="border-2 border-border rounded-none bg-muted/10">
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold text-foreground mb-2">Need Help with Addresses?</h3>
                <p className="text-muted-foreground mb-4">
                  Having trouble with BFPO addresses or need special delivery arrangements?
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button className="rounded-none" disabled>
                    Contact Support
                  </Button>
                  <Button variant="outline" className="rounded-none border-2" disabled>
                    Delivery FAQ
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </Layout>
  )
}