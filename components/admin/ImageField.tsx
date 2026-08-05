"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { uploadImage, uploadImages } from "@/lib/imagekit-client";
import type { ImageFolder } from "@/constants/taxonomy";

/**
 * A single image slot: shows the current image, lets the admin replace it by
 * clicking / dropping a new file, and (optionally) remove it. The uploaded
 * ImageKit url is handed back through `onChange` so the parent form just holds
 * a string — no more editing raw CDN urls in a text box.
 */
export function ImageField({
  value,
  onChange,
  onRemove,
  folder,
  label,
  className,
  aspect = "square",
}: {
  value: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  folder: ImageFolder;
  label?: string;
  className?: string;
  aspect?: "square" | "portrait";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }

    // Show the local file immediately so the swap feels instant, then replace
    // it with the CDN url once ImageKit responds.
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setIsUploading(true);
    try {
      const url = await uploadImage(file, folder);
      onChange(url);
      toast.success("Image uploaded");
    } catch (error) {
      console.error("Image upload failed:", error);
      toast.error(error instanceof Error ? error.message : "Image upload failed");
      setPreview(null);
    } finally {
      setIsUploading(false);
      URL.revokeObjectURL(localUrl);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const shown = preview ?? value;

  return (
    <div className={cn("space-y-2", className)}>
      {label && <p className="text-sm font-medium text-gray-700">{label}</p>}
      <div
        role="button"
        tabIndex={0}
        onClick={() => !isUploading && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          "group relative w-full overflow-hidden rounded-xl border-2 border-dashed bg-gray-50 transition-colors",
          aspect === "square" ? "aspect-square" : "aspect-[3/4]",
          isDragging ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:border-indigo-400",
          isUploading ? "cursor-wait" : "cursor-pointer"
        )}
      >
        {shown ? (
          // Intentionally a plain <img>: this is an admin-only preview of an
          // arbitrary (possibly not-yet-saved) url, so next/image's remote
          // pattern allowlist would just get in the way.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={shown}
            alt={label ? `${label} preview` : "Image preview"}
            className="h-full w-full bg-white object-contain"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-gray-400">
            <ImagePlus className="h-8 w-8" />
            <span className="px-4 text-center text-xs">Click or drop an image</span>
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
          </div>
        )}

        {shown && !isUploading && (
          <div className="absolute inset-x-0 bottom-0 flex justify-center gap-2 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 text-xs font-medium text-gray-800">
              <RefreshCw className="h-3 w-3" /> Replace
            </span>
            {onRemove && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setPreview(null);
                  onRemove();
                }}
                className="inline-flex items-center gap-1 rounded-full bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700"
              >
                <Trash2 className="h-3 w-3" /> Remove
              </button>
            )}
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}

/**
 * A reorder-free gallery of images (used for a post's celebrity shots).
 * Supports replacing any slot, removing a slot, and appending new uploads.
 */
export function ImageGalleryField({
  values,
  onChange,
  folder,
  label,
  emptyHint = "No images yet",
}: {
  values: string[];
  onChange: (urls: string[]) => void;
  folder: ImageFolder;
  label?: string;
  emptyHint?: string;
}) {
  const addRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleAdd = async (files: FileList | null) => {
    const list = Array.from(files ?? []);
    if (list.length === 0) return;
    setIsUploading(true);
    try {
      const uploaded = await uploadImages(list, folder);
      onChange([...values, ...uploaded.map((u) => u.url)]);
      toast.success(`${uploaded.length} image${uploaded.length > 1 ? "s" : ""} added`);
    } catch (error) {
      console.error("Image upload failed:", error);
      toast.error(error instanceof Error ? error.message : "Image upload failed");
    } finally {
      setIsUploading(false);
      if (addRef.current) addRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        {label && <p className="text-sm font-medium text-gray-700">{label}</p>}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isUploading}
          onClick={() => addRef.current?.click()}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-3 w-3 animate-spin" /> Uploading…
            </>
          ) : (
            <>
              <ImagePlus className="mr-2 h-3 w-3" /> Add images
            </>
          )}
        </Button>
      </div>

      {values.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-sm text-gray-400">
          {emptyHint}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {values.map((url, index) => (
            <div key={`${url}-${index}`} className="relative">
              <ImageField
                value={url}
                folder={folder}
                aspect="portrait"
                onChange={(next) => {
                  const copy = [...values];
                  copy[index] = next;
                  onChange(copy);
                }}
                onRemove={() => onChange(values.filter((_, i) => i !== index))}
              />
              <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">
                {index + 1}
              </span>
            </div>
          ))}
        </div>
      )}

      <input
        ref={addRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleAdd(e.target.files)}
      />
    </div>
  );
}
