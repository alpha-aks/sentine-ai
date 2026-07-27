'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SearchInput } from '@/components/ui/search-input';
import { Badge } from '@/components/ui/badge';
import { Activity } from 'lucide-react';

export default function CandidateSessionsPage() {
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Candidate Sessions"
        description="Monitor real-time live candidate proctoring sessions and presence state"
      />

      <div className="flex items-center justify-between gap-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search candidate sessions..." />
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Session ID</TableHead>
              <TableHead>Candidate</TableHead>
              <TableHead>Exam</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Integrity Flags</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary animate-pulse" /> sess_8912
              </TableCell>
              <TableCell>Tam (glitchivy8275@gmail.com)</TableCell>
              <TableCell>CS101 Midterm Exam</TableCell>
              <TableCell>
                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">IN_PROGRESS</Badge>
              </TableCell>
              <TableCell>0 Flags</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
