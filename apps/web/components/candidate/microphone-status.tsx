'use client';

import React, { useEffect, useState } from 'react';
import { Mic, MicOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function MicrophoneStatus() {
  const [level, setLevel] = useState(0);
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startMic = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 64;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      setActive(true);

      const updateVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
        setLevel(Math.min(100, Math.round((avg / 128) * 100)));
        requestAnimationFrame(updateVolume);
      };
      updateVolume();
    } catch {
      setError('Microphone access denied or unavailable.');
      setActive(false);
    }
  };

  useEffect(() => {
    startMic();
  }, []);

  return (
    <div className="space-y-2 max-w-xs">
      <div className="flex items-center justify-between text-xs font-semibold">
        <span className="flex items-center gap-1.5">
          {active ? <Mic className="h-4 w-4 text-emerald-400" /> : <MicOff className="h-4 w-4 text-destructive" />}
          Audio Level Meter
        </span>
        <Button variant="ghost" size="sm" onClick={startMic} className="h-7 px-2">
          <RefreshCw className="h-3 w-3 mr-1" /> Retry
        </Button>
      </div>

      <div className="h-3 w-full bg-muted rounded-full overflow-hidden border">
        <div
          className={`h-full transition-all duration-100 ${
            level > 70 ? 'bg-destructive' : level > 30 ? 'bg-amber-400' : 'bg-emerald-400'
          }`}
          style={{ width: `${level}%` }}
        />
      </div>
      {error && <div className="text-xs text-destructive">{error}</div>}
    </div>
  );
}
