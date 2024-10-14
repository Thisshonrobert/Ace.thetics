'use client';

import { Input } from '@/components/ui/input';
import React, { useState } from 'react';
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { uploadToS3 } from '../api/auth/admin/s3-upload';

interface Product {
  brandName: string;
  seoName: string;
  category: string;
  shop: string;
  link: string;
  image: File | null;
}

const AdminPage = () => {
    const { data: session,status } = useSession();
    const router = useRouter();

    const [celebName, setCelebName] = useState("");
    const [socialId, setSocialId] = useState("");
    const [celebFiles, setCelebFiles] = useState<File[]>([]);
    const [dpFiles, setDpFiles] = useState<File[]>([]);
    const [celebExists, setCelebExists] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [currentProduct, setCurrentProduct] = useState<Product>({
      brandName: '',
      seoName: '',
      category: '',
      shop: '',
      link: '',
      image: null,
    });
    const [products, setProducts] = useState<Product[]>([]);

    // Redirect if not authenticated or not the admin
    React.useEffect(() => {
        if(status === "loading") return;
          if (!session || session.user?.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
              router.push('/');
          }
      }, [session, router]);
    

    const handleCelebFileUpload = (files: File[]) => {
        setCelebFiles(files);
    };

    const handleDpFileUpload = (files: File[]) => {
        setDpFiles(files);
    };

    const handleProductImageUpload = (files: File[]) => {
        setCurrentProduct({ ...currentProduct, image: files[0] });
    };

    const handleCheck = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/check-celebrity?name=${encodeURIComponent(celebName)}`);
            const data = await response.json();
            setCelebExists(data.exists);
        } catch (error) {
            console.error('Error checking celebrity:', error);
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
                image: null,
            });
        } else {
            alert('Please upload a product image');
        }
    };

    const handlePost = async () => {
        setIsLoading(true);
        try {
            // Upload images to S3
            const celebImageUrls = await Promise.all(celebFiles.map(file => uploadToS3(file, 'celeb')));
            const dpImageUrl = dpFiles.length > 0 ? await uploadToS3(dpFiles[0], 'dp') : null;
            const productImageUrls = await Promise.all(products.map(product => uploadToS3(product.image!, 'product')));

            // Create celebrity entry
            const response = await fetch('/api/create-celebrity', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: celebName,
                    socialId,
                    dpImage: dpImageUrl,
                    celebImages: celebImageUrls,
                    products: products.map((product, index) => ({
                        ...product,
                        imageUrl: productImageUrls[index],
                    })),
                }),
            });

            if (response.ok) {
                alert('Celebrity and products added successfully!');
                // Reset form
                setCelebName('');
                setSocialId('');
                setCelebFiles([]);
                setDpFiles([]);
                setProducts([]);
            } else {
                throw new Error('Failed to add celebrity and products');
            }
        } catch (error) {
            console.error('Error posting celebrity:', error);
            alert('Failed to add celebrity and products. Please try again.');
        }
        setIsLoading(false);
    };

    return (
        <div className='max-w-xl flex flex-col items-center justify-center mx-auto'>
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
            
            <label>Celeb post pic</label>
            <div className="w-full max-w-4xl mx-auto min-h-96 border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg mt-4">
                <FileUpload onChange={handleCelebFileUpload} />
            </div>

            <h2>Add Products</h2>
            <Input 
                onChange={(e) => setCurrentProduct({ ...currentProduct, brandName: e.target.value })} 
                value={currentProduct.brandName} 
                placeholder='Brand name' 
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

            {!celebExists && products.length > 0 && (
                <Button onClick={handlePost} disabled={isLoading}>
                    {isLoading ? 'Posting...' : 'Post Celebrity and Products'}
                </Button>
            )}
        </div>
    );
};

export default AdminPage;