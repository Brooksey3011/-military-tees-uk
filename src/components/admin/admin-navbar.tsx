"use client"

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AdminAuthService } from '@/lib/admin-auth'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Shield, LogOut, User, Bell } from 'lucide-react'

export function AdminNavbar() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    AdminAuthService.clearAdminSession()
    await signOut()
    router.push('/')
  }

  return (
    <nav className="bg-foreground text-background border-b-4 border-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/admin" className="flex items-center space-x-3">
              <div className="bg-primary p-2 border-2 border-primary">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <div className="text-lg font-display font-bold tracking-wider uppercase">
                  Admin Command
                </div>
                <div className="text-xs font-display tracking-wide uppercase opacity-80">
                  Military Tees UK
                </div>
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="text-background hover:text-foreground hover:bg-background">
              <Bell className="h-5 w-5" />
            </Button>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <Badge className="rounded-none bg-green-600 text-white border-2 border-green-800">
                ADMIN ACCESS
              </Badge>
              
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span className="text-sm font-medium">
                  {user?.email?.split('@')[0] || 'Admin'}
                </span>
              </div>

              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleSignOut}
                className="text-background hover:text-foreground hover:bg-background rounded-none border-2 border-transparent hover:border-border"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}