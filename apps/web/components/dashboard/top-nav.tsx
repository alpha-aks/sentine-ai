'use client';

import * as React from 'react';
import { BreadcrumbNav } from './breadcrumb-nav';
import { QuickSearch } from './quick-search';
import { ThemeSwitch } from './theme-switch';
import { NotificationCenter } from './notification-center';
import { ProfileMenu } from './profile-menu';
import { MobileNav } from './mobile-nav';
import { FullscreenToggle } from './fullscreen-toggle';
import { useAuthStore } from '@/store/auth-store';
import { Badge } from '@/components/ui/badge';
import { Building2 } from 'lucide-react';

export function TopNav() {
  const user = useAuthStore((state) => state.user);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-card/80 px-4 backdrop-blur transition-all">
      <div className="flex items-center gap-4">
        <MobileNav />
        <BreadcrumbNav />
      </div>

      <div className="flex items-center gap-3">
        {user?.institutionSlug && (
          <Badge variant="outline" className="hidden lg:inline-flex items-center gap-1 text-xs font-medium">
            <Building2 className="h-3 w-3 text-primary" /> {user.institutionSlug.toUpperCase()}
          </Badge>
        )}

        <QuickSearch />
        <FullscreenToggle />
        <ThemeSwitch />
        <NotificationCenter />
        <div className="h-4 w-px bg-border hidden sm:block" />
        <ProfileMenu />
      </div>
    </header>
  );
}
