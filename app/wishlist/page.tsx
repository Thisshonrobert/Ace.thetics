import { GetAllWishlistedProduct } from "@/lib/actions/Wishlist"
import WishListClient from "./WishListClient"

export default async function WishlistPage() {
  const wishlistedProducts = await GetAllWishlistedProduct()

  return <WishListClient initialWishlist={wishlistedProducts} />
}