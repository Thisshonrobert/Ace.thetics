import { redirect } from 'next/navigation'
import { GetPostById } from '@/lib/actions/GetPosts'
import { GetPosts } from '@/lib/actions/GetPosts'
import Post from '@/app/MyComponent/Post'

export default async function PostPage({ params }: { params: { id: string } }) {
  const post = await GetPostById(params.id)
  const allPosts = await GetPosts()
  
  if (!post) {
    redirect('/')
  }

  // Filter out the current post from allPosts to avoid duplication
  const otherPosts = allPosts.filter(p => p.id !== post.id)

  return (
    <div className="mt-[35%] md:mt-[15%] lg:mt-[9%]">
      {/* Featured Post */}
      <div className="mb-8">
        <Post
          id={post.id}
          celebrityImages={post.celebrityImages}
          celebrityDp={post.celebrityDp}
          celebrityName={post.celebrityName}
          postDate={post.postDate}
          products={post.products}
        />
      </div>
      
      {/* Other Posts */}
      
      <div className="space-y-8">
        {otherPosts.map((post) => (
          <Post
            key={post.id}
            id={post.id}
            celebrityImages={post.celebrityImages}
            celebrityDp={post.celebrityDp}
            celebrityName={post.celebrityName}
            postDate={post.postDate}
            products={post.products}
          />
        ))}
      </div>
    </div>
  )
} 


