import { atom, selector } from 'recoil';
import { GetAllLikedPosts } from '@/lib/actions/LikePost';

export interface LikedPost {
  id: number;
  celebrityImages: string[];
  celebrityDp: string;
  celebrityName: string;
  postDate: string;
  products: {
    id: number;
    brandname: string;
    seoname: string;
    shop: string;
    image: string;
  }[];
}

export const likedPostsState = atom<LikedPost[]>({
  key: 'likedPostsState',
  default: [],
});

export const likedPostsSelector = selector({
  key: 'likedPostsSelector',
  get: async ({ get }) => {
    const likedPosts = get(likedPostsState);
    if (likedPosts.length === 0) {
      try {
        const fetchedLikedPosts = await GetAllLikedPosts();
        return fetchedLikedPosts;
      } catch (error) {
        console.error('Failed to fetch liked posts:', error);
        return [];
      }
    }
    return likedPosts;
  },
});