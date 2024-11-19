'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ImageKitProvider } from "imagekitio-next";
import { toast } from 'react-toastify';

const urlEndpoint = process.env.NEXT_PUBLIC_URL_ENDPOINT;
const publicKey = process.env.NEXT_PUBLIC_PUBLIC_KEY;

enum Gender {
  Men = 'men',
  Women = 'women',
  Kids = 'kids',
}

interface Product {
  brandName: string;
  seoName: string;
  category: string;
  shop: string;
  link: string;
  description: string;
  image: File | null;
}

interface ImageKitAuthResponse {
  token: string;
  expire: number;
  signature: string;
}

export default function AdminPageClient() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [formData, setFormData] = useState({
    gender: "",
    celebName: "",
    socialId: "",
    celebImages: [] as File[],
    dpImage: null as File | null,
    celebExists: false,
    products: [] as Product[],
  });

  const [currentProduct, setCurrentProduct] = useState<Product>({
    brandName: '',
    seoName: '',
    category: '',
    shop: '',
    link: '',
    description: '',
    image: null,
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
  
    // Redirect if the user is not logged in or the email is not one of the allowed admin emails
    if (!session || (session.user?.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL && session.user?.email !== process.env.NEXT_PUBLIC_ADMIN1_EMAIL)) {
      router.push('/');
    }
  }, [session, status, router]);
  

  const authenticator = async (): Promise<ImageKitAuthResponse> => {
    try {
      const { data } = await axios.get<ImageKitAuthResponse>("/api/imagekit-auth");
      return data;
    } catch (error) {
      console.error("Authentication request failed:", error);
      toast.error("Failed to get ImageKit authentication");
      throw error;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'dpImage' | 'celebImages') => {
    const files = e.target.files;
    if (files) {
      if (field === 'dpImage') {
        setFormData(prev => ({ ...prev, [field]: files[0] }));
      } else {
        setFormData(prev => ({ ...prev, [field]:[...prev.celebImages, ...Array.from(files)]}));
      }
    }
    console.log(`${field} updated:`, files);
  };

  const handleCheck = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/admin/check-celebrity?name=${encodeURIComponent(formData.celebName)}`);
      setFormData(prev => ({ ...prev, celebExists: response.data.exists }));
      toast.success(response.data.exists ? 'Celebrity found!' : 'New celebrity');
    } catch (error) {
      console.error('Error checking celebrity:', error);
      toast.error('Failed to check celebrity. Please try again.');
    }
    setIsLoading(false);
  };

  const handleAddProduct = () => {
    if (currentProduct.image) {
      setFormData(prev => ({ ...prev, products: [...prev.products, currentProduct] }));
      setCurrentProduct({
        brandName: '',
        seoName: '',
        category: '',
        shop: '',
        link: '',
        description: '',
        image: null,
      });
      toast.success('Product added successfully');
      console.log('Product added:', currentProduct);
    } else {
      toast.error('Please upload a product image');
    }
  };

  const uploadImage = async (files: File[], folder: string) => {
    try {
      const formData = new FormData();
      
      // Append all files with the same field name
      files.forEach(file => {
        formData.append("file", file);
      });
      formData.append("folder", folder);

      console.log(`Uploading ${files.length} files to folder: ${folder}`);

      const response = await axios.post("/api/imagekit-upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log('Upload response:', response.data);
      // If it's a single file upload, return the first URL
      if (files.length === 1) {
        return response.data[0].url;
      }
      // For multiple files, return array of URLs
      return response.data.map((result: any) => result.url);
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error("Failed to upload images");
      throw new Error("Image upload failed");
    }
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      console.log('Starting post process');
      
      // Upload profile picture if exists
      let dpImageUrl = "";
      if (formData.dpImage) {
        dpImageUrl = await uploadImage([formData.dpImage], "/dp");
      }

      // Upload celebrity images
      let celebImageUrls: string[] = [];
      if (formData.celebImages.length > 0) {
        celebImageUrls = await uploadImage(formData.celebImages, "/celebrities");
      }

      // Upload product images
      const productImageUrls = await Promise.all(
        formData.products.map(async (product) => {
          if (!product.image) throw new Error("Product image is required");
          const imageUrl = await uploadImage([product.image], "/products");
          return { ...product, imageUrl };
        })
      );

      const payload = {
        name: formData.celebName,
        celebImages: celebImageUrls,
        products: productImageUrls.map((product) => ({
          brandName: product.brandName,
          seoName: product.seoName,
          category: product.category,
          shop: product.shop,
          link: product.link,
          description: product.description,
          imageUrl: product.imageUrl,
        })),
        ...(formData.celebExists ? {} : {
          socialId: formData.socialId,
          gender: formData.gender as Gender,
          dpImage: dpImageUrl,
        }),
      };

      console.log('Sending payload:', payload);
      const response = await axios.post('/api/admin/create-celebrity', payload);

      if (response.status === 200 || response.status === 201) {
        toast.success(formData.celebExists ? 'Celebrity updated successfully!' : 'Celebrity and products added successfully!');
        setFormData({
          gender: "",
          celebName: "",
          socialId: "",
          celebImages: [],
          dpImage: null,
          celebExists: false,
          products: [],
        });
      }
    } catch (error) {
      console.error('Error posting celebrity:', error);
      toast.error('Failed to add/update celebrity and products. Please try again.');
    }
    setIsLoading(false);
  };

  return (
    <ImageKitProvider 
      publicKey={publicKey!} 
      urlEndpoint={urlEndpoint!} 
      authenticator={authenticator}
    >
      <form onSubmit={handlePost} className='max-w-xl flex flex-col items-center justify-center mx-auto space-y-3 mt-[10%]'>
        <h1 className="text-2xl font-bold mb-4">Admin Page</h1>
        
        <Input 
          name="celebName"
          onChange={handleInputChange} 
          value={formData.celebName} 
          placeholder='Celebrity name' 
          required
        />
        <Button type="button" onClick={handleCheck} disabled={isLoading}>
          {isLoading ? 'Checking...' : 'Check Celebrity'}
        </Button>
        
        {!formData.celebExists && (
          <>
            <Input 
              name="socialId"
              onChange={handleInputChange} 
              value={formData.socialId} 
              placeholder='Social ID' 
              required
            />
            <label className="font-semibold">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Select Gender</option>
              {Object.values(Gender).map((g) => (
                <option key={g} value={g}>
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </option>
              ))}
            </select>
            <label className="font-semibold">Celebrity Profile Picture</label>
            <input
              type="file"
              onChange={(e) => handleFileChange(e, 'dpImage')}
              accept="image/*"
              className="w-full p-2 border rounded"
              required
            />
          </>
        )}
        
        <label className="font-semibold">Celebrity Post Images (Multiple)</label>
        <input
          type="file"
          onChange={(e) => handleFileChange(e, 'celebImages')}
          accept="image/*"
          multiple
          className="w-full p-2 border rounded"
          required
        />
        {formData.celebImages.length > 0 && (
          <div>
            <h3 className="font-semibold">Selected Images:</h3>
            <ul>
              {formData.celebImages.map((file, index) => (
                <li key={index}>{file.name}</li>
              ))}
            </ul>
          </div>
        )}
        
        <h2 className="text-xl font-bold mt-8">Add Products</h2>
        <Input 
          onChange={(e) => setCurrentProduct({ ...currentProduct, brandName: e.target.value })} 
          value={currentProduct.brandName} 
          placeholder='Brand name' 
        />
        <Input 
          onChange={(e) => setCurrentProduct({ ...currentProduct, description: e.target.value })} 
          value={currentProduct.description} 
          placeholder='Description' 
        />
        <Input 
          onChange={(e) => setCurrentProduct({ ...currentProduct, seoName: e.target.value })} 
          value={currentProduct.seoName} 
          placeholder='SEO name' 
        />
        <Input 
          onChange={(e) => setCurrentProduct({ ...currentProduct, category: e.target.value })} 
          value={currentProduct.category} 
          placeholder='Category' 
        />
        <Input 
          onChange={(e) => setCurrentProduct({ ...currentProduct, shop: e.target.value })} 
          value={currentProduct.shop} 
          placeholder='Shop' 
        />
        <Input 
          onChange={(e) => setCurrentProduct({ ...currentProduct, link: e.target.value })} 
          value={currentProduct.link} 
          placeholder='Link' 
        />
        <label className="font-semibold">Product Image</label>
        <input
          type="file"
          onChange={(e) => setCurrentProduct({ ...currentProduct, image: e.target.files?.[0] || null })}
          accept="image/*"
          className="w-full p-2 border rounded"
        />
        <Button type="button" onClick={handleAddProduct}>Add Product</Button>

        {formData.products.length > 0 && (
          <div>
            <h3 className="font-semibold">Added Products:</h3>
            <ul>
              {formData.products.map((product, index) => (
                <li key={index}>
                  {product.brandName} - {product.category}
                </li>
              ))}
            </ul>
          </div>
        )}

        {formData.products.length > 0 && (
          <Button type="submit" disabled={isLoading} className="mt-4">
            {isLoading ? (formData.celebExists ? 'Updating...' : 'Posting...') : (formData.celebExists ? 'Update Celebrity and Products' : 'Post Celebrity and Products')}
          </Button>
        )}
      </form>
    </ImageKitProvider>
  );
}