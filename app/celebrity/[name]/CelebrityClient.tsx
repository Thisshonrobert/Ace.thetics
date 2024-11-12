'use client'


import DpComponent from "@/app/MyComponent/DpComponent"
import Post from "@/app/MyComponent/Post"


interface Post {
  id: number
  celebrityImages: string[]
  celebrityDp: string
  celebrityName: string
  celebritySocialMedia: string
  postDate: string
  products: {
    id: number
    category: string
    brandname: string
    seoname: string
    shop: string
    image: string
  }[]
}

interface CelebrityClientProps {
  initialPosts: Post[]
}

export default function CelebrityClient({ initialPosts }: CelebrityClientProps) {
  
  return (
    <>
      
       
      {initialPosts.length > 0 && <DpComponent post={initialPosts[0]} />}
      <div className="space-y-3">
        {initialPosts.length > 0 ? (
          initialPosts.map((post, index) => (
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
          <p className="text-center text-gray-500">
            No posts found.
          </p>
        )}
      </div>
    </>
  )
} 