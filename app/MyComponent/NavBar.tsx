import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import CelebritySearch from "./Search";
import { AiFillInstagram } from "react-icons/ai";
import { FaPinterest } from "react-icons/fa";
export default function Navbar({ toggleLeftSidebar }: any) {
  const router = useRouter();
  return (
    <nav className="flex items-center justify-between p-4  border-b bg-zinc-100 ">
      <Button
        variant="ghost"
        size='lg'
        onClick={toggleLeftSidebar}
        className="sm:ml-6"
      >
        <Menu className="h-6 w-6" />
        <span className="sr-only ">Toggle menu</span>
      </Button>
      <button
        onClick={() => router.push("/")}
        className="text-5xl font-bold font-signature ml-3 md:pl-[18%]"
      >
        <span className="font-Dancing font-bold">Ace</span>.Thetics
      </button>
      <div className="flex items-center ">
        <div className="hidden sm:flex space-x-3 mr-2">
          <AiFillInstagram />
          <FaPinterest />
        </div>

        <CelebritySearch />
      </div>
    </nav>
  );
}
