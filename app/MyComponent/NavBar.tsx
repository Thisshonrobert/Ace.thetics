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
      {/* `1fr auto 1fr` grid. The two outer tracks are always equal, so the
          `auto` middle track lands on the bar's true centre — which a flex
          layout could not do, because `flex-1` only centres within whatever
          space the siblings left over, pulling the title left of centre
          whenever the search box was wider than the menu button.

          The search column is allowed to shrink (`min-w-0` here plus a
          percentage-free `w-full` on the field), so as the viewport narrows the
          search field gives up width rather than pushing into the title. That
          is what keeps this from regressing into the overlap the absolute
          centring caused at the `md` breakpoint. */}
      <div className={`grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 md:gap-6 transition-all duration-300 ease-in-out ${isScrolled ? 'h-16' : 'h-24'
        }`}>
        <div className="flex min-w-0 justify-start">
          <Button
            variant="ghost"
            size='icon'
            onClick={toggleLeftSidebar}
            className="shrink-0 sm:ml-2"
          >
            <Menu className={`transition-all duration-300 ease-in-out ${isScrolled ? 'h-5 w-5' : 'h-6 w-6'
              }`} />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>

        <button
          onClick={() => router.push("/")}
          aria-label="Acethetics home"
          className={`cursor-pointer whitespace-nowrap font-bold transition-all duration-300 ease-in-out ${isScrolled ? 'text-base sm:text-lg md:text-xl' : 'text-lg sm:text-xl md:text-2xl'
            }`}
        >
          <h1 className="acethetics-heading">Acethetics</h1>
        </button>

        <div className="flex min-w-0 items-center justify-end">
          <CelebritySearch />
        </div>
      </div>
    </nav>
  );
}