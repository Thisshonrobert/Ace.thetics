"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Heart, List, Settings, ShoppingBag, Star, Tag } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { HiArrowNarrowRight } from "react-icons/hi";
import { GiMale } from "react-icons/gi";
import { IoIosFemale } from "react-icons/io";
import { FaBabyCarriage } from "react-icons/fa";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";


const menuItems = [
  { icon: GiMale, label: "Men" ,route:"/filter/men"},
  { icon: IoIosFemale, label: "Women",route:"/filter/women" },
  { icon: FaBabyCarriage, label: "Kids",route:"/filter/kids" },
  { icon: Heart, label: "Liked",route:"/liked" },
  { icon: List, label: "Wishlist",route:"/WishList" },
  { icon: ShoppingBag, label: "Products",route:"/Products" },
  { icon: Tag, label: "Shops",route:"/Shops" },
];

export default function LeftSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  const { data: session } = useSession();

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-[240px] sm:w-[300px] p-0">
        <nav className="h-full bg-white flex flex-col justify-between overflow-y-auto">
          {/* Top Section: Logo and Title */}
          <div className="flex flex-col items-center p-4 border-b">
            <Image
              src="/Acethetics.png"
              alt="Ace.Thetics logo"
              width={40}
              height={40}
              className="rounded-md"
            />
            <div className="text-center mt-2 ">
              <span className="block text-sm font-semibold">Ace.Thetics</span>
              <span className="block text-xs text-slate-500">Livi'n Style</span>
            </div>
          </div>

          {/* Menu Items Section */}
          <ul className="space-y-2 p-4 flex-grow">
            {menuItems.map((item, index) => (
              <li key={index}>
                <button
                  className="flex items-center justify-between w-full px-4 py-2 text-gray-700 hover:bg-gray-200 rounded"
                  onClick={onClose}
                >
                  <div className="flex items-center hover:cursor-pointer" onClick={()=>router.push(item.route)}>
                    <item.icon className="h-5 w-5 mr-3" />
                    <span className="mr-2">{item.label}</span>
                  </div>
                  <HiArrowNarrowRight className="h-5 w-5 text-gray-500" />
                </button>
              </li>
            ))}
          </ul>

          {/* Bottom Section: Register and Sign In */}
          {!session && (
            <div className="p-4 border-t border-gray-200">
              <div className="text-center font-poppins font-medium mb-2">
              Sign up to save outfits to your Wishlist 
              </div>
              <Button
                onClick={() => router.push("/api/auth/signin")}
                className="h-10 w-full"
              >
                Sign in
              </Button>
            </div>
          )}
          {session && (
            <div className="flex items-center justify-between p-4 border-t border-gray-200">
              <Avatar className="h-10 w-10">
                <AvatarImage src={session.user?.image || undefined} alt={session.user?.name || 'User'} />
                <AvatarFallback>{session.user?.name?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="icon" className="h-10 w-10">
              <DropdownMenu>
              <DropdownMenuTrigger><Settings className="h-6 w-6" /></DropdownMenuTrigger>
              <DropdownMenuContent>
                  <DropdownMenuItem onClick={()=>router.push("/api/auth/signout")}>Log Out</DropdownMenuItem>
                </DropdownMenuContent>
                
              </DropdownMenu>
              </Button>
            </div>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}