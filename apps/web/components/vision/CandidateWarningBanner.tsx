import React from 'react';
import { useVisionGuardStore } from '@/store/vision-guard-store';
import { AlertTriangle, X } from 'lucide-react';

export function CandidateWarningBanner() {
  const { activeWarning, warningMode, clearActiveWarning } = useVisionGuardStore();

  if (!activeWarning || warningMode === 'SILENT') return null;

  const getWarningMessage = () => {
    switch (activeWarning.eventType) {
      case 'PHONE_DETECTED':
        return 'UNAUTHORIZED OBJECT DETECTED: Secondary phone object flagged in camera view. Please remove mobile devices immediately.';
      case 'MULTIPLE_FACES':
      case 'SECOND_PERSON':
        return 'MULTIPLE PEOPLE DETECTED: Secondary face identified in background. Ensure you are alone during the exam session.';
      case 'NO_FACE':
        return 'FACE NOT DETECTED: Candidate face missing from webcam view. Position yourself directly in front of the camera.';
      case 'LOOKING_AWAY':
        return 'GAZE DEVIATION FLAGGED: Head pose vector turned away from primary screen. Maintain screen focus.';
      case 'CAMERA_BLOCKED':
        return 'CAMERA FEED BLOCKED: Video feed obscured or lens covered. Unblock your camera immediately.';
      default:
        return `PROCTORING ALERT: ${activeWarning.eventType.replace('_', ' ')} detected during monitoring session.`;
    }
  };

  if (warningMode === 'POPUP') {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-card border-2 border-rose-500 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
          <div className="flex items-center gap-3 text-rose-500 font-bold text-lg">
            <AlertTriangle className="h-6 w-6 animate-bounce" />
            <span>AI Vision Proctoring Flag</span>
          </div>
          <p className="text-sm text-foreground leading-relaxed">
            {getWarningMessage()}
          </p>
          <div className="pt-2 flex justify-end">
            <button
              onClick={clearActiveWarning}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-all"
            >
              I Understand & Acknowledge
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-rose-500/15 border-b border-rose-500/30 text-rose-300 px-6 py-3 flex items-center justify-between animate-in slide-in-from-top duration-200">
      <div className="flex items-center gap-3 text-xs font-semibold">
        <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 animate-pulse" />
        <span>{getWarningMessage()}</span>
      </div>
      <button
        onClick={clearActiveWarning}
        className="p-1 rounded-lg hover:bg-rose-500/20 text-rose-300 transition-all"
        aria-label="Dismiss warning"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
