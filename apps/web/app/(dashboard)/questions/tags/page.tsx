'use client';

import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { TagManager } from '@/components/questions/tag-manager';
import { QuestionTagEntity } from '@/types/question';
import { questionService } from '@/services/question.service';

export default function TagsPage() {
  const [tags, setTags] = useState<QuestionTagEntity[]>([]);

  const fetchTags = async () => {
    try {
      const items = await questionService.listTags();
      setTags(items);
    } catch {
      setTags([]);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleCreate = async (name: string) => {
    await questionService.createTag(name);
    fetchTags();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this question tag?')) {
      await questionService.deleteTag(id);
      fetchTags();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader title="Question Tags Taxonomy" description="Create and manage search tags for indexing bank questions" />
      <TagManager tags={tags} onCreate={handleCreate} onDelete={handleDelete} />
    </div>
  );
}
