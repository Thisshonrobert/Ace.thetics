import { Metadata } from 'next'
import { GetAllWishlistedProduct } from "@/lib/actions/Wishlist"
import WishListClient from "./WishListClient"

export const metadata: Metadata = {
  title: 'Your Wishlist',
  description: 'View and manage your wishlisted products',
  openGraph: {
    title: 'Your Wishlist',
    description: 'View and manage your wishlisted products',
    type: 'website',
  },
}

export default async function WishlistPage() {
  const initialWishlist = await GetAllWishlistedProduct();

  return (
    <div className="mt-[35%] md:mt-[15%] lg:mt-[9%]">
      <WishListClient initialWishlist={initialWishlist} />
      {initialWishlist.length === 0 && (
        <div className="text-center text-gray-500">No products found.</div>
      )}
    </div>
  )
}