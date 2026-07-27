'use client';

import React from 'react';
import Link from 'next/link';
import { ExamEntity } from '@/types/exam';
import { ExamStatusBadge } from './status-badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Eye, Edit3, Globe, Archive, Copy, Trash2, ShieldCheck, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface ExamTableProps {
  exams: ExamEntity[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
  onPublish?: (id: string) => void;
  onArchive?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
}

export function ExamTable({
  exams,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onPublish,
  onArchive,
  onDuplicate,
  onDelete,
  isLoading
}: ExamTableProps) {
  const allSelected = exams.length > 0 && exams.every((e) => selectedIds.includes(e.id));

  const handleSelectAllChange = (checked: boolean) => {
    if (checked) {
      onSelectAll(exams.map((e) => e.id));
    } else {
      onSelectAll([]);
    }
  };

  return (
    <div className="rounded-md border bg-card shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 border-b text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <tr>
              <th className="p-4 w-10 text-center">
                <Checkbox checked={allSelected} onCheckedChange={handleSelectAllChange} aria-label="Select all" />
              </th>
              <th className="p-4">Exam Specification</th>
              <th className="p-4">Type</th>
              <th className="p-4">Duration</th>
              <th className="p-4">Passing Score</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="p-4 text-center"><div className="h-4 w-4 bg-muted rounded mx-auto" /></td>
                  <td className="p-4"><div className="h-10 w-48 bg-muted rounded" /></td>
                  <td className="p-4"><div className="h-6 w-20 bg-muted rounded" /></td>
                  <td className="p-4"><div className="h-4 w-16 bg-muted rounded" /></td>
                  <td className="p-4"><div className="h-4 w-16 bg-muted rounded" /></td>
                  <td className="p-4"><div className="h-6 w-20 bg-muted rounded" /></td>
                  <td className="p-4 text-right"><div className="h-8 w-8 bg-muted rounded ml-auto" /></td>
                </tr>
              ))
            ) : exams.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground">
                  No exams found matching your query parameters.
                </td>
              </tr>
            ) : (
              exams.map((exam) => {
                const isSelected = selectedIds.includes(exam.id);
                return (
                  <tr key={exam.id} className={`hover:bg-muted/40 transition-colors ${isSelected ? 'bg-primary/5' : ''}`}>
                    <td className="p-4 text-center">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onToggleSelect(exam.id)}
                        aria-label={`Select ${exam.title}`}
                      />
                    </td>
                    <td className="p-4">
                      <div>
                        <Link href={`/exams/${exam.id}`} className="font-semibold text-foreground hover:underline flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-primary shrink-0" /> {exam.title}
                        </Link>
                        <div className="text-xs text-muted-foreground font-mono mt-0.5">{exam.code}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="text-xs font-mono">
                        {exam.type}
                      </Badge>
                    </td>
                    <td className="p-4 text-xs text-muted-foreground flex items-center gap-1.5 mt-2">
                      <Clock className="h-3.5 w-3.5" />
                      {exam.totalDurationMinutes} mins
                    </td>
                    <td className="p-4 text-xs font-semibold text-foreground">
                      {exam.passingPercentage}% ({exam.totalPoints} pts)
                    </td>
                    <td className="p-4">
                      <ExamStatusBadge status={exam.status} />
                    </td>
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Exam Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/exams/${exam.id}`} className="cursor-pointer">
                              <Eye className="mr-2 h-4 w-4 text-muted-foreground" /> Overview & Manage
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/exams/${exam.id}/edit`} className="cursor-pointer">
                              <Edit3 className="mr-2 h-4 w-4 text-muted-foreground" /> Edit Parameters
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/exams/${exam.id}/preview`} className="cursor-pointer">
                              <Eye className="mr-2 h-4 w-4 text-muted-foreground" /> Preview Exam Mode
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {onPublish && exam.status !== 'PUBLISHED' && (
                            <DropdownMenuItem onClick={() => onPublish(exam.id)}>
                              <Globe className="mr-2 h-4 w-4 text-primary" /> Publish Exam
                            </DropdownMenuItem>
                          )}
                          {onDuplicate && (
                            <DropdownMenuItem onClick={() => onDuplicate(exam.id)}>
                              <Copy className="mr-2 h-4 w-4 text-muted-foreground" /> Clone / Duplicate
                            </DropdownMenuItem>
                          )}
                          {onArchive && exam.status !== 'ARCHIVED' && (
                            <DropdownMenuItem onClick={() => onArchive(exam.id)} className="text-amber-400">
                              <Archive className="mr-2 h-4 w-4" /> Archive Exam
                            </DropdownMenuItem>
                          )}
                          {onDelete && (
                            <DropdownMenuItem onClick={() => onDelete(exam.id)} className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" /> Delete Exam
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
