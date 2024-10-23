import { BackgroundGradient } from '@/components/ui/background-gradient'
import { CiViewList } from "react-icons/ci";
import React, { useState } from 'react'
import CloudFrontImage from './CloudFrontImage'
import { IoBagOutline } from "react-icons/io5";

interface ProductCardProps {
  image: string
  alt: string
  seoname: string
  description: string
  link: string
}

const ProductCard = ({ image, alt, seoname, description, link }: ProductCardProps) => {
  const [isWishlisted, setIsWishlisted] = useState(false)

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted)
  }

  return (
    <div>
      <BackgroundGradient className="rounded-[22px] p-1 max-w-sm">
        <div className="rounded-[20px] p-4 sm:p-6 bg-white dark:bg-zinc-900">
          <CloudFrontImage
            src={image}
            alt={alt}
            height={400}
            width={400}
            className="object-contain w-full h-64"
          />
          <h3 className="text-semibold sm:text-xl font-poppins text-black mt-4 mb-2 dark:text-neutral-200">
            {seoname}
          </h3>
          <p className="text-sm text-neutral-600 font-poppins dark:text-neutral-400">
            {description}
          </p>
          <div className='flex justify-between mt-4'>
            <a 
              href={link.startsWith('http') ? link : `https://${link}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="rounded-full px-4 py-2 text-white flex items-center space-x-2 bg-black text-xs font-bold dark:bg-zinc-800"
            >
              <span>Buy now</span>
              <IoBagOutline />
            </a>
            <button
              onClick={handleWishlist}
              className={`rounded-full px-4 py-2 text-white flex items-center space-x-2 ${
                isWishlisted ? 'bg-red-500' : 'bg-black'
              } text-xs font-bold dark:bg-zinc-800`}
            >
              <span>{isWishlisted ? 'Wishlisted' : 'Wishlist'}</span>
              <CiViewList />
            </button>
          </div>
        </div>
      </BackgroundGradient>
    </div>
  )
}

export default ProductCard;
