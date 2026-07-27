'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { institutionService, FacultyMember } from '@/services/institution.service';

export default function FacultyPage() {
  const params = useParams();
  const id = params?.id as string;
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);

  useEffect(() => {
    if (!id) return;
    institutionService
      .getFaculty(id)
      .then((items) => setFaculty(items))
      .catch(() => setFaculty([]));
  }, [id]);

  return (
    <div className="space-y-6">
      <PageHeader title="Faculty & Staff Roster" description="Manage department instructors, proctors, and course coordinators" />
      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Full Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Specialization</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {faculty.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground p-6">
                  No faculty assigned yet.
                </TableCell>
              </TableRow>
            ) : (
              faculty.map((f) => (
                <TableRow key={f.id}>
                  <TableCell className="font-medium">{f.fullName}</TableCell>
                  <TableCell>{f.email}</TableCell>
                  <TableCell>{f.role}</TableCell>
                  <TableCell>{f.specialization || 'General'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
