'use client'

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import CelebritySearch from "./Search";
import { AiFillInstagram } from "react-icons/ai";
import { FaPinterest } from "react-icons/fa";

export default function Navbar({ toggleLeftSidebar }: { toggleLeftSidebar: () => void }) {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
      isScrolled ? 'h-14 bg-white shadow-md' : 'h-22 bg-white'
    }`}>
      <div className={`flex items-center justify-between p-4 transition-all duration-300 ease-in-out ${
        isScrolled ? 'h-16' : 'h-24'
      }`}>
        <Button
          variant="ghost"
          size='icon'
          onClick={toggleLeftSidebar}
          className="sm:ml-6"
        >
          <Menu className={`transition-all duration-300 ease-in-out ${
            isScrolled ? 'h-5 w-5' : 'h-6 w-6'
          }`} />
          <span className="sr-only">Toggle menu</span>
        </Button>
        <button
          onClick={() => router.push("/")}
          className={`font-bold ml-3 md:pl-[18%] transition-all duration-300 ease-in-out ${
            isScrolled ? 'text-xl' : 'text-2xl'
          }`}
        >
          <span className="font-Dancing font-extrabold tracking-tight ">Ace</span><span className="font-Dancing font-bold text-gray-700">.thetics</span>
        </button>
        <div className="flex items-center">
          <div className={`hidden md:flex space-x-3 mr-2 transition-all duration-300 ease-in-out ${
            isScrolled ? 'text-sm' : 'text-base'
          }`}>
            <AiFillInstagram />
            <FaPinterest />
          </div>
          <CelebritySearch />
        </div>
      </div>
    </nav>
  );
}