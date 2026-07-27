'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, ChevronLeft, ChevronRight, LayoutDashboard, FileSpreadsheet, HelpCircle, Database, Building2, GraduationCap, BookOpen, Users, Users2, BarChart3, FileText, Settings, Activity } from 'lucide-react';
import { mainNavigation, NavItem } from '@/config/routes-config';
import { usePermission } from '@/hooks/use-permission';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="h-4 w-4 shrink-0" />,
  Shield: <Shield className="h-4 w-4 shrink-0" />,
  FileSpreadsheet: <FileSpreadsheet className="h-4 w-4 shrink-0" />,
  HelpCircle: <HelpCircle className="h-4 w-4 shrink-0" />,
  Database: <Database className="h-4 w-4 shrink-0" />,
  Activity: <Activity className="h-4 w-4 shrink-0" />,
  Building2: <Building2 className="h-4 w-4 shrink-0" />,
  GraduationCap: <GraduationCap className="h-4 w-4 shrink-0" />,
  BookOpen: <BookOpen className="h-4 w-4 shrink-0" />,
  Users: <Users className="h-4 w-4 shrink-0" />,
  Users2: <Users2 className="h-4 w-4 shrink-0" />,
  BarChart3: <BarChart3 className="h-4 w-4 shrink-0" />,
  FileText: <FileText className="h-4 w-4 shrink-0" />,
  Settings: <Settings className="h-4 w-4 shrink-0" />
};

export function Sidebar() {
  const [collapsed, setCollapsed] = React.useState(false);
  const pathname = usePathname();
  const { hasRole } = usePermission();

  return (
    <aside
      aria-label="Main Navigation"
      className={cn(
        'hidden md:flex flex-col border-r bg-card text-card-foreground transition-all duration-300 relative z-20',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2 overflow-hidden">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow">
            <Shield className="h-5 w-5" />
          </div>
          {!collapsed && (
            <span className="font-bold text-base whitespace-nowrap tracking-tight">SentinelAI</span>
          )}
        </Link>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {mainNavigation.map((item: NavItem) => {
          if (item.roles && !hasRole(item.roles)) return null;

          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(`${item.href}`));
          const icon = item.icon ? iconMap[item.icon] : null;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors relative group',
                isActive
                  ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              {icon}
              {!collapsed && <span className="truncate">{item.title}</span>}

              {/* Tooltip for collapsed view */}
              {collapsed && (
                <div className="absolute left-full ml-2 hidden rounded-md bg-popover px-2.5 py-1 text-xs text-popover-foreground shadow-md group-hover:block whitespace-nowrap z-50">
                  {item.title}
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      {!collapsed && (
        <div className="border-t p-3 text-center text-xs text-muted-foreground">
          v1.0.0 • Enterprise Integrity
        </div>
      )}
    </aside>
  );
}
