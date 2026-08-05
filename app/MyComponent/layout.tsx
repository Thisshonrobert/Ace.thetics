"use client"

import { PropsWithChildren, useState } from "react"
import LeftSidebar from "./LeftSidebar"
import Navbar from "./NavBar"
import { usePathname } from "next/navigation"
import { usePageTracking } from "@/hooks/usePageTracking"

/**
 * Routes that render their own chrome. `/admin` has its own nav bar, and the
 * fixed public navbar used to sit on top of it — which is what the `mt-10`
 * fudge in the admin layout was compensating for.
 */
const CHROMELESS_PREFIXES = ["/landing", "/admin", "/auth/signin"]

export default function Layout({ children }: PropsWithChildren) {
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false)
  const pathname = usePathname()

  // Track page views with consent
  usePageTracking()

  const showChrome = !CHROMELESS_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )

  return (
    <div className="flex flex-col">
      {showChrome && (
        <Navbar toggleLeftSidebar={() => setLeftSidebarOpen(!leftSidebarOpen)} />
      )}
      <main className="flex-1">
        {children}
      </main>
      {showChrome && (
        <LeftSidebar isOpen={leftSidebarOpen} onClose={() => setLeftSidebarOpen(false)} />
      )}
    </div>
  )
}
