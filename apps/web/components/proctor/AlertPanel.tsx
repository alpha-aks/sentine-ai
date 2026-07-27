'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertEntity, AlertStatus } from '@/services/proctor-monitoring.service';
import { useUpdateAlertStatusMutation } from '@/hooks/use-proctor-monitoring-query';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

interface AlertPanelProps {
  alerts?: AlertEntity[];
}

export function AlertPanel({ alerts = [] }: AlertPanelProps) {
  const alertList = Array.isArray(alerts) ? alerts : (alerts as any)?.items || [];
  const updateStatusMutation = useUpdateAlertStatusMutation();

  const handleUpdate = (alertId: string, status: AlertStatus) => {
    updateStatusMutation.mutate({ alertId, status, notes: `Status updated to ${status} via Proctor Alert Panel` });
  };

  if (alertList.length === 0) {
    return (
      <Card className="border shadow-xs bg-card">
        <CardContent className="p-8 text-center text-xs text-muted-foreground">
          No incident alerts logged.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {alertList.map((alert: AlertEntity) => {
        const isCritical = alert.priority === 'CRITICAL' || alert.priority === 'HIGH';
        const isResolved = alert.status === 'RESOLVED';

        return (
          <Card key={alert.alertId} className={`border shadow-xs bg-card ${isCritical && !isResolved ? 'border-rose-500/40 bg-rose-500/5' : ''}`}>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <AlertTriangle className={`h-4 w-4 ${isCritical ? 'text-rose-400' : 'text-amber-400'}`} />
                <span>{alert.title}</span>
              </CardTitle>

              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] font-mono text-rose-400 border-rose-500/30">
                  {alert.priority}
                </Badge>
                <Badge variant="outline" className="text-[10px] font-mono text-emerald-400 border-emerald-500/30">
                  STATUS: {alert.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-1 text-xs">
              <p className="text-muted-foreground leading-relaxed">{alert.description}</p>

              <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono border-t pt-2">
                <div>Category: <strong className="text-foreground">{alert.category}</strong></div>
                <div>Created: <strong className="text-foreground">{alert.createdAt ? new Date(alert.createdAt).toLocaleTimeString() : 'Just now'}</strong></div>
              </div>

              {!isResolved && (
                <div className="flex justify-end gap-2 pt-1 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs text-sky-400 border-sky-500/30 hover:bg-sky-500/10"
                    onClick={() => handleUpdate(alert.alertId, 'ACKNOWLEDGED')}
                  >
                    Acknowledge
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
                    onClick={() => handleUpdate(alert.alertId, 'ESCALATED')}
                  >
                    Escalate
                  </Button>
                  <Button
                    size="sm"
                    className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                    onClick={() => handleUpdate(alert.alertId, 'RESOLVED')}
                  >
                    <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Resolve Alert
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
