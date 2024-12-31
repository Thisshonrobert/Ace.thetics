"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Heart, List, Settings } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FaBabyCarriage } from "react-icons/fa";
import { GiMale } from "react-icons/gi";
import { HiArrowNarrowRight } from "react-icons/hi";
import { IoIosFemale } from "react-icons/io";
import AuthDialog from "@/components/ui/AuthDialog";
import { Terminal } from "lucide-react"
 
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const menuItems = [
  { icon: GiMale, label: "Men", route: "/filter/men" },
  { icon: IoIosFemale, label: "Women", route: "/filter/women" },
 
  { icon: Heart, label: "Liked", route: "/liked", requiresAuth: true },
  { icon: List, label: "Wishlist", route: "/wishlist", requiresAuth: true },
];

export default function LeftSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

  const handleNavigation = (route: string, requiresAuth: boolean) => {
    if (requiresAuth && !session) {
      setIsAuthDialogOpen(true);
    } else {
      router.push(route);
      onClose();
    }
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="left" className="w-[240px] sm:w-[300px] p-0">
          <nav className="h-full bg-white flex flex-col justify-between overflow-y-auto" aria-label="Main Navigation">
            <div className="flex flex-col items-center p-4 border-b">
              <Image
                src="/Acethetics.png"
                alt="Ace.Thetics logo"
                width={40}
                height={40}
                className="rounded-md"
              />
              <div className="text-center mt-2">
                <h1 className="block text-md font-semibold font-signature"><span className=" text-md font-bold font-Dancing">Ace.</span>Thetics</h1>
                <p className="block text-xs text-slate-500">Livi'n Style</p>
              </div>
            </div>

            <ul className="space-y-2 p-4 flex-grow">
              {menuItems.map((item, index) => (
                <li key={index}>
                  <Button
                    variant="ghost"
                    className="flex items-center justify-between w-full px-4 py-2 text-gray-700 hover:bg-gray-200 rounded"
                    onClick={() => handleNavigation(item.route, item.requiresAuth || false)}
                  >
                    <div className="flex items-center">
                      <item.icon className="h-5 w-5 mr-3" aria-hidden="true" />
                      <span>{item.label}</span>
                    </div>
                    <HiArrowNarrowRight className="h-5 w-5 text-gray-500" aria-hidden="true" />
                  </Button>
                </li>
              ))}
            </ul>
            <div className="my-2">
            <Alert >
      <Terminal className="h-4 w-4" />
      <AlertTitle>Disclaimer!</AlertTitle>
      <AlertDescription>
       This Page Contains Affiliate Links; I may earn a commission at no extra cost to you
      </AlertDescription>
            </Alert>
            </div>
           
            <footer className="p-4 border-t border-gray-200">
            
              {!session ? (
                <>
                  <p className="text-center font-poppins font-medium mb-2">
                    Sign up to save outfits to your Wishlist
                  </p>
                  <Button
                    onClick={() => router.push("/api/auth/signin")}
                    className="h-10 w-full"
                  >
                    Sign in
                  </Button>
                </>
              ) : (
                <div className="flex items-center justify-between">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={session.user?.image || undefined} alt={session.user?.name || 'User'} />
                    <AvatarFallback>{session.user?.name?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-10 w-10" aria-label="User settings">
                        <Settings className="h-6 w-6" aria-hidden="true" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => router.push("/api/auth/signout")}>
                        Log Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </footer>
          </nav>
        </SheetContent>
      </Sheet>
      <AuthDialog isOpen={isAuthDialogOpen} onClose={() => setIsAuthDialogOpen(false)} />
    </>
  );
}