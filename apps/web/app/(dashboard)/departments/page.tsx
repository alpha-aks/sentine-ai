'use client';

import React from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { GraduationCap, Plus } from 'lucide-react';

export default function DepartmentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Departments"
        description="Organize academic departments and faculties"
        actions={
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" /> Create Department
          </Button>
        }
      />

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Department Name</TableHead>
              <TableHead>Head of Department</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-primary" /> CS
              </TableCell>
              <TableCell>Computer Science & Engineering</TableCell>
              <TableCell>Dr. Alan Turing</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
