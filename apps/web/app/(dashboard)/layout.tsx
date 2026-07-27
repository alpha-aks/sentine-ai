'use client';

import React from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { TopNav } from '@/components/dashboard/top-nav';
import { Container } from '@/components/layout/container';
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-x-hidden">
          <TopNav />
          <main className="flex-1 py-6">
            <Container>{children}</Container>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
