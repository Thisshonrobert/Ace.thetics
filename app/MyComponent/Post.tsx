"use client"

import { Heart } from 'lucide-react'
import { useState } from 'react'
import { RiArrowRightWideFill } from "react-icons/ri";
import CloudFrontImage from './CloudFrontImage';

interface Product {
  id: number
  brandname: string
  seoname: string
  shop: string
  image: string
}

interface PostProps {
  celebrityImage: string
  celebrityName: string
  postDate: string
  products: Product[]
}

export default function PostComponent({ celebrityImage, celebrityName, postDate, products }: PostProps) {
  const [liked, setLiked] = useState(false)

  return (
    <div className="w-full max-w-sm md:max-w-3xl mx-auto bg-white rounded-3xl overflow-hidden shadow-lg mt-4"> 
      
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
        <div className="w-1/2 p-4"> {/* Reduced padding */}
          <div className="flex items-center justify-between mb-1 border-b-2 border-gray-100"> {/* Reduced bottom margin */}
            <div className="flex items-center ">
            <CloudFrontImage
                src={`profile/${celebrityName}.jpg`}
                alt={celebrityName}
                width={32}
                height={32}
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
          <div className="space-y-3 overflow-y-auto max-h-[calc(80vh-200px)]"> 
            {products.map((product) => (
              <div key={product.id} className="flex items-center space-x-3 p-2  rounded-lg">
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
                  <p className="font-medium">shops: {product.shop}</p>
                </div>
                <div className="text-gray-400 text-2xl"><RiArrowRightWideFill /></div>
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
            <div className="flex items-center justify-between">
              <div className="flex items-center">
              <CloudFrontImage
                  src={`profile/${celebrityName}.jpg`}
                  alt={celebrityName}
                  width={40} 
                  height={40}
                  className="rounded-full mr-2" 
                />
                <div>
                  <h2 className="font-bold text-white">{celebrityName}</h2>
                  <p className="text-sm text-gray-300">{postDate}</p>
                </div>
              </div>
              <button onClick={() => setLiked(!liked)} className="focus:outline-none">
                <Heart className={`h-6 w-6 ${liked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
              </button>
            </div>
          </div>
        </div>
        <div className="p-4 bg-white"> 
          <div className="flex space-x-4 overflow-x-auto pb-4"> 
            {products.map((product) => (
              <div key={product.id} className="flex-shrink-0 w-32">
                <CloudFrontImage
                  src={product.image}
                  alt={product.seoname}
                  width={128} 
                  height={128}
                  className="rounded-md w-full h-32 object-cover" 
                />
                <p className="mt-2 font-semibold text-sm truncate">{product.brandname}</p> 
                <p className="text-sm text-gray-600 truncate">shops: {product.shop}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}