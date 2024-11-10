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
    <div className="w-56 sm:w-full max-w-3xl mx-auto bg-white shadow-lg rounded-xl overflow-hidden mt-4">
      <div className="relative h-56 sm:h-80">
        <div className="relative w-full h-full">
          <ImageComponent
            src={post.celebrityDp}
            alt={post.celebrityName}
            className="w-full h-full object-top"
            transformation={[{
              width: "1200",
              height: "800",
              quality: "90",
              crop: "at_max",
              focus: "auto"
            }]}
            lqip={{ active: true, quality: 80 }}
            loading="lazy"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">{post.celebrityName}</h1>
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