import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { VisionHealthMetrics } from '@/types/vision-frontend.types';

const VISION_SERVICE_URL = process.env.NEXT_PUBLIC_VISION_GUARD_URL || 'http://localhost:4009';

export const visionGuardKeys = {
  all: ['vision-guard'] as const,
  status: () => [...visionGuardKeys.all, 'status'] as const,
  metrics: () => [...visionGuardKeys.all, 'metrics'] as const,
  config: () => [...visionGuardKeys.all, 'config'] as const
};

export function useVisionMetricsQuery() {
  return useQuery({
    queryKey: visionGuardKeys.metrics(),
    queryFn: async () => {
      const res = await axios.get(`${VISION_SERVICE_URL}/api/v1/vision/metrics`, {
        headers: { 'x-institution-id': 'inst_mit_01' }
      });
      return res.data.data as VisionHealthMetrics;
    },
    refetchInterval: 5000
  });
}

export function useVisionStatusQuery() {
  return useQuery({
    queryKey: visionGuardKeys.status(),
    queryFn: async () => {
      const res = await axios.get(`${VISION_SERVICE_URL}/api/v1/vision/status`, {
        headers: { 'x-institution-id': 'inst_mit_01' }
      });
      return res.data.data;
    },
    refetchInterval: 10000
  });
}
