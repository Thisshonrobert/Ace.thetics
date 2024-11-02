import { Metadata } from 'next'
import { LikedPageClient } from "./LikedPageClient"

export const metadata: Metadata = {
  title: 'Liked Posts',
  description: 'View all your liked posts in one place',
  openGraph: {
    title: 'Liked Posts',
    description: 'View all your liked posts in one place',
    type: 'website',
  },
}

export default function LikedPage() {
  return (
    <div className="mt-[35%] md:mt-[15%] lg:mt-[7%]">
      <LikedPageClient />
    </div>
  )
}