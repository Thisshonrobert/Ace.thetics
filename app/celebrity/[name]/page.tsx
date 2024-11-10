import { Metadata } from 'next'
import GetCelebrity from "@/lib/actions/GetCelebrity"
import CelebrityClient from './CelebrityClient'


interface Props {
  params: { name: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const posts = await GetCelebrity(decodeURIComponent(params.name))
  const celebrityName = posts[0]?.celebrityName || params.name

  return {
    title: `${celebrityName} | Celebrity Fashion & Style`,
    description: `Discover ${celebrityName}'s latest fashion choices, outfits, and style details.`,
    openGraph: {
      title: `${celebrityName} | Celebrity Fashion & Style`,
      description: `Explore ${celebrityName}'s fashion choices and get inspired by their style.`,
      images: posts[0]?.celebrityDp ? [
        {
          url: posts[0].celebrityDp,
          width: 1200,
          height: 630,
          alt: celebrityName,
        }
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${celebrityName} | Celebrity Fashion & Style`,
      description: `Explore ${celebrityName}'s fashion choices and get inspired by their style.`,
      images: posts[0]?.celebrityDp ? [posts[0].celebrityDp] : [],
    }
  }
}

export default async function CelebrityPage({ params }: Props) {
  const posts = await GetCelebrity(decodeURIComponent(params.name))
  
  return (
    <div className="mt-[30%] md:mt-[15%] lg:mt-[7%]">
      <CelebrityClient initialPosts={posts} />
    </div>
  )
}