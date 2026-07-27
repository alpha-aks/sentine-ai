'use client';

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Course } from '@/services/institution.service';

export function CourseTable({ courses }: { courses: Course[] }) {
  if (courses.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground border rounded-md">
        No courses registered yet for this institution.
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Course Title</TableHead>
            <TableHead>Credits</TableHead>
            <TableHead>Description</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {courses.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="font-mono font-semibold">{c.code}</TableCell>
              <TableCell className="font-medium">{c.title}</TableCell>
              <TableCell className="font-mono">{c.credits} Credits</TableCell>
              <TableCell className="text-xs text-muted-foreground">{c.description || 'N/A'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
