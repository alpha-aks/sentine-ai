'use client';

import React from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { BookOpen, Plus } from 'lucide-react';

export default function CoursesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Courses"
        description="Academic courses and curriculum catalog"
        actions={
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" /> Add Course
          </Button>
        }
      />

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Course Title</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Credits</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" /> CS101
              </TableCell>
              <TableCell>Introduction to Algorithms</TableCell>
              <TableCell>Computer Science</TableCell>
              <TableCell>4</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
