'use client'

import { BackgroundGradient } from '@/components/ui/background-gradient'
import { CiViewList } from "react-icons/ci"
import React from 'react'
import ImageComponent from './ImageComponent'
import { IoBagOutline } from "react-icons/io5"

interface ProductCardProps {
  image: string
  alt: string
  seoname: string
  description: string
  link: string
  isWishlisted: boolean
  onWishlistToggle: () => void
}

export default function ProductCard({ 
  image, 
  alt, 
  seoname, 
  description, 
  link, 
  isWishlisted,
  onWishlistToggle 
}: ProductCardProps) {
  return (
    <div>
      <BackgroundGradient className="rounded-[22px] p-1 max-w-sm ">
        <div className=" rounded-[20px] p-4 sm:p-6 bg-white dark:bg-zinc-900">
          <ImageComponent
            src={image}
            alt={alt}
            width={320}
            height={300}
            transformation={[{
              width: "400",
              height: "400",
              quality: "80",
              crop: "at_max",
              focus: "auto"
            }]}
          />
          <h3 className="text-semibold sm:text-xl font-poppins text-black mt-4 mb-2 dark:text-neutral-200">
            {seoname}
          </h3>
          <p className="text-sm text-neutral-600 font-poppins dark:text-neutral-400">
            {description}
          </p>
          <div className='flex justify-between mt-4'>
            <a 
              href={`https://${link}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="rounded-full px-4 py-2 text-white flex items-center space-x-2 bg-black text-xs font-bold dark:bg-zinc-800"
            >
              <span>Buy now</span>
              <IoBagOutline />
            </a>
            <button
              onClick={onWishlistToggle}
              className={`rounded-full px-4 py-2 text-white flex items-center space-x-2 ${
                isWishlisted ? 'bg-red-500' : 'bg-black'
              } text-xs font-bold dark:bg-zinc-800`}
            >
              <span>{isWishlisted ? 'Remove' : 'Wishlist'}</span>
              <CiViewList />
            </button>
          </div>
        </div>
      </BackgroundGradient>
    </div>
  )
}