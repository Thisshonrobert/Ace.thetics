'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { ImageKitProvider } from "imagekitio-next";
import { toast } from 'react-toastify';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const urlEndpoint = process.env.NEXT_PUBLIC_URL_ENDPOINT;
const publicKey = process.env.NEXT_PUBLIC_PUBLIC_KEY;

enum Gender {
  Men = 'men',
  Women = 'women',
  Kids = 'kids',
}

export enum Profession {
  Actor = 'actor',
  Actress = 'actress',
  Artist = 'artist',
  Sports = 'sports',
  Other = 'other',
}

export const topCountries = [
  "United States", "China", "India", "Brazil", "Russia", "United Kingdom", "France", "Germany", 
  "Japan", "Canada", "South Korea", "Italy", "Australia", "Spain", "Mexico", "Indonesia", 
  "Netherlands", "Saudi Arabia", "Turkey", "Switzerland", "Sweden", "Poland", "Belgium", 
  "Norway", "Argentina"
];

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

const initialCategories = [
  "shirt", "pant", "suits", "t-shirts", "jeans", "trousers", "chinos",
  "blazers", "jackets", "ethnic wear", "activewear", "shorts",
  "footwear", "eyewear", "accessories", "skirt", "tops", "blouses",
  "skirts",  "leggings", "sarees"
];

