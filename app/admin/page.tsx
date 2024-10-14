'use client';

import { Input } from '@/components/ui/input';
import React, { useState } from 'react';
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { uploadToS3 } from '../api/auth/admin/s3-upload';

const AdminPage = () => {
    const { data: session,status } = useSession();
    const router = useRouter();

    const [celebName, setCelebName] = useState("");
    const [socialId, setSocialId] = useState("");
    const [category, setCategory] = useState("");
    const [brandName, setBrandName] = useState("");
    const [seoName, setSeoName] = useState("");
    const [shop, setShop] = useState("");
    const [link, setLink] = useState("");

    const [celebFiles, setCelebFiles] = useState<File[]>([]);
    const [productFiles, setProductFiles] = useState<File[]>([]);
    const [dpFiles, setDpFiles] = useState<File[]>([]);

    const [celebExists, setCelebExists] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

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

    const handleProductFileUpload = (files: File[]) => {
        setProductFiles(files);
    };

    const handleDpFileUpload = (files: File[]) => {
        setDpFiles(files);
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

    const handlePost = async () => {
        setIsLoading(true);
        try {
            // Upload images to S3
            const celebImageUrls = await Promise.all(celebFiles.map(file => uploadToS3(file, 'celeb')));
            const productImageUrls = await Promise.all(productFiles.map(file => uploadToS3(file, 'product')));
            const dpImageUrl = dpFiles.length > 0 ? await uploadToS3(dpFiles[0], 'dp') : null;

            // Create celebrity entry
            const response = await fetch('/api/create-celebrity', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: celebName,
                    socialId,
                    category,
                    brandName,
                    seoName,
                    shop,
                    link,
                    celebImages: celebImageUrls,
                    productImages: productImageUrls,
                    dpImage: dpImageUrl,
                }),
            });

            if (response.ok) {
                alert('Celebrity added successfully!');
                // Reset form
                setCelebName('');
                setSocialId('');
                setCategory('');
                setBrandName('');
                setSeoName('');
                setShop('');
                setLink('');
                setCelebFiles([]);
                setProductFiles([]);
                setDpFiles([]);
            } else {
                throw new Error('Failed to add celebrity');
            }
        } catch (error) {
            console.error('Error posting celebrity:', error);
            alert('Failed to add celebrity. Please try again.');
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
            
            <Input 
                onChange={(e) => setCategory(e.target.value)} 
                value={category} 
                placeholder='Category' 
            />
            <Input 
                onChange={(e) => setBrandName(e.target.value)} 
                value={brandName} 
                placeholder='Brand name' 
            />
            <Input 
                onChange={(e) => setSeoName(e.target.value)} 
                value={seoName} 
                placeholder='SEO name' 
            />
            <Input 
                onChange={(e) => setShop(e.target.value)} 
                value={shop} 
                placeholder='Shop' 
            />
            <Input 
                onChange={(e) => setLink(e.target.value)} 
                value={link} 
                placeholder='Link' 
            />

            <label>Celeb post pic</label>
            <div className="w-full max-w-4xl mx-auto min-h-96 border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg mt-4">
                <FileUpload onChange={handleCelebFileUpload} />
            </div>

            <label>Product file</label>
            <div className="w-full max-w-4xl mx-auto min-h-96 border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg mt-4">
                <FileUpload onChange={handleProductFileUpload} />
            </div>

            {!celebExists && (
                <Button onClick={handlePost} disabled={isLoading}>
                    {isLoading ? 'Posting...' : 'Post'}
                </Button>
            )}
        </div>
    );
};

export default AdminPage;