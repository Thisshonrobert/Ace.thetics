

import { Menu, Search } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Navbar({ toggleLeftSidebar, toggleRightSidebar }:any) {
  return (
    <nav className="flex items-center justify-between p-4 bg-white border-b ">
      <Button variant="ghost" size="icon" onClick={toggleLeftSidebar}>
        <Menu className="h-6 w-6" />
        <span className="sr-only">Toggle menu</span>
      </Button>
      <h1 className="text-5xl font-bold font-signature">Ace.Thetics</h1>
      <Button variant="ghost" size="icon" onClick={toggleRightSidebar}>
        <Search className="h-6 w-6" />
        <span className="sr-only">Toggle search</span>
      </Button>
    </nav>
  )
}