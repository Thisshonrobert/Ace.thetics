'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FileUpload } from "@/components/ui/file-upload";

interface Product {
  brandName: string;
  seoName: string;
  category: string;
  shop: string;
  link: string;
  description:string;
  image: File | null;
}

interface CelebrityPayload {
  name: string;
  socialId?: string;
  dpImage?: string;
  celebImages: string[];
  products: {
    brandName: string;
    seoName: string;
    category: string;
    shop: string;
    link: string;
    imageUrl: string;
  }[];
}

export default function AdminPageClient() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [celebName, setCelebName] = useState("");
  const [socialId, setSocialId] = useState("");
  const [celebFiles, setCelebFiles] = useState<File[]>([]);
  const [dpFiles, setDpFiles] = useState<File[]>([]);
  const [celebExists, setCelebExists] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentProduct, setCurrentProduct] = useState<Product>({
    brandName: '',
    seoName: '',
    category: '',
    shop: '',
    link: '',
    description:'',
    image: null,
  });
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user?.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      router.push('/');
    }
  }, [session, status, router]);

  const handleCelebFileUpload = (files: File[]) => {
    setCelebFiles(prevFiles => [...prevFiles, ...files]);
  };

  const handleDpFileUpload = (files: File[]) => {
    setDpFiles(files);
  };

  const handleProductImageUpload = (files: File[]) => {
    setCurrentProduct({ ...currentProduct, image: files[0] });
  };

  const handleCheck = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/admin/check-celebrity?name=${encodeURIComponent(celebName)}`);
      setCelebExists(response.data.exists);
    } catch (error) {
      console.error('Error checking celebrity:', error);
      setError('Failed to check celebrity. Please try again.');
    }
    setIsLoading(false);
  };

  const handleAddProduct = () => {
    if (currentProduct.image) {
      setProducts([...products, currentProduct]);
      setCurrentProduct({
        brandName: '',
        seoName: '',
        category: '',
        shop: '',
        link: '',
        description:'',
        image: null,
      });
    } else {
      setError('Please upload a product image');
    }
  };

  const uploadToS3 = async (file: File, type: 'celeb' | 'product' | 'dp') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    try {
      const response = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data.url;
    } catch (error) {
      console.error('Error uploading file:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(`Failed to upload image: ${error.response.data.error}`);
      }
      throw new Error('Failed to upload image');
    }
  };

  const handlePost = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const celebImageUrls = await Promise.all(celebFiles.map(file => uploadToS3(file, 'celeb')));
      const productImageUrls = await Promise.all(products.map(product => uploadToS3(product.image!, 'product')));

      const payload: CelebrityPayload = {
        name: celebName,
        celebImages: celebImageUrls,
        products: products.map((product, index) => ({
          ...product,
          imageUrl: productImageUrls[index],
        })),
      };

      if (!celebExists) {
        payload.socialId = socialId;
        if (dpFiles.length > 0) {
          payload.dpImage = await uploadToS3(dpFiles[0], 'dp');
        }
      }

      const response = await axios.post('/api/admin/create-celebrity', payload);

      if (response.status === 200 || response.status === 201) {
        alert(celebExists ? 'Celebrity updated successfully!' : 'Celebrity and products added successfully!');
        setCelebName('');
        setSocialId('');
        setCelebFiles([]);
        setDpFiles([]);
        setProducts([]);
        setCelebExists(false);
      } else {
        throw new Error('Failed to add/update celebrity and products');
      }
    } catch (error) {
      console.error('Error posting celebrity:', error);
      setError('Failed to add/update celebrity and products. Please try again.');
    }
    setIsLoading(false);
  };

  return (
    <div className='max-w-xl flex flex-col items-center justify-center mx-auto space-y-3'>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <Input 
        onChange={(e) => setCelebName(e.target.value)} 
        value={celebName} 
        placeholder='Celeb name' 
      />
      <Button onClick={handleCheck} disabled={isLoading}>
        {isLoading ? 'Checking...' : 'Check'}
      </Button>
      
      {!celebExists && (
        <>
          <Input 
            onChange={(e) => setSocialId(e.target.value)} 
            value={socialId} 
            placeholder='Social ID' 
          />
          <label>Celeb DP</label>
          <div className="w-full max-w-4xl mx-auto min-h-96 border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg mt-4">
            <FileUpload onChange={handleDpFileUpload} />
          </div>
        </>
      )}
      
      <label>Celeb post pics (multiple)</label>
      <div className="w-full max-w-4xl mx-auto min-h-96 border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg mt-4">
        <FileUpload onChange={handleCelebFileUpload} multiple />
      </div>
      
      {celebFiles.length > 0 && (
        <div>
          <h3>Selected Celebrity Images:</h3>
          {celebFiles.map((file, index) => (
            <p key={index}>{file.name}</p>
          ))}
        </div>
      )}

      <h2>Add Products</h2>
      <Input 
        onChange={(e) => setCurrentProduct({ ...currentProduct, brandName: e.target.value })} 
        value={currentProduct.brandName} 
        placeholder='Brand name' 
      />
       <Input 
        onChange={(e) => setCurrentProduct({ ...currentProduct, brandName: e.target.value })} 
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
      <label>Product Image</label>
      <div className="w-full max-w-4xl mx-auto min-h-96 border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg mt-4">
        <FileUpload onChange={handleProductImageUpload} />
      </div>
      <Button onClick={handleAddProduct}>Add Product</Button>

      <div>
        <h3>Added Products:</h3>
        {products.map((product, index) => (
          <div key={index}>
            <p>{product.brandName} - {product.category}</p>
          </div>
        ))}
      </div>

      {products.length > 0 && (
        <Button onClick={handlePost} disabled={isLoading}>
          {isLoading ? (celebExists ? 'Updating...' : 'Posting...') : (celebExists ? 'Update Celebrity and Products' : 'Post Celebrity and Products')}
        </Button>
      )}
    </div>
  );
}

//if any error check description