import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CameraHealthBadge } from '../../components/vision/CameraHealthBadge';
import { CameraStatusIndicator } from '../../components/vision/CameraStatusIndicator';
import { VisionEventBadge } from '../../components/vision/VisionEventBadge';
import { FrameRateIndicator } from '../../components/vision/FrameRateIndicator';
import { StreamingIndicator } from '../../components/vision/StreamingIndicator';
import { PrivacyNotice } from '../../components/vision/PrivacyNotice';
import { CandidateWarningBanner } from '../../components/vision/CandidateWarningBanner';
import { VisionEventTimeline } from '../../components/vision/VisionEventTimeline';
import { DetectionHistory } from '../../components/vision/DetectionHistory';
import { useVisionGuardStore } from '../../store/vision-guard-store';

describe('Vision Guard Frontend Component Test Suite', () => {
  beforeEach(() => {
    useVisionGuardStore.setState({
      cameraHealth: 'CONNECTED',
      isStreaming: true,
      eventsTimeline: [],
      activeWarning: null,
      warningMode: 'BANNER'
    });
  });

  describe('1. Camera Health & Status Indicators', () => {
    it('1.1 Renders CameraHealthBadge with CONNECTED status', () => {
      render(<CameraHealthBadge status="CONNECTED" />);
      expect(screen.getByText('CONNECTED')).toBeInTheDocument();
    });

    it('1.2 Renders CameraStatusIndicator with Live indicator', () => {
      render(<CameraStatusIndicator status="STREAMING" />);
      expect(screen.getByText('Camera Live')).toBeInTheDocument();
    });

    it('1.3 Renders FrameRateIndicator with FPS and latency telemetry', () => {
      render(<FrameRateIndicator fps={30} latencyMs={14} />);
      expect(screen.getByText('FPS: 30')).toBeInTheDocument();
      expect(screen.getByText('14ms')).toBeInTheDocument();
    });

    it('1.4 Renders StreamingIndicator when streaming live', () => {
      render(<StreamingIndicator isStreaming={true} />);
      expect(screen.getByText('STREAMING LIVE')).toBeInTheDocument();
    });
  });

  describe('2. Vision Event & Warning System', () => {
    it('2.1 Renders VisionEventBadge for PHONE_DETECTED event', () => {
      render(<VisionEventBadge eventType="PHONE_DETECTED" />);
      expect(screen.getByText('Phone Detected')).toBeInTheDocument();
    });

    it('2.2 Renders PrivacyNotice disclaimers correctly', () => {
      render(<PrivacyNotice />);
      expect(screen.getByText('Candidate Privacy & Security Disclaimer')).toBeInTheDocument();
      expect(screen.getByText('Camera Monitoring Active')).toBeInTheDocument();
    });

    it('2.3 Displays CandidateWarningBanner when active warning is present', () => {
      useVisionGuardStore.setState({
        activeWarning: {
          eventId: 'ev_test_1',
          eventType: 'PHONE_DETECTED',
          candidateId: 'cand_100',
          candidateSessionId: 'sess_100',
          timestamp: new Date().toISOString(),
          confidence: 0.95
        },
        warningMode: 'BANNER'
      });

      render(<CandidateWarningBanner />);
      expect(screen.getByText(/UNAUTHORIZED OBJECT DETECTED/i)).toBeInTheDocument();
    });
  });

  describe('3. Timeline & Detection History', () => {
    it('3.1 Renders VisionEventTimeline with detection records', () => {
      const mockEvents = [
        {
          eventId: 'ev_1',
          eventType: 'PHONE_DETECTED' as const,
          candidateId: 'cand_100',
          candidateSessionId: 'sess_100',
          timestamp: new Date().toISOString(),
          confidence: 0.94
        }
      ];

      render(<VisionEventTimeline events={mockEvents} />);
      expect(screen.getByText('Phone Detected')).toBeInTheDocument();
    });

    it('3.2 Renders DetectionHistory table with confidence scores', () => {
      const mockEvents = [
        {
          eventId: 'ev_2',
          eventType: 'LOOKING_AWAY' as const,
          candidateId: 'cand_100',
          candidateSessionId: 'sess_100',
          timestamp: new Date().toISOString(),
          confidence: 0.92
        }
      ];

      render(<DetectionHistory events={mockEvents} />);
      expect(screen.getByText('LOOKING AWAY')).toBeInTheDocument();
      expect(screen.getByText('92%')).toBeInTheDocument();
    });
  });
});
