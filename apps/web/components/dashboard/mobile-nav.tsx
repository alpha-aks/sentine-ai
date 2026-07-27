'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Shield } from 'lucide-react';
import { Drawer } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { mainNavigation } from '@/config/routes-config';
import { usePermission } from '@/hooks/use-permission';
import { cn } from '@/lib/utils';

export function MobileNav() {
  const [isOpen, setIsOpen] = React.useState(false);
  const pathname = usePathname();
  const { hasRole } = usePermission();

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="md:hidden h-9 w-9"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)} side="left" className="w-72">
        <div className="flex items-center gap-2 mb-6 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Shield className="h-5 w-5" />
          </div>
          <span className="font-bold text-base">SentinelAI</span>
        </div>

        <nav className="flex flex-col gap-1">
          {mainNavigation.map((item) => {
            if (item.roles && !hasRole(item.roles)) return null;

            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground font-semibold'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </Drawer>
    </>
  );
}
