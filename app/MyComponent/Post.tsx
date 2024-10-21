"use client"

import { Heart, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useRef } from 'react'
import CloudFrontImage from './CloudFrontImage'

interface Product {
  id: number
  brandname: string
  seoname: string
  shop: string
  image: string
}

interface PostProps {
  celebrityImages: string[]
  celebrityDp: string
  celebrityName: string
  postDate: string
  products: Product[]
}

export default function PostComponent({ celebrityImages, celebrityDp, celebrityName, postDate, products }: PostProps) {
  const [liked, setLiked] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <div className="w-full max-w-sm sm:max-w-3xl mx-auto bg-white rounded-3xl overflow-hidden shadow-lg mt-4"> 
      
      {/* Desktop View */}
      <div className="hidden sm:flex">
        <div className="w-1/2 relative overflow-hidden">
          {celebrityImages.map((image, index) => (
            <CloudFrontImage
              key={index}
              src={image}
              alt={`${celebrityName} ${index + 1}`}
              width={500}
              height={480}
              className={`object-cover w-full h-[480px] absolute top-0 left-0 transition-opacity duration-300 ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}
          <div 
            className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-opacity duration-300 cursor-pointer"
            onMouseEnter={() => setCurrentImageIndex((prev) => (prev + 1) % celebrityImages.length)}
            onMouseLeave={() => setCurrentImageIndex(0)}
          />
        </div>
        <div className="w-1/2 p-4 flex flex-col"> 
          <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-gray-100">
            <div className="flex items-center">
              <CloudFrontImage
                src={celebrityDp}
                alt={celebrityName}
                width={40}
                height={40}
                className="rounded-full mr-2"
              />
              <div>
                <h2 className="font-bold">{celebrityName}</h2>
                <p className="text-sm text-gray-500">{postDate}</p>
              </div>
            </div>
            <button onClick={() => setLiked(!liked)} className="focus:outline-none">
              <Heart className={`h-6 w-6 ${liked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
            </button>
          </div>
          <div className="flex-grow overflow-y-auto">
            {products.map((product) => (
              <div key={product.id} className="flex items-center space-x-3 p-2 rounded-lg border-b mb-2">
                <CloudFrontImage
                  src={product.image}
                  alt={product.seoname}
                  width={48}
                  height={48}
                  className="rounded-md"
                />
                <div className="flex-grow">
                  <h3 className="font-bold">{product.brandname}</h3>
                  <p className="text-sm text-gray-600">{product.seoname}</p>
                  <p className="text-sm font-medium">Shop: {product.shop}</p>
                </div>
                <ChevronRight className="text-gray-400" />
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
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
              priority={index === 0}
            />
          ))}
          <div 
            className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-opacity duration-300"
            onTouchStart={() => setCurrentImageIndex((prev) => (prev + 1) % celebrityImages.length)}
            onTouchEnd={() => setCurrentImageIndex(0)}
          />
          <div className="absolute bottom-4 left-4 right-4 bg-white rounded-xl p-3 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CloudFrontImage
                  src={celebrityDp}
                  alt={celebrityName}
                  width={40} 
                  height={40}
                  className="rounded-full mr-2 border-2 border-white" 
                />
                <div>
                  <h2 className="font-bold text-sm">{celebrityName}</h2>
                  <p className="text-xs text-gray-500">{postDate}</p>
                </div>
              </div>
              <button onClick={() => setLiked(!liked)} className="focus:outline-none">
                <Heart className={`h-5 w-5 ${liked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
              </button>
            </div>
          </div>
        </div>
        <div className="p-4 bg-white relative"> 
          <div className="flex space-x-4 overflow-x-auto scrollbar-hide" ref={scrollContainerRef}> 
            {products.map((product) => (
              <div key={product.id} className="flex-shrink-0 w-24">
                <CloudFrontImage
                  src={product.image}
                  alt={product.seoname}
                  width={96} 
                  height={96}
                  className="rounded-md w-24 h-24 object-cover" 
                />
                <p className="mt-1 font-semibold text-xs truncate">{product.brandname}</p> 
                <p className="text-xs text-gray-600 truncate">Shop: {product.shop}</p>
              </div>
            ))}
          </div>
          <button onClick={() => scroll('left')} className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-1 shadow-md text-gray-400 hover:text-gray-600">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button onClick={() => scroll('right')} className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-1 shadow-md text-gray-400 hover:text-gray-600">
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  )
}
