"use client"

import { PropsWithChildren, useState } from "react"
import Navbar from "./NavBar"
import LeftSidebar from "./LeftSidebar"

export default function Layout({ children}:PropsWithChildren) {
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col">
      
      <Navbar
        toggleLeftSidebar={() => setLeftSidebarOpen(!leftSidebarOpen)}
        // toggleLeftSidebar={() => setRightSidebarOpen(!rightSidebarOpen)}
      />
      
      <main className="flex-1 ">
        {children}
      </main>
      <LeftSidebar isOpen={leftSidebarOpen} onClose={() => setLeftSidebarOpen(false)} />
    </div>
  )
}