'use client'

import { useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import PostComponent from '../MyComponent/Post';
import { likedPostsSelector, likedPostsState, LikedPost } from '../store/likedPostAtom';

interface LikedPageClientProps {
  initialLikedPosts: LikedPost[];
}

export function LikedPageClient({ initialLikedPosts }: LikedPageClientProps) {
  const likedPosts = useRecoilValue(likedPostsSelector);
  const setLikedPosts = useSetRecoilState(likedPostsState);

  useEffect(() => {
    setLikedPosts(initialLikedPosts);
  }, [initialLikedPosts, setLikedPosts]);

  return (
    <div className="container mx-auto px-4 py-8">
      {likedPosts.length > 0 ? (
        <div className="space-y-8">
          {likedPosts.map((post) => (
            <PostComponent
              key={post.id}
              {...post}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">You haven't liked any posts yet.</p>
      )}
    </div>
  );
}