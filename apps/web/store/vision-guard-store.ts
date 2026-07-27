import { create } from 'zustand';
import {
  CameraHealthStatus,
  VisionEventRecord,
  WarningMode,
  CameraResolution
} from '@/types/vision-frontend.types';

export const DEFAULT_RESOLUTIONS: CameraResolution[] = [
  { width: 1280, height: 720, label: '720p HD (Recommended)' },
  { width: 1920, height: 1080, label: '1080p Full HD' },
  { width: 640, height: 480, label: '480p SD (Low Bandwidth)' }
];

interface VisionGuardState {
  cameraHealth: CameraHealthStatus;
  selectedDeviceId: string;
  selectedResolution: CameraResolution;
  isStreaming: boolean;
  warningMode: WarningMode;
  eventsTimeline: VisionEventRecord[];
  activeWarning: VisionEventRecord | null;

  setCameraHealth: (health: CameraHealthStatus) => void;
  setSelectedDeviceId: (deviceId: string) => void;
  setSelectedResolution: (resolution: CameraResolution) => void;
  setIsStreaming: (streaming: boolean) => void;
  setWarningMode: (mode: WarningMode) => void;
  addVisionEvent: (event: VisionEventRecord) => void;
  clearActiveWarning: () => void;
}

export const useVisionGuardStore = create<VisionGuardState>((set) => ({
  cameraHealth: 'INITIALIZING',
  selectedDeviceId: '',
  selectedResolution: DEFAULT_RESOLUTIONS[0],
  isStreaming: false,
  warningMode: 'BANNER',
  eventsTimeline: [],
  activeWarning: null,

  setCameraHealth: (health) => set({ cameraHealth: health }),
  setSelectedDeviceId: (deviceId) => set({ selectedDeviceId: deviceId }),
  setSelectedResolution: (resolution) => set({ selectedResolution: resolution }),
  setIsStreaming: (isStreaming) => set({ isStreaming }),
  setWarningMode: (warningMode) => set({ warningMode }),

  addVisionEvent: (event) =>
    set((state) => ({
      eventsTimeline: [event, ...state.eventsTimeline].slice(0, 50),
      activeWarning: event
    })),

  clearActiveWarning: () => set({ activeWarning: null })
}));
