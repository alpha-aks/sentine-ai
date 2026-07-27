'use client';

import React from 'react';
import Link from 'next/link';
import { QuestionEntity } from '@/types/question';
import { TypeBadge } from './type-badge';
import { DifficultyBadge } from './difficulty-badge';
import { StatusBadge } from './status-badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Eye, Edit3, Trash2, CheckCircle2, MoreHorizontal, HelpCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface QuestionTableProps {
  questions: QuestionEntity[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
  onApprove?: (id: string) => void;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
}

export function QuestionTable({
  questions,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onApprove,
  onDelete,
  isLoading
}: QuestionTableProps) {
  const allSelected = questions.length > 0 && questions.every((q) => selectedIds.includes(q.id));

  const handleSelectAllChange = (checked: boolean) => {
    if (checked) {
      onSelectAll(questions.map((q) => q.id));
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
              <th className="p-4">Question Prompt</th>
              <th className="p-4">Type</th>
              <th className="p-4">Difficulty</th>
              <th className="p-4">Marks</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="p-4 text-center"><div className="h-4 w-4 bg-muted rounded mx-auto" /></td>
                  <td className="p-4"><div className="h-10 w-64 bg-muted rounded" /></td>
                  <td className="p-4"><div className="h-6 w-24 bg-muted rounded" /></td>
                  <td className="p-4"><div className="h-6 w-16 bg-muted rounded" /></td>
                  <td className="p-4"><div className="h-4 w-12 bg-muted rounded" /></td>
                  <td className="p-4"><div className="h-6 w-20 bg-muted rounded" /></td>
                  <td className="p-4 text-right"><div className="h-8 w-8 bg-muted rounded ml-auto" /></td>
                </tr>
              ))
            ) : questions.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground">
                  No questions found in the bank matching your search criteria.
                </td>
              </tr>
            ) : (
              questions.map((question) => {
                const isSelected = selectedIds.includes(question.id);
                return (
                  <tr key={question.id} className={`hover:bg-muted/40 transition-colors ${isSelected ? 'bg-primary/5' : ''}`}>
                    <td className="p-4 text-center">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onToggleSelect(question.id)}
                        aria-label={`Select ${question.title}`}
                      />
                    </td>
                    <td className="p-4">
                      <div>
                        <Link href={`/questions/${question.id}`} className="font-semibold text-foreground hover:underline flex items-center gap-2">
                          <HelpCircle className="h-4 w-4 text-primary shrink-0" /> {question.title}
                        </Link>
                        <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{question.body}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <TypeBadge type={question.type} />
                    </td>
                    <td className="p-4">
                      <DifficultyBadge difficulty={question.difficulty} />
                    </td>
                    <td className="p-4 text-xs font-semibold text-foreground">
                      {question.marks} pts {question.negativeMarks > 0 && <span className="text-destructive">(-{question.negativeMarks})</span>}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={question.status} />
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
                          <DropdownMenuLabel>Question Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/questions/${question.id}`} className="cursor-pointer">
                              <Eye className="mr-2 h-4 w-4 text-muted-foreground" /> Overview & Preview
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/questions/${question.id}/edit`} className="cursor-pointer">
                              <Edit3 className="mr-2 h-4 w-4 text-muted-foreground" /> Edit Content
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {onApprove && question.status !== 'APPROVED' && (
                            <DropdownMenuItem onClick={() => onApprove(question.id)}>
                              <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-400" /> Approve Question
                            </DropdownMenuItem>
                          )}
                          {onDelete && (
                            <DropdownMenuItem onClick={() => onDelete(question.id)} className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" /> Delete Question
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
