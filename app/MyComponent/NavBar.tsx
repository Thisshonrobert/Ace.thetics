

import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { FaPinterest } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa6";
import CelebritySearch from "./Search";
import { redirect, useRouter } from "next/navigation";
export default function Navbar({ toggleLeftSidebar}:any) {
  const router = useRouter();
  return (
    
    <nav className="flex items-center justify-between p-4  border-b bg-zinc-50">
      <Button variant="ghost" size="icon" onClick={toggleLeftSidebar} className="sm:ml-6">
        <Menu className="h-6 w-6" />
        <span className="sr-only ">Toggle menu</span>
      </Button>
      <button onClick={()=>router.push("/")} className="text-5xl font-bold font-signature ml-3 md:pl-[18%]"><span className="font-Dancing font-bold">Ace</span>.Thetics</button>
      <div className="items-center">
        <CelebritySearch/>
      </div>
      
    </nav>
  )
}