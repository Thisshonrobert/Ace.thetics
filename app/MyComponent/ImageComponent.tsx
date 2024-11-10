"use client";

import React from "react";
import { IKImage, ImageKitProvider } from "imagekitio-next";

const urlEndpoint = process.env.NEXT_PUBLIC_URL_ENDPOINT;
const publicKey = process.env.NEXT_PUBLIC_PUBLIC_KEY;

interface TransformationObject {
  [key: string]: string;
}

interface ImageComponentProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  transformation?: Partial<TransformationObject>[];
  lqip?: { active: boolean; quality?: number;blur?:number };
  loading?: "lazy" | undefined;
  fill?: boolean;
}

const authenticator = async () => {
  try {
    const response = await fetch("/api/imagekit-auth");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return {
      signature: data.signature,
      expire: data.expire,
      token: data.token,
    };
  } catch (error) {
    console.error("Authentication failed:", error);
    throw error;
  }
};

const getImageKitPath = (src: string): string => {
  try {
    // If it's already a relative path, return as is
    if (src.startsWith('/')) {
      return src.substring(1); // Remove leading slash for ImageKit
    }

    // If it's a full ImageKit URL, extract everything after the imagekit ID
    if (src.includes('ik.imagekit.io')) {
      const matches = src.match(/ik\.imagekit\.io\/[^/]+\/(.*)/);
      if (matches && matches[1]) {
        return matches[1];
      }
    }

    // If no matches found, return the original src
    return src;
  } catch (error) {
    console.error('Error processing image path:', error);
    return src;
  }
};

export default function ImageComponent({
  src,
  alt,
  width,
  height,
  className,
  transformation = [],
  lqip = { active: true, quality: 20,blur:10 },
  loading,
  fill = false,
}: ImageComponentProps) {
  if (!urlEndpoint || !publicKey) {
    console.error("ImageKit configuration is missing");
    return null;
  }

  const imagePath = getImageKitPath(src);
  console.log('ImageComponent props:', { src, alt, width, height, className, transformation, lqip, loading, fill });
  console.log('Processed image path:', imagePath);

  // If dimensions are provided in transformation, use those instead
  const hasTransformDimensions = transformation.some(t => t.height || t.width);
  const finalWidth = hasTransformDimensions ? undefined : width;
  const finalHeight = hasTransformDimensions ? undefined : height;

  // Ensure transformation parameters are strings
  const processedTransformation = transformation.map(t => ({
    ...t,
    height: t.height?.toString(),
    width: t.width?.toString(),
  }));

  return (
    <ImageKitProvider
      publicKey={publicKey}
      urlEndpoint={urlEndpoint}
      authenticator={authenticator}
    >
      <div className={`relative ${className || ''}`} style={{
        width: fill ? '100%' : width,
        height: fill ? '100%' : height,
      }}>
        <IKImage
          path={imagePath}
          alt={alt}
          width={finalWidth}
          height={finalHeight}
          className={`${fill ? 'object-cover w-full h-full' : ''} ${className || ''}`}
          transformation={processedTransformation}
          lqip={lqip}
          loading={loading}
        />
      </div>
    </ImageKitProvider>
  );
}