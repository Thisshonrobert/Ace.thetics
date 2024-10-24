import GetCelebrity from "@/lib/actions/GetCelebrity";
import Post from "@/app/MyComponent/Post";
import DpComponent from "@/app/MyComponent/DpComponent";

export default async function CelebrityPage({
  params,
}: {
  params: { name: string };
}) {
  const posts = await GetCelebrity(decodeURIComponent(params.name));
  return (
    <div>
      {posts.length > 0 && <DpComponent post={posts[0]} />}
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
              id={post.id} initialLikedState={false}            />
          ))
        ) : (
          <p className="text-center text-gray-500">No posts found.</p>
        )}
      </div>
    </div>
  );
}