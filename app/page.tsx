import Post from "./MyComponent/Post";
import { GetPosts } from "@/lib/actions/GetPosts";

export default async function Home() {
  const posts = await GetPosts();

  return (
    <div className="space-y-8">
      {posts.length > 0 ? (
        posts.map((post) => (
          <Post
            key={post.id}
            celebrityImages={post.celebrityImages} // Now passing an array of images
            celebrityDp={post.celebrityDp}
            celebrityName={post.celebrityName}
            postDate={post.postDate}
            products={post.products} id={post.id}          />
        ))
      ) : (
        <p className="text-center text-gray-500">No posts found.</p>
      )}
    </div>
  );
}