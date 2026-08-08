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
  priority?: boolean;
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
  priority = false,
}: ImageComponentProps) {
  if (!urlEndpoint || !publicKey) {
    console.error("ImageKit configuration is missing");
    return null;
  }

  const imagePath = getImageKitPath(src);
 

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
      {/* The explicit width/height stay — call sites pass `h-auto w-auto
          max-h-full max-w-full`, and without a definite size on this wrapper
          those resolve circularly and collapse the image to 0x0.
          `maxWidth/maxHeight: 100%` is what stops that fixed size escaping its
          container: a `width={600}` product image used to force its grid track
          to 600px on a 375px phone and push the page into horizontal scroll.
          Capping it here means the declared size acts as an intrinsic hint
          rather than a floor. */}
      <div
        className={`relative ${className || ''}`}
        style={{
          width: fill ? '100%' : width,
          height: fill ? '100%' : height,
          maxWidth: '100%',
          maxHeight: '100%',
        }}
      >
        <IKImage
          path={imagePath}
          alt={alt}
          width={finalWidth}
          height={finalHeight}
          className={`${fill ? 'object-cover w-full h-full' : ''} ${className || ''}`}
          transformation={processedTransformation}
          lqip={lqip}
          // `priority` was accepted as a prop but never forwarded, so marking
          // an image priority did nothing. An above-the-fold image must not be
          // lazy-loaded, so priority now wins over any `loading` passed in.
          loading={priority ? undefined : loading}
          fetchPriority={priority ? 'high' : undefined}
        />
      </div>
    </ImageKitProvider>
  );
}