'use client'

import { useEffect, useMemo } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import PostComponent from '../MyComponent/Post';
import { likedPostIdsState, likedPostsState, LikedPost } from '../store/likedPostAtom';
import { Button } from '@/components/ui/button';

interface LikedPageClientProps {
  initialLikedPosts: LikedPost[];
}

export function LikedPageClient({ initialLikedPosts }: LikedPageClientProps) {
  const likedPosts = useRecoilValue(likedPostsState);
  const likedIds = useRecoilValue(likedPostIdsState);
  const setLikedPosts = useSetRecoilState(likedPostsState);

  useEffect(() => {
    setLikedPosts(initialLikedPosts);
  }, [initialLikedPosts, setLikedPosts]);

  // Unliking a post from this page used to leave the card sitting there until a
  // manual refresh. Drive the list off the shared id set so the card leaves
  // as soon as the heart is cleared.
  const visiblePosts = useMemo(() => {
    if (likedIds === null) return likedPosts;
    return likedPosts.filter((post) => likedIds.includes(post.id));
  }, [likedPosts, likedIds]);

  if (visiblePosts.length === 0) {
    return (
      <div className="container mx-auto flex flex-col items-center px-4 py-20 text-center">
        <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-red-50">
          <Heart className="h-8 w-8 text-red-400" />
        </div>
        <h1 className="text-xl font-semibold text-gray-900">No liked posts yet</h1>
        <p className="mt-2 max-w-sm text-sm text-gray-500">
          Tap the heart on any look you love and it will show up here.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">Browse looks</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">Liked posts</h1>
      <div className="space-y-8">
        {visiblePosts.map((post) => (
          <PostComponent key={post.id} {...post} />
        ))}
      </div>
    </div>
  );
}