const sanitizeUrl = (url: string) => {
  // Remove any existing protocol (http:// or https://)
  let cleanUrl = url.replace(/^(https?:\/\/)+(www\.)?/, '');
  
  // Add https:// only if it's not already there
  return cleanUrl;
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
    profession: "",
    country: "",
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
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [newCategory, setNewCategory] = useState<string>('');
  const [isAddingCategory, setIsAddingCategory] = useState<boolean>(false);
  

  useEffect(() => {
    if (status === "loading") return;
  
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
    if (name === 'socialId') {
      const sanitizedValue = sanitizeUrl(value);
      setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'dpImage' | 'celebImages') => {
    const files = e.target.files;
    if (files) {
      if (field === 'dpImage') {
        setFormData(prev => ({ ...prev, [field]: files[0] }));
      } else {
        setFormData(prev => ({ ...prev, [field]: [...prev.celebImages, ...Array.from(files)] }));
      }
    }
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
    } else {
      toast.error('Please upload a product image');
    }
  };

  const uploadImage = async (files: File[], folder: string) => {
    try {
      const formData = new FormData();
      
      files.forEach(file => {
        formData.append("file", file);
      });
      formData.append("folder", folder);

      const response = await axios.post("/api/imagekit-upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (files.length === 1) {
        return response.data[0].url;
      }
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
      let dpImageUrl = "";
      if (formData.dpImage) {
        dpImageUrl = await uploadImage([formData.dpImage], "/dp");
      }

      let celebImageUrls: string[] = [];
      if (formData.celebImages.length > 0) {
        celebImageUrls = await uploadImage(formData.celebImages, "/celebrities");
      }

      const productImageUrls = await Promise.all(
        formData.products.map(async (product) => {
          if (!product.image) throw new Error("Product image is required");
          const imageUrl = await uploadImage([product.image], "/products");
          return { ...product, imageUrl };
        })
      );

      const payload = {
        name: formData.celebName,
        celebImages: [celebImageUrls],
        products: productImageUrls.map((product) => ({
          brandName: product.brandName,
          seoName: product.seoName,
          category: product.category,
          shop: product.shop,
          link: sanitizeUrl(product.link),
          description: product.description,
          imageUrl: product.imageUrl,
        })),
        ...(formData.celebExists ? {} : {
          socialId: formData.socialId,
          gender: formData.gender as Gender,
          dpImage: dpImageUrl,
          profession: formData.profession as Profession,
          country: formData.country,
        }),
      };

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
          profession: "",
          country: "",
        });
      }
    } catch (error) {
      console.error('Error posting celebrity:', error);
      toast.error('Failed to add/update celebrity and products. Please try again.');
    }
    setIsLoading(false);
  };

  const handleAddCategory = () => {
    if (newCategory && !categories.includes(newCategory.toLowerCase())) {
      setCategories(prev => [...prev, newCategory.toLowerCase()]);
      setNewCategory('');
      setIsAddingCategory(false);
    }
  };

  return (
    <ImageKitProvider 
      publicKey={publicKey!} 
      urlEndpoint={urlEndpoint!} 
      authenticator={authenticator}
    >
      <Card className="max-w-2xl mx-auto mt-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Admin Page</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePost} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="celebName">Celebrity Name</Label>
              <Input 
                id="celebName"
                name="celebName"
                onChange={handleInputChange} 
                value={formData.celebName} 
                placeholder="Celebrity name" 
                required
              />
            </div>
            <Button type="button" onClick={handleCheck} disabled={isLoading}>
              {isLoading ? 'Checking...' : 'Check Celebrity'}
            </Button>
            
            {!formData.celebExists && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="socialId">Social ID</Label>
                  <Input 
                    id="socialId"
                    name="socialId"
                    onChange={handleInputChange} 
                    value={formData.socialId} 
                    placeholder="Social ID" 
                    required
                  />
                  {formData.socialId && (
                    <p className="text-xs text-gray-500">
                      Sanitized URL: {formData.socialId}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select name="gender" onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(Gender).map((g) => (
                        <SelectItem key={g} value={g}>
                          {g.charAt(0).toUpperCase() + g.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profession">Profession</Label>
                  <Select name="profession" onValueChange={(value) => setFormData(prev => ({ ...prev, profession: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Profession" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(Profession).map((p) => (
                        <SelectItem key={p} value={p}>
                          {p.charAt(0).toUpperCase() + p.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    placeholder="Search country"
                    list="countries"
                    required
                  />
                  <datalist id="countries">
                    {topCountries.map((country) => (
                      <option key={country} value={country} />
                    ))}
                  </datalist>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dpImage">Celebrity Profile Picture</Label>
                  <Input
                    id="dpImage"
                    type="file"
                    onChange={(e) => handleFileChange(e, 'dpImage')}
                    accept="image/*"
                    required
                  />
                </div>
              </>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="celebImages">Celebrity Post Images (Multiple)</Label>
              <Input
                id="celebImages"
                type="file"
                onChange={(e) => handleFileChange(e, 'celebImages')}
                accept="image/*"
                multiple
                required
              />
            </div>
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
            <div className="space-y-4">
              <Input 
                onChange={(e) => setCurrentProduct({ ...currentProduct, brandName: e.target.value })} 
                value={currentProduct.brandName} 
                placeholder="Brand name" 
              />
              <Input 
                onChange={(e) => setCurrentProduct({ ...currentProduct, description: e.target.value })} 
                value={currentProduct.description} 
                placeholder="Description" 
              />
              <Input 
                onChange={(e) => setCurrentProduct({ ...currentProduct, seoName: e.target.value })} 
                value={currentProduct.seoName} 
                placeholder="SEO name" 
              />
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <div className="flex items-center space-x-2">
                  <Select name="category" onValueChange={(value) => setCurrentProduct({ ...currentProduct, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" onClick={() => setIsAddingCategory(true)} variant="outline">
                    +
                  </Button>
                </div>
              </div>

              {isAddingCategory && (
                <div className="flex items-center space-x-2">
                  <Input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Add new category"
                  />
                  <Button type="button" onClick={handleAddCategory} variant="outline">
                    Add
                  </Button>
                </div>
              )}

              <Input 
                onChange={(e) => setCurrentProduct({ ...currentProduct, shop: e.target.value })} 
                value={currentProduct.shop} 
                placeholder="Shop" 
              />
              <Input 
                onChange={(e) => setCurrentProduct({ ...currentProduct, link: e.target.value })} 
                value={currentProduct.link} 
                placeholder="Link" 
              />
              <div className="space-y-2">
                <Label htmlFor="productImage">Product Image</Label>
                <Input
                  id="productImage"
                  type="file"
                  onChange={(e) => setCurrentProduct({ ...currentProduct, image: e.target.files?.[0] || null })}
                  accept="image/*"
                />
              </div>
              <Button type="button" onClick={handleAddProduct}>Add Product</Button>
            </div>

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
          <div className="flex flex-col space-y-4 mt-4">
            <Button onClick={() => router.push('/admin/delete-post')} className="bg-red-500 text-white">
              Delete Post
            </Button>
            <Button onClick={() => router.push('/admin/delete-celebrity')} className="bg-red-500 text-white">
              Delete Celebrity
            </Button>
            <Button onClick={() => router.push('/admin/update-post')} className="bg-red-500 text-white">
              Update Post
            </Button>
            <Button onClick={() => router.push('/admin/update-celebrity')} className="bg-red-500 text-white">
              Update Celebrity
            </Button>
          </div>
        </CardContent>
      </Card>
    </ImageKitProvider>
  );
}