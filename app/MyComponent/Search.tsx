"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import GetRecentCelebrity from "@/lib/actions/GetRecent"; // Ensure this is the correct path to your server action
import CloudFrontImage from "./CloudFrontImage";

export default function CelebritySearch() {
    const [recentCelebrities, setRecentCelebrities] = useState<{ id: number; name: string; image: string }[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch recent celebrities on component mount
  useEffect(() => {
    const fetchCelebrities = async () => {
      try {
        const celebrities = await GetRecentCelebrity(); // Await server action
        setRecentCelebrities(celebrities); // Set fetched data to state
      } catch (error) {
        console.error("Failed to fetch recent celebrities:", error);
      }
    };

    fetchCelebrities();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
        setIsMobileSearchOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleMobileSearch = () => {
    setIsMobileSearchOpen((prev) => !prev); // Only toggle mobile search state
  };

  const closeMobileSearch = () => {
    setIsMobileSearchOpen(false); // Close the search bar
  };

  return (
    <div className="w-full max-w-2xl mx-auto relative">
      {/* Desktop Search */}
      <div className="relative hidden md:block">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search celebrity"
          className="w-full py-2 pl-10 pr-4 text-gray-700 bg-white border rounded-full focus:outline-none focus:border-purple-500"
          onClick={() => setIsDropdownOpen(true)} // Open dropdown when clicking in desktop search input
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Mobile Search Icon */}
      <div className="md:hidden flex justify-end">
        <button onClick={toggleMobileSearch} className="p-2">
          <Search className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      {/* Mobile Search Sidebar */}
      <div
        className={`fixed inset-y-0 right-0 w-full bg-white z-50 transform transition-transform duration-300 ease-in-out ${
          isMobileSearchOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Search Celebrities
            </h2>
            <button onClick={closeMobileSearch} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>
          <input
            ref={inputRef} // Reference to the input to prevent premature closing
            type="text"
            placeholder="Search celebrity"
            className="w-full py-2 pl-10 pr-4 text-gray-700 bg-white border rounded-full focus:outline-none focus:border-purple-500 mb-4"
            // Keep search open while typing
            onFocus={() => setIsMobileSearchOpen(true)} // Ensure that focusing keeps it open
          />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Recent Celebrities
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {recentCelebrities.map((celebrity: any) => (
              <div key={celebrity.id} className="flex flex-col items-center">
                <img
                  src={celebrity.image}
                  alt={celebrity.name}
                  width={80}
                  height={80}
                  className="rounded-full object-cover w-20 h-20 mb-2"
                />
                <p className="text-sm font-medium font-poppins text-gray-800 text-center">
                  {celebrity.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop Dropdown */}
      <div
        ref={dropdownRef}
        className={`absolute z-10 w-full mt-2 bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-500 ease-in-out ${
          isDropdownOpen && !isMobileSearchOpen
            ? "max-h-[600px] opacity-100"
            : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Popular Celebrities
            </h2>
            <button
              onClick={() => setIsDropdownOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {recentCelebrities.map((celebrity) => (
              <div key={celebrity.id} className="flex flex-col items-center">
                <CloudFrontImage
                  src={celebrity.image}
                  alt={celebrity.name}
                  width={80}
                  height={80}
                  className="rounded-full object-cover w-20 h-20 mb-2"
                />
                <p className="text-sm font-medium font-poppins text-gray-800 text-center">
                  {celebrity.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}