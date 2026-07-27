'use client';

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Department } from '@/services/institution.service';

export function DepartmentTable({ departments }: { departments: Department[] }) {
  if (departments.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground border rounded-md">
        No departments created yet for this institution.
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Department Name</TableHead>
            <TableHead>Department Head</TableHead>
            <TableHead>Contact Email</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {departments.map((dept) => (
            <TableRow key={dept.id}>
              <TableCell className="font-mono font-semibold">{dept.code}</TableCell>
              <TableCell className="font-medium">{dept.name}</TableCell>
              <TableCell>{dept.headName || 'Unassigned'}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{dept.contactEmail || 'N/A'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
