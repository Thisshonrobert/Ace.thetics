'use client'

import { useState, useRef } from "react";
import { useRecoilState } from 'recoil';
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { HiArrowNarrowRight } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";
import ImageComponent from "./ImageComponent";
import { shops } from "@/constants/shop";
import { likePost } from "@/lib/actions/LikePost";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { likedPostsState } from "../store/likedPostAtom";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: number;
  brandname: string;
  seoname: string;
  shop: string;
  image: string;
}

interface PostProps {
  id: number;
  celebrityImages: string[];
  celebrityDp: string;
  celebrityName: string;
  postDate: string;
  products: Product[];
}

export default function PostComponent({
  id,
  celebrityImages,
  celebrityDp,
  celebrityName,
  postDate,
  products,
}: PostProps) {
  const [likedPosts, setLikedPosts] = useRecoilState(likedPostsState);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(likedPosts.some(post => post.id === id));
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();

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
    router.push(`/product/${product.id}`);
  };

  const handleLike = async () => {
    if (!session) {
      router.push('/api/auth/signin');
      return;
    }

    const newLikedState = !isLiked;
    setIsLiked(newLikedState);

    setLikedPosts(prev => 
      newLikedState
        ? [...prev, { id, celebrityImages, celebrityDp, celebrityName, postDate, products }]
        : prev.filter(post => post.id !== id)
    );

    try {
      const result = await likePost(id);
      if (!result.success) {
        throw new Error('Failed to update like status');
      }
    } catch (error) {
      console.error('Failed to like post:', error);
      setIsLiked(!newLikedState);
      setLikedPosts(prev => 
        newLikedState
          ? prev.filter(post => post.id !== id)
          : [...prev, { id, celebrityImages, celebrityDp, celebrityName, postDate, products }]
      );
      toast({
        title: "Error",
        description: "Failed to update like status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const heartVariants = {
    liked: { scale: [1, 1.2, 1], transition: { duration: 0.3 } },
    unliked: { scale: [1, 0.8, 1], transition: { duration: 0.3 } }
  };

  return (
    <div className="w-[90%] md:w-[70%] max-w-sm sm:max-w-3xl mx-auto bg-white rounded-3xl overflow-hidden shadow-xl mt-4 border">
      {/* Desktop View */}
      <div className="hidden sm:flex h-[420px]">
        <div className="w-1/2 relative">
          {celebrityImages.map((image, index) => (
            <div 
              key={index} 
              className={`absolute inset-0 transition-opacity duration-300 ${
                index === currentImageIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              <ImageComponent
                src={image}
                alt={`${celebrityName} ${index + 1}`}
                transformation={[{
                  height: "680",
                  width: "500",
                  quality: "90",
                  focus: "auto"
                }]}
                className="h-full w-full object-cover"
                loading={index === 0 ? undefined : "lazy"}
              />
            </div>
          ))}
          <div
            className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-opacity duration-300 cursor-pointer"
            onMouseEnter={() => setCurrentImageIndex((prev) => (prev + 1) % celebrityImages.length)}
            onMouseLeave={() => setCurrentImageIndex(0)}
          />
        </div>
        <div className="w-1/2 flex flex-col h-full">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center hover:cursor-pointer" onClick={() => router.push(`/celebrity/${encodeURIComponent(celebrityName)}`)}>
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 mr-2">
                  <ImageComponent
                    src={celebrityDp}
                    alt={celebrityName}
                    transformation={[{
                      height: "100",
                      width: "100",
                      quality: "90",
                      focus: "face",
                      crop: "at_max"
                    }]}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div>
                  <h2 className="font-bold">{celebrityName}</h2>
                  <p className="text-sm text-gray-500">{postDate}</p>
                </div>
              </div>
              <AnimatePresence>
                <motion.button
                  onClick={handleLike}
                  className="focus:outline-none"
                  initial={false}
                  animate={isLiked ? "liked" : "unliked"}
                  variants={heartVariants}
                >
                  <Heart
                    className={`h-6 w-6 ${
                      isLiked ? "fill-red-500 text-red-500" : "text-gray-400"
                    }`}
                  />
                </motion.button>
              </AnimatePresence>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 min-h-[500px]">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex items-center space-x-3 p-2 rounded-lg border-b mb-2 shadow-md hover:cursor-pointer"
                onClick={() => handleProductClick(product)}
              >
                <ImageComponent
                  src={product.image}
                  alt={product.seoname}
                  transformation={[{
                    height: "200",
                    width: "200", 
                    quality: "80",
                    focus: "auto",
                    crop: "at_max",
                    background: "white" 
                  }]}
                  className="rounded-md ml-2 w-[80px] h-[80px] object-cover"
                />
                <div className="flex-grow pl-6">
                  <h3 className="font-bold">{product.brandname}</h3>
                  <p className="text-sm text-gray-600">{product.seoname}</p>
                  <div className="flex items-center">
                    <p className="text-sm text-gray-600">shop from: </p>
                    <Avatar className="ml-2">
                      <AvatarImage
                        src={shops.find((shop) => shop.name === product.shop)?.image}
                      />
                      <AvatarFallback>{product.shop}</AvatarFallback>
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
            <div 
              key={index}
              className={`absolute inset-0 transition-opacity duration-300 ${
                index === currentImageIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              <ImageComponent
                src={image}
                alt={`${celebrityName} ${index + 1}`}
                transformation={[{
                  height: "800",
                  width: "600",
                  quality: "90",
                  focus: "auto",
                  crop: "at_max"
                }]}
                className="h-full w-full object-cover"
                loading={index === 0 ? undefined : "lazy"}
              />
            </div>
          ))}
          <div
            className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-opacity duration-300"
            onTouchStart={() => setCurrentImageIndex((prev) => (prev + 1) % celebrityImages.length)}
            onTouchEnd={() => setCurrentImageIndex(0)}
          />
          <div className="absolute bottom-0 left-0 right-0 top-[90%] p-4">
            <div className="flex items-center justify-between bg-white border rounded-xl mx-4 px-2">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 mr-2 border-2 border-white">
                  <ImageComponent
                    src={celebrityDp}
                    alt={celebrityName}
                    transformation={[{
                      height: "150",
                      width: "150",
                      quality: "90",
                      focus: "face",
                      crop: "at_max"
                    }]}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div>
                  <h2 className="font-bold text-sm">{celebrityName.split(" ")[0]}</h2>
                  <p className="text-xs text-gray-500">{postDate}</p>
                </div>
              </div>
              <AnimatePresence>
                <motion.button
                  onClick={handleLike}
                  className="focus:outline-none"
                  initial={false}
                  animate={isLiked ? "liked" : "unliked"}
                  variants={heartVariants}
                >
                  <Heart
                    className={`h-6 w-6 ${
                      isLiked ? "fill-red-500 text-red-500" : "text-gray-400"
                    }`}
                  />
                </motion.button>
              </AnimatePresence>
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
                className="flex-shrink-0 w-20"
                onClick={() => handleProductClick(product)}
              >
                <ImageComponent
                  src={product.image}
                  alt={product.seoname}
                  transformation={[{
                    height: "200",
                    width: "200",
                    quality: "80",
                    focus: "auto",
                    crop: "at_max"
                  }]}
                  className="rounded-md w-42 h-20 object-cover"
                />
                <p className="mt-2 font-semibold text-xs truncate">
                  {product.brandname}
                </p>
                <div className="flex items-center">
                  <p className="text-sm text-gray-600">shop:</p>
                  <Avatar className="ml-2">
                    <AvatarImage
                      src={shops.find((shop) => shop.name === product.shop)?.image}
                    />
                    <AvatarFallback>{product.shop}</AvatarFallback>
                  </Avatar>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => scroll("left")}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 rounded-full p-1 shadow-md text-gray-300 hover:text-gray-400"
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