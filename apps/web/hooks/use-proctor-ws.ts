import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { proctorMonitoringKeys } from './use-proctor-monitoring-query';
import { siteConfig } from '@/config/site-config';

export function useProctorWS(examId?: string, sessionId?: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const lastSequenceRef = useRef(0);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let reconnectTimer: NodeJS.Timeout;

    const connect = () => {
      try {
        const ws = new WebSocket('ws://localhost:4008/ws/monitoring');
        wsRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
          setIsOffline(false);

          // Transmit JWT AUTH token if present
          const token = localStorage.getItem(siteConfig.storageKeys.accessToken);
          if (token) {
            ws.send(JSON.stringify({ type: 'AUTH', token }));
          }

          // Auto-resubscribe active channels on reconnect
          if (examId) {
            ws.send(JSON.stringify({ type: 'SUBSCRIBE', channel: `EXAM_CHANNEL:${examId}` }));
          }

          if (sessionId) {
            ws.send(JSON.stringify({ type: 'SUBSCRIBE', channel: `CANDIDATE_CHANNEL:${sessionId}` }));
          }
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.type === 'BROADCAST') {
              // Sequence deduplication & out-of-order protection
              if (data.seq && data.seq <= lastSequenceRef.current) {
                return;
              }
              if (data.seq) {
                lastSequenceRef.current = data.seq;
              }

              // Invalidate TanStack Query cache dynamically
              queryClient.invalidateQueries({ queryKey: proctorMonitoringKeys.all });
            }
          } catch {
            // Ignore malformed WS frames
          }
        };

        ws.onclose = (evt) => {
          setIsConnected(false);
          if (evt.code !== 1000) {
            setIsOffline(true);
            reconnectTimer = setTimeout(connect, 5000);
          }
        };

        ws.onerror = () => {
          setIsConnected(false);
          setIsOffline(true);
        };
      } catch {
        setIsConnected(false);
        setIsOffline(true);
      }
    };

    connect();

    return () => {
      clearTimeout(reconnectTimer);
      if (wsRef.current) {
        wsRef.current.onopen = null;
        wsRef.current.onmessage = null;
        wsRef.current.onerror = null;
        wsRef.current.onclose = null;
        if (wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.close(1000, 'Unmount');
        } else if (wsRef.current.readyState === WebSocket.CONNECTING) {
          wsRef.current.close();
        }
        wsRef.current = null;
      }
    };
  }, [examId, sessionId, queryClient]);

  return { isConnected, isOffline };
}
