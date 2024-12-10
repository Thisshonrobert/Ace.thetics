"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRecoilState } from "recoil";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ChevronLeft, ChevronRight, Heart, Share } from "lucide-react";
import { HiArrowNarrowRight } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";
import ImageComponent from "./ImageComponent";
import { shops } from "@/constants/shop";
import { likePost } from "@/lib/actions/LikePost";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { likedPostsState } from "../store/likedPostAtom";
import { Skeleton } from "@/components/ui/skeleton";

import ShareDialog from "./ShareDialog";
import { useToast } from "@/hooks/use-toast";

interface Product {
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
}

const sortProducts = (products: Product[]) => {
  return [...products].sort((a, b) => {
    const shopComparison = a.shop.localeCompare(b.shop);
    if (shopComparison !== 0) return shopComparison;
    return a.brandname.localeCompare(b.brandname);
  });
};

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
  const [isLiked, setIsLiked] = useState(
    likedPosts.some((post) => post.id === id)
  );
  const [isLoading, setIsLoading] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

  const sortedProducts = sortProducts(products);

  const heartVariants = {
    liked: { scale: [1, 1.2, 1], transition: { duration: 0.3 } },
    unliked: { scale: [1, 0.8, 1], transition: { duration: 0.3 } },
  };

  useEffect(() => {
    const checkInitialLikeStatus = async () => {
      try {
        const response = await fetch(`/api/posts/${id}/like`);
        if (response.ok) {
          const data = await response.json();
          setIsLiked(data.isLiked);
        }
      } catch (error) {
        console.error('Error fetching like status:', error);
      }
    };

    checkInitialLikeStatus();
  }, [id]);

  const handleLike = async () => {
    // Optimistically update the UI immediately
    setIsLiked(prevState => !prevState);

    try {
      const result = await likePost(id);
      if (!result.success) {
        // Revert the optimistic update if the server request fails
        setIsLiked(prevState => !prevState);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update like status",
        });
      }
    } catch (error) {
      // Revert the optimistic update and show error message
      setIsLiked(prevState => !prevState);
      console.error('Error liking post:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please sign in to like posts",
      });
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setImagesLoaded(true);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

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

  return (
    <div className="w-[90%] md:w-[70%] max-w-sm sm:max-w-3xl mx-auto bg-white rounded-3xl overflow-hidden shadow-xl mt-4 border">
      {/* Desktop View */}

      <div className="hidden sm:flex h-[420px]">
        <div className="w-1/2 relative">
          {celebrityImages.map((image, index) => (
            <motion.div
              key={index}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{
                opacity: index === currentImageIndex && imagesLoaded ? 1 : 0,
              }}
              transition={{ duration: 0.5 }}
            >
              <ImageComponent
                src={image}
                alt={`${celebrityName} ${index + 1}`}
                transformation={[
                  {
                    height: "680",
                    width: "500",
                    quality: "90",
                    focus: "auto",
                  },
                ]}
                className="h-full w-full object-top"
                loading={index === 0 ? undefined : "lazy"}
                lqip={{ active: true, quality: 10, blur: 10 }}
              />
            </motion.div>
          ))}
          {isLoading && <Skeleton className="absolute inset-0" />}
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
        <div className="w-1/2 flex flex-col h-full">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div
                className="flex items-center hover:cursor-pointer"
                onClick={() =>
                  router.push(`/celebrity/${encodeURIComponent(celebrityName)}`)
                }
              >
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 mr-2">
                  {isLoading ? (
                    <Skeleton className="w-full h-full rounded-full" />
                  ) : (
                    <ImageComponent
                      src={celebrityDp}
                      alt={celebrityName}
                      transformation={[
                        {
                          height: "100",
                          width: "100",
                          quality: "90",
                          focus: "face",
                          crop: "at_max",
                        },
                      ]}
                      className="object-cover w-full h-full"
                    />
                  )}
                </div>
                <div>
                  <h2 className="font-bold">
                    {isLoading ? (
                      <Skeleton className="h-4 w-24" />
                    ) : (
                      celebrityName
                    )}
                  </h2>
                  <div className="text-sm text-gray-500">
                    {isLoading ? <Skeleton className="h-3 w-16" /> : postDate}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {isLoading ? (
                  <Skeleton className="w-6 h-6 rounded" />
                ) : (
                  <motion.button
                    onClick={handleLike}
                    className="focus:outline-none"
                    initial={false}
                    animate={isLiked ? "liked" : "unliked"}
                    variants={heartVariants}
                  >
                    {isLiked ? (
                      <Heart className="w-6 h-6 text-red-500 fill-current" />
                    ) : (
                      <Heart className="w-6 h-6 text-gray-500" />
                    )}
                  </motion.button>
                )}
                <button
                  onClick={() => setIsShareDialogOpen(true)}
                  className="focus:outline-none"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Skeleton className="h-6 w-6 rounded-full" />
                  ) : (
                    <Share className="h-6 w-6 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              {sortedProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  className="flex items-center p-2 rounded-lg border hover:shadow-md hover:cursor-pointer"
                  onClick={() => handleProductClick(product)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: imagesLoaded ? 1 : 0,
                    y: imagesLoaded ? 0 : 20,
                  }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="w-[100px] h-[100px] bg-white rounded-md overflow-hidden flex-shrink-0">
                    {isLoading ? (
                      <Skeleton className="w-full h-full rounded-md" />
                    ) : (
                      <div className="w-full h-full relative bg-white flex items-center justify-center p-1">
                        <ImageComponent
                          src={product.image}
                          alt={product.seoname}
                          width={200}
                          height={200}
                          className="w-auto h-auto max-w-full max-h-full object-contain"
                          transformation={[
                            {
                              width: "200",
                              height: "200",
                              quality: "90",
                              crop: "at_max",
                              background: "FFFFFF",
                            },
                          ]}
                          lqip={{ active: true, quality: 10, blur: 10 }}
                          loading="lazy"
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex-grow pl-4">
                    <h3 className="font-bold text-sm">
                      {isLoading ? (
                        <Skeleton className="h-4 w-24" />
                      ) : (
                        product.brandname
                      )}
                    </h3>
                    <div className="text-xs  text-gray-600">
                      {isLoading ? (
                        <Skeleton className="h-3 w-32" />
                      ) : (
                        product.seoname
                      )}
                    </div>
                    <div className="flex items-center mt-1">
                      <div className="text-xs text-gray-600">shop from: </div>
                      {isLoading ? (
                        <Skeleton className="h-5 w-5 rounded-full ml-2" />
                      ) : (
                        <Avatar className="ml-2 h-8 w-8 mt-1">
                          <AvatarImage
                            src={
                              shops.find((shop) => shop.name === product.shop)
                                ?.image
                            }
                          />
                          <AvatarFallback>{product.shop}</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </div>
                  <HiArrowNarrowRight className="text-gray-400 flex-shrink-0 ml-2" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="sm:hidden">
        <div className="relative w-full h-[calc(100vh-200px)]">
          {celebrityImages.map((image, index) => (
            <motion.div
              key={index}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{
                opacity: index === currentImageIndex && imagesLoaded ? 1 : 0,
              }}
              transition={{ duration: 0.5 }}
            >
              <ImageComponent
                src={image}
                alt={`${celebrityName} ${index + 1}`}
                transformation={[
                  {
                    height: "800",
                    width: "600",
                    quality: "90",
                    focus: "auto",
                    crop: "at_max",
                  },
                ]}
                className="h-full w-full object-cover"
                loading={index === 0 ? undefined : "lazy"}
                lqip={{ active: true, quality: 10, blur: 10 }}
              />
            </motion.div>
          ))}
          {isLoading && <Skeleton className="absolute inset-0" />}
          <div
            className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-opacity duration-300"
            onTouchStart={() =>
              setCurrentImageIndex(
                (prev) => (prev + 1) % celebrityImages.length
              )
            }
            onTouchEnd={() => setCurrentImageIndex(0)}
          />
          <div className="absolute bottom-0 left-0 right-0 top-[86%] p-4 z-30">
            <div className="flex items-center justify-between bg-white border rounded-xl mx-4 px-2 z-30">
              <div className="flex items-center z-30"  onClick={() =>
                  router.push(`/celebrity/${encodeURIComponent(celebrityName)}`)
                }>
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 mr-2 border-2 border-white bg-gray-100">
                  {isLoading ? (
                    <Skeleton className="w-full h-full rounded-full" />
                  ) : (
                    <ImageComponent
                      src={celebrityDp}
                      alt={celebrityName}
                      transformation={[
                        {
                          height: "150",
                          width: "150",
                          quality: "90",
                          focus: "face",
                          crop: "at_max",
                        },
                      ]}
                      className="object-cover w-full h-full"
                    />
                  )}
                </div>
                <div>
                  <h2 className="font-bold text-sm">
                    {isLoading ? (
                      <Skeleton className="h-4 w-24" />
                    ) : (
                      celebrityName.split(" ")[0]
                    )}
                  </h2>
                  <div className="text-xs text-gray-500">
                    {isLoading ? <Skeleton className="h-3 w-16" /> : postDate}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {isLoading ? (
                  <Skeleton className="w-6 h-6 rounded" />
                ) : (
                  <motion.button
                    onClick={handleLike}
                    className="focus:outline-none"
                    initial={false}
                    animate={isLiked ? "liked" : "unliked"}
                    variants={heartVariants}
                  >
                    {isLiked ? (
                      <Heart className="w-6 h-6 text-red-500 fill-current" />
                    ) : (
                      <Heart className="w-6 h-6 text-gray-500" />
                    )}
                  </motion.button>
                )}
                <button
                  onClick={() => setIsShareDialogOpen(true)}
                  className="focus:outline-none"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Skeleton className="h-6 w-6 rounded-full" />
                  ) : (
                    <Share className="h-6 w-6 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <motion.div
          className="p-4 bg-white mt-2 relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: imagesLoaded ? 1 : 0, y: imagesLoaded ? 0 : 20 }}
          transition={{ duration: 0.5 }}
        >
          <div
            className="flex space-x-4 justify-between overflow-x-auto scrollbar-hide ml-4 mr-4"
            ref={scrollContainerRef}
          >
            {sortedProducts.map((product) => (
              <div
                key={product.id}
                className="flex-shrink-0 w-24"
                onClick={() => handleProductClick(product)}
              >
                <div className="w-24 h-24 bg-white rounded-md flex items-center justify-center p-1">
                  {isLoading ? (
                    <Skeleton className="w-full h-full rounded-md" />
                  ) : (
                    <ImageComponent
                      src={product.image}
                      alt={product.seoname}
                      width={80}
                      height={80}
                      className="w-auto h-auto max-w-full max-h-full object-contain"
                      transformation={[
                        {
                          width: "160",
                          height: "160",
                          quality: "80",
                          crop: "at_max",
                          background: "FFFFFF",
                        },
                      ]}
                      lqip={{ active: true, quality: 10, blur: 10 }}
                      loading="lazy"
                    />
                  )}
                </div>
                <div>
                  <div className="mt-2 font-semibold text-xs truncate">
                    {isLoading ? (
                      <Skeleton className="h-3 w-16" />
                    ) : (
                      product.brandname
                    )}
                  </div>
                  <div className="product-mapping-seoname">
                    <div className="text-xs text-gray-600 line-clamp-4 h-[4em]">
                      {isLoading ? (
                        <Skeleton className="h-3 w-32" />
                      ) : (
                        product.seoname
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="text-sm text-gray-600">shop:</div>
                  {isLoading ? (
                    <Skeleton className="h-5 w-5 rounded-full ml-2" />
                  ) : (
                    <Avatar className="ml-2 mt-1">
                      <AvatarImage
                        src={
                          shops.find((shop) => shop.name === product.shop)
                            ?.image
                        }
                      />
                      <AvatarFallback>{product.shop}</AvatarFallback>
                    </Avatar>
                  )}
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
        </motion.div>
      </div>
      <ShareDialog
        isOpen={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
        postId={id}
        imageUrl={celebrityImages[0]}
        title={`Check out ${celebrityName}'s style`}
      />
    </div>
  );

}