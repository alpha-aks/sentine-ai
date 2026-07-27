'use client';

import React, { useState } from 'react';
import { mockDb } from '@/mocks/mock-database';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, RefreshCw, UserCheck, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

export function MockDeveloperBanner() {
  const isMockEnabled = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' || process.env.NEXT_PUBLIC_USE_MOCK_DATA === '1';
  const [mounted, setMounted] = React.useState(false);
  const [currentRole, setCurrentRole] = useState(mockDb.currentUserRole);
  const [collapsed, setCollapsed] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isMockEnabled) return null;

  const handleRoleChange = (roleKey: string) => {
    mockDb.switchRole(roleKey);
    setCurrentRole(roleKey);
    setMessage(`Switched active dev identity to ${roleKey}`);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleReset = () => {
    mockDb.resetData();
    setMessage('Mock Database reset to initial datasets!');
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-700 text-slate-100 px-4 py-2 text-xs font-mono shadow-2xl flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold px-2.5 py-0.5 flex items-center gap-1.5">
          <ShieldAlert className="h-3.5 w-3.5" /> MOCK DATA ACTIVE
        </Badge>

        {!collapsed && (
          <span className="hidden sm:inline-block text-slate-400">
            NEXT_PUBLIC_USE_MOCK_DATA=true | Intercepting Axios API Calls
          </span>
        )}

        {message && (
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> {message}
          </span>
        )}
      </div>

      {!collapsed && (
        <div className="flex items-center gap-2">
          <span className="text-slate-400 flex items-center gap-1">
            <UserCheck className="h-3.5 w-3.5 text-primary" /> Active Role:
          </span>
          <select
            value={currentRole}
            onChange={(e) => handleRoleChange(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="SUPER_ADMIN">SUPER_ADMIN (System Admin)</option>
            <option value="INSTITUTION_ADMIN">INSTITUTION_ADMIN (Sarah Connor)</option>
            <option value="FACULTY">FACULTY (Prof. Alan Turing)</option>
            <option value="PROCTOR">PROCTOR (David Proctor)</option>
            <option value="CANDIDATE">CANDIDATE / STUDENT (Tanishq Sharma)</option>
          </select>

          <Button variant="ghost" size="sm" onClick={handleReset} className="h-7 text-slate-300 hover:text-white hover:bg-slate-800 px-2">
            <RefreshCw className="h-3 w-3 mr-1" /> Reset DB
          </Button>
        </div>
      )}

      <button onClick={() => setCollapsed(!collapsed)} className="text-slate-400 hover:text-white p-1">
        {collapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
    </div>
  );
}
