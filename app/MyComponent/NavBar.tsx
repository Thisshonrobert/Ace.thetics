'use client'

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import CelebritySearch from "./Search";

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
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${isScrolled ? 'h-14 bg-white shadow-md' : 'h-22 bg-white'
      }`}>
      {/* The title is absolutely centred on the bar instead of being nudged with
          `md:pl-[18%]`. That percentage was tuned for one viewport width, so the
          word drifted off-centre at every other size and crowded the search box
          on medium screens. */}
      <div className={`relative flex items-center justify-between px-4 transition-all duration-300 ease-in-out ${isScrolled ? 'h-16' : 'h-24'
        }`}>
        <Button
          variant="ghost"
          size='icon'
          onClick={toggleLeftSidebar}
          className="shrink-0 sm:ml-6"
        >
          <Menu className={`transition-all duration-300 ease-in-out ${isScrolled ? 'h-5 w-5' : 'h-6 w-6'
            }`} />
          <span className="sr-only">Toggle menu</span>
        </Button>

        <button
          onClick={() => router.push("/")}
          aria-label="Acethetics home"
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-bold transition-all duration-300 ease-in-out ${isScrolled ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'
            }`}
        >
          <h1 className="acethetics-heading">Acethetics</h1>
        </button>

        <div className="ml-auto flex items-center">
          <CelebritySearch />
        </div>
      </div>
    </nav>
  );
}