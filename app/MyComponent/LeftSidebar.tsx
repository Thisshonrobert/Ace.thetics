'use client';
import { Star, Gift, Heart, List, ShoppingBag, Tag } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { FaAngleRight } from "react-icons/fa"; // Import the right arrow icon
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const menuItems = [
  { icon: Star, label: "Stars" },
  { icon: Gift, label: "Offers" },
  { icon: Heart, label: "Liked" },
  { icon: List, label: "Wishlist" },
  { icon: ShoppingBag, label: "Products" },
  { icon: Tag, label: "Brands" },
];


export default function LeftSidebar({ isOpen, onClose }: any) {
  const router = useRouter();
  const session = useSession();
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-[240px] sm:w-[300px] p-0">
        <nav className="h-full bg-white flex flex-col justify-between overflow-y-auto">
          {/* Top Section: Logo and Title */}
          <div className="flex flex-col items-center p-4">
            <Image
              src="/Acethetics.png" // Path to your image
              alt="Ace.Thetics logo" // Alternative text for accessibility
              width={40} // Width of the image
              height={40} // Height of the image
              className="rounded-md" // Additional styles
            />
            <div className="text-center mt-2">
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
                  <div className="flex items-center">
                    <item.icon className="h-5 w-5 mr-3" />
                    <span className="mr-2">{item.label}</span>
                  </div>

                  <FaAngleRight className="h-5 w-5 text-gray-500" />
                </button>
              </li>
            ))}
          </ul>

          {/* Bottom Section: Register and Sign In */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-center font-poppins font-medium mb-2">
              Register to save outfits to your Wishlist, and view price drops
            </div>
            <Button onClick={()=>router.push(`${process.env.NEXTAUTH_URL='http://localhost:3000'}/api/auth/signin/`)} className="h-10 w-full">
              Sign in
            </Button>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
