"use client"

import { PropsWithChildren, useState } from "react"
import Navbar from "./NavBar"
import LeftSidebar from "./LeftSidebar"
import RightSidebar from "./RightSidebar"

export default function Layout({ children}:PropsWithChildren) {
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        toggleLeftSidebar={() => setLeftSidebarOpen(!leftSidebarOpen)}
        toggleRightSidebar={() => setRightSidebarOpen(!rightSidebarOpen)}
      />
      <main className="flex-1 bg-zinc-300">
        {children}
      </main>
      <LeftSidebar isOpen={leftSidebarOpen} onClose={() => setLeftSidebarOpen(false)} />
      <RightSidebar isOpen={rightSidebarOpen} onClose={() => setRightSidebarOpen(false)} />
    </div>
  )
}