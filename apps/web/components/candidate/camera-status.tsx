'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CameraStatus() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streamActive, setStreamActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setStreamActive(true);
    } catch {
      setError('Camera access denied or unavailable.');
      setStreamActive(false);
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  return (
    <div className="space-y-2">
      <div className="relative aspect-video w-full max-w-xs rounded-md border bg-black overflow-hidden flex items-center justify-center">
        <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${!streamActive ? 'hidden' : ''}`} />
        {!streamActive && (
          <div className="text-center p-4 text-xs text-muted-foreground space-y-2">
            <CameraOff className="h-8 w-8 text-destructive mx-auto" />
            <div>{error || 'Initializing Video Stream...'}</div>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground max-w-xs">
        <span className="flex items-center gap-1">
          <Camera className="h-3.5 w-3.5 text-primary" /> Webcam Feed
        </span>
        <Button variant="ghost" size="sm" onClick={startCamera} className="h-7 px-2">
          <RefreshCw className="h-3 w-3 mr-1" /> Retry
        </Button>
      </div>
    </div>
  );
}
