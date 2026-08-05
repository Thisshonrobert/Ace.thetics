'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Check, Loader2, Plus, Search, Trash2, UserPlus } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ImageField, ImageGalleryField } from '@/components/admin/ImageField';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { shops } from '@/constants/shop';
import {
  COUNTRIES,
  GENDERS,
  IMAGE_FOLDERS,
  PRODUCT_CATEGORIES,
  PROFESSIONS,
  sanitizeUrl,
  titleCase,
} from '@/constants/taxonomy';

interface StagedProduct {
  brandName: string;
  seoName: string;
  category: string;
  shop: string;
  link: string;
  description: string;
  imageUrl: string;
}

const emptyProduct = (): StagedProduct => ({
  brandName: '',
  seoName: '',
  category: '',
  shop: '',
  link: '',
  description: '',
  imageUrl: '',
});

export default function AdminPageClient() {
  const [celebName, setCelebName] = useState('');
  const [socialId, setSocialId] = useState('');
  const [gender, setGender] = useState('');
  const [profession, setProfession] = useState('');
  const [country, setCountry] = useState('');
  const [dpImage, setDpImage] = useState('');
  const [celebImages, setCelebImages] = useState<string[]>([]);
  const [products, setProducts] = useState<StagedProduct[]>([]);
  const [currentProduct, setCurrentProduct] = useState<StagedProduct>(emptyProduct());

  /** `null` = not checked yet, so the form can ask before revealing the rest. */
  const [celebExists, setCelebExists] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<string[]>([...PRODUCT_CATEGORIES]);
  const [newCategory, setNewCategory] = useState('');
  const [showClearDb, setShowClearDb] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const resetForm = () => {
    setCelebName('');
    setSocialId('');
    setGender('');
    setProfession('');
    setCountry('');
    setDpImage('');
    setCelebImages([]);
    setProducts([]);
    setCurrentProduct(emptyProduct());
    setCelebExists(null);
  };

  const handleCheck = async () => {
    if (!celebName.trim()) {
      toast.error('Enter a celebrity name first');
      return;
    }
    setIsChecking(true);
    try {
      const response = await axios.get(
        `/api/admin/check-celebrity?name=${encodeURIComponent(celebName.trim())}`
      );
      setCelebExists(response.data.exists);
      toast.success(
        response.data.exists
          ? 'Existing celebrity — only the new post is needed'
          : 'New celebrity — fill in their profile below'
      );
    } catch (error) {
      console.error('Error checking celebrity:', error);
      toast.error('Failed to check celebrity. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  const handleAddProduct = () => {
    if (!currentProduct.imageUrl) {
      toast.error('Upload a product image');
      return;
    }
    if (!currentProduct.brandName.trim()) {
      toast.error('Product needs a brand name');
      return;
    }
    setProducts((prev) => [...prev, currentProduct]);
    setCurrentProduct(emptyProduct());
    toast.success('Product added');
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();

    if (celebExists === null) {
      toast.error('Check the celebrity name first');
      return;
    }
    if (celebImages.length === 0) {
      toast.error('Add at least one celebrity image');
      return;
    }
    if (products.length === 0) {
      toast.error('Add at least one product');
      return;
    }
    if (!celebExists && !dpImage) {
      toast.error('A new celebrity needs a profile picture');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: celebName.trim(),
        // Flat array. This used to be `[celebImageUrls]` — a nested array that
        // Prisma rejected whenever more than one image was selected.
        celebImages,
        products: products.map((product) => ({
          brandName: product.brandName,
          seoName: product.seoName,
          category: product.category,
          shop: product.shop,
          link: sanitizeUrl(product.link),
          description: product.description,
          imageUrl: product.imageUrl,
        })),
        ...(celebExists
          ? {}
          : {
              socialId: sanitizeUrl(socialId),
              gender,
              dpImage,
              profession,
              country,
            }),
      };

      const response = await axios.post('/api/admin/create-celebrity', payload);

      if (response.status === 200 || response.status === 201) {
        toast.success(
          celebExists ? 'Post added to existing celebrity!' : 'Celebrity and post created!'
        );
        resetForm();
      }
    } catch (error) {
      console.error('Error posting celebrity:', error);
      const message = axios.isAxiosError(error)
        ? error.response?.data?.error
        : undefined;
      toast.error(message || 'Failed to save. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-4 pb-16">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">New Post</h1>
        <p className="text-sm text-gray-500">
          Look up the celebrity, upload the look, then attach the products they&apos;re wearing.
        </p>
      </div>

      <form onSubmit={handlePost} className="space-y-6">
        {/* ---------- Step 1: celebrity ---------- */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">1 · Celebrity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-[240px] flex-1 space-y-1.5">
                <Label htmlFor="celebName">Celebrity name</Label>
                <Input
                  id="celebName"
                  value={celebName}
                  onChange={(e) => {
                    setCelebName(e.target.value);
                    // Any edit invalidates the previous lookup.
                    setCelebExists(null);
                  }}
                  placeholder="e.g. Samantha Ruth Prabhu"
                  required
                />
              </div>
              <Button type="button" onClick={handleCheck} disabled={isChecking} variant="outline">
                {isChecking ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking…
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" /> Check
                  </>
                )}
              </Button>
            </div>

            {celebExists === true && (
              <p className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">
                <Check className="h-4 w-4" /> Found — this post will be added to their profile.
              </p>
            )}

            {celebExists === false && (
              <div className="space-y-4 rounded-lg border border-dashed border-indigo-200 bg-indigo-50/40 p-4">
                <p className="flex items-center gap-2 text-sm font-medium text-indigo-900">
                  <UserPlus className="h-4 w-4" /> New celebrity — complete their profile
                </p>

                <div className="grid gap-4 md:grid-cols-[180px_1fr]">
                  <ImageField
                    label="Profile picture"
                    value={dpImage}
                    folder={IMAGE_FOLDERS.dp}
                    onChange={setDpImage}
                    onRemove={() => setDpImage('')}
                  />

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="socialId">Social media handle / URL</Label>
                      <Input
                        id="socialId"
                        value={socialId}
                        onChange={(e) => setSocialId(e.target.value)}
                        placeholder="instagram.com/username"
                        required
                      />
                      {socialId && (
                        <p className="truncate text-xs text-gray-500">
                          Saved as: {sanitizeUrl(socialId)}
                        </p>
                      )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="gender">Gender</Label>
                        <Select value={gender} onValueChange={setGender}>
                          <SelectTrigger id="gender">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            {GENDERS.map((g) => (
                              <SelectItem key={g} value={g}>
                                {titleCase(g)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="profession">Profession</Label>
                        <Select value={profession} onValueChange={setProfession}>
                          <SelectTrigger id="profession">
                            <SelectValue placeholder="Select profession" />
                          </SelectTrigger>
                          <SelectContent>
                            {PROFESSIONS.map((p) => (
                              <SelectItem key={p} value={p}>
                                {titleCase(p)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        list="admin-countries"
                        autoComplete="country-name"
                        placeholder="Search country"
                        required
                      />
                      <datalist id="admin-countries">
                        {COUNTRIES.map((c) => (
                          <option key={c} value={c} />
                        ))}
                      </datalist>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ---------- Step 2: post images ---------- */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">2 · Post images</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageGalleryField
              values={celebImages}
              folder={IMAGE_FOLDERS.celebrities}
              onChange={setCelebImages}
              emptyHint="Upload the outfit photos for this post."
            />
          </CardContent>
        </Card>

        {/* ---------- Step 3: products ---------- */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              3 · Products{' '}
              <span className="text-sm font-normal text-gray-500">({products.length} added)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {products.length > 0 && (
              <ul className="grid gap-3 sm:grid-cols-2">
                {products.map((product, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.imageUrl}
                      alt={product.brandName}
                      className="h-14 w-14 flex-shrink-0 rounded-lg bg-gray-50 object-contain"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-gray-900">{product.brandName}</p>
                      <p className="truncate text-xs text-gray-500">
                        {product.category || 'uncategorised'} · {product.shop || 'no shop'}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setProducts((prev) => prev.filter((_, i) => i !== index))}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Remove {product.brandName}</span>
                    </Button>
                  </li>
                ))}
              </ul>
            )}

            <div className="grid gap-5 rounded-xl border border-dashed border-gray-300 p-4 md:grid-cols-[180px_1fr]">
              <ImageField
                label="Product image"
                value={currentProduct.imageUrl}
                folder={IMAGE_FOLDERS.products}
                onChange={(url) => setCurrentProduct({ ...currentProduct, imageUrl: url })}
                onRemove={() => setCurrentProduct({ ...currentProduct, imageUrl: '' })}
              />

              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="brandName">Brand name</Label>
                    <Input
                      id="brandName"
                      value={currentProduct.brandName}
                      onChange={(e) =>
                        setCurrentProduct({ ...currentProduct, brandName: e.target.value })
                      }
                      placeholder="e.g. Louis Philippe"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="shop">Shop</Label>
                    <Input
                      id="shop"
                      value={currentProduct.shop}
                      onChange={(e) =>
                        setCurrentProduct({ ...currentProduct, shop: e.target.value.toLowerCase() })
                      }
                      list="admin-shops"
                      placeholder="e.g. amazon"
                    />
                    <datalist id="admin-shops">
                      {shops.map((shop) => (
                        <option key={shop.name} value={shop.name} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="seoName">Product name (SEO)</Label>
                  <Input
                    id="seoName"
                    value={currentProduct.seoName}
                    onChange={(e) =>
                      setCurrentProduct({ ...currentProduct, seoName: e.target.value })
                    }
                    placeholder="Full product title shown to visitors"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    rows={2}
                    value={currentProduct.description}
                    onChange={(e) =>
                      setCurrentProduct({ ...currentProduct, description: e.target.value })
                    }
                    placeholder="Elevate your style, embrace the trend!"
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="category">Category</Label>
                    <div className="flex gap-2">
                      <Select
                        value={currentProduct.category}
                        onValueChange={(value) =>
                          setCurrentProduct({ ...currentProduct, category: value })
                        }
                      >
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {titleCase(category)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="link">Buy link</Label>
                    <Input
                      id="link"
                      value={currentProduct.link}
                      onChange={(e) =>
                        setCurrentProduct({ ...currentProduct, link: e.target.value })
                      }
                      placeholder="amazon.in/dp/XXXX"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-end gap-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="newCategory">New category</Label>
                    <Input
                      id="newCategory"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="e.g. hoodies"
                      className="w-48"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const value = newCategory.trim().toLowerCase();
                      if (!value) return;
                      if (categories.includes(value)) {
                        toast.info('That category already exists');
                        return;
                      }
                      setCategories((prev) => [...prev, value]);
                      setCurrentProduct((prev) => ({ ...prev, category: value }));
                      setNewCategory('');
                      toast.success(`“${value}” added`);
                    }}
                  >
                    Add category
                  </Button>

                  <Button type="button" onClick={handleAddProduct} className="ml-auto">
                    <Plus className="mr-2 h-4 w-4" /> Add product
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="sticky bottom-0 -mx-4 flex items-center justify-end gap-3 border-t bg-white/95 px-4 py-3 backdrop-blur">
          <Button type="button" variant="outline" onClick={resetForm}>
            Reset
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publishing…
              </>
            ) : celebExists ? (
              'Publish post'
            ) : (
              'Create celebrity & publish'
            )}
          </Button>
        </div>
      </form>

      {/* Kept from the old dashboard, but moved out of the row of ordinary
          buttons where it sat one slot away from "Update Post". */}
      <Card className="mt-10 border-red-200">
        <CardHeader>
          <CardTitle className="text-base text-red-700">Danger zone</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-gray-600">
            Wipe every celebrity, post and product from the database.
          </p>
          <Button
            type="button"
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => setShowClearDb(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Clear database
          </Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showClearDb}
        onOpenChange={setShowClearDb}
        title="Clear the entire database?"
        description="Every celebrity, post and product will be permanently removed. This cannot be undone."
        confirmLabel="Yes, wipe everything"
        isPending={isClearing}
        onConfirm={async () => {
          setIsClearing(true);
          try {
            await axios.post('/api/admin/clearDB');
            toast.success('Database cleared');
            setShowClearDb(false);
          } catch (error) {
            console.error('Failed to clear database:', error);
            toast.error('Failed to clear the database');
          } finally {
            setIsClearing(false);
          }
        }}
      />
    </div>
  );
}
