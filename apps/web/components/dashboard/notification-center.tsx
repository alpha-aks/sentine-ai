'use client';

import * as React from 'react';
import { Bell, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useNotificationStore } from '@/store/notification-store';
import { formatDateTime } from '@/utils/formatters';

export function NotificationCenter() {
  const { notifications, clearAll } = useNotificationStore();
  const unreadCount = notifications.length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b p-3">
          <h4 className="text-sm font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <button
              onClick={clearAll}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <Check className="h-3 w-3" /> Clear all
            </button>
          )}
        </div>

        <div className="max-h-72 overflow-y-auto p-2">
          {notifications.length === 0 ? (
            <p className="p-4 text-center text-xs text-muted-foreground">No recent notifications</p>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className="mb-1 rounded-md p-2 hover:bg-muted/50 transition-colors">
                <p className="text-xs font-semibold text-foreground">{n.title}</p>
                {n.message && <p className="text-[11px] text-muted-foreground mt-0.5">{n.message}</p>}
                <span className="text-[10px] text-muted-foreground/70 mt-1 block">{formatDateTime(n.timestamp)}</span>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
