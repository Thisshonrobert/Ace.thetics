"use client"

import { PropsWithChildren, useState } from "react"
import LeftSidebar from "./LeftSidebar"
import Navbar from "./NavBar"


export default function Layout({ children}:PropsWithChildren) {
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false)
 

  return (
    <div className="min-h-screen flex flex-col">
      
      <Navbar
        toggleLeftSidebar={() => setLeftSidebarOpen(!leftSidebarOpen)}
     
      />
      
      
      
      <main className="flex-1 ">
        {children}
      </main>
      <LeftSidebar isOpen={leftSidebarOpen} onClose={() => setLeftSidebarOpen(false)} />
    </div>
  )
}