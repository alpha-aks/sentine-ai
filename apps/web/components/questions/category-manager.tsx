'use client';

import React, { useState } from 'react';
import { QuestionCategoryEntity } from '@/types/question';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Folder, Plus, Trash2, Loader2 } from 'lucide-react';

interface CategoryManagerProps {
  categories: QuestionCategoryEntity[];
  onCreate: (name: string, description?: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function CategoryManager({ categories, onCreate, onDelete }: CategoryManagerProps) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setIsSubmitting(true);
    try {
      await onCreate(name, desc);
      setName('');
      setDesc('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Folder className="h-5 w-5 text-primary" /> Create New Taxonomy Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex flex-wrap gap-3">
            <Input
              placeholder="Category Name (e.g. Algorithms)..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 min-w-[200px]"
              required
            />
            <Input
              placeholder="Short Description..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="flex-1 min-w-[200px]"
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Add Category
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <div key={cat.categoryId} className="p-4 rounded-md border bg-card flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <Folder className="h-5 w-5 text-primary shrink-0" />
              <div>
                <div className="font-semibold text-sm">{cat.name}</div>
                {cat.description && <div className="text-xs text-muted-foreground">{cat.description}</div>}
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onDelete(cat.categoryId)} className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
