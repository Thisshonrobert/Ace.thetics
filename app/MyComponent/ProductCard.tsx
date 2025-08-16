"use client";

import { BackgroundGradient } from "@/components/ui/background-gradient";
import { CiViewList } from "react-icons/ci";
import { IoBagOutline } from "react-icons/io5";
import ImageComponent from "./ImageComponent";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import AuthDialog from "@/components/ui/AuthDialog";
import { useState } from "react";
import { trackAffiliateClick } from "@/lib/gtag";

interface ProductCardProps {
  image: string;
  alt: string;
  seoname: string;
  description: string;
  category: string;
  link: string;
  isWishlisted: boolean;
  onWishlistToggle: () => void;
  
}

export default function ProductCard({
  image,
  alt,
  seoname,
  description,
  category,
  link,
  isWishlisted,
  onWishlistToggle,
  
}: ProductCardProps) {
  const { data: session } = useSession();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

  const handleWishlistClick = () => {
    if (!session) {
      setIsAuthDialogOpen(true);
      return;
    }
    onWishlistToggle();
  };

  const handleAffiliateClick = () => {
    // Track affiliate click with analytics
   
      trackAffiliateClick( seoname, link.split('.')[0]);
    
  };

  return (
    <div className="w-full max-w-sm mx-auto ">
      <BackgroundGradient className="rounded-[22px] p-1">
        <div className="rounded-[20px] p-4 sm:p-6 bg-white dark:bg-zinc-900">
          <div className="relative aspect-square w-full rounded-lg overflow-hidden">
            <div className="w-full h-full relative bg-white flex items-center justify-center p-1">
              <ImageComponent
                src={image}
                alt={alt}
                width={200}
                height={200}
                className="w-auto h-auto max-w-full max-h-full object-contain"
                transformation={[
                  {
                    width: "200",
                    height: "200",
                    quality: "90",
                    crop: "at_max",
                    background: "FFFFFF"
                  },
                ]}
                lqip={{ active: true, quality: 20, blur: 10 }}
                loading="lazy"
              />
            </div>
          </div>
          <h3 className="text-semibold sm:text-xl font-poppins text-black mt-4 mb-2 dark:text-neutral-200 line-clamp-2">
            {seoname}
          </h3>
          <p className="text-sm text-neutral-600 font-poppins dark:text-neutral-400 line-clamp-2">
            {description}
          </p>
          <div className="flex justify-between mt-4 gap-2">
            <Button
              variant="gooeyLeft"
              className="flex-1 rounded-full px-4 py-2 text-white flex items-center justify-center space-x-2 bg-black text-xs font-bold dark:bg-zinc-800 hover:opacity-90 transition-opacity"
              onClick={handleAffiliateClick}
            >
              <a
                href={`https://${link}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex"
              >
                <span>Buy now</span>
                <IoBagOutline className="ml-2" />
              </a>
            </Button>

            <Button
              variant="gooeyRight"
              onClick={handleWishlistClick}
              className={`flex-1 rounded-full px-4 py-2 text-white flex items-center justify-center space-x-2 ${
                isWishlisted
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-black hover:bg-black/90"
              } text-xs font-bold dark:bg-zinc-800 transition-colors`}
            >
              <span>{isWishlisted ? "Remove" : "Wishlist"}</span>
              <CiViewList className="ml-2" />
            </Button>
          </div>
        </div>
      </BackgroundGradient>
      <AuthDialog isOpen={isAuthDialogOpen} onClose={() => setIsAuthDialogOpen(false)} />
    </div>
  );
}
