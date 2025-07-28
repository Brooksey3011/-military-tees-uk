"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  Settings,
  MessageSquare,
  Search,
  Mail,
  FileText
} from 'lucide-react'

const adminNavigation = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    description: 'Overview & Analytics'
  },
  {
    name: 'Products',
    href: '/admin/products',
    icon: Package,
    description: 'Manage Inventory'
  },
  {
    name: 'Orders',
    href: '/admin/orders',
    icon: ShoppingCart,
    description: 'Order Management'
  },
  {
    name: 'Customers',
    href: '/admin/customers',
    icon: Users,
    description: 'Customer Database'
  },
  {
    name: 'Reviews',
    href: '/admin/reviews',
    icon: MessageSquare,
    description: 'Review Management'
  },
  {
    name: 'Search',
    href: '/admin/search',
    icon: Search,
    description: 'Search Settings'
  },
  {
    name: 'Marketing',
    href: '/admin/marketing',
    icon: Mail,
    description: 'Email & Campaigns'
  },
  {
    name: 'Reports',
    href: '/admin/reports',
    icon: BarChart3,
    description: 'Sales Analytics'
  },
  {
    name: 'Content',
    href: '/admin/content',
    icon: FileText,
    description: 'Pages & Content'
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    description: 'System Settings'
  }
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-muted border-r-2 border-border min-h-screen">
      <div className="p-4">
        <h2 className="text-xs font-display font-bold tracking-widest uppercase text-muted-foreground mb-4">
          Command Center
        </h2>
        
        <nav className="space-y-1">
          {adminNavigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 text-sm transition-colors rounded-none border-2',
                  isActive
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background border-transparent hover:border-border'
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs opacity-70">{item.description}</div>
                </div>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Quick Stats */}
      <div className="p-4 border-t-2 border-border mt-8">
        <h3 className="text-xs font-display font-bold tracking-widest uppercase text-muted-foreground mb-3">
          Quick Stats
        </h3>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span>Active Products:</span>
            <span className="font-mono">--</span>
          </div>
          <div className="flex justify-between">
            <span>Pending Orders:</span>
            <span className="font-mono">--</span>
          </div>
          <div className="flex justify-between">
            <span>Total Customers:</span>
            <span className="font-mono">--</span>
          </div>
        </div>
      </div>
    </div>
  )
}