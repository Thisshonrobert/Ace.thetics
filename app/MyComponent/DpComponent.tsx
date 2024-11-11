'use client'

import React from 'react'
import { Instagram } from 'lucide-react'
import ImageComponent from './ImageComponent'

interface PostDp {
  id: number
  celebrityImages: string[]
  celebrityName: string
  celebrityDp: string
  celebritySocialMedia: string
  postDate: string
  products: {
    id: number
    category: string
    brandname: string
    seoname: string
    shop: string
    image: string
  }[]
}

interface DpComponentProps {
  post: PostDp
}

export default function DpComponent({ post }: DpComponentProps) {
  return (
    <div className="w-full max-w-xl mx-auto bg-white shadow-lg rounded-md overflow-hidden mt-4">
      <div className="relative aspect-square">
        <div className="w-full h-full relative bg-white flex items-center justify-center p-1">
          <ImageComponent
            src={post.celebrityDp}
            alt={post.celebrityName}
            width={800}
            height={800}
            className="w-auto h-auto max-w-full max-h-full object-contain rounded-md"
            transformation={[{
              width: "800",
              height: "800",
              quality: "90",
              crop: "at_max",
              background: "FFFFFF",
              focus: "auto"
            }]}
            lqip={{ active: true, quality: 80, blur: 10 }}
            loading="lazy"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-md" />
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white">{post.celebrityName}</h1>
          <a
            href={`https://${post.celebritySocialMedia}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-gray-200 transition-colors"
          >
            <Instagram size={24} className='text-white hover:text-gray-300 transition-colors'/>
          </a>
        </div>
      </div>
    </div>
  )
}