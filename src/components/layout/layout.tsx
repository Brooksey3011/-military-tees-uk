import { Header } from "./header"
import { Footer } from "./footer"
import { CartDrawer } from "@/components/cart/cart-drawer"
import { ClientOnly } from "@/components/ui/client-only"

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <ClientOnly>
        <CartDrawer />
      </ClientOnly>
    </div>
  )
}