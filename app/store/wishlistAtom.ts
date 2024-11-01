import { GetAllWishlistedProduct } from '@/lib/actions/Wishlist'
import { atom, selector } from 'recoil'

export interface Product {
  id: number
  brandname: string
  seoname: string
  category: string
  shop: string
  description: string
  link: string
  imageUrl: string
}

export const wishlistState = atom<Product[]>({
  key: 'wishlistState',
  default: [],
})

export const wishlistSelector = selector({
  key: 'wishlistStateSelector',
  get: async ({ get }) => {
    const wishlist = get(wishlistState)
    if (wishlist.length === 0) {
      try {
        const fetchedWishlistProducts = await GetAllWishlistedProduct()
        return fetchedWishlistProducts
      } catch (error) {
        console.error('Failed to fetch wishlisted products:', error)
        return []
      }
    }
    return wishlist
  },
})