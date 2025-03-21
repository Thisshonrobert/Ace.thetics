"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import emailjs from '@emailjs/browser';
import { useSearchParams } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import axios, { AxiosRequestConfig } from "axios";
import Image from 'next/image';
import { Camera, Upload, X } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTryOnLimits } from "@/hooks/useTryOnLimits";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CameraCapture from "@/app/components/CameraCapture";

export default  function VirtualTryOn({ params }: { params: { productId: string } }) {
  const [userImage, setUserImage] = useState<File | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const searchParams = useSearchParams();
  const imageUrl = decodeURIComponent(searchParams.get('imageUrl') || '');

  const [showInstructions, setShowInstructions] = useState(true);

  const { data: session,status } = useSession();
  const router = useRouter();
  const [mailStatus, setMailStatus] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { remainingTries, checkLimit } = useTryOnLimits();

  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const sendErrorEmail = (errorMessage: string) => {
    emailjs
      .send('service_hxg6wib', 'template_wda4fsc', {
        error_message: errorMessage,
        to_email: 'thisshonrobert0205@gmail.com',
      }, '0s41OeypqWww--h3X')
      .then(
        () => {
          console.log('Error email sent successfully');
          setMailStatus(true);
        },
        (error:any) => {
          console.log('Failed to send error email:', error.text);
        }
      );
  };

  useEffect(() => {
    // Check session status
    if (status === "loading") {
      return; // Wait for session to load
    }

    if (status === "unauthenticated") {
      // Store the current URL before redirecting
      sessionStorage.setItem('redirectAfterSignIn', window.location.pathname + window.location.search);
      router.push('/api/auth/signin');
      return;
    }

    // Session is authenticated, remove loading state
    setIsLoading(false);
  }, [status, router]);

  const handleTryOn = async () => {
    if (!userImage || !imageUrl) return;
    const canTryOn = await checkLimit();
    if (!canTryOn) {
      // Show limit reached dialog
      toast({
        variant: "destructive",
        title: "Daily Limit Reached",
        description: "You've reached your daily limit of 3 try-ons. Please try again tomorrow.",
      });
      return;
    }

    setLoading(true);
    try {
      const productImageResponse = await fetch(imageUrl);
      if (!productImageResponse.ok) {
        throw new Error('Failed to fetch product image');
      }
      const productImageBlob = await productImageResponse.blob();

      const formData = new FormData();
      formData.append('clothing_image', productImageBlob);
      formData.append('avatar_image',  userImage);

      const options:AxiosRequestConfig<FormData>= {
        method: 'POST',
        url: 'https://try-on-diffusion.p.rapidapi.com/try-on-file',
        headers: {
          'x-rapidapi-key': '6e219b2afdmsh24636ae0e3024a9p10bcfbjsn8cca0eb9ee5c',
          'x-rapidapi-host': 'try-on-diffusion.p.rapidapi.com',
        },
        data: formData,
        responseType: "arraybuffer",
      };

      const response = await axios.request(options);
      
     const imageBlob = new Blob([response.data], { type: "image/jpeg" });
    const responseimageUrl = URL.createObjectURL(imageBlob);
    
    setResultUrl(responseimageUrl);
      
      setLoading(false);

      toast({
        title: "Success",
        description: "Virtual try-on completed successfully!",
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process virtual try-on. Please try again.",
      });
      sendErrorEmail(errorMessage);
      setLoading(false);
    }
  };

  // Cleanup function for object URLs
  useEffect(() => {
    return () => {
      if (resultUrl) {
        URL.revokeObjectURL(resultUrl);
      }
    };
  }, [resultUrl]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUserImage(file);
      setShowImageDialog(false);
    }
  };

  const handleCameraCapture = (file: File) => {
    setUserImage(file);
    setShowCamera(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl mt-[35%] md:mt-[15%] lg:mt-[7%]">
      <AlertDialog open={showInstructions} onOpenChange={setShowInstructions}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Important Instructions for Best Results</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>For the best virtual try-on experience, please ensure your photo meets these requirements:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Stand straight facing the camera</li>
                <li>Ensure good lighting and high image quality</li>
                <li>Use a plain or simple background</li>
                <li>Capture your full body from head to toe</li>
                <li>Wear fitted clothing (avoid loose or flowing garments)</li>
                <li>You have {remainingTries} tries per day</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowInstructions(false)}>
              Got it, thanks!
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card className="mb-8">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-6">Virtual Try-On</h2>
          
          {/* Input Images Section - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Your Photo Section */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Your Photo</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 h-[400px]">
                {userImage ? (
                  <div className="relative w-full h-full group">
                    <Image
                      src={URL.createObjectURL(userImage)}
                      alt="User uploaded photo"
                      fill
                      className="object-contain rounded-lg"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <button
                      onClick={() => setUserImage(null)}
                      className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => setShowImageDialog(true)}
                    className="flex flex-col items-center justify-center h-full cursor-pointer hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Upload className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-sm text-gray-600">Click to add your photo</p>
                    <p className="text-xs text-gray-400 mt-1">
                      You can upload or take a photo
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Product Photo Section */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Selected Product</h3>
              <div className="border rounded-lg bg-gray-50 p-4 h-[400px]">
                <div className="relative w-full h-full">
                  <Image
                    src={imageUrl}
                    alt="Product"
                    fill
                    className="object-contain rounded-lg"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Image Source Dialog */}
          <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Your Photo</DialogTitle>
                <DialogDescription>
                  Choose how you want to add your photo
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="flex flex-col items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="user-image-upload"
                  />
                  <label
                    htmlFor="user-image-upload"
                    className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm font-medium">Upload Photo</span>
                    <span className="text-xs text-gray-500">from your device</span>
                  </label>
                </div>
                <div className="flex flex-col items-center gap-4">
                  <button
                    onClick={() => {
                      setShowImageDialog(false);
                      setShowCamera(true);
                    }}
                    className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <Camera className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm font-medium">Take Photo</span>
                    <span className="text-xs text-gray-500">using camera</span>
                  </button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Camera Component */}
          {showCamera && (
            <CameraCapture
              onCapture={handleCameraCapture}
              onClose={() => setShowCamera(false)}
            />
          )}

          {/* Try On Button */}
          <div className="flex justify-center mb-8">
            <Button
              onClick={handleTryOn}
              disabled={!userImage || loading}
              className="w-full md:w-auto px-8 bg-black hover:bg-gray-800 transition-colors duration-200"
            >
              {loading ? (
                <>
                  <span className="animate-spin mr-2">⭮</span>
                  Processing...
                </>
              ) : (
                'Try On'
              )}
            </Button>
          </div>

          {/* Result Section - Full Width at Bottom */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Result</h3>
            <div className="border rounded-lg bg-gray-50 p-4 h-[500px]">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-sm text-gray-600">Processing your image...</p>
                  </div>
                </div>
              ) : resultUrl ? (
                <div className="relative w-full h-full">
                  <Image
                    src={resultUrl}
                    alt="Virtual Try-on Result"
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw"
                    priority
                  />
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <Camera className="h-12 w-12 mx-auto mb-4" />
                    <p>Upload your photo and click Try On to see the result</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
    </div>
  );
}

