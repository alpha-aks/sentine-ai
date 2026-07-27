'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InstitutionTable } from '@/components/institutions/institution-table';
import { DeleteConfirmationDialog } from '@/components/institutions/delete-confirmation-dialog';
import { institutionService, Institution } from '@/services/institution.service';
import { useInstitutionStore } from '@/store/institution-store';
import { Plus, Download, RefreshCw } from 'lucide-react';

export default function InstitutionsPage() {
  const [data, setData] = useState<Institution[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    isDeleteDialogOpen,
    setDeleteDialogOpen,
    activeInstitutionId
  } = useInstitutionStore();

  const fetchInstitutions = async () => {
    setIsLoading(true);
    try {
      const items = await institutionService.getAll();
      setData(items);
    } catch {
      // Fallback empty list
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const handleDelete = async () => {
    if (!activeInstitutionId) return;
    try {
      await institutionService.delete(activeInstitutionId);
      setData((prev) => prev.filter((item) => item.id !== activeInstitutionId));
      setDeleteDialogOpen(false);
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const safeData = Array.isArray(data) ? data : [];
  const filteredData = safeData.filter((item) => {
    if (!item) return false;
    const name = item.name || '';
    const code = item.code || '';
    const email = item.contactEmail || '';
    const matchesSearch =
      name.toLowerCase().includes((searchQuery || '').toLowerCase()) ||
      code.toLowerCase().includes((searchQuery || '').toLowerCase()) ||
      email.toLowerCase().includes((searchQuery || '').toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Institution Management"
        description="Provision, configure, and isolate academic tenant institutions"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchInstitutions}>
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
            <Button size="sm" asChild>
              <Link href="/institutions/new">
                <Plus className="mr-2 h-4 w-4" /> New Institution
              </Link>
            </Button>
          </div>
        }
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search institutions by name, code, email..." />
        <div className="w-full sm:w-48">
          <Select value={statusFilter} onValueChange={(val: any) => setStatusFilter(val)}>
            <SelectTrigger>
              <SelectValue placeholder="Status Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="ACTIVE">Active Only</SelectItem>
              <SelectItem value="SUSPENDED">Suspended</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <InstitutionTable data={filteredData} isLoading={isLoading} />

      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => setDeleteDialogOpen(open)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
