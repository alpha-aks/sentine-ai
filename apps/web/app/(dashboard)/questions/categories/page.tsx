'use client';

import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { CategoryManager } from '@/components/questions/category-manager';
import { QuestionCategoryEntity } from '@/types/question';
import { questionService } from '@/services/question.service';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<QuestionCategoryEntity[]>([]);

  const fetchCategories = async () => {
    try {
      const items = await questionService.listCategories();
      setCategories(items);
    } catch {
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (name: string, description?: string) => {
    await questionService.createCategory(name, description);
    fetchCategories();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this category taxonomy?')) {
      await questionService.deleteCategory(id);
      fetchCategories();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader title="Category Taxonomy" description="Organize bank questions into hierarchical academic subject categories" />
      <CategoryManager categories={categories} onCreate={handleCreate} onDelete={handleDelete} />
    </div>
  );
}
