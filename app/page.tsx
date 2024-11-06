import { Metadata } from 'next'
import Post from "./MyComponent/Post"
import { GetPosts } from "@/lib/actions/GetPosts"

export const metadata: Metadata = {
  title: 'Acethetics | Your Fashion Inspiration',
  description: 'Discover the latest fashion trends and celebrity styles',
  openGraph: {
    title: 'Home | Your Fashion Inspiration',
    description: 'Discover the latest fashion trends and celebrity styles',
    type: 'website',
  },
}

export default async function Home() {
  const posts = await GetPosts()

  return (
    <div className="mt-[35%] md:mt-[15%] lg:mt-[9%]">
      <div className="space-y-8">
        {posts.length > 0 ? (
          posts.map((post) => (
            <Post
              key={post.id}
              celebrityImages={post.celebrityImages} 
              celebrityDp={post.celebrityDp}
              celebrityName={post.celebrityName}
              postDate={post.postDate}
              products={post.products}
              id={post.id}
            />
          ))
        ) : (
          <p className="text-center text-gray-500">No posts found.</p>
        )}
      </div>
    </div>
  )
}