import Post from '@/app/MyComponent/Post'
import { GetGenderPosts } from '@/lib/actions/GetGenderPosts'
import { Gender } from '@prisma/client'
import React from 'react'

const page = async({params}:{params:{filter:Gender}}) => {
  const posts = await GetGenderPosts(params.filter)
    return (
    <div className='mt-[30%] md:mt-[15%] lg:mt-[9%]'>
      <div className="space-y-8">
      {posts.length > 0 ? (
        posts.map((post) => (
          <Post
                key={post.id}
                celebrityImages={post.celebrityImages} // Now passing an array of images
                celebrityDp={post.celebrityDp}
                celebrityName={post.celebrityName}
                postDate={post.postDate}
                products={post.products} id={post.id}      />
        ))
      ) : (
        <p className="text-center text-gray-500">No posts found.</p>
      )}
    </div>
    </div>
  )
}

export default page

