import { atom, selector } from 'recoil';


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

// Atom to store the fetched state

export const likedPostsState = atom<LikedPost[]>({
  key: 'likedPostsState',
  default: [],
});

export const likedPostsSelector = selector({
  key: 'likedPostsSelector',
  get: ({ get }) => {
    return get(likedPostsState);
  },
});