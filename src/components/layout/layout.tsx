import { Header } from "./header"
import { Footer } from "./footer"
import { CartDrawer } from "@/components/cart/cart-drawer"
import { ClientOnly } from "@/components/ui/client-only"
import { AccessibilityWrapper, SkipLink, Announcement, useAnnouncement } from "@/components/ui/accessibility-enhancements"

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { announcement } = useAnnouncement()

  return (
    <AccessibilityWrapper className="min-h-screen flex flex-col">
      <SkipLink targetId="main-content">Skip to main content</SkipLink>
      <SkipLink targetId="footer-content">Skip to footer</SkipLink>
      
      <Header />
      
      <main id="main-content" className="flex-1" tabIndex={-1}>
        {children}
      </main>
      
      <Footer />
      
      {announcement && (
        <Announcement message={announcement} priority="polite" />
      )}
      
      <ClientOnly>
        <CartDrawer />
      </ClientOnly>
    </AccessibilityWrapper>
  )
}