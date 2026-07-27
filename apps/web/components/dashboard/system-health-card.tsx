'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Server } from 'lucide-react';

interface ServiceHealthStatus {
  name: string;
  port: number;
  status: 'HEALTHY' | 'DEGRADED' | 'OFFLINE';
  latencyMs: number;
}

const services: ServiceHealthStatus[] = [
  { name: 'Auth Service', port: 4001, status: 'HEALTHY', latencyMs: 12 },
  { name: 'User Service', port: 4002, status: 'HEALTHY', latencyMs: 15 },
  { name: 'Institution Service', port: 4003, status: 'HEALTHY', latencyMs: 18 },
  { name: 'Exam Service', port: 4004, status: 'HEALTHY', latencyMs: 14 },
  { name: 'Question Service', port: 4005, status: 'HEALTHY', latencyMs: 22 },
  { name: 'Session Service', port: 4006, status: 'HEALTHY', latencyMs: 10 },
  { name: 'Submission Service', port: 4007, status: 'HEALTHY', latencyMs: 16 }
];

export function SystemHealthCard() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <Server className="h-4 w-4 text-primary" />
          <CardTitle className="text-base font-semibold">System & Microservices Health</CardTitle>
        </div>
        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
          <Activity className="mr-1 h-3 w-3 animate-pulse" /> 100% OPERATIONAL
        </Badge>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid gap-2 sm:grid-cols-2">
          {services.map((s) => (
            <div key={s.name} className="flex items-center justify-between rounded-md border bg-muted/30 p-2.5 text-xs">
              <div>
                <p className="font-semibold text-foreground">{s.name}</p>
                <p className="text-[10px] text-muted-foreground">Port {s.port} • {s.latencyMs}ms latency</p>
              </div>
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
