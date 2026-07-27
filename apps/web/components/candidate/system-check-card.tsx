'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';

interface CheckItemProps {
  label: string;
  passed: boolean;
  detail?: string;
}

function CheckItem({ label, passed, detail }: CheckItemProps) {
  return (
    <div className="flex items-center justify-between p-3 rounded-md border bg-muted/20 text-xs">
      <div className="flex items-center gap-2">
        {passed ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
        ) : (
          <XCircle className="h-4 w-4 text-destructive shrink-0" />
        )}
        <span className="font-medium text-foreground">{label}</span>
      </div>
      {detail && <span className="font-mono text-muted-foreground">{detail}</span>}
    </div>
  );
}

interface SystemCheckCardProps {
  results: {
    browserSupported: boolean;
    browserName: string;
    cameraAvailable: boolean;
    microphoneAvailable: boolean;
    internetConnected: boolean;
    downloadSpeedMbps: number;
    webRtcSupported: boolean;
    fullscreenCapable: boolean;
    cookiesEnabled: boolean;
    localStorageEnabled: boolean;
  };
}

export function SystemCheckCard({ results }: SystemCheckCardProps) {
  return (
    <Card className="border shadow-xs">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" /> System Compatibility & Hardware Diagnostics
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        <CheckItem label="Browser Support" passed={results.browserSupported} detail={results.browserName} />
        <CheckItem label="Webcam Hardware" passed={results.cameraAvailable} detail={results.cameraAvailable ? 'Connected' : 'Missing'} />
        <CheckItem label="Microphone Input" passed={results.microphoneAvailable} detail={results.microphoneAvailable ? 'Connected' : 'Missing'} />
        <CheckItem label="Internet Speed & Latency" passed={results.internetConnected} detail={`${results.downloadSpeedMbps} Mbps`} />
        <CheckItem label="WebRTC Peer Connection" passed={results.webRtcSupported} detail={results.webRtcSupported ? 'Enabled' : 'Disabled'} />
        <CheckItem label="Fullscreen Capability" passed={results.fullscreenCapable} detail={results.fullscreenCapable ? 'Supported' : 'Blocked'} />
        <CheckItem label="Browser Cookies" passed={results.cookiesEnabled} detail={results.cookiesEnabled ? 'Enabled' : 'Disabled'} />
        <CheckItem label="Local Storage" passed={results.localStorageEnabled} detail={results.localStorageEnabled ? 'Enabled' : 'Disabled'} />
      </CardContent>
    </Card>
  );
}
