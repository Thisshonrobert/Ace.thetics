'use client'

import { useState } from 'react'
import { toggleWishlist } from '@/lib/actions/Wishlist'
import ProductCard from '../MyComponent/ProductCard'

interface Product {
  id: number
  brandname: string
  seoname: string
  category: string
  shop: string
  description: string
  link: string
  imageUrl: string
}

interface WishlistClientProps {
  initialWishlist: Product[]
}

export default function WishlistClient({ initialWishlist }: WishlistClientProps) {
  const [wishlist, setWishlist] = useState<Product[]>(initialWishlist)

  const handleToggleWishlist = async (productId: number) => {
    try {
      const result = await toggleWishlist(productId)
      if (result.success) {
        setWishlist(prev => prev.filter(product => product.id !== productId))
      }
    } catch (error) {
      console.error('Failed to toggle wishlist:', error)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Wishlist</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlist.map((product: Product) => (
          <ProductCard
            key={product.id}
            image={product.imageUrl}
            alt={product.seoname}
            seoname={product.seoname}
            description={product.description}
            link={product.link}
            isWishlisted={true}
            onWishlistToggle={() => handleToggleWishlist(product.id)}
          />
        ))}
      </div>
    </div>
  )
}