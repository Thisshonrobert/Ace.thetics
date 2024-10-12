"use client"

import Image from 'next/image'
import { Heart } from 'lucide-react'
import { useState } from 'react'

interface Product {
  id: number
  name: string
  brand: string
  description: string
  price: number
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
    <div className="w-full max-w-4xl mx-auto bg-white rounded-3xl overflow-hidden shadow-lg">
      {/* Desktop View */}
      <div className="hidden md:flex">
        <div className="w-1/2">
          <Image
            src={celebrityImage}
            alt={celebrityName}
            width={500}
            height={600}
            className="object-cover w-full h-full"
          />
        </div>
        <div className="w-1/2 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Image
                src={`/placeholder.svg?height=40&width=40`}
                alt={celebrityName}
                width={40}
                height={40}
                className="rounded-full mr-3"
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
          <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-200px)]">
            {products.map((product) => (
              <div key={product.id} className="flex items-center space-x-4 p-2 hover:bg-gray-100 rounded-lg">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={60}
                  height={60}
                  className="rounded-md"
                />
                <div className="flex-grow">
                  <h3 className="font-bold">{product.brand}</h3>
                  <p className="text-sm text-gray-600">{product.description}</p>
                  <p className="font-semibold">${product.price}</p>
                </div>
                <div className="text-gray-400">›</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        <div className="relative">
          <Image
            src={celebrityImage}
            alt={celebrityName}
            width={500}
            height={300}
            className="object-cover w-full h-64"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Image
                  src={`/placeholder.svg?height=40&width=40`}
                  alt={celebrityName}
                  width={40}
                  height={40}
                  className="rounded-full mr-3"
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
        <div className="p-4">
          <div className="flex space-x-4 overflow-x-auto pb-4">
            {products.map((product) => (
              <div key={product.id} className="flex-shrink-0 w-32">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={128}
                  height={128}
                  className="rounded-md w-full h-32 object-cover"
                />
                <p className="mt-2 font-semibold text-sm truncate">{product.brand}</p>
                <p className="text-sm text-gray-600">${product.price}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}