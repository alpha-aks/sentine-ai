import React, { useState } from 'react';
import { CameraHealthBadge } from './CameraHealthBadge';
import { FrameRateIndicator } from './FrameRateIndicator';
import { CameraHealthStatus, CameraResolution } from '@/types/vision-frontend.types';
import { Maximize2, Minimize2, Video, Sun } from 'lucide-react';

interface CameraPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement | null> | any;
  healthStatus: CameraHealthStatus;
  selectedResolution: CameraResolution;
  resolutions: CameraResolution[];
  onResolutionChange: (resolution: CameraResolution) => void;
  fps?: number;
}

export function CameraPreview({
  videoRef,
  healthStatus,
  selectedResolution,
  resolutions,
  onResolutionChange,
  fps = 15
}: CameraPreviewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isLive = ['CONNECTED', 'STREAMING'].includes(healthStatus);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-border bg-black transition-all ${
      isFullscreen ? 'fixed inset-4 z-50 shadow-2xl' : 'w-full aspect-video'
    }`}>
      {/* Real Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover transform -scale-x-100 ${isLive ? 'block' : 'hidden'}`}
      />

      {/* Camera Off / Waiting Placeholder */}
      {!isLive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-3 bg-card/90">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
            <Video className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <div className="font-semibold text-sm text-foreground">Camera Preview Offline</div>
            <p className="text-xs text-muted-foreground max-w-xs">
              Grant camera permissions or check device connections to activate live vision stream.
            </p>
          </div>
        </div>
      )}

      {/* Top Controls Bar Overlay */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
        <CameraHealthBadge status={healthStatus} />

        <div className="flex items-center gap-2">
          {/* Resolution Picker */}
          <select
            value={selectedResolution.width}
            onChange={(e) => {
              const found = resolutions.find((r) => r.width === Number(e.target.value));
              if (found) onResolutionChange(found);
            }}
            className="bg-black/60 backdrop-blur-md text-white border border-white/10 text-xs px-2.5 py-1 rounded-lg focus:outline-hidden"
          >
            {resolutions.map((res) => (
              <option key={res.width} value={res.width} className="bg-card text-foreground">
                {res.label}
              </option>
            ))}
          </select>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-white hover:bg-black/80 transition-all"
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Bottom Telemetry Overlay */}
      {isLive && (
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10">
          <FrameRateIndicator fps={fps} />

          <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-lg text-[11px] text-amber-400">
            <Sun className="h-3.5 w-3.5" />
            <span>Optimal Lighting</span>
          </div>
        </div>
      )}
    </div>
  );
}
