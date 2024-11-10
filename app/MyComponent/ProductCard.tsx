'use client'

import { BackgroundGradient } from '@/components/ui/background-gradient'
import { CiViewList } from "react-icons/ci"
import { IoBagOutline } from "react-icons/io5"
import ImageComponent from './ImageComponent'

interface ProductCardProps {
  image: string
  alt: string
  seoname: string
  description: string
  category: string
  link: string
  isWishlisted: boolean
  onWishlistToggle: () => void
}

export default function ProductCard({ 
  image, 
  alt, 
  seoname, 
  description, 
  category, 
  link, 
  isWishlisted,
  onWishlistToggle 
}: ProductCardProps) {
  return (
    <div className="w-full max-w-sm mx-auto">
      <BackgroundGradient className="rounded-[22px] p-1">
        <div className="rounded-[20px] p-4 sm:p-6 bg-white dark:bg-zinc-900">
          <div className="relative aspect-square w-full rounded-lg overflow-hidden">
            <div className="w-full h-full flex items-center justify-center bg-gray-50">
              <ImageComponent
                src={image}
                alt={alt}
                className="w-full h-full object-contain"
                transformation={[{
                  width: "800",
                  height: "800",
                  quality: "80",
                  crop: "maintain_ratio",
                  focus: "auto",
                  background: "FFFFFF"
                }]}
                lqip={{ active: true, quality: 20 }}
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
            <a 
              href={`https://${link}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1 rounded-full px-4 py-2 text-white flex items-center justify-center space-x-2 bg-black text-xs font-bold dark:bg-zinc-800 hover:opacity-90 transition-opacity"
            >
              <span>Buy now</span>
              <IoBagOutline className="ml-2" />
            </a>
            <button
              onClick={onWishlistToggle}
              className={`flex-1 rounded-full px-4 py-2 text-white flex items-center justify-center space-x-2 ${
                isWishlisted ? 'bg-red-500 hover:bg-red-600' : 'bg-black hover:bg-black/90'
              } text-xs font-bold dark:bg-zinc-800 transition-colors`}
            >
              <span>{isWishlisted ? 'Remove' : 'Wishlist'}</span>
              <CiViewList className="ml-2" />
            </button>
          </div>
        </div>
      </BackgroundGradient>
    </div>
  )
}