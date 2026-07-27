'use client';

import React from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users } from 'lucide-react';

export default function FacultyPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Faculty" description="Instructor and proctor staff roster" />
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Faculty Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" /> Dr. Grace Hopper
              </TableCell>
              <TableCell>grace@institution.edu</TableCell>
              <TableCell>PROCTOR_SUPERVISOR</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
