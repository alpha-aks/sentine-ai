'use client';

import React, { useState } from 'react';
import { QuestionTagEntity } from '@/types/question';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tag, Plus, X, Loader2 } from 'lucide-react';

interface TagManagerProps {
  tags: QuestionTagEntity[];
  onCreate: (name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function TagManager({ tags, onCreate, onDelete }: TagManagerProps) {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setIsSubmitting(true);
    try {
      await onCreate(name.toLowerCase().trim());
      setName('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary" /> Add New Question Tag
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex gap-3 max-w-md">
            <Input
              placeholder="Tag label (e.g. recursion, sorting)..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Add Tag
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        {tags.map((tg) => (
          <Badge key={tg.tagId} variant="outline" className="text-sm px-3 py-1 flex items-center gap-2 border-primary/30 text-primary">
            #{tg.name}
            <button type="button" onClick={() => onDelete(tg.tagId)} className="hover:text-destructive">
              <X className="h-3.5 w-3.5" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
}
