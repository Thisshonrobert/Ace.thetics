'use client'

import { useRecoilValue } from 'recoil';
import PostComponent from '../MyComponent/Post';
import { likedPostsSelector } from '../store/likedPostAtom';

export default function LikedPage() {
  const likedPosts = useRecoilValue(likedPostsSelector);

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