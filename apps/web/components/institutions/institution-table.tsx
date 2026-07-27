'use client';

import * as React from 'react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Building2, MoreHorizontal, Eye, Edit, Trash2, Globe, Mail } from 'lucide-react';
import { Institution } from '@/services/institution.service';
import { useInstitutionStore } from '@/store/institution-store';
import { formatDateTime } from '@/utils/formatters';

interface InstitutionTableProps {
  data: Institution[];
  isLoading?: boolean;
}

export function InstitutionTable({ data, isLoading }: InstitutionTableProps) {
  const { selectedIds, toggleSelectId, selectAllIds, clearSelection, setDeleteDialogOpen } = useInstitutionStore();

  const allSelected = data.length > 0 && selectedIds.length === data.length;

  const handleSelectAll = () => {
    if (allSelected) {
      clearSelection();
    } else {
      selectAllIds(data.map((item) => item.id));
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">
        Loading academic institutions...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground border rounded-md">
        No institutions found matching criteria.
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox checked={allSelected} onCheckedChange={handleSelectAll} aria-label="Select all" />
            </TableHead>
            <TableHead>Institution</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Timezone</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-12 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((item) => {
            const isSelected = selectedIds.includes(item.id);

            return (
              <TableRow key={item.id} data-state={isSelected && 'selected'}>
                <TableCell>
                  <Checkbox checked={isSelected} onCheckedChange={() => toggleSelectId(item.id)} aria-label={`Select ${item.name}`} />
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div>
                      <Link href={`/institutions/${item.id}`} className="font-semibold text-foreground hover:underline">
                        {item.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">Code: {item.code} • Slug: {item.slug}</p>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {item.type}
                  </Badge>
                </TableCell>

                <TableCell>
                  <Badge
                    variant="secondary"
                    className={
                      item.status === 'ACTIVE'
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : item.status === 'SUSPENDED'
                        ? 'bg-amber-500/10 text-amber-600'
                        : 'bg-muted text-muted-foreground'
                    }
                  >
                    {item.status}
                  </Badge>
                </TableCell>

                <TableCell>
                  <div className="text-xs space-y-0.5">
                    <p className="flex items-center gap-1 text-muted-foreground"><Mail className="h-3 w-3" /> {item.contactEmail}</p>
                    {item.website && <p className="flex items-center gap-1 text-primary"><Globe className="h-3 w-3" /> {item.website}</p>}
                  </div>
                </TableCell>

                <TableCell className="text-xs text-muted-foreground font-mono">{item.timezone}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{formatDateTime(item.createdAt)}</TableCell>

                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/institutions/${item.id}`}>
                          <Eye className="mr-2 h-4 w-4" /> View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/institutions/${item.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" /> Edit Metadata
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setDeleteDialogOpen(true, item.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
