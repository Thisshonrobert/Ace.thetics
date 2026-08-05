import { Metadata } from 'next'
import { LikedPageClient } from "./LikedPageClient"
import { GetAllLikedPosts } from '@/lib/actions/LikePost';

export const metadata: Metadata = {
  title: 'Liked Posts',
  description: 'View all your liked posts in one place',
  openGraph: {
    title: 'Liked Posts',
    description: 'View all your liked posts in one place',
    type: 'website',
  },
}

export default async function LikedPage() {
  const initialLikedPosts = await GetAllLikedPosts();
  return (
    <div className="pt-28 md:pt-32">
      <LikedPageClient initialLikedPosts={initialLikedPosts} />
    </div>
  )
}