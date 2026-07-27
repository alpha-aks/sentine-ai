'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { Breadcrumb, BreadcrumbItem } from '@/components/ui/breadcrumb';

export function BreadcrumbNav() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  const items: BreadcrumbItem[] = [
    { label: 'Home', href: '/dashboard' }
  ];

  let accumulatedPath = '';
  segments.forEach((seg, idx) => {
    accumulatedPath += `/${seg}`;
    const isLast = idx === segments.length - 1;
    const label = seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ');

    items.push({
      label,
      href: isLast ? undefined : accumulatedPath
    });
  });

  return <Breadcrumb items={items} className="hidden md:flex" />;
}
