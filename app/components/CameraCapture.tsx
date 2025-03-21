'use client'

import React, { useRef, useState } from 'react'
import { Camera, RotateCw, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CameraCaptureProps {
  onCapture: (file: File) => void
  onClose: () => void
}

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: false,
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      alert('Unable to access camera. Please ensure camera permissions are granted.')
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
  }

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
    if (stream) {
      stopCamera()
      setTimeout(startCamera, 300)
    }
  }

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas')
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0)
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' })
            onCapture(file)
            stopCamera()
            onClose()
          }
        }, 'image/jpeg', 0.8)
      }
    }
  }

  // Start camera when component mounts
  React.useEffect(() => {
    startCamera()
    return () => stopCamera() // Cleanup on unmount
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-4 flex gap-4">
        <Button 
          onClick={capturePhoto} 
          variant="secondary"
          className="bg-white text-black hover:bg-gray-200"
        >
          <Camera className="h-4 w-4 mr-2" />
          Capture
        </Button>
        <Button 
          onClick={toggleCamera} 
          variant="secondary"
          className="bg-white text-black hover:bg-gray-200"
        >
          <RotateCw className="h-4 w-4 mr-2" />
          Flip
        </Button>
        <Button 
          onClick={() => {
            stopCamera()
            onClose()
          }} 
          variant="destructive"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
} 