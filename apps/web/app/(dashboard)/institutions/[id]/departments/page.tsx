'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DepartmentTable } from '@/components/institutions/department-table';
import { DepartmentDialog } from '@/components/institutions/department-dialog';
import { institutionService, Department } from '@/services/institution.service';
import { Plus } from 'lucide-react';

export default function DepartmentsPage() {
  const params = useParams();
  const id = params?.id as string;
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDepartments = async () => {
    if (!id) return;
    try {
      const items = await institutionService.getDepartments(id);
      setDepartments(Array.isArray(items) ? items : []);
    } catch {
      setDepartments([]);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [id]);

  const handleCreate = async (data: { name: string; code: string; headName?: string; contactEmail?: string }) => {
    if (!id) return;
    setError(null);
    try {
      const created = await institutionService.createDepartment(id, data);
      setDepartments((prev) => [...(Array.isArray(prev) ? prev : []), created]);
    } catch (err: any) {
      console.error('Failed to create department', err);
      const msg = err.message || 'Failed to create department. Please verify fields and try again.';
      setError(msg);
      throw new Error(msg);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academic Departments"
        description="Manage organizational departments and faculty leads"
        actions={
          <Button size="sm" onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Department
          </Button>
        }
      />

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <DepartmentTable departments={departments} />

      <DepartmentDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} onSubmit={handleCreate} />
    </div>
  );
}
