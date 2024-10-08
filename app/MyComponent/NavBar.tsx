import React from "react";
import { Input } from "@/components/ui/input";
import { CommandIcon, Search } from "lucide-react";
 import { Sidebar } from "./Sidebar";

const NavBar = () => {
  return (

    <div className="w-full h-20 flex  px-4 fixed border-b">
      <div className="flex-grow flex justify-center">
        <div className="text-5xl font-signature pt-4 pl-2">
          <h1>Ace.Thetics</h1>
        </div>
      </div>

      <div className="relative ml-auto flex-1 md:grow-0 pt-4">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground mt-4" />

        <Input
          type="search"
          placeholder="Search..."
          className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[236px]"
        />
        {/* <div className="absolute right-4 top-2 flex items-center space-x-0.5 border rounded-sm bg-gray-100 mt-4">
          <CommandIcon className="h-4 w-4 text-muted-foreground" />
          <h3>k</h3>
        </div> */}
      </div>
    </div>
  );
};

export default NavBar;
