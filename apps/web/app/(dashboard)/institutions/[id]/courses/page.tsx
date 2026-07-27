'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CourseTable } from '@/components/institutions/course-table';
import { CourseDialog } from '@/components/institutions/course-dialog';
import { institutionService, Course } from '@/services/institution.service';
import { Plus } from 'lucide-react';

export default function CoursesPage() {
  const params = useParams();
  const id = params?.id as string;
  const [courses, setCourses] = useState<Course[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = async () => {
    if (!id) return;
    try {
      const items = await institutionService.getCourses(id);
      setCourses(Array.isArray(items) ? items : []);
    } catch {
      setCourses([]);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [id]);

  const handleCreate = async (data: { code: string; title: string; credits: number; description?: string }) => {
    if (!id) return;
    setError(null);
    try {
      const created = await institutionService.createCourse(id, {
        departmentId: 'dept_default',
        ...data
      });
      setCourses((prev) => [...(Array.isArray(prev) ? prev : []), created]);
    } catch (err: any) {
      console.error('Failed to create course', err);
      const msg = err.message || 'Failed to register course. Please check fields and try again.';
      setError(msg);
      throw new Error(msg);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Course Catalog"
        description="Manage academic courses, credit hours, and exam specifications"
        actions={
          <Button size="sm" onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Course
          </Button>
        }
      />

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <CourseTable courses={courses} />

      <CourseDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} onSubmit={handleCreate} />
    </div>
  );
}
