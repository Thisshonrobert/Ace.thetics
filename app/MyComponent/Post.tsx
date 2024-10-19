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
  celebrityImage: string
  celebrityDp: string
  celebrityName: string
  postDate: string
  products: Product[]
}

export default function PostComponent({ celebrityImage, celebrityDp, celebrityName, postDate, products }: PostProps) {
  const [liked, setLiked] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <div className="w-full max-w-sm md:max-w-3xl mx-auto bg-white rounded-3xl overflow-hidden shadow-lg mt-4"> 
      
      {/* Desktop View */}
      <div className="hidden md:flex">
        <div className="w-1/2">
          <CloudFrontImage
            src={celebrityImage}
            alt={celebrityName}
            width={500}
            height={480}
            className="object-cover w-full h-[480px]"
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
      <div className="md:hidden">
        <div className="relative">
          <CloudFrontImage
            src={celebrityImage}
            alt={celebrityName}
            width={375}
            height={500} 
            className="object-cover w-full h-[calc(100vh-200px)]"
            priority
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
            <div className="flex items-center justify-between bg-white border rounded-xl ml-4 mr-4 pl-4 pr-4">
              <div className="flex items-center ">
                <CloudFrontImage
                  src={celebrityDp}
                  alt={celebrityName}
                  width={40} 
                  height={40}
                  className="rounded-full mr-2 border-2 border-white" 
                />
                <div >
                  <h2 className="font-bold">{celebrityName}</h2>
                  <p className="text-sm text-grey-500">{postDate}</p>
                </div>
              </div>
              <button onClick={() => setLiked(!liked)} className="focus:outline-none">
                <Heart className={`h-6 w-6 ${liked ? 'fill-red-500 text-red-500' : 'text-black'}`} />
              </button>
            </div>
          </div>
        </div>
        <div className="p-4 bg-white relative"> 
          <div className="flex space-x-4 overflow-x-auto scrollbar-hide ml-4 mr-4" ref={scrollContainerRef}> 
            {products.map((product) => (
              <div key={product.id} className="flex-shrink-0 w-20">
                <CloudFrontImage
                  src={product.image}
                  alt={product.seoname}
                  width={80} 
                  height={80}
                  className="rounded-md w-42 h-20 object-cover" 
                />
                <p className="mt-2 font-semibold text-xs truncate">{product.brandname}</p> 
                <p className="text-xs text-gray-600 truncate">Shop: {product.shop}</p>
              </div>
            ))}
          </div>
          <button onClick={() => scroll('left')} className="absolute left-2 top-1/2 transform -translate-y-1/2  rounded-full p-1 shadow-md  text-gray-300 hover:text-gray-400">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button onClick={() => scroll('right')} className="absolute right-2 top-1/2 transform -translate-y-1/2  rounded-full p-1 shadow-md  text-gray-300 hover:text-gray-400">
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  )
}