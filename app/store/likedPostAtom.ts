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
    category: string;
  }[];
}

/** Full post objects, used by the /liked page. */
export const likedPostsState = atom<LikedPost[]>({
  key: 'likedPostsState',
  default: [],
});

export const likedPostsSelector = selector({
  key: 'likedPostsSelector',
  get: ({ get }) => get(likedPostsState),
});

/**
 * Just the ids the signed-in user has liked. Shared by every PostComponent on
 * screen so the feed makes one request instead of one per card.
 * `null` means "not fetched yet" and is what keeps the heart from flashing
 * empty-then-filled on load.
 */
export const likedPostIdsState = atom<number[] | null>({
  key: 'likedPostIdsState',
  default: null,
});
