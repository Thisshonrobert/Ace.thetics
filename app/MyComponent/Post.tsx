'use client'

import { Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef, useTransition, useEffect } from "react";
import CloudFrontImage from "./CloudFrontImage";
import { shops } from "@/constants/shop";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HiArrowNarrowRight } from "react-icons/hi";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { likePost } from "@/lib/actions/LikePost";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export interface Product {
  id: number;
  brandname: string;
  seoname: string;
  shop: string;
  image: string;
}

export interface PostProps {
  id: number;
  celebrityImages: string[];
  celebrityDp: string;
  celebrityName: string;
  postDate: string;
  products: Product[];
  initialLikedState: boolean;
}

export default function PostComponent({
  id,
  celebrityImages,
  celebrityDp,
  celebrityName,
  postDate,
  products,
  initialLikedState,
}: PostProps) {
  const [liked, setLiked] = useState(initialLikedState);
  const [isPending, startTransition] = useTransition();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product>();
  const router = useRouter();
  const { data: session } = useSession();

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -200 : 200;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    router.push(`/product/${product.id}`);
  };

  const handleLike = () => {
    if (!session) {
      <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Show Dialog</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
      return;
    }

    startTransition(async () => {
      try {
        const result = await likePost(id);
        if (result.success) {
          setLiked(result.liked);
        }
      } catch (error) {
        console.error('Failed to like post:', error);
        // Handle error (e.g., show a toast notification)
      }
    });
  };

  return (
    <div className="w-[90%] max-w-sm sm:max-w-3xl mx-auto bg-white rounded-3xl overflow-hidden shadow-lg mt-4">
      {/* Desktop View */}
      <div className="hidden sm:flex ">
        <div className="w-1/2 relative overflow-hidden">
          {celebrityImages.map((image, index) => (
            <CloudFrontImage
              key={index}
              src={image}
              alt={`${celebrityName} ${index + 1}`}
              width={500}
              height={480}
              className={`object-cover w-full  absolute top-0 left-0 transition-opacity duration-300 ${
                index === currentImageIndex ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
          <div
            className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-opacity duration-300 cursor-pointer"
            onMouseEnter={() =>
              setCurrentImageIndex(
                (prev) => (prev + 1) % celebrityImages.length
              )
            }
            onMouseLeave={() => setCurrentImageIndex(0)}
          />
        </div>
        <div className="w-1/2 p-4 flex flex-col ">
          <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-gray-100">
            <div className="flex items-center hover:cursor-pointer" onClick={()=>router.push(`/celebrity/${encodeURIComponent(celebrityName)}`)}>
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 mr-2">
                <CloudFrontImage
                  src={celebrityDp}
                  alt={celebrityName}
                  width={40}
                  height={40}
                  className="object-cover w-full h-full"
                />
              </div>
              <div>
                <h2 className="font-bold">{celebrityName}</h2>
                <p className="text-sm text-gray-500">{postDate}</p>
              </div>
            </div>
            <button
              onClick={handleLike}
              className="focus:outline-none"
              disabled={isPending}
            >
              <Heart
                className={`h-6 w-6 ${
                  liked ? "fill-red-500 text-red-500" : "text-gray-400"
                } ${isPending ? "opacity-50" : ""}`}
              />
            </button>
          </div>
          <div className="flex-grow overflow-y-auto">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex items-center space-x-3 p-2 rounded-lg border-b mb-2 shadow-md hover:cursor-pointer"
                onClick={() => handleProductClick(product)}
              >
                <CloudFrontImage
                  src={product.image}
                  alt={product.seoname}
                  width={48}
                  height={48}
                  className="rounded-md ml-2"
                />
                <div className="flex-grow pl-6">
                  <h3 className="font-bold">{product.brandname}</h3>
                  <p className="text-sm text-gray-600">{product.seoname}</p>
                  <div className="flex items-center ">
                    <p className="text-sm text-gray-600">shop from: </p>
                    <Avatar className="ml-2">
                      <AvatarImage
                        src={
                          shops.find((shop) => shop.name === product.shop)
                            ?.image
                        }
                      />
                      <AvatarFallback>{product.shop} </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                <HiArrowNarrowRight className="text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="sm:hidden">
        <div className="relative w-full h-[calc(100vh-200px)]">
          {celebrityImages.map((image, index) => (
            <CloudFrontImage
              key={index}
              src={image}
              alt={`${celebrityName} ${index + 1}`}
              fill
              className={`object-cover transition-opacity duration-300 ${
                index === currentImageIndex ? "opacity-100" : "opacity-0"
              }`}
              priority={index === 0}
            />
          ))}
          <div
            className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-opacity duration-300"
            onTouchStart={() =>
              setCurrentImageIndex(
                (prev) => (prev + 1) % celebrityImages.length
              )
            }
            onTouchEnd={() => setCurrentImageIndex(0)}
          />
          <div className="absolute bottom-0 left-0 right-0 top-[90%] p-4">
            <div className="flex items-center justify-between bg-white border rounded-xl mx-4 px-2">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 mr-2 border-2 border-white">
                  <CloudFrontImage
                    src={celebrityDp}
                    alt={celebrityName}
                    width={40}
                    height={40}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div>
                  <h2 className="font-bold text-sm">
                    {celebrityName.split(" ")[0]}
                  </h2>
                  <p className="text-xs text-gray-500">{postDate}</p>
                </div>
              </div>
              <button
                onClick={handleLike}
                className="focus:outline-none"
                disabled={isPending}
              >
                <Heart
                  className={`h-6 w-6 ${
                    liked ? "fill-red-500 text-red-500" : "text-gray-400"
                  } ${isPending ? "opacity-50" : ""}`}
                />
              </button>
            </div>
          </div>
        </div>
        <div className="p-4 bg-white mt-6 relative">
          <div
            className="flex space-x-4 justify-between overflow-x-auto scrollbar-hide ml-4 mr-4"
            ref={scrollContainerRef}
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="flex-shrink-0 w-20 "
                onClick={() => handleProductClick(product)}
              >
                <CloudFrontImage
                  src={product.image}
                  alt={product.seoname}
                  width={80}
                  height={80}
                  className="rounded-md w-42 h-20 object-cover"
                />
                <p className="mt-2 font-semibold text-xs truncate">
                  {product.brandname}
                </p>
                <div className="flex items-center ">
                  <p className="text-sm text-gray-600">shop:</p>
                  <Avatar className="ml-2">
                    <AvatarImage
                      src={
                        shops.find((shop) => shop.name === product.shop)?.image
                      }
                    />
                    <AvatarFallback>{product.shop} </AvatarFallback>
                  </Avatar>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => scroll("left")}
            className="absolute  left-2 top-1/2 transform -translate-y-1/2 rounded-full p-1 shadow-md  text-gray-300 hover:text-gray-400"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full p-1 shadow-md text-gray-300 hover:text-gray-400"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}