'use client';

import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { QuestionPoolEditor } from '@/components/questions/question-pool-editor';
import { QuestionPoolEntity } from '@/types/question';
import { questionService } from '@/services/question.service';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Layers, Trash2, CheckCircle2 } from 'lucide-react';

export default function QuestionPoolsPage() {
  const [pools, setPools] = useState<QuestionPoolEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPools = async () => {
    setIsLoading(true);
    try {
      const items = await questionService.listPools();
      setPools(items);
    } catch {
      setPools([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPools();
  }, []);

  const handleCreate = async (name: string, targetCount: number) => {
    await questionService.createPool(name, targetCount);
    fetchPools();
  };

  const handleDelete = async (poolId: string) => {
    if (confirm('Delete this question pool specification?')) {
      await questionService.deletePool(poolId);
      fetchPools();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader title="Question Pools & Randomization Rules" description="Configure dynamic random question selection pools for automated exam delivery" />

      <QuestionPoolEditor onSave={handleCreate} isLoading={isLoading} />

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Configured Question Pools</h3>
        {pools.length === 0 ? (
          <p className="text-sm text-muted-foreground italic py-4">No question pools configured.</p>
        ) : (
          pools.map((pool) => (
            <Card key={pool.poolId} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Layers className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <div className="font-semibold text-sm">{pool.name}</div>
                  <div className="text-xs text-muted-foreground">Draw Count: {pool.targetQuestionCount} questions | Strategy: {pool.strategy}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Validated
                </span>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(pool.poolId)} className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
