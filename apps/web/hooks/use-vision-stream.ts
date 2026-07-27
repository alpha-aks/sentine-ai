import { useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';
import { useVisionGuardStore } from '@/store/vision-guard-store';
import { CameraDeviceInfo } from '@/types/vision-frontend.types';

const VISION_SERVICE_URL = process.env.NEXT_PUBLIC_VISION_GUARD_URL || 'http://localhost:4009';

export function useVisionStream(candidateId: string, candidateSessionId: string) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [devices, setDevices] = useState<CameraDeviceInfo[]>([]);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [currentFps, setCurrentFps] = useState(15);

  const {
    cameraHealth,
    setCameraHealth,
    selectedDeviceId,
    setSelectedDeviceId,
    selectedResolution,
    setIsStreaming,
    addVisionEvent
  } = useVisionGuardStore();

  // Enumerate video devices
  const refreshDevices = useCallback(async () => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices
        .filter((d) => d.kind === 'videoinput')
        .map((d) => ({
          deviceId: d.deviceId,
          label: d.label || `Camera (${d.deviceId.slice(0, 5)}...)`
        }));
      setDevices(videoDevices);
      if (videoDevices.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(videoDevices[0].deviceId);
      }
    } catch {
      // Ignore enumeration failure if permissions pending
    }
  }, [selectedDeviceId, setSelectedDeviceId]);

  // Request Camera Stream
  const startCamera = useCallback(async () => {
    setCameraHealth('INITIALIZING');
    setPermissionDenied(false);

    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
          width: { ideal: selectedResolution.width },
          height: { ideal: selectedResolution.height }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setCameraHealth('CONNECTED');
      setIsStreaming(true);
      refreshDevices();
    } catch (err: any) {
      setIsStreaming(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionDenied(true);
        setCameraHealth('DISCONNECTED');
      } else {
        setCameraHealth('BLOCKED');
      }
    }
  }, [selectedDeviceId, selectedResolution, setCameraHealth, setIsStreaming, refreshDevices]);

  // Stop Camera Stream
  const stopCamera = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
    setCameraHealth('DISCONNECTED');
  }, [setCameraHealth, setIsStreaming]);

  // Frame Throttling & Ingress Dispatch to Backend API
  useEffect(() => {
    if (cameraHealth !== 'CONNECTED' && cameraHealth !== 'STREAMING') return;

    const frameIntervalMs = Math.max(100, Math.floor(1000 / currentFps));

    intervalRef.current = setInterval(async () => {
      if (!videoRef.current || !streamRef.current) return;

      try {
        setCameraHealth('STREAMING');

        // Post frame metadata to Vision Guard service
        const response = await axios.post(
          `${VISION_SERVICE_URL}/api/v1/vision/frame`,
          {
            candidateId,
            candidateSessionId,
            timestamp: new Date().toISOString(),
            width: selectedResolution.width,
            height: selectedResolution.height,
            frameIndex: Math.floor(Date.now() / frameIntervalMs)
          },
          {
            headers: {
              'x-institution-id': 'inst_mit_01'
            }
          }
        );

        if (response.data?.success && response.data?.data?.eventsTriggered) {
          const events: string[] = response.data.data.eventsTriggered;
          for (const evType of events) {
            addVisionEvent({
              eventId: `ev_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
              eventType: evType as any,
              candidateId,
              candidateSessionId,
              timestamp: new Date().toISOString(),
              confidence: 0.94
            });
          }
        }
      } catch {
        setCameraHealth('LOW_FPS');
      }
    }, frameIntervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [cameraHealth, candidateId, candidateSessionId, selectedResolution, currentFps, addVisionEvent, setCameraHealth]);

  return {
    videoRef,
    devices,
    permissionDenied,
    startCamera,
    stopCamera,
    refreshDevices,
    currentFps,
    setCurrentFps
  };
}
