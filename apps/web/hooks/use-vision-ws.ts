import { useEffect, useRef, useState } from 'react';
import { useVisionGuardStore } from '@/store/vision-guard-store';

const WS_MONITORING_URL = process.env.NEXT_PUBLIC_WS_MONITORING_URL || 'ws://localhost:4008/ws/monitoring';

export function useVisionWS(candidateSessionId?: string) {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const { addVisionEvent } = useVisionGuardStore();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let isUnmounted = false;

    const connect = () => {
      if (isUnmounted) return;

      try {
        const ws = new WebSocket(WS_MONITORING_URL);
        wsRef.current = ws;

        ws.onopen = () => {
          if (isUnmounted) return;
          setIsConnected(true);
          if (candidateSessionId) {
            ws.send(JSON.stringify({ type: 'SUBSCRIBE', channel: `CANDIDATE_CHANNEL:${candidateSessionId}` }));
          }
        };

        ws.onmessage = (event) => {
          if (isUnmounted) return;
          try {
            const data = JSON.parse(event.data);
            if (data.type && data.type.startsWith('VISION_')) {
              const evType = data.type.replace('VISION_', '');
              addVisionEvent({
                eventId: data.payload?.eventId || `ev_${Date.now()}`,
                eventType: evType,
                candidateId: data.payload?.candidateId || 'cand_100',
                candidateSessionId: data.payload?.candidateSessionId || candidateSessionId || 'sess_100',
                timestamp: data.payload?.timestamp || new Date().toISOString(),
                confidence: data.payload?.confidence || 0.94,
                metadata: data.payload?.metadata
              });
            }
          } catch {
            // Ignore malformed frames
          }
        };

        ws.onclose = () => {
          if (!isUnmounted) {
            setIsConnected(false);
            setTimeout(connect, 3000);
          }
        };

        ws.onerror = () => {
          if (!isUnmounted) setIsConnected(false);
        };
      } catch {
        if (!isUnmounted) setIsConnected(false);
      }
    };

    connect();

    return () => {
      isUnmounted = true;
      if (wsRef.current) {
        wsRef.current.onopen = null;
        wsRef.current.onmessage = null;
        wsRef.current.onclose = null;
        wsRef.current.onerror = null;
        if (wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.close();
        }
      }
    };
  }, [candidateSessionId, addVisionEvent]);

  return { isConnected };
}
