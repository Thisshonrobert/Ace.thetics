"use client";

import type { ImageFolder } from "@/constants/taxonomy";

export interface UploadedImage {
  url: string;
  fileId: string;
  name: string;
}

/**
 * Uploads one or more files to ImageKit through `/api/imagekit-upload` and
 * returns the resulting CDN urls.
 *
 * The old call sites each had their own copy of this with subtly different
 * response handling (`data[0].url` vs `data.url` vs `data.map(...)`), which is
 * how "new image links do not save" happened: a single-file upload that came
 * back in an unexpected shape silently produced `''` and then overwrote the
 * existing url with an empty string.
 */
export async function uploadImages(
  files: File[],
  folder: ImageFolder
): Promise<UploadedImage[]> {
  if (files.length === 0) return [];

  const body = new FormData();
  files.forEach((file) => body.append("file", file));
  body.append("folder", folder);

  const response = await fetch("/api/imagekit-upload", {
    method: "POST",
    body,
  });

  if (!response.ok) {
    const detail = await response.json().catch(() => null);
    throw new Error(detail?.error || "Image upload failed");
  }

  const data = await response.json();
  const results: UploadedImage[] = (Array.isArray(data) ? data : [data])
    .filter(Boolean)
    .map((item: any) => ({
      url: item.url,
      fileId: item.fileId,
      name: item.name,
    }));

  if (results.some((r) => !r.url)) {
    throw new Error("ImageKit did not return a url for every file");
  }

  return results;
}

/** Convenience wrapper for the common single-file case. */
export async function uploadImage(file: File, folder: ImageFolder): Promise<string> {
  const [uploaded] = await uploadImages([file], folder);
  return uploaded.url;
}
