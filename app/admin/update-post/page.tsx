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

interface CelebrityOption {
  id: number;
  name: string;
  dp?: string;
}

export default function UpdatePostPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [celebrities, setCelebrities] = useState<CelebrityOption[]>([]);
  const [selectedCelebrity, setSelectedCelebrity] = useState<CelebrityOption | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [newProduct, setNewProduct] = useState({
    brandname: '',
    seoname: '',
    imageFile: null as File | null,
    link: '',
    description: '',
    category: '',
    shop: ''
  });
  const initialCategories = [
    "shirt", "pant", "suits", "t-shirts", "jeans", "trousers", "chinos",
    "blazers", "jackets", "ethnic wear", "activewear", "shorts",
    "footwear", "eyewear", "accessories", "skirt", "tops", "blouses",
    "skirts",  "leggings", "sarees"
  ];
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [newCategory, setNewCategory] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;

    if (!session || (session.user?.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL && session.user?.email !== process.env.NEXT_PUBLIC_ADMIN1_EMAIL)) {
      router.push('/');
    }
  }, [session, status, router]);

  useEffect(() => {
    async function fetchInitial() {
      setIsLoading(true);
      try {
        const [postsRes, celebsRes] = await Promise.all([
          fetch('/api/posts'),
          fetch('/api/celebrities'),
        ]);
        if (!postsRes.ok) throw new Error('Failed to fetch posts');
        if (!celebsRes.ok) throw new Error('Failed to fetch celebrities');
        const [postsData, celebsData] = await Promise.all([
          postsRes.json(),
          celebsRes.json(),
        ]);
        setPosts(postsData);
        setCelebrities(celebsData);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchInitial();
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

  const filteredPosts = selectedCelebrity
    ? posts.filter(post => post.Celebrity.name === selectedCelebrity.name)
    : posts.filter(post => post.Celebrity.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const sanitizeUrl = (url: string) => {
    let clean = (url || '').trim();
    clean = clean.replace(/^((https?:\/\/)+|https?\/\/)/i, '');
    clean = clean.replace(/^www\./i, '');
    return clean;
  };

  const uploadImage = async (file: File): Promise<string> => {
    const form = new FormData();
    form.append('file', file);
    form.append('folder', '/products');
    const res = await fetch('/api/imagekit-upload', { method: 'POST', body: form });
    if (!res.ok) throw new Error('Image upload failed');
    const data = await res.json();
    // API returns array for multiple files; for single, use first item
    if (Array.isArray(data)) {
      return data[0]?.url || '';
    }
    return data?.[0]?.url || data?.url || '';
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Update Post</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block mb-2 font-semibold">Select Celebrity</label>
          <select
            className="border p-2 w-full"
            value={selectedCelebrity?.id ?? ''}
            onChange={(e) => {
              const id = Number(e.target.value);
              const celeb = celebrities.find(c => c.id === id) || null;
              setSelectedCelebrity(celeb);
              setSelectedPost(null);
            }}
          >
            <option value="">-- Choose --</option>
            {celebrities.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {!selectedCelebrity && (
            <>
              <label className="block mt-4 mb-2 font-semibold">Or search by name</label>
              <input
                type="text"
                placeholder="Search by Celebrity Name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border p-2 w-full"
              />
            </>
          )}
          <ul className="mt-4">
            {filteredPosts.map(post => (
              <li key={post.id} className="mb-2">
                <button onClick={() => handlePostSelect(post.id)} className="text-blue-600 underline">
                  Post #{post.id} • {new Date(post.date).toLocaleDateString()} • {post.Celebrity.name}
                </button>
              </li>
            ))}
            {filteredPosts.length === 0 && (
              <p className="text-sm text-gray-500">No posts found.</p>
            )}
          </ul>
        </div>
      </div>

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
              <div className="mb-2">
                <label className="block text-sm mb-1">Category</label>
                <select
                  className="border p-2 w-full"
                  value={product.category || ''}
                  onChange={(e) => {
                    const newProducts = [...selectedPost.products];
                    newProducts[index].category = e.target.value;
                    setSelectedPost({ ...selectedPost, products: newProducts });
                  }}
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>
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
          <div className="mt-6 p-4 border rounded-md">
            <h4 className="font-semibold mb-3">Add New Product to this Post</h4>
            <div className="grid gap-2">
              <input
                id="new-brand"
                type="text"
                placeholder="Brand Name"
                className="border p-2 w-full"
                value={newProduct.brandname}
                onChange={(e) => setNewProduct({ ...newProduct, brandname: e.target.value })}
              />
            </div>
            <div className="grid gap-2 mt-2">
              <input
                type="text"
                placeholder="SEO Name"
                className="border p-2 w-full"
                id="new-seoname"
                value={newProduct.seoname}
                onChange={(e) => setNewProduct({ ...newProduct, seoname: e.target.value })}
              />
              <input
                type="file"
                accept="image/*"
                className="border p-2 w-full"
                onChange={(e) => setNewProduct({ ...newProduct, imageFile: e.target.files?.[0] || null })}
              />
              <input
                type="text"
                placeholder="Link (domain/path)"
                className="border p-2 w-full"
                id="new-link"
                value={newProduct.link}
                onChange={(e) => setNewProduct({ ...newProduct, link: e.target.value })}
              />
              <input
                type="text"
                placeholder="Description"
                className="border p-2 w-full"
                id="new-desc"
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              />
              <div>
                <label className="block text-sm mb-1">Category</label>
                <div className="flex gap-2">
                  <select
                    className="border p-2 w-full"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="px-3 py-2 border rounded"
                    onClick={() => setIsAddingCategory(true)}
                  >
                    +
                  </button>
                </div>
                {isAddingCategory && (
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      className="border p-2 w-full"
                      placeholder="Add new category"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                    />
                    <button
                      type="button"
                      className="px-3 py-2 border rounded"
                      onClick={() => {
                        if (newCategory && !categories.includes(newCategory.toLowerCase())) {
                          setCategories(prev => [...prev, newCategory.toLowerCase()]);
                          setNewCategory('');
                          setIsAddingCategory(false);
                        }
                      }}
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>
              <input
                type="text"
                placeholder="Shop"
                className="border p-2 w-full"
                id="new-shop"
                value={newProduct.shop}
                onChange={(e) => setNewProduct({ ...newProduct, shop: e.target.value })}
              />
              <button
                type="button"
                className="bg-blue-600 text-white px-3 py-2 rounded mt-2 disabled:opacity-60"
                disabled={isUploading}
                onClick={async () => {
                  if (!selectedPost) return;
                  if (!newProduct.imageFile) {
                    toast.error('Please select a product image');
                    return;
                  }
                  try {
                    setIsUploading(true);
                    const imageUrl = await uploadImage(newProduct.imageFile);
                    const staged: any = {
                      brandname: newProduct.brandname,
                      seoname: newProduct.seoname,
                      imageUrl,
                      link: sanitizeUrl(newProduct.link),
                      description: newProduct.description,
                      category: newProduct.category,
                      shop: newProduct.shop,
                    };
                    setSelectedPost({ ...selectedPost, products: [...selectedPost.products, staged] as any });
                    setNewProduct({ brandname: '', seoname: '', imageFile: null, link: '', description: '', category: '', shop: '' });
                    toast.success('New product staged for addition. Click Update Post to save.');
                  } catch (e) {
                    toast.error('Failed to upload product image');
                  } finally {
                    setIsUploading(false);
                  }
                }}
              >
                {isUploading ? 'Uploading...' : 'Add Product to This Post'}
              </button>
            </div>
          </div>
          <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors">
            Update Post
          </button>
        </form>
      )}
    </div>
  );
} 