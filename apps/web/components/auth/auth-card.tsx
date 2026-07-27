import * as React from 'react';
import { Shield } from 'lucide-react';
import { ThemeSwitch } from '@/components/dashboard/theme-switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AuthCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-background p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <header className="flex items-center justify-between w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow">
            <Shield className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg tracking-tight">SentinelAI</span>
        </div>
        <ThemeSwitch />
      </header>

      {/* Main Form Card */}
      <main className="flex flex-1 items-center justify-center py-10">
        <Card className="w-full max-w-md border-border shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-muted-foreground">
        © 2026 SentinelAI Inc. Autonomous Multi-Agent Exam Integrity Platform. All rights reserved.
      </footer>
    </div>
  );
}
