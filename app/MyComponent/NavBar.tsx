

import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { FaPinterest } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa6";
import CelebritySearch from "./Search";
export default function Navbar({ toggleLeftSidebar}:any) {
  return (
    
    <nav className="flex items-center justify-between p-4 bg-white border-b ">
      <Button variant="ghost" size="icon" onClick={toggleLeftSidebar}>
        <Menu className="h-6 w-6" />
        <span className="sr-only">Toggle menu</span>
      </Button>
      <h1 className="text-5xl font-bold font-signature ml-3"><span className="font-Dancing font-bold">Ace</span>.Thetics</h1>
      <div className="flex space-x-3 items-center">
     
        <div className="hidden sm:flex space-x-3">
        <FaPinterest/>
        <FaInstagram/>
        </div>
        
        <CelebritySearch/>
      </div>
      
    </nav>
  )
}