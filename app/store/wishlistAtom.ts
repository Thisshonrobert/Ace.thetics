import { atom, selector } from 'recoil';
import { GetAllWishlistedProduct } from '@/lib/actions/Wishlist';

export interface WishlistProduct {
  id: number;
  brandname: string;
  seoname: string;
  category: string 
  shop: string;
  imageUrl: string;
  description: string;
  link: string;
}

export const wishlistState = atom<WishlistProduct[]>({
  key: 'wishlistState',
  default: [],
});

export const wishlistSelector = selector({
  key: 'wishlistSelector',
  get: async ({ get }) => {
    return get(wishlistState);
    
  },
});