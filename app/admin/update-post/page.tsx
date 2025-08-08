'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';

interface Product {
  id: number;
  brandname: string;
  seoname: string;
  imageUrl: string;
  link?: string;
  description?: string;
  category: string;
  shop: string;
}

interface Post {
  id: number;
  imageUrl: string[];
  date: string;
  Celebrity: {
    name: string;
  };
  products: Product[];
}

export default function UpdatePostPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;

    if (!session || (session.user?.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL && session.user?.email !== process.env.NEXT_PUBLIC_ADMIN1_EMAIL)) {
      router.push('/');
    }
  }, [session, status, router]);

  useEffect(() => {
    async function fetchPosts() {
      setIsLoading(true);
      try {
        const response = await fetch('/api/posts');
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }
        const data = await response.json();
        setPosts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPosts();
  }, []);

  const handlePostSelect = async (postId: number) => {
    const response = await fetch(`/api/posts/${postId}`);
    const data = await response.json();
    setSelectedPost(data);
  };

  const handleUpdatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPost) return;

    try {
      const response = await fetch(`/api/posts/${selectedPost.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: selectedPost.imageUrl,
          products: selectedPost.products,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update post');
      }

      toast.success(data.message || 'Post updated successfully!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      router.push('/admin/delete-post');
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update post. Please try again.', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const filteredPosts = posts.filter(post => 
    post.Celebrity.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Update Post</h1>
      <input
        type="text"
        placeholder="Search by Celebrity Name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="border p-2 mb-4 w-full"
      />
      <ul>
        {filteredPosts.map(post => (
          <li key={post.id} className="mb-4">
            <button onClick={() => handlePostSelect(post.id)} className="text-blue-500">
              {post.Celebrity.name}
            </button>
          </li>
        ))}
      </ul>

      {selectedPost && (
        <form onSubmit={handleUpdatePost} className="mt-6">
          <h1>id: {selectedPost.id}</h1>
          <h2 className="text-xl mb-4">Editing Post: {selectedPost.Celebrity.name}</h2>
          <div>
            <label className="block mb-2">Image URLs:</label>
            {selectedPost.imageUrl.map((url, index) => (
              <input
                key={index}
                type="text"
                value={url}
                onChange={(e) => {
                  const newUrls = [...selectedPost.imageUrl];
                  newUrls[index] = e.target.value;
                  setSelectedPost({ ...selectedPost, imageUrl: newUrls });
                }}
                className="border p-2 mb-2 w-full"
              />
            ))}
          </div>
          <h3 className="text-lg mb-2">Products:</h3>
          {selectedPost.products.map((product, index) => (
            <div key={product.id} className="mb-4">
              <h1>id: {product.id}</h1>
              <input
                type="text"
                value={product.brandname}
                onChange={(e) => {
                  const newProducts = [...selectedPost.products];
                  newProducts[index].brandname = e.target.value;
                  setSelectedPost({ ...selectedPost, products: newProducts });
                }}
                placeholder="Brand Name"
                className="border p-2 mb-2 w-full"
              />
              <input
                type="text"
                value={product.seoname}
                onChange={(e) => {
                  const newProducts = [...selectedPost.products];
                  newProducts[index].seoname = e.target.value;
                  setSelectedPost({ ...selectedPost, products: newProducts });
                }}
                placeholder="SEO Name"
                className="border p-2 mb-2 w-full"
              />
              <input
                type="text"
                value={product.imageUrl}
                onChange={(e) => {
                  const newProducts = [...selectedPost.products];
                  newProducts[index].imageUrl = e.target.value;
                  setSelectedPost({ ...selectedPost, products: newProducts });
                }}
                placeholder="Image URL"
                className="border p-2 mb-2 w-full"
              />
              <input
                type="text"
                value={product.link || ''}
                onChange={(e) => {
                  const newProducts = [...selectedPost.products];
                  newProducts[index].link = e.target.value;
                  setSelectedPost({ ...selectedPost, products: newProducts });
                }}
                placeholder="Link"
                className="border p-2 mb-2 w-full"
              />
              <input
                type="text"
                value={product.description || ''}
                onChange={(e) => {
                  const newProducts = [...selectedPost.products];
                  newProducts[index].description = e.target.value;
                  setSelectedPost({ ...selectedPost, products: newProducts });
                }}
                placeholder="Description"
                className="border p-2 mb-2 w-full"
              />
              <input
                type="text"
                value={product.category || ''}
                onChange={(e) => {
                  const newProducts = [...selectedPost.products];
                  newProducts[index].category = e.target.value;
                  setSelectedPost({ ...selectedPost, products: newProducts });
                }}
                placeholder="Category"
                className="border p-2 mb-2 w-full"
              />
              <input
                type="text"
                value={product.shop || ''}
                onChange={(e) => {
                  const newProducts = [...selectedPost.products];
                  newProducts[index].shop = e.target.value;
                  setSelectedPost({ ...selectedPost, products: newProducts });
                }}
                placeholder="Shop"
                className="border p-2 mb-2 w-full"
              />
            </div>
          ))}
          <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors">
            Update Post
          </button>
        </form>
      )}
    </div>
  );
} 