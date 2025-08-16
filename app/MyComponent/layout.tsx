"use client"

import { PropsWithChildren, useState } from "react"
import LeftSidebar from "./LeftSidebar"
import Navbar from "./NavBar"
import { usePathname } from "next/navigation"
import { usePageTracking } from "@/hooks/usePageTracking"

export default function Layout({ children }: PropsWithChildren) {
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false)
  const pathname = usePathname()
  
  // Track page views with consent
  usePageTracking()

  return (
    <div className="max-h-screen flex flex-col">
      {pathname !== "/landing" && (
        <Navbar toggleLeftSidebar={() => setLeftSidebarOpen(!leftSidebarOpen)} />
      )}
      <main className="flex-1">
        {children}
      </main>
      <LeftSidebar isOpen={leftSidebarOpen} onClose={() => setLeftSidebarOpen(false)} />
    </div>
  )
}
