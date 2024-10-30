'use client'
import React from 'react'
import { Instagram } from 'lucide-react';
import ImageComponent from './ImageComponent';

interface PostDp {
  id: number;
  celebrityImages: string[];
  celebrityName: string;
  celebrityDp: string;
  celebritySocialMedia: string;
  postDate: string;
  products: {
    id: number;
    category: string;
    brandname: string;
    seoname: string;
    shop: string;
    image: string;
  }[];
}

interface DpComponentProps {
  post: PostDp;
}

const DpComponent: React.FC<DpComponentProps> = ({ post }) => {
  return (
    <div className="w-full max-w-3xl mx-auto bg-white shadow-lg rounded-xl overflow-hidden mt-4">
      <div className="relative h-64 sm:h-80">
        <ImageComponent
          src={post.celebrityDp}
          alt={post.celebrityName}
          className="absolute inset-0 object-cover w-full h-full"
          width={1200}
          height={800}
        />
        <div className="absolute inset-0 " />
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">{post.celebrityName}</h1>
          <a
            href={`https://${post.celebritySocialMedia}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-gray-200 transition-colors"
          >
            <Instagram size={24} className='text-gray-500'/>
          </a>
        </div>
      </div>
    </div>
  )
}

export default DpComponent