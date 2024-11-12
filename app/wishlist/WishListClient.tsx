'use client'

import { toggleWishlist } from '@/lib/actions/Wishlist'
import { useEffect, useState } from 'react'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import ProductCard from '../MyComponent/ProductCard'
import { wishlistSelector, wishlistState } from '../store/wishlistAtom'
import { useSession } from 'next-auth/react'
import AuthDialog from '@/components/ui/AuthDialog'


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
  initialWishlist: Product[];
}

export default function WishlistClient({ initialWishlist }: WishlistClientProps) {
  const wishlist = useRecoilValue(wishlistSelector);
  const setWishlist = useSetRecoilState(wishlistState);
  const { data: session, status } = useSession();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  
  useEffect(() => {
    if (status === 'authenticated' && wishlist.length === 0) {
      setWishlist(initialWishlist);
    }
  }, [status, wishlist, setWishlist, initialWishlist]);

  const handleToggleWishlist = async (productId: number) => {
    if (status === 'unauthenticated') {
      setIsAuthDialogOpen(true);
      return;
    }

    try {
      const result = await toggleWishlist(productId)
      if (result.success) {
        setWishlist(prev => prev.filter(product => product.id !== productId))
      }
    } catch (error) {
      console.error('Failed to toggle wishlist:', error)
    }
  }

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-8 font-poppins">Your Wishlist</h1>
      {status === 'authenticated' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((product: Product) => (
            <ProductCard
              key={product.id}
              image={product.imageUrl}
              alt={product.seoname}
              seoname={product.seoname}
              description={product.description}
              category={product.category}
              link={product.link}
              isWishlisted={true}
              onWishlistToggle={() => handleToggleWishlist(product.id)}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">Please sign in to view your wishlist.</p>
      )}
      <AuthDialog isOpen={isAuthDialogOpen} onClose={() => setIsAuthDialogOpen(false)} />
    </div>
  )
}