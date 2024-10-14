'use client';
import { Input } from '@/components/ui/input';
import React, { useState } from 'react';
import { FileUpload } from "@/components/ui/file-upload";

const Page = () => {
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

    const handleCelebFileUpload = (files: File[]) => {
      setCelebFiles(files);
      console.log("Celeb Files: ", files);
    };

    const handleProductFileUpload = (files: File[]) => {
      setProductFiles(files);
      console.log("Product Files: ", files);
    };

    const handleDpFileUpload = (files: File[]) => {
      setDpFiles(files);
      console.log("DP Files: ", files);
    };

    return (
      <div>
        <Input 
          onChange={(e) => setCelebName(e.target.value)} 
          value={celebName} 
          placeholder='Celeb name' 
        />
        <Input 
          onChange={(e) => setSocialId(e.target.value)} 
          value={socialId} 
          placeholder='Social ID' 
        />
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

        {/* Celeb File Upload */}
        <div className="w-full max-w-4xl mx-auto min-h-96 border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg mt-4">
          <FileUpload onChange={handleCelebFileUpload} />
        </div>

        {/* Product File Upload */}
        <div className="w-full max-w-4xl mx-auto min-h-96 border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg mt-4">
          <FileUpload onChange={handleProductFileUpload} />
        </div>

        {/* DP File Upload */}
        <div className="w-full max-w-4xl mx-auto min-h-96 border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg mt-4">
          <FileUpload onChange={handleDpFileUpload} />
        </div>
      </div>
    );
};

export default Page;
