import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import Image from "next/image"; // Import Image from next/image
import { FaAngleRight, FaSearch } from "react-icons/fa";

const popularArtists = [
  "Lil Baby", "DaBaby", "Lil Tjay", "2 Chainz", "Central Cee",
  "NLE Choppa", "Lil Uzi Vert", "Moneybagg Yo", "Gunna", "Lil Migo"
];

export default function RightSidebar({ isOpen, onClose }: any) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[250px] sm:w-[300px] p-0">
        <div className="h-full bg-white overflow-y-auto p-4 mt-6">
          {/* Search bar with a search icon and outline-none */}
          <div className="relative mb-4 ">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Search"
              className="pl-10 outline-none border border-gray-300 rounded-md w-full "
            />
          </div>

          {/* Popular Artists List */}
          <h2 className="font-semibold text-xl mb-2">Most Popular</h2>
          <ul className="space-y-5">
            {popularArtists.map((artist, index) => (
              <li
                key={index}
                className="flex items-center justify-between" // Use justify-between for proper spacing
              >
                <div className="flex items-center">
                  {/* Artist Image */}
                  <Image
                    src={`/luffy.jpg`} // Placeholder image
                    alt={artist}
                    width={32} // Width of the image
                    height={32} // Height of the image
                    className="rounded-full mr-2" // Ensure the image is round
                  />
                  <span className="font-medium font-poppins">{artist}</span>
                </div>

                {/* Arrow on the right side */}
                <FaAngleRight className="text-gray-400" />
              </li>
            ))}
          </ul>
        </div>
      </SheetContent>
    </Sheet>
  );
}
